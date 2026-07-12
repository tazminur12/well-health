"use client";

import {
  BadgePercent,
  CalendarRange,
  Copy,
  Loader2,
  Percent,
  Plus,
  Power,
  Search,
  Ticket,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAdminCoupons, useCouponMutations } from "@/hooks/use-admin-coupons";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import type {
  AdminCoupon,
  CouponInput,
  CouponLifecycle,
  CouponTypeValue,
} from "@/lib/coupons/schemas";
import { normalizeCouponCode } from "@/lib/coupons/schemas";
import { cn } from "@/lib/utils";

type LifecycleFilter = "All" | CouponLifecycle;

const emptyForm: CouponInput = {
  code: "",
  name: "",
  description: "",
  type: "PERCENT",
  value: 10,
  minOrderAmount: 1000,
  maxDiscount: null,
  usageLimit: 100,
  perCustomerLimit: 1,
  startsAt: "",
  endsAt: "",
  isActive: true,
};

const lifecycleMeta: Record<
  CouponLifecycle,
  { label: string; pill: string }
> = {
  ACTIVE: { label: "Active", pill: "bg-brand-green-100 text-brand-green-800" },
  SCHEDULED: { label: "Scheduled", pill: "bg-blue-100 text-blue-700" },
  EXPIRED: { label: "Expired", pill: "bg-neutral-200 text-neutral-600" },
  DISABLED: { label: "Disabled", pill: "bg-amber-100 text-amber-900" },
};

const cardGradients = [
  "from-[#E8F5EE] via-white to-[#F5F0E6]",
  "from-[#F5F0E6] via-white to-[#E8F5EE]",
  "from-[#EEF8F3] via-[#F8FBF9] to-[#EAF3FF]",
  "from-[#FDF8F0] via-white to-[#EEF6F2]",
];

const barGradients = [
  "from-[#0B4D3A] to-[#16875D]",
  "from-[#16875D] to-[#C9A24B]",
  "from-[#A8843A] to-[#C9A24B]",
  "from-[#0F766E] to-[#34D399]",
];

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20";

