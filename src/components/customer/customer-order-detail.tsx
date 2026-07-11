"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Download,
  MapPin,
  MessageCircle,
  Package,
  RotateCcw,
  Smartphone,
  Truck,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { AuthToast } from "@/components/auth/auth-toast";
import { OrderTimeline } from "@/components/customer/order-timeline";
import {
  formatOrderDate,
  formatPrice,
  orderStatusPillClass,
  type CustomerOrder,
} from "@/components/customer/orders-data";
import { cn } from "@/lib/utils";

const paymentIconMap = {
  SSLCommerz: CreditCard,
  bKash: Smartphone,
  "Cash on Delivery": Banknote,
} as const;

type CustomerOrderDetailProps = {
  order: CustomerOrder;
};

export function CustomerOrderDetail({ order }: CustomerOrderDetailProps) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const PaymentIcon = paymentIconMap[order.paymentMethod];
  const cancellable = order.status === "PENDING" || order.status === "PAID";
  const address = order.shippingAddress;

  const outline =
    "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors duration-200";
  const solid =
    "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-green-600 px-4 text-sm font-semibold text-white transition-colors duration-200 active:bg-brand-green-900 hover:bg-brand-green-900";

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Link
            aria-label="Back to orders"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-neutral-700 transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50"
            href="/orders"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="min-w-0 truncate font-heading text-xl font-bold text-neutral-900 sm:text-2xl">
            Order {order.orderNumber}
          </h1>
        </div>
        <div className="flex items-center gap-2 pl-[52px]">
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
              orderStatusPillClass[order.status]
            )}
          >
            {order.status}
          </span>
          <span className="text-xs text-neutral-400">Placed on {formatOrderDate(order.placedAt)}</span>
        </div>
      </header>

      <OrderTimeline order={order} />

      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-neutral-900">
          <MapPin className="h-4.5 w-4.5 text-brand-green-600" />
          Shipping Address
        </h2>
        <div className="mt-3 text-sm text-neutral-600">
          <p className="font-medium text-neutral-900">{address.fullName}</p>
          <p className="mt-0.5">+880 {address.phone}</p>
          <p className="mt-0.5">
            {address.details}, {address.area}, {address.district}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-neutral-900">
          <Package className="h-4.5 w-4.5 text-brand-green-600" />
          Order Items
        </h2>

        <div className="mt-3 divide-y divide-neutral-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0">
              <span
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-neutral-200",
                  item.imageTone
                )}
              >
                <span className="text-[9px] font-medium uppercase tracking-wide text-neutral-400">
                  {item.name.slice(0, 3)}
                </span>
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900">{item.name}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>

              <p className="shrink-0 text-sm font-semibold text-neutral-900">
                {formatPrice(item.unitPrice * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2 border-t border-neutral-200 pt-3 text-sm">
          <div className="flex justify-between text-neutral-500">
            <span>Subtotal</span>
            <span className="text-neutral-700">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>Shipping Fee</span>
            <span className="text-neutral-700">{formatPrice(order.shippingFee)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
            <span className="font-heading text-base font-bold text-neutral-900">Total</span>
            <span className="font-heading text-lg font-bold text-brand-green-600">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="font-heading text-base font-bold text-neutral-900">Payment Info</h2>
        <div className="mt-3 space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
              <PaymentIcon className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-neutral-900">{order.paymentMethod}</p>
              <p className="truncate text-xs text-neutral-500">Txn: {order.transactionId}</p>
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                order.paymentStatus === "Paid"
                  ? "bg-brand-green-100 text-brand-green-600"
                  : "bg-amber-100 text-amber-700"
              )}
            >
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {cancellable ? (
          <button
            className={cn(outline, "border-red-600 text-red-600 active:bg-red-50 hover:bg-red-50")}
            onClick={() => showToast("Order cancellation requested")}
            type="button"
          >
            <XCircle className="h-4 w-4" />
            Cancel Order
          </button>
        ) : null}

        {order.status === "SHIPPED" ? (
          <button className={solid} onClick={() => showToast("Opening shipment tracker…")} type="button">
            <Truck className="h-4 w-4" />
            Track Shipment
          </button>
        ) : null}

        {order.status === "DELIVERED" ? (
          <button className={solid} onClick={() => showToast("Items added to cart")} type="button">
            <RotateCcw className="h-4 w-4" />
            Reorder
          </button>
        ) : null}

        <button
          className={cn(outline, "border-neutral-300 text-neutral-700 active:bg-neutral-100 hover:bg-neutral-50")}
          onClick={() => showToast("Preparing invoice…")}
          type="button"
        >
          <Download className="h-4 w-4" />
          Download Invoice
        </button>

        <Link
          className={cn(
            outline,
            "border-brand-green-600 text-brand-green-600 active:bg-brand-green-100 hover:bg-brand-green-100"
          )}
          href="/messages"
        >
          <MessageCircle className="h-4 w-4" />
          Need Help? Chat with Support
        </Link>
      </div>

      <AuthToast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
