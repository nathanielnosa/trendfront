// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE } from "../../config";
import { api } from "./client";
import { ApiError } from "./errors";
import { STORAGE_KEY, getTokens, setTokens } from "./tokens";

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function bearer(init?: RequestInit): string | undefined {
  return (init?.headers as Record<string, string> | undefined)?.Authorization;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  window.localStorage.clear();
  setTokens(null);
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

describe("building requests", () => {
  it("sends JSON and the login token", async () => {
    setTokens({ access: "a1", refresh: "r1" });
    fetchMock.mockResolvedValueOnce(json({ ok: true }));

    await api.post("/things/", { a: 1 });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE}/things/`);
    expect(init.method).toBe("POST");
    expect(init.body).toBe('{"a":1}');
    expect(bearer(init)).toBe("Bearer a1");
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("leaves the token off when auth is false", async () => {
    setTokens({ access: "a1", refresh: "r1" });
    fetchMock.mockResolvedValueOnce(json({ ok: true }));

    await api.post("/auth/login/", {}, { auth: false });

    expect(bearer(fetchMock.mock.calls[0][1])).toBeUndefined();
  });

  it("adds query values and skips empty ones", async () => {
    fetchMock.mockResolvedValueOnce(json({}));

    await api.get("/blog/posts/", { page: 2, search: "", tag: undefined, featured: true });

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_BASE}/blog/posts/?page=2&featured=true`);
  });

  it("uses a full address as it is (for pagination links)", async () => {
    fetchMock.mockResolvedValueOnce(json({}));

    await api.get("http://localhost:8000/api/v1/blog/posts/?page=3");

    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8000/api/v1/blog/posts/?page=3");
  });

  it("sends FormData without a JSON header", async () => {
    fetchMock.mockResolvedValueOnce(json({}));
    const form = new FormData();
    form.set("file", "x");

    await api.post("/media/", form);

    const init = fetchMock.mock.calls[0][1];
    expect(init.body).toBe(form);
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("returns undefined for 204", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    expect(await api.delete("/media/1/")).toBeUndefined();
  });
});

describe("errors", () => {
  it("throws the API's error shape", async () => {
    fetchMock.mockResolvedValueOnce(
      json(
        { success: false, message: "Validation failed.", errors: { email: ["Required."] } },
        400,
      ),
    );

    const error = await api.post("/auth/register/", {}, { auth: false }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(400);
    expect((error as ApiError).fieldErrors).toEqual({ email: ["Required."] });
  });

  it("reads Retry-After on 429", async () => {
    fetchMock.mockResolvedValueOnce(
      json({ message: "Request was throttled." }, 429, { "Retry-After": "30" }),
    );

    const error = await api.post("/auth/login/", {}, { auth: false }).catch((e: unknown) => e);

    expect((error as ApiError).isRateLimited).toBe(true);
    expect((error as ApiError).retryAfter).toBe(30);
  });

  it("reports a network failure", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const error = await api.get("/blog/posts/").catch((e: unknown) => e);

    expect((error as ApiError).isNetwork).toBe(true);
  });
});

describe("refreshing the login", () => {
  it("refreshes after a 401 and retries once", async () => {
    setTokens({ access: "a1", refresh: "r1" });
    fetchMock
      .mockResolvedValueOnce(json({ message: "expired" }, 401))
      .mockResolvedValueOnce(json({ tokens: { access: "a2", refresh: "r2" } }))
      .mockResolvedValueOnce(json({ id: 7 }));

    const result = await api.get<{ id: number }>("/auth/me/");

    expect(result).toEqual({ id: 7 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe(`${API_BASE}/auth/refresh/`);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ refresh: "r1" });
    expect(bearer(fetchMock.mock.calls[2][1])).toBe("Bearer a2");
    expect(getTokens()).toEqual({ access: "a2", refresh: "r2" });
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) as string)).toEqual({
      access: "a2",
      refresh: "r2",
    });
  });

  it("refreshes once for several requests that fail together", async () => {
    setTokens({ access: "a1", refresh: "r1" });
    let refreshCalls = 0;
    fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
      if (url.endsWith("/auth/refresh/")) {
        refreshCalls += 1;
        return json({ tokens: { access: "a2", refresh: "r2" } });
      }
      return bearer(init) === "Bearer a2" ? json({ ok: true }) : json({ message: "expired" }, 401);
    });

    const results = await Promise.all([api.get("/a/"), api.get("/b/"), api.get("/c/")]);

    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(refreshCalls).toBe(1);
  });

  it("logs out when the refresh token is rejected", async () => {
    setTokens({ access: "a1", refresh: "r1" });
    fetchMock
      .mockResolvedValueOnce(json({ message: "expired" }, 401))
      .mockResolvedValueOnce(json({ message: "Invalid or expired refresh token." }, 401));

    const error = await api.get("/auth/me/").catch((e: unknown) => e);

    expect((error as ApiError).status).toBe(401);
    expect(getTokens()).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("keeps the login when the refresh fails for a temporary reason", async () => {
    setTokens({ access: "a1", refresh: "r1" });
    fetchMock
      .mockResolvedValueOnce(json({ message: "expired" }, 401))
      .mockRejectedValueOnce(new TypeError("offline"));

    await api.get("/auth/me/").catch(() => undefined);

    expect(getTokens()).toEqual({ access: "a1", refresh: "r1" });
  });

  it("keeps the login when the refresh is rate limited", async () => {
    setTokens({ access: "a1", refresh: "r1" });
    fetchMock
      .mockResolvedValueOnce(json({ message: "expired" }, 401))
      .mockResolvedValueOnce(json({ message: "slow down" }, 429));

    await api.get("/auth/me/").catch(() => undefined);

    expect(getTokens()).toEqual({ access: "a1", refresh: "r1" });
  });

  it("does not try to refresh when nobody is logged in", async () => {
    fetchMock.mockResolvedValueOnce(json({ message: "no" }, 401));

    await api.get("/auth/me/").catch(() => undefined);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not refresh for calls made with auth: false", async () => {
    setTokens({ access: "a1", refresh: "r1" });
    fetchMock.mockResolvedValueOnce(json({ message: "Invalid email or password." }, 401));

    await api.post("/auth/login/", {}, { auth: false }).catch(() => undefined);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("re-reads a body function on the retry, so logout sends the new refresh token", async () => {
    setTokens({ access: "a1", refresh: "r1" });
    fetchMock
      .mockResolvedValueOnce(json({ message: "expired" }, 401))
      .mockResolvedValueOnce(json({ tokens: { access: "a2", refresh: "r2" } }))
      .mockResolvedValueOnce(json({ message: "Logged out." }));

    await api.post("/auth/logout/", () => ({ refresh: getTokens()?.refresh }));

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ refresh: "r1" });
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({ refresh: "r2" });
  });

  it("uses tokens another tab already refreshed, without asking the server", async () => {
    setTokens({ access: "a1", refresh: "r1" });
    // Another tab refreshed and saved new tokens; this tab has not heard yet.
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ access: "a9", refresh: "r9" }));
    fetchMock
      .mockResolvedValueOnce(json({ message: "expired" }, 401))
      .mockResolvedValueOnce(json({ ok: true }));

    await api.get("/auth/me/");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(bearer(fetchMock.mock.calls[1][1])).toBe("Bearer a9");
    expect(getTokens()).toEqual({ access: "a9", refresh: "r9" });
  });
});
