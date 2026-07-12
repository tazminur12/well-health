import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/public/product-card";
import { getFeaturedProducts } from "@/lib/products/public-queries";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts(4);

  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(22,135,93,0.05),_transparent_50%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-3 sm:mb-8">
          <div className="min-w-0 space-y-1.5 sm:space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
              Featured
            </p>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl">
              Our Products
            </h2>
            <p className="hidden max-w-md text-sm text-neutral-500 sm:block">
              Carefully selected supplements for everyday wellbeing.
            </p>
          </div>

          <Link
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-brand-green-600 px-3.5 text-sm font-semibold text-brand-green-600 transition-all duration-200 active:bg-brand-green-100 hover:bg-brand-green-100 sm:gap-2 sm:px-5"
            href="/shop"
          >
            <span className="sm:hidden">All</span>
            <span className="hidden sm:inline">View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
            <p className="text-sm font-medium text-neutral-700">No featured products yet</p>
            <p className="mt-1 text-sm text-neutral-500">
              Mark products as featured in the admin panel to showcase them here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
