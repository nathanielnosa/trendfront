import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { FormAlert } from "../components/FormErrors";
import { Button, Card, TextField } from "../components/ui";
import { authApi } from "../lib/api/auth";
import { toApiError, type ApiError } from "../lib/api/errors";

/** Seconds a person must wait between "send again" clicks. */
const COOLDOWN = 60;

/** Where Register sends people: tells them to open the email, with a resend button. */
export function CheckEmail() {
  const location = useLocation();
  const state = (location.state ?? {}) as { email?: string; emailSent?: boolean };

  const [email, setEmail] = useState(state.email ?? "");
  const [error, setError] = useState<ApiError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  // If the email already failed at sign-up, let them resend straight away.
  const [wait, setWait] = useState(state.emailSent === false ? 0 : COOLDOWN);

  // Count the wait down once a second.
  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  /** Ask the API for another verification email. */
  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(null);
    setNotice(null);
    try {
      const result = await authApi.resendVerification(email.trim().toLowerCase());
      setNotice(result.message);
      setWait(COOLDOWN);
    } catch (caught) {
      setError(toApiError(caught));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="narrow">
      <Card className="panel">
        <h1>Check your email</h1>
        {state.emailSent === false ? (
          <p className="muted" style={{ margin: "0.5rem 0 1.5rem" }}>
            Your account is ready, but we could not send the verification email. Press the button
            below to try again.
          </p>
        ) : (
          <p className="muted" style={{ margin: "0.5rem 0 1.5rem" }}>
            {state.email ? (
              <>
                We sent a verification link to <strong>{state.email}</strong>.
              </>
            ) : (
              "Enter your email and we will send a new verification link."
            )}{" "}
            Open it to activate your account. The link works for one hour.
          </p>
        )}

        <form onSubmit={resend} className="form" noValidate>
          <FormAlert error={error} />
          {notice && (
            <p role="status" style={{ color: "var(--color-success, var(--color-primary))", fontSize: "var(--text-sm)" }}>
              {notice}
            </p>
          )}
          {!state.email && (
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
          )}
          <Button type="submit" variant="secondary" fullWidth loading={sending} disabled={wait > 0 || !email}>
            {wait > 0 ? `Send again in ${wait}s` : "Send the email again"}
          </Button>
        </form>

        <p className="muted" style={{ margin: "1.5rem 0 0", fontSize: "var(--text-sm)" }}>
          Already verified? <Link to="/login">Log in</Link>
        </p>
      </Card>
    </section>
  );
}
