import { Link, useSearchParams } from "react-router-dom";
import { ChipNav, type Chip } from "../../components/blog/ChipNav";
import { EmptyNotice, ErrorNotice } from "../../components/StateMessage";
import { StatusBadge } from "../../components/studio/StatusBadge";
import { Card, Pagination, Skeleton } from "../../components/ui";
import { useReviewQueue, type QueueStatus } from "../../lib/api/desk";
import { formatDate } from "../../lib/format";
import { usePageParam } from "../../lib/usePageParam";
import "../Listing.css";
import "../studio/MyPosts.css";

/** Posts per page (the same number the request asks for). */
const PAGE_SIZE = 10;

/**
 * The editor's work list. "Waiting for review" holds posts authors have sent in;
 * "Ready to publish" holds approved posts that are not live yet.
 */
export function ReviewQueue() {
  const [params, setParams] = useSearchParams();
  const [page] = usePageParam();
  const status: QueueStatus = params.get("status") === "approved" ? "approved" : "under_review";

  const { data, isPending, error, refetch } = useReviewQueue(status, page);

  const chips: Chip[] = [
    { label: "Waiting for review", to: "/desk/review", active: status === "under_review" },
    { label: "Ready to publish", to: "/desk/review?status=approved", active: status === "approved" },
  ];

  /** Change page, keeping the chosen list. */
  const onPageChange = (next: number) => {
    setParams((previous) => {
      const updated = new URLSearchParams(previous);
      if (next <= 1) updated.delete("page");
      else updated.set("page", String(next));
      return updated;
    });
    window.scrollTo({ top: 0 });
  };

  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));

  return (
    <div className="listing">
      <header className="listing__header">
        <h1>Review queue</h1>
        <p className="listing__lead">Read each story, then approve it, send it back, or publish it.</p>
        <ChipNav label="Queue" chips={chips} />
      </header>

      {isPending && (
        <div className="listing" aria-busy="true">
          <Skeleton height="5rem" />
          <Skeleton height="5rem" />
        </div>
      )}

      {error && <ErrorNotice message="We could not load the queue." onRetry={() => void refetch()} />}

      {data && data.results.length === 0 && (
        <EmptyNotice title="Nothing here">
          {status === "under_review" ? "No stories are waiting for review." : "No approved stories are waiting to be published."}
        </EmptyNotice>
      )}

      {data && data.results.length > 0 && (
        <ul className="studio-list">
          {data.results.map((post) => (
            <li key={post.id}>
              <Card className="studio-row">
                <div className="studio-row__main">
                  <h2 className="studio-row__title">
                    <Link to={`/desk/review/${post.id}`}>{post.title || "Untitled"}</Link>
                  </h2>
                  <p className="muted studio-row__meta">
                    By {post.author_name}
                    {post.category_details && <> · {post.category_details.name}</>} · Updated {formatDate(post.updated_at)}
                    {post.scheduled_at && <> · Goes live {new Date(post.scheduled_at).toLocaleString()}</>}
                  </p>
                </div>
                <StatusBadge status={post.status} />
                <div className="studio-row__actions">
                  <Link to={`/desk/review/${post.id}`}>{status === "under_review" ? "Review" : "Open"}</Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
    </div>
  );
}
