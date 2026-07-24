"use client";

import {
  ArrowDown,
  ArrowUp,
  Boxes,
  Layers3,
  Loader2,
  Package,
  Pencil,
  Plus,
  Power,
  Ruler,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAdminUnits, useUnitMutations } from "@/hooks/use-admin-units";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import type { AdminUnit, UnitInput } from "@/lib/units/schemas";
import { slugifyUnit } from "@/lib/units/schemas";
import { cn } from "@/lib/utils";

const cardGradients = [
  "from-[#E8F5EE] via-white to-[#F5F0E6]",
  "from-[#EEF8F3] via-[#F8FBF9] to-[#E8F0F8]",
  "from-[#F5F0E6] via-white to-[#E8F5EE]",
  "from-[#EAF3FF] via-white to-[#F0F7F3]",
  "from-[#FDF8F0] via-white to-[#EEF6F2]",
  "from-[#F0F7F3] via-white to-[#F5F0E6]",
];

const barGradients = [
  "from-[#0B4D3A] to-[#16875D]",
  "from-[#16875D] to-[#C9A24B]",
  "from-[#0F766E] to-[#34D399]",
  "from-[#1D4F91] to-[#16875D]",
  "from-[#A8843A] to-[#C9A24B]",
  "from-[#0B4D3A] via-[#16875D] to-[#C9A24B]",
];

const emptyForm: UnitInput = {
  name: "",
  slug: "",
  description: "",
  sortOrder: 0,
  isActive: true,
};

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20";

