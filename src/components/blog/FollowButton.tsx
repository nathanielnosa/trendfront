import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import type { RedirectState } from "../../auth/guards";
import { errorMessage } from "../../lib/api/errors";
import { useFollowState, useToggleFollow } from "../../lib/api/follow";
import { Button, useToast } from "../ui";

/**
 * Follow / Following button for a writer's page. Visitors are sent to log in
 * first, and nobody sees it on their own page.
 */
export function FollowButton({ authorId, authorName }: { authorId: number; authorName: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const state = useFollowState(authorId, user?.id);
  const toggle = useToggleFollow(authorId, user?.id);

  // You cannot follow yourself.
  if (user?.id === authorId) return null;

  const following = state.data?.is_following ?? false;

  /** Follow or unfollow; visitors are sent to log in and then brought back. */
  const onClick = () => {
    if (!user) {
      const from = { pathname: location.pathname, search: location.search, hash: location.hash };
      navigate("/login", { state: { from } satisfies RedirectState });
      return;
    }
    toggle.mutate(!following, {
      onSuccess: () =>
        toast.success(following ? `Unfollowed ${authorName}.` : `You are following ${authorName}.`),
      onError: (error) => toast.error(errorMessage(error, "Could not update this follow.")),
    });
  };

  return (
    <Button
      variant={following ? "secondary" : "primary"}
      onClick={onClick}
      aria-pressed={following}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
