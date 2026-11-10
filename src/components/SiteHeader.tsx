import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { EDITOR_ROLES, MODERATOR_ROLES, WRITER_ROLES, hasRole } from "../auth/roles";
import { useAuth } from "../auth/useAuth";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import "./SiteHeader.css";
import { HeaderSearch } from "./HeaderSearch";
import { NotificationBell } from "./NotificationBell";
/**
 * Inline SVG icon for the mobile menu.
 * Displays a hamburger when closed and an X when open.
 */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="app-header__menu-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </>
      ) : (
        <>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </>
      )}
    </svg>
  );
}

/**
 * Floating, rounded header with responsive navigation.
 */
export function SiteHeader() {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 8);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close the mobile menu after navigation.
  const close = () => setOpen(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "app-link app-link--active" : "app-link";

  return (
    <header className="app-header">
      <div className={scrolled ? "app-header__bar is-scrolled" : "app-header__bar"}>
        {/* Logo */}
        <Link
          to="/"
          className="app-header__logo"
          onClick={close}
          aria-label="Trending Archive home"
        >
          <Logo size={1.5} />
        </Link>

        {/* Mobile hamburger / close button */}
        <button
          type="button"
          className="app-header__menu"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <MenuIcon open={open} />
        </button>

        {/* Navigation and account actions */}
        <div id="main-menu" className={open ? "app-header__panel is-open" : "app-header__panel"}>
          <nav aria-label="Main" className="app-header__nav">
            <NavLink to="/" end className={linkClass} onClick={close}>
              Home
            </NavLink>

            <NavLink to="/posts" className={linkClass} onClick={close}>
              Posts
            </NavLink>

            {hasRole(user, WRITER_ROLES) && (
              <NavLink to="/studio" className={linkClass} onClick={close}>
                Studio
              </NavLink>
            )}

            {hasRole(user, EDITOR_ROLES) && (
              <NavLink to="/desk/review" className={linkClass} onClick={close}>
                Desk
              </NavLink>
            )}
            {hasRole(user, MODERATOR_ROLES) && (
              <NavLink to="/desk/comments" className={linkClass} onClick={close}>
                Comments
              </NavLink>
            )}
          </nav>

          <div className="app-header__actions">
            {/* search */}
            <HeaderSearch onDone={close} />
            {user ? (
              <>
                <NavLink to="/account" className={linkClass} onClick={close}>
                  {user.username}
                </NavLink>

                <button
                  type="button"
                  className="app-button app-button--outline"
                  onClick={() => {
                    close();
                    void logout();
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="app-button app-button--outline" onClick={close}>
                  Log in
                </Link>

                <Link to="/register" className="app-button" onClick={close}>
                  Create account
                </Link>
              </>
            )}

            {/* toggle */}
            <ThemeToggle />
            <NotificationBell onNavigate={close} />
          </div>
        </div>
      </div>
    </header>
  );
}
