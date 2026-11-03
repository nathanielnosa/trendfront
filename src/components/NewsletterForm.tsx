import { useState, type FormEvent } from "react";
import "./NewsletterForm.css";

/** Very light email check: something@something.something. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Email signup box for the footer.
 * The backend has no newsletter endpoint yet, so this only checks the address
 * and tells the visitor signups are not open. Nothing is sent or stored.
 * Replace the marked line with a real API call when the endpoint exists.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  /** Validate the address and show the right message. */
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!looksLikeEmail(email.trim())) {
      setIsError(true);
      setMessage("Please enter a valid email address.");
      return;
    }
    // TODO: call the newsletter API here once the backend has one.
    setIsError(false);
    setMessage("Newsletter signups are not open yet. Please check back soon.");
  };

  return (
    <form className="newsletter" onSubmit={onSubmit} noValidate>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="newsletter__field">
        <input
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={isError}
          aria-describedby="newsletter-message"
          className="newsletter__input"
        />
        <button type="submit" className="newsletter__button">
          Subscribe
        </button>
      </div>
      <p
        id="newsletter-message"
        role="status"
        className={
          isError ? "newsletter__message newsletter__message--error" : "newsletter__message"
        }
      >
        {message}
      </p>
    </form>
  );
}
