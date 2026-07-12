"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import {
  submitContactMessageSchema,
  updateContactMessageSchema,
  type AdminContactMessage,
  type ContactMessageFilter,
  type SubmitContactMessageInput,
  type UpdateContactMessageInput,
} from "@/lib/messages/schemas";
import { createAdminNotification } from "@/lib/notifications/actions";
import { prisma } from "@/lib/prisma";

export type MessageActionResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function handleError<T = undefined>(error: unknown): MessageActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") return { error: "Message not found." };
  }
  console.error("Message action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

function toDto(row: {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  adminNotes: string | null;
  source: string;
  repliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): AdminContactMessage {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status,
    adminNotes: row.adminNotes,
    source: row.source,
    repliedAt: row.repliedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function revalidateMessages() {
  revalidatePath("/admin/messages");
  revalidatePath("/admin", "layout");
}

/** Public — no auth. Contact page + homepage contact section. */
export async function submitContactMessageAction(
  input: SubmitContactMessageInput
): Promise<MessageActionResult<{ id: string }>> {
  try {
    const parsed = submitContactMessageSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid message." };
    }

    const row = await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email.toLowerCase(),
        subject: parsed.data.subject,
        message: parsed.data.message,
        source: parsed.data.source,
        status: "NEW",
      },
    });

    await createAdminNotification({
      type: "CUSTOMER",
      title: "New contact message",
      message: `${parsed.data.name}: ${parsed.data.subject}`,
      href: `/admin/messages?id=${row.id}`,
    });

    revalidateMessages();
    return {
      data: { id: row.id },
      success: "Message sent. We’ll get back to you soon.",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function listContactMessagesAction(input?: {
  filter?: ContactMessageFilter;
}): Promise<
  MessageActionResult<{ items: AdminContactMessage[]; unreadCount: number }>
> {
  try {
    await requireAdmin();
    const filter = input?.filter ?? "all";

    const where =
      filter === "new"
        ? { status: "NEW" as const }
        : filter === "read"
          ? { status: "READ" as const }
          : filter === "replied"
            ? { status: "REPLIED" as const }
            : filter === "archived"
              ? { status: "ARCHIVED" as const }
              : { status: { not: "ARCHIVED" as const } };

    const [items, unreadCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.contactMessage.count({ where: { status: "NEW" } }),
    ]);

    return { data: { items: items.map(toDto), unreadCount } };
  } catch (error) {
    return handleError(error);
  }
}

export async function getContactUnreadCountAction(): Promise<
  MessageActionResult<{ unreadCount: number }>
> {
  try {
    await requireAdmin();
    const unreadCount = await prisma.contactMessage.count({
      where: { status: "NEW" },
    });
    return { data: { unreadCount } };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateContactMessageAction(
  id: string,
  input: UpdateContactMessageInput
): Promise<MessageActionResult<AdminContactMessage>> {
  try {
    await requireAdmin();
    const parsed = updateContactMessageSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid update." };
    }

    const data: Prisma.ContactMessageUpdateInput = {};
    if (parsed.data.status) {
      data.status = parsed.data.status;
      if (parsed.data.status === "REPLIED") {
        data.repliedAt = new Date();
      }
    }
    if (parsed.data.adminNotes !== undefined) {
      data.adminNotes = parsed.data.adminNotes?.trim() || null;
    }

    const row = await prisma.contactMessage.update({ where: { id }, data });
    revalidateMessages();
    return { data: toDto(row), success: "Message updated." };
  } catch (error) {
    return handleError(error);
  }
}

export async function markContactMessageReadAction(
  id: string
): Promise<MessageActionResult<AdminContactMessage>> {
  try {
    await requireAdmin();
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) return { error: "Message not found." };
    if (existing.status !== "NEW") return { data: toDto(existing) };

    const row = await prisma.contactMessage.update({
      where: { id },
      data: { status: "READ" },
    });
    revalidateMessages();
    return { data: toDto(row) };
  } catch (error) {
    return handleError(error);
  }
}

export async function markAllContactMessagesReadAction(): Promise<MessageActionResult> {
  try {
    await requireAdmin();
    await prisma.contactMessage.updateMany({
      where: { status: "NEW" },
      data: { status: "READ" },
    });
    revalidateMessages();
    return { success: "All messages marked as read." };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteContactMessageAction(
  id: string
): Promise<MessageActionResult> {
  try {
    await requireAdmin();
    await prisma.contactMessage.delete({ where: { id } });
    revalidateMessages();
    return { success: "Message deleted." };
  } catch (error) {
    return handleError(error);
  }
}
