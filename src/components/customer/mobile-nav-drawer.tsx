"use client";

import Link from "next/link";
import { X } from "lucide-react";

import {
  customerLogoutItem,
  customerNavItems,
  dummyCustomer,
  isCustomerNavActive,
} from "@/components/customer/customer-nav";
import { cn } from "@/lib/utils";

type MobileNavDrawerProps = {
  open: boolean;
  pathname: string | null;
  onClose: () => void;
};

export function MobileNavDrawer({ open, pathname, onClose }: MobileNavDrawerProps) {
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
        <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 pb-5 pt-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-green-100 font-heading text-lg font-bold text-brand-green-600">
              {dummyCustomer.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-bold text-neutral-900">
                {dummyCustomer.name}
              </p>
              <p className="truncate text-sm text-neutral-500">{dummyCustomer.email}</p>
            </div>
          </div>

          <button
            aria-label="Close menu"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50"
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
                    ? "bg-brand-green-100 text-brand-green-600"
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
          <Link
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-600 px-4 py-3 text-sm font-semibold text-red-600 transition-colors duration-200 active:bg-red-50"
            href={customerLogoutItem.href}
            onClick={onClose}
          >
            <LogoutIcon className="h-4 w-4" />
            {customerLogoutItem.label}
          </Link>
        </div>
      </aside>
    </div>
  );
}
