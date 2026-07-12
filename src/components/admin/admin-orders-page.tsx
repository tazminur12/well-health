"use client";

import {
  AlertTriangle,
  CheckCircle,
  Download,
  Loader2,
  PackageCheck,
  Plus,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminOrdersTable } from "@/components/admin/admin-orders-table";
import { Button } from "@/components/ui/button";
import { useAdminOrderStats, useAdminOrders } from "@/hooks/use-admin-orders";
import { formatPrice } from "@/lib/format-price";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type OrderStatusValue,
  type PaymentMethodValue,
} from "@/lib/orders/schemas";
import { cn } from "@/lib/utils";

type StatusFilter = "All" | OrderStatusValue;
type DatePreset = "All" | "Today" | "7d" | "30d";

const statusTabs: StatusFilter[] = [
  "All",
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function matchesDatePreset(iso: string, preset: DatePreset) {
  if (preset === "All") return true;
  const created = new Date(iso).getTime();
  const now = new Date();
  if (preset === "Today") return created >= startOfDay(now).getTime();
  const days = preset === "7d" ? 7 : 30;
  return created >= now.getTime() - days * 24 * 60 * 60 * 1000;
}

function exportOrdersCsv(
  rows: Array<{
    orderNumber: string;
    customerName: string;
    email: string;
    phone: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    total: number;
    createdAt: string;
  }>
) {
  const header = [
    "Order Number",
    "Customer",
    "Email",
    "Phone",
    "Status",
    "Payment Method",
    "Payment Status",
    "Total",
    "Created At",
  ];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        row.orderNumber,
        `"${row.customerName.replace(/"/g, '""')}"`,
        row.email,
        row.phone,
        row.status,
        row.paymentMethod,
        row.paymentStatus,
        row.total.toFixed(2),
        row.createdAt,
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AdminOrdersPage() {
  const { data: orders = [], isLoading, isError, error, refetch } = useAdminOrders();
  const { data: stats } = useAdminOrderStats();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [paymentFilter, setPaymentFilter] = useState<"All" | PaymentMethodValue>("All");
  const [datePreset, setDatePreset] = useState<DatePreset>("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.phone.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "All" || order.status === statusFilter;
      const matchesPayment =
        paymentFilter === "All" || order.paymentMethod === paymentFilter;
      const matchesDate = matchesDatePreset(order.createdAt, datePreset);

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [orders, search, statusFilter, paymentFilter, datePreset]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const tabCounts = useMemo(() => {
    const base = {
      All: orders.length,
      PENDING: 0,
      PAID: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    } as Record<StatusFilter, number>;
    for (const order of orders) {
      base[order.status] += 1;
    }
    return base;
  }, [orders]);

  const summaryCards = [
    {
      icon: PackageCheck,
      value: String(stats?.total ?? orders.length),
      label: "Total Orders",
      tone: "text-neutral-700",
      hint: stats ? `${formatPrice(stats.revenue)} paid` : undefined,
    },
    {
      icon: AlertTriangle,
      value: String(stats?.pending ?? tabCounts.PENDING),
      label: "Pending",
      tone: "text-amber-600",
    },
    {
      icon: Truck,
      value: String((stats?.processing ?? 0) + (stats?.shipped ?? 0)),
      label: "Processing / Shipped",
      tone: "text-indigo-600",
    },
    {
      icon: CheckCircle,
      value: String(stats?.delivered ?? tabCounts.DELIVERED),
      label: "Delivered",
      tone: "text-brand-green-600",
    },
    {
      icon: XCircle,
      value: String(stats?.cancelled ?? tabCounts.CANCELLED),
      label: "Cancelled",
      tone: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-600">
            Sales
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-neutral-900">
            Orders
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Track, fulfill, and manually create customer orders.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-xl border-neutral-200"
            onClick={() =>
              exportOrdersCsv(
                filtered.map((order) => ({
                  orderNumber: order.orderNumber,
                  customerName: order.customerName,
                  email: order.email,
                  phone: order.phone,
                  status: ORDER_STATUS_LABELS[order.status],
                  paymentMethod: PAYMENT_METHOD_LABELS[order.paymentMethod],
                  paymentStatus: order.paymentStatus,
                  total: order.total,
                  createdAt: order.createdAt,
                }))
              )
            }
            type="button"
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button asChild className="rounded-xl bg-brand-green-600 hover:bg-brand-green-900">
            <Link href="/admin/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Order
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <div
            className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            key={card.label}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {card.label}
                </p>
                <p className={cn("mt-1 font-heading text-2xl font-bold", card.tone)}>
                  {card.value}
                </p>
                {card.hint ? (
                  <p className="mt-1 text-xs text-neutral-400">{card.hint}</p>
                ) : null}
              </div>
              <span className="rounded-xl bg-neutral-50 p-2.5 text-neutral-500">
                <card.icon className="h-5 w-5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              statusFilter === tab
                ? "bg-brand-green-600 text-white"
                : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"
            )}
            key={tab}
            onClick={() => {
              setStatusFilter(tab);
              setPage(1);
            }}
            type="button"
          >
            {tab === "All" ? "All" : ORDER_STATUS_LABELS[tab]}
            <span className="ml-1.5 opacity-70">{tabCounts[tab]}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 text-sm outline-none transition focus:border-brand-green-400 focus:bg-white"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search order #, name, phone, email…"
            value={search}
          />
        </div>
        <select
          className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-brand-green-400"
          onChange={(event) => {
            setDatePreset(event.target.value as DatePreset);
            setPage(1);
          }}
          value={datePreset}
        >
          <option value="All">All time</option>
          <option value="Today">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
        <select
          className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-brand-green-400"
          onChange={(event) => {
            setPaymentFilter(event.target.value as "All" | PaymentMethodValue);
            setPage(1);
          }}
          value={paymentFilter}
        >
          <option value="All">All payments</option>
          <option value="COD">Cash on Delivery</option>
          <option value="SSLCOMMERZ">SSLCommerz</option>
          <option value="BKASH">bKash</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-20 text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading orders…
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
          <p className="font-medium text-red-700">
            {error instanceof Error ? error.message : "Could not load orders."}
          </p>
          <Button className="mt-3 rounded-xl" onClick={() => void refetch()} type="button">
            Try again
          </Button>
        </div>
      ) : (
        <AdminOrdersTable
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          orders={paged}
          page={page}
          pageSize={pageSize}
          totalOrders={filtered.length}
        />
      )}
    </div>
  );
}
