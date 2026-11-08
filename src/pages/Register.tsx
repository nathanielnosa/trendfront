import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormAlert } from "../components/FormErrors";
import { RetryNotice } from "../components/RetryNotice";
import { Button, Card, TextField } from "../components/ui";
import { authApi } from "../lib/api/auth";
import { toApiError, type ApiError } from "../lib/api/errors";

/** Sign-up page. On success it moves on to the "check your email" screen. */
export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState<ApiError | null>(null);
  // Counts failed tries, so each rate-limit notice restarts its countdown.
  const [attempt, setAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  /** Returns an onChange handler that updates one field of the form. */
  const bind = (name: keyof typeof form) => ({
    name,
    value: form[name],
    error,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((previous) => ({ ...previous, [name]: event.target.value })),
  });

  /** Send the form to the API; on success go to the check-email screen. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await authApi.register({
        ...form,
        email: form.email.trim().toLowerCase(),
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      });
      navigate("/check-email", {
        replace: true,
        state: { email: result.user.email, emailSent: result.email_sent !== false },
      });
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
        <h1>Create your account</h1>
        <p className="muted" style={{ margin: "0.5rem 0 1.5rem" }}>
          Join to bookmark stories, like and comment.
        </p>

        <form onSubmit={handleSubmit} className="form" noValidate>
          <FormAlert error={error} />
          {error?.isRateLimited && <RetryNotice key={attempt} seconds={error.retryAfter} />}

          <TextField label="First name" autoComplete="given-name" required {...bind("first_name")} />
          <TextField label="Last name" autoComplete="family-name" required {...bind("last_name")} />
          <TextField label="Username" autoComplete="username" required {...bind("username")} />
          <TextField label="Email" type="email" autoComplete="email" required {...bind("email")} />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            {...bind("password")}
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required
            {...bind("password_confirmation")}
          />

          <Button type="submit" size="lg" fullWidth loading={submitting}>
            {submitting ? "Creating account" : "Create account"}
          </Button>
        </form>

        <p className="muted" style={{ margin: "1.5rem 0 0", fontSize: "var(--text-sm)" }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </Card>
    </section>
  );
}
