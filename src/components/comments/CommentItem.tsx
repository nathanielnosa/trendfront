import { useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { EDITOR_ROLES, hasRole } from "../../auth/roles";
import type { CommentNode } from "../../lib/api/comments";
import { useDeleteComment, useEditComment } from "../../lib/api/comments";
import { errorMessage } from "../../lib/api/errors";
import { formatDate } from "../../lib/format";
import { Avatar, Button, useToast } from "../ui";
import { CommentForm } from "./CommentForm";

/** Replies are indented down to this depth; deeper ones stay at the same level. */
const MAX_INDENT = 3;

/** One comment with its actions, and the replies below it (it draws itself again for each reply). */
export function CommentItem({ node, postId, depth = 0 }: { node: CommentNode; postId: string; depth?: number }) {
  const { user } = useAuth();
  const toast = useToast();
  const edit = useEditComment(postId);
  const remove = useDeleteComment(postId);

  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.content);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const mine = user?.id === node.author;
  const canDelete = mine || hasRole(user, EDITOR_ROLES);

  /** Save the edited text and close the editor. */
  const saveEdit = () => {
    const content = draft.trim();
    if (!content) return;
    edit.mutate(
      { id: node.id, content },
      {
        onSuccess: () => setEditing(false),
        onError: (error) => toast.error(errorMessage(error, "Could not save your change.")),
      },
    );
  };

  /** Delete the comment after the second click. */
  const doDelete = () =>
    remove.mutate(node.id, {
      onSuccess: () => toast.success("Comment deleted."),
      onError: (error) => toast.error(errorMessage(error, "Could not delete this comment.")),
    });

  return (
    <li className="comment">
      <Avatar name={node.author_name} size={36} />
      <div className="comment__main">
        <p className="comment__head">
          <strong>{node.author_name}</strong>
          <span className="muted">
            {formatDate(node.created_at)}
            {node.edited_at && " · edited"}
          </span>
        </p>

        {editing ? (
          <div className="form">
            <textarea
              className="field__input comment-form__input"
              rows={3}
              maxLength={2000}
              value={draft}
              aria-label="Edit your comment"
              onChange={(event) => setDraft(event.target.value)}
            />
            <div className="comment-form__buttons">
              <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setDraft(node.content); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveEdit} loading={edit.isPending} disabled={!draft.trim()}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="comment__text">{node.content}</p>
        )}

        {!editing && user && (
          <div className="comment__actions">
            <button type="button" onClick={() => setReplying((open) => !open)}>
              Reply
            </button>
            {mine && (
              <button type="button" onClick={() => setEditing(true)}>
                Edit
              </button>
            )}
            {canDelete &&
              (confirmDelete ? (
                <>
                  <button type="button" className="comment__danger" onClick={doDelete} disabled={remove.isPending}>
                    Confirm delete
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)}>
                    Keep
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)}>
                  Delete
                </button>
              ))}
          </div>
        )}

        {replying && (
          <CommentForm
            postId={postId}
            parentId={node.id}
            autoFocus
            onDone={() => setReplying(false)}
            onCancel={() => setReplying(false)}
          />
        )}

        {node.replies.length > 0 && (
          <ul className={depth < MAX_INDENT ? "comment-list comment-list--nested" : "comment-list"}>
            {node.replies.map((reply) => (
              <CommentItem key={reply.id} node={reply} postId={postId} depth={depth + 1} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
