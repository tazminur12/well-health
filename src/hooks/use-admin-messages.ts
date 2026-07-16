"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteContactMessageAction,
  getContactUnreadCountAction,
  listContactMessagesAction,
  markAllContactMessagesReadAction,
  markContactMessageReadAction,
  updateContactMessageAction,
} from "@/lib/messages/actions";
import type {
  ContactMessageFilter,
  UpdateContactMessageInput,
} from "@/lib/messages/schemas";

export const ADMIN_MESSAGES_KEY = ["admin-messages"] as const;
export const ADMIN_MESSAGES_UNREAD_KEY = ["admin-messages-unread"] as const;

export function useAdminMessages(filter: ContactMessageFilter = "all") {
  return useQuery({
    queryKey: [...ADMIN_MESSAGES_KEY, filter],
    queryFn: async () => {
      const result = await listContactMessagesAction({ filter });
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useAdminMessagesUnreadCount(enabled = true) {
  return useQuery({
    queryKey: ADMIN_MESSAGES_UNREAD_KEY,
    enabled,
    queryFn: async () => {
      const result = await getContactUnreadCountAction();
      if (result.error) throw new Error(result.error);
      return result.data?.unreadCount ?? 0;
    },
    refetchInterval: 30_000,
  });
}

export function useMessageMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ADMIN_MESSAGES_KEY });
    void queryClient.invalidateQueries({ queryKey: ADMIN_MESSAGES_UNREAD_KEY });
  };

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const result = await markContactMessageReadAction(id);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const result = await markAllContactMessagesReadAction();
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: invalidate,
  });

  const updateMessage = useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateContactMessageInput;
    }) => {
      const result = await updateContactMessageAction(id, input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteContactMessageAction(id);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: invalidate,
  });

  return { markRead, markAllRead, updateMessage, deleteMessage };
}
