"use client";

import Link from "next/link";
import {
  Bell,
  CheckCheck,
  FileText,
  Loader2,
  Package,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  useAdminNotificationMutations,
  useAdminNotifications,
  useAdminUnreadCount,
} from "@/hooks/use-admin-notifications";
import type { AdminNotificationTypeValue } from "@/lib/notifications/schemas";
import { cn } from "@/lib/utils";

const typeIcon: Record<AdminNotificationTypeValue, LucideIcon> = {
  ORDER: ShoppingBag,
  PRODUCT: Package,
  CUSTOMER: Users,
  BLOG: FileText,
  SYSTEM: Bell,
};

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
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { data: unreadCount = 0 } = useAdminUnreadCount();
  const { data, isLoading, refetch } = useAdminNotifications("all", 6);
  const { markAllRead, markRead } = useAdminNotificationMutations();

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (open) void refetch();
  }, [open, refetch]);

  const items = data?.items ?? [];

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-all duration-200 hover:border-brand-green-600/30 hover:bg-brand-green-50 hover:text-brand-green-800",
          open && "border-brand-green-600/30 bg-brand-green-50 text-brand-green-800"
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
          role="menu"
        >
          <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Notifications</p>
              <p className="text-xs text-neutral-500">
                {unreadCount > 0 ? `${unreadCount} unread` : "You’re up to date"}
              </p>
            </div>
            {unreadCount > 0 ? (
              <button
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-green-700 transition-colors hover:bg-brand-green-50 disabled:opacity-50"
                disabled={markAllRead.isPending}
                onClick={() => void markAllRead.mutateAsync()}
                type="button"
              >
                {markAllRead.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="h-3.5 w-3.5" />
                )}
                Mark all
              </button>
            ) : null}
          </div>

          <div className="max-h-[22rem] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin text-brand-green-600" />
                Loading…
              </div>
            ) : null}

            {!isLoading && items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-neutral-300" />
                <p className="mt-2 text-sm font-medium text-neutral-700">No notifications yet</p>
                <p className="mt-1 text-xs text-neutral-500">New alerts will show up here</p>
              </div>
            ) : null}

            {!isLoading
              ? items.map((item) => {
                  const Icon = typeIcon[item.type];
                  const content = (
                    <>
                      <span
                        className={cn(
                          "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          item.isRead
                            ? "bg-neutral-100 text-neutral-500"
                            : "bg-brand-green-100 text-brand-green-700"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start gap-2">
                          <span
                            className={cn(
                              "line-clamp-1 text-sm text-neutral-900",
                              !item.isRead && "font-semibold"
                            )}
                          >
                            {item.title}
                          </span>
                          {!item.isRead ? (
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green-600" />
                          ) : null}
                        </span>
                        <span className="mt-0.5 line-clamp-2 text-xs leading-5 text-neutral-500">
                          {item.message}
                        </span>
                        <span className="mt-1 block text-[11px] text-neutral-400">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </span>
                    </>
                  );

                  const className = cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50",
                    !item.isRead && "bg-brand-green-50/50"
                  );

                  if (item.href) {
                    return (
                      <Link
                        key={item.id}
                        className={className}
                        href={item.href}
                        onClick={() => {
                          setOpen(false);
                          if (!item.isRead) void markRead.mutateAsync(item.id);
                        }}
                        role="menuitem"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      className={className}
                      onClick={() => {
                        if (!item.isRead) void markRead.mutateAsync(item.id);
                      }}
                      role="menuitem"
                      type="button"
                    >
                      {content}
                    </button>
                  );
                })
              : null}
          </div>

          <div className="border-t border-neutral-100 p-2">
            <Link
              className="flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-green-700 transition-colors hover:bg-brand-green-50"
              href="/admin/notifications"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
