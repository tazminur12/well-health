import { ProductForm } from "@/components/admin/product-form";

export default function AdminNewProductPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-600">
          Catalog
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-neutral-900">Add Product</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Create a complete product profile with pricing, inventory, media, and SEO.
        </p>
      </header>

      <ProductForm mode="create" />
    </div>
  );
}
