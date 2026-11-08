import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FormAlert } from "../components/FormErrors";
import { RetryNotice } from "../components/RetryNotice";
import { Button, ButtonLink, Card, TextField } from "../components/ui";
import { authApi } from "../lib/api/auth";
import { toApiError, type ApiError } from "../lib/api/errors";

/** Where the link in the reset email lands (/reset-password?token=...). */
export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  // Counts failed tries, so each rate-limit notice restarts its countdown.
  const [attempt, setAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  /** Send the token and the new password; on success show the "done" message. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await authApi.resetPassword({
        token,
        new_password: password,
        new_password_confirmation: confirmation,
      });
      setDone(true);
    } catch (caught) {
      setError(toApiError(caught));
      setAttempt((count) => count + 1);
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <section className="narrow">
        <Card className="panel">
          <h1>This link is not valid</h1>
          <p className="muted" style={{ margin: "0.5rem 0 1.5rem" }}>
            The reset link is missing its token. Ask for a new one.
          </p>
          <ButtonLink to="/forgot-password" size="lg">
            Get a new link
          </ButtonLink>
        </Card>
      </section>
    );
  }

  if (done) {
    return (
      <section className="narrow">
        <Card className="panel">
          <h1>Password changed</h1>
          <p className="muted" style={{ margin: "0.5rem 0 1.5rem" }}>
            You can now log in with your new password.
          </p>
          <ButtonLink to="/login" size="lg" fullWidth>
            Log in
          </ButtonLink>
        </Card>
      </section>
    );
  }

  // A used or expired token comes back as a general message with no field errors.
  const tokenProblem = error && !error.isRateLimited && Object.keys(error.fieldErrors).length === 0;

  return (
    <section className="narrow">
      <Card className="panel">
        <h1>Choose a new password</h1>
        <p className="muted" style={{ margin: "0.5rem 0 1.5rem" }}>
          Use at least 8 characters, and avoid common passwords.
        </p>

        <form onSubmit={handleSubmit} className="form" noValidate>
          <FormAlert error={error} />
          {error?.isRateLimited && <RetryNotice key={attempt} seconds={error.retryAfter} />}

          <TextField
            label="New password"
            name="new_password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={error}
            required
          />
          <TextField
            label="Confirm new password"
            name="new_password_confirmation"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            error={error}
            required
          />

          <Button type="submit" size="lg" fullWidth loading={submitting}>
            {submitting ? "Saving" : "Change password"}
          </Button>
        </form>

        <p className="muted" style={{ margin: "1.5rem 0 0", fontSize: "var(--text-sm)" }}>
          {tokenProblem ? (
            <Link to="/forgot-password">Get a new reset link</Link>
          ) : (
            <Link to="/login">Back to log in</Link>
          )}
        </p>
      </Card>
    </section>
  );
}
