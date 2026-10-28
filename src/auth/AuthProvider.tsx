import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../lib/api/auth";
import { ApiError, errorMessage } from "../lib/api/errors";
import { getTokens, setTokens, subscribeToTokens } from "../lib/api/tokens";
import type { User } from "../lib/api/types";
import { AuthContext, type AuthStatus, type AuthValue } from "./AuthContext";

interface State {
  status: AuthStatus;
  user: User | null;
  error: string | null;
}

const SIGNED_OUT: State = { status: "anonymous", user: null, error: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() =>
    getTokens() ? { status: "loading", user: null, error: null } : SIGNED_OUT,
  );
  const [attempt, setAttempt] = useState(0);

  // When the page opens (or after a retry), turn saved tokens into a user.
  useEffect(() => {
    if (!getTokens()) return;
    let cancelled = false;

    authApi.me().then(
      (user) => {
        if (!cancelled) setState({ status: "authenticated", user, error: null });
      },
      (error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.isUnauthorized) setState(SIGNED_OUT);
        else setState({ status: "error", user: null, error: errorMessage(error) });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // The tokens were removed (logged out in another tab, or the session expired).
  useEffect(
    () =>
      subscribeToTokens(() => {
        if (!getTokens()) setState(SIGNED_OUT);
      }),
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    const { tokens } = await authApi.login(email, password);
    setTokens(tokens);
    try {
      const user = await authApi.me();
      setState({ status: "authenticated", user, error: null });
    } catch (error) {
      setTokens(null);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getTokens()) await authApi.logout();
    } catch {
      // Whatever the server says, this browser forgets the session.
    } finally {
      setTokens(null);
      setState(SIGNED_OUT);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const user = await authApi.me();
    setState({ status: "authenticated", user, error: null });
  }, []);

  const retry = useCallback(() => {
    setState({ status: "loading", user: null, error: null });
    setAttempt((count) => count + 1);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ ...state, login, logout, refreshUser, retry }),
    [state, login, logout, refreshUser, retry],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
