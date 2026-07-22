"use client";

import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Download,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  RotateCcw,
  Smartphone,
  Truck,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { OrderTimeline } from "@/components/customer/order-timeline";
import {
  formatOrderDate,
  formatPrice,
  orderStatusPillClass,
  type CustomerOrder,
} from "@/components/customer/orders-data";
import { Button } from "@/components/ui/button";
import { useMyOrder, useMyOrderMutations } from "@/hooks/use-my-orders";
import { confirmAction, showError, showSuccess } from "@/lib/alerts";
import { downloadOrderInvoicePdf } from "@/lib/orders/invoice-pdf";
import type { AdminOrder } from "@/lib/orders/schemas";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/orders/schemas";
import { defaultStoreSettings } from "@/lib/settings/schemas";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

const paymentIconMap = {
  SSLCOMMERZ: CreditCard,
  BKASH: Smartphone,
  COD: Banknote,
} as const;

function toAdminOrderShape(order: CustomerOrder): AdminOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: null,
    email: "",
    phone: order.shippingPhone,
    customerName: order.shippingFullName,
    shippingFullName: order.shippingFullName,
    shippingPhone: order.shippingPhone,
    shippingDistrict: order.shippingDistrict,
    shippingArea: order.shippingArea,
    shippingDetails: order.shippingDetails,
    shippingZoneId: null,
    shippingZoneName: order.shippingZoneName,
    shippingFee: order.shippingFee,
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    status: order.status,
    notes: order.notes,
    couponCode: order.couponCode,
    itemCount: order.itemCount,
    createdAt: order.placedAt,
    updatedAt: order.updatedAt,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.name,
      productSlug: item.slug,
      productSku: null,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      imageUrl: item.imageUrl,
    })),
  };
}

type CustomerOrderDetailProps = {
  orderNumber: string;
};

