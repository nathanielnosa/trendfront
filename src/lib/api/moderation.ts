import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/useAuth";
import { api } from "./client";
import type { Paginated } from "./types";

/** A comment waiting for a decision, with the title of the story it belongs to. */
export interface PendingComment {
  id: string;
  post: string;
  post_title: string;
  author_name: string;
  parent: string | null;
  content: string;
  created_at: string;
}

/** Comments waiting for approval, oldest first. Authors see only those on their own stories. */
export function usePendingComments(page: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["comment-queue", user?.id, page],
    queryFn: ({ signal }) =>
      api.get<Paginated<PendingComment>>("/comments/pending/", { page, page_size: 20 }, { signal }),
    enabled: Boolean(user),
    placeholderData: keepPreviousData,
  });
}

/** Approve or reject one comment, then refresh the queue and the public comment lists. */
export function useModerateComment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      api.post<{ message: string }>(`/comments/${id}/moderate/`, { action }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["comment-queue"] });
      void client.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}