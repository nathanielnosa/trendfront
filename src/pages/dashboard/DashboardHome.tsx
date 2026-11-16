import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { homeFor } from "../../components/dashboard/nav";

/** The /dashboard address: sends each person to the first page that matters for their role. */
export function DashboardHome() {
  const { user } = useAuth();
  return <Navigate to={user ? homeFor(user) : "/login"} replace />;
}
