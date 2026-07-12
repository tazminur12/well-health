"use client";

import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  Download,
  Loader2,
  MapPin,
  Package2,
  Printer,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import { orderStatusPillClass } from "@/components/admin/admin-orders-table";
import { Button } from "@/components/ui/button";
import { useAdminOrder, useOrderMutations } from "@/hooks/use-admin-orders";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import { formatPrice } from "@/lib/format-price";
import { downloadOrderInvoicePdf } from "@/lib/orders/invoice-pdf";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  type OrderStatusValue,
  type PaymentStatusValue,
} from "@/lib/orders/schemas";
import { getStoreSettingsAction } from "@/lib/settings/actions";
import { defaultStoreSettings } from "@/lib/settings/schemas";
import { cn } from "@/lib/utils";

/** Online / prepaid flow */
const prepaidTimeline: OrderStatusValue[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

/** COD — cash is collected on delivery, so PAID order-status is skipped */
const codTimeline: OrderStatusValue[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

const COD_NEXT: Partial<
  Record<OrderStatusValue, { next: OrderStatusValue; label: string; hint: string }>
> = {
  PENDING: {
    next: "PROCESSING",
    label: "Confirm & start packing",
    hint: "Order confirmed — move to packing / processing.",
  },
  PROCESSING: {
    next: "SHIPPED",
    label: "Mark as shipped",
    hint: "Handed to courier — out for delivery.",
  },
  SHIPPED: {
    next: "DELIVERED",
    label: "Delivered · cash collected",
    hint: "Customer received the order and paid COD. Payment will be marked Paid.",
  },
};

const PREPAID_NEXT: Partial<
  Record<OrderStatusValue, { next: OrderStatusValue; label: string; hint: string }>
> = {
  PENDING: {
    next: "PAID",
    label: "Mark payment received",
    hint: "Confirm online / bKash payment before packing.",
  },
  PAID: {
    next: "PROCESSING",
    label: "Start processing",
    hint: "Payment confirmed — start packing.",
  },
  PROCESSING: {
    next: "SHIPPED",
    label: "Mark as shipped",
    hint: "Handed to courier.",
  },
  SHIPPED: {
    next: "DELIVERED",
    label: "Mark as delivered",
    hint: "Customer received the order.",
  },
};

function timelineIndex(timeline: OrderStatusValue[], status: OrderStatusValue) {
  if (status === "CANCELLED") return -1;
  // Map PAID onto PROCESSING slot for COD timeline display if somehow set
  const normalized =
    timeline.includes(status)
      ? status
      : status === "PAID"
        ? "PROCESSING"
        : status;
  const index = timeline.indexOf(normalized);
  return Math.max(0, index);
}

type AdminOrderDetailProps = {
  orderId: string;
};

export function AdminOrderDetail({ orderId }: AdminOrderDetailProps) {
  const { data: order, isLoading, isError, error, refetch } = useAdminOrder(orderId);
  const { updateStatus, updatePayment, updateNotes } = useOrderMutations();
  const [isPdfPending, startPdf] = useTransition();

  const [status, setStatus] = useState<OrderStatusValue>("PENDING");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusValue>("UNPAID");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!order) return;
    setStatus(order.status);
    setPaymentStatus(order.paymentStatus);
    setNotes(order.notes ?? "");
  }, [order]);

  function handleInvoicePdf(mode: "download" | "print") {
    if (!order) return;
    startPdf(async () => {
      try {
        const settingsResult = await getStoreSettingsAction();
        const store = settingsResult.data ?? defaultStoreSettings;
        downloadOrderInvoicePdf({
          order,
          store,
          openPrint: mode === "print",
        });
        if (mode === "download") {
          await showAdminSuccess("Invoice ready", `${order.orderNumber}.pdf downloaded.`);
        }
      } catch (err) {
        await showAdminError(
          "PDF failed",
          err instanceof Error ? err.message : "Could not generate invoice PDF."
        );
      }
    });
  }

  async function handleStatusUpdate(nextStatus?: OrderStatusValue) {
    if (!order) return;
    const target = nextStatus ?? status;

    if (target === "CANCELLED" && order.status !== "CANCELLED") {
      const ok = await confirmAdminAction({
        title: "Cancel this order?",
        text: "Stock will be restored for linked products. This cannot be undone.",
        confirmText: "Cancel order",
      });
      if (!ok) return;
    }

    if (target === "DELIVERED" && order.paymentMethod === "COD" && order.paymentStatus !== "PAID") {
      const ok = await confirmAdminAction({
        title: "Mark delivered?",
        text: `Confirm cash of ${formatPrice(order.total)} was collected from the customer. Payment will be marked Paid.`,
        confirmText: "Yes, cash collected",
      });
      if (!ok) return;
    }

    try {
      const updated = await updateStatus.mutateAsync({ id: order.id, status: target });
      setStatus(updated.status);
      setPaymentStatus(updated.paymentStatus);
      await showAdminSuccess(
        "Status updated",
        `${updated.orderNumber} is now ${ORDER_STATUS_LABELS[updated.status]}.`
      );
      void refetch();
    } catch (err) {
      await showAdminError(
        "Update failed",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  async function handlePaymentUpdate() {
    if (!order) return;
    try {
      await updatePayment.mutateAsync({ id: order.id, paymentStatus });
      await showAdminSuccess("Payment updated", "Payment status saved.");
      void refetch();
    } catch (err) {
      await showAdminError(
        "Update failed",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  async function handleNotesSave() {
    if (!order) return;
    try {
      await updateNotes.mutateAsync({ id: order.id, notes });
      await showAdminSuccess("Notes saved", "Internal notes updated.");
      void refetch();
    } catch (err) {
      await showAdminError(
        "Save failed",
        err instanceof Error ? err.message : "Please try again."
      );
    }
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
        <div className="mt-4 flex justify-center gap-2">
          <Button asChild className="rounded-xl" variant="outline">
            <Link href="/admin/orders">Back to orders</Link>
          </Button>
          <Button className="rounded-xl" onClick={() => void refetch()} type="button">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const isCod = order.paymentMethod === "COD";
  const timeline = isCod ? codTimeline : prepaidTimeline;
  const activeTimelineIndex = timelineIndex(timeline, order.status);
  const nextAction = (isCod ? COD_NEXT : PREPAID_NEXT)[order.status];
  const statusOptions = isCod
    ? ORDER_STATUSES.filter((value) => value !== "PAID")
    : ORDER_STATUSES;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-brand-green-700"
            href="/admin/orders"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-neutral-900">
              {order.orderNumber}
            </h1>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                orderStatusPillClass[order.status]
              )}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            {isCod ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                <Banknote className="h-3.5 w-3.5" />
                Cash on Delivery
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            Placed{" "}
            {new Date(order.createdAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-xl"
            disabled={isPdfPending}
            onClick={() => handleInvoicePdf("download")}
            type="button"
            variant="outline"
          >
            {isPdfPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </Button>
          <Button
            className="rounded-xl bg-brand-green-600 hover:bg-brand-green-900"
            disabled={isPdfPending}
            onClick={() => handleInvoicePdf("print")}
            type="button"
          >
            {isPdfPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            Print invoice
          </Button>
        </div>
      </div>

      {isCod && order.status !== "CANCELLED" && order.status !== "DELIVERED" ? (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                COD fulfillment
              </p>
              <h2 className="mt-1 font-heading text-lg font-bold text-neutral-900">
                {nextAction?.label ?? "Order complete"}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-neutral-600">
                {nextAction?.hint ??
                  "No further status steps. Cash should already be marked collected."}
                {" "}
                Payment stays <strong>Unpaid</strong> until you mark{" "}
                <strong>Delivered</strong> (cash collected).
              </p>
            </div>
            {nextAction ? (
              <Button
                className="shrink-0 rounded-xl bg-brand-green-600 hover:bg-brand-green-900"
                disabled={updateStatus.isPending}
                onClick={() => void handleStatusUpdate(nextAction.next)}
                type="button"
              >
                {updateStatus.isPending ? (
                  "Updating…"
                ) : (
                  <>
                    {nextAction.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-neutral-500">
            <span>Flow:</span>
            <span>Pending</span>
            <span>→</span>
            <span>Processing</span>
            <span>→</span>
            <span>Shipped</span>
            <span>→</span>
            <span className="text-brand-green-700">Delivered + Paid</span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-neutral-900">Fulfillment</h2>
            {order.status === "CANCELLED" ? (
              <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                This order was cancelled. Stock has been restored where possible.
              </p>
            ) : (
              <ol className="mt-5 space-y-0">
                {timeline.map((step, index) => {
                  const done = index <= activeTimelineIndex;
                  const current = index === activeTimelineIndex;
                  return (
                    <li className="flex gap-3" key={step}>
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                            done
                              ? "border-brand-green-600 bg-brand-green-600 text-white"
                              : "border-neutral-200 bg-white text-neutral-400"
                          )}
                        >
                          {done ? <Check className="h-4 w-4" /> : index + 1}
                        </span>
                        {index < timeline.length - 1 ? (
                          <span
                            className={cn(
                              "my-1 w-px flex-1 min-h-6",
                              index < activeTimelineIndex
                                ? "bg-brand-green-400"
                                : "bg-neutral-200"
                            )}
                          />
                        ) : null}
                      </div>
                      <div className={cn("pb-5", current && "pt-1")}>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            done ? "text-neutral-900" : "text-neutral-400"
                          )}
                        >
                          {ORDER_STATUS_LABELS[step]}
                          {isCod && step === "DELIVERED" ? (
                            <span className="ml-2 text-xs font-medium text-brand-green-600">
                              (+ cash paid)
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-heading text-lg font-bold text-neutral-900">
              Order items
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50/60 p-3"
                  key={item.id}
                >
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-white">
                    {item.imageUrl ? (
                      <Image
                        alt={item.productName}
                        className="object-cover"
                        fill
                        sizes="56px"
                        src={item.imageUrl}
                        unoptimized={item.imageUrl.startsWith("/")}
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-neutral-300">
                        <Package2 className="h-5 w-5" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-neutral-900">{item.productName}</p>
                    <p className="text-xs text-neutral-500">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-semibold text-neutral-900">
                    {formatPrice(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between text-brand-green-700">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>−{formatPrice(order.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span>
                  {order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-3 text-base font-semibold text-neutral-900">
                <span>Total</span>
                <span className="text-brand-green-700">{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-brand-green-600" />
              <h2 className="font-heading text-lg font-bold text-neutral-900">Customer</h2>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-neutral-500">Name</dt>
                <dd className="font-medium text-neutral-900">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Email</dt>
                <dd className="text-neutral-800">{order.email}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Phone</dt>
                <dd className="text-neutral-800">{order.phone}</dd>
              </div>
            </dl>
            {order.userId ? (
              <Link
                className="mt-4 inline-flex text-sm font-semibold text-brand-green-700 hover:underline"
                href={`/admin/customers/${order.userId}`}
              >
                View customer profile
              </Link>
            ) : null}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-green-600" />
              <h2 className="font-heading text-lg font-bold text-neutral-900">Shipping</h2>
            </div>
            <div className="mt-4 space-y-1 text-sm text-neutral-700">
              <p className="font-medium text-neutral-900">{order.shippingFullName}</p>
              <p>{order.shippingPhone}</p>
              <p>{order.shippingDetails}</p>
              <p>
                {order.shippingArea}, {order.shippingDistrict}
              </p>
              {order.shippingZoneName ? (
                <p className="pt-2 text-xs text-neutral-500">
                  Zone: {order.shippingZoneName}
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-neutral-900">Update status</h2>
            <p className="mt-1 text-xs text-neutral-500">
              {isCod
                ? "Use the COD button above for the next step, or pick any status manually."
                : "Advance prepaid orders after payment is confirmed."}
            </p>
            <select
              className="mt-3 h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-400"
              disabled={order.status === "CANCELLED"}
              onChange={(event) => setStatus(event.target.value as OrderStatusValue)}
              value={status === "PAID" && isCod ? "PROCESSING" : status}
            >
              {statusOptions.map((value) => (
                <option key={value} value={value}>
                  {ORDER_STATUS_LABELS[value]}
                  {isCod && value === "DELIVERED" ? " (collect cash)" : ""}
                </option>
              ))}
            </select>
            <Button
              className="mt-3 w-full rounded-xl bg-brand-green-600 hover:bg-brand-green-900"
              disabled={
                updateStatus.isPending ||
                order.status === "CANCELLED" ||
                status === order.status
              }
              onClick={() => void handleStatusUpdate()}
              type="button"
            >
              {updateStatus.isPending ? "Updating…" : "Update status"}
            </Button>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-neutral-900">Payment</h2>
            {isCod ? (
              <p className="mt-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                COD: keep as Unpaid while packing/shipping. When you mark Delivered, payment
                becomes Paid automatically.
              </p>
            ) : null}
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Method</dt>
                <dd className="font-medium text-neutral-900">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Current</dt>
                <dd className="font-medium text-neutral-900">
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                </dd>
              </div>
            </dl>
            <select
              className="mt-3 h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-400"
              disabled={order.status === "CANCELLED"}
              onChange={(event) =>
                setPaymentStatus(event.target.value as PaymentStatusValue)
              }
              value={paymentStatus}
            >
              {PAYMENT_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {PAYMENT_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
            <Button
              className="mt-3 w-full rounded-xl"
              disabled={
                updatePayment.isPending ||
                order.status === "CANCELLED" ||
                paymentStatus === order.paymentStatus
              }
              onClick={() => void handlePaymentUpdate()}
              type="button"
              variant="outline"
            >
              {updatePayment.isPending ? "Saving…" : "Update payment"}
            </Button>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-neutral-900">
              Internal notes
            </h2>
            <textarea
              className="mt-3 min-h-[110px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-green-400"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Staff notes for this order…"
              value={notes}
            />
            <Button
              className="mt-3 w-full rounded-xl"
              disabled={updateNotes.isPending}
              onClick={() => void handleNotesSave()}
              type="button"
              variant="outline"
            >
              {updateNotes.isPending ? "Saving…" : "Save notes"}
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}
