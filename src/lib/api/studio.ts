import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/useAuth";
import type { Post } from "./blog";
import { api } from "./client";
import type { Paginated } from "./types";

/** Every status a post can be in, in the order the tabs show them. */
export const POST_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "under_review", label: "Under review" },
  { value: "approved", label: "Approved" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

/** Look up the nice label for a status value. */
export function statusLabel(value: string): string {
  return POST_STATUSES.find((item) => item.value === value)?.label ?? value;
}

/** What the My posts list can be filtered by. */
export interface MyPostsFilters {
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

/**
 * The logged-in writer's own posts, in any status, newest changes first.
 * The person's id is in the cache key so two accounts never share a list.
 */
export function useMyPosts(filters: MyPostsFilters) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-posts", user?.id, filters],
    queryFn: ({ signal }) => api.get<Paginated<Post>>("/blog/my-posts/", { ...filters }, { signal }),
    enabled: Boolean(user),
    placeholderData: keepPreviousData,
  });
}