import { Link, useNavigate } from "react-router-dom";
import "./NotFound.css";

/** 404 page shown for any address that does not match a route. */
export function NotFound() {
  const navigate = useNavigate();

  /** Go back one page, or to the home page if there is nothing to go back to. */
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    // A section, not <main>: the page layout already provides <main>.
    <section className="not-found">
      <div className="not-found__content">
        {/* Animated illustration */}
        <div
          className="not-found__illustration"
          role="img"
          aria-label="A lost little planet floating in space"
        >
          <div className="not-found__orbit not-found__orbit--one" />
          <div className="not-found__orbit not-found__orbit--two" />

          <span className="not-found__star not-found__star--one">✦</span>
          <span className="not-found__star not-found__star--two">✧</span>
          <span className="not-found__star not-found__star--three">✦</span>

          <div className="not-found__planet">
            <div className="not-found__planet-ring" />
            <div className="not-found__planet-surface">
              <span className="not-found__crater not-found__crater--one" />
              <span className="not-found__crater not-found__crater--two" />
              <span className="not-found__crater not-found__crater--three" />
            </div>
          </div>

          <div className="not-found__number">
            <span>4</span>
            <span className="not-found__number-zero">0</span>
            <span>4</span>
          </div>
        </div>

        {/* Page message */}
        <span className="not-found__eyebrow">LOST IN THE ARCHIVE?</span>

        <h1 className="not-found__title">Oops! Page not found.</h1>

        <p className="not-found__description">
          Looks like this story has gone missing. The page you are looking for may have been
          moved, deleted, or never existed in the first place.
        </p>

        {/* Navigation actions */}
        <div className="not-found__actions">
          <Link to="/" className="not-found__home-button">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m3 10 9-7 9 7" />
              <path d="M5 9v11h14V9" />
              <path d="M9 20v-7h6v7" />
            </svg>
            Back to Home
          </Link>

          <button type="button" className="not-found__back-button" onClick={goBack}>
            Go back
          </button>
        </div>

        <p className="not-found__footer">Don't worry, there's plenty more to discover.</p>
      </div>
    </section>
  );
}
