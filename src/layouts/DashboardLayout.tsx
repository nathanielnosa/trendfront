import { useEffect, useState } from "react";
import { FaArrowRightFromBracket, FaArrowUpRightFromSquare, FaBars, FaXmark } from "react-icons/fa6";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { NavIcon } from "../components/dashboard/NavIcon";
import { navFor } from "../components/dashboard/nav";
import { NotificationBell } from "../components/NotificationBell";
import { ThemeToggle } from "../components/ThemeToggle";
import { Avatar } from "../components/ui";
import { useUnreadCount } from "../lib/api/notifications";
import { mediaUrl } from "../lib/media";
import "./DashboardLayout.css";

/**
 * The frame for every logged-in page: a dark menu on the left (a slide-in
 * drawer on phones), a slim top bar, and the page itself in the middle.
 * The menu only lists what the person's role may use.
 */
export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const { data: unread = 0 } = useUnreadCount();
  const [open, setOpen] = useState(false);

  // Close the phone drawer with the Escape key.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!user) return null;

  const name = `${user.first_name} ${user.last_name}`.trim() || user.username;

  return (
    <div className="dash">
      <aside className={open ? "dash__side dash__side--open" : "dash__side"} aria-label="Dashboard menu">
        <div className="dash__brand">
          <Link to="/" className="dash__logo" onClick={() => setOpen(false)}>
            <img src="/favicon.svg" alt="" width="32" height="32" />
            <span>
              Trend<em>Archive</em>
            </span>
          </Link>
          <button type="button" className="dash__close" aria-label="Close menu" onClick={() => setOpen(false)}>
            <FaXmark aria-hidden="true" />
          </button>
        </div>

        <Link to="/account" className="dash__who" onClick={() => setOpen(false)}>
          <Avatar name={name} src={mediaUrl(user.avatar)} size={44} />
          <span className="dash__who-text">
            <span className="dash__name">{name}</span>
            <span className="dash__role">{user.role.toLowerCase()}</span>
          </span>
        </Link>

        <nav className="dash__nav">
          {navFor(user).map((group) => (
            <div key={group.title} className="dash__group">
              <p className="dash__group-title">{group.title}</p>
              <ul>
                {group.items.map((item) => {
                  const active = item.isActive ? item.isActive(pathname) : pathname === item.to;
                  const count = item.badge === "notifications" ? unread : 0;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={active ? "dash__link dash__link--active" : "dash__link"}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                      >
                        <NavIcon name={item.icon} />
                        <span className="dash__link-label">{item.label}</span>
                        {count > 0 && <span className="dash__badge">{count > 99 ? "99+" : count}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <button type="button" className="dash__logout" onClick={() => void logout()}>
          <FaArrowRightFromBracket aria-hidden="true" />
          Log out
        </button>
      </aside>

      {open && <div className="dash__scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      <div className="dash__main">
        <header className="dash__top">
          <button type="button" className="dash__burger" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
            <FaBars aria-hidden="true" />
          </button>
          <div className="dash__top-actions">
            <Link to="/" className="dash__site">
              View site <FaArrowUpRightFromSquare aria-hidden="true" />
            </Link>
            <ThemeToggle />
            <NotificationBell />
            <Link to="/account" className="dash__me" aria-label="Your account">
              <Avatar name={name} src={mediaUrl(user.avatar)} size={36} />
            </Link>
          </div>
        </header>

        <main className="dash__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
