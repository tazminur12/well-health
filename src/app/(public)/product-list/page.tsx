import type { Metadata } from "next";

import { ProductListCatalog } from "@/components/public/product-list-catalog";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getActiveProducts,
  getShopCategories,
} from "@/lib/products/public-queries";
import { SEO_KEYWORDS } from "@/lib/seo/keywords";
import { getSeoAssets } from "@/lib/seo/page-assets";
import { buildShopPageStructuredData } from "@/lib/seo/structured-data";
import { buildPageMetadata } from "@/lib/seo/site";

type ProductListPageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const { ogImage } = await getSeoAssets();

  return buildPageMetadata({
    title: "Product List — Full Catalog Directory",
    description:
      "Browse the complete Well Health product list with dosage, strength, pack size and stock status. Filter and find medicines and supplements easily.",
    path: "/product-list",
    keywords: [...SEO_KEYWORDS.shop, "product list", "medicine list"],
    ogImage,
  });
}

export default async function ProductListPage({ searchParams }: ProductListPageProps) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getActiveProducts(),
    getShopCategories(),
  ]);

  const validSlugs = new Set(categories.map((item) => item.slug));
  const initialCategory =
    params.category && validSlugs.has(params.category) ? params.category : "all";

  const structuredData = buildShopPageStructuredData({ products });

  return (
    <>
      <JsonLd data={structuredData} />
      <ProductListCatalog
        categories={categories}
        initialCategory={initialCategory}
        initialQuery={params.q?.trim() ?? ""}
        products={products}
      />
    </>
  );
}
