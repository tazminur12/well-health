"use client";

import { GripVertical, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { AdminProduct, ProductCategory, ProductStatus } from "@/components/admin/admin-products-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductFormDrawerProps = {
  open: boolean;
  mode: "add" | "edit";
  categories: ProductCategory[];
  product: AdminProduct | null;
  onClose: () => void;
  onSave: (payload: AdminProduct) => void;
};

type ProductFormState = {
  name: string;
  nameBn: string;
  category: ProductCategory;
  sku: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  lowStockThreshold: string;
  description: string;
  descriptionBn: string;
  status: ProductStatus;
  featured: boolean;
  imageTones: string[];
};

const defaultImageTones = [
  "bg-[linear-gradient(135deg,#f0f5f3_0%,#dbece4_100%)]",
  "bg-[linear-gradient(135deg,#edf5fb_0%,#dbe9f8_100%)]",
  "bg-[linear-gradient(135deg,#fff7e9_0%,#fbe9c8_100%)]",
];

function getInitialFormState(
  mode: "add" | "edit",
  product: AdminProduct | null,
  fallbackCategory: ProductCategory
): ProductFormState {
  if (mode === "edit" && product) {
    return {
      name: product.name,
      nameBn: product.nameBn ?? "",
      category: product.category,
      sku: product.sku ?? "",
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      stock: String(product.stock),
      lowStockThreshold: String(product.lowStockThreshold),
      description: product.description,
      descriptionBn: product.descriptionBn ?? "",
      status: product.status,
      featured: product.featured,
      imageTones: [
        product.imageTone,
        "bg-[linear-gradient(135deg,#f1f7f4_0%,#deede6_100%)]",
        "bg-[linear-gradient(135deg,#fdf5ea_0%,#f8e4c6_100%)]",
      ],
    };
  }

  return {
    name: "",
    nameBn: "",
    category: fallbackCategory,
    sku: "",
    price: "",
    compareAtPrice: "",
    stock: "",
    lowStockThreshold: "10",
    description: "",
    descriptionBn: "",
    status: "Active",
    featured: false,
    imageTones: defaultImageTones,
  };
}

