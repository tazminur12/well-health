"use client";

import {
  Banknote,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  Power,
  RefreshCw,
  Settings2,
  Smartphone,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { orderStatusPillClass } from "@/components/admin/admin-orders-table";
import { Button } from "@/components/ui/button";
import {
  useAdminPaymentOverview,
  usePaymentMutations,
} from "@/hooks/use-admin-payments";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import { formatPrice } from "@/lib/format-price";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/orders/schemas";
import type { PaymentSettings } from "@/lib/payments/schemas";
import { cn } from "@/lib/utils";

type Tab = "overview" | "gateways" | "cod";

const gatewayIcons = {
  COD: Banknote,
  SSLCOMMERZ: CreditCard,
  BKASH: Smartphone,
} as const;

const gatewayThemes = {
  COD: {
    card: "from-amber-50 via-white to-[#F7F8F9]",
    icon: "from-amber-500 to-amber-700 text-white",
    bar: "from-amber-500 to-[#C9A24B]",
  },
  SSLCOMMERZ: {
    card: "from-blue-50 via-white to-[#F0F7F3]",
    icon: "from-[#1D4F91] to-[#2B6CB0] text-white",
    bar: "from-[#2B6CB0] to-[#16875D]",
  },
  BKASH: {
    card: "from-rose-50 via-white to-[#F7F8F9]",
    icon: "from-[#E2136E] to-[#C40E5C] text-white",
    bar: "from-[#E2136E] to-[#16875D]",
  },
} as const;

export function AdminPaymentsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminPaymentOverview();
  const { updateSettings, updateOrderPayment } = usePaymentMutations();

  const [tab, setTab] = useState<Tab>("overview");
  const [draft, setDraft] = useState<PaymentSettings | null>(null);

  useEffect(() => {
    if (data?.settings) setDraft(data.settings);
  }, [data?.settings]);

  const settings = draft ?? data?.settings ?? null;

  const kpis = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Collected",
        value: formatPrice(data.totalCollected),
        hint: `${data.paidOrders} paid orders`,
        tone: "text-brand-green-700",
        icon: CheckCircle2,
      },
      {
        label: "Unpaid",
        value: formatPrice(data.unpaidAmount),
        hint: `${data.unpaidOrders} awaiting payment`,
        tone: "text-amber-700",
        icon: Wallet,
      },
      {
        label: "COD to collect",
        value: formatPrice(data.codPendingAmount),
        hint: `${data.codPendingCount} deliveries`,
        tone: "text-amber-800",
        icon: Banknote,
      },
      {
        label: "Failed / refunded",
        value: formatPrice(data.failedAmount + data.refundedAmount),
        hint: `Failed ${formatPrice(data.failedAmount)}`,
        tone: "text-red-600",
        icon: CreditCard,
      },
    ];
  }, [data]);

  async function saveSettings() {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync(settings);
      await showAdminSuccess("Saved", "Payment methods updated.");
      void refetch();
    } catch (err) {
      await showAdminError(
        "Could not save",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  async function toggleGateway(
    key: keyof Pick<
      PaymentSettings,
      "codEnabled" | "sslcommerzEnabled" | "bkashEnabled"
    >
  ) {
    if (!settings) return;
    const next = { ...settings, [key]: !settings[key] };
    setDraft(next);
    try {
      await updateSettings.mutateAsync(next);
      await showAdminSuccess(
        next[key] ? "Enabled" : "Disabled",
        "Checkout payment methods updated."
      );
      void refetch();
    } catch (err) {
      setDraft(settings);
      await showAdminError(
        "Update failed",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  async function markPaid(orderId: string, orderNumber: string, total: number) {
    const ok = await confirmAdminAction({
      title: "Mark payment as paid?",
      text: `Confirm ${formatPrice(total)} collected for ${orderNumber}.`,
      confirmText: "Mark paid",
    });
    if (!ok) return;
    try {
      await updateOrderPayment.mutateAsync({ id: orderId, paymentStatus: "PAID" });
      await showAdminSuccess("Payment recorded", `${orderNumber} marked as paid.`);
      void refetch();
    } catch (err) {
      await showAdminError(
        "Update failed",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-600">
            Sales
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-neutral-900">
            Payments
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage COD, SSLCommerz, and bKash — plus collect outstanding payments.
          </p>
        </div>
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
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-24 text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading payments…
        </div>
      ) : isError || !data ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center">
          <p className="font-medium text-red-700">
            {error instanceof Error ? error.message : "Could not load payments."}
          </p>
          <Button className="mt-3 rounded-xl" onClick={() => void refetch()} type="button">
            Try again
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <div
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
                key={kpi.label}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      {kpi.label}
                    </p>
                    <p className={cn("mt-1 font-heading text-2xl font-bold", kpi.tone)}>
                      {kpi.value}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">{kpi.hint}</p>
                  </div>
                  <span className="rounded-xl bg-neutral-50 p-2.5 text-neutral-500">
                    <kpi.icon className="h-5 w-5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "overview", label: "Overview" },
                { id: "gateways", label: "Gateways" },
                {
                  id: "cod",
                  label: `COD queue (${data.codPendingCount})`,
                },
              ] as const
            ).map((item) => (
              <button
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  tab === item.id
                    ? "bg-brand-green-600 text-white"
                    : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"
                )}
                key={item.id}
                onClick={() => setTab(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "overview" ? (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-100 px-5 py-4">
                  <h2 className="font-heading text-lg font-bold text-neutral-900">
                    Recent payments
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Latest orders with payment method and status.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-neutral-50/80 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      <tr>
                        <th className="px-4 py-3">Order</th>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3">Payment</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {data.recent.length === 0 ? (
                        <tr>
                          <td className="px-4 py-10 text-center text-neutral-500" colSpan={5}>
                            No payment records yet.
                          </td>
                        </tr>
                      ) : (
                        data.recent.map((row) => (
                          <tr className="hover:bg-brand-green-50/30" key={row.id}>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-neutral-900">{row.orderNumber}</p>
                              <p className="text-xs text-neutral-500">{row.customerName}</p>
                            </td>
                            <td className="px-4 py-3 text-neutral-700">
                              {PAYMENT_METHOD_LABELS[row.paymentMethod]}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                  row.paymentStatus === "PAID"
                                    ? "bg-brand-green-100 text-brand-green-700"
                                    : row.paymentStatus === "UNPAID"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-red-100 text-red-700"
                                )}
                              >
                                {PAYMENT_STATUS_LABELS[row.paymentStatus]}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-neutral-900">
                              {formatPrice(row.total)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-green-700 hover:underline"
                                href={`/admin/orders/${row.id}`}
                              >
                                View
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-4">
                {data.gateways.map((gateway) => {
                  const Icon = gatewayIcons[gateway.id];
                  const theme = gatewayThemes[gateway.id];
                  return (
                    <div
                      className={cn(
                        "overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br p-5 shadow-sm",
                        theme.card
                      )}
                      key={gateway.id}
                    >
                      <div className={cn("mb-4 h-1 w-16 rounded-full bg-gradient-to-r", theme.bar)} />
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm",
                              theme.icon
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="font-heading text-lg font-bold text-neutral-900">
                              {gateway.name}
                            </p>
                            <p className="text-xs text-neutral-500">{gateway.description}</p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            gateway.enabled
                              ? "bg-brand-green-100 text-brand-green-700"
                              : "bg-neutral-100 text-neutral-500"
                          )}
                        >
                          {gateway.enabled ? "On" : "Off"}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-white/80 px-3 py-2">
                          <p className="text-xs text-neutral-500">Collected</p>
                          <p className="font-semibold text-neutral-900">
                            {formatPrice(gateway.paidAmount)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white/80 px-3 py-2">
                          <p className="text-xs text-neutral-500">Outstanding</p>
                          <p className="font-semibold text-neutral-900">
                            {formatPrice(gateway.unpaidAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>
            </div>
          ) : null}

          {tab === "gateways" && settings ? (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Settings2 className="h-4 w-4" />
                Enable methods for checkout and edit customer-facing instructions.
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {(
                  [
                    {
                      id: "COD" as const,
                      enableKey: "codEnabled" as const,
                      instructionKey: "codInstructions" as const,
                    },
                    {
                      id: "SSLCOMMERZ" as const,
                      enableKey: "sslcommerzEnabled" as const,
                      instructionKey: "sslcommerzInstructions" as const,
                    },
                    {
                      id: "BKASH" as const,
                      enableKey: "bkashEnabled" as const,
                      instructionKey: "bkashInstructions" as const,
                    },
                  ] as const
                ).map((item) => {
                  const gateway = data.gateways.find((g) => g.id === item.id)!;
                  const Icon = gatewayIcons[item.id];
                  const theme = gatewayThemes[item.id];
                  return (
                    <div
                      className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                      key={item.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br",
                              theme.icon
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-semibold text-neutral-900">{gateway.name}</p>
                            <p className="text-xs text-neutral-500">{gateway.configHint}</p>
                          </div>
                        </div>
                        <button
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                            settings[item.enableKey]
                              ? "bg-brand-green-600 text-white"
                              : "bg-neutral-100 text-neutral-600"
                          )}
                          onClick={() => void toggleGateway(item.enableKey)}
                          type="button"
                        >
                          <Power className="h-3.5 w-3.5" />
                          {settings[item.enableKey] ? "Enabled" : "Disabled"}
                        </button>
                      </div>

                      <label className="mt-4 block space-y-1.5 text-sm">
                        <span className="font-medium text-neutral-700">Checkout note</span>
                        <textarea
                          className="min-h-[96px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-green-400"
                          onChange={(event) =>
                            setDraft({
                              ...settings,
                              [item.instructionKey]: event.target.value,
                            })
                          }
                          value={settings[item.instructionKey]}
                        />
                      </label>

                      <p
                        className={cn(
                          "mt-3 text-xs font-medium",
                          gateway.configured ? "text-brand-green-700" : "text-amber-700"
                        )}
                      >
                        {gateway.configured ? "Ready" : "Credentials pending"} ·{" "}
                        {gateway.orderCount} orders
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <Button
                  className="rounded-xl bg-brand-green-600 hover:bg-brand-green-900"
                  disabled={updateSettings.isPending}
                  onClick={() => void saveSettings()}
                  type="button"
                >
                  {updateSettings.isPending ? "Saving…" : "Save instructions"}
                </Button>
              </div>
            </div>
          ) : null}

          {tab === "cod" ? (
            <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white px-5 py-4">
                <h2 className="font-heading text-lg font-bold text-neutral-900">
                  COD collection queue
                </h2>
                <p className="text-sm text-neutral-600">
                  Unpaid cash-on-delivery orders. Mark paid after the courier collects cash.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-neutral-50/80 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Fulfillment</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {data.unpaidCod.length === 0 ? (
                      <tr>
                        <td className="px-4 py-12 text-center text-neutral-500" colSpan={5}>
                          No outstanding COD payments. Nice work.
                        </td>
                      </tr>
                    ) : (
                      data.unpaidCod.map((row) => (
                        <tr className="hover:bg-amber-50/40" key={row.id}>
                          <td className="px-4 py-3.5">
                            <Link
                              className="font-semibold text-brand-green-700 hover:underline"
                              href={`/admin/orders/${row.id}`}
                            >
                              {row.orderNumber}
                            </Link>
                            <p className="text-xs text-neutral-400">
                              {new Date(row.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="font-medium text-neutral-900">{row.customerName}</p>
                            <p className="text-xs text-neutral-500">{row.phone}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                orderStatusPillClass[row.orderStatus]
                              )}
                            >
                              {ORDER_STATUS_LABELS[row.orderStatus]}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-neutral-900">
                            {formatPrice(row.total)}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex justify-end gap-2">
                              <Button
                                className="rounded-xl"
                                onClick={() =>
                                  void markPaid(row.id, row.orderNumber, row.total)
                                }
                                size="sm"
                                type="button"
                              >
                                Mark paid
                              </Button>
                              <Button asChild className="rounded-xl" size="sm" variant="outline">
                                <Link href={`/admin/orders/${row.id}`}>Open</Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
