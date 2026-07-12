"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ActiveFilterPills } from "@/components/public/active-filter-pills";
import { EmptyProductState } from "@/components/public/empty-product-state";
import { FilterDrawer } from "@/components/public/filter-drawer";
import { NewsletterStrip } from "@/components/public/newsletter-strip";
import { ProductCard } from "@/components/public/product-card";
import type { Availability, Category } from "@/components/public/product-filters";
import { ProductFilters } from "@/components/public/product-filters";
import { ProductListItem } from "@/components/public/ProductListItem";
import { SortDropdown } from "@/components/public/sort-dropdown";
import { ViewToggle } from "@/components/public/view-toggle";
import { toPublicProductCard } from "@/lib/products/public-mapper";
import type { PublicProduct } from "@/lib/products/public-types";

const categoryLabels: Record<Category, string> = {
  all: "All Products",
  "eye-care": "Eye Care",
  "brain-health": "Brain Health",
  omega: "Omega",
  vitamins: "Vitamins",
};

type SortOption = "Newest" | "Price Low to High" | "Price High to Low" | "Most Popular";
type ViewMode = "grid" | "list";

const PAGE_SIZE = 12;

type ShopCatalogProps = {
  products: PublicProduct[];
  initialQuery?: string;
  initialCategory?: Category;
};

