"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ClipboardList,
  Handshake,
  Loader2,
  MessageSquare,
  Package,
  RefreshCw,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { orderStatusPillClass } from "@/components/admin/admin-orders-table";
import { Button } from "@/components/ui/button";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import { formatPrice } from "@/lib/format-price";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatusValue,
} from "@/lib/orders/schemas";
import { cn } from "@/lib/utils";

type RangeDays = 7 | 30;

function formatDelta(value: number | null) {
  if (value === null) return "No prior data";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}% vs prior`;
}

function deltaTone(value: number | null): "up" | "down" | "flat" {
  if (value === null || value === 0) return "flat";
  return value > 0 ? "up" : "down";
}

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number; dataKey?: string }>;
  label?: string;
};

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const revenue = payload.find((p) => p.dataKey === "revenue")?.value ?? 0;
  const orders = payload.find((p) => p.dataKey === "orders")?.value ?? 0;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 shadow-md">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-900">{formatPrice(Number(revenue))}</p>
      <p className="text-xs text-neutral-500">{orders} orders</p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: string;
  hint: string;
  delta: number | null;
  icon: typeof Wallet;
  tone: "green" | "blue" | "gold" | "teal";
  href?: string;
}) {
  const toneMap = {
    green: {
      card: "from-[#E8F5EE] via-white to-white",
      bar: "from-[#0B4D3A] to-[#16875D]",
      icon: "bg-[#0B4D3A] text-white",
    },
    blue: {
      card: "from-blue-50 via-white to-white",
      bar: "from-blue-600 to-sky-400",
      icon: "bg-blue-600 text-white",
    },
    gold: {
      card: "from-[#F5F0E6] via-white to-white",
      bar: "from-[#C9A24B] to-[#16875D]",
      icon: "bg-[#C9A24B] text-white",
    },
    teal: {
      card: "from-teal-50 via-white to-white",
      bar: "from-teal-700 to-emerald-400",
      icon: "bg-teal-700 text-white",
    },
  }[tone];

  const trend = deltaTone(delta);
  const content = (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] ring-1 ring-neutral-200/80 transition-all duration-200",
        href && "hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(22,135,93,0.1)]",
        toneMap.card
      )}
    >
      <div aria-hidden className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", toneMap.bar)} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p className="mt-2 font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-[1.7rem]">
            {value}
          </p>
        </div>
        <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl", toneMap.icon)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold",
            trend === "up" && "bg-brand-green-100 text-brand-green-700",
            trend === "down" && "bg-red-50 text-red-600",
            trend === "flat" && "bg-neutral-100 text-neutral-600"
          )}
        >
          {trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
          {trend === "down" ? <ArrowDownRight className="h-3.5 w-3.5" /> : null}
          {formatDelta(delta)}
        </span>
        <span className="text-neutral-500">{hint}</span>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link className="block" href={href}>
        {content}
      </Link>
    );
  }
  return content;
}

export function AdminDashboardOverview() {
  const [rangeDays, setRangeDays] = useState<RangeDays>(30);
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminDashboard(rangeDays);

  const maxStatus = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, ...data.statusBreakdown.map((s) => s.count));
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading dashboard…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50/50 px-6 text-center">
        <p className="text-sm font-medium text-red-700">
          {error instanceof Error ? error.message : "Couldn’t load dashboard."}
        </p>
        <Button onClick={() => void refetch()} type="button" variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  const { kpis } = data;
  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "Good morning" : greetingHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B4D3A] via-[#126B4C] to-[#16875D] p-6 text-white shadow-sm sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#C9A24B]/25 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/90">
              Overview
            </p>
            <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              {greeting} — here&apos;s your store pulse
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
              Live revenue, orders, inventory, and support signals for the last {rangeDays} days.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-white/15 bg-white/10 p-1 backdrop-blur-sm">
              {([7, 30] as const).map((days) => (
                <button
                  key={days}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                    rangeDays === days
                      ? "bg-white text-brand-green-900 shadow-sm"
                      : "text-white/80 hover:text-white"
                  )}
                  onClick={() => setRangeDays(days)}
                  type="button"
                >
                  {days}d
                </button>
              ))}
            </div>
            <Button
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              disabled={isFetching}
              onClick={() => void refetch()}
              type="button"
              variant="outline"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
              Refresh
            </Button>
            <Button asChild className="bg-[#C9A24B] text-[#0B4D3A] hover:bg-[#bb943e]">
              <Link href="/admin/orders/new">
                <ShoppingBag className="mr-2 h-4 w-4" />
                New order
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* KPI grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          delta={kpis.revenueDeltaPct}
          hint={`${rangeDays}-day paid revenue`}
          href="/admin/orders"
          icon={Wallet}
          label="Revenue"
          tone="green"
          value={formatPrice(kpis.revenue)}
        />
        <KpiCard
          delta={kpis.ordersDeltaPct}
          hint={`AOV ${formatPrice(kpis.aov)}`}
          href="/admin/orders"
          icon={ShoppingBag}
          label="Orders"
          tone="blue"
          value={String(kpis.orders)}
        />
        <KpiCard
          delta={kpis.customersDeltaPct}
          hint="Active customer accounts"
          href="/admin/customers"
          icon={Users}
          label="Customers"
          tone="teal"
          value={String(kpis.customers)}
        />
        <KpiCard
          delta={kpis.lowStock > 0 ? -Math.min(100, kpis.lowStock * 5) : 0}
          hint={kpis.lowStock > 0 ? "Needs restock" : "Stock healthy"}
          href="/admin/inventory"
          icon={AlertTriangle}
          label="Low stock"
          tone="gold"
          value={String(kpis.lowStock)}
        />
      </section>

      {/* Attention strip */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: "Pending orders",
            value: kpis.pendingOrders,
            href: "/admin/orders",
            icon: ClipboardList,
            color: "text-amber-700 bg-amber-50 ring-amber-100",
          },
          {
            label: "Processing",
            value: kpis.processingOrders,
            href: "/admin/orders",
            icon: Package,
            color: "text-purple-700 bg-purple-50 ring-purple-100",
          },
          {
            label: "Unread messages",
            value: kpis.unreadMessages,
            href: "/admin/messages",
            icon: MessageSquare,
            color: "text-sky-700 bg-sky-50 ring-sky-100",
          },
          {
            label: "Distributor applications",
            value: kpis.newDistributorApplications,
            href: "/admin/distributors",
            icon: Handshake,
            color: "text-amber-700 bg-amber-50 ring-amber-100",
          },
          {
            label: "Reviews to moderate",
            value: kpis.pendingReviews,
            href: "/admin/reviews",
            icon: Star,
            color: "text-rose-700 bg-rose-50 ring-rose-100",
          },
        ].map((item) => (
          <Link
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-neutral-200/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            href={item.href}
          >
            <div className="flex items-center gap-3">
              <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1", item.color)}>
                <item.icon className="h-4.5 w-4.5 h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-medium text-neutral-500">{item.label}</p>
                <p className="font-heading text-xl font-bold text-neutral-900">{item.value}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-300" />
          </Link>
        ))}
      </section>

      {/* Chart + status */}
      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-neutral-900 sm:text-xl">
                Sales overview
              </h2>
              <p className="text-sm text-neutral-500">Paid revenue by day · last {rangeDays} days</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green-100 px-3 py-1 text-xs font-semibold text-brand-green-700">
              <TrendingUp className="h-3.5 w-3.5" />
              {kpis.activeProducts} active products
            </span>
          </div>

          <div className="h-[300px] w-full sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashSalesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16875D" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#16875D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  interval="preserveStartEnd"
                  minTickGap={28}
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  dataKey="revenue"
                  fill="url(#dashSalesFill)"
                  fillOpacity={1}
                  stroke="#16875D"
                  strokeWidth={2.5}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-neutral-900">Order status</h2>
              <p className="text-sm text-neutral-500">All-time pipeline</p>
            </div>
            <Link
              className="text-sm font-semibold text-brand-green-600 hover:text-brand-green-900"
              href="/admin/orders"
            >
              Manage
            </Link>
          </div>

          <ul className="space-y-3.5">
            {data.statusBreakdown.map((slice) => (
              <li key={slice.status}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-neutral-700">{slice.label}</span>
                  <span className="font-semibold text-neutral-900">{slice.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      slice.status === "PENDING" && "bg-amber-400",
                      slice.status === "PAID" && "bg-blue-500",
                      slice.status === "PROCESSING" && "bg-purple-500",
                      slice.status === "SHIPPED" && "bg-indigo-500",
                      slice.status === "DELIVERED" && "bg-brand-green-600",
                      slice.status === "CANCELLED" && "bg-red-400"
                    )}
                    style={{ width: `${Math.max(4, (slice.count / maxStatus) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>

          {kpis.unpaidOrders > 0 ? (
            <Link
              className="mt-5 flex items-center justify-between rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-800 ring-1 ring-amber-100 transition-colors hover:bg-amber-100/80"
              href="/admin/payments"
            >
              <span>
                <span className="font-semibold">{kpis.unpaidOrders}</span> unpaid orders need review
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </section>

      {/* Recent orders + side panels */}
      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-heading text-lg font-bold text-neutral-900">Recent orders</h2>
              <p className="text-sm text-neutral-500">Latest storefront & manual orders</p>
            </div>
            <Link
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-green-600 hover:text-brand-green-900"
              href="/admin/orders"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100">
              <thead className="bg-neutral-50/80 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                <tr>
                  <th className="px-5 py-3 sm:px-6">Order</th>
                  <th className="px-5 py-3 sm:px-6">Customer</th>
                  <th className="px-5 py-3 sm:px-6">Amount</th>
                  <th className="px-5 py-3 sm:px-6">Status</th>
                  <th className="px-5 py-3 sm:px-6">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td className="px-5 py-10 text-center text-sm text-neutral-500 sm:px-6" colSpan={5}>
                      No orders yet — create one or wait for checkout.
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-neutral-50/80">
                      <td className="whitespace-nowrap px-5 py-3.5 sm:px-6">
                        <Link
                          className="text-sm font-semibold text-neutral-900 hover:text-brand-green-700 hover:underline"
                          href={`/admin/orders/${order.id}`}
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {new Date(order.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-sm text-neutral-700 sm:px-6">
                        {order.customerName}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-neutral-900 sm:px-6">
                        {formatPrice(order.total)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 sm:px-6">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                            orderStatusPillClass[order.status as OrderStatusValue]
                          )}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs font-medium text-neutral-600 sm:px-6">
                        {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {/* Top products */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-neutral-900">Top products</h2>
                <p className="text-sm text-neutral-500">By units sold · {rangeDays}d</p>
              </div>
              <Link
                className="text-sm font-semibold text-brand-green-600 hover:text-brand-green-900"
                href="/admin/products"
              >
                Catalog
              </Link>
            </div>

            {data.topProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-500">No sales in this period.</p>
            ) : (
              <ul className="space-y-3">
                {data.topProducts.map((product, index) => (
                  <li
                    key={product.productName}
                    className="flex items-center gap-3 rounded-xl bg-neutral-50/80 px-3 py-2.5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-green-100 text-xs font-bold text-brand-green-800">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {product.productName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {product.quantity} sold · {formatPrice(product.revenue)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Low stock */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-neutral-900">Low stock</h2>
                <p className="text-sm text-neutral-500">Below threshold alerts</p>
              </div>
              <Link
                className="text-sm font-semibold text-brand-green-600 hover:text-brand-green-900"
                href="/admin/inventory"
              >
                Inventory
              </Link>
            </div>

            {data.lowStockProducts.length === 0 ? (
              <div className="rounded-xl bg-brand-green-50 px-4 py-5 text-center text-sm text-brand-green-800">
                All products are above their stock thresholds.
              </div>
            ) : (
              <ul className="space-y-3">
                {data.lowStockProducts.map((product) => (
                  <li key={product.id} className="flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-200">
                      {product.imageUrl ? (
                        <Image
                          alt={product.name}
                          className="object-cover"
                          fill
                          sizes="44px"
                          src={product.imageUrl}
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center">
                          <Package className="h-4 w-4 text-neutral-400" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        className="truncate text-sm font-semibold text-neutral-900 hover:text-brand-green-700"
                        href={`/admin/products/${product.id}/edit`}
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-neutral-500">SKU {product.sku}</p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-bold",
                        product.stock === 0
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-800"
                      )}
                    >
                      {product.stock}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
