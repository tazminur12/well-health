"use client";

import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Loader2,
  Minus,
  Package,
  PackageX,
  Pencil,
  Plus,
  Search,
  Warehouse,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  useAdminInventory,
  useInventoryMutations,
} from "@/hooks/use-admin-inventory";
import { showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import type { InventoryItem, StockBucket } from "@/lib/inventory/schemas";
import { cn } from "@/lib/utils";

type StockFilter = "All" | StockBucket;

const filters: StockFilter[] = ["All", "In Stock", "Low Stock", "Out of Stock"];

const bucketMeta: Record<
  StockBucket,
  { pill: string; bar: string; label: string }
> = {
  "In Stock": {
    pill: "bg-brand-green-100 text-brand-green-800",
    bar: "bg-brand-green-600",
    label: "Healthy",
  },
  "Low Stock": {
    pill: "bg-amber-100 text-amber-900",
    bar: "bg-amber-500",
    label: "Reorder soon",
  },
  "Out of Stock": {
    pill: "bg-red-100 text-red-800",
    bar: "bg-red-500",
    label: "Urgent",
  },
};

export function AdminInventoryPage() {
  const { data: items = [], isLoading, isError, error, refetch } = useAdminInventory();
  const { updateStock, adjustStock } = useInventoryMutations();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("All");
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [stockValue, setStockValue] = useState(0);
  const [thresholdValue, setThresholdValue] = useState(10);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      const matchesFilter = filter === "All" ? true : item.bucket === filter;
      return matchesSearch && matchesFilter;
    });
  }, [filter, items, search]);

  const stats = useMemo(() => {
    const inStock = items.filter((i) => i.bucket === "In Stock").length;
    const low = items.filter((i) => i.bucket === "Low Stock").length;
    const out = items.filter((i) => i.bucket === "Out of Stock").length;
    const units = items.reduce((sum, i) => sum + i.stock, 0);
    return { total: items.length, inStock, low, out, units };
  }, [items]);

  function openEdit(item: InventoryItem) {
    setEditing(item);
    setStockValue(item.stock);
    setThresholdValue(item.lowStockThreshold);
  }

  function closeEdit() {
    setEditing(null);
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      await updateStock.mutateAsync({
        productId: editing.id,
        stock: stockValue,
        lowStockThreshold: thresholdValue,
      });
      await showAdminSuccess("Inventory updated", `${editing.name} stock saved.`);
      closeEdit();
    } catch (err) {
      await showAdminError(
        "Update failed",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickAdjust(item: InventoryItem, delta: number) {
    try {
      await adjustStock.mutateAsync({ productId: item.id, delta });
    } catch (err) {
      await showAdminError(
        "Adjust failed",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading inventory…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">
          Couldn’t load inventory
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
            <Warehouse className="h-3.5 w-3.5" />
            Stock control
          </div>
          <h1 className="mt-3 font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">
            Inventory
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-neutral-500">
            Track on-hand units, low-stock alerts, and restock thresholds across your catalog.
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-brand-green-600/30 hover:bg-brand-green-50 hover:text-brand-green-900"
          href="/admin/products"
        >
          <Package className="h-4 w-4" />
          Manage products
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Boxes}
          label="SKUs tracked"
          tone="green"
          value={String(stats.total)}
        />
        <StatCard
          icon={CheckCircle2}
          label="In stock"
          tone="teal"
          value={String(stats.inStock)}
        />
        <StatCard
          icon={AlertTriangle}
          label="Low stock"
          tone="gold"
          value={String(stats.low)}
        />
        <StatCard
          icon={PackageX}
          label="Out of stock"
          tone="rose"
          value={String(stats.out)}
        />
      </section>

      <div className="overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-[#0B4D3A] via-[#127A56] to-[#16875D] p-5 text-white shadow-[0_18px_40px_rgba(11,77,58,0.2)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
              Total units on hand
            </p>
            <p className="mt-1 font-heading text-3xl font-bold tracking-tight">
              {stats.units.toLocaleString("en-US")}
            </p>
            <p className="mt-1 text-sm text-white/75">
              Across {stats.total} product{stats.total === 1 ? "" : "s"}
            </p>
          </div>
          {stats.low + stats.out > 0 ? (
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
                Needs attention
              </p>
              <p className="mt-1 text-sm font-medium">
                {stats.low} low · {stats.out} out of stock
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-sm font-medium text-emerald-100">All levels look healthy</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 text-sm outline-none focus:border-brand-green-600 focus:bg-white focus:ring-2 focus:ring-brand-green-600/15"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, SKU, or category…"
            value={search}
          />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-1">
          {filters.map((item) => (
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
              {item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-200 bg-gradient-to-br from-white via-[#F7F8F9] to-[#E8F5EE] px-6 py-16 text-center">
          <Warehouse className="mx-auto h-10 w-10 text-brand-green-600" />
          <h2 className="mt-4 font-heading text-xl font-bold text-neutral-900">
            No inventory rows
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
            {search || filter !== "All"
              ? "Try another search or stock filter."
              : "Add products to start tracking stock levels."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100">
              <thead className="bg-gradient-to-r from-[#F7F8F9] to-[#E8F5EE]/60 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                <tr>
                  <th className="px-4 py-3.5 sm:px-5">Product</th>
                  <th className="px-4 py-3.5">SKU</th>
                  <th className="px-4 py-3.5">Stock</th>
                  <th className="px-4 py-3.5">Threshold</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((item) => {
                  const meta = bucketMeta[item.bucket];
                  const fill =
                    item.lowStockThreshold <= 0
                      ? item.stock > 0
                        ? 100
                        : 0
                      : Math.min(100, Math.round((item.stock / (item.lowStockThreshold * 2)) * 100));

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "transition-colors hover:bg-neutral-50/80",
                        item.bucket === "Out of Stock" && "bg-red-50/40",
                        item.bucket === "Low Stock" && "bg-amber-50/30"
                      )}
                    >
                      <td className="px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          <span className="relative flex h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-brand-green-50 to-[#F5F0E6] ring-1 ring-neutral-200">
                            {item.imageUrl ? (
                              <Image
                                alt=""
                                className="object-cover"
                                fill
                                sizes="44px"
                                src={item.imageUrl}
                                unoptimized
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-brand-green-700">
                                <Package className="h-4 w-4" />
                              </span>
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-neutral-900">
                              {item.name}
                            </p>
                            <p className="truncate text-xs text-neutral-500">
                              {item.category} · {item.unit}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-neutral-700">
                        {item.sku}
                      </td>
                      <td className="px-4 py-4">
                        <div className="min-w-[120px] space-y-1.5">
                          <p className="text-sm font-bold text-neutral-900">
                            {item.stock}{" "}
                            <span className="text-xs font-medium text-neutral-400">
                              {item.unit.toLowerCase()}
                            </span>
                          </p>
                          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                            <div
                              className={cn("h-full rounded-full transition-all", meta.bar)}
                              style={{ width: `${fill}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-neutral-600">
                        ≤ {item.lowStockThreshold}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                            meta.pill
                          )}
                        >
                          {item.bucket}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            aria-label="Decrease stock"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-40"
                            disabled={adjustStock.isPending || item.stock <= 0}
                            onClick={() => void handleQuickAdjust(item, -1)}
                            type="button"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <button
                            aria-label="Increase stock"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-brand-green-50 hover:text-brand-green-800 disabled:opacity-40"
                            disabled={adjustStock.isPending}
                            onClick={() => void handleQuickAdjust(item, 1)}
                            type="button"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            aria-label="Edit stock"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-brand-green-50 hover:text-brand-green-800"
                            onClick={() => openEdit(item)}
                            type="button"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <Link
                            className="ml-1 hidden text-xs font-semibold text-brand-green-700 hover:underline sm:inline"
                            href={`/admin/products/${item.id}/edit`}
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <button
            aria-label="Close"
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px]"
            onClick={closeEdit}
            type="button"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-neutral-200 bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-brand-green-50 to-[#F5F0E6] px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-700">
                  Adjust inventory
                </p>
                <h2 className="mt-1 font-heading text-lg font-bold text-neutral-900">
                  {editing.name}
                </h2>
                <p className="text-xs text-neutral-500">{editing.sku}</p>
              </div>
              <button
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-white"
                onClick={closeEdit}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-neutral-700">On-hand stock</span>
                <input
                  className="h-11 w-full rounded-xl border border-neutral-200 px-3.5 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                  min={0}
                  onChange={(e) => setStockValue(Math.max(0, Number(e.target.value) || 0))}
                  type="number"
                  value={stockValue}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-neutral-700">
                  Low-stock threshold
                </span>
                <input
                  className="h-11 w-full rounded-xl border border-neutral-200 px-3.5 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                  min={0}
                  onChange={(e) =>
                    setThresholdValue(Math.max(0, Number(e.target.value) || 0))
                  }
                  type="number"
                  value={thresholdValue}
                />
                <span className="text-xs text-neutral-400">
                  Alert when stock reaches this level or below
                </span>
              </label>

              <div className="flex gap-2 pt-1">
                <Button
                  className="h-11 flex-1 rounded-xl"
                  onClick={closeEdit}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  className="h-11 flex-1 rounded-xl bg-gradient-to-r from-brand-green-900 to-brand-green-600 text-white hover:from-brand-green-900 hover:to-brand-green-900"
                  disabled={saving}
                  onClick={() => void handleSave()}
                  type="button"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save stock
                </Button>
              </div>
            </div>
          </div>
        </div>
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
  icon: typeof Boxes;
  label: string;
  value: string;
  tone: "green" | "teal" | "gold" | "rose";
}) {
  const tones = {
    green: "from-[#E8F5EE] to-white border-brand-green-100",
    teal: "from-[#E6F4F0] to-white border-emerald-100",
    gold: "from-[#F5F0E6] to-white border-[#E8D9B0]",
    rose: "from-[#FDF2F4] to-white border-red-100",
  };
  const icons = {
    green: "from-brand-green-900 to-brand-green-600",
    teal: "from-[#0F766E] to-[#16875D]",
    gold: "from-[#A8843A] to-[#C9A24B]",
    rose: "from-[#9F1239] to-[#E11D48]",
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
