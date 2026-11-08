import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { Card, Tag } from "../components/ui";
import { ProfileForm } from "../components/account/ProfileForm";
import { PasswordForm } from "../components/account/PasswordForm";
import "./Account.css";

/** The logged-in person's account: details, profile editing and password change. */
export function Account() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="account">
      <header className="account__header">
        <h2>Your account</h2>
        <p className="muted">
          Signed in as <strong>{user.email}</strong> <Tag>{user.role}</Tag>{" "}
          <Tag tone={user.is_verified ? "primary" : "neutral"}>
            {user.is_verified ? "Verified" : "Not verified"}
          </Tag>
        </p>
        {user.role !== "SUBSCRIBER" && (
          <p>
            <Link to={`/author/${user.username}`}>View your public author page</Link>
          </p>
        )}
      </header>

      <Card className="panel">
        <h2>Profile</h2>
        {/* key makes the form start fresh if a different person logs in */}
        <ProfileForm key={user.id} />
      </Card>

      <Card className="panel">
        <h2>Password</h2>
        <PasswordForm />
      </Card>
    </div>
  );
}
