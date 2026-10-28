import { Link, NavLink, Outlet } from "react-router-dom";
import { EDITOR_ROLES, WRITER_ROLES, hasRole } from "../auth/roles";
import { useAuth } from "../auth/useAuth";

// A plain frame so you can click through every route. Phase 2 replaces it
// with the real header and footer.
export function RootLayout() {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="site-header">
        <div className="container nav">
          <Link to="/" className="brand">
            Trending Archive
          </Link>
          <nav aria-label="Main">
            <NavLink to="/posts">Posts</NavLink>
            {hasRole(user, WRITER_ROLES) && <NavLink to="/studio">Studio</NavLink>}
            {hasRole(user, EDITOR_ROLES) && <NavLink to="/desk/review">Desk</NavLink>}
          </nav>
          <div className="nav-account">
            {user ? (
              <>
                <NavLink to="/account">{user.username}</NavLink>
                <button type="button" className="link-button" onClick={() => void logout()}>
                  Log out
                </button>
              </>
            ) : (
              <NavLink to="/login">Log in</NavLink>
            )}
          </div>
        </div>
      </header>
      <main className="container page">
        <Outlet />
      </main>
    </>
  );
}
