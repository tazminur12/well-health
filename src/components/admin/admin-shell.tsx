"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  ShoppingBag,
  Settings,
  Users,
  Bell,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Leaf,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

type AdminNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  unreadCount?: number;
};

const navItems: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/chat", label: "Chat", icon: MessageCircle, unreadCount: 7 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onNavigate: () => void;
  onToggleCollapse: () => void;
};

type TopbarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentSection = useMemo(() => {
    if (pathname?.includes("/products")) return "Products";
    if (pathname?.includes("/orders")) return "Orders";
    if (pathname?.includes("/customers")) return "Customers";
    if (pathname?.includes("/chat")) return "Chat";
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
      />

      <div className={cn("min-h-screen transition-[margin] duration-200", collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]")}>
        <AdminTopbar
          collapsed={collapsed}
          onToggleCollapse={() => {
            if (typeof window !== "undefined" && window.innerWidth < 1024) {
              setMobileOpen(true);
              return;
            }

            setCollapsed((current) => !current);
          }}
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
  onCloseMobile,
  onNavigate,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-full flex-col bg-brand-green-900 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] transition-transform duration-200 lg:translate-x-0",
        collapsed ? "w-[72px]" : "w-[260px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
        <Link className="flex min-w-0 items-center gap-3" href="/admin/dashboard" onClick={onNavigate}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
            <Leaf className="h-5 w-5" />
          </span>

          {!collapsed ? (
            <span className="min-w-0">
              <span className="block font-heading text-sm font-bold tracking-[0.18em] text-white">
                WELL HEALTH
              </span>
              <span className="block text-xs text-neutral-300">Admin Panel</span>
            </span>
          ) : null}
        </Link>

        <div className="hidden lg:block">
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            onClick={onToggleCollapse}
            type="button"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <button
          aria-label="Close mobile sidebar"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white lg:hidden"
          onClick={onCloseMobile}
          type="button"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ href, label, icon: Icon, unreadCount }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                active
                  ? "border-l-2 border-gold-accent bg-gold-accent/15 text-gold-accent"
                  : "border-l-2 border-transparent text-neutral-300 hover:bg-white/10 hover:text-white"
              )}
              href={href}
              onClick={onNavigate}
            >
              <Icon className={cn("h-5 w-5 shrink-0", active ? "text-gold-accent" : "text-inherit")} />

              {!collapsed ? <span className="truncate">{label}</span> : null}

              {!collapsed && unreadCount ? (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-accent/20 px-1.5 text-[11px] font-semibold text-gold-accent">
                  {unreadCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center") }>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
            <CircleUserRound className="h-5 w-5" />
          </div>

          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">Admin User</p>
              <p className="text-xs text-neutral-300">Super Admin</p>
            </div>
          ) : null}

          <button
            aria-label="Logout"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            type="button"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function AdminTopbar({ collapsed, onToggleCollapse }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label={collapsed ? "Open sidebar" : "Toggle sidebar"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition-all duration-200 hover:bg-neutral-100 hover:shadow-sm"
            onClick={onToggleCollapse}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm text-neutral-500">Dashboard</p>
            <p className="truncate text-base font-semibold text-neutral-900">Admin Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition-all duration-200 hover:bg-neutral-100 hover:shadow-sm"
            type="button"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button
            className="inline-flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 transition-all duration-200 hover:bg-neutral-100 hover:shadow-sm"
            type="button"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-600">
              <CircleUserRound className="h-4.5 w-4.5" />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold text-neutral-900">Admin User</span>
              <span className="block text-xs text-neutral-500">Profile</span>
            </span>
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          </button>
        </div>
      </div>
    </header>
  );
}

type AdminStatCardProps = {
  icon: typeof DollarSign;
  iconClassName: string;
  label: string;
  value: string;
  trend: string;
  trendTone?: "positive" | "negative" | "amber";
};

export function AdminStatCard({ icon: Icon, iconClassName, label, value, trend, trendTone = "positive" }: AdminStatCardProps) {
  const toneClasses =
    trendTone === "negative"
      ? "text-red-600"
      : trendTone === "amber"
        ? "text-gold-accent"
        : "text-brand-green-600";

  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", iconClassName)}>
          <Icon className="h-5 w-5 text-white" />
        </div>

        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="mt-1 font-heading text-2xl font-bold tracking-tight text-neutral-900">{value}</p>
        </div>

        {trendTone === "amber" ? (
          <p className="text-sm font-medium text-gold-accent">{trend}</p>
        ) : (
          <p className={cn("flex items-center gap-1 text-sm font-medium", toneClasses)}>
            {trendTone === "negative" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 rotate-[-45deg]" />}
            {trend}
          </p>
        )}
      </div>
    </article>
  );
}

const salesData = Array.from({ length: 30 }, (_, index) => {
  const base = 12500 + Math.sin(index / 3) * 1800 + Math.cos(index / 2.2) * 950;
  const adjustment = (index % 4) * 600;

  return {
    day: `Day ${index + 1}`,
    revenue: Math.max(8200, Math.round(base + adjustment + index * 140)),
  };
});

type SalesTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
};

