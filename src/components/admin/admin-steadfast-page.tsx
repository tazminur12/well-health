"use client";

import {
  ExternalLink,
  Loader2,
  Package,
  RefreshCw,
  Truck,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  useAdminSteadfastDashboard,
  useSteadfastMutations,
} from "@/hooks/use-admin-steadfast";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import { formatPrice } from "@/lib/format-price";
import {
  buildSteadfastTrackingUrl,
  formatSteadfastStatusLabel,
} from "@/lib/steadfast/display";
import { ORDER_STATUS_LABELS, type OrderStatusValue } from "@/lib/orders/schemas";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  hint,
  tone = "green",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "green" | "slate" | "amber" | "red";
}) {
  const tones = {
    green: "from-[#E8F5EE] to-white border-brand-green-100",
    slate: "from-neutral-50 to-white border-neutral-200",
    amber: "from-amber-50 to-white border-amber-100",
    red: "from-red-50 to-white border-red-100",
  };
  return (
    <div className={cn("rounded-2xl border bg-gradient-to-br p-4 shadow-sm", tones[tone])}>
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-2 font-heading text-2xl font-bold text-neutral-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

export function AdminSteadfastPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminSteadfastDashboard();
  const { syncAllOpen } = useSteadfastMutations();

  async function handleSyncAll() {
    const ok = await confirmAdminAction({
      title: "Sync open consignments?",
      text: "Pulls latest Steadfast delivery status for in-transit orders (up to 40).",
      confirmText: "Sync now",
    });
    if (!ok) return;
    try {
      const result = await syncAllOpen.mutateAsync();
      await showAdminSuccess("Synced", result.success ?? "Statuses updated.");
    } catch (err) {
      await showAdminError(
        "Sync failed",
        err instanceof Error ? err.message : "Could not sync statuses."
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-7 w-7 animate-spin text-brand-green-600" />
        Loading Steadfast…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">
          Couldn’t load Steadfast
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
        <Button className="mt-5 rounded-xl" onClick={() => void refetch()} type="button">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-green-100 bg-brand-green-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-green-800">
            <Truck className="h-3.5 w-3.5" />
            Courier API
          </div>
          <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Steadfast Courier
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            Create consignments from orders, sync delivery status, and monitor Packzy balance.
            Keys live in{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">.env</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-xl"
            disabled={isFetching}
            onClick={() => void refetch()}
            type="button"
            variant="outline"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Button
            className="rounded-xl bg-brand-green-600 hover:bg-brand-green-900"
            disabled={!data.configured || syncAllOpen.isPending}
            onClick={() => void handleSyncAll()}
            type="button"
          >
            {syncAllOpen.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing…
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Sync open
              </>
            )}
          </Button>
        </div>
      </header>

      <section
        className={cn(
          "rounded-2xl border p-5 shadow-sm",
          data.configured && !data.balanceError
            ? "border-brand-green-100 bg-gradient-to-br from-[#E8F5EE] via-white to-white"
            : "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white"
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Connection
            </p>
            <p className="mt-1 font-heading text-lg font-bold text-neutral-900">
              {data.configured
                ? data.balanceError
                  ? "Configured · API error"
                  : "Connected to Packzy"
                : "Not configured"}
            </p>
            <p className="mt-1 break-all text-xs text-neutral-500">{data.baseUrl}</p>
            {data.balanceError ? (
              <p className="mt-2 text-sm text-amber-800">{data.balanceError}</p>
            ) : null}
          </div>
          <div className="rounded-xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <Wallet className="h-3.5 w-3.5" />
              Current balance
            </div>
            <p className="mt-1 font-heading text-2xl font-bold text-brand-green-700">
              {data.balance != null ? formatPrice(data.balance) : "—"}
            </p>
            {data.latencyMs != null ? (
              <p className="mt-0.5 text-xs text-neutral-500">{data.latencyMs} ms</p>
            ) : null}
          </div>
        </div>
        {!data.configured ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-white/70 px-4 py-3 text-sm text-amber-900">
            Add <code className="text-xs">STEADFAST_API_KEY</code> and{" "}
            <code className="text-xs">STEADFAST_SECRET_KEY</code> to your environment, then
            restart the app.
          </p>
        ) : null}
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Consignments" value={String(data.consignmentsTotal)} />
        <StatCard
          hint="Processing / shipped"
          label="In transit"
          tone="amber"
          value={String(data.inTransit)}
        />
        <StatCard label="Delivered" value={String(data.delivered)} />
        <StatCard label="Cancelled" tone="red" value={String(data.cancelled)} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-neutral-900">
              Recent consignments
            </h2>
            <p className="text-xs text-neutral-500">
              Create new consignments from an order’s detail page.
            </p>
          </div>
          <Link
            className="text-sm font-semibold text-brand-green-700 hover:underline"
            href="/admin/orders"
          >
            Open orders
          </Link>
        </div>

        {data.recent.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Truck className="mx-auto h-10 w-10 text-neutral-300" />
            <p className="mt-3 font-medium text-neutral-800">No consignments yet</p>
            <p className="mt-1 text-sm text-neutral-500">
              Open an order → Steadfast panel → Send to Steadfast.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-neutral-50/80 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Tracking</th>
                  <th className="px-5 py-3">Courier status</th>
                  <th className="px-5 py-3">Order status</th>
                  <th className="px-5 py-3">COD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.recent.map((row) => {
                  const trackingUrl = row.trackingCode
                    ? buildSteadfastTrackingUrl(row.trackingCode)
                    : null;
                  return (
                    <tr className="hover:bg-neutral-50/60" key={row.orderId}>
                      <td className="px-5 py-3">
                        <Link
                          className="font-semibold text-brand-green-700 hover:underline"
                          href={`/admin/orders/${row.orderId}`}
                        >
                          {row.orderNumber}
                        </Link>
                        {row.consignmentId ? (
                          <p className="text-xs text-neutral-400">CID {row.consignmentId}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-neutral-800">{row.customerName}</td>
                      <td className="px-5 py-3">
                        {row.trackingCode ? (
                          trackingUrl ? (
                            <a
                              className="inline-flex items-center gap-1 font-medium text-neutral-900 hover:text-brand-green-700"
                              href={trackingUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {row.trackingCode}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="font-medium">{row.trackingCode}</span>
                          )
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {formatSteadfastStatusLabel(row.steadfastStatus)}
                      </td>
                      <td className="px-5 py-3">
                        {ORDER_STATUS_LABELS[row.orderStatus as OrderStatusValue] ??
                          row.orderStatus}
                      </td>
                      <td className="px-5 py-3">
                        {row.codAmount != null ? formatPrice(row.codAmount) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-center text-xs text-neutral-400">
        API docs:{" "}
        <a
          className="underline hover:text-brand-green-700"
          href="https://docs.google.com/document/d/e/2PACX-1vTi0sTyR353xu1AK0nR8E_WKe5onCkUXGEf8ch8uoJy9qxGfgGnboSIkNosjQ0OOdXkJhgGuAsWxnIh/pub"
          rel="noreferrer"
          target="_blank"
        >
          Steadfast Packzy V1
        </a>
      </p>
    </div>
  );
}
