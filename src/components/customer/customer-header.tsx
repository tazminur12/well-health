"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Heart,
  LogOut,
  Menu,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { getCustomerPageTitle } from "@/components/customer/customer-nav";
import type { AuthUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export type CustomerShellUser = Pick<
  AuthUser,
  "id" | "email" | "name" | "avatarUrl" | "phone" | "role"
>;

type CustomerMobileHeaderProps = {
  pathname: string | null;
  user: CustomerShellUser | null;
  onOpenMenu: () => void;
};

type CustomerDesktopTopbarProps = {
  pathname: string | null;
  user: CustomerShellUser | null;
};

function displayName(user: CustomerShellUser | null) {
  return user?.name?.trim() || user?.email?.split("@")[0] || "Customer";
}

function customerInitials(user: CustomerShellUser | null) {
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

function CustomerAvatar({
  user,
  className,
  textClassName = "text-[11px] font-bold text-brand-green-700",
}: {
  user: CustomerShellUser | null;
  className: string;
  textClassName?: string;
}) {
  if (user?.avatarUrl) {
    return (
      <span className={cn("relative overflow-hidden rounded-full bg-brand-green-100", className)}>
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="40px"
          src={user.avatarUrl}
          unoptimized={user.avatarUrl.startsWith("/uploads/")}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-brand-green-100 font-heading",
        textClassName,
        className
      )}
    >
      {customerInitials(user)}
    </span>
  );
}

function AccountMenu({
  user,
  compact = false,
}: {
  user: CustomerShellUser | null;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const name = displayName(user);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className={cn(
          "inline-flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white text-left shadow-sm transition-all duration-200 hover:border-brand-green-600/25 hover:bg-brand-green-50/40",
          compact ? "h-10 w-10 justify-center p-0" : "max-w-[220px] py-1.5 pl-1.5 pr-2.5",
          open && "border-brand-green-600/30 bg-brand-green-50/50 ring-2 ring-brand-green-600/10"
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <CustomerAvatar
          className={cn("h-9 w-9 shrink-0 ring-2 ring-white", compact && "h-8 w-8")}
          user={user}
        />
        {!compact ? (
          <>
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-sm font-semibold text-neutral-900">{name}</span>
              <span className="block truncate text-xs text-neutral-500">Customer</span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200",
                open && "rotate-180 text-brand-green-700"
              )}
            />
          </>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
          role="menu"
        >
          <div className="border-b border-neutral-100 bg-gradient-to-br from-brand-green-50/80 to-white px-4 py-3.5">
            <div className="flex items-center gap-3">
              <CustomerAvatar
                className="h-11 w-11 shrink-0 shadow-sm ring-2 ring-white"
                textClassName="text-xs font-bold text-brand-green-700"
                user={user}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900">{name}</p>
                <p className="truncate text-xs text-neutral-500">{user?.email ?? "—"}</p>
                <p className="mt-1 inline-flex rounded-full bg-brand-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-green-800">
                  Member
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-0.5 p-1.5">
            <Link
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-brand-green-50 hover:text-brand-green-900"
              href="/profile"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                <UserRound className="h-4 w-4" />
              </span>
              My Profile
            </Link>
            <Link
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-brand-green-50 hover:text-brand-green-900"
              href="/orders"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                <ShoppingBag className="h-4 w-4" />
              </span>
              My Orders
            </Link>
            <Link
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-brand-green-50 hover:text-brand-green-900"
              href="/wishlist"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                <Heart className="h-4 w-4" />
              </span>
              Wishlist
            </Link>
          </div>

          <div className="border-t border-neutral-100 p-1.5">
            <LogoutButton
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <LogOut className="h-4 w-4" />
              </span>
              Logout
            </LogoutButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CustomerMobileHeader({
  pathname,
  user,
  onOpenMenu,
}: CustomerMobileHeaderProps) {
  const title = getCustomerPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-md md:hidden">
      <div className="flex h-14 items-center justify-between gap-2 px-3">
        <button
          aria-label="Open menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-all duration-200 active:bg-neutral-100"
          onClick={onOpenMenu}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="truncate font-heading text-base font-semibold text-neutral-900">{title}</h1>

        <AccountMenu compact user={user} />
      </div>
    </header>
  );
}

export function CustomerDesktopTopbar({ pathname, user }: CustomerDesktopTopbarProps) {
  const title = getCustomerPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 hidden border-b border-neutral-200/80 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-md md:block">
      <div className="flex h-[4.25rem] items-center justify-between gap-4 px-6 lg:px-8">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span>My Account</span>
            <ChevronRight className="h-3 w-3" />
            <span className="truncate font-medium text-brand-green-700">{title}</span>
          </div>
          <h1 className="truncate font-heading text-lg font-bold tracking-tight text-neutral-900">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            className="hidden items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 shadow-sm transition-all duration-200 hover:border-brand-green-600/30 hover:bg-brand-green-50 hover:text-brand-green-800 lg:inline-flex"
            href="/shop"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Browse shop
          </Link>

          <div className="hidden h-8 w-px bg-neutral-200 sm:block" aria-hidden />

          <AccountMenu user={user} />
        </div>
      </div>
    </header>
  );
}
