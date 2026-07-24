"use client";

import {
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutList,
  Package2,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { formatProductStrength } from "@/components/admin/products-data";
import { ActiveFilterPills } from "@/components/public/active-filter-pills";
import { EmptyProductState } from "@/components/public/empty-product-state";
import { NewsletterStrip } from "@/components/public/newsletter-strip";
import { PageHero } from "@/components/public/page-hero";
import { ProductCard } from "@/components/public/product-card";
import { ProductListItem } from "@/components/public/ProductListItem";
import { SortDropdown } from "@/components/public/sort-dropdown";
import { ViewToggle } from "@/components/public/view-toggle";
import { cn } from "@/lib/utils";
import { toPublicProductCard } from "@/lib/products/public-mapper";
import type { PublicProduct, PublicShopCategory } from "@/lib/products/public-types";

type SortOption = "Newest" | "Price Low to High" | "Price High to Low" | "Most Popular";
type ViewMode = "grid" | "list";
type Availability = "in-stock" | "out-of-stock";

const PAGE_SIZE = 24;

type ProductListCatalogProps = {
  products: PublicProduct[];
  categories: PublicShopCategory[];
  initialQuery?: string;
  initialCategory?: string;
};

export function ProductListCatalog({
  products,
  categories,
  initialQuery = "",
  initialCategory = "all",
}: ProductListCatalogProps) {
  const priceCeiling = useMemo(() => {
    const max = Math.max(...products.map((product) => product.price), 0);
    return Math.max(3000, Math.ceil(max / 100) * 100);
  }, [products]);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, priceCeiling]);
  const [sortBy, setSortBy] = useState<SortOption>("Newest");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [query, setQuery] = useState(initialQuery);

  const inStockCount = useMemo(
    () => products.filter((product) => product.inStock).length,
    [products]
  );

  const categoryNameBySlug = useMemo(() => {
    const map = new Map(categories.map((item) => [item.slug, item.name]));
    return map;
  }, [categories]);

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
      items = items.filter((product) => {
        const strength = formatProductStrength(product.strength, product.strengthUnit);
        const haystack = [
          product.name,
          product.shortDescription,
          product.category,
          product.dosageForm,
          strength,
          product.packSize,
          product.genericName,
          product.unit,
          ...product.tags,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    switch (sortBy) {
      case "Price Low to High":
        return [...items].sort((a, b) => a.price - b.price);
      case "Price High to Low":
        return [...items].sort((a, b) => b.price - a.price);
      case "Most Popular":
        return [...items].sort(
          (a, b) => Number(b.featured) - Number(a.featured) || b.stock - a.stock
        );
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
          label: categoryNameBySlug.get(selectedCategory) ?? selectedCategory,
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

  const categoryOptions = [
    { slug: "all", name: "All Products", productCount: products.length },
    ...categories,
  ];

  return (
    <div className="bg-[#F7F8F9] text-neutral-900">
      <PageHero
        actions={
          <label className="relative block w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              className="w-full rounded-xl border border-white/30 bg-white/95 py-3.5 pl-10 pr-4 text-sm text-neutral-900 shadow-lg outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-white focus:ring-4 focus:ring-white/30"
              onChange={(event) => {
                setQuery(event.target.value);
                setActivePage(1);
              }}
              placeholder="Search name, strength, dosage, pack size…"
              type="search"
              value={query}
            />
          </label>
        }
        crumbLabel="Product List"
        description="Full product directory with pharmaceutical specs — dosage, strength, pack size and availability."
        eyebrow="Product List"
        title="All Products"
        tone="shop"
      />

      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-3 sm:px-6 lg:px-8">
          <StatChip
            icon={Package2}
            label="Total products"
            tone="green"
            value={String(products.length)}
          />
          <StatChip
            icon={ShieldCheck}
            label="In stock"
            tone="dark"
            value={String(inStockCount)}
          />
          <StatChip
            icon={LayoutList}
            label="Categories"
            tone="gold"
            value={String(categories.length)}
          />
        </div>
      </section>

      <section className="py-10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            {/* Desktop filters */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-900">
                    Category
                  </h3>
                  <div className="mt-3 space-y-2">
                    {categoryOptions.map((item) => (
                      <button
                        key={item.slug}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                          selectedCategory === item.slug
                            ? "bg-brand-green-100 font-semibold text-brand-green-900"
                            : "text-neutral-600 hover:bg-neutral-50"
                        )}
                        onClick={() => {
                          setSelectedCategory(item.slug);
                          setActivePage(1);
                        }}
                        type="button"
                      >
                        <span>{item.name}</span>
                        <span className="text-xs text-neutral-400">{item.productCount}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-900">
                    Availability
                  </h3>
                  <div className="mt-3 space-y-2">
                    {(
                      [
                        ["in-stock", "In Stock"],
                        ["out-of-stock", "Out of Stock"],
                      ] as const
                    ).map(([value, label]) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700"
                      >
                        <input
                          checked={selectedAvailability.includes(value)}
                          className="h-4 w-4 rounded border-neutral-300 text-brand-green-600"
                          onChange={() => toggleAvailability(value)}
                          type="checkbox"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-900">
                    Max price
                  </h3>
                  <input
                    className="mt-3 w-full accent-brand-green-600"
                    max={priceCeiling}
                    min={0}
                    onChange={(event) => {
                      setPriceRange([0, Number(event.target.value)]);
                      setActivePage(1);
                    }}
                    type="range"
                    value={priceRange[1]}
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Up to ৳{priceRange[1].toLocaleString("en-US")}
                  </p>
                </div>

                <button
                  className="text-sm font-semibold text-brand-green-600 hover:underline"
                  onClick={clearAllFilters}
                  type="button"
                >
                  Clear all filters
                </button>
              </div>
            </aside>

            <div className="space-y-5">
              <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  <p className="font-heading text-lg font-bold text-neutral-900">
                    {selectedCategory === "all"
                      ? "Product List"
                      : categoryNameBySlug.get(selectedCategory) ?? "Products"}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Showing {filteredProducts.length ? `${showingStart}–${showingEnd}` : "0"} of{" "}
                    {filteredProducts.length} products
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="inline-flex items-center rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium lg:hidden"
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
                      : "space-y-3"
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
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white disabled:opacity-40"
                    disabled={safePage <= 1}
                    onClick={() => setActivePage((page) => Math.max(1, page - 1))}
                    type="button"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      className={cn(
                        "inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium",
                        safePage === page
                          ? "bg-brand-green-600 text-white"
                          : "border border-neutral-200 bg-white text-neutral-500"
                      )}
                      onClick={() => setActivePage(page)}
                      type="button"
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    aria-label="Next page"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white disabled:opacity-40"
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

      {/* Mobile filter drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileFiltersOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <button
          aria-label="Close filters"
          className={cn(
            "absolute inset-0 bg-neutral-950/40 transition-opacity",
            mobileFiltersOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileFiltersOpen(false)}
          type="button"
        />
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-[min(22rem,100%)] overflow-y-auto bg-white p-5 shadow-2xl transition-transform",
            mobileFiltersOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold">Filters</h2>
            <button
              className="text-sm font-semibold text-brand-green-600"
              onClick={() => setMobileFiltersOpen(false)}
              type="button"
            >
              Done
            </button>
          </div>
          <div className="space-y-2">
            {categoryOptions.map((item) => (
              <button
                key={item.slug}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm",
                  selectedCategory === item.slug
                    ? "bg-brand-green-100 font-semibold text-brand-green-900"
                    : "text-neutral-600 hover:bg-neutral-50"
                )}
                onClick={() => {
                  setSelectedCategory(item.slug);
                  setActivePage(1);
                }}
                type="button"
              >
                <span>{item.name}</span>
                <span className="text-xs text-neutral-400">{item.productCount}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Package2;
  label: string;
  value: string;
  tone: "green" | "dark" | "gold";
}) {
  const tones = {
    green: "border-brand-green-100 bg-[#E8F5EE]/50",
    dark: "border-neutral-200 bg-[#F7F8F9]",
    gold: "border-[#E8D9B0] bg-[#F5F0E6]/50",
  };
  const icons = {
    green: "bg-brand-green-600",
    dark: "bg-[#0B4D3A]",
    gold: "bg-[#C9A24B]",
  };

  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3", tones[tone])}>
      <span
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-xl text-white",
          icons[tone]
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
        <p className="font-heading text-xl font-bold text-neutral-900">{value}</p>
      </div>
    </div>
  );
}
