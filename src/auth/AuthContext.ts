import { createContext } from "react";
import type { User } from "../lib/api/types";

/**
 * loading        checking a saved login when the page opens
 * authenticated  logged in
 * anonymous      logged out
 * error          could not check (server unreachable); retry() tries again
 */
export type AuthStatus = "loading" | "authenticated" | "anonymous" | "error";

export interface AuthValue {
  status: AuthStatus;
  user: User | null;
  /** A message to show when status is "error". */
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Fetch the profile again, for example after the person edits it. */
  refreshUser: () => Promise<void>;
  retry: () => void;
}

export const AuthContext = createContext<AuthValue | null>(null);
