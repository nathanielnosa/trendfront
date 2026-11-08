import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import type { BookmarkItem } from "../../lib/api/bookmarks";
import { useToggleBookmark } from "../../lib/api/engagement";
import { errorMessage } from "../../lib/api/errors";
import { formatDate, formatReadingTime } from "../../lib/format";
import { mediaUrl } from "../../lib/media";
import { Button, Card, useToast } from "../ui";
import "./BookmarkRow.css";

/** One saved story: picture, title, teaser, and a button to unsave it. */
export function BookmarkRow({ item }: { item: BookmarkItem }) {
  const { user } = useAuth();
  const toast = useToast();
  const toggle = useToggleBookmark(item.post, user?.id);
  const image = mediaUrl(item.post_featured_image);

  /** Take the story out of the list. It disappears once the list reloads. */
  const remove = () =>
    toggle.mutate(false, {
      onSuccess: () => toast.success("Removed from bookmarks."),
      onError: (error) => toast.error(errorMessage(error, "Could not remove this bookmark.")),
    });

  return (
    <Card className="bookmark-row">
      <Link to={`/posts/${item.post_slug}`} className="bookmark-row__picture" tabIndex={-1} aria-hidden="true">
        {image ? <img src={image} alt="" loading="lazy" decoding="async" /> : <span className="bookmark-row__fallback" />}
      </Link>

      <div className="bookmark-row__body">
        <h2 className="bookmark-row__title">
          <Link to={`/posts/${item.post_slug}`}>{item.post_title}</Link>
        </h2>
        {item.post_excerpt && <p className="muted bookmark-row__excerpt">{item.post_excerpt}</p>}
        <p className="muted bookmark-row__meta">
          {item.post_author_name}
          {item.post_published_at && <> · {formatDate(item.post_published_at)}</>} ·{" "}
          {formatReadingTime(item.post_reading_time)} · Saved {formatDate(item.created_at)}
        </p>
      </div>

      <Button variant="ghost" size="sm" onClick={remove} loading={toggle.isPending}>
        Remove
      </Button>
    </Card>
  );
}
