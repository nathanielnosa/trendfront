import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "../lib/api/types";
import { Forbidden } from "../pages/Forbidden";
import { useAuth } from "./useAuth";

/** Where to send a person after they log in. */
export interface RedirectState {
  from?: { pathname: string; search: string; hash: string };
}

/** Logged-in people only. Others go to the login page and come back afterwards. */
export function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const from = { pathname: location.pathname, search: location.search, hash: location.hash };
    return <Navigate to="/login" replace state={{ from } satisfies RedirectState} />;
  }
  return <Outlet />;
}

/** Logged-in people with one of the given roles. Others see a "not allowed" page. */
export function RequireRole({ roles }: { roles: readonly Role[] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const from = { pathname: location.pathname, search: location.search, hash: location.hash };
    return <Navigate to="/login" replace state={{ from } satisfies RedirectState} />;
  }
  if (!roles.includes(user.role)) return <Forbidden />;
  return <Outlet />;
}

/** Login, register and similar: logged-in people are sent away. */
export function GuestOnly() {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    const from = (location.state as RedirectState | null)?.from;
    const target = from ? `${from.pathname}${from.search}${from.hash}` : "/";
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
