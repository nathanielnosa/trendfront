import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArticleBody } from "../../components/blog/ArticleBody";
import { FieldError, FormAlert } from "../../components/FormErrors";
import { ErrorNotice } from "../../components/StateMessage";
import { StatusBadge } from "../../components/studio/StatusBadge";
import { Button, Card, Skeleton, Tag, useToast } from "../../components/ui";
import { usePublishPost, useReviewPost } from "../../lib/api/desk";
import { toApiError, type ApiError } from "../../lib/api/errors";
import { useMyPost } from "../../lib/api/studioPosts";
import { formatDate } from "../../lib/format";
import "./ReviewPost.css";

/** Turn the value of a date-and-time input into the UTC time the API expects. */
function toIso(localValue: string): string {
  return new Date(localValue).toISOString();
}

/**
 * One story, for an editor to read in full and decide on.
 * Under review: approve or send back. Approved: publish now or schedule.
 */
export function ReviewPost() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: post, isPending, error, refetch } = useMyPost(id);
  const review = useReviewPost(id);
  const publish = usePublishPost(id);

  const [note, setNote] = useState("");
  const [when, setWhen] = useState("");
  const [problem, setProblem] = useState<ApiError | null>(null);

  if (isPending) {
    return (
      <div className="review" aria-busy="true">
        <Skeleton height="3rem" />
        <Skeleton height="20rem" />
      </div>
    );
  }
  if (error || !post) {
    return <ErrorNotice message="We could not open this story." onRetry={() => void refetch()} />;
  }

  const notes = (post as typeof post & { review_notes?: string }).review_notes ?? "";

  /** Approve the story, or send it back (a note is required for that). */
  function decide(action: "approve" | "reject") {
    setProblem(null);
    review.mutate(
      { action, review_notes: note.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(action === "approve" ? "Approved." : "Sent back to the author.");
          setNote("");
          if (action === "reject") navigate("/desk/review");
        },
        onError: (caught) => setProblem(toApiError(caught)),
      },
    );
  }

  /** Make the approved story live now. */
  function publishNow() {
    setProblem(null);
    publish.mutate(
      { action: "publish" },
      {
        onSuccess: () => toast.success("Published. It is live now."),
        onError: (caught) => setProblem(toApiError(caught)),
      },
    );
  }

  /** Set the approved story to go live at the chosen time. */
  function schedule() {
    setProblem(null);
    if (!when) {
      setProblem(toApiError(new Error("Choose a date and time first.")));
      return;
    }
    publish.mutate(
      { action: "schedule", scheduled_at: toIso(when) },
      {
        onSuccess: () => toast.success("Scheduled."),
        onError: (caught) => setProblem(toApiError(caught)),
      },
    );
  }

  return (
    <div className="review">
      <p>
        <Link to="/desk/review">← Back to the queue</Link>
      </p>

      <header className="review__head">
        <div className="review__meta">
          <StatusBadge status={post.status} />
          {post.category_details && <Tag>{post.category_details.name}</Tag>}
        </div>
        <h1>{post.title}</h1>
        <p className="muted">
          By {post.author_name} · Updated {formatDate(post.updated_at)}
          {post.scheduled_at && <> · Goes live {new Date(post.scheduled_at).toLocaleString()}</>}
        </p>
        {post.excerpt && <p className="listing__lead">{post.excerpt}</p>}
      </header>

      <Card className="review__panel">
        <h2>Your decision</h2>
        <FormAlert error={problem} />

        {post.status === "under_review" && (
          <>
            <div className="field">
              <label htmlFor="note" className="field__label">
                Note to the author
              </label>
              <textarea
                id="note"
                rows={3}
                className="field__input review__textarea"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional when approving. Required when sending it back."
              />
              <FieldError error={problem} name="review_notes" />
            </div>
            <div className="review__buttons">
              <Button onClick={() => decide("approve")} loading={review.isPending}>
                Approve
              </Button>
              <Button variant="secondary" onClick={() => decide("reject")} disabled={review.isPending || !note.trim()}>
                Send back to the author
              </Button>
            </div>
          </>
        )}

        {post.status === "approved" && (
          <>
            <p className="muted">
              {post.scheduled_at
                ? `Scheduled for ${new Date(post.scheduled_at).toLocaleString()}. You can publish it now or choose another time.`
                : "Approved. Publish it now, or pick a time for it to go live."}
            </p>
            <div className="review__buttons">
              <Button onClick={publishNow} loading={publish.isPending}>
                Publish now
              </Button>
            </div>
            <div className="field">
              <label htmlFor="when" className="field__label">
                Or schedule it
              </label>
              <div className="review__buttons">
                <input
                  id="when"
                  type="datetime-local"
                  className="field__input review__when"
                  value={when}
                  onChange={(event) => setWhen(event.target.value)}
                />
                <Button variant="secondary" onClick={schedule} disabled={publish.isPending || !when}>
                  Schedule
                </Button>
              </div>
              <FieldError error={problem} name="scheduled_at" />
            </div>
          </>
        )}

        {post.status === "published" && (
          <p>
            This story is live. <Link to={`/posts/${post.slug}`}>View it</Link>
          </p>
        )}
        {post.status === "draft" && (
          <p className="muted">
            This is a draft. It returns here once the author sends it for review.
            {notes && <> Last note to the author: “{notes}”</>}
          </p>
        )}
        {post.status === "archived" && <p className="muted">This story is archived.</p>}
      </Card>

      {post.featured_image && <img className="review__image" src={post.featured_image} alt="" />}
      <ArticleBody content={post.content} />
    </div>
  );
}
