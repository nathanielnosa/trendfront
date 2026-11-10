import { FaBell } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useUnreadCount } from "../lib/api/notifications";
import "./NotificationBell.css";

/** A bell in the header that links to the notifications page and shows the unread count. */
export function NotificationBell({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const { data: unread = 0 } = useUnreadCount();

  if (!user) return null;

  const label = unread > 0 ? `Notifications, ${unread} unread` : "Notifications";

  return (
    <Link to="/notifications" className="bell" aria-label={label} onClick={onNavigate}>
      <FaBell aria-hidden="true" />
      {unread > 0 && <span className="bell__count">{unread > 99 ? "99+" : unread}</span>}
    </Link>
  );
}
