"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Download,
  Loader2,
  Package,
  Percent,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { useAdminReports } from "@/hooks/use-admin-reports";
import { formatPrice } from "@/lib/format-price";
import type { AdminReportsData, ReportRange } from "@/lib/reports/schemas";
import { cn } from "@/lib/utils";

const ranges: { key: ReportRange; label: string }[] = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "ytd", label: "Year to date" },
];

function formatMoney(value: number) {
  return formatPrice(value).replace(/\.00$/, "");
}

function exportReportsCsv(data: AdminReportsData) {
  const rows = [
    ["Metric", "Value", "Change %"],
    ["Gross revenue", String(data.kpis.revenue), String(data.kpis.revenueDelta)],
    ["Orders", String(data.kpis.orders), String(data.kpis.ordersDelta)],
    ["Average order value", String(data.kpis.aov), String(data.kpis.aovDelta)],
    ["New customers", String(data.kpis.customers), String(data.kpis.customersDelta)],
    ["Paid order rate", `${data.kpis.paidOrderRate}%`, String(data.kpis.paidOrderRateDelta)],
    ["Cancellation rate", `${data.kpis.cancelRate}%`, String(data.kpis.cancelRateDelta)],
    [],
    ["Revenue trend", "Revenue", "Orders"],
    ...data.revenueSeries.map((point) => [point.label, String(point.revenue), String(point.orders)]),
    [],
    ["Top products", "SKU", "Sold", "Revenue", "Stock"],
    ...data.topProducts.map((product) => [
      product.name,
      product.sku,
      String(product.sold),
      String(product.revenue),
      String(product.stock),
    ]),
  ];

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `well-health-reports-${data.range}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string; color?: string; dataKey?: string }>;
  label?: string;
};

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 shadow-lg">
      {label ? <p className="mb-1.5 text-xs font-medium text-neutral-500">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((entry) => {
          const key = String(entry.dataKey ?? entry.name ?? "value");
          const isMoney = key === "revenue" || key === "sales";
          return (
            <p key={key} className="text-sm font-semibold text-neutral-900">
              <span
                className="mr-2 inline-block h-2 w-2 rounded-full"
                style={{ background: entry.color ?? "#16875D" }}
              />
              {isMoney ? formatMoney(entry.value ?? 0) : entry.value?.toLocaleString("en-US")}
              {entry.name && !isMoney ? (
                <span className="ml-1 font-medium text-neutral-500">{entry.name}</span>
              ) : null}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function DeltaBadge({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
        up ? "bg-brand-green-50 text-brand-green-700" : "bg-red-50 text-red-600"
      )}
    >
      {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {Math.abs(value)}%
    </span>
  );
}

function EmptyChartNote({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[180px] items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/80 px-4 text-center text-sm text-neutral-500">
      {message}
    </div>
  );
}

export function AdminReportsPage() {
  const [range, setRange] = useState<ReportRange>("30d");
  const { data, isLoading, isError, error, isFetching } = useAdminReports(range);

  const kpiCards = useMemo(() => {
    if (!data) return [];

    const { kpis } = data;
    return [
      {
        label: "Gross revenue",
        value: formatMoney(kpis.revenue),
        delta: kpis.revenueDelta,
        icon: Wallet,
        theme: "from-[#0B4D3A] to-[#16875D]",
        soft: "from-[#E8F5EE] via-white to-[#F5F0E6]",
      },
      {
        label: "Orders",
        value: kpis.orders.toLocaleString("en-US"),
        delta: kpis.ordersDelta,
        icon: ShoppingBag,
        theme: "from-[#1D4F91] to-[#2B6CB0]",
        soft: "from-[#EAF3FF] via-white to-[#F0F7F3]",
      },
      {
        label: "Avg. order value",
        value: formatMoney(kpis.aov),
        delta: kpis.aovDelta,
        icon: TrendingUp,
        theme: "from-[#A8843A] to-[#C9A24B]",
        soft: "from-[#F5F0E6] via-white to-[#E8F5EE]",
      },
      {
        label: "New customers",
        value: kpis.customers.toLocaleString("en-US"),
        delta: kpis.customersDelta,
        icon: Users,
        theme: "from-[#0F766E] to-[#16875D]",
        soft: "from-[#E6F4F0] via-white to-[#EEF6F2]",
      },
      {
        label: "Paid order rate",
        value: `${kpis.paidOrderRate}%`,
        delta: kpis.paidOrderRateDelta,
        icon: Percent,
        theme: "from-[#16875D] to-[#3BA88A]",
        soft: "from-[#EEF8F3] via-white to-[#F8FBF9]",
      },
      {
        label: "Cancellation rate",
        value: `${kpis.cancelRate}%`,
        delta: kpis.cancelRateDelta,
        icon: Package,
        theme: "from-[#7F1D1D] to-[#DC2626]",
        soft: "from-[#FEF2F2] via-white to-[#F7F8F9]",
        invertDelta: true,
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-brand-green-600" />
          Loading live reports…
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {error instanceof Error ? error.message : "Could not load reports."}
      </div>
    );
  }

  const { kpis, revenueSeries, orderStatus, categorySales, paymentMix, regionSales, topProducts } =
    data;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-[#0B4D3A] via-[#127A56] to-[#16875D] p-6 text-white shadow-sm sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#C9A24B]/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-accent ring-1 ring-white/15">
              <BarChart3 className="h-3.5 w-3.5" />
              Reports & analytics
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Business performance
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Live revenue, orders, products, and regional delivery insights from your Well Health
              store data.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-xl bg-black/20 p-1 ring-1 ring-white/15 backdrop-blur-sm">
              {ranges.map((item) => (
                <button
                  key={item.key}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm",
                    range === item.key
                      ? "bg-white text-brand-green-900 shadow-sm"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                  disabled={isFetching}
                  onClick={() => setRange(item.key)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Button
              className="h-10 gap-2 rounded-xl border-0 bg-gold-accent text-brand-green-950 hover:bg-[#d4b05c]"
              onClick={() => exportReportsCsv(data)}
              type="button"
              variant="secondary"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const delta = card.invertDelta ? -card.delta : card.delta;
          return (
            <article
              key={card.label}
              className={cn(
                "relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br p-5 shadow-sm",
                card.soft
              )}
            >
              <div
                aria-hidden
                className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", card.theme)}
              />
              <div className="flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
                    card.theme
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <DeltaBadge value={delta} />
              </div>
              <p className="mt-4 text-sm font-medium text-neutral-500">{card.label}</p>
              <p className="mt-1 font-heading text-2xl font-bold tracking-tight text-neutral-900">
                {card.value}
              </p>
              <p className="mt-2 text-xs text-neutral-500">vs previous period</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-neutral-900">Revenue trend</h2>
              <p className="text-sm text-neutral-500">Gross sales over the selected range</p>
            </div>
            <p className="text-sm font-semibold text-brand-green-700">
              {formatMoney(kpis.revenue)} total
            </p>
          </div>
          <div className="h-[300px] w-full">
            {revenueSeries.some((point) => point.revenue > 0 || point.orders > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reportsRevenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16875D" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#16875D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="label"
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                    tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    dataKey="revenue"
                    fill="url(#reportsRevenueFill)"
                    fillOpacity={1}
                    name="Revenue"
                    stroke="#16875D"
                    strokeWidth={2.5}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartNote message="No revenue recorded in this period yet." />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="font-heading text-lg font-bold text-neutral-900">Orders by status</h2>
            <p className="text-sm text-neutral-500">Current pipeline snapshot</p>
          </div>
          <div className="h-[220px] w-full">
            {orderStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={orderStatus}
                    dataKey="value"
                    innerRadius={58}
                    nameKey="name"
                    outerRadius={88}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {orderStatus.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartNote message="No orders in the system yet." />
            )}
          </div>
          {orderStatus.length > 0 ? (
            <ul className="mt-2 grid grid-cols-2 gap-2">
              {orderStatus.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between gap-2 rounded-lg bg-neutral-50 px-2.5 py-1.5 text-xs"
                >
                  <span className="flex items-center gap-1.5 text-neutral-600">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: item.color }}
                    />
                    {item.name}
                  </span>
                  <span className="font-semibold text-neutral-900">{item.value}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="font-heading text-lg font-bold text-neutral-900">Sales by category</h2>
            <p className="text-sm text-neutral-500">Top performing catalog groups</p>
          </div>
          <div className="h-[280px] w-full">
            {categorySales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categorySales}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="#E5E7EB" strokeDasharray="4 4" />
                  <XAxis
                    axisLine={false}
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                    tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                    tickLine={false}
                    type="number"
                  />
                  <YAxis
                    axisLine={false}
                    dataKey="name"
                    tick={{ fill: "#1A1D1F", fontSize: 12 }}
                    tickLine={false}
                    type="category"
                    width={88}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="sales" fill="#16875D" name="Sales" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartNote message="No category sales in this period yet." />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="font-heading text-lg font-bold text-neutral-900">Payment mix</h2>
            <p className="text-sm text-neutral-500">Share of completed checkouts</p>
          </div>
          <div className="h-[200px] w-full">
            {paymentMix.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={paymentMix}
                    dataKey="value"
                    innerRadius={52}
                    nameKey="name"
                    outerRadius={80}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {paymentMix.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs font-medium text-neutral-600">{value}</span>
                    )}
                    iconSize={8}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartNote message="No payment data in this period yet." />
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {paymentMix.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-neutral-100 bg-neutral-50/80 px-3 py-2.5 text-center"
              >
                <p className="text-lg font-bold text-neutral-900">{item.value}%</p>
                <p className="text-[11px] font-medium text-neutral-500">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.35fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="font-heading text-lg font-bold text-neutral-900">Delivery regions</h2>
            <p className="text-sm text-neutral-500">Orders & revenue by shipping zone</p>
          </div>
          {regionSales.length > 0 ? (
            <div className="space-y-3">
              {regionSales.map((region, index) => {
                const max = regionSales[0]!.revenue || 1;
                const pct = Math.round((region.revenue / max) * 100);
                const bars = [
                  "from-[#0B4D3A] to-[#16875D]",
                  "from-[#16875D] to-[#C9A24B]",
                  "from-[#1D4F91] to-[#16875D]",
                ];
                return (
                  <div
                    key={region.name}
                    className="rounded-xl border border-neutral-100 bg-gradient-to-br from-[#F7F8F9] to-white p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-neutral-900">{region.name}</p>
                      <p className="text-sm font-bold text-brand-green-800">
                        {formatMoney(region.revenue)}
                      </p>
                    </div>
                    <div className="mb-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r",
                          bars[index % bars.length]
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-500">
                      {region.orders} orders · {pct}% of top zone revenue
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyChartNote message="No regional sales in this period yet." />
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-neutral-900">Top products</h2>
              <p className="text-sm text-neutral-500">Best sellers in this period</p>
            </div>
            <span className="hidden text-xs font-medium text-neutral-400 sm:inline">Live catalog</span>
          </div>
          {topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
                    <th className="pb-3 pr-3 font-semibold">Product</th>
                    <th className="pb-3 pr-3 font-semibold">Sold</th>
                    <th className="pb-3 pr-3 font-semibold">Revenue</th>
                    <th className="pb-3 font-semibold">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {topProducts.map((product, index) => (
                    <tr key={product.sku} className="group">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-green-50 text-xs font-bold text-brand-green-800">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-neutral-900">{product.name}</p>
                            <p className="text-xs text-neutral-400">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-3 font-medium text-neutral-700">{product.sold}</td>
                      <td className="py-3.5 pr-3 font-semibold text-neutral-900">
                        {formatMoney(product.revenue)}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                            product.stock < 25
                              ? "bg-amber-50 text-amber-800"
                              : "bg-brand-green-50 text-brand-green-800"
                          )}
                        >
                          {product.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyChartNote message="No product sales in this period yet." />
          )}
        </div>
      </section>
    </div>
  );
}
