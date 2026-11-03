import { Button, buttonClass } from "./ui";

interface ErrorScreenProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * A full-page message for problems we cannot recover from on the spot.
 * It can show outside the router, so the way home is a plain link.
 */
export function ErrorScreen({
  title = "Something went wrong",
  message = "An unexpected problem stopped this page from loading.",
  actionLabel = "Try again",
  onAction,
}: ErrorScreenProps) {
  return (
    <main className="screen" role="alert">
      <h1>{title}</h1>
      <p className="muted">{message}</p>
      <div className="screen-actions">
        {onAction && <Button onClick={onAction}>{actionLabel}</Button>}
        <a href="/" className={buttonClass("secondary")}>
          Back to the home page
        </a>
      </div>
    </main>
  );
}
