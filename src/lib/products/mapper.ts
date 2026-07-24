import type {
  Category,
  OfferBadge as PrismaOfferBadge,
  Product,
  ProductStatus as PrismaProductStatus,
} from "@prisma/client";
import { OfferBadge, ProductStatus } from "@prisma/client";

import type {
  AdminProduct,
  OfferBadge as UiOfferBadge,
  ProductStatus as UiProductStatus,
} from "@/components/admin/products-data";
import type { ProductInput } from "@/lib/products/schemas";

type ProductWithCategory = Product & {
  category: Category;
  images?: Array<{ id: string; url: string; isPrimary: boolean; sortOrder: number }>;
};

function decimalToNumber(value: { toNumber?: () => number } | number | null | undefined) {
  if (value == null) return undefined;
  if (typeof value === "number") return value;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value);
}

export function toUiStatus(status: PrismaProductStatus): UiProductStatus {
  if (status === ProductStatus.ACTIVE) return "Active";
  if (status === ProductStatus.ARCHIVED) return "Archived";
  return "Draft";
}

export function toPrismaStatus(status: UiProductStatus): PrismaProductStatus {
  if (status === "Active") return ProductStatus.ACTIVE;
  if (status === "Archived") return ProductStatus.ARCHIVED;
  return ProductStatus.DRAFT;
}

export function toUiOfferBadge(badge: PrismaOfferBadge | null | undefined): UiOfferBadge | undefined {
  if (!badge) return undefined;
  const map: Record<PrismaOfferBadge, UiOfferBadge> = {
    SALE: "Sale",
    FLASH: "Flash",
    BUNDLE: "Bundle",
    CLEARANCE: "Clearance",
  };
  return map[badge];
}

export function toPrismaOfferBadge(badge: UiOfferBadge | undefined): PrismaOfferBadge | null {
  if (!badge) return null;
  const map: Record<UiOfferBadge, PrismaOfferBadge> = {
    Sale: OfferBadge.SALE,
    Flash: OfferBadge.FLASH,
    Bundle: OfferBadge.BUNDLE,
    Clearance: OfferBadge.CLEARANCE,
  };
  return map[badge];
}

export function mapProductToAdmin(product: ProductWithCategory): AdminProduct {
  return {
    id: product.id,
    name: product.name,
    nameBn: product.nameBn ?? undefined,
    slug: product.slug,
    category: product.category.name as AdminProduct["category"],
    brand: product.brand,
    sku: product.sku,
    barcode: product.barcode ?? undefined,
    price: decimalToNumber(product.price) ?? 0,
    compareAtPrice: decimalToNumber(product.compareAtPrice),
    costPrice: decimalToNumber(product.costPrice),
    offerEnabled: product.offerEnabled,
    offerLabel: product.offerLabel ?? undefined,
    discountPercent: decimalToNumber(product.discountPercent),
    offerPrice: decimalToNumber(product.offerPrice),
    offerStartsAt: product.offerStartsAt?.toISOString(),
    offerEndsAt: product.offerEndsAt?.toISOString(),
    offerBadge: toUiOfferBadge(product.offerBadge),
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    unit: product.unit,
    dosageForm: product.dosageForm ?? undefined,
    strength: product.strength ?? undefined,
    strengthUnit: product.strengthUnit ?? undefined,
    packSize: product.packSize ?? undefined,
    quantityPerPack: product.quantityPerPack ?? undefined,
    routeOfAdmin: product.routeOfAdmin ?? undefined,
    servingSize: product.servingSize ?? undefined,
    genericName: product.genericName ?? undefined,
    prescriptionRequired: product.prescriptionRequired,
    shortDescription: product.shortDescription,
    description: product.description,
    descriptionBn: product.descriptionBn ?? undefined,
    ingredients: product.ingredients ?? undefined,
    usageInstructions: product.usageInstructions ?? undefined,
    warnings: product.warnings ?? undefined,
    tags: product.tags,
    metaTitle: product.metaTitle ?? undefined,
    metaDescription: product.metaDescription ?? undefined,
    featured: product.featured,
    labTested: product.labTested,
    doctorRecommended: product.doctorRecommended,
    status: toUiStatus(product.status),
    imageTone: product.imageTone ?? "bg-[linear-gradient(135deg,#eff7f3_0%,#dceee5_100%)]",
    imageCount: product.images?.length ?? product.imageCount,
    imageUrls: product.images?.map((image) => image.url) ?? [],
    images: product.images
      ?.slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => ({
        id: image.id,
        url: image.url,
        isPrimary: image.isPrimary,
      })),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function slugifyCategoryName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function buildPrismaProductData(input: ProductInput, categoryId: string) {
  const offerStartsAt =
    input.offerEnabled && input.offerStartsAt
      ? new Date(input.offerStartsAt)
      : null;
  const offerEndsAt =
    input.offerEnabled && input.offerEndsAt ? new Date(input.offerEndsAt) : null;

  return {
    name: input.name,
    nameBn: input.nameBn || null,
    slug: input.slug,
    categoryId,
    brand: input.brand,
    sku: input.sku.toUpperCase(),
    barcode: input.barcode || null,
    price: input.price,
    compareAtPrice: input.compareAtPrice ?? null,
    costPrice: input.costPrice ?? null,
    offerEnabled: input.offerEnabled,
    offerLabel: input.offerEnabled ? input.offerLabel || null : null,
    discountPercent: input.offerEnabled ? input.discountPercent ?? null : null,
    offerPrice: input.offerEnabled ? input.offerPrice ?? null : null,
    offerStartsAt,
    offerEndsAt,
    offerBadge: input.offerEnabled ? toPrismaOfferBadge(input.offerBadge) : null,
    stock: input.stock,
    lowStockThreshold: input.lowStockThreshold,
    unit: input.unit,
    dosageForm: input.dosageForm?.trim() || null,
    strength: input.strength?.trim() || null,
    strengthUnit: input.strengthUnit?.trim() || null,
    packSize: input.packSize?.trim() || null,
    quantityPerPack: input.quantityPerPack ?? null,
    routeOfAdmin: input.routeOfAdmin?.trim() || null,
    servingSize: input.servingSize?.trim() || null,
    genericName: input.genericName?.trim() || null,
    prescriptionRequired: input.prescriptionRequired ?? false,
    shortDescription: input.shortDescription,
    description: input.description,
    descriptionBn: input.descriptionBn || null,
    ingredients: input.ingredients || null,
    usageInstructions: input.usageInstructions || null,
    warnings: input.warnings || null,
    tags: input.tags,
    metaTitle: input.metaTitle || input.name,
    metaDescription: input.metaDescription || input.shortDescription,
    featured: input.featured,
    labTested: input.labTested,
    doctorRecommended: input.doctorRecommended,
    status: toPrismaStatus(input.status),
    imageTone: input.imageTone || null,
    imageCount: input.imageCount,
  };
}
