"use client";

import {
  ArrowDown,
  ArrowUp,
  FolderTree,
  Layers3,
  Loader2,
  Package,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  useAdminCategories,
  useCategoryMutations,
} from "@/hooks/use-admin-categories";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import type { AdminCategory, CategoryInput } from "@/lib/categories/schemas";
import { slugifyCategory } from "@/lib/categories/schemas";
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

const emptyForm: CategoryInput = {
  name: "",
  slug: "",
  description: "",
  sortOrder: 0,
  isActive: true,
};

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20";

export function AdminCategoriesPage() {
  const { data: categories = [], isLoading, isError, error, refetch } = useAdminCategories();
  const { createCategory, updateCategory, deleteCategory, toggleActive, reorder } =
    useCategoryMutations();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState<CategoryInput>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q);
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "active"
            ? item.isActive
            : !item.isActive;
      return matchesSearch && matchesFilter;
    });
  }, [categories, filter, search]);

  const stats = useMemo(() => {
    const totalProducts = categories.reduce((sum, item) => sum + item.productCount, 0);
    return {
      total: categories.length,
      active: categories.filter((c) => c.isActive).length,
      empty: categories.filter((c) => c.productCount === 0).length,
      products: totalProducts,
    };
  }, [categories]);

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      sortOrder: categories.length,
    });
    setSlugTouched(false);
    setDrawerOpen(true);
  }

  function openEdit(category: AdminCategory) {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      sortOrder: category.sortOrder,
      isActive: category.isActive,
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
        await updateCategory.mutateAsync({ id: editing.id, input: form });
        await showAdminSuccess("Category updated", `${form.name} saved successfully.`);
      } else {
        await createCategory.mutateAsync(form);
        await showAdminSuccess("Category created", `${form.name} is ready to use.`);
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

  async function handleDelete(category: AdminCategory) {
    const ok = await confirmAdminAction({
      title: `Delete “${category.name}”?`,
      text:
        category.productCount > 0
          ? "This category still has products and cannot be deleted."
          : "This cannot be undone.",
      confirmText: "Delete",
    });
    if (!ok) return;
    if (category.productCount > 0) {
      await showAdminError(
        "Cannot delete",
        "Move or reassign products before deleting this category."
      );
      return;
    }
    try {
      await deleteCategory.mutateAsync(category.id);
      await showAdminSuccess("Deleted", `${category.name} removed.`);
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
        Loading categories…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">
          Couldn’t load categories
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
            <FolderTree className="h-3.5 w-3.5" />
            Catalog structure
          </div>
          <h1 className="mt-3 font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">
            Categories
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-neutral-500">
            Organize your supplement catalog with clean shop filters, sort order, and active
            visibility.
          </p>
        </div>
        <Button
          className="h-10 rounded-xl bg-gradient-to-r from-brand-green-900 to-brand-green-600 text-white shadow-[0_10px_24px_rgba(22,135,93,0.28)] hover:from-brand-green-900 hover:to-brand-green-900"
          onClick={openCreate}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add category
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Layers3}
          label="Total categories"
          tone="green"
          value={String(stats.total)}
        />
        <StatCard
          icon={Power}
          label="Active"
          tone="gold"
          value={String(stats.active)}
        />
        <StatCard
          icon={Package}
          label="Linked products"
          tone="teal"
          value={String(stats.products)}
        />
        <StatCard
          icon={FolderTree}
          label="Empty categories"
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
            placeholder="Search categories…"
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
            <FolderTree className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-heading text-xl font-bold text-neutral-900">
            No categories found
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
            {search || filter !== "all"
              ? "Try a different search or filter."
              : "Create your first category to structure the shop catalog."}
          </p>
          {!search && filter === "all" ? (
            <Button className="mt-5 rounded-xl" onClick={openCreate} type="button">
              <Plus className="h-4 w-4" />
              Add category
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((category, index) => {
            const gradient = cardGradients[index % cardGradients.length]!;
            const bar = barGradients[index % barGradients.length]!;
            return (
              <article
                key={category.id}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]",
                  gradient,
                  !category.isActive && "opacity-80"
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
                        {category.name}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          category.isActive
                            ? "bg-brand-green-100 text-brand-green-800"
                            : "bg-neutral-200 text-neutral-600"
                        )}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-brand-green-700">
                      /{category.slug}
                    </p>
                  </div>
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green-900 to-brand-green-600 text-sm font-bold text-white shadow-md">
                    {category.name.slice(0, 1).toUpperCase()}
                  </span>
                </div>

                <p className="relative mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">
                  {category.description || "No description yet."}
                </p>

                <div className="relative mt-4 flex items-center justify-between rounded-xl bg-white/60 px-3 py-2.5 text-xs backdrop-blur-sm">
                  <span className="font-medium text-neutral-500">Products</span>
                  <span className="font-semibold text-neutral-900">
                    {category.productCount}
                  </span>
                </div>

                <div className="relative mt-4 flex flex-wrap items-center gap-1.5 border-t border-neutral-900/5 pt-4">
                  <IconButton
                    label="Move up"
                    onClick={() => void reorder.mutateAsync({ id: category.id, direction: "up" })}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    label="Move down"
                    onClick={() =>
                      void reorder.mutateAsync({ id: category.id, direction: "down" })
                    }
                  >
                    <ArrowDown className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Edit" onClick={() => openEdit(category)}>
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    label={category.isActive ? "Deactivate" : "Activate"}
                    onClick={() => void toggleActive.mutateAsync(category.id)}
                  >
                    <Power className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    danger
                    label="Delete"
                    onClick={() => void handleDelete(category)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                  <Link
                    className="ml-auto inline-flex h-9 items-center rounded-lg px-2.5 text-xs font-semibold text-brand-green-700 transition-colors hover:bg-brand-green-50"
                    href={`/shop?category=${category.slug}`}
                    target="_blank"
                  >
                    View shop
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {drawerOpen ? (
        <CategoryDrawer
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
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-4 shadow-sm",
        tones[tone]
      )}
    >
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

function CategoryDrawer({
  form,
  isEditing,
  saving,
  slugTouched,
  onChange,
  onClose,
  onSave,
  onSlugTouched,
}: {
  form: CategoryInput;
  isEditing: boolean;
  saving: boolean;
  slugTouched: boolean;
  onChange: (next: CategoryInput) => void;
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
              {isEditing ? "Edit category" : "New category"}
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold text-neutral-900">
              {isEditing ? form.name || "Category" : "Create category"}
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
                  slug: slugTouched ? form.slug : slugifyCategory(name),
                });
              }}
              placeholder="e.g. Eye Care"
              value={form.name}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Slug</span>
            <input
              className={inputClass}
              onChange={(e) => {
                onSlugTouched();
                onChange({ ...form, slug: slugifyCategory(e.target.value) });
              }}
              placeholder="eye-care"
              value={form.slug}
            />
            <span className="text-xs text-neutral-400">Used in /shop?category=…</span>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Description</span>
            <textarea
              className="min-h-[110px] w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              placeholder="Short shop-facing description"
              value={form.description}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Sort order</span>
            <input
              className={inputClass}
              min={0}
              onChange={(e) =>
                onChange({ ...form, sortOrder: Number(e.target.value) || 0 })
              }
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
                Inactive categories stay hidden from future shop filters
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
            {isEditing ? "Save changes" : "Create category"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
