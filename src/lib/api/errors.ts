/** Messages the API sent, keyed by field name: { email: ["This field is required."] } */
export type FieldErrors = Record<string, string[]>;

const NETWORK_MESSAGE = "Cannot reach the server. Check your connection and try again.";
const SERVER_MESSAGE = "Something went wrong on our side. Please try again in a moment.";
const RATE_LIMIT_MESSAGE = "Too many attempts. Please wait a moment and try again.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Flattens strings, lists and nested objects into a list of strings. */
function toStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(toStrings);
  if (isRecord(value)) return Object.values(value).flatMap(toStrings);
  return [];
}

/**
 * Every error answer from the API has the shape
 *   { success: false, message: "...", errors: <field messages or null> }
 * This class carries that shape, plus the HTTP status and, for 429, the wait.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errors: unknown;
  /** Seconds to wait before trying again (only for 429), or null if unknown. */
  readonly retryAfter: number | null;

  constructor(
    message: string,
    status: number,
    errors: unknown = null,
    retryAfter: number | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.retryAfter = retryAfter;
  }

  /** The request never reached the server (offline, wrong address, CORS). */
  static network(): ApiError {
    return new ApiError(NETWORK_MESSAGE, 0);
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // The body was not JSON (for example an HTML error page).
    }
    return ApiError.fromBody(response.status, body, response.headers.get("Retry-After"));
  }

  static fromBody(status: number, body: unknown, retryAfterHeader: string | null = null): ApiError {
    const payload = isRecord(body) ? body : {};
    const text =
      typeof payload.message === "string"
        ? payload.message
        : typeof payload.detail === "string"
          ? payload.detail
          : "";

    if (status === 429) {
      return new ApiError(
        RATE_LIMIT_MESSAGE,
        status,
        payload.errors ?? null,
        ApiError.parseWait(retryAfterHeader, text),
      );
    }
    if (status >= 500) return new ApiError(SERVER_MESSAGE, status);

    return new ApiError(text || `Request failed (${status}).`, status, payload.errors ?? null);
  }

  /**
   * The wait comes from the Retry-After header. Browsers hide that header from
   * pages on another origin unless the server exposes it, so fall back to the
   * sentence DRF writes: "Expected available in 42 seconds."
   */
  private static parseWait(header: string | null, text: string): number | null {
    const fromHeader = Number.parseInt(header ?? "", 10);
    if (Number.isFinite(fromHeader) && fromHeader > 0) return fromHeader;
    const match = /available in (\d+) second/i.exec(text);
    return match ? Number.parseInt(match[1], 10) : null;
  }

  get fieldErrors(): FieldErrors {
    if (!isRecord(this.errors)) return {};
    const result: FieldErrors = {};
    for (const [field, value] of Object.entries(this.errors)) {
      const messages = toStrings(value);
      if (messages.length > 0) result[field] = messages;
    }
    return result;
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

/** A message that is safe to show a person, for any thrown value. */
export function errorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  return error instanceof ApiError ? error.message : fallback;
}

/** Turns anything thrown into an ApiError, so forms only deal with one type. */
export function toApiError(error: unknown): ApiError {
  return error instanceof ApiError ? error : new ApiError(errorMessage(error), 0);
}
