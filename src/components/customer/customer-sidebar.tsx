"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import {
  customerLogoutItem,
  customerNavItems,
  isCustomerNavActive,
} from "@/components/customer/customer-nav";
import { cn } from "@/lib/utils";

type CustomerSidebarProps = {
  pathname: string | null;
};

export function CustomerSidebar({ pathname }: CustomerSidebarProps) {
  const LogoutIcon = customerLogoutItem.icon;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-neutral-200 bg-white md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-neutral-200 px-5">
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
                "relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "border-l-[3px] border-brand-green-600 bg-brand-green-100 text-brand-green-600"
                  : "border-l-[3px] border-transparent text-neutral-500 active:bg-neutral-100 hover:bg-neutral-50 hover:text-neutral-900"
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

      <div className="border-t border-neutral-200 p-3">
        <LogoutButton className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-500 transition-all duration-200 active:bg-red-50 hover:bg-red-50 hover:text-red-600">
          <LogoutIcon className="h-5 w-5 shrink-0" />
          <span>{customerLogoutItem.label}</span>
        </LogoutButton>
      </div>
    </aside>
  );
}
