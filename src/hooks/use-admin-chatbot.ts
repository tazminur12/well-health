"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createChatbotQaAction,
  createQaFromUnansweredAction,
  deleteChatbotQaAction,
  dismissChatbotUnansweredAction,
  listChatbotQasAction,
  listChatbotUnansweredAction,
  testChatbotMatchAction,
  toggleChatbotQaActiveAction,
  updateChatbotQaAction,
} from "@/lib/chatbot/actions";
import type { ChatbotQaInput } from "@/lib/chatbot/schemas";

export const ADMIN_CHATBOT_QA_KEY = ["admin-chatbot-qa"] as const;
export const ADMIN_CHATBOT_UNANSWERED_KEY = ["admin-chatbot-unanswered"] as const;

export function useAdminChatbotQas() {
  return useQuery({
    queryKey: ADMIN_CHATBOT_QA_KEY,
    queryFn: async () => {
      const result = await listChatbotQasAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useAdminChatbotUnanswered() {
  return useQuery({
    queryKey: ADMIN_CHATBOT_UNANSWERED_KEY,
    queryFn: async () => {
      const result = await listChatbotUnansweredAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useChatbotMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ADMIN_CHATBOT_QA_KEY });
    void queryClient.invalidateQueries({ queryKey: ADMIN_CHATBOT_UNANSWERED_KEY });
  };

  const createQa = useMutation({
    mutationFn: async (input: ChatbotQaInput) => {
      const result = await createChatbotQaAction(input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const updateQa = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ChatbotQaInput }) => {
      const result = await updateChatbotQaAction(id, input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const deleteQa = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteChatbotQaAction(id);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  const toggleQa = useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleChatbotQaActiveAction(id);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const dismissUnanswered = useMutation({
    mutationFn: async (id: string) => {
      const result = await dismissChatbotUnansweredAction(id);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  const createFromUnanswered = useMutation({
    mutationFn: async ({
      unansweredId,
      input,
    }: {
      unansweredId: string;
      input: ChatbotQaInput;
    }) => {
      const result = await createQaFromUnansweredAction(unansweredId, input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const testMatch = useMutation({
    mutationFn: async (message: string) => {
      const result = await testChatbotMatchAction(message);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });

  return {
    createQa,
    updateQa,
    deleteQa,
    toggleQa,
    dismissUnanswered,
    createFromUnanswered,
    testMatch,
  };
}
