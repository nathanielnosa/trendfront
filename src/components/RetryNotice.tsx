import { useEffect, useState } from "react";

/**
 * "Too many attempts. Try again in N seconds." with a live countdown.
 * Give it a new `key` for each new 429, so the countdown starts over.
 */
export function RetryNotice({ seconds }: { seconds: number | null }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (seconds === null) return;
    const timer = window.setInterval(() => setElapsed((count) => count + 1), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  if (seconds === null) {
    return (
      <p role="status" className="form-alert">
        Too many attempts. Please wait a moment and try again.
      </p>
    );
  }

  const left = Math.max(0, seconds - elapsed);
  return (
    <p role="status" className="form-alert">
      {left > 0
        ? `Too many attempts. Try again in ${left} second${left === 1 ? "" : "s"}.`
        : "You can try again now."}
    </p>
  );
}
