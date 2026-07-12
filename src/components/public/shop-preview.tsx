"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";

import { ProductListItem } from "@/components/public/ProductListItem";
import type { PublicProductCard } from "@/lib/products/public-types";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "All Products", short: "All" },
  { id: "Eye Care", short: "Eye" },
  { id: "Brain Health", short: "Brain" },
  { id: "Omega", short: "Omega" },
  { id: "Vitamins", short: "Vitamins" },
] as const;

type TabId = (typeof tabs)[number]["id"];

type ShopPreviewProps = {
  products: PublicProductCard[];
};

export function ShopPreview({ products }: ShopPreviewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("All Products");

  const filtered = useMemo(() => {
    if (activeTab === "All Products") return products.slice(0, 6);
    return products.filter((product) => product.category === activeTab).slice(0, 6);
  }, [activeTab, products]);

  return (
    <section className="relative overflow-hidden bg-[#F7F8F9] py-12 sm:py-16 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(22,135,93,0.06),_transparent_45%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-1.5 sm:mb-8 sm:space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
            Browse
          </p>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl">
            Shop
          </h2>
          <p className="max-w-md text-sm text-neutral-500">
            Filter by category and find the right supplement for your routine.
          </p>
        </div>

        <div className="mb-5 -mx-4 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:mb-6 sm:overflow-visible sm:px-0">
          <div
            aria-label="Product categories"
            className="flex w-max gap-2 sm:w-auto sm:flex-wrap"
            role="tablist"
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  aria-selected={isActive}
                  className={cn(
                    "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-4 text-sm font-semibold transition-all duration-200 active:scale-[0.98] sm:px-5",
                    isActive
                      ? "bg-brand-green-600 text-white shadow-sm"
                      : "bg-white text-neutral-600 ring-1 ring-neutral-200 active:bg-brand-green-100 hover:bg-brand-green-100 hover:text-brand-green-600"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  type="button"
                >
                  <span className="sm:hidden">{tab.short}</span>
                  <span className="hidden sm:inline">{tab.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {filtered.length > 0 ? (
            filtered.map((product) => (
              <ProductListItem key={product.id} product={product} />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-10 text-center">
              <p className="text-sm font-medium text-neutral-700">No products in this category</p>
              <p className="mt-1 text-sm text-neutral-500">
                Try another filter or view the full shop.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 sm:mt-8">
          <Link
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.99] active:bg-brand-green-900 hover:bg-brand-green-900 sm:min-h-14"
            href="/shop"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
