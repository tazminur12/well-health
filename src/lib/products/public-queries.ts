import type { Category, Product, ProductImage } from "@prisma/client";
import { ProductStatus } from "@prisma/client";
import { cache } from "react";

import { mapProductToAdmin } from "@/lib/products/mapper";
import { mapAdminToPublic, toPublicProductCard } from "@/lib/products/public-mapper";
import type { PublicProduct, PublicProductCard } from "@/lib/products/public-types";
import { prisma } from "@/lib/prisma";

type ProductRow = Product & {
  category: Category;
  images: ProductImage[];
};

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: "asc" as const } },
};

function mapRows(rows: ProductRow[]): PublicProduct[] {
  return rows.map((row) => mapAdminToPublic(mapProductToAdmin(row)));
}

/** Active catalog products for the public storefront. */
export const getActiveProducts = cache(async (): Promise<PublicProduct[]> => {
  const rows = await prisma.product.findMany({
    where: { status: ProductStatus.ACTIVE },
    include: productInclude,
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  });
  return mapRows(rows as ProductRow[]);
});

export const getFeaturedProducts = cache(async (limit = 4): Promise<PublicProductCard[]> => {
  const rows = (await prisma.product.findMany({
    where: { status: ProductStatus.ACTIVE, featured: true },
    include: productInclude,
    orderBy: [{ updatedAt: "desc" }],
    take: limit,
  })) as ProductRow[];

  if (rows.length < limit) {
    const extra = (await prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        id: { notIn: rows.map((row) => row.id) },
      },
      include: productInclude,
      orderBy: [{ updatedAt: "desc" }],
      take: limit - rows.length,
    })) as ProductRow[];
    rows.push(...extra);
  }

  return mapRows(rows).map(toPublicProductCard);
});

export const getProductBySlug = cache(async (slug: string): Promise<PublicProduct | null> => {
  const row = (await prisma.product.findFirst({
    where: { slug, status: ProductStatus.ACTIVE },
    include: productInclude,
  })) as ProductRow | null;
  if (!row) return null;
  return mapAdminToPublic(mapProductToAdmin(row));
});

export const getRelatedProducts = cache(
  async (productId: string, categoryName: string, limit = 4): Promise<PublicProductCard[]> => {
    const rows = (await prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        id: { not: productId },
        category: { name: categoryName },
      },
      include: productInclude,
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      take: limit,
    })) as ProductRow[];

    if (rows.length < limit) {
      const extra = (await prisma.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          id: { notIn: [productId, ...rows.map((row) => row.id)] },
        },
        include: productInclude,
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
        take: limit - rows.length,
      })) as ProductRow[];
      rows.push(...extra);
    }

    return mapRows(rows).map(toPublicProductCard);
  }
);

export async function getActiveProductSlugs() {
  const rows = await prisma.product.findMany({
    where: { status: ProductStatus.ACTIVE },
    select: { slug: true, updatedAt: true },
  });
  return rows;
}
