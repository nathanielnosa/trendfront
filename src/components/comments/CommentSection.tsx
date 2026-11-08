import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { buildThread, useComments } from "../../lib/api/comments";
import { ErrorNotice } from "../StateMessage";
import { Skeleton } from "../ui";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import "./Comments.css";

/** The whole discussion under a post: the form, then the comments with their replies. */
export function CommentSection({ postId, allowed }: { postId: string; allowed: boolean }) {
  const { user } = useAuth();
  const location = useLocation();
  const { data, isPending, error, refetch } = useComments(postId);

  // Build the reply tree only when the list changes.
  const thread = useMemo(() => buildThread(data ?? []), [data]);

  const from = { pathname: location.pathname, search: location.search, hash: location.hash };

  return (
    <section className="comments" aria-labelledby="comments-title">
      <h2 id="comments-title">Comments{data ? ` (${data.length})` : ""}</h2>

      {!allowed ? (
        <p className="muted">Comments are turned off for this story.</p>
      ) : user ? (
        <>
          <CommentForm postId={postId} />
          <p className="muted comments__note">New comments are shown once they have been approved.</p>
        </>
      ) : (
        <p className="muted">
          <Link to="/login" state={{ from }}>
            Log in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      {isPending && (
        <div aria-hidden="true">
          <Skeleton height="4rem" />
        </div>
      )}
      {error && <ErrorNotice message="We could not load the comments." onRetry={() => void refetch()} />}
      {data && thread.length === 0 && allowed && <p className="muted">No comments yet. Be the first.</p>}

      {thread.length > 0 && (
        <ul className="comment-list">
          {thread.map((node) => (
            <CommentItem key={node.id} node={node} postId={postId} />
          ))}
        </ul>
      )}
    </section>
  );
}