export function ShopCatalog({
  products,
  initialQuery = "",
  initialCategory = "all",
}: ShopCatalogProps) {
  const priceCeiling = useMemo(() => {
    const max = Math.max(...products.map((product) => product.price), 0);
    return Math.max(3000, Math.ceil(max / 100) * 100);
  }, [products]);

  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, priceCeiling]);
  const [sortBy, setSortBy] = useState<SortOption>("Newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [query, setQuery] = useState(initialQuery);

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<Category, number>> = {
      all: products.length,
      "eye-care": 0,
      "brain-health": 0,
      omega: 0,
      vitamins: 0,
    };
    for (const product of products) {
      const key = product.categorySlug as Category;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = products.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    if (selectedCategory !== "all") {
      items = items.filter((product) => product.categorySlug === selectedCategory);
    }

    if (selectedAvailability.length === 1) {
      items = items.filter((product) =>
        selectedAvailability[0] === "in-stock" ? product.inStock : !product.inStock
      );
    }

    if (q) {
      items = items.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.shortDescription.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case "Price Low to High":
        return [...items].sort((a, b) => a.price - b.price);
      case "Price High to Low":
        return [...items].sort((a, b) => b.price - a.price);
      case "Most Popular":
        return [...items].sort((a, b) => Number(b.featured) - Number(a.featured) || b.stock - a.stock);
      default:
        return [...items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [priceRange, products, query, selectedAvailability, selectedCategory, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(activePage, totalPages);
  const showingStart = filteredProducts.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = Math.min(safePage * PAGE_SIZE, filteredProducts.length);
  const visibleProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activePills = [
    query.trim()
      ? {
          label: `Search: ${query.trim()}`,
          onRemove: () => {
            setQuery("");
            setActivePage(1);
          },
        }
      : null,
    selectedCategory !== "all"
      ? {
          label: categoryLabels[selectedCategory],
          onRemove: () => {
            setSelectedCategory("all");
            setActivePage(1);
          },
        }
      : null,
    priceRange[1] < priceCeiling
      ? {
          label: `Under ৳${priceRange[1].toLocaleString("en-US")}`,
          onRemove: () => {
            setPriceRange([0, priceCeiling]);
            setActivePage(1);
          },
        }
      : null,
    ...selectedAvailability.map((item) => ({
      label: item === "in-stock" ? "In Stock" : "Out of Stock",
      onRemove: () => {
        setSelectedAvailability((current) => current.filter((row) => row !== item));
        setActivePage(1);
      },
    })),
  ].filter(Boolean) as Array<{ label: string; onRemove: () => void }>;

  function clearAllFilters() {
    setSelectedCategory("all");
    setSelectedAvailability([]);
    setPriceRange([0, priceCeiling]);
    setSortBy("Newest");
    setQuery("");
    setActivePage(1);
  }

  function toggleAvailability(availability: Availability) {
    setSelectedAvailability((current) =>
      current.includes(availability)
        ? current.filter((item) => item !== availability)
        : [...current, availability]
    );
    setActivePage(1);
  }

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, safePage - 1);
    const end = Math.min(totalPages, start + 2);
    for (let page = Math.max(1, end - 2); page <= end; page += 1) pages.push(page);
    return pages;
  }, [safePage, totalPages]);

  return (
    <div className="bg-[#F7F8F9] text-neutral-900">
      <section className="border-b border-brand-green-100/80 bg-[radial-gradient(circle_at_top_right,_rgba(22,135,93,0.12),_transparent_28%),linear-gradient(135deg,_#eef8f2_0%,_#ffffff_52%,_#f8fbf9_100%)] py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-5">
            <div className="text-sm text-neutral-500">
              <Link className="transition-colors duration-200 hover:text-brand-green-600" href="/">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-brand-green-600">Shop</span>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
                  Catalog
                </p>
                <h1 className="font-heading text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                  Our Products
                </h1>
                <p className="text-base leading-7 text-neutral-500 sm:text-lg sm:leading-8">
                  Clinically trusted supplements for everyday wellbeing — filter by category,
                  availability, or price.
                </p>
              </div>

              <label className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm text-neutral-900 shadow-sm outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActivePage(1);
                  }}
                  placeholder="Search products, categories, tags…"
                  value={query}
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <ProductFilters
                  categoryCounts={categoryCounts}
                  maxPrice={priceRange[1]}
                  minPrice={priceRange[0]}
                  onAvailabilityToggle={toggleAvailability}
                  onCategoryChange={(category) => {
                    setSelectedCategory(category);
                    setActivePage(1);
                  }}
                  onClearAll={clearAllFilters}
                  onPriceChange={(range) => {
                    setPriceRange(range);
                    setActivePage(1);
                  }}
                  priceCeiling={priceCeiling}
                  selectedAvailability={selectedAvailability}
                  selectedCategory={selectedCategory}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm sm:px-5 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm text-neutral-500">
                  Showing {filteredProducts.length ? `${showingStart}–${showingEnd}` : "0"} of{" "}
                  {filteredProducts.length} products
                  {products.length !== filteredProducts.length
                    ? ` · ${products.length} in catalog`
                    : ""}
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

                  <SortDropdown
                    onChange={(value) => {
                      setSortBy(value as SortOption);
                      setActivePage(1);
                    }}
                    value={sortBy}
                  />
                  <ViewToggle onChange={setViewMode} view={viewMode} />
                </div>
              </div>

              <ActiveFilterPills onClearAll={clearAllFilters} pills={activePills} />

              {visibleProducts.length ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3"
                      : "space-y-4"
                  }
                >
                  {visibleProducts.map((product) => {
                    const card = toPublicProductCard(product);
                    return viewMode === "grid" ? (
                      <ProductCard key={product.id} product={card} />
                    ) : (
                      <ProductListItem key={product.id} product={card} />
                    );
                  })}
                </div>
              ) : (
                <EmptyProductState onClearAll={clearAllFilters} />
              )}

              {totalPages > 1 ? (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    aria-label="Previous page"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-all duration-200 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={safePage <= 1}
                    onClick={() => setActivePage((page) => Math.max(1, page - 1))}
                    type="button"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all duration-200 ${
                        safePage === page
                          ? "bg-brand-green-600 text-white shadow-sm"
                          : "border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-100"
                      }`}
                      onClick={() => setActivePage(page)}
                      type="button"
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    aria-label="Next page"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-all duration-200 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={safePage >= totalPages}
                    onClick={() => setActivePage((page) => Math.min(totalPages, page + 1))}
                    type="button"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <NewsletterStrip />

      <FilterDrawer
        categoryCounts={categoryCounts}
        maxPrice={priceRange[1]}
        minPrice={priceRange[0]}
        onAvailabilityToggle={toggleAvailability}
        onCategoryChange={(category) => {
          setSelectedCategory(category);
          setActivePage(1);
        }}
        onClearAll={clearAllFilters}
        onClose={() => setMobileFiltersOpen(false)}
        onPriceChange={(range) => {
          setPriceRange(range);
          setActivePage(1);
        }}
        open={mobileFiltersOpen}
        priceCeiling={priceCeiling}
        selectedAvailability={selectedAvailability}
        selectedCategory={selectedCategory}
      />
    </div>
  );
}
