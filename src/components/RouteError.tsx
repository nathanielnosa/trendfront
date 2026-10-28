import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { NotFound } from "../pages/NotFound";
import { ErrorScreen } from "./ErrorScreen";

/** Shown by the router when a page crashes while loading or rendering. */
export function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;

  console.error("Route error", error);
  return <ErrorScreen actionLabel="Reload the page" onAction={() => window.location.reload()} />;
}
