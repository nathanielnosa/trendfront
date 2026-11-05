import { api } from "./client";
import type { Paginated } from "./types";

/** A post category, as the API sends it. */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

/** A post tag, as the API sends it. */
export interface Tag {
  id: string;
  name: string;
  slug: string;
}

/** One post. The list and the single-post call send the same fields. */
export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  /** The full body; only the post page needs it. */
  content: string;
  featured_image: string | null;
  /** The author's user id. */
  author: number;
  author_name: string;
  author_username: string;
  /** The category's id. */
  category: string | null;
  category_details: Category | null;
  /** Tag ids. */
  tags: string[];
  tags_details: Tag[];
  status: string;
  visibility: string;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
  /** Estimated minutes to read. */
  reading_time: number;
  seo_title: string;
  seo_description: string;
  canonical_url: string | null;
  is_featured: boolean;
  is_trending: boolean;
  allow_comments: boolean;
}

/** What the public post list can be filtered by. */
export interface PostFilters {
  category?: string; // category slug
  tag?: string; // tag slug
  author?: number; // author's user id
  featured?: boolean;
  trending?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

/** Categories and tags may come as a plain list or a paged one; return the list. */
export function unwrap<T>(data: T[] | Paginated<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

/** Drop empty filters so they never reach the address (for example search=""). */
export function cleanFilters(filters: PostFilters): PostFilters {
  const cleaned: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    cleaned[key] = value;
  }
  return cleaned as PostFilters;
}

// Public reading needs no login, so these calls send no token (auth: false).
export const blogApi = {
  /** A page of published posts, newest first, narrowed by the filters. */
  listPosts: (filters: PostFilters = {}, signal?: AbortSignal) =>
    api.get<Paginated<Post>>("/blog/posts/", cleanFilters(filters), { auth: false, signal }),

  /** One published post by its slug. Needs the by-slug endpoint on the backend. */
  getPostBySlug: (slug: string, signal?: AbortSignal) =>
    api.get<Post>(`/blog/posts/by-slug/${encodeURIComponent(slug)}/`, undefined, {
      auth: false,
      signal,
    }),

  /** Every category. */
  listCategories: async (signal?: AbortSignal) =>
    unwrap(await api.get<Category[] | Paginated<Category>>("/blog/categories/", undefined, { auth: false, signal })),

  /** Every tag. */
  listTags: async (signal?: AbortSignal) =>
    unwrap(await api.get<Tag[] | Paginated<Tag>>("/blog/tags/", undefined, { auth: false, signal })),
};