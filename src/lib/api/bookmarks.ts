import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/useAuth";
import { api } from "./client";

/** One saved story, with enough detail to show it as a card. */
export interface BookmarkItem {
  id: string;
  /** The post's id. */
  post: string;
  post_title: string;
  post_slug: string;
  post_excerpt: string;
  post_author_name: string;
  post_published_at: string | null;
  post_reading_time: number;
  post_featured_image: string | null;
  /** When it was saved. */
  created_at: string;
}

/** What the bookmark list call sends back. */
interface BookmarkList {
  count: number;
  bookmarks: BookmarkItem[];
}

/** My saved stories. The person's id is in the key so accounts never share a cache. */
export function useBookmarks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: ({ signal }) => api.get<BookmarkList>("/engagements/bookmarks/", undefined, { signal }),
    enabled: Boolean(user),
    select: (data) => data.bookmarks,
  });
}