import { useState, type FormEvent } from "react";
import { useAddComment } from "../../lib/api/comments";
import { toApiError, type ApiError } from "../../lib/api/errors";
import { FieldError, FormAlert } from "../FormErrors";
import { Button, useToast } from "../ui";

/** Longest comment we let the form send. */
const MAX_LENGTH = 2000;

/** A box to write a comment, or a reply when parentId is given. */
export function CommentForm({
  postId,
  parentId,
  onDone,
  onCancel,
  autoFocus = false,
}: {
  postId: string;
  parentId?: string;
  /** Called after the comment was sent. */
  onDone?: () => void;
  /** Shows a Cancel button (used for replies). */
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const toast = useToast();
  const add = useAddComment(postId);
  const [text, setText] = useState("");
  const [error, setError] = useState<ApiError | null>(null);

  /** Send the comment; every new comment waits for approval before it shows. */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = text.trim();
    if (!content) return;
    setError(null);
    add.mutate(
      { content, parentId },
      {
        onSuccess: () => {
          setText("");
          toast.success("Thanks! Your comment will appear once it is approved.");
          onDone?.();
        },
        onError: (caught) => setError(toApiError(caught)),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form comment-form" noValidate>
      <FormAlert error={error} />
      <label htmlFor={`comment-${parentId ?? "new"}`} className="sr-only">
        {parentId ? "Write a reply" : "Write a comment"}
      </label>
      <textarea
        id={`comment-${parentId ?? "new"}`}
        className="field__input comment-form__input"
        rows={parentId ? 3 : 4}
        maxLength={MAX_LENGTH}
        placeholder={parentId ? "Write a reply…" : "Share your thoughts…"}
        value={text}
        autoFocus={autoFocus}
        onChange={(event) => setText(event.target.value)}
      />
      <FieldError error={error} name="content" />
      <div className="comment-form__bar">
        <span className="muted comment-form__count">
          {text.length}/{MAX_LENGTH}
        </span>
        <div className="comment-form__buttons">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" loading={add.isPending} disabled={!text.trim()}>
            {parentId ? "Reply" : "Post comment"}
          </Button>
        </div>
      </div>
    </form>
  );
}
