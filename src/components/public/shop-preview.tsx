"use client";

import { useState } from "react";

import { ProductListItem } from "@/components/public/ProductListItem";

const tabs = ["All Products", "Eye Care", "Brain Health", "Omega", "Vitamins"];

const products = [
  {
    name: "Eyecare-B",
    category: "Eye Care",
    description: "Eye Vitamin & Mineral, 30 Tablets",
    price: "৳ 850.00",
  },
  {
    name: "Brain Health Syrup",
    category: "Brain Health",
    description: "Omega 3,6,9 with Vitamins & Minerals, 200ml",
    price: "৳ 950.00",
  },
  {
    name: "Omega 3 Softgels",
    category: "Omega",
    description: "EPA 650mg | DHA 450mg, 60 Softgels",
    price: "৳ 1200.00",
  },
];

export function ShopPreview() {
  const [activeTab, setActiveTab] = useState("All Products");

  return (
    <section className="bg-neutral-100 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <span className="h-8 w-1.5 rounded-full bg-brand-green-600" />
          <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Shop
          </h2>
        </div>

        <div className="mb-8 -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <div className="flex min-w-max gap-3">
            {tabs.map((tab) => {
              const isActive = tab === activeTab;

              return (
                <button
                  key={tab}
                  className={isActive
                    ? "inline-flex items-center justify-center rounded-full bg-brand-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
                    : "inline-flex items-center justify-center rounded-full bg-transparent px-5 py-3 text-sm font-semibold text-neutral-500 transition-all duration-200 hover:bg-brand-green-100 hover:text-brand-green-600"}
                  onClick={() => setActiveTab(tab)}
                  type="button"
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {products.map((product) => (
            <ProductListItem
              key={product.name}
              description={product.description}
              name={product.name}
              price={product.price}
            />
          ))}
        </div>

        <div className="mt-8">
          <button
            className="inline-flex w-full items-center justify-center rounded-lg bg-brand-green-600 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
            type="button"
          >
            VIEW ALL PRODUCTS
          </button>
        </div>
      </div>
    </section>
  );
}