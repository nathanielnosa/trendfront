import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

/** The four ways to react to a post. */
export type ReactionType = "like" | "love" | "insightful" | "helpful";

/** The reactions in the order they are shown, with their label and emoji. */
export const REACTIONS: { type: ReactionType; label: string; emoji: string }[] = [
  { type: "like", label: "Like", emoji: "👍" },
  { type: "love", label: "Love", emoji: "❤️" },
  { type: "insightful", label: "Insightful", emoji: "💡" },
  { type: "helpful", label: "Helpful", emoji: "🙌" },
];

/** How many of each reaction a post has, and which one (if any) is mine. */
export interface ReactionSummary {
  post: string;
  counts: Record<ReactionType, number>;
  user_reaction: ReactionType | null;
}

/** Whether I have bookmarked a post. */
export interface BookmarkState {
  post: string;
  bookmarked: boolean;
}

/** The raw calls to the engagement endpoints. All of them need a login. */
export const engagementApi = {
  getReaction: (postId: string, signal?: AbortSignal) =>
    api.get<ReactionSummary>(`/engagements/posts/${postId}/reaction/`, undefined, { signal }),

  /** Add a reaction, or switch to another type. */
  setReaction: (postId: string, reactionType: ReactionType) =>
    api.post<unknown>(`/engagements/posts/${postId}/reaction/`, { reaction_type: reactionType }),

  removeReaction: (postId: string) => api.delete(`/engagements/posts/${postId}/reaction/`),

  getBookmark: (postId: string, signal?: AbortSignal) =>
    api.get<BookmarkState>(`/engagements/posts/${postId}/bookmark/`, undefined, { signal }),

  addBookmark: (postId: string) => api.post<unknown>(`/engagements/posts/${postId}/bookmark/`),

  removeBookmark: (postId: string) => api.delete(`/engagements/posts/${postId}/bookmark/`),
};

/**
 * Cache keys. The person's id is part of the key, so one person's reactions
 * are never shown to the next person who logs in on the same browser.
 */
export const engagementKeys = {
  reaction: (postId: string, userId: number | undefined) => ["reaction", postId, userId] as const,
  bookmark: (postId: string, userId: number | undefined) => ["bookmark", postId, userId] as const,
};

/** An empty tally, used before the real numbers arrive. */
const EMPTY_COUNTS: Record<ReactionType, number> = { like: 0, love: 0, insightful: 0, helpful: 0 };

/** Reaction counts and my own reaction. Only runs when logged in. */
export function useReactionSummary(postId: string, userId: number | undefined) {
  return useQuery({
    queryKey: engagementKeys.reaction(postId, userId),
    queryFn: ({ signal }) => engagementApi.getReaction(postId, signal),
    enabled: userId !== undefined,
  });
}

/**
 * Pick a reaction, or press the same one again to take it back. The screen
 * updates at once and goes back to the old numbers if the server says no.
 */
export function useReact(postId: string, userId: number | undefined) {
  const client = useQueryClient();
  const key = engagementKeys.reaction(postId, userId);

  return useMutation({
    mutationFn: (next: ReactionType | null) =>
      next === null ? engagementApi.removeReaction(postId) : engagementApi.setReaction(postId, next),

    // Show the result immediately.
    onMutate: async (next) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<ReactionSummary>(key);
      const base: ReactionSummary = previous ?? { post: postId, counts: EMPTY_COUNTS, user_reaction: null };
      const counts = { ...base.counts };
      if (base.user_reaction) counts[base.user_reaction] = Math.max(0, counts[base.user_reaction] - 1);
      if (next) counts[next] += 1;
      client.setQueryData<ReactionSummary>(key, { ...base, counts, user_reaction: next });
      return { previous };
    },

    // Put the old numbers back if it failed.
    onError: (_error, _next, context) => {
      if (context?.previous) client.setQueryData(key, context.previous);
    },

    // Either way, ask the server for the real numbers.
    onSettled: () => {
      void client.invalidateQueries({ queryKey: key });
      void client.invalidateQueries({ queryKey: ["post"] });
    },
  });
}

/** Whether the post is in my bookmarks. Only runs when logged in. */
export function useBookmarkState(postId: string, userId: number | undefined) {
  return useQuery({
    queryKey: engagementKeys.bookmark(postId, userId),
    queryFn: ({ signal }) => engagementApi.getBookmark(postId, signal),
    enabled: userId !== undefined,
  });
}

/** Save or unsave a post. The button flips at once and reverts on failure. */
export function useToggleBookmark(postId: string, userId: number | undefined) {
  const client = useQueryClient();
  const key = engagementKeys.bookmark(postId, userId);

  return useMutation({
    mutationFn: (save: boolean) =>
      save ? engagementApi.addBookmark(postId) : engagementApi.removeBookmark(postId),

    onMutate: async (save) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<BookmarkState>(key);
      client.setQueryData<BookmarkState>(key, { post: postId, bookmarked: save });
      return { previous };
    },

    onError: (_error, _save, context) => {
      if (context?.previous) client.setQueryData(key, context.previous);
    },

    onSettled: () => {
      void client.invalidateQueries({ queryKey: key });
      void client.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}