export function CustomerOrderDetail({ orderNumber }: CustomerOrderDetailProps) {
  const router = useRouter();
  const { data: order, isLoading, isError, error, refetch } = useMyOrder(orderNumber);
  const { cancelOrder } = useMyOrderMutations();
  const addItem = useCartStore((state) => state.addItem);
  const [pdfPending, startPdf] = useTransition();

  const outline =
    "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors duration-200";
  const solid =
    "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-green-900 active:bg-brand-green-900";

  async function handleCancel() {
    if (!order) return;
    const ok = await confirmAction({
      title: "Cancel this order?",
      text: "Stock will be released. This cannot be undone.",
      confirmText: "Cancel order",
      cancelText: "Keep order",
      icon: "warning",
    });
    if (!ok) return;
    try {
      await cancelOrder.mutateAsync(order.orderNumber);
      await showSuccess("Order cancelled", `${order.orderNumber} has been cancelled.`);
      void refetch();
    } catch (err) {
      await showError(
        "Could not cancel",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  function handleReorder() {
    if (!order) return;
    for (const item of order.items) {
      if (!item.productId) continue;
      addItem(
        {
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          price: item.unitPrice,
          imageUrl: item.imageUrl ?? undefined,
        },
        item.quantity
      );
    }
    void showSuccess("Added to cart", "Items from this order are in your cart.");
    router.push("/cart");
  }

  function handleInvoice(mode: "download" | "print") {
    if (!order) return;
    startPdf(() => {
      try {
        downloadOrderInvoicePdf({
          order: toAdminOrderShape(order),
          store: defaultStoreSettings,
          openPrint: mode === "print",
        });
        if (mode === "download") {
          void showSuccess("Invoice ready", `${order.orderNumber}.pdf downloaded.`);
        }
      } catch (err) {
        void showError(
          "PDF failed",
          err instanceof Error ? err.message : "Could not generate invoice."
        );
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-neutral-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading order…
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center">
        <p className="font-medium text-red-700">
          {error instanceof Error ? error.message : "Order not found."}
        </p>
        <Button asChild className="mt-4 rounded-xl" variant="outline">
          <Link href="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const PaymentIcon = paymentIconMap[order.paymentMethod];
  const cancellable =
    order.status === "PENDING" ||
    (order.status === "PAID" && order.paymentMethod !== "COD");

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Link
            aria-label="Back to orders"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-neutral-700 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
            href="/orders"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="min-w-0 truncate font-heading text-xl font-bold text-neutral-900 sm:text-2xl">
            Order {order.orderNumber}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 pl-[52px]">
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
              orderStatusPillClass[order.status]
            )}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          <span className="text-xs text-neutral-400">
            Placed on {formatOrderDate(order.placedAt)}
          </span>
        </div>
      </header>

      {order.paymentMethod === "COD" && order.paymentStatus === "UNPAID" && order.status !== "CANCELLED" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Cash on Delivery</strong> — please keep{" "}
          <strong>{formatPrice(order.total)}</strong> ready for the delivery agent.
        </div>
      ) : null}

      <OrderTimeline order={order} />

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-neutral-900">
          <MapPin className="h-4 w-4 text-brand-green-600" />
          Shipping address
        </h2>
        <div className="mt-3 text-sm text-neutral-600">
          <p className="font-medium text-neutral-900">{order.shippingFullName}</p>
          <p className="mt-0.5">{order.shippingPhone}</p>
          <p className="mt-0.5">
            {order.shippingDetails}, {order.shippingArea}, {order.shippingDistrict}
          </p>
          {order.shippingZoneName ? (
            <p className="mt-2 text-xs text-neutral-400">Zone: {order.shippingZoneName}</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-neutral-900">
          <Package className="h-4 w-4 text-brand-green-600" />
          Order items
        </h2>

        <div className="mt-3 divide-y divide-neutral-100">
          {order.items.map((item) => (
            <div className="flex items-center gap-3 py-3 first:pt-0" key={item.id}>
              <span className="relative flex h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                {item.imageUrl ? (
                  <Image
                    alt={item.name}
                    className="object-cover"
                    fill
                    sizes="56px"
                    src={item.imageUrl}
                    unoptimized={item.imageUrl.startsWith("/")}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[9px] font-medium uppercase text-neutral-400">
                    {item.name.slice(0, 3)}
                  </span>
                )}
              </span>

              <div className="min-w-0 flex-1">
                {item.slug ? (
                  <Link
                    className="truncate text-sm font-medium text-neutral-900 hover:text-brand-green-700 hover:underline"
                    href={`/shop/${item.slug}`}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <p className="truncate text-sm font-medium text-neutral-900">{item.name}</p>
                )}
                <p className="mt-0.5 text-xs text-neutral-500">
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>

              <p className="shrink-0 text-sm font-semibold text-neutral-900">
                {formatPrice(item.lineTotal)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2 border-t border-neutral-200 pt-3 text-sm">
          <div className="flex justify-between text-neutral-500">
            <span>Subtotal</span>
            <span className="text-neutral-700">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 ? (
            <div className="flex justify-between text-brand-green-700">
              <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
              <span>−{formatPrice(order.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-neutral-500">
            <span>Shipping</span>
            <span className="text-neutral-700">
              {order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
            <span className="font-heading text-base font-bold text-neutral-900">Total</span>
            <span className="font-heading text-lg font-bold text-brand-green-600">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="font-heading text-base font-bold text-neutral-900">Payment</h2>
        <div className="mt-3 flex items-center gap-3 text-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
            <PaymentIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-neutral-900">
              {PAYMENT_METHOD_LABELS[order.paymentMethod]}
            </p>
            <p className="text-xs text-neutral-500">
              {PAYMENT_STATUS_LABELS[order.paymentStatus]}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
              order.paymentStatus === "PAID"
                ? "bg-brand-green-100 text-brand-green-600"
                : order.paymentStatus === "UNPAID"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
            )}
          >
            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </span>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {cancellable ? (
          <button
            className={cn(outline, "border-red-600 text-red-600 hover:bg-red-50 active:bg-red-50")}
            disabled={cancelOrder.isPending}
            onClick={() => void handleCancel()}
            type="button"
          >
            <XCircle className="h-4 w-4" />
            {cancelOrder.isPending ? "Cancelling…" : "Cancel order"}
          </button>
        ) : null}

        {order.status === "SHIPPED" ? (
          <span className={solid}>
            <Truck className="h-4 w-4" />
            Out for delivery
          </span>
        ) : null}

        {order.status === "DELIVERED" ? (
          <button className={solid} onClick={handleReorder} type="button">
            <RotateCcw className="h-4 w-4" />
            Reorder
          </button>
        ) : null}

        <button
          className={cn(outline, "border-neutral-300 text-neutral-700 hover:bg-neutral-50")}
          disabled={pdfPending}
          onClick={() => handleInvoice("download")}
          type="button"
        >
          {pdfPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download invoice
        </button>

        <Link
          className={cn(
            outline,
            "border-brand-green-600 text-brand-green-600 hover:bg-brand-green-50"
          )}
          href="/contact"
        >
          <MessageCircle className="h-4 w-4" />
          Need help?
        </Link>
      </div>
    </div>
  );
}
