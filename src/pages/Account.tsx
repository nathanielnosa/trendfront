import { useAuth } from "../auth/useAuth";
import { Avatar, Card, Tag } from "../components/ui";

/** Shows who is logged in. Phase 4 turns this into the full profile page. */
export function Account() {
  const { user } = useAuth();
  if (!user) return null;

  const fullName = `${user.first_name} ${user.last_name}`.trim() || user.username;

  return (
    <section style={{ maxWidth: "640px", margin: "0 auto" }}>
      <Card className="panel">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <Avatar name={fullName} size={64} />
          <div>
            <h1 style={{ fontSize: "var(--text-xl)" }}>{fullName}</h1>
            <p className="muted">@{user.username}</p>
          </div>
        </div>

        <dl className="facts">
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Role</dt>
          <dd>
            <Tag>{user.role}</Tag>
          </dd>
          <dt>Email verified</dt>
          <dd>
            <Tag tone={user.is_verified ? "primary" : "neutral"}>
              {user.is_verified ? "Verified" : "Not verified"}
            </Tag>
          </dd>
        </dl>
      </Card>
    </section>
  );
}
