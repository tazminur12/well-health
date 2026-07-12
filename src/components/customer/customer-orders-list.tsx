"use client";

import { Loader2, PackageCheck, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CustomerOrderCard } from "@/components/customer/customer-order-card";
import { EmptyOrdersState } from "@/components/customer/empty-orders-state";
import { OrderStatusTabs } from "@/components/customer/order-status-tabs";
import type { CustomerOrderStatus } from "@/components/customer/orders-data";
import { useMyOrders } from "@/hooks/use-my-orders";
import { formatPrice } from "@/lib/format-price";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;

export function CustomerOrdersList() {
  const { data: orders = [], isLoading, isError, error, refetch } = useMyOrders();
  const [activeFilter, setActiveFilter] = useState<CustomerOrderStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const counts = useMemo(() => {
    const result: Record<CustomerOrderStatus | "ALL", number> = {
      ALL: orders.length,
      PENDING: 0,
      PAID: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    for (const order of orders) {
      result[order.status] += 1;
    }
    return result;
  }, [orders]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter = activeFilter === "ALL" || order.status === activeFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        order.orderNumber.toLowerCase().includes(normalizedQuery) ||
        order.items.some((item) => item.name.toLowerCase().includes(normalizedQuery));
      return matchesFilter && matchesQuery;
    });
  }, [orders, activeFilter, query]);

  const visibleOrders = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const activeCount = orders.filter((order) =>
    ["PENDING", "PAID", "PROCESSING", "SHIPPED"].includes(order.status)
  ).length;

  const handleFilterChange = (value: CustomerOrderStatus | "ALL") => {
    setActiveFilter(value);
    setVisible(PAGE_SIZE);
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-900 sm:text-2xl">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Track deliveries, download invoices, and reorder favorites.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-green-900"
          href="/shop"
        >
          <ShoppingBag className="h-4 w-4" />
          Continue shopping
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Total orders
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-neutral-900">
            {isLoading ? "—" : orders.length}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            In progress
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-amber-700">
            {isLoading ? "—" : activeCount}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Delivered value
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-brand-green-700">
            {isLoading
              ? "—"
              : formatPrice(
                  orders
                    .filter((order) => order.status === "DELIVERED")
                    .reduce((sum, order) => sum + order.total, 0)
                )}
          </p>
        </div>
      </div>

      <div className="sticky top-14 z-10 -mx-4 space-y-3 border-b border-neutral-200 bg-neutral-100/95 px-4 pb-3 pt-1 backdrop-blur-sm md:top-16 md:mx-0 md:rounded-xl md:border md:bg-white md:px-4 md:py-3">
        <OrderStatusTabs active={activeFilter} counts={counts} onChange={handleFilterChange} />

        <label className="flex h-11 items-center gap-2 rounded-lg bg-neutral-100 px-3 ring-1 ring-neutral-200 transition-all duration-200 focus-within:ring-2 focus-within:ring-brand-green-100 md:bg-white">
          <Search className="h-4 w-4 shrink-0 text-neutral-500" />
          <input
            className="h-full w-full border-none bg-transparent p-0 text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
            inputMode="search"
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="Search by order # or product…"
            type="search"
            value={query}
          />
        </label>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-16 text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your orders…
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center">
          <p className="font-medium text-red-700">
            {error instanceof Error ? error.message : "Could not load orders."}
          </p>
          <button
            className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-brand-green-600 px-4 text-sm font-semibold text-white"
            onClick={() => void refetch()}
            type="button"
          >
            Try again
          </button>
        </div>
      ) : visibleOrders.length === 0 ? (
        <EmptyOrdersState
          message={
            query || activeFilter !== "ALL"
              ? "Try adjusting your filters or search."
              : "When you place an order, it will appear here."
          }
          title="No orders found"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visibleOrders.map((order) => (
            <CustomerOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {hasMore ? (
        <button
          className="min-h-12 w-full rounded-xl border border-neutral-300 bg-white text-sm font-semibold text-neutral-700 transition-colors duration-200 hover:bg-neutral-50 active:bg-neutral-100"
          onClick={() => setVisible((current) => current + PAGE_SIZE)}
          type="button"
        >
          Load more orders
        </button>
      ) : !isLoading && filtered.length > 0 ? (
        <p className={cn("flex items-center justify-center gap-2 text-xs text-neutral-400")}>
          <PackageCheck className="h-3.5 w-3.5" />
          Showing all {filtered.length} matching orders
        </p>
      ) : null}
    </div>
  );
}
