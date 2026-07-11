"use client";

import Link from "next/link";

import {
  customerNavItems,
  isCustomerNavActive,
} from "@/components/customer/customer-nav";
import { cn } from "@/lib/utils";

type BottomTabBarProps = {
  pathname: string | null;
};

export function BottomTabBar({ pathname }: BottomTabBarProps) {
  return (
    <nav
      aria-label="Customer primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-16 items-stretch">
        {customerNavItems.map(({ href, shortLabel, label, icon: Icon, unreadCount }) => {
          const active = isCustomerNavActive(pathname, href);

          return (
            <Link
              key={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors duration-200 active:bg-neutral-50",
                active ? "text-brand-green-600" : "text-neutral-500"
              )}
              href={href}
            >
              <span className="relative inline-flex h-6 w-6 items-center justify-center">
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                {unreadCount ? (
                  <span className="absolute -right-1.5 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </span>
              <span className="truncate">{shortLabel ?? label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
