"use client";

import { X } from "lucide-react";

import { ProductFilters } from "@/components/public/product-filters";
import type { Availability, Category } from "@/components/public/product-filters";

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  selectedCategory: Category;
  selectedAvailability: Availability[];
  minPrice: number;
  maxPrice: number;
  priceCeiling?: number;
  categoryCounts?: Partial<Record<Category, number>>;
  onCategoryChange: (category: Category) => void;
  onAvailabilityToggle: (availability: Availability) => void;
  onPriceChange: (range: [number, number]) => void;
  onClearAll: () => void;
};

export function FilterDrawer({
  open,
  onClose,
  selectedCategory,
  selectedAvailability,
  minPrice,
  maxPrice,
  priceCeiling,
  categoryCounts,
  onCategoryChange,
  onAvailabilityToggle,
  onPriceChange,
  onClearAll,
}: FilterDrawerProps) {
  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <button
        aria-label="Close filters overlay"
        className={`absolute inset-0 bg-neutral-950/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        type="button"
      />

      <div
        className={`absolute right-0 top-0 h-full w-[min(24rem,100%)] overflow-y-auto bg-white shadow-2xl transition-transform duration-200 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <h2 className="font-heading text-xl font-bold text-neutral-900">Filters</h2>
          <button
            aria-label="Close filters"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-colors duration-200 hover:bg-neutral-100"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <ProductFilters
            categoryCounts={categoryCounts}
            maxPrice={maxPrice}
            minPrice={minPrice}
            onAvailabilityToggle={onAvailabilityToggle}
            onCategoryChange={onCategoryChange}
            onClearAll={onClearAll}
            onPriceChange={onPriceChange}
            priceCeiling={priceCeiling}
            selectedAvailability={selectedAvailability}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>
    </div>
  );
}
