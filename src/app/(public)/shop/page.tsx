import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { ShopCatalog } from "@/components/public/shop-catalog";
import type { Category } from "@/components/public/product-filters";
import { getActiveProducts } from "@/lib/products/public-queries";
import { SEO_KEYWORDS } from "@/lib/seo/keywords";
import { getSeoAssets } from "@/lib/seo/page-assets";
import { buildShopPageStructuredData } from "@/lib/seo/structured-data";
import { buildPageMetadata } from "@/lib/seo/site";

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

export async function generateMetadata(): Promise<Metadata> {
  const { ogImage } = await getSeoAssets();

  return buildPageMetadata({
    title: "Shop Health Supplements — Vitamins, Omega & Eye Care",
    description:
      "Browse clinically trusted eye care, brain health, omega-3, and vitamin supplements from Well Health Trade International. Order online with delivery across Bangladesh.",
    path: "/shop",
    keywords: [...SEO_KEYWORDS.shop],
    ogImage,
  });
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const products = await getActiveProducts();
  const initialCategory =
    params.category && validCategories.has(params.category as Category)
      ? (params.category as Category)
      : "all";

  const structuredData = buildShopPageStructuredData({ products });

  return (
    <>
      <JsonLd data={structuredData} />
      <ShopCatalog
        initialCategory={initialCategory}
        initialQuery={params.q?.trim() ?? ""}
        products={products}
      />
    </>
  );
}
