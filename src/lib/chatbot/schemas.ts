import { z } from "zod";

const stringListFromInput = z
  .union([
    z.array(z.string()),
    z.string(),
  ])
  .transform((value) => {
    const parts = Array.isArray(value)
      ? value
      : value.split(/[\n,]/g);
    return parts
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 40);
  });

export const chatbotQaInputSchema = z.object({
  question: z.string().trim().min(3, "Question is required").max(300),
  answer: z.string().trim().min(5, "Answer is required").max(4000),
  aliases: stringListFromInput.optional().default([]),
  keywords: stringListFromInput.optional().default([]),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
  isQuickReply: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).max(9999).optional().default(0),
});

export const askChatbotSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(500),
});

export type ChatbotQaInput = z.infer<typeof chatbotQaInputSchema>;
export type AskChatbotInput = z.infer<typeof askChatbotSchema>;

export type AdminChatbotQa = {
  id: string;
  question: string;
  answer: string;
  aliases: string[];
  keywords: string[];
  category: string | null;
  isActive: boolean;
  isQuickReply: boolean;
  sortOrder: number;
  hitCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminChatbotUnanswered = {
  id: string;
  question: string;
  normalized: string;
  count: number;
  lastAskedAt: string;
  resolvedAt: string | null;
  resolvedQaId: string | null;
  createdAt: string;
};

export type ChatbotAskResult = {
  answer: string;
  matched: boolean;
  qaId: string | null;
  question: string | null;
  confidence: number;
  quickReplies: string[];
};

export type PublicChatbotBootstrap = {
  welcome: string;
  quickReplies: string[];
};
