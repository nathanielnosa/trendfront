interface ErrorScreenProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** A full-page message for problems we cannot recover from on the spot. */
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
      <p>
        {onAction && (
          <button type="button" className="button" onClick={onAction}>
            {actionLabel}
          </button>
        )}{" "}
        <a href="/">Back to the home page</a>
      </p>
    </main>
  );
}