function formatMoney(value: number | null | undefined) {
  if (value == null) return "—";
  return `৳ ${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toDatetimeLocal(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function discountLabel(coupon: AdminCoupon) {
  if (coupon.type === "PERCENT") return `${coupon.value}% OFF`;
  return `${formatMoney(coupon.value)} OFF`;
}

export function AdminCouponsPage() {
  const { data: coupons = [], isLoading, isError, error, refetch } = useAdminCoupons();
  const { createCoupon, updateCoupon, deleteCoupon, toggleActive } = useCouponMutations();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LifecycleFilter>("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [form, setForm] = useState<CouponInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return coupons.filter((item) => {
      const matchesSearch =
        !q ||
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q);
      const matchesFilter = filter === "All" ? true : item.lifecycle === filter;
      return matchesSearch && matchesFilter;
    });
  }, [coupons, filter, search]);

  const stats = useMemo(() => {
    return {
      total: coupons.length,
      active: coupons.filter((c) => c.lifecycle === "ACTIVE").length,
      scheduled: coupons.filter((c) => c.lifecycle === "SCHEDULED").length,
      redemptions: coupons.reduce((sum, c) => sum + c.usageCount, 0),
    };
  }, [coupons]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  }

  function openEdit(coupon: AdminCoupon) {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description ?? "",
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount,
      usageLimit: coupon.usageLimit,
      perCustomerLimit: coupon.perCustomerLimit,
      startsAt: toDatetimeLocal(coupon.startsAt),
      endsAt: toDatetimeLocal(coupon.endsAt),
      isActive: coupon.isActive,
    });
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: CouponInput = {
        ...form,
        code: normalizeCouponCode(form.code),
        minOrderAmount: form.minOrderAmount || null,
        maxDiscount: form.type === "PERCENT" ? form.maxDiscount || null : null,
        usageLimit: form.usageLimit || null,
        perCustomerLimit: form.perCustomerLimit || null,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
      };
      if (editing) {
        await updateCoupon.mutateAsync({ id: editing.id, input: payload });
        await showAdminSuccess("Coupon updated", `${payload.code} saved.`);
      } else {
        await createCoupon.mutateAsync(payload);
        await showAdminSuccess("Coupon created", `${payload.code} is ready.`);
      }
      closeDrawer();
    } catch (err) {
      await showAdminError(
        "Save failed",
        err instanceof Error ? err.message : "Please check the fields."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(coupon: AdminCoupon) {
    const ok = await confirmAdminAction({
      title: `Delete “${coupon.code}”?`,
      text: "This cannot be undone.",
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await deleteCoupon.mutateAsync(coupon.id);
      await showAdminSuccess("Deleted", `${coupon.code} removed.`);
    } catch (err) {
      await showAdminError(
        "Delete failed",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  async function handleCopy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      await showAdminSuccess("Copied", `${code} copied to clipboard.`);
    } catch {
      await showAdminError("Copy failed", "Could not copy the code.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading coupons…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">
          Couldn’t load coupons
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
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-green-100 bg-gradient-to-r from-brand-green-50 to-[#F5F0E6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-green-800">
            <Ticket className="h-3.5 w-3.5" />
            Promotions
          </div>
          <h1 className="mt-3 font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">
            Coupons & Discounts
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-neutral-500">
            Create promo codes for checkout — percent or fixed ৳ off, with limits and schedule
            windows.
          </p>
        </div>
        <Button
          className="h-10 rounded-xl bg-gradient-to-r from-brand-green-900 to-brand-green-600 text-white shadow-[0_10px_24px_rgba(22,135,93,0.28)] hover:from-brand-green-900 hover:to-brand-green-900"
          onClick={openCreate}
          type="button"
        >
          <Plus className="h-4 w-4" />
          New coupon
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Ticket} label="Total coupons" tone="green" value={String(stats.total)} />
        <StatCard icon={BadgePercent} label="Active now" tone="teal" value={String(stats.active)} />
        <StatCard
          icon={CalendarRange}
          label="Scheduled"
          tone="gold"
          value={String(stats.scheduled)}
        />
        <StatCard
          icon={Wallet}
          label="Redemptions"
          tone="slate"
          value={String(stats.redemptions)}
        />
      </section>

      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 text-sm outline-none focus:border-brand-green-600 focus:bg-white focus:ring-2 focus:ring-brand-green-600/15"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code or name…"
            value={search}
          />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-1">
          {(["All", "ACTIVE", "SCHEDULED", "EXPIRED", "DISABLED"] as const).map((item) => (
            <button
              key={item}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                filter === item
                  ? "bg-white text-brand-green-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item === "All" ? "All" : lifecycleMeta[item].label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-200 bg-gradient-to-br from-white via-[#F7F8F9] to-[#E8F5EE] px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-green-900 to-brand-green-600 text-white shadow-lg">
            <Ticket className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-heading text-xl font-bold text-neutral-900">
            No coupons yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
            {search || filter !== "All"
              ? "Try another search or filter."
              : "Create your first promo code for the Bangladesh storefront checkout."}
          </p>
          {!search && filter === "All" ? (
            <Button className="mt-5 rounded-xl" onClick={openCreate} type="button">
              <Plus className="h-4 w-4" />
              New coupon
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((coupon, index) => {
            const gradient = cardGradients[index % cardGradients.length]!;
            const bar = barGradients[index % barGradients.length]!;
            const usagePct =
              coupon.usageLimit && coupon.usageLimit > 0
                ? Math.min(100, Math.round((coupon.usageCount / coupon.usageLimit) * 100))
                : null;
            const meta = lifecycleMeta[coupon.lifecycle];

            return (
              <article
                key={coupon.id}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]",
                  gradient
                )}
              >
                <div
                  aria-hidden
                  className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", bar)}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#C9A24B]/15 blur-2xl"
                />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/70 px-2.5 py-1 font-mono text-sm font-bold tracking-wide text-brand-green-900 ring-1 ring-brand-green-100 transition hover:bg-white"
                        onClick={() => void handleCopy(coupon.code)}
                        type="button"
                      >
                        {coupon.code}
                        <Copy className="h-3.5 w-3.5 text-neutral-400" />
                      </button>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          meta.pill
                        )}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <h3 className="mt-2 font-heading text-lg font-bold text-neutral-900">
                      {coupon.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                      {coupon.description || "No description"}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-gradient-to-br from-brand-green-900 to-brand-green-600 px-3 py-2 text-sm font-bold text-white shadow-md">
                    {coupon.type === "PERCENT" ? (
                      <Percent className="h-3.5 w-3.5" />
                    ) : (
                      <Wallet className="h-3.5 w-3.5" />
                    )}
                    {discountLabel(coupon)}
                  </span>
                </div>

                <div className="relative mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-white/60 px-3 py-2 backdrop-blur-sm">
                    <p className="text-neutral-400">Min order</p>
                    <p className="mt-0.5 font-semibold text-neutral-800">
                      {formatMoney(coupon.minOrderAmount)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/60 px-3 py-2 backdrop-blur-sm">
                    <p className="text-neutral-400">Max discount</p>
                    <p className="mt-0.5 font-semibold text-neutral-800">
                      {coupon.type === "PERCENT"
                        ? formatMoney(coupon.maxDiscount)
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/60 px-3 py-2 backdrop-blur-sm">
                    <p className="text-neutral-400">Starts</p>
                    <p className="mt-0.5 font-semibold text-neutral-800">
                      {formatDate(coupon.startsAt)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/60 px-3 py-2 backdrop-blur-sm">
                    <p className="text-neutral-400">Ends</p>
                    <p className="mt-0.5 font-semibold text-neutral-800">
                      {formatDate(coupon.endsAt)}
                    </p>
                  </div>
                </div>

                <div className="relative mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Usage</span>
                    <span className="font-semibold text-neutral-800">
                      {coupon.usageCount}
                      {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : " used"}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-green-900 to-brand-green-600"
                      style={{ width: `${usagePct ?? Math.min(100, coupon.usageCount * 5)}%` }}
                    />
                  </div>
                </div>

                <div className="relative mt-4 flex flex-wrap items-center gap-1.5 border-t border-neutral-900/5 pt-4">
                  <button
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-neutral-600 transition hover:bg-white hover:text-neutral-900"
                    onClick={() => openEdit(coupon)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-neutral-600 transition hover:bg-white hover:text-neutral-900"
                    onClick={() => void toggleActive.mutateAsync(coupon.id)}
                    type="button"
                  >
                    <Power className="h-3.5 w-3.5" />
                    {coupon.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    onClick={() => void handleDelete(coupon)}
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {drawerOpen ? (
        <CouponDrawer
          form={form}
          isEditing={Boolean(editing)}
          saving={saving}
          onChange={setForm}
          onClose={closeDrawer}
          onSave={() => void handleSave()}
        />
      ) : null}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Ticket;
  label: string;
  value: string;
  tone: "green" | "teal" | "gold" | "slate";
}) {
  const tones = {
    green: "from-[#E8F5EE] to-white border-brand-green-100",
    teal: "from-[#E6F4F0] to-white border-emerald-100",
    gold: "from-[#F5F0E6] to-white border-[#E8D9B0]",
    slate: "from-neutral-50 to-white border-neutral-200",
  };
  const icons = {
    green: "from-brand-green-900 to-brand-green-600",
    teal: "from-[#0F766E] to-[#16875D]",
    gold: "from-[#A8843A] to-[#C9A24B]",
    slate: "from-neutral-700 to-neutral-500",
  };

  return (
    <div className={cn("rounded-2xl border bg-gradient-to-br p-4 shadow-sm", tones[tone])}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            icons[tone]
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div>
          <p className="text-xs font-medium text-neutral-500">{label}</p>
          <p className="font-heading text-2xl font-bold text-neutral-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function CouponDrawer({
  form,
  isEditing,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  form: CouponInput;
  isEditing: boolean;
  saving: boolean;
  onChange: (next: CouponInput) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function patch<K extends keyof CouponInput>(key: K, value: CouponInput[K]) {
    onChange({ ...form, [key]: value });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close drawer"
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 bg-gradient-to-r from-brand-green-50 to-[#F5F0E6] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-700">
              {isEditing ? "Edit coupon" : "New coupon"}
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold text-neutral-900">
              {isEditing ? form.code || "Coupon" : "Create promo code"}
            </h2>
          </div>
          <button
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-white"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-neutral-700">Code</span>
              <input
                className={cn(inputClass, "font-mono uppercase tracking-wide")}
                onChange={(e) => patch("code", normalizeCouponCode(e.target.value))}
                placeholder="WELL10"
                value={form.code}
              />
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-neutral-700">Display name</span>
              <input
                className={inputClass}
                onChange={(e) => patch("name", e.target.value)}
                placeholder="Welcome offer"
                value={form.name}
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Description</span>
            <textarea
              className="min-h-[88px] w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(e) => patch("description", e.target.value)}
              placeholder="Shown in admin notes / future checkout helper"
              value={form.description ?? ""}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-neutral-700">Discount type</span>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["PERCENT", "Percent %"],
                    ["FIXED", "Fixed ৳"],
                  ] as const
                ).map(([type, label]) => (
                  <button
                    key={type}
                    className={cn(
                      "h-11 rounded-xl border text-sm font-semibold transition",
                      form.type === type
                        ? "border-brand-green-600 bg-brand-green-50 text-brand-green-900"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    )}
                    onClick={() => patch("type", type as CouponTypeValue)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-neutral-700">
                Value {form.type === "PERCENT" ? "(%)" : "(৳)"}
              </span>
              <input
                className={inputClass}
                min={0}
                onChange={(e) => patch("value", Number(e.target.value) || 0)}
                step="0.01"
                type="number"
                value={form.value}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-neutral-700">Min order (৳)</span>
              <input
                className={inputClass}
                min={0}
                onChange={(e) =>
                  patch("minOrderAmount", e.target.value === "" ? null : Number(e.target.value))
                }
                type="number"
                value={form.minOrderAmount ?? ""}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-neutral-700">Max discount (৳)</span>
              <input
                className={inputClass}
                disabled={form.type !== "PERCENT"}
                min={0}
                onChange={(e) =>
                  patch("maxDiscount", e.target.value === "" ? null : Number(e.target.value))
                }
                placeholder={form.type === "FIXED" ? "N/A for fixed" : "Optional cap"}
                type="number"
                value={form.maxDiscount ?? ""}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-neutral-700">Total usage limit</span>
              <input
                className={inputClass}
                min={1}
                onChange={(e) =>
                  patch("usageLimit", e.target.value === "" ? null : Number(e.target.value))
                }
                placeholder="Unlimited"
                type="number"
                value={form.usageLimit ?? ""}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-neutral-700">Per customer</span>
              <input
                className={inputClass}
                min={1}
                onChange={(e) =>
                  patch(
                    "perCustomerLimit",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                placeholder="Unlimited"
                type="number"
                value={form.perCustomerLimit ?? ""}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-neutral-700">Starts at</span>
              <input
                className={inputClass}
                onChange={(e) => patch("startsAt", e.target.value)}
                type="datetime-local"
                value={form.startsAt ?? ""}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-neutral-700">Ends at</span>
              <input
                className={inputClass}
                onChange={(e) => patch("endsAt", e.target.value)}
                type="datetime-local"
                value={form.endsAt ?? ""}
              />
            </label>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <input
              checked={form.isActive}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand-green-600"
              onChange={(e) => patch("isActive", e.target.checked)}
              type="checkbox"
            />
            <span>
              <span className="block text-sm font-semibold text-neutral-900">Enabled</span>
              <span className="mt-0.5 block text-xs text-neutral-500">
                Disabled coupons stay saved but cannot be redeemed
              </span>
            </span>
          </label>
        </div>

        <div className="flex gap-2 border-t border-neutral-100 px-5 py-4">
          <Button
            className="h-11 flex-1 rounded-xl"
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="h-11 flex-1 rounded-xl bg-gradient-to-r from-brand-green-900 to-brand-green-600 text-white hover:from-brand-green-900 hover:to-brand-green-900"
            disabled={saving || !form.code.trim() || !form.name.trim() || form.value <= 0}
            onClick={onSave}
            type="button"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isEditing ? "Save changes" : "Create coupon"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
