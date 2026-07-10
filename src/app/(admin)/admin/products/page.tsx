"use client";

import {
  AlertTriangle,
  CheckCircle,
  Download,
  Package,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  type AdminProduct,
  AdminProductsTable,
  type ProductCategory,
} from "@/components/admin/admin-products-table";
import { ProductFormDrawer } from "@/components/admin/product-form-drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StockFilter = "All" | "In Stock" | "Low Stock" | "Out of Stock";

const categories: ProductCategory[] = ["Eye Care", "Brain Health", "Omega", "Vitamins"];

const initialProducts: AdminProduct[] = [
  {
    id: "prod-1",
    name: "Vision Guard Plus",
    nameBn: "ভিশন গার্ড প্লাস",
    category: "Eye Care",
    sku: "WHT-EYE-1001",
    price: 1450,
    compareAtPrice: 1650,
    stock: 64,
    lowStockThreshold: 15,
    description: "Lutein-rich blend crafted for daily eye strain support.",
    descriptionBn: "প্রতিদিনের চোখের সুরক্ষায় লুটেইন সমৃদ্ধ ফর্মুলা।",
    featured: true,
    status: "Active",
    imageTone: "bg-[linear-gradient(135deg,#edf6ff_0%,#d8e9fb_100%)]",
  },
  {
    id: "prod-2",
    name: "Retina Shield Omega",
    category: "Eye Care",
    sku: "WHT-EYE-1002",
    price: 1320,
    stock: 14,
    lowStockThreshold: 10,
    description: "Omega support formula to help maintain retinal performance.",
    featured: false,
    status: "Active",
    imageTone: "bg-[linear-gradient(135deg,#edf8f5_0%,#d8ede7_100%)]",
  },
  {
    id: "prod-3",
    name: "Neuro Balance Plus",
    category: "Brain Health",
    sku: "WHT-BRN-2001",
    price: 1780,
    compareAtPrice: 1990,
    stock: 39,
    lowStockThreshold: 12,
    description: "B-complex and herbal matrix designed for focus and clarity.",
    featured: true,
    status: "Active",
    imageTone: "bg-[linear-gradient(135deg,#f1f5ff_0%,#dee7fb_100%)]",
  },
  {
    id: "prod-4",
    name: "Mind Spark Junior",
    category: "Brain Health",
    sku: "WHT-BRN-2002",
    price: 1210,
    stock: 0,
    lowStockThreshold: 8,
    description: "Gentle cognition support for younger wellness routines.",
    featured: false,
    status: "Draft",
    imageTone: "bg-[linear-gradient(135deg,#fdf4e8_0%,#f8e2c2_100%)]",
  },
  {
    id: "prod-5",
    name: "Omega 3 Triple Strength",
    category: "Omega",
    sku: "WHT-OMG-3001",
    price: 1680,
    stock: 22,
    lowStockThreshold: 10,
    description: "Concentrated fish oil with EPA and DHA for heart-health support.",
    featured: true,
    status: "Active",
    imageTone: "bg-[linear-gradient(135deg,#eaf8ff_0%,#d5ebf8_100%)]",
  },
  {
    id: "prod-6",
    name: "Cardio Omega Softgel",
    category: "Omega",
    sku: "WHT-OMG-3002",
    price: 1490,
    compareAtPrice: 1690,
    stock: 9,
    lowStockThreshold: 10,
    description: "Daily omega support formulated for lipid balance.",
    featured: false,
    status: "Active",
    imageTone: "bg-[linear-gradient(135deg,#ecf6f2_0%,#d9ece5_100%)]",
  },
  {
    id: "prod-7",
    name: "Daily Multivitamin Core",
    category: "Vitamins",
    sku: "WHT-VIT-4001",
    price: 980,
    stock: 120,
    lowStockThreshold: 20,
    description: "Comprehensive daily vitamin and mineral baseline blend.",
    featured: false,
    status: "Active",
    imageTone: "bg-[linear-gradient(135deg,#f2f9ed_0%,#deefd2_100%)]",
  },
  {
    id: "prod-8",
    name: "Vitamin D3+K2 Gold",
    category: "Vitamins",
    sku: "WHT-VIT-4002",
    price: 1120,
    stock: 0,
    lowStockThreshold: 10,
    description: "Bone and immune support with active D3 and K2 pairing.",
    featured: true,
    status: "Active",
    imageTone: "bg-[linear-gradient(135deg,#fff5e6_0%,#fbe4c1_100%)]",
  },
];

