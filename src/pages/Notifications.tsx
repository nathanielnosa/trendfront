import { useNavigate, useSearchParams } from "react-router-dom";
import { ChipNav, type Chip } from "../components/blog/ChipNav";
import { EmptyNotice, ErrorNotice } from "../components/StateMessage";
import { Button, Card, Skeleton, useToast } from "../components/ui";
import { errorMessage } from "../lib/api/errors";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  type AppNotification,
  type NotificationFilter,
} from "../lib/api/notifications";
import "./Listing.css";
import "./Notifications.css";

/** Notification types that point at a page which exists in the app. */
const LINKABLE = new Set(["comment", "reply", "reaction", "bookmark", "publish", "review_submitted", "post_approved", "post_rejected"]);

/** The notifications page: everyone's inbox, with an unread filter. */
export function Notifications() {
  const [params] = useSearchParams();
  const filter: NotificationFilter = params.get("filter") === "unread" ? "unread" : "all";

  const navigate = useNavigate();
  const toast = useToast();
  const { data, isPending, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications(filter);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const items = data?.pages.flatMap((page) => page.notifications) ?? [];
  const unread = data?.pages[0]?.unread_count ?? 0;

  const chips: Chip[] = [
    { label: "All", to: "/notifications", active: filter === "all" },
    { label: "Unread", to: "/notifications?filter=unread", active: filter === "unread" },
  ];

  /** Open a notification: mark it read, then go to the page it is about. */
  function open(item: AppNotification) {
    if (!item.is_read) markRead.mutate(item.id);
    if (item.related_url && LINKABLE.has(item.notification_type)) navigate(item.related_url);
  }

  /** Mark everything as read and confirm. */
  function readAll() {
    markAll.mutate(undefined, {
      onSuccess: () => toast.success("All caught up."),
      onError: (caught) => toast.error(errorMessage(caught, "Could not update your notifications.")),
    });
  }

  return (
    <div className="listing">
      <header className="listing__header">
        <h1>Notifications</h1>
        <p className="listing__lead">{unread > 0 ? `${unread} unread` : "You are all caught up."}</p>
        <div className="notes__bar">
          <ChipNav label="Filter" chips={chips} />
          {unread > 0 && (
            <Button size="sm" variant="secondary" onClick={readAll} loading={markAll.isPending}>
              Mark all as read
            </Button>
          )}
        </div>
      </header>

      {isPending && (
        <div className="listing" aria-busy="true">
          <Skeleton height="4.5rem" />
          <Skeleton height="4.5rem" />
        </div>
      )}

      {error && <ErrorNotice message="We could not load your notifications." onRetry={() => void refetch()} />}

      {data && items.length === 0 && (
        <EmptyNotice title="Nothing here">
          {filter === "unread" ? "You have no unread notifications." : "Notifications about your stories and comments will show up here."}
        </EmptyNotice>
      )}

      {items.length > 0 && (
        <ul className="notes">
          {items.map((item) => (
            <li key={item.id}>
              <Card className={item.is_read ? "note" : "note note--unread"}>
                <button type="button" className="note__button" onClick={() => open(item)}>
                  <span className="note__title">
                    {!item.is_read && <span className="note__dot" aria-label="Unread" />}
                    {item.title}
                  </span>
                  <span className="note__message">{item.message}</span>
                  <span className="muted note__time">{new Date(item.created_at).toLocaleString()}</span>
                </button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {hasNextPage && (
        <div className="notes__more">
          <Button variant="secondary" onClick={() => void fetchNextPage()} loading={isFetchingNextPage}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
