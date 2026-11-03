import { BRAND_LEAD, BRAND_NAME, BRAND_TAIL } from "../brand";
import "./Logo.css";

/**
 * The wordmark, drawn as live text so it follows the theme:
 * the first half uses the normal text colour (black in light mode, white in
 * dark mode) and the second half always uses the brand primary colour.
 */
export function Logo({ size = 1.5 }: { size?: number }) {
  return (
    <span className="logo" style={{ fontSize: `${size}rem` }} role="img" aria-label={BRAND_NAME}>
      <span className="logo__lead" aria-hidden="true">
        {BRAND_LEAD}
      </span>
      <span className="logo__tail" aria-hidden="true">
        {BRAND_TAIL}
      </span>
    </span>
  );
}
