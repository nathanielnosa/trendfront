import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui";
import "./WorkflowPanel.css";

/**
 * Tells the writer where the post is in its journey and offers the next step:
 * draft -> under review -> approved (maybe scheduled) -> published.
 * It also holds the Delete button.
 */
export function WorkflowPanel({
  status,
  scheduledAt,
  reviewNotes,
  slug,
  isPublic,
  saved,
  submitting,
  deleting,
  onSubmit,
  onDelete,
}: {
  status: string;
  scheduledAt: string | null;
  reviewNotes: string;
  slug: string | null;
  isPublic: boolean;
  /** False until the post has been saved at least once. */
  saved: boolean;
  submitting: boolean;
  deleting: boolean;
  onSubmit: () => void;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  /** The sentence under the heading, depending on the status. */
  const message = () => {
    switch (status) {
      case "draft":
        return "This draft is private. When it is ready, send it to the editors for review.";
      case "under_review":
        return "An editor is reviewing this story. You can still make changes while you wait.";
      case "approved":
        return scheduledAt
          ? `Approved. It will go live on ${new Date(scheduledAt).toLocaleString()}.`
          : "Approved. An editor will publish it soon.";
      case "published":
        return "This story is live.";
      case "archived":
        return "This story is archived.";
      default:
        return "";
    }
  };

  return (
    <section className="workflow" aria-label="Publishing">
      {status === "draft" && reviewNotes && (
        <div className="workflow__notes" role="note">
          <strong>An editor sent this back with a note:</strong>
          <p>{reviewNotes}</p>
        </div>
      )}

      <p>{message()}</p>

      <div className="workflow__buttons">
        {status === "draft" && (
          <Button onClick={onSubmit} loading={submitting}>
            Submit for review
          </Button>
        )}
        {status === "published" && isPublic && slug && (
          <Link className="workflow__link" to={`/posts/${slug}`}>
            View story
          </Link>
        )}

        {saved &&
          (confirming ? (
            <>
              <Button
                variant="secondary"
                className="workflow__danger"
                onClick={onDelete}
                loading={deleting}
              >
                Yes, delete it
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                Keep it
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setConfirming(true)}>
              Delete
            </Button>
          ))}
      </div>
    </section>
  );
}
