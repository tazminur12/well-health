"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  AdminAuthError,
  requireAdmin,
  requireAdminPermission,
} from "@/lib/admin/require-admin";
import { adminHasPermission } from "@/lib/admin/permissions";
import { prisma } from "@/lib/prisma";
import {
  unitInputSchema,
  type AdminUnit,
  type UnitInput,
} from "@/lib/units/schemas";

export type UnitActionResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function handleError<T = undefined>(error: unknown): UnitActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return { error: "A unit with this name or slug already exists." };
    }
    if (error.code === "P2025") {
      return { error: "Unit not found." };
    }
  }

  console.error("Unit action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

async function productCountForUnitName(name: string) {
  return prisma.product.count({ where: { unit: name } });
}

function toDto(
  row: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  },
  productCount: number
): AdminUnit {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    productCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function revalidateUnits() {
  revalidatePath("/admin/units");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
  revalidatePath("/", "layout");
}

export async function listUnitsAction(): Promise<UnitActionResult<AdminUnit[]>> {
  try {
    await requireAdminPermission("units");
    const rows = await prisma.unit.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    const counts = await Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        count: await productCountForUnitName(row.name),
      }))
    );
    const countMap = Object.fromEntries(counts.map((item) => [item.id, item.count]));

    return {
      data: rows.map((row) => toDto(row, countMap[row.id] ?? 0)),
    };
  } catch (error) {
    return handleError(error);
  }
}

/** Active units for product forms — available to products or units permission. */
export async function listActiveUnitsAction(): Promise<UnitActionResult<AdminUnit[]>> {
  try {
    const admin = await requireAdmin();
    if (!adminHasPermission(admin, "products") && !adminHasPermission(admin, "units")) {
      throw new AdminAuthError("You do not have permission to perform this action.");
    }

    const rows = await prisma.unit.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return {
      data: rows.map((row) => toDto(row, 0)),
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function createUnitAction(
  input: UnitInput
): Promise<UnitActionResult<AdminUnit>> {
  try {
    await requireAdminPermission("units");
    const parsed = unitInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid unit" };
    }

    const row = await prisma.unit.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description?.trim() || null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
      },
    });

    revalidateUnits();
    return { data: toDto(row, 0), success: "Unit created" };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateUnitAction(
  id: string,
  input: UnitInput
): Promise<UnitActionResult<AdminUnit>> {
  try {
    await requireAdminPermission("units");
    const parsed = unitInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid unit" };
    }

    const existing = await prisma.unit.findUnique({ where: { id } });
    if (!existing) return { error: "Unit not found." };

    const row = await prisma.$transaction(async (tx) => {
      const updated = await tx.unit.update({
        where: { id },
        data: {
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description?.trim() || null,
          sortOrder: parsed.data.sortOrder,
          isActive: parsed.data.isActive,
        },
      });

      // Keep product.unit string in sync when the catalog name changes
      if (existing.name !== parsed.data.name) {
        await tx.product.updateMany({
          where: { unit: existing.name },
          data: { unit: parsed.data.name },
        });
      }

      return updated;
    });

    const productCount = await productCountForUnitName(row.name);
    revalidateUnits();
    return { data: toDto(row, productCount), success: "Unit updated" };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteUnitAction(id: string): Promise<UnitActionResult> {
  try {
    await requireAdminPermission("units");
    const existing = await prisma.unit.findUnique({ where: { id } });
    if (!existing) return { error: "Unit not found." };

    const productCount = await productCountForUnitName(existing.name);
    if (productCount > 0) {
      return {
        error: `This unit is used by ${productCount} product(s). Reassign them first.`,
      };
    }

    await prisma.unit.delete({ where: { id } });
    revalidateUnits();
    return { success: "Unit deleted" };
  } catch (error) {
    return handleError(error);
  }
}

export async function toggleUnitActiveAction(
  id: string
): Promise<UnitActionResult<AdminUnit>> {
  try {
    await requireAdminPermission("units");
    const existing = await prisma.unit.findUnique({ where: { id } });
    if (!existing) return { error: "Unit not found." };

    const row = await prisma.unit.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    const productCount = await productCountForUnitName(row.name);
    revalidateUnits();
    return {
      data: toDto(row, productCount),
      success: row.isActive ? "Unit activated" : "Unit deactivated",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function reorderUnitAction(
  id: string,
  direction: "up" | "down"
): Promise<UnitActionResult> {
  try {
    await requireAdminPermission("units");
    const units = await prisma.unit.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    const index = units.findIndex((item) => item.id === id);
    if (index < 0) return { error: "Unit not found." };

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= units.length) {
      return { success: "Already at edge" };
    }

    const current = units[index]!;
    const neighbor = units[swapIndex]!;

    await prisma.$transaction([
      prisma.unit.update({
        where: { id: current.id },
        data: { sortOrder: neighbor.sortOrder },
      }),
      prisma.unit.update({
        where: { id: neighbor.id },
        data: { sortOrder: current.sortOrder },
      }),
    ]);

    if (current.sortOrder === neighbor.sortOrder) {
      await prisma.$transaction(
        units.map((item, i) =>
          prisma.unit.update({
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

    revalidateUnits();
    return { success: "Order updated" };
  } catch (error) {
    return handleError(error);
  }
}
