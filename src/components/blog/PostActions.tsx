import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import type { RedirectState } from "../../auth/guards";
import {
  REACTIONS,
  useBookmarkState,
  useReact,
  useReactionSummary,
  useToggleBookmark,
  type ReactionType,
} from "../../lib/api/engagement";
import { errorMessage } from "../../lib/api/errors";
import { formatCount } from "../../lib/format";
import { useToast } from "../ui";
import { ShareMenu } from "./ShareMenu";
import "./PostActions.css";

/**
 * The row under an article: four reaction buttons, a save button and a share menu.
 * Anyone can see the total; reacting or saving asks visitors to log in first.
 */
export function PostActions({ postId, likes, title }: { postId: string; likes: number; title: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const userId = user?.id;

  const summary = useReactionSummary(postId, userId);
  const react = useReact(postId, userId);
  const bookmark = useBookmarkState(postId, userId);
  const toggleBookmark = useToggleBookmark(postId, userId);

  const mine = summary.data?.user_reaction ?? null;
  const bookmarked = bookmark.data?.bookmarked ?? false;

  /** Send a visitor to the login page, and bring them back here afterwards. */
  const askToLogin = () => {
    const from = { pathname: location.pathname, search: location.search, hash: location.hash };
    navigate("/login", { state: { from } satisfies RedirectState });
  };

  /** React with a type, or take the reaction back if it is already mine. */
  const onReact = (type: ReactionType) => {
    if (!user) return askToLogin();
    react.mutate(mine === type ? null : type, {
      onError: (error) => toast.error(errorMessage(error, "Could not save your reaction.")),
    });
  };

  /** Save or unsave the post. */
  const onBookmark = () => {
    if (!user) return askToLogin();
    toggleBookmark.mutate(!bookmarked, {
      onSuccess: () => toast.success(bookmarked ? "Removed from bookmarks." : "Saved to bookmarks."),
      onError: (error) => toast.error(errorMessage(error, "Could not update your bookmark.")),
    });
  };

  // Logged in: add up the tally. Visitors only know the post's own total.
  const total = summary.data
    ? Object.values(summary.data.counts).reduce((sum, count) => sum + count, 0)
    : likes;

  return (
    <div className="post-actions">
      <div className="post-actions__reactions" role="group" aria-label="React to this story">
        {REACTIONS.map(({ type, label, emoji }) => {
          const active = mine === type;
          const count = summary.data?.counts[type];
          return (
            <button
              key={type}
              type="button"
              className={active ? "reaction reaction--active" : "reaction"}
              aria-pressed={active}
              aria-label={label}
              title={label}
              onClick={() => onReact(type)}
            >
              <span aria-hidden="true">{emoji}</span>
              {count !== undefined && count > 0 && <span className="reaction__count">{formatCount(count)}</span>}
            </button>
          );
        })}
        <span className="post-actions__total muted">
          {formatCount(total)} {total === 1 ? "reaction" : "reactions"}
        </span>
      </div>

      <div className="post-actions__right">
        <button
          type="button"
          className={bookmarked ? "save-button save-button--active" : "save-button"}
          aria-pressed={bookmarked}
          onClick={onBookmark}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 4h12v17l-6-4-6 4z" />
          </svg>
          {bookmarked ? "Saved" : "Save"}
        </button>
        <ShareMenu postId={postId} title={title} />
      </div>
    </div>
  );
}
