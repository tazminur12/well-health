"use client";

import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/format-price";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type AdminOrder,
  type OrderStatusValue,
  type PaymentMethodValue,
} from "@/lib/orders/schemas";
import { cn } from "@/lib/utils";

type AdminOrdersTableProps = {
  orders: AdminOrder[];
  totalOrders: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: number) => void;
};

export const orderStatusPillClass: Record<OrderStatusValue, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-brand-green-100 text-brand-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const paymentIconMap: Record<
  PaymentMethodValue,
  React.ComponentType<{ className?: string }>
> = {
  SSLCOMMERZ: CreditCard,
  BKASH: Smartphone,
  COD: Banknote,
};

function formatDateTime(value: string) {
  const date = new Date(value);
  const dateLabel = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateLabel} · ${timeLabel}`;
}

export function AdminOrdersTable({
  orders,
  totalOrders,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: AdminOrdersTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));
  const start = totalOrders === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalOrders);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50/80 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.length === 0 ? (
              <tr>
                <td className="px-4 py-12 text-center text-neutral-500" colSpan={8}>
                  No orders match your filters.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const PaymentIcon = paymentIconMap[order.paymentMethod];
                return (
                  <tr
                    className="transition-colors hover:bg-brand-green-50/40"
                    key={order.id}
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        className="font-semibold text-brand-green-700 hover:underline"
                        href={`/admin/orders/${order.id}`}
                      >
                        {order.orderNumber}
                      </Link>
                      {order.couponCode ? (
                        <p className="mt-0.5 text-xs text-neutral-400">
                          Coupon {order.couponCode}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-neutral-900">{order.customerName}</p>
                      <p className="text-xs text-neutral-500">{order.phone}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-neutral-600">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item) => (
                            <div
                              className="relative h-8 w-8 overflow-hidden rounded-lg border-2 border-white bg-neutral-100"
                              key={item.id}
                            >
                              {item.imageUrl ? (
                                <Image
                                  alt={item.productName}
                                  className="object-cover"
                                  fill
                                  sizes="32px"
                                  src={item.imageUrl}
                                  unoptimized={item.imageUrl.startsWith("/")}
                                />
                              ) : (
                                <span className="flex h-full items-center justify-center text-[9px] text-neutral-400">
                                  —
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        <span className="text-neutral-600">{order.itemCount}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 text-neutral-700">
                        <PaymentIcon className="h-4 w-4 text-neutral-400" />
                        <div>
                          <p className="text-xs font-medium">
                            {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                          </p>
                          <p
                            className={cn(
                              "text-[11px]",
                              order.paymentStatus === "PAID"
                                ? "text-brand-green-600"
                                : order.paymentStatus === "FAILED" ||
                                    order.paymentStatus === "REFUNDED"
                                  ? "text-red-600"
                                  : "text-amber-600"
                            )}
                          >
                            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-neutral-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          orderStatusPillClass[order.status]
                        )}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors hover:border-brand-green-200 hover:bg-brand-green-50 hover:text-brand-green-700"
                        href={`/admin/orders/${order.id}`}
                        title="View order"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-500">
          Showing {start}–{end} of {totalOrders}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-400"
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            value={pageSize}
          >
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
          <button
            className="inline-flex h-9 items-center gap-1 rounded-xl border border-neutral-200 px-3 text-sm font-medium text-neutral-700 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <span className="px-2 text-sm text-neutral-500">
            {page} / {totalPages}
          </span>
          <button
            className="inline-flex h-9 items-center gap-1 rounded-xl border border-neutral-200 px-3 text-sm font-medium text-neutral-700 disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            type="button"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
