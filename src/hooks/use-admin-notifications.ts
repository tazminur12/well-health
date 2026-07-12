"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteNotificationAction,
  getAdminUnreadNotificationCountAction,
  listAdminNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import type { NotificationFilter } from "@/lib/notifications/schemas";

export const ADMIN_NOTIFICATIONS_KEY = ["admin-notifications"] as const;
export const ADMIN_UNREAD_COUNT_KEY = ["admin-notifications-unread"] as const;

export function useAdminNotifications(filter: NotificationFilter = "all", limit = 50) {
  return useQuery({
    queryKey: [...ADMIN_NOTIFICATIONS_KEY, filter, limit],
    queryFn: async () => {
      const result = await listAdminNotificationsAction({ filter, limit });
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useAdminUnreadCount() {
  return useQuery({
    queryKey: ADMIN_UNREAD_COUNT_KEY,
    queryFn: async () => {
      const result = await getAdminUnreadNotificationCountAction();
      if (result.error) throw new Error(result.error);
      return result.data!.unreadCount;
    },
    refetchInterval: 30_000,
  });
}

export function useAdminNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ADMIN_NOTIFICATIONS_KEY });
    void queryClient.invalidateQueries({ queryKey: ADMIN_UNREAD_COUNT_KEY });
  };

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const result = await markNotificationReadAction(id);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const result = await markAllNotificationsReadAction();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteNotificationAction(id);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  return { markRead, markAllRead, remove };
}
