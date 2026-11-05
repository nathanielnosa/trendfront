import type { ReactNode } from "react";
import { Button } from "./ui";
import "./StateMessage.css";

/** Shown when a list or section could not be loaded. Offers a retry button. */
export function ErrorNotice({
  message = "We could not load this right now.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state-message" role="alert">
      <p className="state-message__title">Something went wrong</p>
      <p className="state-message__text">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Shown when a list loaded fine but has nothing in it. Can hold a button or link. */
export function EmptyNotice({
  title = "Nothing here yet",
  text,
  children,
}: {
  title?: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <div className="state-message">
      <p className="state-message__title">{title}</p>
      {text && <p className="state-message__text">{text}</p>}
      {children}
    </div>
  );
}
