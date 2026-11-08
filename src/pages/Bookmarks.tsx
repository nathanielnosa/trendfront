import { BookmarkRow } from "../components/bookmarks/BookmarkRow";
import { EmptyNotice, ErrorNotice } from "../components/StateMessage";
import { ButtonLink, Skeleton } from "../components/ui";
import { useBookmarks } from "../lib/api/bookmarks";
import "./Listing.css";

/** Every story the logged-in person has saved, newest first. */
export function Bookmarks() {
  const { data, isPending, error, refetch } = useBookmarks();

  return (
    <div className="listing">
      <header className="listing__header">
        <h1>Bookmarks</h1>
        <p className="listing__lead">Stories you saved to read later.</p>
      </header>

      {isPending && (
        <div className="listing" aria-hidden="true">
          <Skeleton height="7.5rem" />
          <Skeleton height="7.5rem" />
          <Skeleton height="7.5rem" />
        </div>
      )}

      {error && <ErrorNotice message="We could not load your bookmarks." onRetry={() => void refetch()} />}

      {data && data.length === 0 && (
        <EmptyNotice title="No bookmarks yet">
          You have not saved anything yet. Press Save on a story and it will wait for you here.
          <div style={{ marginTop: "1rem" }}>
            <ButtonLink to="/posts">Find something to read</ButtonLink>
          </div>
        </EmptyNotice>
      )}

      {data && data.length > 0 && (
        <div className="listing">
          {data.map((item) => (
            <BookmarkRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
