import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { CTABanner } from "@/components/public/cta-banner";
import { ImageGallery } from "@/components/public/image-gallery";
import { ProductInfoPanel } from "@/components/public/product-info-panel";
import { ProductTabs } from "@/components/public/product-tabs";
import { RelatedProducts } from "@/components/public/related-products";
import {
  getActiveProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products/public-queries";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const rows = await getActiveProductSlugs();
    return rows.map((row) => ({ slug: row.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Product not found | Well Health" };
  }
  return {
    title: product.metaTitle || `${product.name} | Well Health`,
    description: product.metaDescription || product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.category, 4);

  const specs = [
    { label: "Brand", value: product.brand },
    { label: "Category", value: product.category },
    { label: "Unit", value: product.unit },
    product.packSize ? { label: "Pack size", value: product.packSize } : null,
    product.servingSize ? { label: "Serving size", value: product.servingSize } : null,
    { label: "Availability", value: product.stockBucket },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const badgeLabel = product.offerActive
    ? product.offerBadge ?? "Sale"
    : product.featured
      ? "Featured"
      : product.labTested
        ? "Lab Tested"
        : undefined;

  return (
    <div className="bg-white text-neutral-900">
      <section className="border-b border-neutral-100 bg-[#F7F8F9]/70 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <Link className="transition-colors duration-200 hover:text-brand-green-600" href="/">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link className="transition-colors duration-200 hover:text-brand-green-600" href="/shop">
              Shop
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              className="transition-colors duration-200 hover:text-brand-green-600"
              href={`/shop?category=${product.categorySlug}`}
            >
              {product.category}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-brand-green-600">{product.name}</span>
          </nav>
        </div>
      </section>

      <section className="py-10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <ImageGallery
              badgeLabel={badgeLabel}
              imageTone={product.imageTone}
              images={product.imageUrls}
              productName={product.name}
            />
            <ProductInfoPanel product={product} />
          </div>
        </div>
      </section>

      <section className="pb-12 sm:pb-14 lg:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductTabs
            description={product.description}
            ingredients={product.ingredients}
            specs={specs}
            usageInstructions={product.usageInstructions}
            warnings={product.warnings}
          />
        </div>
      </section>

      <RelatedProducts products={related} />
      <CTABanner />
    </div>
  );
}
