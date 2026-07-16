"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdminPermission } from "@/lib/admin/require-admin";
import {
  categoryInputSchema,
  type AdminCategory,
  type CategoryInput,
} from "@/lib/categories/schemas";
import { prisma } from "@/lib/prisma";

export type CategoryActionResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function handleError<T = undefined>(error: unknown): CategoryActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return { error: "A category with this name or slug already exists." };
    }
    if (error.code === "P2025") {
      return { error: "Category not found." };
    }
    if (error.code === "P2003") {
      return { error: "Cannot delete a category that still has products." };
    }
  }

  console.error("Category action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

function toDto(row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: { products: number };
}): AdminCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    productCount: row._count?.products ?? 0,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function revalidateCategories() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/", "layout");
}

export async function listCategoriesAction(): Promise<CategoryActionResult<AdminCategory[]>> {
  try {
    await requireAdminPermission("categories");
    const rows = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return { data: rows.map(toDto) };
  } catch (error) {
    return handleError(error);
  }
}

export async function createCategoryAction(
  input: CategoryInput
): Promise<CategoryActionResult<AdminCategory>> {
  try {
    await requireAdminPermission("categories");
    const parsed = categoryInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid category" };
    }

    const row = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description?.trim() || null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
      },
      include: { _count: { select: { products: true } } },
    });

    revalidateCategories();
    return { data: toDto(row), success: "Category created" };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateCategoryAction(
  id: string,
  input: CategoryInput
): Promise<CategoryActionResult<AdminCategory>> {
  try {
    await requireAdminPermission("categories");
    const parsed = categoryInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid category" };
    }

    const row = await prisma.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description?.trim() || null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
      },
      include: { _count: { select: { products: true } } },
    });

    revalidateCategories();
    return { data: toDto(row), success: "Category updated" };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteCategoryAction(id: string): Promise<CategoryActionResult> {
  try {
    await requireAdminPermission("categories");
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) return { error: "Category not found." };
    if (existing._count.products > 0) {
      return {
        error: `This category has ${existing._count.products} product(s). Move or delete them first.`,
      };
    }

    await prisma.category.delete({ where: { id } });
    revalidateCategories();
    return { success: "Category deleted" };
  } catch (error) {
    return handleError(error);
  }
}

export async function toggleCategoryActiveAction(
  id: string
): Promise<CategoryActionResult<AdminCategory>> {
  try {
    await requireAdminPermission("categories");
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return { error: "Category not found." };

    const row = await prisma.category.update({
      where: { id },
      data: { isActive: !existing.isActive },
      include: { _count: { select: { products: true } } },
    });

    revalidateCategories();
    return {
      data: toDto(row),
      success: row.isActive ? "Category activated" : "Category deactivated",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function reorderCategoryAction(
  id: string,
  direction: "up" | "down"
): Promise<CategoryActionResult> {
  try {
    await requireAdminPermission("categories");
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    const index = categories.findIndex((item) => item.id === id);
    if (index < 0) return { error: "Category not found." };

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= categories.length) {
      return { success: "Already at edge" };
    }

    const current = categories[index]!;
    const neighbor = categories[swapIndex]!;

    await prisma.$transaction([
      prisma.category.update({
        where: { id: current.id },
        data: { sortOrder: neighbor.sortOrder },
      }),
      prisma.category.update({
        where: { id: neighbor.id },
        data: { sortOrder: current.sortOrder },
      }),
    ]);

    // If both share the same sortOrder, force sequential orders
    if (current.sortOrder === neighbor.sortOrder) {
      await prisma.$transaction(
        categories.map((item, i) =>
          prisma.category.update({
            where: { id: item.id },
            data: {
              sortOrder:
                item.id === current.id
                  ? swapIndex
                  : item.id === neighbor.id
                    ? index
                    : i,
            },
          })
        )
      );
    }

    revalidateCategories();
    return { success: "Order updated" };
  } catch (error) {
    return handleError(error);
  }
}
