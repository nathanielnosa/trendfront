import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/useAuth";
import { api } from "./client";
import type { Paginated } from "./types";

/** One picture in the writer's library. */
export interface MediaItem {
  id: string;
  url: string;
  size: number;
  created_at: string;
}

/** The writer's uploaded pictures, newest first, 24 to a page. */
export function useMediaLibrary(page: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["media", user?.id, page],
    queryFn: ({ signal }) => api.get<Paginated<MediaItem>>("/blog/media/", { page }, { signal }),
    enabled: Boolean(user),
    placeholderData: keepPreviousData,
  });
}

/** Upload a new picture, then refresh the library. */
export function useUploadMedia() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const data = new FormData();
      data.append("file", file);
      return api.post<MediaItem>("/blog/media/", data);
    },
    onSuccess: () => void client.invalidateQueries({ queryKey: ["media"] }),
  });
}

/** Delete a picture (the server refuses if a post still uses it). */
export function useDeleteMedia() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/blog/media/${id}/`),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["media"] }),
  });
}