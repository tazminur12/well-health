"use client";

import Image from "next/image";
import Link from "next/link";
import { Truck } from "lucide-react";

import {
  formatOrderDate,
  formatPrice,
  orderItemCount,
  orderStatusPillClass,
  type CustomerOrder,
} from "@/components/customer/orders-data";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/orders/schemas";
import { cn } from "@/lib/utils";

type CustomerOrderCardProps = {
  order: CustomerOrder;
};

function OrderAction({ order }: { order: CustomerOrder }) {
  const base =
    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors duration-200";
  const outlineGreen = cn(
    base,
    "border border-brand-green-600 text-brand-green-600 hover:bg-brand-green-100 active:bg-brand-green-100"
  );
  const solidGreen = cn(
    base,
    "bg-brand-green-600 text-white hover:bg-brand-green-900 active:bg-brand-green-900"
  );

  switch (order.status) {
    case "SHIPPED":
      return (
        <span className={solidGreen}>
          <Truck className="h-3.5 w-3.5" />
          Track
        </span>
      );
    case "DELIVERED":
      return <span className={outlineGreen}>Reorder</span>;
    case "CANCELLED":
      return (
        <span
          className={cn(
            base,
            "border border-neutral-300 text-neutral-500 hover:bg-neutral-50"
          )}
        >
          Details
        </span>
      );
    default:
      return <span className={outlineGreen}>View status</span>;
  }
}

export function CustomerOrderCard({ order }: CustomerOrderCardProps) {
  const count = orderItemCount(order);
  const thumbs = order.items.slice(0, 3);

  return (
    <Link
      className="block rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-brand-green-600/30 hover:shadow-md active:scale-[0.99]"
      href={`/orders/${order.orderNumber}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading text-sm font-bold text-neutral-900">
            {order.orderNumber}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">
            Placed on {formatOrderDate(order.placedAt)} ·{" "}
            {PAYMENT_METHOD_LABELS[order.paymentMethod]}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
            orderStatusPillClass[order.status]
          )}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="my-3 border-t border-neutral-100" />

      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {thumbs.map((item) => (
            <span
              className="relative flex h-9 w-9 overflow-hidden rounded-lg border-2 border-white bg-neutral-100 ring-1 ring-neutral-200"
              key={item.id}
            >
              {item.imageUrl ? (
                <Image
                  alt={item.name}
                  className="object-cover"
                  fill
                  sizes="36px"
                  src={item.imageUrl}
                  unoptimized={item.imageUrl.startsWith("/")}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[8px] font-medium uppercase text-neutral-400">
                  {item.name.slice(0, 2)}
                </span>
              )}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-neutral-700">
            {order.items[0]?.name}
            {count > (order.items[0]?.quantity ?? 0)
              ? ` + ${count - (order.items[0]?.quantity ?? 0)} more`
              : ""}
          </p>
          <p className="text-xs text-neutral-500">
            {count} {count === 1 ? "item" : "items"}
          </p>
        </div>
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
