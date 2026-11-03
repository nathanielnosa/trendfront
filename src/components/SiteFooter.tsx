import { Link } from "react-router-dom";
import { BRAND_NAME } from "../brand";
import { useAuth } from "../auth/useAuth";
import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";
import "./SiteFooter.css";

/**
 * Social profiles. Paste your real profile address between the quotes.
 * An icon only shows when its address is filled in.
 */
const SOCIALS = [
  { name: "Instagram", href: "fff" },
  { name: "X", href: "fff" },
  { name: "LinkedIn", href: "fff" },
  { name: "YouTube", href: "fff" },
];

/** Small social icons using inline SVG, chosen by name. */
function SocialIcon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (name === "Instagram") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    );
  }

  if (name === "X") {
    return (
      <svg {...common}>
        <path d="M4 4l16 16M20 4L4 20" />
      </svg>
    );
  }

  if (name === "LinkedIn") {
    return (
      <svg {...common}>
        <path d="M6 10v8M6 6.5v.01M11 18v-8M11 13a3 3 0 0 1 6 0v5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.5v5l4.2-2.5z" fill="currentColor" />
    </svg>
  );
}

/** Bottom of every page: link columns, newsletter box, brand, socials and legal links. */
export function SiteFooter() {
  const { user } = useAuth();

  // Only show social icons that have an address.
  const socials = SOCIALS.filter((item) => item.href.trim() !== "");

  return (
    <footer className="app-footer">
      <div className="container app-footer__inner">
        {/* Main footer columns */}
        <div className="app-footer__grid">
          <nav aria-label="Useful links" className="app-footer__col">
            <h2 className="app-footer__heading">Useful Links</h2>

            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/faqs">FAQs</Link>
          </nav>

          <nav aria-label="Explore" className="app-footer__col">
            <h2 className="app-footer__heading">Explore</h2>

            <Link to="/">Home</Link>
            <Link to="/posts">Blog</Link>
          </nav>

          <nav aria-label="Account" className="app-footer__col">
            <h2 className="app-footer__heading">Account</h2>

            {user ? (
              <>
                <Link to="/account">Your account</Link>
                <Link to="/bookmarks">Bookmarks</Link>
              </>
            ) : (
              <>
                <Link to="/login">Log in</Link>
                <Link to="/register">Create account</Link>
              </>
            )}
          </nav>

          <div className="app-footer__col app-footer__subscribe" id="newsletter">
            <h2 className="app-footer__heading">Subscribe</h2>

            <p className="app-footer__text">Join our community to receive updates</p>

            <div className="app-footer__newsletter">
              <NewsletterForm />
            </div>

            <p className="app-footer__privacy-note">
              By subscribing, you agree to our <Link to="/privacy">Privacy Policy</Link>
            </p>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="app-footer__bottom">
          <div className="app-footer__bottom-top">
            <Link to="/" className="app-footer__brand" aria-label={`${BRAND_NAME} home`}>
              <Logo size={1.5} />
            </Link>

            {socials.length > 0 && (
              <ul className="app-footer__socials" id="social-links" aria-label="Social media">
                {socials.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.name}
                      title={item.name}
                    >
                      <SocialIcon name={item.name} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="app-footer__bottom-meta">
            <nav className="app-footer__legal-links" aria-label="Legal information">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/cookies">Cookie Policy</Link>
            </nav>

            <p className="app-footer__copyright">
              © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
