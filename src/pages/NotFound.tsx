import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <section className="screen">
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for does not exist or has moved.</p>
      <p>
        <Link to="/">Back to the home page</Link>
      </p>
    </section>
  );
}
