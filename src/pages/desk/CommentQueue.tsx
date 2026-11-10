import { useSearchParams } from "react-router-dom";
import { EmptyNotice, ErrorNotice } from "../../components/StateMessage";
import { Button, Card, Pagination, Skeleton, useToast } from "../../components/ui";
import { useModerateComment, usePendingComments } from "../../lib/api/moderation";
import { errorMessage } from "../../lib/api/errors";
import { formatDate } from "../../lib/format";
import { usePageParam } from "../../lib/usePageParam";
import "../Listing.css";
import "./CommentQueue.css";

/** Comments per page (matches the request). */
const PAGE_SIZE = 20;

/**
 * The comment moderation desk: every comment waiting for approval,
 * with Approve and Reject buttons on each one.
 */
export function CommentQueue() {
  const [, setParams] = useSearchParams();
  const [page] = usePageParam();
  const toast = useToast();
  const { data, isPending, error, refetch } = usePendingComments(page);
  const moderate = useModerateComment();

  /** Approve or reject one comment and tell the moderator what happened. */
  function decide(id: string, action: "approve" | "reject") {
    moderate.mutate(
      { id, action },
      {
        onSuccess: () => toast.success(action === "approve" ? "Comment approved." : "Comment rejected."),
        onError: (caught) => toast.error(errorMessage(caught, "Could not save your decision.")),
      },
    );
  }

  /** Change page through the address bar. */
  const onPageChange = (next: number) => {
    setParams(next <= 1 ? {} : { page: String(next) });
    window.scrollTo({ top: 0 });
  };

  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));

  return (
    <div className="listing">
      <header className="listing__header">
        <h1>Comments</h1>
        <p className="listing__lead">Approve a comment to show it under the story, or reject it to keep it hidden.</p>
      </header>

      {isPending && (
        <div className="listing" aria-busy="true">
          <Skeleton height="6rem" />
          <Skeleton height="6rem" />
        </div>
      )}

      {error && <ErrorNotice message="We could not load the comments." onRetry={() => void refetch()} />}

      {data && data.results.length === 0 && (
        <EmptyNotice title="All caught up">No comments are waiting for a decision.</EmptyNotice>
      )}

      {data && data.results.length > 0 && (
        <ul className="comment-queue">
          {data.results.map((comment) => (
            <li key={comment.id}>
              <Card className="comment-queue__item">
                <p className="muted comment-queue__meta">
                  <strong>{comment.author_name || "A reader"}</strong> on{" "}
                  <em>{comment.post_title}</em> · {formatDate(comment.created_at)}
                  {comment.parent && " · Reply"}
                </p>
                <p className="comment-queue__text">{comment.content}</p>
                <div className="comment-queue__buttons">
                  <Button size="sm" onClick={() => decide(comment.id, "approve")} disabled={moderate.isPending}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => decide(comment.id, "reject")}
                    disabled={moderate.isPending}
                  >
                    Reject
                  </Button>
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
