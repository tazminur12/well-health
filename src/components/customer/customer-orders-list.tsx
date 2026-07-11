"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { CustomerOrderCard } from "@/components/customer/customer-order-card";
import { EmptyOrdersState } from "@/components/customer/empty-orders-state";
import { OrderStatusTabs } from "@/components/customer/order-status-tabs";
import {
  customerOrders,
  type CustomerOrderStatus,
} from "@/components/customer/orders-data";

const PAGE_SIZE = 4;

export function CustomerOrdersList() {
  const [activeFilter, setActiveFilter] = useState<CustomerOrderStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const counts = useMemo(() => {
    const result: Record<CustomerOrderStatus | "ALL", number> = {
      ALL: customerOrders.length,
      PENDING: 0,
      PAID: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    for (const order of customerOrders) {
      result[order.status] += 1;
    }
    return result;
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return customerOrders.filter((order) => {
      const matchesFilter = activeFilter === "ALL" || order.status === activeFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        order.orderNumber.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  const visibleOrders = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const handleFilterChange = (value: CustomerOrderStatus | "ALL") => {
    setActiveFilter(value);
    setVisible(PAGE_SIZE);
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-heading text-xl font-bold text-neutral-900 sm:text-2xl">My Orders</h1>
        <p className="mt-1 text-sm text-neutral-500">Track and manage your orders</p>
      </header>

      <div className="sticky top-14 z-10 -mx-4 space-y-3 border-b border-neutral-200 bg-neutral-100/95 px-4 pb-3 pt-1 backdrop-blur-sm md:top-16 md:mx-0 md:rounded-xl md:border md:px-4 md:py-3">
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
            placeholder="Search by order number..."
            type="search"
            value={query}
          />
        </label>
      </div>

      {visibleOrders.length === 0 ? (
        <EmptyOrdersState
          message={
            query || activeFilter !== "ALL"
              ? "Try adjusting your filters or search."
              : "When you place an order, it will appear here"
          }
          title="No orders found"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visibleOrders.map((order) => (
            <CustomerOrderCard key={order.orderNumber} order={order} />
          ))}
        </div>
      )}

      {hasMore ? (
        <button
          className="min-h-12 w-full rounded-xl border border-neutral-300 bg-white text-sm font-semibold text-neutral-700 transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50"
          onClick={() => setVisible((current) => current + PAGE_SIZE)}
          type="button"
        >
          Load More Orders
        </button>
      ) : null}
    </div>
  );
}
