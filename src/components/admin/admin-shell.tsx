"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  FileText,
  PanelsTopLeft,
  Package,
  ShoppingBag,
  Settings,
  Shield,
  Users,
  Bell,
  Activity,
  FolderTree,
  Warehouse,
  Ticket,
  MessageSquareQuote,
  Truck,
  BarChart3,
  Megaphone,
  MessagesSquare,
  Handshake,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  UserRound,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { LogoutButton } from "@/components/auth/logout-button";
import { AdminNotificationBell } from "@/components/admin/admin-notification-bell";
import { useAdminDistributorsUnreadCount } from "@/hooks/use-admin-distributors";
import { useAdminMessagesUnreadCount } from "@/hooks/use-admin-messages";
import type { AuthUser } from "@/lib/auth/session";
import type { AdminPermissionKey } from "@/lib/roles/permissions";
import { cn } from "@/lib/utils";

type AdminNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission: AdminPermissionKey;
  unreadCount?: number;
};

type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

const navGroups: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" },
      { href: "/admin/reports", label: "Reports", icon: BarChart3, permission: "reports" },
      { href: "/admin/messages", label: "Messages", icon: MessagesSquare, permission: "messages" },
      { href: "/admin/distributors", label: "Distributors", icon: Handshake, permission: "distributors" },
      { href: "/admin/notifications", label: "Notifications", icon: Bell, permission: "dashboard" },
    ],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package, permission: "products" },
      { href: "/admin/categories", label: "Categories", icon: FolderTree, permission: "categories" },
      { href: "/admin/inventory", label: "Inventory", icon: Warehouse, permission: "inventory" },
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote, permission: "reviews" },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag, permission: "orders" },
      { href: "/admin/payments", label: "Payments", icon: Wallet, permission: "payments" },
      { href: "/admin/customers", label: "Customers", icon: Users, permission: "customers" },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket, permission: "coupons" },
      { href: "/admin/shipping", label: "Shipping", icon: Truck, permission: "shipping" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    items: [
      { href: "/admin/marketing", label: "Campaigns", icon: Megaphone, permission: "marketing" },
      { href: "/admin/blog", label: "Blog", icon: FileText, permission: "blog" },
      { href: "/admin/content", label: "Content", icon: PanelsTopLeft, permission: "content" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { href: "/admin/roles", label: "Roles", icon: Shield, permission: "roles" },
      { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings" },
      { href: "/admin/api-health", label: "API Health", icon: Activity, permission: "settings" },
    ],
  },
];

function isNavItemActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/admin/dashboard") {
    return pathname === "/admin/dashboard" || pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminShellUser = Pick<
  AuthUser,
  "id" | "email" | "name" | "avatarUrl" | "staffRoleName" | "role"
>;

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  user: AdminShellUser | null;
  permissions: AdminPermissionKey[];
  onCloseMobile: () => void;
  onNavigate: () => void;
  onToggleCollapse: () => void;
};

type TopbarProps = {
  collapsed: boolean;
  section: string;
  user: AdminShellUser | null;
  onToggleCollapse: () => void;
};

function adminDisplayName(user: AdminShellUser | null) {
  return user?.name?.trim() || user?.email?.split("@")[0] || "Admin";
}

function adminRoleLabel(user: AdminShellUser | null) {
  return user?.staffRoleName || (user?.role === "ADMIN" ? "Administrator" : "Staff");
}

function adminInitials(user: AdminShellUser | null) {
  const name = user?.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return (user?.email ?? "AD").slice(0, 2).toUpperCase();
}

function AdminAvatar({
  user,
  className,
}: {
  user: AdminShellUser | null;
  className: string;
}) {
  if (user?.avatarUrl) {
    return (
      <span className={cn("relative overflow-hidden rounded-full", className)}>
        <Image alt="" className="object-cover" fill sizes="40px" src={user.avatarUrl} unoptimized />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white",
        className
      )}
    >
      {user ? adminInitials(user) : <CircleUserRound className="h-4 w-4" />}
    </span>
  );
}

