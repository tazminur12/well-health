"use client";

import {
  AlertTriangle,
  CheckCircle,
  Download,
  Loader2,
  Package,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminProductsTable } from "@/components/admin/admin-products-table";
import {
  type AdminProduct,
  type ProductCategory,
  getProductStockBucket,
  PRODUCT_CATEGORIES,
} from "@/components/admin/products-data";
import { Button } from "@/components/ui/button";
import { useAdminProducts, useProductMutations } from "@/hooks/use-admin-products";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import { cn } from "@/lib/utils";

type StockFilter = "All" | "In Stock" | "Low Stock" | "Out of Stock";
type StatusFilter = "All" | AdminProduct["status"];

export default function AdminProductsPage() {
  const { data: products = [], isLoading, isError, error, refetch } = useAdminProducts();
  const {
    deleteProduct,
    deleteProducts,
    archiveProducts,
    toggleFeatured,
    setStatus,
  } = useProductMutations();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All Categories" | ProductCategory>("All Categories");
  const [stockFilter, setStockFilter] = useState<StockFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const stats = useMemo(() => {
    const active = products.filter((item) => item.status === "Active").length;
    const lowStock = products.filter(
      (item) => item.stock > 0 && item.stock <= item.lowStockThreshold
    ).length;
    const outOfStock = products.filter((item) => item.stock <= 0).length;
    return {
      total: products.length,
      active,
      lowStock,
      outOfStock,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesCategory = category === "All Categories" ? true : product.category === category;
      const matchesStock =
        stockFilter === "All"
          ? true
          : getProductStockBucket(product.stock, product.lowStockThreshold) === stockFilter;
      const matchesStatus = statusFilter === "All" ? true : product.status === statusFilter;
      const matchesFeatured = featuredOnly ? product.featured : true;

      return matchesSearch && matchesCategory && matchesStock && matchesStatus && matchesFeatured;
    });
  }, [category, featuredOnly, products, search, statusFilter, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize);

  const summaryCards = [
    { icon: Package, tone: "text-neutral-700", value: String(stats.total), label: "Total Products" },
    { icon: CheckCircle, tone: "text-brand-green-600", value: String(stats.active), label: "Active" },
    { icon: AlertTriangle, tone: "text-amber-500", value: String(stats.lowStock), label: "Low Stock" },
    { icon: XCircle, tone: "text-red-600", value: String(stats.outOfStock), label: "Out of Stock" },
  ];

  function handleToggleSelect(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function handleToggleSelectAll() {
    const visibleIds = visibleProducts.map((product) => product.id);
    const allVisibleSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...current, ...visibleIds]));
    });
  }

  async function handleDelete(product: AdminProduct) {
    const confirmed = await confirmAdminAction({
      title: "Delete product?",
      text: `"${product.name}" will be removed from the catalog.`,
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      await deleteProduct.mutateAsync(product.id);
      setSelectedIds((current) => current.filter((id) => id !== product.id));
      await showAdminSuccess("Product deleted", "The product was removed successfully.");
    } catch (err) {
      await showAdminError("Delete failed", err instanceof Error ? err.message : "Try again.");
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    const confirmed = await confirmAdminAction({
      title: "Delete selected products?",
      text: `${selectedIds.length} products will be permanently removed.`,
      confirmText: "Delete all",
    });
    if (!confirmed) return;

    try {
      await deleteProducts.mutateAsync(selectedIds);
      setSelectedIds([]);
      await showAdminSuccess("Products deleted", "Selected products were removed.");
    } catch (err) {
      await showAdminError("Delete failed", err instanceof Error ? err.message : "Try again.");
    }
  }

  async function handleBulkArchive() {
    if (selectedIds.length === 0) return;
    const confirmed = await confirmAdminAction({
      title: "Archive selected?",
      text: `${selectedIds.length} products will be marked as Archived.`,
      confirmText: "Archive",
    });
    if (!confirmed) return;

    try {
      await archiveProducts.mutateAsync(selectedIds);
      setSelectedIds([]);
      await showAdminSuccess("Products archived", "Selected products are now archived.");
    } catch (err) {
      await showAdminError("Archive failed", err instanceof Error ? err.message : "Try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading products from database...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="font-heading text-lg font-bold text-red-700">Could not load products</h2>
        <p className="mt-2 text-sm text-red-600">
          {error instanceof Error ? error.message : "Unexpected error"}
        </p>
        <Button className="mt-4 rounded-xl" onClick={() => refetch()} type="button">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900">Product Management</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Create, update, and organize your clinical supplement catalog
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button className="h-10 rounded-xl" type="button" variant="outline">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button
            asChild
            className="h-10 rounded-xl bg-brand-green-600 text-white hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
          >
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 shadow-sm"
            >
              <span
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100",
                  card.tone
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-xl font-bold text-neutral-900">{card.value}</p>
                <p className="text-sm text-neutral-500">{card.label}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <label className="relative min-w-[230px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name, SKU, or category..."
            value={search}
          />
        </label>

        <select
          className="h-10 min-w-[160px] rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
          onChange={(event) => {
            setCategory(event.target.value as "All Categories" | ProductCategory);
            setPage(1);
          }}
          value={category}
        >
          <option value="All Categories">All Categories</option>
          {PRODUCT_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          className="h-10 min-w-[140px] rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
          onChange={(event) => {
            setStockFilter(event.target.value as StockFilter);
            setPage(1);
          }}
          value={stockFilter}
        >
          <option value="All">All Stock</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        <select
          className="h-10 min-w-[140px] rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
          onChange={(event) => {
            setStatusFilter(event.target.value as StatusFilter);
            setPage(1);
          }}
          value={statusFilter}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
          <option value="Archived">Archived</option>
        </select>

        <div className="ml-auto flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2">
          <span className="text-sm font-medium text-neutral-600">Featured Only</span>
          <button
            aria-checked={featuredOnly}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
              featuredOnly ? "bg-brand-green-600" : "bg-neutral-300"
            )}
            onClick={() => {
              setFeaturedOnly((current) => !current);
              setPage(1);
            }}
            role="switch"
            type="button"
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                featuredOnly ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
      </section>

      <AdminProductsTable
        onBulkArchive={handleBulkArchive}
        onBulkDelete={handleBulkDelete}
        onDelete={handleDelete}
        onPageChange={setPage}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
        onStatusChange={async (id, status) => {
          try {
            await setStatus.mutateAsync({ id, status });
          } catch (err) {
            await showAdminError(
              "Status update failed",
              err instanceof Error ? err.message : "Try again."
            );
          }
        }}
        onToggleFeatured={async (id) => {
          try {
            await toggleFeatured.mutateAsync(id);
          } catch (err) {
            await showAdminError(
              "Update failed",
              err instanceof Error ? err.message : "Try again."
            );
          }
        }}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        page={safePage}
        pageSize={pageSize}
        products={visibleProducts}
        selectedIds={selectedIds.filter((id) => visibleProducts.some((product) => product.id === id))}
        totalFiltered={filteredProducts.length}
      />
    </div>
  );
}
