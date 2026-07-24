import type { OfferBadge, ProductCategory } from "@/components/admin/products-data";

export type PublicStockBucket = "In Stock" | "Low Stock" | "Out of Stock";

export type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  nameBn?: string;
  category: ProductCategory;
  categorySlug: string;
  brand: string;
  shortDescription: string;
  description: string;
  ingredients?: string;
  usageInstructions?: string;
  warnings?: string;
  packSize?: string;
  servingSize?: string;
  unit: string;
  dosageForm?: string;
  strength?: string;
  strengthUnit?: string;
  quantityPerPack?: number;
  routeOfAdmin?: string;
  genericName?: string;
  prescriptionRequired?: boolean;
  tags: string[];
  /** Regular / list price before active offer. */
  listPrice: number;
  compareAtPrice?: number;
  /** Price customer pays right now. */
  price: number;
  offerActive: boolean;
  offerLabel?: string;
  offerBadge?: OfferBadge;
  discountPercent: number;
  saveLabel?: string;
  stock: number;
  lowStockThreshold: number;
  stockBucket: PublicStockBucket;
  inStock: boolean;
  featured: boolean;
  labTested: boolean;
  doctorRecommended: boolean;
  imageTone: string;
  imageUrl?: string;
  imageUrls: string[];
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicProductCard = Pick<
  PublicProduct,
  | "id"
  | "slug"
  | "name"
  | "category"
  | "shortDescription"
  | "price"
  | "listPrice"
  | "compareAtPrice"
  | "offerActive"
  | "offerBadge"
  | "discountPercent"
  | "saveLabel"
  | "inStock"
  | "stockBucket"
  | "imageUrl"
  | "imageTone"
  | "labTested"
  | "featured"
  | "dosageForm"
  | "strength"
  | "strengthUnit"
  | "packSize"
  | "unit"
>;

export type PublicShopCategory = {
  name: string;
  slug: string;
  productCount: number;
};
