import type { TokenPair } from "./types";

export const STORAGE_KEY = "trending-archive.tokens";

/** undefined = not read yet, null = signed out. */
let cache: TokenPair | null | undefined;
const listeners = new Set<() => void>();

export function parseTokenPair(value: unknown): TokenPair | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "access" in value &&
    "refresh" in value &&
    typeof value.access === "string" &&
    typeof value.refresh === "string"
  ) {
    return { access: value.access, refresh: value.refresh };
  }
  return null;
}

/** Reads the saved tokens straight from the browser, ignoring the in-memory copy. */
export function readFromStorage(): TokenPair | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? parseTokenPair(JSON.parse(raw)) : null;
  } catch {
    // Storage blocked or the value is damaged: fall back to what we hold in memory.
    return cache ?? null;
  }
}

export function getTokens(): TokenPair | null {
  if (cache === undefined) cache = readFromStorage();
  return cache;
}

export function setTokens(tokens: TokenPair | null): void {
  cache = tokens;
  try {
    if (tokens) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode: the tokens still work until the tab closes.
  }
  listeners.forEach((listener) => listener());
}

/** Calls `listener` whenever the tokens change, here or in another tab. */
export function subscribeToTokens(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Another tab logged in, out, or refreshed: forget our copy and tell listeners.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      cache = undefined;
      listeners.forEach((listener) => listener());
    }
  });
}
