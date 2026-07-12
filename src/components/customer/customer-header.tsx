"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Menu } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import {
  dummyCustomer,
  getCustomerPageTitle,
} from "@/components/customer/customer-nav";
import { cn } from "@/lib/utils";

type CustomerMobileHeaderProps = {
  pathname: string | null;
  onOpenMenu: () => void;
};

type CustomerDesktopTopbarProps = {
  pathname: string | null;
};

function AccountMenu({
  showChevron = false,
  showName = false,
}: {
  showChevron?: boolean;
  showName?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-full transition-colors duration-200 active:bg-neutral-100",
          showName ? "border border-neutral-200 py-1 pl-1 pr-3" : "min-w-11",
          open && "bg-neutral-100"
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green-100 font-heading text-xs font-bold text-brand-green-600">
          {dummyCustomer.initials}
        </span>
        {showName ? (
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold text-neutral-900">{dummyCustomer.name}</span>
            <span className="block text-xs text-neutral-500">Customer</span>
          </span>
        ) : null}
        {showChevron ? <ChevronDown className="h-4 w-4 text-neutral-500" /> : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-md"
          role="menu"
        >
          <div className="border-b border-neutral-200 px-4 py-3">
            <p className="truncate text-sm font-semibold text-neutral-900">{dummyCustomer.name}</p>
            <p className="truncate text-xs text-neutral-500">{dummyCustomer.email}</p>
          </div>
          <Link
            className="block px-4 py-3 text-sm text-neutral-700 transition-colors duration-200 active:bg-neutral-50 hover:bg-neutral-50"
            href="/profile"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            Profile
          </Link>
          <LogoutButton
            className="block w-full px-4 py-3 text-left text-sm text-red-600 transition-colors duration-200 active:bg-red-50 hover:bg-red-50"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            Logout
          </LogoutButton>
        </div>
      ) : null}
    </div>
  );
}

export function CustomerMobileHeader({ pathname, onOpenMenu }: CustomerMobileHeaderProps) {
  const title = getCustomerPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white md:hidden">
      <div className="flex h-14 items-center justify-between gap-2 px-3">
        <button
          aria-label="Open menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-neutral-700 transition-colors duration-200 active:bg-neutral-100"
          onClick={onOpenMenu}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="truncate font-heading text-base font-semibold text-neutral-900">{title}</h1>

        <AccountMenu />
      </div>
    </header>
  );
}

export function CustomerDesktopTopbar({ pathname }: CustomerDesktopTopbarProps) {
  const title = getCustomerPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 hidden border-b border-neutral-200 bg-white/95 backdrop-blur-sm md:block">
      <div className="flex h-16 items-center justify-between gap-4 px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-xs text-neutral-500">My Account</p>
          <h1 className="truncate font-heading text-lg font-semibold text-neutral-900">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50"
            type="button"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <AccountMenu showChevron showName />
        </div>
      </div>
    </header>
  );
}
