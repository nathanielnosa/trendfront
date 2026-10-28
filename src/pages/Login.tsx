import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { FieldError, FormAlert } from "../components/FormErrors";
import { RetryNotice } from "../components/RetryNotice";
import { toApiError, type ApiError } from "../lib/api/errors";

// A working but plain login, so you can test the API client end to end.
// Phase 4 replaces it with the designed page. After a successful login,
// <GuestOnly> sends the person back to the page they came from.
export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (caught) {
      setError(toApiError(caught));
      setAttempt((count) => count + 1);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="narrow">
      <h1>Log in</h1>

      <form onSubmit={handleSubmit} className="form" noValidate>
        <FormAlert error={error} />
        {error?.isRateLimited && <RetryNotice key={attempt} seconds={error.retryAfter} />}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(error?.fieldErrors.email)}
            aria-describedby="email-error"
            required
          />
          <FieldError error={error} name="email" />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(error?.fieldErrors.password)}
            aria-describedby="password-error"
            required
          />
          <FieldError error={error} name="password" />
        </div>

        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="muted">
        <Link to="/forgot-password">Forgot your password?</Link> ·{" "}
        <Link to="/register">Create an account</Link>
      </p>
    </section>
  );
}
