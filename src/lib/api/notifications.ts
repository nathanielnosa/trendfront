import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/useAuth";
import { api } from "./client";

/** One notification as the API sends it. */
export interface AppNotification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  related_url: string;
  is_read: boolean;
  created_at: string;
}

/** One page of the notification list. */
interface NotificationPage {
  count: number;
  next: string | null;
  unread_count: number;
  notifications: AppNotification[];
}

/** Which notifications the list shows. */
export type NotificationFilter = "all" | "unread";

/** The signed-in user's notifications, newest first, loaded a page at a time. */
export function useNotifications(filter: NotificationFilter) {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: ["notifications", user?.id, filter],
    queryFn: ({ pageParam, signal }) =>
      api.get<NotificationPage>(
        "/notifications/",
        { page: pageParam, ...(filter === "unread" ? { is_read: "false" } : {}) },
        { signal },
      ),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => (last.next ? pages.length + 1 : undefined),
    enabled: Boolean(user),
  });
}

/** How many notifications are unread. Checked again every minute while the tab is open. */
export function useUnreadCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notification-count", user?.id],
    queryFn: ({ signal }) =>
      api.get<NotificationPage>("/notifications/", { is_read: "false", page_size: 1 }, { signal }),
    select: (data) => data.unread_count,
    enabled: Boolean(user),
    refetchInterval: 60_000,
  });
}

/** Refresh the list and the unread badge. */
function useRefresh() {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: ["notifications"] });
    void client.invalidateQueries({ queryKey: ["notification-count"] });
  };
}

/** Mark one notification as read. */
export function useMarkRead() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => api.patch<unknown>(`/notifications/${id}/read/`, {}),
    onSuccess: refresh,
  });
}

/** Mark every notification as read. */
export function useMarkAllRead() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: () => api.patch<unknown>("/notifications/read-all/", {}),
    onSuccess: refresh,
  });
}