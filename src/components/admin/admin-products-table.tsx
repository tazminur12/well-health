"use client";

import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import {
  type AdminProduct,
  formatProductPrice,
  getProductDiscountPercent,
  getProductStockBucket,
  isProductOfferActive,
} from "@/components/admin/products-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type { AdminProduct, ProductCategory, ProductStatus } from "@/components/admin/products-data";

type AdminProductsTableProps = {
  products: AdminProduct[];
  totalFiltered: number;
  page: number;
  pageSize: number;
  selectedIds: string[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: number) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onToggleFeatured: (id: string) => void;
  onDelete: (product: AdminProduct) => void;
  onBulkDelete: () => void;
  onBulkArchive: () => void;
  onStatusChange: (id: string, status: AdminProduct["status"]) => void;
};

function stockDot(stock: number, threshold: number) {
  const bucket = getProductStockBucket(stock, threshold);
  if (bucket === "Out of Stock") return "bg-red-500";
  if (bucket === "Low Stock") return "bg-amber-500";
  return "bg-brand-green-600";
}

export function AdminProductsTable({
  products,
  totalFiltered,
  page,
  pageSize,
  selectedIds,
  onPageChange,
  onPageSizeChange,
  onToggleSelect,
  onToggleSelectAll,
  onToggleFeatured,
  onDelete,
  onBulkDelete,
  onBulkArchive,
  onStatusChange,
}: AdminProductsTableProps) {
  const allSelected = products.length > 0 && products.every((product) => selectedIds.includes(product.id));
  const selectedCount = selectedIds.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const showingStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingEnd = Math.min(page * pageSize, totalFiltered);

  return (
    <section className="space-y-3">
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200",
          selectedCount > 0 ? "max-h-24 opacity-100" : "max-h-0 border-transparent opacity-0"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-sm font-medium text-neutral-700">
            <span className="font-semibold text-neutral-900">{selectedCount}</span> selected
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              className="h-9 rounded-xl border-amber-200 px-4 text-amber-700 hover:bg-amber-50"
              onClick={onBulkArchive}
              type="button"
              variant="outline"
            >
              <Archive className="h-4 w-4" />
              Archive
            </Button>
            <Button
              className="h-9 rounded-xl border-red-200 px-4 text-red-600 hover:bg-red-50"
              onClick={onBulkDelete}
              type="button"
              variant="outline"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left">
            <thead className="border-b border-neutral-200 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3.5">
                  <input
                    aria-label="Select all visible products"
                    checked={allSelected}
                    className="h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-600"
                    onChange={onToggleSelectAll}
                    type="checkbox"
                  />
                </th>
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5">SKU</th>
                <th className="px-4 py-3.5 text-right">Price</th>
                <th className="px-4 py-3.5">Stock</th>
                <th className="px-4 py-3.5 text-center">Featured</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const checked = selectedIds.includes(product.id);

                return (
                  <tr
                    key={product.id}
                    className="border-b border-neutral-100 text-sm transition-colors duration-200 hover:bg-brand-green-100/30"
                  >
                    <td className="px-4 py-3.5">
                      <input
                        aria-label={`Select ${product.name}`}
                        checked={checked}
                        className="h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-600"
                        onChange={() => onToggleSelect(product.id)}
                        type="checkbox"
                      />
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white text-[10px] font-semibold text-neutral-600 shadow-sm",
                            !product.imageUrls?.[0] && product.imageTone
                          )}
                        >
                          {product.imageUrls?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              alt=""
                              className="h-full w-full object-cover"
                              src={product.imageUrls[0]}
                            />
                          ) : (
                            `${product.imageCount || 0} IMG`
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold text-neutral-900">{product.name}</p>
                            {isProductOfferActive(product) ? (
                              <span className="inline-flex shrink-0 rounded-full bg-[#C9A24B]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8a6d2d]">
                                {product.offerBadge ?? "Sale"}
                                {getProductDiscountPercent(product)
                                  ? ` ${getProductDiscountPercent(product)}%`
                                  : ""}
                              </span>
                            ) : null}
                          </div>
                          <p className="truncate text-xs text-neutral-500">
                            {product.category}
                            {product.offerEnabled && product.offerLabel
                              ? ` · ${product.offerLabel}`
                              : product.labTested
                                ? " · Lab tested"
                                : ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <code className="rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
                        {product.sku}
                      </code>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {isProductOfferActive(product) && product.offerPrice ? (
                        <>
                          <p className="font-semibold text-brand-green-700">
                            {formatProductPrice(product.offerPrice)}
                          </p>
                          <p className="text-xs text-neutral-400 line-through">
                            {formatProductPrice(product.price)}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-neutral-800">
                            {formatProductPrice(product.price)}
                          </p>
                          {product.compareAtPrice ? (
                            <p className="text-xs text-neutral-400 line-through">
                              {formatProductPrice(product.compareAtPrice)}
                            </p>
                          ) : null}
                        </>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-2 font-medium text-neutral-700">
                        <span className={cn("h-2.5 w-2.5 rounded-full", stockDot(product.stock, product.lowStockThreshold))} />
                        {product.stock}
                        <span className="text-xs font-normal text-neutral-400">{product.unit}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <button
                        aria-label={`Toggle featured for ${product.name}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400 transition-all duration-200 hover:border-gold-accent/40 hover:text-gold-accent"
                        onClick={() => onToggleFeatured(product.id)}
                        type="button"
                      >
                        <Star
                          className={cn(
                            "h-4 w-4",
                            product.featured ? "fill-gold-accent text-gold-accent" : "text-neutral-300"
                          )}
                        />
                      </button>
                    </td>

                    <td className="px-4 py-3.5">
                      <select
                        className={cn(
                          "h-9 rounded-full border-0 px-3 text-xs font-semibold outline-none",
                          product.status === "Active" && "bg-brand-green-100 text-brand-green-700",
                          product.status === "Draft" && "bg-neutral-200 text-neutral-600",
                          product.status === "Archived" && "bg-amber-100 text-amber-700"
                        )}
                        onChange={(event) =>
                          onStatusChange(product.id, event.target.value as AdminProduct["status"])
                        }
                        value={product.status}
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          aria-label={`View ${product.name}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                          href={`/admin/products/${product.id}`}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          aria-label={`Edit ${product.name}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                          href={`/admin/products/${product.id}/edit`}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          aria-label={`Delete ${product.name}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(product)}
                          title="Delete"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-neutral-300">
                          <MoreHorizontal className="h-4 w-4" />
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {products.length === 0 ? (
                <tr>
                  <td className="px-4 py-14 text-center text-sm text-neutral-500" colSpan={8}>
                    No products match your filters. Try clearing search or stock filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3.5 text-sm text-neutral-500">
          <p>
            Showing {showingStart}-{showingEnd} of {totalFiltered}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-neutral-200 px-3 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            <span className="rounded-xl bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">
              {page} / {totalPages}
            </span>

            <button
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-neutral-200 px-3 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              type="button"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>

            <label className="inline-flex items-center gap-2 pl-1 text-neutral-600">
              <span>Per page</span>
              <select
                className="h-9 rounded-xl border border-neutral-200 bg-white px-2.5 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
                value={pageSize}
              >
                <option value={8}>8</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </label>
          </div>
        </footer>
      </div>
    </section>
  );
}
