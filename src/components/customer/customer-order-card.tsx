"use client";

import Link from "next/link";
import { Truck } from "lucide-react";

import {
  formatOrderDate,
  formatPrice,
  orderItemCount,
  orderStatusPillClass,
  type CustomerOrder,
} from "@/components/customer/orders-data";
import { cn } from "@/lib/utils";

type CustomerOrderCardProps = {
  order: CustomerOrder;
};

function OrderAction({ order }: { order: CustomerOrder }) {
  const base =
    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors duration-200";
  const outlineGreen = cn(
    base,
    "border border-brand-green-600 text-brand-green-600 active:bg-brand-green-100 hover:bg-brand-green-100"
  );
  const solidGreen = cn(
    base,
    "bg-brand-green-600 text-white active:bg-brand-green-900 hover:bg-brand-green-900"
  );

  const handleClick = (event: React.MouseEvent) => {
    // Prevent the wrapping card link from also navigating.
    event.stopPropagation();
  };

  switch (order.status) {
    case "SHIPPED":
      return (
        <span className={solidGreen} onClick={handleClick}>
          <Truck className="h-3.5 w-3.5" />
          Track Shipment
        </span>
      );
    case "DELIVERED":
      return (
        <span className="flex items-center gap-3" onClick={handleClick}>
          <span className="text-xs font-semibold text-neutral-500 underline-offset-2 active:text-neutral-700 hover:underline">
            Write Review
          </span>
          <span className={outlineGreen}>Reorder</span>
        </span>
      );
    case "CANCELLED":
      return (
        <span
          className={cn(
            base,
            "border border-neutral-300 text-neutral-500 active:bg-neutral-100 hover:bg-neutral-50"
          )}
          onClick={handleClick}
        >
          View Details
        </span>
      );
    default:
      return (
        <span className={outlineGreen} onClick={handleClick}>
          Track Order
        </span>
      );
  }
}

export function CustomerOrderCard({ order }: CustomerOrderCardProps) {
  const count = orderItemCount(order);
  const thumbs = order.items.slice(0, 3);

  return (
    <Link
      className="block rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-200 active:scale-[0.98] active:bg-neutral-50 hover:border-brand-green-600/30"
      href={`/orders/${order.orderNumber}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading text-sm font-bold text-neutral-900">{order.orderNumber}</p>
          <p className="mt-0.5 text-xs text-neutral-400">
            Placed on {formatOrderDate(order.placedAt)}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
            orderStatusPillClass[order.status]
          )}
        >
          {order.status}
        </span>
      </div>

      <div className="my-3 border-t border-neutral-100" />

      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {thumbs.map((item) => (
            <span
              key={item.id}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border-2 border-white ring-1 ring-neutral-200",
                item.imageTone
              )}
            >
              <span className="text-[8px] font-medium uppercase tracking-wide text-neutral-400">
                {item.name.slice(0, 2)}
              </span>
            </span>
          ))}
        </div>
        <p className="text-sm text-neutral-500">
          {count} {count === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="font-heading text-lg font-bold text-brand-green-600">
          {formatPrice(order.total)}
        </p>
        <OrderAction order={order} />
      </div>
    </Link>
  );
}
