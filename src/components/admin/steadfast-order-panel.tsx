"use client";

import { ExternalLink, Loader2, RefreshCw, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useSteadfastMutations } from "@/hooks/use-admin-steadfast";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import { formatPrice } from "@/lib/format-price";
import type { AdminOrder } from "@/lib/orders/schemas";
import { formatSteadfastStatusLabel } from "@/lib/steadfast/display";
import { cn } from "@/lib/utils";

type SteadfastOrderPanelProps = {
  order: AdminOrder;
};

export function SteadfastOrderPanel({ order }: SteadfastOrderPanelProps) {
  const { createConsignment, syncStatus, createReturn } = useSteadfastMutations();
  const [note, setNote] = useState("");
  const hasConsignment = Boolean(
    order.steadfastConsignmentId || order.steadfastTrackingCode
  );
  const isCod = order.paymentMethod === "COD";
  const suggestedCod =
    isCod && order.paymentStatus !== "PAID" ? Math.round(order.total) : 0;
  const disabled =
    order.status === "CANCELLED" || createConsignment.isPending || syncStatus.isPending;

  async function handleCreate() {
    const ok = await confirmAdminAction({
      title: "Send to Steadfast?",
      text: `Creates a Packzy consignment for ${order.orderNumber}. COD amount: ${formatPrice(suggestedCod)}. Order will be marked Shipped.`,
      confirmText: "Create consignment",
    });
    if (!ok) return;
    try {
      const result = await createConsignment.mutateAsync({
        orderId: order.id,
        note: note.trim() || undefined,
        markShipped: true,
        deliveryType: 0,
      });
      await showAdminSuccess(
        "Consignment created",
        result.success ?? "Sent to Steadfast."
      );
    } catch (err) {
      await showAdminError(
        "Steadfast failed",
        err instanceof Error ? err.message : "Could not create consignment."
      );
    }
  }

  async function handleSync() {
    try {
      const result = await syncStatus.mutateAsync(order.id);
      await showAdminSuccess("Status synced", result.success ?? "Updated.");
    } catch (err) {
      await showAdminError(
        "Sync failed",
        err instanceof Error ? err.message : "Could not sync status."
      );
    }
  }

  async function handleReturn() {
    const ok = await confirmAdminAction({
      title: "Request return?",
      text: "Submits a return request to Steadfast for this consignment.",
      confirmText: "Request return",
    });
    if (!ok) return;
    try {
      const result = await createReturn.mutateAsync({ orderId: order.id });
      await showAdminSuccess("Return requested", result.success ?? "Submitted.");
    } catch (err) {
      await showAdminError(
        "Return failed",
        err instanceof Error ? err.message : "Could not create return."
      );
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-brand-green-600" />
          <h2 className="font-heading text-lg font-bold text-neutral-900">Steadfast</h2>
        </div>
        <Link
          className="text-xs font-semibold text-brand-green-700 hover:underline"
          href="/admin/steadfast"
        >
          Dashboard
        </Link>
      </div>

      {!hasConsignment ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-neutral-600">
            Push this order to Steadfast Courier. Suggested COD:{" "}
            <strong className="text-neutral-900">{formatPrice(suggestedCod)}</strong>
            {isCod ? " (collect on delivery)" : " (prepaid → ৳0)"}.
          </p>
          <textarea
            className="min-h-[72px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-green-400"
            onChange={(event) => setNote(event.target.value)}
            placeholder="Delivery note (optional)…"
            value={note}
          />
          <Button
            className="w-full rounded-xl bg-brand-green-600 hover:bg-brand-green-900"
            disabled={disabled}
            onClick={() => void handleCreate()}
            type="button"
          >
            {createConsignment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Send to Steadfast"
            )}
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Tracking</dt>
              <dd className="text-right font-semibold text-neutral-900">
                {order.steadfastTrackingUrl && order.steadfastTrackingCode ? (
                  <a
                    className="inline-flex items-center gap-1 text-brand-green-700 hover:underline"
                    href={order.steadfastTrackingUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {order.steadfastTrackingCode}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  order.steadfastTrackingCode ?? "—"
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Consignment</dt>
              <dd className="font-medium text-neutral-900">
                {order.steadfastConsignmentId ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Invoice</dt>
              <dd className="font-medium text-neutral-900">
                {order.steadfastInvoice ?? order.orderNumber}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Courier status</dt>
              <dd>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                    "bg-brand-green-50 text-brand-green-800"
                  )}
                >
                  {formatSteadfastStatusLabel(order.steadfastStatus)}
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">COD amount</dt>
              <dd className="font-medium text-neutral-900">
                {order.steadfastCodAmount != null
                  ? formatPrice(order.steadfastCodAmount)
                  : "—"}
              </dd>
            </div>
            {order.steadfastSyncedAt ? (
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Last sync</dt>
                <dd className="text-xs text-neutral-600">
                  {new Date(order.steadfastSyncedAt).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
            ) : null}
          </dl>

          <p className="rounded-xl border border-brand-green-100 bg-brand-green-50/70 px-3 py-2 text-xs text-brand-green-900">
            Steadfast-এ delivery complete হলে Sync করলে order{" "}
            <strong>Delivered</strong> এবং payment <strong>Paid</strong> হয়ে যাবে
            (COD cash collected).
          </p>

          <div className="grid grid-cols-2 gap-2">
            <Button
              className="rounded-xl"
              disabled={syncStatus.isPending}
              onClick={() => void handleSync()}
              type="button"
              variant="outline"
            >
              {syncStatus.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Sync
                </>
              )}
            </Button>
            <Button
              className="rounded-xl"
              disabled={createReturn.isPending || order.status === "CANCELLED"}
              onClick={() => void handleReturn()}
              type="button"
              variant="outline"
            >
              {createReturn.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Return"
              )}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
