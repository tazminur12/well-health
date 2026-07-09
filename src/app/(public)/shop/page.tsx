"use client";

import Link from "next/link";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyProductState } from "@/components/public/empty-product-state";
import { FilterDrawer } from "@/components/public/filter-drawer";
import { NewsletterStrip } from "@/components/public/newsletter-strip";
import { ActiveFilterPills } from "@/components/public/active-filter-pills";
import { ProductFilters } from "@/components/public/product-filters";
import type { Availability, Category } from "@/components/public/product-filters";
import { ProductCard } from "@/components/public/product-card";
import { ProductListItem } from "@/components/public/ProductListItem";
import { SortDropdown } from "@/components/public/sort-dropdown";
import { ViewToggle } from "@/components/public/view-toggle";

type Product = {
  name: string;
  category: Exclude<Category, "all">;
  description: string;
  priceValue: number;
  price: string;
  inStock: boolean;
  popularity: number;
};

const products: Product[] = [
  { name: "Eyecare-B", category: "eye-care", description: "Eye Vitamin & Mineral, 30 Tablets", priceValue: 850, price: "৳ 850.00", inStock: true, popularity: 96 },
  { name: "Vision Guard", category: "eye-care", description: "Advanced Eye Care Formula, 60 Tablets", priceValue: 950, price: "৳ 950.00", inStock: true, popularity: 88 },
  { name: "Blue Light Shield", category: "eye-care", description: "Daily Screen Support, 30 Capsules", priceValue: 720, price: "৳ 720.00", inStock: false, popularity: 74 },
  { name: "Brain Health Syrup", category: "brain-health", description: "Omega 3,6,9 with Vitamins & Minerals, 200ml", priceValue: 950, price: "৳ 950.00", inStock: true, popularity: 93 },
  { name: "Focus Pro", category: "brain-health", description: "Cognitive Support, 30 Tablets", priceValue: 1100, price: "৳ 1,100.00", inStock: true, popularity: 86 },
  { name: "Mind Boost", category: "brain-health", description: "Daily Brain Support, 60 Capsules", priceValue: 1350, price: "৳ 1,350.00", inStock: false, popularity: 71 },
  { name: "Omega 3 Softgels", category: "omega", description: "EPA 650mg | DHA 450mg, 60 Softgels", priceValue: 1200, price: "৳ 1,200.00", inStock: true, popularity: 99 },
  { name: "Omega Balance", category: "omega", description: "Heart & Joint Support, 30 Softgels", priceValue: 1750, price: "৳ 1,750.00", inStock: true, popularity: 90 },
  { name: "Ultra Omega", category: "omega", description: "Premium Omega Blend, 90 Softgels", priceValue: 1950, price: "৳ 1,950.00", inStock: false, popularity: 82 },
  { name: "Vitamin C Plus", category: "vitamins", description: "Immune Support, 60 Tablets", priceValue: 500, price: "৳ 500.00", inStock: true, popularity: 84 },
  { name: "Multivitamin Daily", category: "vitamins", description: "Complete Daily Nutrition, 30 Tablets", priceValue: 890, price: "৳ 890.00", inStock: true, popularity: 91 },
  { name: "Mineral Boost", category: "vitamins", description: "Essential Minerals, 30 Tablets", priceValue: 1400, price: "৳ 1,400.00", inStock: false, popularity: 68 },
];

const categoryLabels: Record<Category, string> = {
  all: "All Products",
  "eye-care": "Eye Care",
  "brain-health": "Brain Health",
  omega: "Omega",
  vitamins: "Vitamins",
};

type SortOption = "Newest" | "Price Low to High" | "Price High to Low" | "Most Popular";

