import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { blogApi, cleanFilters, type PostFilters } from "./blog";

/** The cache keys, in one place so every screen shares the same cached data. */
export const blogKeys = {
  posts: (filters: PostFilters) => ["posts", cleanFilters(filters)] as const,
  post: (slug: string) => ["post", slug] as const,
  categories: ["categories"] as const,
  tags: ["tags"] as const,
};

/**
 * A page of posts. While the next page loads, the previous one stays on
 * screen, so paging and filtering never flash empty.
 */
export function usePosts(filters: PostFilters = {}) {
  return useQuery({
    queryKey: blogKeys.posts(filters),
    queryFn: ({ signal }) => blogApi.listPosts(filters, signal),
    placeholderData: keepPreviousData,
  });
}

/** One post by slug. */
export function usePost(slug: string | undefined) {
  return useQuery({
    queryKey: blogKeys.post(slug ?? ""),
    queryFn: ({ signal }) => blogApi.getPostBySlug(slug ?? "", signal),
    enabled: Boolean(slug),
  });
}

/** All categories. They rarely change, so they stay fresh for ten minutes. */
export function useCategories() {
  return useQuery({
    queryKey: blogKeys.categories,
    queryFn: ({ signal }) => blogApi.listCategories(signal),
    staleTime: 10 * 60_000,
  });
}

/** All tags, cached like the categories. */
export function useTags() {
  return useQuery({
    queryKey: blogKeys.tags,
    queryFn: ({ signal }) => blogApi.listTags(signal),
    staleTime: 10 * 60_000,
  });
}