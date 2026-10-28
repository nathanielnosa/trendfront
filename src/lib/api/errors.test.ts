import { describe, expect, it } from "vitest";
import { ApiError, errorMessage, toApiError } from "./errors";

describe("ApiError.fromBody", () => {
  it("reads the standard error shape", () => {
    const error = ApiError.fromBody(400, {
      success: false,
      message: "Validation failed.",
      errors: { email: ["This field is required."], password: ["Too short."] },
    });
    expect(error.status).toBe(400);
    expect(error.message).toBe("Validation failed.");
    expect(error.fieldErrors).toEqual({
      email: ["This field is required."],
      password: ["Too short."],
    });
  });

  it("has no field errors when errors is null", () => {
    const error = ApiError.fromBody(401, {
      success: false,
      message: "Invalid email or password.",
      errors: null,
    });
    expect(error.message).toBe("Invalid email or password.");
    expect(error.fieldErrors).toEqual({});
    expect(error.isUnauthorized).toBe(true);
  });

  it("turns a single string into a list", () => {
    const error = ApiError.fromBody(400, {
      message: "Validation failed.",
      errors: { scheduled_at: "Must be in the future." },
    });
    expect(error.fieldErrors).toEqual({ scheduled_at: ["Must be in the future."] });
  });

  it("flattens nested messages", () => {
    const error = ApiError.fromBody(400, {
      message: "Validation failed.",
      errors: { tags: [{ name: ["Required."] }] },
    });
    expect(error.fieldErrors).toEqual({ tags: ["Required."] });
  });

  it("falls back to DRF's detail key", () => {
    expect(ApiError.fromBody(404, { detail: "Not found." }).message).toBe("Not found.");
  });

  it("uses a generic message for server errors", () => {
    const error = ApiError.fromBody(500, "<html>Traceback</html>");
    expect(error.message).toContain("Something went wrong");
    expect(error.message).not.toContain("Traceback");
  });

  it("uses the status when there is no message", () => {
    expect(ApiError.fromBody(418, null).message).toBe("Request failed (418).");
  });

  it("reads the wait from the Retry-After header", () => {
    const error = ApiError.fromBody(429, { message: "Request was throttled." }, "42");
    expect(error.isRateLimited).toBe(true);
    expect(error.retryAfter).toBe(42);
  });

  it("reads the wait from the message when the header is hidden", () => {
    const error = ApiError.fromBody(429, {
      message: "Request was throttled. Expected available in 17 seconds.",
    });
    expect(error.retryAfter).toBe(17);
  });

  it("has no wait when nothing says how long", () => {
    expect(ApiError.fromBody(429, { message: "Slow down." }).retryAfter).toBeNull();
  });
});

describe("helpers", () => {
  it("describes a network failure", () => {
    const error = ApiError.network();
    expect(error.isNetwork).toBe(true);
    expect(error.status).toBe(0);
  });

  it("only shows messages that are safe for people", () => {
    expect(errorMessage(ApiError.fromBody(400, { message: "Bad." }))).toBe("Bad.");
    expect(errorMessage(new TypeError("x is undefined"))).toBe(
      "Something went wrong. Please try again.",
    );
  });

  it("wraps unknown errors", () => {
    expect(toApiError(new Error("boom"))).toBeInstanceOf(ApiError);
  });
});
