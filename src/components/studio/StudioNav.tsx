import { NavLink } from "react-router-dom";
import "./StudioNav.css";

/** The studio's own tab bar: switch between your posts and your media library. */
export function StudioNav() {
  /** Give the active tab its highlighted style. */
  const tabClass = ({ isActive }: { isActive: boolean }) => (isActive ? "studio-nav__tab is-active" : "studio-nav__tab");

  return (
    <nav className="studio-nav" aria-label="Studio">
      <NavLink to="/studio" end className={tabClass}>
        My posts
      </NavLink>
      <NavLink to="/studio/media" className={tabClass}>
        Media
      </NavLink>
    </nav>
  );
}
