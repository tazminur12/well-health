"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import type { AdminProduct } from "@/components/admin/products-data";
import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import {
  buildPrismaProductData,
  mapProductToAdmin,
  slugifyCategoryName,
  toPrismaStatus,
} from "@/lib/products/mapper";
import {
  productIdsSchema,
  productInputSchema,
  productStatusSchema,
  type ProductInput,
} from "@/lib/products/schemas";

export type ProductActionResult<T = undefined> = {
  error?: string;
  data?: T;
};

async function resolveCategoryId(categoryName: string) {
  const slug = slugifyCategoryName(categoryName);
  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name: categoryName }, { slug }],
    },
  });

  if (existing) return existing.id;

  const created = await prisma.category.create({
    data: {
      name: categoryName,
      slug,
      description: `${categoryName} supplements`,
    },
  });

  return created.id;
}

function handleActionError<T = undefined>(error: unknown): ProductActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target)
        ? (error.meta?.target as string[]).join(", ")
        : "field";
      return { error: `A product with this ${target} already exists.` };
    }
    if (error.code === "P2025") {
      return { error: "Product not found." };
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      error: "Database connection failed. Check DATABASE_URL and restart the server.",
    };
  }

  console.error("Product action failed:", error);
  const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
  if (message.includes("findMany") || message.includes("undefined")) {
    return {
      error: "Prisma client is out of date. Run `npx prisma generate` and restart `npm run dev`.",
    };
  }
  return { error: message };
}

export async function listProductsAction(): Promise<ProductActionResult<AdminProduct[]>> {
  try {
    await requireAdmin();
    const products = await prisma.product.findMany({
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
      orderBy: [{ updatedAt: "desc" }],
    });
    return { data: products.map(mapProductToAdmin) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getProductAction(
  id: string
): Promise<ProductActionResult<AdminProduct>> {
  try {
    await requireAdmin();
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    });
    if (!product) return { error: "Product not found." };
    return { data: mapProductToAdmin(product) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createProductAction(
  input: ProductInput
): Promise<ProductActionResult<AdminProduct>> {
  try {
    await requireAdmin();
    const parsed = productInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid product details" };
    }

    const categoryId = await resolveCategoryId(parsed.data.category);
    const product = await prisma.product.create({
      data: buildPrismaProductData(parsed.data, categoryId),
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    });

    revalidatePath("/admin/products");
    return { data: mapProductToAdmin(product) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateProductAction(
  id: string,
  input: ProductInput
): Promise<ProductActionResult<AdminProduct>> {
  try {
    await requireAdmin();
    const parsed = productInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid product details" };
    }

    const categoryId = await resolveCategoryId(parsed.data.category);
    const product = await prisma.product.update({
      where: { id },
      data: buildPrismaProductData(parsed.data, categoryId),
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);
    return { data: mapProductToAdmin(product) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteProductAction(id: string): Promise<ProductActionResult> {
  try {
    await requireAdmin();
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    return {};
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteProductsAction(ids: string[]): Promise<ProductActionResult> {
  try {
    await requireAdmin();
    const parsed = productIdsSchema.safeParse({ ids });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid selection" };
    }

    await prisma.product.deleteMany({
      where: { id: { in: parsed.data.ids } },
    });
    revalidatePath("/admin/products");
    return {};
  } catch (error) {
    return handleActionError(error);
  }
}

export async function toggleProductFeaturedAction(
  id: string
): Promise<ProductActionResult<AdminProduct>> {
  try {
    await requireAdmin();
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return { error: "Product not found." };

    const product = await prisma.product.update({
      where: { id },
      data: { featured: !existing.featured },
      include: { category: true },
    });

    revalidatePath("/admin/products");
    return { data: mapProductToAdmin(product) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function setProductStatusAction(
  id: string,
  status: "Active" | "Draft" | "Archived"
): Promise<ProductActionResult<AdminProduct>> {
  try {
    await requireAdmin();
    const parsedStatus = productStatusSchema.safeParse(status);
    if (!parsedStatus.success) return { error: "Invalid status" };

    const product = await prisma.product.update({
      where: { id },
      data: { status: toPrismaStatus(parsedStatus.data) },
      include: { category: true },
    });

    revalidatePath("/admin/products");
    return { data: mapProductToAdmin(product) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function archiveProductsAction(ids: string[]): Promise<ProductActionResult> {
  try {
    await requireAdmin();
    const parsed = productIdsSchema.safeParse({ ids });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid selection" };
    }

    await prisma.product.updateMany({
      where: { id: { in: parsed.data.ids } },
      data: { status: "ARCHIVED" },
    });

    revalidatePath("/admin/products");
    return {};
  } catch (error) {
    return handleActionError(error);
  }
}
