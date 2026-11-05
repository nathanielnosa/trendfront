import { useQuery } from "@tanstack/react-query";
import { api } from "./client";

/** A writer's public profile, as the API sends it. */
export interface Author {
  id: number;
  username: string;
  name: string;
  avatar: string | null;
  bio: string;
  date_joined: string;
  post_count: number;
}

/** Fetch one author by username (no login needed). */
export function getAuthor(username: string, signal?: AbortSignal) {
  return api.get<Author>(`/blog/authors/${encodeURIComponent(username)}/`, undefined, {
    auth: false,
    signal,
  });
}

/** One author's public profile, cached like other reads. */
export function useAuthor(username: string | undefined) {
  return useQuery({
    queryKey: ["author", username ?? ""],
    queryFn: ({ signal }) => getAuthor(username ?? "", signal),
    enabled: Boolean(username),
    staleTime: 5 * 60_000,
  });
}