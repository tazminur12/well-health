"use client";

import Link from "next/link";
import {
  Bell,
  CheckCheck,
  FileText,
  Loader2,
  Package,
  ShoppingBag,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  useAdminNotificationMutations,
  useAdminNotifications,
} from "@/hooks/use-admin-notifications";
import { showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import type {
  AdminNotificationDto,
  AdminNotificationTypeValue,
  NotificationFilter,
} from "@/lib/notifications/schemas";
import { cn } from "@/lib/utils";

const typeMeta: Record<
  AdminNotificationTypeValue,
  { label: string; icon: LucideIcon; tone: string }
> = {
  ORDER: {
    label: "Order",
    icon: ShoppingBag,
    tone: "bg-blue-100 text-blue-700",
  },
  PRODUCT: {
    label: "Product",
    icon: Package,
    tone: "bg-amber-100 text-amber-800",
  },
  CUSTOMER: {
    label: "Customer",
    icon: Users,
    tone: "bg-purple-100 text-purple-700",
  },
  BLOG: {
    label: "Blog",
    icon: FileText,
    tone: "bg-emerald-100 text-emerald-800",
  },
  SYSTEM: {
    label: "System",
    icon: Bell,
    tone: "bg-neutral-100 text-neutral-700",
  },
};

const filters: { id: NotificationFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
];

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminNotificationsPage() {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const { data, isLoading, isError, error, refetch } = useAdminNotifications(filter);
  const { markRead, markAllRead, remove } = useAdminNotificationMutations();

  async function handleMarkAll() {
    try {
      const result = await markAllRead.mutateAsync();
      await showAdminSuccess(
        "All caught up",
        result.count
          ? `${result.count} notification${result.count === 1 ? "" : "s"} marked as read.`
          : "No unread notifications."
      );
    } catch (err) {
      await showAdminError(
        "Couldn’t update",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await markRead.mutateAsync(id);
    } catch (err) {
      await showAdminError(
        "Couldn’t update",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  async function handleDelete(id: string) {
    try {
      await remove.mutateAsync(id);
      await showAdminSuccess("Deleted", "Notification removed.");
    } catch (err) {
      await showAdminError(
        "Couldn’t delete",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900">Notifications</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Orders, catalog alerts, and system updates in one place
            {unreadCount > 0 ? (
              <>
                {" "}
                ·{" "}
                <span className="font-semibold text-brand-green-700">
                  {unreadCount} unread
                </span>
              </>
            ) : null}
          </p>
        </div>
        <Button
          className="h-10 rounded-xl bg-brand-green-600 text-white hover:bg-brand-green-900"
          disabled={markAllRead.isPending || unreadCount === 0}
          onClick={() => void handleMarkAll()}
          type="button"
        >
          {markAllRead.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCheck className="h-4 w-4" />
          )}
          Mark all read
        </Button>
      </header>

      <div className="inline-flex rounded-xl border border-neutral-200 bg-white p-1 shadow-sm">
        {filters.map((item) => (
          <button
            key={item.id}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              filter === item.id
                ? "bg-brand-green-100 text-brand-green-900"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            )}
            onClick={() => setFilter(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white text-sm text-neutral-500 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
          Loading notifications…
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h2 className="font-heading text-xl font-bold text-neutral-900">
            Couldn’t load notifications
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
          <Button className="mt-5 rounded-xl" onClick={() => void refetch()} type="button">
            Try again
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green-100 text-brand-green-700">
            <Bell className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-heading text-lg font-bold text-neutral-900">
            You’re all caught up
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
            {filter === "unread"
              ? "No unread notifications right now."
              : "New order and catalog alerts will appear here."}
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && items.length > 0 ? (
        <ul className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={cn(
                index > 0 && "border-t border-neutral-100",
                !item.isRead && "bg-brand-green-50/40"
              )}
            >
              <NotificationRow
                item={item}
                onDelete={() => void handleDelete(item.id)}
                onMarkRead={() => void handleMarkRead(item.id)}
                busy={markRead.isPending || remove.isPending}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function NotificationRow({
  item,
  onMarkRead,
  onDelete,
  busy,
}: {
  item: AdminNotificationDto;
  onMarkRead: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const meta = typeMeta[item.type];
  const Icon = meta.icon;

  const body = (
    <div className="flex min-w-0 flex-1 gap-3">
      <span
        className={cn(
          "mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          meta.tone
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "truncate text-sm text-neutral-900",
              !item.isRead ? "font-semibold" : "font-medium"
            )}
          >
            {item.title}
          </p>
          {!item.isRead ? (
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-green-600" />
          ) : null}
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            {meta.label}
          </span>
        </div>
        <p className="mt-1 text-sm leading-6 text-neutral-500">{item.message}</p>
        <p className="mt-1.5 text-xs text-neutral-400">{formatRelativeTime(item.createdAt)}</p>
      </div>
    </div>
  );

  return (
    <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
      {item.href ? (
        <Link
          className="min-w-0 flex-1 transition-opacity hover:opacity-90"
          href={item.href}
          onClick={() => {
            if (!item.isRead) onMarkRead();
          }}
        >
          {body}
        </Link>
      ) : (
        body
      )}

      <div className="flex shrink-0 items-center gap-1">
        {!item.isRead ? (
          <button
            aria-label="Mark as read"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-brand-green-100 hover:text-brand-green-800 disabled:opacity-50"
            disabled={busy}
            onClick={onMarkRead}
            title="Mark as read"
            type="button"
          >
            <CheckCheck className="h-4 w-4" />
          </button>
        ) : null}
        <button
          aria-label="Delete notification"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          disabled={busy}
          onClick={onDelete}
          title="Delete"
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
