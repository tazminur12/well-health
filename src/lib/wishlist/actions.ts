"use server";

import { ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { mapAdminToPublic } from "@/lib/products/public-mapper";
import { mapProductToAdmin } from "@/lib/products/mapper";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  wishlistProductIdSchema,
  wishlistSyncSchema,
  type WishlistProductIdInput,
  type WishlistSyncInput,
} from "@/lib/wishlist/schemas";

export type WishlistProductDto = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  imageTone: string;
  inStock: boolean;
  addedAt: number;
};

export type WishlistResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

async function requireUser() {
  const user = await getSessionUser();
  if (!user) return null;
  return user;
}

function revalidateWishlist() {
  revalidatePath("/wishlist");
  revalidatePath("/dashboard");
  revalidatePath("/shop");
}

function mapWishlistRow(row: {
  createdAt: Date;
  product: Parameters<typeof mapProductToAdmin>[0];
}): WishlistProductDto {
  const admin = mapProductToAdmin(row.product);
  const publicProduct = mapAdminToPublic(admin);
  return {
    id: publicProduct.id,
    slug: publicProduct.slug,
    name: publicProduct.name,
    category: publicProduct.category,
    price: publicProduct.price,
    imageUrl: publicProduct.imageUrl,
    imageTone: publicProduct.imageTone,
    inStock: publicProduct.inStock,
    addedAt: row.createdAt.getTime(),
  };
}

const productInclude = {
  category: true,
  images: { orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }] },
};

export async function getWishlistAction(): Promise<WishlistResult<WishlistProductDto[]>> {
  try {
    const user = await requireUser();
    if (!user) return { data: [] };

    const rows = await prisma.wishlistItem.findMany({
      where: {
        userId: user.id,
        product: { status: ProductStatus.ACTIVE },
      },
      include: { product: { include: productInclude } },
      orderBy: { createdAt: "desc" },
    });

    return { data: rows.map(mapWishlistRow) };
  } catch (error) {
    console.error("getWishlistAction:", error);
    return { error: "Could not load wishlist." };
  }
}

export async function getWishlistIdsAction(): Promise<WishlistResult<string[]>> {
  try {
    const user = await requireUser();
    if (!user) return { data: [] };

    const rows = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      select: { productId: true },
      orderBy: { createdAt: "desc" },
    });

    return { data: rows.map((row) => row.productId) };
  } catch (error) {
    console.error("getWishlistIdsAction:", error);
    return { error: "Could not load wishlist." };
  }
}

export async function toggleWishlistAction(
  input: WishlistProductIdInput
): Promise<WishlistResult<{ wishlisted: boolean; item?: WishlistProductDto }>> {
  try {
    const user = await requireUser();
    if (!user) {
      return { error: "Please sign in to save wishlist items across devices." };
    }

    const parsed = wishlistProductIdSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid product" };
    }

    const product = await prisma.product.findFirst({
      where: { id: parsed.data.productId, status: ProductStatus.ACTIVE },
      include: productInclude,
    });
    if (!product) return { error: "Product not found." };

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      revalidateWishlist();
      return { data: { wishlisted: false }, success: "Removed from wishlist." };
    }

    const created = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productId: product.id,
      },
      include: { product: { include: productInclude } },
    });

    revalidateWishlist();
    return {
      data: { wishlisted: true, item: mapWishlistRow(created) },
      success: "Saved to wishlist.",
    };
  } catch (error) {
    console.error("toggleWishlistAction:", error);
    return { error: "Could not update wishlist." };
  }
}

export async function removeWishlistItemAction(
  input: WishlistProductIdInput
): Promise<WishlistResult> {
  try {
    const user = await requireUser();
    if (!user) return { error: "Please sign in." };

    const parsed = wishlistProductIdSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid product" };
    }

    await prisma.wishlistItem.deleteMany({
      where: { userId: user.id, productId: parsed.data.productId },
    });

    revalidateWishlist();
    return { success: "Removed from wishlist." };
  } catch (error) {
    console.error("removeWishlistItemAction:", error);
    return { error: "Could not remove item." };
  }
}

/** Merge guest local wishlist product IDs into the signed-in account. */
export async function syncWishlistAction(
  input: WishlistSyncInput
): Promise<WishlistResult<WishlistProductDto[]>> {
  try {
    const user = await requireUser();
    if (!user) return { data: [] };

    const parsed = wishlistSyncSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid wishlist sync" };
    }

    const uniqueIds = [...new Set(parsed.data.productIds)];
    if (uniqueIds.length > 0) {
      const activeProducts = await prisma.product.findMany({
        where: { id: { in: uniqueIds }, status: ProductStatus.ACTIVE },
        select: { id: true },
      });

      await prisma.wishlistItem.createMany({
        data: activeProducts.map((product) => ({
          userId: user.id,
          productId: product.id,
        })),
        skipDuplicates: true,
      });
    }

    return getWishlistAction();
  } catch (error) {
    console.error("syncWishlistAction:", error);
    return { error: "Could not sync wishlist." };
  }
}
