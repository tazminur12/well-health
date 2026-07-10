"use client";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  GripVertical,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ProductCategory = "Eye Care" | "Brain Health" | "Omega" | "Vitamins";
export type ProductStatus = "Active" | "Draft";

export type AdminProduct = {
  id: string;
  name: string;
  nameBn?: string;
  category: ProductCategory;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  description: string;
  descriptionBn?: string;
  featured: boolean;
  status: ProductStatus;
  imageTone: string;
};

type AdminProductsTableProps = {
  products: AdminProduct[];
  totalProducts: number;
  selectedIds: string[];
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onToggleFeatured: (id: string) => void;
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  })
    .format(value)
    .replace("BDT", "৳");
}

function getStockTone(stock: number) {
  if (stock === 0) return "bg-red-500";
  if (stock <= 20) return "bg-amber-500";
  return "bg-brand-green-600";
}

export function AdminProductsTable({
  products,
  totalProducts,
  selectedIds,
  pageSize,
  onPageSizeChange,
  onToggleSelect,
  onToggleSelectAll,
  onToggleFeatured,
  onEdit,
  onDelete,
}: AdminProductsTableProps) {
  const allSelected = products.length > 0 && selectedIds.length === products.length;
  const selectedCount = selectedIds.length;
  const showingEnd = products.length;

  return (
    <section className="space-y-3">
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-200",
          selectedCount > 0 ? "max-h-20 opacity-100" : "max-h-0 border-transparent opacity-0"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-sm font-medium text-neutral-700">{selectedCount} selected</p>

          <div className="flex flex-wrap items-center gap-2">
            <Button className="h-9 rounded-lg border-red-200 px-4 text-red-600 hover:bg-red-50" variant="outline">
              Delete Selected
            </Button>
            <Button className="h-9 rounded-lg px-4" variant="outline">
              Export Selected
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left">
            <thead className="border-b border-neutral-200 bg-neutral-50/70 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">
                  <input
                    aria-label="Select all visible products"
                    checked={allSelected}
                    className="h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-600"
                    onChange={onToggleSelectAll}
                    type="checkbox"
                  />
                </th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-center">Featured</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const checked = selectedIds.includes(product.id);

                return (
                  <tr key={product.id} className="border-b border-neutral-100 text-sm hover:bg-neutral-100/70">
                    <td className="px-4 py-3">
                      <input
                        aria-label={`Select ${product.name}`}
                        checked={checked}
                        className="h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-600"
                        onChange={() => onToggleSelect(product.id)}
                        type="checkbox"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-lg border border-white/70 text-xs font-semibold text-neutral-700 shadow-sm",
                          product.imageTone
                        )}
                      >
                        IMG
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-semibold text-neutral-900">{product.name}</p>
                      <p className="text-xs text-neutral-500">{product.category}</p>
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-neutral-800">{formatPrice(product.price)}</td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 font-medium text-neutral-700">
                        <span className={cn("h-2.5 w-2.5 rounded-full", getStockTone(product.stock))} />
                        {product.stock}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        aria-label={`Toggle featured for ${product.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition-all duration-200 hover:border-neutral-300 hover:text-neutral-600"
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

                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          product.status === "Active"
                            ? "bg-brand-green-100 text-brand-green-600"
                            : "bg-neutral-200 text-neutral-600"
                        )}
                      >
                        {product.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          aria-label={`Preview ${product.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200/70 hover:text-neutral-800"
                          title="Preview"
                          type="button"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          aria-label={`Edit ${product.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200/70 hover:text-neutral-800"
                          onClick={() => onEdit(product)}
                          title="Edit"
                          type="button"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          aria-label={`Delete ${product.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(product)}
                          title="Delete"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {products.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-neutral-500" colSpan={8}>
                    No products found for the selected filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 text-sm text-neutral-500">
          <p>
            Showing 1-{showingEnd} of {totalProducts}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            <button
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={products.length < pageSize}
              type="button"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>

            <label className="inline-flex items-center gap-2 pl-1 text-neutral-600">
              <span>Per page</span>
              <select
                className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
                value={pageSize}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </label>
          </div>
        </footer>
      </div>
    </section>
  );
}

export function ProductImagePlaceholder({ tone }: { tone: string }) {
  return (
    <div className={cn("relative flex aspect-square w-full items-center justify-center rounded-lg border border-white/70", tone)}>
      <GripVertical className="h-4 w-4 text-neutral-500" />
    </div>
  );
}