"use server";

import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdminPermission } from "@/lib/admin/require-admin";
import {
  adjustStockSchema,
  getStockBucket,
  updateStockSchema,
  type InventoryItem,
} from "@/lib/inventory/schemas";
import { toUiStatus } from "@/lib/products/mapper";
import { prisma } from "@/lib/prisma";

export type InventoryActionResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function handleError<T = undefined>(error: unknown): InventoryActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  console.error("Inventory action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

function toItem(row: {
  id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  unit: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  updatedAt: Date;
  category: { name: string };
  images: Array<{ url: string }>;
}): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category.name,
    status: toUiStatus(row.status),
    stock: row.stock,
    lowStockThreshold: row.lowStockThreshold,
    unit: row.unit,
    imageUrl: row.images[0]?.url ?? null,
    bucket: getStockBucket(row.stock, row.lowStockThreshold),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const inventoryInclude = {
  category: true,
  images: {
    orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }],
    take: 1,
  },
};

function revalidateInventory(productId?: string) {
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  if (productId) {
    revalidatePath(`/admin/products/${productId}/edit`);
  }
}

export async function listInventoryAction(): Promise<
  InventoryActionResult<InventoryItem[]>
> {
  try {
    await requireAdminPermission("inventory");
    const rows = await prisma.product.findMany({
      include: inventoryInclude,
      orderBy: [{ stock: "asc" }, { name: "asc" }],
    });
    return { data: rows.map(toItem) };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateInventoryStockAction(
  input: unknown
): Promise<InventoryActionResult<InventoryItem>> {
  try {
    await requireAdminPermission("inventory");
    const parsed = updateStockSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid stock update" };
    }

    const row = await prisma.product.update({
      where: { id: parsed.data.productId },
      data: {
        stock: parsed.data.stock,
        ...(parsed.data.lowStockThreshold != null
          ? { lowStockThreshold: parsed.data.lowStockThreshold }
          : {}),
      },
      include: inventoryInclude,
    });

    revalidateInventory(row.id);
    return { data: toItem(row), success: "Stock updated" };
  } catch (error) {
    return handleError(error);
  }
}

export async function adjustInventoryStockAction(
  input: unknown
): Promise<InventoryActionResult<InventoryItem>> {
  try {
    await requireAdminPermission("inventory");
    const parsed = adjustStockSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid adjustment" };
    }

    const existing = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
    });
    if (!existing) return { error: "Product not found." };

    const nextStock = Math.max(0, existing.stock + parsed.data.delta);
    const row = await prisma.product.update({
      where: { id: existing.id },
      data: { stock: nextStock },
      include: inventoryInclude,
    });

    revalidateInventory(row.id);
    return {
      data: toItem(row),
      success: parsed.data.delta >= 0 ? "Stock increased" : "Stock decreased",
    };
  } catch (error) {
    return handleError(error);
  }
}
