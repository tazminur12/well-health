"use client";

import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Smartphone,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "SSLCommerz" | "bKash" | "Cash on Delivery";

export type OrderLineItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  imageTone: string;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  placedAt: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  shippingFee: number;
  transactionId: string;
  paymentStatus: "Paid" | "Pending";
  shippingAddress: {
    line1: string;
    line2?: string;
    area: string;
    city: string;
    postalCode: string;
  };
  items: OrderLineItem[];
};

type AdminOrdersTableProps = {
  orders: AdminOrder[];
  totalOrders: number;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  onView: (order: AdminOrder) => void;
};

const statusPillClass: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-brand-green-100 text-brand-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const paymentIconMap = {
  SSLCommerz: CreditCard,
  bKash: Smartphone,
  "Cash on Delivery": Banknote,
} satisfies Record<PaymentMethod, React.ComponentType<{ className?: string }>>;

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  })
    .format(value)
    .replace("BDT", "৳");
}

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

  return { dateLabel, timeLabel };
}

function getOrderTotal(order: AdminOrder) {
  const subtotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  return subtotal + order.shippingFee;
}

export function AdminOrdersTable({
  orders,
  totalOrders,
  pageSize,
  onPageSizeChange,
  onView,
}: AdminOrdersTableProps) {
  const showingEnd = orders.length;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1080px] w-full text-left">
          <thead className="border-b border-neutral-200 bg-neutral-50/70 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const PaymentIcon = paymentIconMap[order.paymentMethod];
              const { dateLabel, timeLabel } = formatDateTime(order.placedAt);

              return (
                <tr
                  key={order.id}
                  className="cursor-pointer border-b border-neutral-100 text-sm hover:bg-neutral-100/70"
                  onClick={() => onView(order)}
                >
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-neutral-900">{order.orderNumber}</td>

                  <td className="px-4 py-3">
                    <p className="font-semibold text-neutral-900">{order.customerName}</p>
                    <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-700">{dateLabel}</p>
                    <p className="text-xs text-neutral-400">{timeLabel}</p>
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                      {order.items.length} items
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-neutral-700">
                      <PaymentIcon className="h-4 w-4" />
                      <span className="text-sm">{order.paymentMethod}</span>
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right font-semibold text-neutral-900">{formatPrice(getOrderTotal(order))}</td>

                  <td className="px-4 py-3">
                    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", statusPillClass[order.status])}>
                      {order.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        aria-label={`View details for ${order.orderNumber}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200/70 hover:text-neutral-800"
                        onClick={(event) => {
                          event.stopPropagation();
                          onView(order);
                        }}
                        title="View Details"
                        type="button"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {orders.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-neutral-500" colSpan={8}>
                  No orders found for the selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 text-sm text-neutral-500">
        <p>
          Showing 1-{showingEnd} of {totalOrders}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          <button
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={orders.length < pageSize}
            type="button"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>

          <label className="inline-flex items-center gap-2 pl-1 text-neutral-600">
            <span>Per page</span>
            <select
              className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              value={pageSize}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
      </footer>
    </div>
  );
}

export function orderStatusPillClass(status: OrderStatus) {
  return statusPillClass[status];
}

export function getOrderTotals(order: AdminOrder) {
  const subtotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = subtotal + order.shippingFee;

  return {
    subtotal,
    shippingFee: order.shippingFee,
    total,
  };
}

export function formatOrderPrice(value: number) {
  return formatPrice(value);
}