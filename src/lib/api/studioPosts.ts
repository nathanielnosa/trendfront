import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/useAuth";
import type { Post } from "./blog";
import { api } from "./client";

/** The fields the editor sends when it saves a post. */
export interface PostInput {
  title: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  category: string | null;
  tags: string[];
  seo_title: string;
  seo_description: string;
  allow_comments: boolean;
  visibility: "public" | "private";
}

/** The raw calls the editor needs. All of them need a login. */
export const studioApi = {
  /** Read one of my posts for editing (drafts included). */
  getMyPost: (id: string, signal?: AbortSignal) =>
    api.get<Post>(`/blog/my-posts/${id}/`, undefined, { signal }),

  /** Make a new post. It starts as a draft. */
  createPost: (input: PostInput) => api.post<Post>("/blog/posts/", input),

  /** Change some or all fields of an existing post. */
  updatePost: (id: string, input: Partial<PostInput>) =>
    api.patch<Post>(`/blog/posts/${id}/`, input),

  /** Send a draft to the editors. */
  submitForReview: (id: string) =>
    api.post<{ message: string; post: Post }>(`/blog/posts/${id}/submit-review/`, {
      action: "submit",
    }),

  /** Delete a post for good. */
  deletePost: (id: string) => api.delete(`/blog/posts/${id}/`),

  /** Upload a picture; answers with the full address to use. */
  uploadImage: (file: File) => {
    const data = new FormData();
    data.append("file", file);
    return api.post<{ url: string }>("/blog/media/", data);
  },
};

/** One of my posts, by id. Only runs when there is an id (editing, not creating). */
export function useMyPost(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-post", user?.id, id],
    queryFn: ({ signal }) => studioApi.getMyPost(id ?? "", signal),
    enabled: Boolean(id) && Boolean(user),
  });
}

/**
 * Save a post: creates it when there is no id yet, otherwise updates it.
 * Refreshes the studio list afterwards.
 */
export function useSavePost() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: PostInput }) =>
      id ? studioApi.updatePost(id, input) : studioApi.createPost(input),
    onSuccess: (post) => {
      void client.invalidateQueries({ queryKey: ["my-posts"] });
      void client.invalidateQueries({ queryKey: ["posts"] });
      void client.invalidateQueries({ queryKey: ["post", post.slug] });
    },
  });
}

/** Send a draft for review, then refresh the lists. */
export function useSubmitForReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studioApi.submitForReview(id),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["my-posts"] }),
  });
}

/** Delete a post, then refresh the lists. */
export function useDeletePost() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studioApi.deletePost(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["my-posts"] });
      void client.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