type ViewMode = "grid" | "list";

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<Availability[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [sortBy, setSortBy] = useState<SortOption>("Newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);

  const filteredProducts = useMemo(() => {
    let items = products.filter((product) => product.priceValue >= priceRange[0] && product.priceValue <= priceRange[1]);

    if (selectedCategory !== "all") {
      items = items.filter((product) => product.category === selectedCategory);
    }

    if (selectedAvailability.length === 1) {
      items = items.filter((product) => selectedAvailability[0] === "in-stock" ? product.inStock : !product.inStock);
    } else if (selectedAvailability.length === 2) {
      items = items.filter(() => true);
    }

    switch (sortBy) {
      case "Price Low to High":
        items = [...items].sort((a, b) => a.priceValue - b.priceValue);
        break;
      case "Price High to Low":
        items = [...items].sort((a, b) => b.priceValue - a.priceValue);
        break;
      case "Most Popular":
        items = [...items].sort((a, b) => b.popularity - a.popularity);
        break;
      default:
        items = [...items];
    }

    return items;
  }, [priceRange, selectedAvailability, selectedCategory, sortBy]);

  const totalCount = products.length;
  const showingStart = filteredProducts.length ? (activePage - 1) * 12 + 1 : 0;
  const showingEnd = Math.min(activePage * 12, filteredProducts.length);
  const visibleProducts = filteredProducts.slice((activePage - 1) * 12, activePage * 12);

  const activePills = [
    selectedCategory !== "all"
      ? { label: categoryLabels[selectedCategory], onRemove: () => setSelectedCategory("all") }
      : null,
    priceRange[1] < 3000
      ? { label: `Under ৳${priceRange[1].toLocaleString("en-US")}`, onRemove: () => setPriceRange([0, 3000]) }
      : null,
  ].filter(Boolean) as Array<{ label: string; onRemove: () => void }>;

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedAvailability([]);
    setPriceRange([0, 3000]);
    setSortBy("Newest");
    setActivePage(1);
  };

  const toggleAvailability = (availability: Availability) => {
    setSelectedAvailability((current) =>
      current.includes(availability) ? current.filter((item) => item !== availability) : [...current, availability]
    );
  };

  return (
    <div className="bg-white text-neutral-900">
      <section className="bg-[radial-gradient(circle_at_top_right,_rgba(22,135,93,0.12),_transparent_28%),linear-gradient(135deg,_#eef8f2_0%,_#ffffff_50%,_#f8fbf9_100%)] py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <div className="text-sm text-neutral-500">
              <Link className="transition-colors duration-200 hover:text-brand-green-600" href="/">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-brand-green-600">Our Products</span>
            </div>

            <div className="max-w-3xl space-y-4">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                Our Products
              </h1>
              <p className="text-lg leading-8 text-neutral-500">
                High Quality Supplements for a Healthy Tomorrow
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <ProductFilters
                  maxPrice={priceRange[1]}
                  minPrice={priceRange[0]}
                  onAvailabilityToggle={toggleAvailability}
                  onCategoryChange={(category) => setSelectedCategory(category)}
                  onClearAll={clearAllFilters}
                  onPriceChange={setPriceRange}
                  selectedAvailability={selectedAvailability}
                  selectedCategory={selectedCategory}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm sm:px-5 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm text-neutral-500">
                  Showing {filteredProducts.length ? `${showingStart}-${showingEnd}` : "0"} of {totalCount} products
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm transition-all duration-200 hover:bg-neutral-100 lg:hidden"
                    onClick={() => setMobileFiltersOpen(true)}
                    type="button"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </button>

                  <SortDropdown onChange={(value) => setSortBy(value as SortOption)} value={sortBy} />
                  <ViewToggle onChange={setViewMode} view={viewMode} />
                </div>
              </div>

              <ActiveFilterPills onClearAll={clearAllFilters} pills={activePills} />

              {visibleProducts.length ? (
                <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
                  {visibleProducts.map((product) =>
                    viewMode === "grid" ? (
                      <ProductCard
                        key={product.name}
                        description={product.description}
                        name={product.name}
                        price={product.price}
                      />
                    ) : (
                      <ProductListItem
                        key={product.name}
                        description={product.description}
                        name={product.name}
                        price={product.price}
                      />
                    )
                  )}
                </div>
              ) : (
                <EmptyProductState onClearAll={clearAllFilters} />
              )}

              <div className="flex items-center justify-center gap-2 pt-4">
                <button aria-label="Previous page" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-all duration-200 hover:bg-neutral-100" type="button">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all duration-200 ${activePage === page ? "bg-brand-green-600 text-white shadow-sm" : "border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-100"}`}
                    onClick={() => setActivePage(page)}
                    type="button"
                  >
                    {page}
                  </button>
                ))}
                <button aria-label="Next page" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-all duration-200 hover:bg-neutral-100" type="button">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <NewsletterStrip />

      <FilterDrawer
        maxPrice={priceRange[1]}
        minPrice={priceRange[0]}
        onAvailabilityToggle={toggleAvailability}
        onCategoryChange={(category) => setSelectedCategory(category)}
        onClearAll={clearAllFilters}
        onClose={() => setMobileFiltersOpen(false)}
        onPriceChange={setPriceRange}
        open={mobileFiltersOpen}
        selectedAvailability={selectedAvailability}
        selectedCategory={selectedCategory}
      />
    </div>
  );
}