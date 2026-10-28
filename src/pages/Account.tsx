import { useAuth } from "../auth/useAuth";

// Shows who is logged in, to prove the token and /auth/me/ work.
// Phase 4 turns this into the real profile page.
export function Account() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <section>
      <h1>Account</h1>
      <p className="muted">
        The full profile page is built in Phase 4. For now this proves you are logged in.
      </p>
      <dl className="facts">
        <dt>Name</dt>
        <dd>
          {user.first_name} {user.last_name}
        </dd>
        <dt>Username</dt>
        <dd>{user.username}</dd>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Role</dt>
        <dd>{user.role}</dd>
        <dt>Email verified</dt>
        <dd>{user.is_verified ? "Yes" : "No"}</dd>
      </dl>
    </section>
  );
}
