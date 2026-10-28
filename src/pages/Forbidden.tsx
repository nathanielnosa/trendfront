import { Link } from "react-router-dom";

export function Forbidden() {
  return (
    <section className="screen">
      <h1>You do not have access to this page</h1>
      <p className="muted">Your account role does not include this area.</p>
      <p>
        <Link to="/">Back to the home page</Link>
      </p>
    </section>
  );
}
