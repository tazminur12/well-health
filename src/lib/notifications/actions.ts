"use server";

import { revalidatePath } from "next/cache";
import type { AdminNotification, AdminNotificationType } from "@prisma/client";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import type {
  AdminNotificationDto,
  NotificationFilter,
} from "@/lib/notifications/schemas";
import { prisma } from "@/lib/prisma";

export type NotificationActionResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function handleError<T = undefined>(error: unknown): NotificationActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  console.error("Notification action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

function toDto(row: AdminNotification): AdminNotificationDto {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    href: row.href,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  };
}

function revalidateNotifications() {
  revalidatePath("/admin/notifications");
  revalidatePath("/admin", "layout");
}

export async function listAdminNotificationsAction(input?: {
  filter?: NotificationFilter;
  limit?: number;
}): Promise<
  NotificationActionResult<{
    items: AdminNotificationDto[];
    unreadCount: number;
  }>
> {
  try {
    await requireAdmin();
    const filter = input?.filter ?? "all";
    const limit = Math.min(Math.max(input?.limit ?? 50, 1), 100);

    const where =
      filter === "unread"
        ? { isRead: false }
        : filter === "read"
          ? { isRead: true }
          : {};

    const [items, unreadCount] = await Promise.all([
      prisma.adminNotification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.adminNotification.count({ where: { isRead: false } }),
    ]);

    return {
      data: {
        items: items.map(toDto),
        unreadCount,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getAdminUnreadNotificationCountAction(): Promise<
  NotificationActionResult<{ unreadCount: number }>
> {
  try {
    await requireAdmin();
    const unreadCount = await prisma.adminNotification.count({
      where: { isRead: false },
    });
    return { data: { unreadCount } };
  } catch (error) {
    return handleError(error);
  }
}

export async function markNotificationReadAction(
  id: string
): Promise<NotificationActionResult<AdminNotificationDto>> {
  try {
    await requireAdmin();
    const updated = await prisma.adminNotification.update({
      where: { id },
      data: { isRead: true },
    });
    revalidateNotifications();
    return { data: toDto(updated), success: "Marked as read" };
  } catch (error) {
    return handleError(error);
  }
}

export async function markAllNotificationsReadAction(): Promise<
  NotificationActionResult<{ count: number }>
> {
  try {
    await requireAdmin();
    const result = await prisma.adminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    revalidateNotifications();
    return { data: { count: result.count }, success: "All notifications marked as read" };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteNotificationAction(
  id: string
): Promise<NotificationActionResult> {
  try {
    await requireAdmin();
    await prisma.adminNotification.delete({ where: { id } });
    revalidateNotifications();
    return { success: "Notification deleted" };
  } catch (error) {
    return handleError(error);
  }
}

/** Internal helper for future order/product events — also used by seed. */
export async function createAdminNotification(input: {
  type: AdminNotificationType;
  title: string;
  message: string;
  href?: string | null;
}) {
  return prisma.adminNotification.create({
    data: {
      type: input.type,
      title: input.title,
      message: input.message,
      href: input.href ?? null,
    },
  });
}
