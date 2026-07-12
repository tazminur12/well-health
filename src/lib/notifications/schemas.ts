import { z } from "zod";

export const adminNotificationTypes = [
  "ORDER",
  "PRODUCT",
  "CUSTOMER",
  "SYSTEM",
  "BLOG",
] as const;

export type AdminNotificationTypeValue = (typeof adminNotificationTypes)[number];

export const notificationFilterSchema = z.enum(["all", "unread", "read"]);
export type NotificationFilter = z.infer<typeof notificationFilterSchema>;

export type AdminNotificationDto = {
  id: string;
  type: AdminNotificationTypeValue;
  title: string;
  message: string;
  href: string | null;
  isRead: boolean;
  createdAt: string;
};
