"use client";

import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import type { CustomerShellUser } from "@/components/customer/customer-header";
import {
  customerLogoutItem,
  customerNavItems,
  isCustomerNavActive,
} from "@/components/customer/customer-nav";
import { cn } from "@/lib/utils";

type CustomerSidebarProps = {
  pathname: string | null;
  user: CustomerShellUser | null;
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

export function CustomerSidebar({ pathname, user }: CustomerSidebarProps) {
  const LogoutIcon = customerLogoutItem.icon;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-neutral-200 bg-white md:flex">
      <div className="flex h-[4.25rem] items-center gap-3 border-b border-neutral-200 px-5">
        <Link className="flex min-w-0 items-center gap-3" href="/dashboard">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green-100 text-brand-green-600">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-heading text-sm font-bold tracking-[0.16em] text-brand-green-900">
              WELL HEALTH
            </span>
            <span className="block text-xs text-neutral-500">My Account</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {customerNavItems.map(({ href, label, icon: Icon, unreadCount }) => {
          const active = isCustomerNavActive(pathname, href);

          return (
            <Link
              key={href}
              className={cn(
                "relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-brand-green-100 text-brand-green-700 shadow-sm ring-1 ring-brand-green-600/10"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              )}
              href={href}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{label}</span>
              {unreadCount ? (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-green-600 px-1.5 text-[11px] font-semibold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-neutral-200 p-3">
        <Link
          className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-gradient-to-br from-brand-green-50/70 to-white p-2.5 transition-colors duration-200 hover:border-brand-green-600/25"
          href="/profile"
        >
          <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-green-100 ring-2 ring-white">
            {user?.avatarUrl ? (
              <Image
                alt=""
                className="object-cover"
                fill
                sizes="40px"
                src={user.avatarUrl}
                unoptimized={user.avatarUrl.startsWith("/uploads/")}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-heading text-xs font-bold text-brand-green-700">
                {initials(user)}
              </span>
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-neutral-900">
              {displayName(user)}
            </span>
            <span className="block truncate text-xs text-neutral-500">{user?.email ?? "—"}</span>
          </span>
        </Link>

        <LogoutButton className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600">
          <LogoutIcon className="h-5 w-5 shrink-0" />
          <span>{customerLogoutItem.label}</span>
        </LogoutButton>
      </div>
    </aside>
  );
}