const summaryCards = [
  { icon: Package, tone: "text-neutral-700", value: "48", label: "Total Products" },
  { icon: CheckCircle, tone: "text-brand-green-600", value: "42", label: "Active" },
  { icon: AlertTriangle, tone: "text-amber-500", value: "6", label: "Low Stock" },
  { icon: XCircle, tone: "text-red-600", value: "2", label: "Out of Stock" },
];

function getStockBucket(stock: number): Exclude<StockFilter, "All"> {
  if (stock === 0) return "Out of Stock";
  if (stock <= 20) return "Low Stock";
  return "In Stock";
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All Categories" | ProductCategory>("All Categories");
  const [stockFilter, setStockFilter] = useState<StockFilter>("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = category === "All Categories" ? true : product.category === category;
      const matchesStock = stockFilter === "All" ? true : getStockBucket(product.stock) === stockFilter;
      const matchesFeatured = featuredOnly ? product.featured : true;

      return matchesSearch && matchesCategory && matchesStock && matchesFeatured;
    });
  }, [category, featuredOnly, products, search, stockFilter]);

  const visibleProducts = filteredProducts.slice(0, pageSize);

  function handleToggleSelect(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function handleToggleSelectAll() {
    const visibleIds = visibleProducts.map((product) => product.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  }

  function handleOpenAddDrawer() {
    setDrawerMode("add");
    setEditingProduct(null);
    setDrawerOpen(true);
  }

  function handleOpenEditDrawer(product: AdminProduct) {
    setDrawerMode("edit");
    setEditingProduct(product);
    setDrawerOpen(true);
  }

  function handleSaveProduct(payload: AdminProduct) {
    setProducts((current) => {
      if (drawerMode === "edit") {
        return current.map((item) => (item.id === payload.id ? payload : item));
      }

      return [payload, ...current];
    });
  }

  function handleToggleFeatured(id: string) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, featured: !product.featured } : product
      )
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900">Products</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage your product catalog</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button className="h-10 rounded-lg" variant="outline">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button
            className="h-10 rounded-lg bg-brand-green-600 text-white hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
            onClick={handleOpenAddDrawer}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
            >
              <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100", card.tone)}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <p className="text-sm text-neutral-700">
                <span className="font-semibold text-neutral-900">{card.value}</span> {card.label}
              </p>
            </article>
          );
        })}
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <label className="relative min-w-[230px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products by name..."
            value={search}
          />
        </label>

        <select
          className="h-10 min-w-[170px] rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
          onChange={(event) => setCategory(event.target.value as "All Categories" | ProductCategory)}
          value={category}
        >
          <option value="All Categories">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          className="h-10 min-w-[160px] rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
          onChange={(event) => setStockFilter(event.target.value as StockFilter)}
          value={stockFilter}
        >
          <option value="All">All</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        <div className="ml-auto flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2">
          <span className="text-sm font-medium text-neutral-600">Featured Only</span>
          <button
            aria-checked={featuredOnly}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
              featuredOnly ? "bg-brand-green-600" : "bg-neutral-300"
            )}
            onClick={() => setFeaturedOnly((current) => !current)}
            role="switch"
            type="button"
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                featuredOnly ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
      </section>

      <AdminProductsTable
        onDelete={() => undefined}
        onEdit={handleOpenEditDrawer}
        onPageSizeChange={setPageSize}
        onToggleFeatured={handleToggleFeatured}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        pageSize={pageSize}
        products={visibleProducts}
        selectedIds={selectedIds.filter((id) => visibleProducts.some((product) => product.id === id))}
        totalProducts={48}
      />

      <ProductFormDrawer
        categories={categories}
        mode={drawerMode}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSaveProduct}
        open={drawerOpen}
        product={editingProduct}
      />
    </div>
  );
}