export function ProductFormDrawer({
  open,
  mode,
  categories,
  product,
  onClose,
  onSave,
}: ProductFormDrawerProps) {
  const [formState, setFormState] = useState<ProductFormState>(
    getInitialFormState(mode, product, categories[0])
  );

  useEffect(() => {
    if (!open) return;
    setFormState(getInitialFormState(mode, product, categories[0]));
  }, [categories, mode, open, product]);

  const drawerTitle = mode === "edit" ? "Edit Product" : "Add New Product";

  const generatedSkuPlaceholder = useMemo(() => {
    const slug = formState.name
      .trim()
      .slice(0, 18)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "")
      .toUpperCase();

    return slug ? `WHT-${slug}` : "WHT-EYE-0001";
  }, [formState.name]);

  function update<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit() {
    const payload: AdminProduct = {
      id: product?.id ?? `temp-${Date.now()}`,
      name: formState.name || "Untitled Product",
      nameBn: formState.nameBn || undefined,
      category: formState.category,
      sku: formState.sku || generatedSkuPlaceholder,
      price: Number(formState.price || 0),
      compareAtPrice: formState.compareAtPrice ? Number(formState.compareAtPrice) : undefined,
      stock: Number(formState.stock || 0),
      lowStockThreshold: Number(formState.lowStockThreshold || 10),
      description: formState.description,
      descriptionBn: formState.descriptionBn || undefined,
      featured: formState.featured,
      status: formState.status,
      imageTone: product?.imageTone ?? "bg-[linear-gradient(135deg,#eff7f3_0%,#dceee5_100%)]",
    };

    onSave(payload);
    onClose();
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-neutral-950/40 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-screen w-full max-w-[520px] bg-white shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-neutral-900">{drawerTitle}</h2>
              <p className="text-sm text-neutral-500">Design-only form with placeholder inputs</p>
            </div>

            <button
              aria-label="Close product drawer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">Basic Information</h3>
              <div className="grid gap-4">
                <FormField label="Product Name">
                  <input
                    className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                    onChange={(event) => update("name", event.target.value)}
                    placeholder="Neuro Balance Plus"
                    value={formState.name}
                  />
                </FormField>

                <FormField label="Product Name (Bangla)">
                  <input
                    className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm font-bangla outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                    onChange={(event) => update("nameBn", event.target.value)}
                    placeholder="Optional"
                    value={formState.nameBn}
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Category">
                    <select
                      className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                      onChange={(event) => update("category", event.target.value as ProductCategory)}
                      value={formState.category}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="SKU / Product Code">
                    <input
                      className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                      onChange={(event) => update("sku", event.target.value)}
                      placeholder={generatedSkuPlaceholder}
                      value={formState.sku}
                    />
                  </FormField>
                </div>
              </div>
            </section>

            <hr className="border-neutral-200" />

            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">Pricing and Inventory</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Price">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">৳</span>
                    <input
                      className="h-11 w-full rounded-lg border border-neutral-200 pl-8 pr-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                      onChange={(event) => update("price", event.target.value)}
                      type="number"
                      value={formState.price}
                    />
                  </div>
                </FormField>

                <FormField label="Compare-at Price">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">৳</span>
                    <input
                      className="h-11 w-full rounded-lg border border-neutral-200 pl-8 pr-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                      onChange={(event) => update("compareAtPrice", event.target.value)}
                      placeholder="Optional"
                      type="number"
                      value={formState.compareAtPrice}
                    />
                  </div>
                </FormField>

                <FormField label="Stock Quantity">
                  <input
                    className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                    onChange={(event) => update("stock", event.target.value)}
                    type="number"
                    value={formState.stock}
                  />
                </FormField>

                <FormField helperText="Alert when stock falls below this number" label="Low Stock Threshold">
                  <input
                    className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                    onChange={(event) => update("lowStockThreshold", event.target.value)}
                    type="number"
                    value={formState.lowStockThreshold}
                  />
                </FormField>
              </div>
            </section>

            <hr className="border-neutral-200" />

            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">Description</h3>
              <div className="grid gap-4">
                <FormField label="Description">
                  <textarea
                    className="min-h-[112px] w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                    onChange={(event) => update("description", event.target.value)}
                    rows={4}
                    value={formState.description}
                  />
                </FormField>

                <FormField label="Description (Bangla)">
                  <textarea
                    className="min-h-[112px] w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-bangla outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                    onChange={(event) => update("descriptionBn", event.target.value)}
                    placeholder="Optional"
                    rows={4}
                    value={formState.descriptionBn}
                  />
                </FormField>
              </div>
            </section>

            <hr className="border-neutral-200" />

            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">Product Images</h3>

              <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center">
                <UploadCloud className="mx-auto h-7 w-7 text-neutral-500" />
                <p className="mt-3 text-sm font-medium text-neutral-800">Click or drag images here</p>
                <p className="mt-1 text-xs text-neutral-500">PNG, JPG up to 5MB</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {formState.imageTones.map((tone, index) => (
                  <div
                    key={`${tone}-${index}`}
                    className={cn(
                      "group relative flex aspect-square items-center justify-center rounded-xl border border-white/70 shadow-sm",
                      tone
                    )}
                  >
                    <GripVertical className="h-4 w-4 text-neutral-500" />
                    <button
                      aria-label="Remove image"
                      className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-neutral-500 opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100"
                      type="button"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-neutral-200" />

            <section className="space-y-4 pb-1">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">Visibility</h3>

              <div className="space-y-3">
                <p className="text-sm font-medium text-neutral-700">Status</p>
                <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-1">
                  {(["Active", "Draft"] as const).map((status) => (
                    <button
                      key={status}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-sm font-medium",
                        formState.status === status
                          ? "bg-white text-neutral-900 shadow-sm"
                          : "text-neutral-500 hover:text-neutral-800"
                      )}
                      onClick={() => update("status", status)}
                      type="button"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-neutral-800">Featured Product</p>
                  <p className="text-xs text-neutral-500">Highlight this product on key storefront sections</p>
                </div>

                <button
                  aria-checked={formState.featured}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
                    formState.featured ? "bg-brand-green-600" : "bg-neutral-300"
                  )}
                  onClick={() => update("featured", !formState.featured)}
                  role="switch"
                  type="button"
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                      formState.featured ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            </section>
          </div>

          <footer className="sticky bottom-0 grid grid-cols-2 gap-3 border-t border-neutral-200 bg-white px-5 py-4">
            <Button className="h-11 rounded-lg" onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>

            <Button
              className="h-11 rounded-lg bg-brand-green-600 text-white hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
              onClick={handleSubmit}
              type="button"
            >
              Save Product
            </Button>
          </footer>
        </div>
      </aside>
    </>
  );
}

function FormField({
  label,
  helperText,
  children,
}: {
  label: string;
  helperText?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1.5 text-sm text-neutral-700">
      <span className="font-medium text-neutral-700">{label}</span>
      {children}
      {helperText ? <p className="text-xs text-neutral-500">{helperText}</p> : null}
    </label>
  );
}