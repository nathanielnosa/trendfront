import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

/** One comment, as the API sends it. */
export interface Comment {
  id: string;
  post: string;
  /** The writer's user id. */
  author: number;
  author_name: string;
  /** The comment this one answers, or null for a top-level comment. */
  parent: string | null;
  content: string;
  status: "pending" | "approved" | "rejected" | "deleted";
  created_at: string;
  edited_at: string | null;
  replies_count: number;
}

/** A comment with the replies under it, ready to draw. */
export interface CommentNode extends Comment {
  replies: CommentNode[];
}

/**
 * Turn the flat list from the API into a tree. A reply whose parent is not in
 * the list (for example, the parent was deleted) is shown as a top-level comment.
 */
export function buildThread(comments: Comment[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>();
  for (const comment of comments) nodes.set(comment.id, { ...comment, replies: [] });

  const roots: CommentNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parent ? nodes.get(node.parent) : undefined;
    if (parent) parent.replies.push(node);
    else roots.push(node);
  }
  return roots;
}

/** Cache key for one post's comments. */
const commentsKey = (postId: string) => ["comments", postId] as const;

/** Everything approved on a post. Public, so no login is needed. */
export function useComments(postId: string) {
  return useQuery({
    queryKey: commentsKey(postId),
    queryFn: ({ signal }) =>
      api.get<Comment[]>("/comments/", { post: postId }, { signal, auth: false }),
  });
}

/** Post a new comment, or a reply when parentId is given. It waits for approval. */
export function useAddComment(postId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { content: string; parentId?: string }) =>
      api.post<Comment>("/comments/", {
        post: postId,
        content: input.content,
        parent: input.parentId ?? null,
      }),
    onSuccess: () => void client.invalidateQueries({ queryKey: commentsKey(postId) }),
  });
}

/** Change the text of one of my comments. */
export function useEditComment(postId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; content: string }) =>
      api.patch<Comment>(`/comments/${input.id}/`, { content: input.content }),
    onSuccess: () => void client.invalidateQueries({ queryKey: commentsKey(postId) }),
  });
}

/** Delete a comment (mine, or anyone's for editors and admins). */
export function useDeleteComment(postId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/comments/${id}/`),
    onSuccess: () => void client.invalidateQueries({ queryKey: commentsKey(postId) }),
  });
}