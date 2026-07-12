import Link from "next/link";

import { cn } from "@/lib/utils";

export type CustomerOrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type RecentOrder = {
  id: string;
  orderNumber: string;
  status: CustomerOrderStatus;
  date: string;
  itemCount: number;
  total: number;
};

const statusPillClass: Record<CustomerOrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-brand-green-100 text-brand-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  })
    .format(value)
    .replace("BDT", "৳");
}

type RecentOrderCardProps = {
  order: RecentOrder;
};

export function RecentOrderCard({ order }: RecentOrderCardProps) {
  return (
    <Link
      className="block rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-colors duration-200 hover:border-brand-green-600/30 active:bg-neutral-50"
      href={`/orders/${order.orderNumber}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-heading text-sm font-bold text-neutral-900">{order.orderNumber}</p>
        <span
          className={cn(
            "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
            statusPillClass[order.status]
          )}
        >
          {order.status}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-sm text-neutral-500">
          {order.date}
          <span className="mx-1.5 text-neutral-300">·</span>
          {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
        </p>
        <p className="font-heading text-base font-bold text-neutral-900">{formatPrice(order.total)}</p>
      </div>
    </Link>
  );
}
