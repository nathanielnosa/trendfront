import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

/** Whether I follow a writer, and that writer's follower numbers. */
export interface FollowState {
  user: number;
  is_following: boolean;
  followers_count: number;
  following_count: number;
}

/** Cache key; includes my id so accounts never share a cache. */
const followKey = (authorId: number, myId: number | undefined) => ["follow", authorId, myId] as const;

/** Am I following this writer? Only runs when logged in. */
export function useFollowState(authorId: number, myId: number | undefined) {
  return useQuery({
    queryKey: followKey(authorId, myId),
    queryFn: ({ signal }) => api.get<FollowState>(`/engagements/users/${authorId}/follow/`, undefined, { signal }),
    enabled: myId !== undefined,
  });
}

/** Follow or unfollow. The button flips at once and goes back if the server says no. */
export function useToggleFollow(authorId: number, myId: number | undefined) {
  const client = useQueryClient();
  const key = followKey(authorId, myId);

  return useMutation({
    mutationFn: (follow: boolean) =>
      follow
        ? api.post<unknown>(`/engagements/users/${authorId}/follow/`)
        : api.delete(`/engagements/users/${authorId}/follow/`),

    onMutate: async (follow) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<FollowState>(key);
      if (previous) client.setQueryData<FollowState>(key, { ...previous, is_following: follow });
      return { previous };
    },

    onError: (_error, _follow, context) => {
      if (context?.previous) client.setQueryData(key, context.previous);
    },

    // Refresh my state and the public follower count on the author page.
    onSettled: () => {
      void client.invalidateQueries({ queryKey: key });
      void client.invalidateQueries({ queryKey: ["author"] });
    },
  });
}