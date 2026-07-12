import type { Metadata } from "next";

import { ShopCatalog } from "@/components/public/shop-catalog";
import type { Category } from "@/components/public/product-filters";
import { getActiveProducts } from "@/lib/products/public-queries";

export const metadata: Metadata = {
  title: "Shop | Well Health Trade International",
  description:
    "Browse clinically trusted eye care, brain health, omega, and vitamin supplements from Well Health.",
};

type ShopPageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

const validCategories = new Set<Category>([
  "all",
  "eye-care",
  "brain-health",
  "omega",
  "vitamins",
]);

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const products = await getActiveProducts();
  const initialCategory =
    params.category && validCategories.has(params.category as Category)
      ? (params.category as Category)
      : "all";

  return (
    <ShopCatalog
      initialCategory={initialCategory}
      initialQuery={params.q?.trim() ?? ""}
      products={products}
    />
  );
}
