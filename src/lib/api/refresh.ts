import { API_BASE } from "../../config";
import { parseTokenPair, readFromStorage, setTokens } from "./tokens";

/** The refresh already running in this tab, so simultaneous callers share it. */
let inFlight: Promise<boolean> | null = null;

/**
 * Gets a new access token after a 401. Resolves true if the caller should retry.
 *
 * The backend rotates refresh tokens: each one works once. So two refreshes at
 * the same time would log the person out. Two guards prevent that:
 *   - inside this tab, simultaneous callers share one request;
 *   - across tabs, a browser lock makes the refreshes take turns, and the
 *     second tab notices the first one already saved fresh tokens.
 */
export function refreshTokens(failedAccess: string): Promise<boolean> {
  if (!inFlight) {
    inFlight = withLock(() => refreshOnce(failedAccess)).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

/**
 * Runs `task` while holding a browser-wide lock, so only one tab refreshes at a
 * time. Browsers without the Locks API just run the task straight away.
 */
async function withLock(task: () => Promise<boolean>): Promise<boolean> {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  if (!locks) return task();
  return await locks.request("trending-archive-token-refresh", task);
}

/**
 * Does one refresh: reuses tokens another tab already saved, or asks the
 * server for new ones. Resolves true when valid tokens are now stored.
 */
async function refreshOnce(failedAccess: string): Promise<boolean> {
  const current = readFromStorage();

  if (!current) {
    setTokens(null); // signed out in another tab
    return false;
  }
  if (current.access !== failedAccess) {
    setTokens(current); // another tab already refreshed: use its tokens
    return true;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/auth/refresh/`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: current.refresh }),
    });
  } catch {
    return false; // offline: keep the tokens and try again later
  }

  if (response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return false;
    }
    const tokens =
      typeof body === "object" && body !== null && "tokens" in body
        ? parseTokenPair(body.tokens)
        : null;
    if (!tokens) return false;
    setTokens(tokens);
    return true;
  }

  // The refresh token itself is no good: the session is over.
  if (response.status === 400 || response.status === 401) setTokens(null);
  // Anything else (429, 5xx) is temporary: keep the tokens.
  return false;
}