export function AdminUnitsPage() {
  const { data: units = [], isLoading, isError, error, refetch } = useAdminUnits();
  const { createUnit, updateUnit, deleteUnit, toggleActive, reorder } = useUnitMutations();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUnit | null>(null);
  const [form, setForm] = useState<UnitInput>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return units.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" ? true : filter === "active" ? item.isActive : !item.isActive;
      return matchesSearch && matchesFilter;
    });
  }, [units, filter, search]);

  const stats = useMemo(() => {
    const totalProducts = units.reduce((sum, item) => sum + item.productCount, 0);
    return {
      total: units.length,
      active: units.filter((u) => u.isActive).length,
      empty: units.filter((u) => u.productCount === 0).length,
      products: totalProducts,
    };
  }, [units]);

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      sortOrder: units.length,
    });
    setSlugTouched(false);
    setDrawerOpen(true);
  }

  function openEdit(unit: AdminUnit) {
    setEditing(unit);
    setForm({
      name: unit.name,
      slug: unit.slug,
      description: unit.description ?? "",
      sortOrder: unit.sortOrder,
      isActive: unit.isActive,
    });
    setSlugTouched(true);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setSlugTouched(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        await updateUnit.mutateAsync({ id: editing.id, input: form });
        await showAdminSuccess("Unit updated", `${form.name} saved successfully.`);
      } else {
        await createUnit.mutateAsync(form);
        await showAdminSuccess("Unit created", `${form.name} is ready to use.`);
      }
      closeDrawer();
    } catch (err) {
      await showAdminError(
        "Save failed",
        err instanceof Error ? err.message : "Please check the fields and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(unit: AdminUnit) {
    const ok = await confirmAdminAction({
      title: `Delete “${unit.name}”?`,
      text:
        unit.productCount > 0
          ? "This unit is still used by products and cannot be deleted."
          : "This cannot be undone.",
      confirmText: "Delete",
    });
    if (!ok) return;
    if (unit.productCount > 0) {
      await showAdminError(
        "Cannot delete",
        "Reassign products to another unit before deleting."
      );
      return;
    }
    try {
      await deleteUnit.mutateAsync(unit.id);
      await showAdminSuccess("Deleted", `${unit.name} removed.`);
    } catch (err) {
      await showAdminError(
        "Delete failed",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading units…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">
          Couldn’t load units
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
            <Ruler className="h-3.5 w-3.5" />
            Packaging units
          </div>
          <h1 className="mt-3 font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">
            Units
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-neutral-500">
            Manage bottle, box, softgel pack and other packaging units used across products and
            inventory.
          </p>
        </div>
        <Button
          className="h-10 rounded-xl bg-gradient-to-r from-brand-green-900 to-brand-green-600 text-white shadow-[0_10px_24px_rgba(22,135,93,0.28)] hover:from-brand-green-900 hover:to-brand-green-900"
          onClick={openCreate}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add unit
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Boxes} label="Total units" tone="green" value={String(stats.total)} />
        <StatCard icon={Power} label="Active" tone="gold" value={String(stats.active)} />
        <StatCard
          icon={Package}
          label="Linked products"
          tone="teal"
          value={String(stats.products)}
        />
        <StatCard
          icon={Layers3}
          label="Unused units"
          tone="slate"
          value={String(stats.empty)}
        />
      </section>

      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 text-sm outline-none focus:border-brand-green-600 focus:bg-white focus:ring-2 focus:ring-brand-green-600/15"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search units…"
            value={search}
          />
        </div>
        <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-50 p-1">
          {(
            [
              ["all", "All"],
              ["active", "Active"],
              ["inactive", "Inactive"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                filter === id
                  ? "bg-white text-brand-green-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
              onClick={() => setFilter(id)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-200 bg-gradient-to-br from-white via-[#F7F8F9] to-[#E8F5EE] px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-green-900 to-brand-green-600 text-white shadow-lg">
            <Ruler className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-heading text-xl font-bold text-neutral-900">
            No units found
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
            {search || filter !== "all"
              ? "Try a different search or filter."
              : "Create your first packaging unit for the product catalog."}
          </p>
          {!search && filter === "all" ? (
            <Button className="mt-5 rounded-xl" onClick={openCreate} type="button">
              <Plus className="h-4 w-4" />
              Add unit
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((unit, index) => {
            const gradient = cardGradients[index % cardGradients.length]!;
            const bar = barGradients[index % barGradients.length]!;
            return (
              <article
                key={unit.id}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]",
                  gradient,
                  !unit.isActive && "opacity-80"
                )}
              >
                <div
                  aria-hidden
                  className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", bar)}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-green-600/10 blur-2xl"
                />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-lg font-bold text-neutral-900">
                        {unit.name}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          unit.isActive
                            ? "bg-brand-green-100 text-brand-green-800"
                            : "bg-neutral-200 text-neutral-600"
                        )}
                      >
                        {unit.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-brand-green-700">
                      /{unit.slug}
                    </p>
                  </div>
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green-900 to-brand-green-600 text-sm font-bold text-white shadow-md">
                    {unit.name.slice(0, 1).toUpperCase()}
                  </span>
                </div>

                <p className="relative mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">
                  {unit.description || "No description yet."}
                </p>

                <div className="relative mt-4 flex items-center justify-between rounded-xl bg-white/60 px-3 py-2.5 text-xs backdrop-blur-sm">
                  <span className="font-medium text-neutral-500">Products</span>
                  <span className="font-semibold text-neutral-900">{unit.productCount}</span>
                </div>

                <div className="relative mt-4 flex flex-wrap items-center gap-1.5 border-t border-neutral-900/5 pt-4">
                  <IconButton
                    label="Move up"
                    onClick={() => void reorder.mutateAsync({ id: unit.id, direction: "up" })}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    label="Move down"
                    onClick={() => void reorder.mutateAsync({ id: unit.id, direction: "down" })}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Edit" onClick={() => openEdit(unit)}>
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    label={unit.isActive ? "Deactivate" : "Activate"}
                    onClick={() => void toggleActive.mutateAsync(unit.id)}
                  >
                    <Power className="h-4 w-4" />
                  </IconButton>
                  <IconButton danger label="Delete" onClick={() => void handleDelete(unit)}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {drawerOpen ? (
        <UnitDrawer
          form={form}
          isEditing={Boolean(editing)}
          saving={saving}
          slugTouched={slugTouched}
          onClose={closeDrawer}
          onSave={() => void handleSave()}
          onSlugTouched={() => setSlugTouched(true)}
          onChange={(next) => setForm(next)}
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
  icon: typeof Layers3;
  label: string;
  value: string;
  tone: "green" | "gold" | "teal" | "slate";
}) {
  const tones = {
    green: "from-[#E8F5EE] to-white border-brand-green-100",
    gold: "from-[#F5F0E6] to-white border-[#E8D9B0]",
    teal: "from-[#E6F4F0] to-white border-emerald-100",
    slate: "from-neutral-50 to-white border-neutral-200",
  };
  const icons = {
    green: "from-brand-green-900 to-brand-green-600",
    gold: "from-[#A8843A] to-[#C9A24B]",
    teal: "from-[#0F766E] to-[#16875D]",
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

function IconButton({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-white hover:text-neutral-900",
        danger && "hover:bg-red-50 hover:text-red-600"
      )}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function UnitDrawer({
  form,
  isEditing,
  saving,
  slugTouched,
  onChange,
  onClose,
  onSave,
  onSlugTouched,
}: {
  form: UnitInput;
  isEditing: boolean;
  saving: boolean;
  slugTouched: boolean;
  onChange: (next: UnitInput) => void;
  onClose: () => void;
  onSave: () => void;
  onSlugTouched: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close drawer"
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 bg-gradient-to-r from-brand-green-50 to-[#F5F0E6] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-700">
              {isEditing ? "Edit unit" : "New unit"}
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold text-neutral-900">
              {isEditing ? form.name || "Unit" : "Create unit"}
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
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Name</span>
            <input
              className={inputClass}
              onChange={(e) => {
                const name = e.target.value;
                onChange({
                  ...form,
                  name,
                  slug: slugTouched ? form.slug : slugifyUnit(name),
                });
              }}
              placeholder="e.g. Bottle"
              value={form.name}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Slug</span>
            <input
              className={inputClass}
              onChange={(e) => {
                onSlugTouched();
                onChange({ ...form, slug: slugifyUnit(e.target.value) });
              }}
              placeholder="bottle"
              value={form.slug}
            />
            <span className="text-xs text-neutral-400">Internal key for this packaging unit</span>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Description</span>
            <textarea
              className="min-h-[110px] w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              placeholder="How this unit is used (optional)"
              value={form.description}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Sort order</span>
            <input
              className={inputClass}
              min={0}
              onChange={(e) => onChange({ ...form, sortOrder: Number(e.target.value) || 0 })}
              type="number"
              value={form.sortOrder}
            />
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <input
              checked={form.isActive}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand-green-600"
              onChange={(e) => onChange({ ...form, isActive: e.target.checked })}
              type="checkbox"
            />
            <span>
              <span className="block text-sm font-semibold text-neutral-900">Active</span>
              <span className="mt-0.5 block text-xs text-neutral-500">
                Inactive units stay hidden from the product form dropdown
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
            disabled={saving || !form.name.trim() || !form.slug.trim()}
            onClick={onSave}
            type="button"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isEditing ? "Save changes" : "Create unit"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
