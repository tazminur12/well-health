"use server";

import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdminPermission } from "@/lib/admin/require-admin";
import {
  CHATBOT_FALLBACK_ANSWER,
  findBestQaMatch,
  normalizeChatText,
  type MatchableQa,
} from "@/lib/chatbot/match";
import {
  askChatbotSchema,
  chatbotQaInputSchema,
  type AdminChatbotQa,
  type AdminChatbotUnanswered,
  type ChatbotAskResult,
  type ChatbotQaInput,
  type PublicChatbotBootstrap,
} from "@/lib/chatbot/schemas";
import { prisma } from "@/lib/prisma";
import { rateLimitForRequest } from "@/lib/rate-limit/server";

export type ChatbotActionResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function handleError<T = undefined>(error: unknown): ChatbotActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  console.error("Chatbot action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Chatbot action failed.",
  };
}

function revalidateChatbot() {
  revalidatePath("/admin/chatbot");
}

function mapQa(row: {
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
  createdAt: Date;
  updatedAt: Date;
}): AdminChatbotQa {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    aliases: row.aliases,
    keywords: row.keywords,
    category: row.category,
    isActive: row.isActive,
    isQuickReply: row.isQuickReply,
    sortOrder: row.sortOrder,
    hitCount: row.hitCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toMatchable(row: AdminChatbotQa | MatchableQa): MatchableQa {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    aliases: row.aliases,
    keywords: row.keywords,
    category: row.category,
  };
}

async function loadActiveQas(): Promise<MatchableQa[]> {
  const rows = await prisma.chatbotQa.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { hitCount: "desc" }],
  });
  return rows.map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    aliases: row.aliases,
    keywords: row.keywords,
    category: row.category,
  }));
}

async function logUnanswered(question: string) {
  const normalized = normalizeChatText(question).slice(0, 300);
  if (normalized.length < 2) return;

  await prisma.chatbotUnanswered.upsert({
    where: { normalized },
    create: {
      question: question.trim().slice(0, 500),
      normalized,
      count: 1,
      lastAskedAt: new Date(),
    },
    update: {
      question: question.trim().slice(0, 500),
      count: { increment: 1 },
      lastAskedAt: new Date(),
      resolvedAt: null,
      resolvedQaId: null,
    },
  });
}

export async function listChatbotQasAction(): Promise<
  ChatbotActionResult<AdminChatbotQa[]>
> {
  try {
    await requireAdminPermission("chatbot");
    const rows = await prisma.chatbotQa.findMany({
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });
    return { data: rows.map(mapQa) };
  } catch (error) {
    return handleError(error);
  }
}

