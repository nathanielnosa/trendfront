import { API_BASE } from "../../config";
import { ApiError } from "./errors";
import { refreshTokens } from "./refresh";
import { getTokens } from "./tokens";

export type Query = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  method?: string;
  /**
   * A value to send as JSON, a FormData for uploads, or a function that returns
   * either. A function runs again on a retry, so it can read fresh tokens.
   */
  body?: unknown;
  query?: Query;
  /**
   * Send the login token (default true). Turn it off for login, register,
   * forgot password and refresh: the API answers 401 to any request that
   * carries an expired token, even on public endpoints.
   */
  auth?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Query): string {
  const base = /^https?:\/\//.test(path) ? path : `${API_BASE}${path}`;
  if (!query) return base;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const text = params.toString();
  if (!text) return base;
  return `${base}${base.includes("?") ? "&" : "?"}${text}`;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, auth = true, signal } = options;
  const url = buildUrl(path, query);

  const send = async (): Promise<Response> => {
    const headers: Record<string, string> = { Accept: "application/json" };

    const tokens = auth ? getTokens() : null;
    if (tokens) headers.Authorization = `Bearer ${tokens.access}`;

    const resolved = typeof body === "function" ? (body as () => unknown)() : body;
    let payload: BodyInit | undefined;
    if (resolved instanceof FormData) {
      payload = resolved; // the browser sets the multipart header itself
    } else if (resolved !== undefined) {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(resolved);
    }

    try {
      return await fetch(url, { method, headers, body: payload, signal });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      throw ApiError.network();
    }
  };

  let response = await send();

  if (response.status === 401 && auth) {
    const tokens = getTokens();
    if (tokens && (await refreshTokens(tokens.access))) {
      response = await send();
    }
  }

  if (!response.ok) throw await ApiError.fromResponse(response);

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError("The server sent an unreadable answer.", response.status);
  }
}

export const api = {
  get: <T>(path: string, query?: Query, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET", query }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T = void>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
