import type { ReactNode } from "react";
import { ErrorScreen } from "../components/ErrorScreen";
import { useAuth } from "./useAuth";

/** Holds the site back until we know whether the visitor is logged in. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { status, error, retry } = useAuth();

  if (status === "loading") {
    return (
      <div className="splash" role="status" aria-live="polite">
        Loading…
      </div>
    );
  }

  if (status === "error") {
    return (
      <ErrorScreen
        title="We could not reach the server"
        message={error ?? undefined}
        actionLabel="Try again"
        onAction={retry}
      />
    );
  }

  return <>{children}</>;
}