export async function createChatbotQaAction(
  input: ChatbotQaInput
): Promise<ChatbotActionResult<AdminChatbotQa>> {
  try {
    await requireAdminPermission("chatbot");
    const parsed = chatbotQaInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid Q&A" };
    }

    const count = await prisma.chatbotQa.count();
    const row = await prisma.chatbotQa.create({
      data: {
        question: parsed.data.question,
        answer: parsed.data.answer,
        aliases: parsed.data.aliases,
        keywords: parsed.data.keywords,
        category: parsed.data.category?.trim() || null,
        isActive: parsed.data.isActive,
        isQuickReply: parsed.data.isQuickReply,
        sortOrder: parsed.data.sortOrder ?? count,
      },
    });

    revalidateChatbot();
    return { data: mapQa(row), success: "Q&A created." };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateChatbotQaAction(
  id: string,
  input: ChatbotQaInput
): Promise<ChatbotActionResult<AdminChatbotQa>> {
  try {
    await requireAdminPermission("chatbot");
    const parsed = chatbotQaInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid Q&A" };
    }

    const row = await prisma.chatbotQa.update({
      where: { id },
      data: {
        question: parsed.data.question,
        answer: parsed.data.answer,
        aliases: parsed.data.aliases,
        keywords: parsed.data.keywords,
        category: parsed.data.category?.trim() || null,
        isActive: parsed.data.isActive,
        isQuickReply: parsed.data.isQuickReply,
        sortOrder: parsed.data.sortOrder,
      },
    });

    revalidateChatbot();
    return { data: mapQa(row), success: "Q&A updated." };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteChatbotQaAction(
  id: string
): Promise<ChatbotActionResult> {
  try {
    await requireAdminPermission("chatbot");
    await prisma.chatbotQa.delete({ where: { id } });
    revalidateChatbot();
    return { success: "Q&A deleted." };
  } catch (error) {
    return handleError(error);
  }
}

export async function toggleChatbotQaActiveAction(
  id: string
): Promise<ChatbotActionResult<AdminChatbotQa>> {
  try {
    await requireAdminPermission("chatbot");
    const existing = await prisma.chatbotQa.findUnique({ where: { id } });
    if (!existing) return { error: "Q&A not found." };
    const row = await prisma.chatbotQa.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    revalidateChatbot();
    return { data: mapQa(row) };
  } catch (error) {
    return handleError(error);
  }
}

export async function listChatbotUnansweredAction(): Promise<
  ChatbotActionResult<AdminChatbotUnanswered[]>
> {
  try {
    await requireAdminPermission("chatbot");
    const rows = await prisma.chatbotUnanswered.findMany({
      where: { resolvedAt: null },
      orderBy: [{ count: "desc" }, { lastAskedAt: "desc" }],
      take: 100,
    });
    return {
      data: rows.map((row) => ({
        id: row.id,
        question: row.question,
        normalized: row.normalized,
        count: row.count,
        lastAskedAt: row.lastAskedAt.toISOString(),
        resolvedAt: row.resolvedAt?.toISOString() ?? null,
        resolvedQaId: row.resolvedQaId,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function dismissChatbotUnansweredAction(
  id: string
): Promise<ChatbotActionResult> {
  try {
    await requireAdminPermission("chatbot");
    await prisma.chatbotUnanswered.update({
      where: { id },
      data: { resolvedAt: new Date() },
    });
    revalidateChatbot();
    return { success: "Marked as resolved." };
  } catch (error) {
    return handleError(error);
  }
}

export async function createQaFromUnansweredAction(
  unansweredId: string,
  input: ChatbotQaInput
): Promise<ChatbotActionResult<AdminChatbotQa>> {
  try {
    await requireAdminPermission("chatbot");
    const unanswered = await prisma.chatbotUnanswered.findUnique({
      where: { id: unansweredId },
    });
    if (!unanswered) return { error: "Unanswered item not found." };

    const parsed = chatbotQaInputSchema.safeParse({
      ...input,
      question: input.question?.trim() || unanswered.question,
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid Q&A" };
    }

    const count = await prisma.chatbotQa.count();
    const row = await prisma.$transaction(async (tx) => {
      const created = await tx.chatbotQa.create({
        data: {
          question: parsed.data.question,
          answer: parsed.data.answer,
          aliases: parsed.data.aliases,
          keywords: parsed.data.keywords,
          category: parsed.data.category?.trim() || null,
          isActive: parsed.data.isActive,
          isQuickReply: parsed.data.isQuickReply,
          sortOrder: parsed.data.sortOrder ?? count,
        },
      });
      await tx.chatbotUnanswered.update({
        where: { id: unansweredId },
        data: {
          resolvedAt: new Date(),
          resolvedQaId: created.id,
        },
      });
      return created;
    });

    revalidateChatbot();
    return { data: mapQa(row), success: "Trained from unanswered question." };
  } catch (error) {
    return handleError(error);
  }
}

export async function testChatbotMatchAction(
  message: string
): Promise<ChatbotActionResult<{ score: number; confidence: number; qa: AdminChatbotQa | null; answer: string }>> {
  try {
    await requireAdminPermission("chatbot");
    const trimmed = message.trim();
    if (!trimmed) return { error: "Enter a test message." };

    const active = await prisma.chatbotQa.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }],
    });
    const match = findBestQaMatch(trimmed, active.map(mapQa).map(toMatchable));
    if (!match) {
      return {
        data: {
          score: 0,
          confidence: 0,
          qa: null,
          answer: CHATBOT_FALLBACK_ANSWER,
        },
      };
    }
    const full = active.find((row) => row.id === match.qa.id)!;
    return {
      data: {
        score: match.score,
        confidence: match.confidence,
        qa: mapQa(full),
        answer: full.answer,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

/** Public bootstrap — welcome + quick reply chips. */
export async function getChatbotBootstrapAction(): Promise<
  ChatbotActionResult<PublicChatbotBootstrap>
> {
  try {
    const quick = await prisma.chatbotQa.findMany({
      where: { isActive: true, isQuickReply: true },
      orderBy: [{ sortOrder: "asc" }],
      take: 6,
      select: { question: true },
    });
    return {
      data: {
        welcome:
          "Hello! Welcome to Well Health Trade International. Ask about products, delivery, COD, or tracking — I’ll answer from our trained help topics.",
        quickReplies: quick.map((item) => item.question),
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

/** Public ask — rate limited. */
export async function askChatbotAction(
  input: unknown
): Promise<ChatbotActionResult<ChatbotAskResult>> {
  try {
    const rateLimited = await rateLimitForRequest("chatbot:ask");
    if (rateLimited) return { error: rateLimited.error };

    const parsed = askChatbotSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid message." };
    }

    const message = parsed.data.message;
    const active = await loadActiveQas();
    const match = findBestQaMatch(message, active);

    const quickRows = await prisma.chatbotQa.findMany({
      where: { isActive: true, isQuickReply: true },
      orderBy: [{ sortOrder: "asc" }],
      take: 4,
      select: { question: true },
    });
    const quickReplies = quickRows.map((row) => row.question);

    if (!match) {
      await logUnanswered(message);
      return {
        data: {
          answer: CHATBOT_FALLBACK_ANSWER,
          matched: false,
          qaId: null,
          question: null,
          confidence: 0,
          quickReplies,
        },
      };
    }

    await prisma.chatbotQa.update({
      where: { id: match.qa.id },
      data: { hitCount: { increment: 1 } },
    });

    return {
      data: {
        answer: match.qa.answer,
        matched: true,
        qaId: match.qa.id,
        question: match.qa.question,
        confidence: match.confidence,
        quickReplies,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
