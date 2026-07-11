"use client";

import { orderStatusFilters, type CustomerOrderStatus } from "@/components/customer/orders-data";
import { cn } from "@/lib/utils";

type OrderStatusTabsProps = {
  active: CustomerOrderStatus | "ALL";
  counts: Record<CustomerOrderStatus | "ALL", number>;
  onChange: (value: CustomerOrderStatus | "ALL") => void;
};

export function OrderStatusTabs({ active, counts, onChange }: OrderStatusTabsProps) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide snap-x md:mx-0 md:flex-wrap md:px-0">
      {orderStatusFilters.map((filter) => {
        const isActive = active === filter.value;
        const count = counts[filter.value] ?? 0;

        return (
          <button
            key={filter.value}
            aria-pressed={isActive}
            className={cn(
              "inline-flex min-h-9 shrink-0 snap-start items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors duration-200",
              isActive
                ? "bg-brand-green-600 text-white"
                : "bg-neutral-100 text-neutral-500 active:bg-neutral-200 hover:bg-neutral-200"
            )}
            onClick={() => onChange(filter.value)}
            type="button"
          >
            {filter.label}
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                isActive ? "bg-white/20 text-white" : "bg-white text-neutral-500"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
