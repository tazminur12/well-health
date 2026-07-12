import type { AdminProduct } from "@/components/admin/products-data";
import {
  getProductDiscountPercent,
  getProductStockBucket,
  isProductOfferActive,
} from "@/components/admin/products-data";
import { formatPrice } from "@/lib/format-price";
import { slugifyCategoryName } from "@/lib/products/mapper";
import type { PublicProduct, PublicProductCard } from "@/lib/products/public-types";

export function mapAdminToPublic(product: AdminProduct): PublicProduct {
  const offerActive = isProductOfferActive(product);
  const listPrice = product.price;
  const price =
    offerActive && product.offerPrice && product.offerPrice < product.price
      ? product.offerPrice
      : product.price;

  const discountPercent = offerActive
    ? getProductDiscountPercent({
        ...product,
        price: listPrice,
        offerPrice: product.offerPrice,
      })
    : product.compareAtPrice && product.compareAtPrice > price
      ? Math.round(((product.compareAtPrice - price) / product.compareAtPrice) * 100)
      : 0;

  const stockBucket = getProductStockBucket(product.stock, product.lowStockThreshold);
  const imageUrls = product.imageUrls?.length
    ? product.imageUrls
    : product.images?.map((image) => image.url) ?? [];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    nameBn: product.nameBn,
    category: product.category,
    categorySlug: slugifyCategoryName(product.category),
    brand: product.brand,
    shortDescription: product.shortDescription,
    description: product.description,
    ingredients: product.ingredients,
    usageInstructions: product.usageInstructions,
    warnings: product.warnings,
    packSize: product.packSize,
    servingSize: product.servingSize,
    unit: product.unit,
    tags: product.tags,
    listPrice,
    compareAtPrice: product.compareAtPrice,
    price,
    offerActive,
    offerLabel: offerActive ? product.offerLabel : undefined,
    offerBadge: offerActive ? product.offerBadge : undefined,
    discountPercent,
    saveLabel: discountPercent > 0 ? `Save ${discountPercent}%` : undefined,
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    stockBucket,
    inStock: product.stock > 0,
    featured: product.featured,
    labTested: product.labTested,
    doctorRecommended: product.doctorRecommended,
    imageTone: product.imageTone,
    imageUrl: imageUrls[0],
    imageUrls,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function toPublicProductCard(product: PublicProduct): PublicProductCard {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    shortDescription: product.shortDescription,
    price: product.price,
    listPrice: product.listPrice,
    compareAtPrice: product.compareAtPrice,
    offerActive: product.offerActive,
    offerBadge: product.offerBadge,
    discountPercent: product.discountPercent,
    saveLabel: product.saveLabel,
    inStock: product.inStock,
    stockBucket: product.stockBucket,
    imageUrl: product.imageUrl,
    imageTone: product.imageTone,
    labTested: product.labTested,
    featured: product.featured,
  };
}

export function formatPublicPrice(value: number) {
  return formatPrice(value);
}

export function getDisplayCompareAt(product: Pick<PublicProduct, "listPrice" | "compareAtPrice" | "price" | "offerActive">) {
  if (product.offerActive && product.listPrice > product.price) return product.listPrice;
  if (product.compareAtPrice && product.compareAtPrice > product.price) return product.compareAtPrice;
  return undefined;
}
