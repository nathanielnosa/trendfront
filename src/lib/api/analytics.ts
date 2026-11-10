import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/useAuth";
import { api } from "./client";

/** The headline numbers for the whole site. */
export interface AnalyticsSummary {
  total_events: number;
  events_today: number;
  post_views: number;
  reactions: number;
  comments: number;
  shares: number;
  bookmarks: number;
  follows: number;
  post_publications: number;
}

/** One day of the traffic chart. */
export interface TrafficDay {
  date: string;
  total_events: number;
  post_views: number;
  engagements: number;
}

/** One row of a "top posts" list. The number field depends on the list. */
export interface TopPost {
  post_id: string;
  title: string;
  slug: string;
  total_views?: number;
  total_engagements?: number;
}

/** Turn a Date into the YYYY-MM-DD text the API expects (in the viewer's own time zone). */
function isoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The site's headline numbers. */
export function useAnalyticsSummary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["analytics", user?.id, "summary"],
    queryFn: ({ signal }) => api.get<AnalyticsSummary>("/analytics/summary/", undefined, { signal }),
    enabled: Boolean(user),
  });
}

/** Daily traffic for the last `days` days, today included. */
export function useTrafficTrends(days: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["analytics", user?.id, "traffic", days],
    queryFn: ({ signal }) => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - (days - 1));
      return api.get<{ results: TrafficDay[] }>(
        "/analytics/traffic-trends/",
        { start_date: isoDay(start), end_date: isoDay(end) },
        { signal },
      );
    },
    select: (data) => data.results,
    enabled: Boolean(user),
  });
}

/** The ten most viewed posts of all time. */
export function useTopViewed() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["analytics", user?.id, "top-viewed"],
    queryFn: ({ signal }) => api.get<{ results: TopPost[] }>("/analytics/posts/top-viewed/", undefined, { signal }),
    select: (data) => data.results,
    enabled: Boolean(user),
  });
}

/** The ten posts with the most reactions, comments, shares and bookmarks. */
export function useTopEngaged() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["analytics", user?.id, "top-engaged"],
    queryFn: ({ signal }) => api.get<{ results: TopPost[] }>("/analytics/posts/top-engaged/", undefined, { signal }),
    select: (data) => data.results,
    enabled: Boolean(user),
  });
}