export function AdminShell({
  children,
  user = null,
  permissions = [],
}: {
  children: React.ReactNode;
  user?: AdminShellUser | null;
  permissions?: AdminPermissionKey[];
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentSection = useMemo(() => {
    if (pathname?.includes("/products")) return "Products";
    if (pathname?.includes("/categories")) return "Categories";
    if (pathname?.includes("/inventory")) return "Inventory";
    if (pathname?.includes("/reviews")) return "Reviews";
    if (pathname?.includes("/orders/new")) return "Add Order";
    if (pathname?.match(/\/orders\/[^/]+$/)) return "Order Details";
    if (pathname?.includes("/orders")) return "Orders";
    if (pathname?.includes("/payments")) return "Payments";
    if (pathname?.includes("/customers")) return "Customers";
    if (pathname?.includes("/coupons")) return "Coupons";
    if (pathname?.includes("/shipping")) return "Shipping";
    if (pathname?.includes("/reports")) return "Reports";
    if (pathname?.includes("/messages")) return "Messages";
    if (pathname?.includes("/distributors/new")) return "Add Distributor";
    if (pathname?.includes("/distributors")) return "Distributors";
    if (pathname?.includes("/marketing")) return "Marketing";
    if (pathname?.includes("/roles")) return "Roles";
    if (pathname?.includes("/blog")) return "Blog";
    if (pathname?.includes("/content")) return "Content";
    if (pathname?.includes("/profile")) return "Profile";
    if (pathname?.includes("/notifications")) return "Notifications";
    if (pathname?.includes("/api-health")) return "API Health";
    if (pathname?.includes("/settings")) return "Settings";
    return "Dashboard";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onNavigate={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((current) => !current)}
        permissions={permissions}
        user={user}
      />

      <div className={cn("min-h-screen transition-[margin] duration-200", collapsed ? "lg:ml-[72px]" : "lg:ml-[268px]")}>
        <AdminTopbar
          collapsed={collapsed}
          onToggleCollapse={() => {
            if (typeof window !== "undefined" && window.innerWidth < 1024) {
              setMobileOpen(true);
              return;
            }

            setCollapsed((current) => !current);
          }}
          section={currentSection}
          user={user}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>

      {mobileOpen ? (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 cursor-default bg-neutral-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      ) : null}

      <div className="sr-only" aria-live="polite">
        Current admin section: {currentSection}
      </div>
    </div>
  );
}

function AdminSidebar({
  collapsed,
  mobileOpen,
  user,
  permissions,
  onCloseMobile,
  onNavigate,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const canViewMessages = permissions.includes("messages");
  const canViewDistributors = permissions.includes("distributors");
  const { data: messagesUnread = 0 } = useAdminMessagesUnreadCount(canViewMessages);
  const { data: distributorsUnread = 0 } = useAdminDistributorsUnreadCount(canViewDistributors);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.map((group) => [group.id, true]))
  );

  const groups = useMemo(
    () =>
      navGroups
        .map((group) => ({
          ...group,
          items: group.items
            .filter((item) => permissions.includes(item.permission))
            .map((item) => {
              if (item.href === "/admin/messages") {
                return {
                  ...item,
                  unreadCount: messagesUnread > 0 ? messagesUnread : undefined,
                };
              }
              if (item.href === "/admin/distributors") {
                return {
                  ...item,
                  unreadCount: distributorsUnread > 0 ? distributorsUnread : undefined,
                };
              }
              return item;
            }),
        }))
        .filter((group) => group.items.length > 0),
    [distributorsUnread, messagesUnread, permissions]
  );

  function toggleGroup(id: string) {
    setOpenGroups((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-full flex-col bg-gradient-to-b from-brand-green-900 via-[#0A4535] to-[#08382C] text-white shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition-transform duration-200 lg:translate-x-0",
        collapsed ? "w-[72px]" : "w-[268px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="relative overflow-hidden border-b border-white/10 px-4 py-4">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gold-accent/15 blur-2xl"
        />
          <div className="relative flex items-center justify-between gap-3">
            {collapsed ? (
              <BrandLogo
                href="/admin/dashboard"
                onClick={onNavigate}
                size="sm"
                tone="dark"
                variant="mark"
              />
            ) : (
              <BrandLogo
                href="/admin/dashboard"
                onClick={onNavigate}
                size="sm"
                subtitle="Admin Panel"
                tone="dark"
                variant="lockup"
              />
            )}

          <div className="hidden lg:block">
            <button
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
              onClick={onToggleCollapse}
              type="button"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <button
            aria-label="Close mobile sidebar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onCloseMobile}
            type="button"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((group, groupIndex) => {
          const isOpen = collapsed ? true : openGroups[group.id] !== false;
          const hasActive = group.items.some((item) => isNavItemActive(pathname, item.href));

          return (
            <div key={group.id}>
              {collapsed ? (
                groupIndex > 0 ? (
                  <div className="mx-auto mb-3 h-px w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                ) : null
              ) : (
                <button
                  aria-expanded={isOpen}
                  className={cn(
                    "mb-1.5 flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors",
                    hasActive ? "text-gold-accent" : "text-white/45 hover:text-white/75"
                  )}
                  onClick={() => toggleGroup(group.id)}
                  type="button"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    {group.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
              )}

              {isOpen ? (
                <div className="space-y-1">
                  {group.items.map(({ href, label, icon: Icon, unreadCount }) => {
                    const active = isNavItemActive(pathname, href);

                    return (
                      <Link
                        key={href}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200",
                          collapsed && "justify-center px-0",
                          active
                            ? "bg-gradient-to-r from-gold-accent/20 to-gold-accent/5 text-gold-accent shadow-[inset_0_0_0_1px_rgba(201,162,75,0.25)]"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                        href={href}
                        onClick={onNavigate}
                        title={collapsed ? label : undefined}
                      >
                        {active ? (
                          <span
                            aria-hidden
                            className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-gold-accent"
                          />
                        ) : null}

                        <span
                          className={cn(
                            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                            active
                              ? "bg-gold-accent/20 text-gold-accent"
                              : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>

                        {!collapsed ? <span className="truncate">{label}</span> : null}

                        {!collapsed && unreadCount ? (
                          <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-accent/20 px-1.5 text-[11px] font-semibold text-gold-accent">
                            {unreadCount}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 bg-black/10 p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl bg-white/5 p-2 ring-1 ring-white/10",
            collapsed && "justify-center"
          )}
        >
          <Link
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg transition-colors hover:bg-white/5"
            href="/admin/profile"
            onClick={onNavigate}
            title="My profile"
          >
            <AdminAvatar className="h-10 w-10 shrink-0 ring-2 ring-white/10" user={user} />
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {adminDisplayName(user)}
                </p>
                <p className="truncate text-xs text-white/50">{adminRoleLabel(user)}</p>
              </div>
            ) : null}
          </Link>

          {!collapsed ? (
            <LogoutButton
              aria-label="Logout"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </LogoutButton>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function AdminAccountMenu({ user }: { user: AdminShellUser | null }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayName = adminDisplayName(user);
  const roleLabel = adminRoleLabel(user);

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
          "inline-flex max-w-[220px] items-center gap-2.5 rounded-xl border border-neutral-200 bg-white py-1.5 pl-1.5 pr-2.5 text-left shadow-sm transition-all duration-200 hover:border-brand-green-600/25 hover:bg-brand-green-50/40",
          open && "border-brand-green-600/30 bg-brand-green-50/50 ring-2 ring-brand-green-600/10"
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-brand-green-100 text-brand-green-800 ring-2 ring-white">
          {user?.avatarUrl ? (
            <Image alt="" className="object-cover" fill sizes="36px" src={user.avatarUrl} unoptimized />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[11px] font-bold">
              {adminInitials(user)}
            </span>
          )}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-semibold text-neutral-900">{displayName}</span>
          <span className="block truncate text-xs text-neutral-500">{roleLabel}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200",
            open && "rotate-180 text-brand-green-700"
          )}
        />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
          role="menu"
        >
          <div className="border-b border-neutral-100 bg-gradient-to-br from-brand-green-50/80 to-white px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="relative flex h-11 w-11 shrink-0 overflow-hidden rounded-full bg-brand-green-100 text-brand-green-800 ring-2 ring-white shadow-sm">
                {user?.avatarUrl ? (
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="44px"
                    src={user.avatarUrl}
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs font-bold">
                    {adminInitials(user)}
                  </span>
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900">{displayName}</p>
                <p className="truncate text-xs text-neutral-500">{user?.email ?? "—"}</p>
                <p className="mt-1 inline-flex rounded-full bg-brand-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-green-800">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="p-1.5">
            <Link
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-brand-green-50 hover:text-brand-green-900"
              href="/admin/profile"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                <UserRound className="h-4 w-4" />
              </span>
              Profile
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

function AdminTopbar({ collapsed, section, user, onToggleCollapse }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-md">
      <div className="flex h-[4.25rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label={collapsed ? "Open sidebar" : "Toggle sidebar"}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-all duration-200 hover:border-brand-green-600/30 hover:bg-brand-green-50 hover:text-brand-green-800"
            onClick={onToggleCollapse}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="hidden sm:inline">Admin</span>
              <ChevronRight className="hidden h-3 w-3 sm:inline" />
              <span className="truncate font-medium text-brand-green-700">{section}</span>
            </div>
            <h1 className="truncate font-heading text-lg font-bold tracking-tight text-neutral-900">
              {section}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            className="hidden items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 shadow-sm transition-all duration-200 hover:border-brand-green-600/30 hover:bg-brand-green-50 hover:text-brand-green-800 md:inline-flex"
            href="/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View store
          </Link>

          <AdminNotificationBell />

          <div className="hidden h-8 w-px bg-neutral-200 sm:block" aria-hidden />

          <AdminAccountMenu user={user} />
        </div>
      </div>
    </header>
  );
}
