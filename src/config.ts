const raw = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/** Backend address without a trailing slash, for example http://localhost:8000 */
export const API_ROOT = raw.replace(/\/+$/, "");

/** Every API call goes under this prefix. */
export const API_BASE = `${API_ROOT}/api/v1`;
