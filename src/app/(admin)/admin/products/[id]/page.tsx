"use client";

import { use } from "react";

import { AdminProductDetail } from "@/components/admin/admin-product-detail";

export default function AdminProductDetailPage({
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
        <h1 className="mt-1 font-heading text-2xl font-bold text-neutral-900">
          Product details
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Review pharmaceutical specs, pricing, and storefront visibility before editing.
        </p>
      </header>

      <AdminProductDetail productId={id} />
    </div>
  );
}
