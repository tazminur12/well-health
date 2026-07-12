"use client";

import { use } from "react";

import { ProductForm } from "@/components/admin/product-form";

export default function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-600">
          Catalog
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-neutral-900">Edit Product</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Update product details, pricing, inventory, and storefront visibility.
        </p>
      </header>

      <ProductForm mode="edit" productId={id} />
    </div>
  );
}
