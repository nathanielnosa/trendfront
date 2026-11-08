import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ButtonLink, Card } from "../components/ui";
import { authApi } from "../lib/api/auth";
import { errorMessage } from "../lib/api/errors";

/** The three things this page can be doing. */
type Status = "checking" | "verified" | "failed";

/**
 * Where the link in the verification email lands (/verify-email?token=...).
 * It sends the token to the API once and reports the result.
 */
export function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<Status>(token ? "checking" : "failed");
  const [message, setMessage] = useState(token ? "" : "This link is missing its token.");
  // A token works only once, so make sure the page never sends it twice.
  const sent = useRef(false);

  // Send the token as soon as the page opens.
  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;
    authApi
      .verifyEmail(token)
      .then(() => setStatus("verified"))
      .catch((caught) => {
        setMessage(errorMessage(caught, "We could not verify this link."));
        setStatus("failed");
      });
  }, [token]);

  return (
    <section className="narrow">
      <Card className="panel">
        {status === "checking" && (
          <>
            <h1>Verifying…</h1>
            <p className="muted" role="status">
              One moment while we confirm your email.
            </p>
          </>
        )}

        {status === "verified" && (
          <>
            <h1>Email verified</h1>
            <p className="muted" style={{ margin: "0.5rem 0 1.5rem" }}>
              Your account is active. You can log in now.
            </p>
            <ButtonLink to="/login" size="lg" fullWidth>
              Log in
            </ButtonLink>
          </>
        )}

        {status === "failed" && (
          <>
            <h1>We could not verify this link</h1>
            <p className="muted" role="alert" style={{ margin: "0.5rem 0 1.5rem" }}>
              {message}
            </p>
            <div className="screen-actions">
              <ButtonLink to="/check-email" size="lg">
                Get a new link
              </ButtonLink>
              <ButtonLink to="/login" variant="ghost" size="lg">
                Log in
              </ButtonLink>
            </div>
          </>
        )}
      </Card>
    </section>
  );
}
