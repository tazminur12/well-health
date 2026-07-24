import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { CTABanner } from "@/components/public/cta-banner";
import { ImageGallery } from "@/components/public/image-gallery";
import { ProductInfoPanel } from "@/components/public/product-info-panel";
import { ProductTabs } from "@/components/public/product-tabs";
import { RelatedProducts } from "@/components/public/related-products";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getActiveProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products/public-queries";
import { formatProductStrength } from "@/components/admin/products-data";
import { getSeoAssets } from "@/lib/seo/page-assets";
import { buildProductPageStructuredData } from "@/lib/seo/structured-data";
import { buildPageMetadata } from "@/lib/seo/site";

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
  const [product, { ogImage }] = await Promise.all([getProductBySlug(slug), getSeoAssets()]);
  if (!product) {
    return { title: { absolute: "Product not found | Well Health" } };
  }

  const title = product.metaTitle || product.name;
  const description =
    product.metaDescription ||
    `${product.shortDescription} Buy ${product.name} online from Well Health Trade International with delivery across Bangladesh.`;

  return buildPageMetadata({
    title,
    description,
    path: `/shop/${product.slug}`,
    keywords: [
      product.name,
      product.category,
      product.brand,
      "buy supplements Bangladesh",
      "Well Health",
    ],
    ogImage: product.imageUrl || ogImage,
  });
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.category, 4);
  const structuredData = buildProductPageStructuredData(product);

  const strengthLabel = formatProductStrength(product.strength, product.strengthUnit);

  const specs = [
    { label: "Brand (ব্র্যান্ড)", value: product.brand },
    { label: "Category (ক্যাটাগরি)", value: product.category },
    product.genericName
      ? { label: "Generic name (জেনেরিক নাম)", value: product.genericName }
      : null,
    product.dosageForm
      ? { label: "Dosage form (ডোজ ফর্ম)", value: product.dosageForm }
      : null,
    strengthLabel ? { label: "Strength (শক্তি / মাত্রা)", value: strengthLabel } : null,
    { label: "Packaging unit (প্যাকেজিং ইউনিট)", value: product.unit },
    product.packSize ? { label: "Pack size (প্যাক সাইজ)", value: product.packSize } : null,
    product.quantityPerPack
      ? {
          label: "Quantity per pack (প্রতি প্যাকে পরিমাণ)",
          value: String(product.quantityPerPack),
        }
      : null,
    product.routeOfAdmin
      ? {
          label: "Route of administration (প্রয়োগের পথ)",
          value: product.routeOfAdmin,
        }
      : null,
    product.servingSize
      ? { label: "Serving / dose (সেবনবিধি)", value: product.servingSize }
      : null,
    product.prescriptionRequired
      ? { label: "Prescription (প্রেসক্রিপশন)", value: "Required (প্রয়োজন)" }
      : null,
    { label: "Availability (প্রাপ্যতা)", value: product.stockBucket },
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
      <JsonLd data={structuredData} />
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
