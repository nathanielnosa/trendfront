import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { FormAlert } from "../components/FormErrors";
import { RetryNotice } from "../components/RetryNotice";
import { Button, Card, TextField } from "../components/ui";
import { toApiError, type ApiError } from "../lib/api/errors";

/**
 * Log in page. After a successful login, <GuestOnly> sends the person back to
 * the page they came from. Phase 4 adds the rest of the account pages.
 */
export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  // Counts failed tries, so each rate-limit notice restarts its countdown.
  const [attempt, setAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  /** Send the email and password to the API and show any problem. */
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
      <Card className="panel">
        <h1>Welcome back</h1>
        <p className="muted" style={{ margin: "0.5rem 0 1.5rem" }}>
          Log in to bookmark posts and join the conversation.
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

          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={error}
            required
          />

          <Button type="submit" size="lg" fullWidth loading={submitting}>
            {submitting ? "Logging in" : "Log in"}
          </Button>
        </form>

        <p className="muted " style={{ margin: "1.5rem 0 0", fontSize: "var(--text-sm)" }}>
          <Link to="/forgot-password">Forgot your password?</Link> ·{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </Card>
    </section>
  );
}
