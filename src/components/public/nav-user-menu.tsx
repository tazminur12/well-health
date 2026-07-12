"use client";

import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

export type NavAuthUser = {
  name: string | null;
  email: string;
  role: "CUSTOMER" | "ADMIN" | "SUPPORT";
};

function getInitials(name: string | null, email: string) {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function dashboardHref(role: NavAuthUser["role"]) {
  return role === "ADMIN" ? "/admin" : "/dashboard";
}

type NavUserMenuProps = {
  user: NavAuthUser;
  /** Compact avatar-only trigger for tight header space */
  compact?: boolean;
  onNavigate?: () => void;
  className?: string;
};

export function NavUserMenu({ user, compact = false, onNavigate, className }: NavUserMenuProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(user.name, user.email);
  const displayName = user.name?.trim() || user.email;
  const dashHref = dashboardHref(user.role);

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

  function handleLogout() {
    setOpen(false);
    onNavigate?.();
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-brand-green-100 bg-white text-neutral-900 shadow-sm transition-all duration-200 hover:border-brand-green-600/30 hover:text-brand-green-600 active:scale-[0.98]",
          compact ? "h-11 w-11 justify-center" : "h-11 pl-1.5 pr-2.5"
        )}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-green-600 text-xs font-bold tracking-wide text-white">
          {initials}
        </span>
        {!compact ? (
          <>
            <span className="hidden max-w-[7.5rem] truncate text-sm font-semibold lg:inline">
              {displayName}
            </span>
            <ChevronDown
              className={cn("h-4 w-4 text-neutral-400 transition-transform", open && "rotate-180")}
            />
          </>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-neutral-200 bg-white py-1.5 shadow-lg"
          role="menu"
        >
          <div className="border-b border-neutral-100 px-3.5 py-2.5">
            <p className="truncate text-sm font-semibold text-neutral-900">{displayName}</p>
            <p className="truncate text-xs text-neutral-500">{user.email}</p>
          </div>
          <Link
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-brand-green-100/60 hover:text-brand-green-900"
            href={dashHref}
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            role="menuitem"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <button
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
            disabled={isPending}
            onClick={handleLogout}
            role="menuitem"
            type="button"
          >
            <LogOut className="h-4 w-4" />
            {isPending ? "Signing out…" : "Logout"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

type NavLoginButtonProps = {
  className?: string;
  onClick?: () => void;
};

export function NavLoginButton({ className, onClick }: NavLoginButtonProps) {
  return (
    <Link
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-green-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-green-900 active:scale-[0.98]",
        className
      )}
      href="/login"
      onClick={onClick}
    >
      Login
    </Link>
  );
}
