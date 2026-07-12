"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import type { CustomerShellUser } from "@/components/customer/customer-header";
import {
  customerLogoutItem,
  customerNavItems,
  isCustomerNavActive,
} from "@/components/customer/customer-nav";
import { cn } from "@/lib/utils";

type MobileNavDrawerProps = {
  open: boolean;
  pathname: string | null;
  user: CustomerShellUser | null;
  onClose: () => void;
};

function displayName(user: CustomerShellUser | null) {
  return user?.name?.trim() || user?.email?.split("@")[0] || "Customer";
}

function initials(user: CustomerShellUser | null) {
  const name = user?.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return (user?.email ?? "WH").slice(0, 2).toUpperCase();
}

export function MobileNavDrawer({ open, pathname, user, onClose }: MobileNavDrawerProps) {
  const LogoutIcon = customerLogoutItem.icon;

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <button
        aria-label="Close navigation overlay"
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        type="button"
      />

      <aside
        aria-label="Account navigation"
        className={cn(
          "absolute inset-y-0 left-0 flex h-full w-[85vw] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-neutral-200 bg-gradient-to-br from-brand-green-50/80 to-white px-5 pb-5 pt-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative flex h-14 w-14 shrink-0 overflow-hidden rounded-full bg-brand-green-100 ring-2 ring-white shadow-sm">
              {user?.avatarUrl ? (
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="56px"
                  src={user.avatarUrl}
                  unoptimized={user.avatarUrl.startsWith("/uploads/")}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-heading text-lg font-bold text-brand-green-700">
                  {initials(user)}
                </span>
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-bold text-neutral-900">
                {displayName(user)}
              </p>
              <p className="truncate text-sm text-neutral-500">{user?.email ?? "—"}</p>
            </div>
          </div>

          <button
            aria-label="Close menu"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-neutral-500 transition-colors duration-200 hover:bg-white/80"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {customerNavItems.map(({ href, label, icon: Icon, unreadCount }) => {
            const active = isCustomerNavActive(pathname, href);

            return (
              <Link
                key={href}
                className={cn(
                  "flex min-h-14 items-center gap-3 rounded-xl px-4 py-4 text-base font-medium transition-colors duration-200",
                  active
                    ? "bg-brand-green-100 text-brand-green-700"
                    : "text-neutral-700 active:bg-neutral-100"
                )}
                href={href}
                onClick={onClose}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{label}</span>
                {unreadCount ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-green-600 px-1.5 text-[11px] font-semibold text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-neutral-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <LogoutButton
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-600 px-4 py-3 text-sm font-semibold text-red-600 transition-colors duration-200 active:bg-red-50"
            onClick={onClose}
          >
            <LogoutIcon className="h-4 w-4" />
            {customerLogoutItem.label}
          </LogoutButton>
        </div>
      </aside>
    </div>
  );
}
