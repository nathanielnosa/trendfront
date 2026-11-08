import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FormAlert } from "../components/FormErrors";
import { RetryNotice } from "../components/RetryNotice";
import { Button, Card, TextField } from "../components/ui";
import { authApi } from "../lib/api/auth";
import { toApiError, type ApiError } from "../lib/api/errors";

/** Asks for an email address and sends a reset link to it. */
export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  // Counts failed tries, so each rate-limit notice restarts its countdown.
  const [attempt, setAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  // The address we sent to; when set, the page shows the "check your email" message.
  const [sentTo, setSentTo] = useState<string | null>(null);

  /** Ask the API to email the link, then switch to the confirmation message. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const address = email.trim().toLowerCase();
    try {
      await authApi.forgotPassword(address);
      setSentTo(address);
    } catch (caught) {
      setError(toApiError(caught));
      setAttempt((count) => count + 1);
    } finally {
      setSubmitting(false);
    }
  }

  if (sentTo) {
    return (
      <section className="narrow">
        <Card className="panel">
          <h1>Check your email</h1>
          <p className="muted" style={{ margin: "0.5rem 0 1.5rem" }}>
            If an account exists for <strong>{sentTo}</strong>, a reset link is on its way. The link
            works for a short time, and only once.
          </p>
          <div className="screen-actions">
            <Button variant="secondary" onClick={() => setSentTo(null)}>
              Use another email
            </Button>
            <Link to="/login">Back to log in</Link>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="narrow">
      <Card className="panel">
        <h1>Forgot your password?</h1>
        <p className="muted" style={{ margin: "0.5rem 0 1.5rem" }}>
          Enter your email and we will send you a link to choose a new one.
        </p>

        <form onSubmit={handleSubmit} className="form" noValidate>
          <FormAlert error={error} />
          {error?.isRateLimited && <RetryNotice key={attempt} seconds={error.retryAfter} />}

          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={error}
            required
          />

          <Button type="submit" size="lg" fullWidth loading={submitting}>
            {submitting ? "Sending" : "Send reset link"}
          </Button>
        </form>

        <p className="muted" style={{ margin: "1.5rem 0 0", fontSize: "var(--text-sm)" }}>
          Remembered it? <Link to="/login">Log in</Link>
        </p>
      </Card>
    </section>
  );
}
