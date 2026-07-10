"use client";

import {
  Check,
  Circle,
  Mail,
  MapPin,
  Phone,
  Printer,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  type AdminOrder,
  formatOrderPrice,
  getOrderTotals,
  orderStatusPillClass,
  type OrderStatus,
} from "@/components/admin/admin-orders-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OrderDetailDrawerProps = {
  open: boolean;
  order: AdminOrder | null;
  onClose: () => void;
};

const timelineSteps = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

const statusLabelMap: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function OrderDetailDrawer({ open, order, onClose }: OrderDetailDrawerProps) {
  const [statusUpdateValue, setStatusUpdateValue] = useState<OrderStatus>("PENDING");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!order) return;
    setStatusUpdateValue(order.status);
    setNote("");
  }, [order]);

  const currentTimelineIndex = useMemo(() => {
    if (!order) return 0;
    if (order.status === "CANCELLED") return 1;
    return Math.max(0, timelineSteps.indexOf(order.status as (typeof timelineSteps)[number]));
  }, [order]);

  if (!order) {
    return null;
  }

  const totals = getOrderTotals(order);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-neutral-950/40 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-screen w-full max-w-[560px] bg-white shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4">
            <div className="space-y-2">
              <h2 className="font-heading text-lg font-bold text-neutral-900">{order.orderNumber}</h2>
              <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", orderStatusPillClass(order.status))}>
                {order.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="Print invoice"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                onClick={() => console.log("Print invoice stub", order.orderNumber)}
                type="button"
              >
                <Printer className="h-4 w-4" />
              </button>

              <button
                aria-label="Close order details"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <section className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
              <h3 className="text-sm font-semibold text-neutral-800">Order Timeline</h3>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {timelineSteps.map((step, index) => {
                  const completed = index < currentTimelineIndex;
                  const current = index === currentTimelineIndex;

                  return (
                    <div key={step} className="flex min-w-max items-center gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px]",
                            completed
                              ? "border-brand-green-600 bg-brand-green-600 text-white"
                              : current
                                ? "border-brand-green-600 bg-brand-green-100 text-brand-green-700 ring-4 ring-brand-green-100/70"
                                : "border-neutral-300 bg-white text-neutral-400"
                          )}
                        >
                          {completed ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                        </span>
                        <span className="text-[11px] font-medium text-neutral-500">{statusLabelMap[step]}</span>
                      </div>

                      {index < timelineSteps.length - 1 ? (
                        <span
                          className={cn(
                            "h-0.5 w-8 rounded-full",
                            index < currentTimelineIndex ? "bg-brand-green-600" : "bg-neutral-300"
                          )}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {order.status === "CANCELLED" ? (
                <p className="text-xs font-medium text-red-600">This order was cancelled before completion.</p>
              ) : null}
            </section>

            <section className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-800">Customer Info</h3>
              <div className="space-y-2 text-sm text-neutral-700">
                <p className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900">{order.customerName}</span>
                </p>
                <p className="flex items-center gap-2 text-neutral-600">
                  <Mail className="h-4 w-4" />
                  {order.customerEmail}
                </p>
                <p className="flex items-center gap-2 text-neutral-600">
                  <Phone className="h-4 w-4" />
                  {order.customerPhone}
                </p>
              </div>

              <button className="text-sm font-medium text-brand-green-600 hover:text-brand-green-900" type="button">
                View Customer Profile
              </button>
            </section>

            <section className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-800">Shipping Address</h3>
              <div className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                <MapPin className="mt-0.5 h-4 w-4 text-neutral-500" />
                <div>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
                  <p>
                    {order.shippingAddress.area}, {order.shippingAddress.city} {order.shippingAddress.postalCode}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-800">Order Items</h3>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-lg border border-neutral-100 p-2.5">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/70 text-xs font-semibold text-neutral-600",
                        item.imageTone
                      )}
                    >
                      IMG
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">{item.name}</p>
                      <p className="text-xs text-neutral-500">
                        Qty {item.quantity} x {formatOrderPrice(item.unitPrice)}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-neutral-900">{formatOrderPrice(item.quantity * item.unitPrice)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 border-t border-neutral-200 pt-3 text-sm text-neutral-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatOrderPrice(totals.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping Fee</span>
                  <span>{formatOrderPrice(totals.shippingFee)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-2 text-base font-bold text-neutral-900">
                  <span>Total</span>
                  <span>{formatOrderPrice(totals.total)}</span>
                </div>
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-800">Status Update</h3>

              <select
                className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                onChange={(event) => setStatusUpdateValue(event.target.value as OrderStatus)}
                value={statusUpdateValue}
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <Button
                className="h-11 w-full rounded-lg bg-brand-green-600 text-white hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
                onClick={() => console.log("Update status stub", order.orderNumber, statusUpdateValue)}
                type="button"
              >
                Update Status
              </Button>
            </section>

            <section className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-800">Payment Info</h3>

              <div className="space-y-1 text-sm text-neutral-600">
                <p>
                  <span className="font-medium text-neutral-800">Method:</span> {order.paymentMethod}
                </p>
                <p>
                  <span className="font-medium text-neutral-800">Transaction ID:</span> {order.transactionId}
                </p>
                <p>
                  <span className="font-medium text-neutral-800">Amount Paid:</span> {formatOrderPrice(totals.total)}
                </p>
                <p className="pt-1">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      order.paymentStatus === "Paid"
                        ? "bg-brand-green-100 text-brand-green-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    Payment {order.paymentStatus}
                  </span>
                </p>
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-800">Internal Notes</h3>

              <textarea
                className="min-h-[92px] w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add operational notes for support, warehouse, or delivery teams..."
                rows={4}
                value={note}
              />

              <button
                className="inline-flex h-9 items-center rounded-lg border border-neutral-200 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                onClick={() => console.log("Save note stub", order.orderNumber, note)}
                type="button"
              >
                Save Note
              </button>
            </section>
          </div>

          <footer className="sticky bottom-0 border-t border-neutral-200 bg-white px-5 py-4">
            <Button className="h-11 w-full rounded-lg" onClick={onClose} type="button" variant="outline">
              Close
            </Button>
          </footer>
        </div>
      </aside>
    </>
  );
}