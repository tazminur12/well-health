"use client";

import { useMemo } from "react";

export type Availability = "in-stock" | "out-of-stock";
export type Category = "all" | "eye-care" | "brain-health" | "omega" | "vitamins";

type ProductFiltersProps = {
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

const categoryMeta: Array<{ value: Category; label: string }> = [
  { value: "all", label: "All Products" },
  { value: "eye-care", label: "Eye Care" },
  { value: "brain-health", label: "Brain Health" },
  { value: "omega", label: "Omega" },
  { value: "vitamins", label: "Vitamins" },
];

export function ProductFilters({
  selectedCategory,
  selectedAvailability,
  minPrice,
  maxPrice,
  priceCeiling = 3000,
  categoryCounts,
  onCategoryChange,
  onAvailabilityToggle,
  onPriceChange,
  onClearAll,
}: ProductFiltersProps) {
  const isInStockChecked = selectedAvailability.includes("in-stock");
  const isOutOfStockChecked = selectedAvailability.includes("out-of-stock");

  const minLabel = useMemo(() => `৳${minPrice.toLocaleString("en-US")}`, [minPrice]);
  const maxLabel = useMemo(() => `৳${maxPrice.toLocaleString("en-US")}`, [maxPrice]);

  return (
    <aside className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-neutral-900">
            Category
          </h3>

          <div className="mt-4 space-y-3">
            {categoryMeta.map(({ value, label }) => {
              const checked = selectedCategory === value;
              const count = categoryCounts?.[value];

              return (
                <label
                  key={value}
                  className="flex cursor-pointer items-center justify-between gap-4 text-sm text-neutral-700"
                >
                  <span className="flex items-center gap-3">
                    <input
                      checked={checked}
                      className="h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-100"
                      name="category"
                      onChange={() => onCategoryChange(value)}
                      type="radio"
                    />
                    <span>{label}</span>
                  </span>
                  {typeof count === "number" ? (
                    <span className="text-xs text-neutral-500">({count})</span>
                  ) : null}
                </label>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-neutral-900">
            Price Range
          </h3>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
              <span>{minLabel}</span>
              <span>{maxLabel}</span>
            </div>

            <div className="space-y-3">
              <input
                aria-label="Minimum price range"
                className="w-full accent-brand-green-600"
                max={priceCeiling}
                min={0}
                onChange={(event) =>
                  onPriceChange([Math.min(Number(event.target.value), maxPrice), maxPrice])
                }
                title="Minimum price range"
                type="range"
                value={minPrice}
              />
              <input
                aria-label="Maximum price range"
                className="w-full accent-brand-green-600"
                max={priceCeiling}
                min={0}
                onChange={(event) =>
                  onPriceChange([minPrice, Math.max(Number(event.target.value), minPrice)])
                }
                title="Maximum price range"
                type="range"
                value={maxPrice}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-xs font-medium text-neutral-500">
                <span>Min</span>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none transition-colors duration-200 focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100"
                  max={priceCeiling}
                  min={0}
                  onChange={(event) => onPriceChange([Number(event.target.value), maxPrice])}
                  type="number"
                  value={minPrice}
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-neutral-500">
                <span>Max</span>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none transition-colors duration-200 focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100"
                  max={priceCeiling}
                  min={0}
                  onChange={(event) => onPriceChange([minPrice, Number(event.target.value)])}
                  type="number"
                  value={maxPrice}
                />
              </label>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-neutral-900">
            Availability
          </h3>

          <div className="mt-4 space-y-3">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-neutral-700">
              <input
                checked={isInStockChecked}
                className="h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-100"
                onChange={() => onAvailabilityToggle("in-stock")}
                type="checkbox"
              />
              <span>In Stock</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-neutral-700">
              <input
                checked={isOutOfStockChecked}
                className="h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-100"
                onChange={() => onAvailabilityToggle("out-of-stock")}
                type="checkbox"
              />
              <span>Out of Stock</span>
            </label>
          </div>
        </section>

        <button
          className="text-sm font-semibold text-brand-green-600 underline-offset-4 transition-colors duration-200 hover:underline"
          onClick={onClearAll}
          type="button"
        >
          Clear All Filters
        </button>
      </div>
    </aside>
  );
}
