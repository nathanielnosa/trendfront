import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/useAuth";
import type { Post } from "./blog";
import { api } from "./client";
import type { Paginated } from "./types";

/** The two lists an editor works from. */
export type QueueStatus = "under_review" | "approved";

/** What an editor decides about a post that is under review. */
export interface ReviewInput {
  action: "approve" | "reject";
  review_notes?: string;
}

/** What an editor decides about an approved post: go live now, or at a set time. */
export type PublishInput = { action: "publish" } | { action: "schedule"; scheduled_at: string };

/** Posts waiting for an editor. Oldest first, so nobody waits forever. */
export function useReviewQueue(status: QueueStatus, page: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["review-queue", user?.id, status, page],
    queryFn: ({ signal }) =>
      api.get<Paginated<Post>>("/blog/review-queue/", { status, page, page_size: 10 }, { signal }),
    enabled: Boolean(user),
    placeholderData: keepPreviousData,
  });
}

/** Refresh every list a status change can affect. */
function useRefreshAfterChange() {
  const client = useQueryClient();
  return () => {
    for (const key of ["review-queue", "my-posts", "my-post", "posts", "post"]) {
      void client.invalidateQueries({ queryKey: [key] });
    }
  };
}

/** Approve a post under review, or send it back to its author with a note. */
export function useReviewPost(id: string) {
  const refresh = useRefreshAfterChange();
  return useMutation({
    mutationFn: (input: ReviewInput) =>
      api.post<{ message: string; post: Post }>(`/blog/posts/${id}/review/`, input),
    onSuccess: refresh,
  });
}

/** Publish an approved post now, or schedule it. */
export function usePublishPost(id: string) {
  const refresh = useRefreshAfterChange();
  return useMutation({
    mutationFn: (input: PublishInput) =>
      api.post<{ message: string; post: Post }>(`/blog/posts/${id}/publish/`, input),
    onSuccess: refresh,
  });
}