function SalesTooltip({ active, payload, label }: SalesTooltipProps) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value ?? 0;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-md">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-900">৳ {value.toLocaleString("en-US")}</p>
    </div>
  );
}

export function SalesChart() {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-heading text-xl font-bold text-neutral-900">Sales Overview</h3>

        <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-1 text-sm font-medium text-neutral-500">
          <button className="rounded-md bg-white px-3 py-2 text-neutral-900 shadow-sm" type="button">
            Last 30 Days
          </button>
          <button className="rounded-md px-3 py-2 transition-colors duration-200 hover:text-neutral-900" type="button">
            Last 7 Days
          </button>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16875D" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#16875D" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="day" hide />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} width={44} />
            <Tooltip content={<SalesTooltip />} />
            <Area
              dataKey="revenue"
              stroke="#16875D"
              strokeWidth={3}
              fill="url(#salesFill)"
              fillOpacity={1}
              type="monotone"
            />
            <Line dataKey="revenue" stroke="#16875D" strokeWidth={3} dot={false} type="monotone" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

const statusClassMap: Record<string, string> = {
  PENDING: "bg-gold-accent/15 text-gold-accent",
  PAID: "bg-blue-100 text-blue-600",
  SHIPPED: "bg-purple-100 text-purple-600",
  DELIVERED: "bg-brand-green-100 text-brand-green-600",
  CANCELLED: "bg-red-100 text-red-600",
};

const recentOrders = [
  { orderNo: "WHT-2026-00001", customer: "Ayesha Rahman", date: "2026-07-09", amount: "৳ 12,500.00", status: "PENDING" },
  { orderNo: "WHT-2026-00002", customer: "Tanvir Hasan", date: "2026-07-08", amount: "৳ 8,450.00", status: "PAID" },
  { orderNo: "WHT-2026-00003", customer: "Nusrat Jahan", date: "2026-07-08", amount: "৳ 15,200.00", status: "SHIPPED" },
  { orderNo: "WHT-2026-00004", customer: "Rakib Ahmed", date: "2026-07-07", amount: "৳ 5,900.00", status: "DELIVERED" },
  { orderNo: "WHT-2026-00005", customer: "Mim Akter", date: "2026-07-06", amount: "৳ 9,300.00", status: "CANCELLED" },
];

export function RecentOrdersTable() {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-6 py-5">
        <h3 className="font-heading text-xl font-bold text-neutral-900">Recent Orders</h3>

        <Link className="text-sm font-semibold text-brand-green-600 transition-colors duration-200 hover:text-brand-green-900" href="/admin/orders">
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            <tr>
              <th className="px-6 py-4">Order #</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {recentOrders.map((order) => (
              <tr key={order.orderNo} className="transition-colors duration-200 hover:bg-neutral-100">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-900">{order.orderNo}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-700">{order.customer}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">{order.date}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-neutral-900">{order.amount}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]", statusClassMap[order.status])}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
