"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdminPermission } from "@/lib/admin/require-admin";
import {
  shippingCourierInputSchema,
  shippingZoneInputSchema,
  type AdminShippingCourier,
  type AdminShippingZone,
  type ShippingCourierInput,
  type ShippingZoneInput,
} from "@/lib/shipping/schemas";
import { prisma } from "@/lib/prisma";

export type ShippingActionResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function handleError<T = undefined>(error: unknown): ShippingActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return { error: "A record with this slug already exists." };
    }
    if (error.code === "P2025") return { error: "Record not found." };
  }
  console.error("Shipping action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

function decimalToNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value == null) return null;
  if (typeof value === "number") return value;
  return Number(value);
}

function toZoneDto(row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  areas: string;
  baseFee: Prisma.Decimal;
  freeShippingMin: Prisma.Decimal | null;
  etaMinDays: number;
  etaMaxDays: number;
  codAvailable: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): AdminShippingZone {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    areas: row.areas,
    baseFee: Number(row.baseFee),
    freeShippingMin: decimalToNumber(row.freeShippingMin),
    etaMinDays: row.etaMinDays,
    etaMaxDays: row.etaMaxDays,
    codAvailable: row.codAvailable,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toCourierDto(row: {
  id: string;
  name: string;
  slug: string;
  contactPhone: string | null;
  trackingUrl: string | null;
  notes: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): AdminShippingCourier {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    contactPhone: row.contactPhone,
    trackingUrl: row.trackingUrl,
    notes: row.notes,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function revalidateShipping() {
  revalidatePath("/admin/shipping");
  revalidatePath("/admin/settings");
}

export async function listShippingZonesAction(): Promise<
  ShippingActionResult<AdminShippingZone[]>
> {
  try {
    await requireAdminPermission("shipping");
    const rows = await prisma.shippingZone.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return { data: rows.map(toZoneDto) };
  } catch (error) {
    return handleError(error);
  }
}

export async function createShippingZoneAction(
  input: ShippingZoneInput
): Promise<ShippingActionResult<AdminShippingZone>> {
  try {
    await requireAdminPermission("shipping");
    const parsed = shippingZoneInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid zone" };
    }

    const row = await prisma.shippingZone.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description?.trim() || null,
        areas: parsed.data.areas?.trim() || "",
        baseFee: parsed.data.baseFee,
        freeShippingMin: parsed.data.freeShippingMin ?? null,
        etaMinDays: parsed.data.etaMinDays,
        etaMaxDays: parsed.data.etaMaxDays,
        codAvailable: parsed.data.codAvailable,
        isActive: parsed.data.isActive,
        sortOrder: parsed.data.sortOrder,
      },
    });

    revalidateShipping();
    return { data: toZoneDto(row), success: "Zone created" };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateShippingZoneAction(
  id: string,
  input: ShippingZoneInput
): Promise<ShippingActionResult<AdminShippingZone>> {
  try {
    await requireAdminPermission("shipping");
    const parsed = shippingZoneInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid zone" };
    }

    const row = await prisma.shippingZone.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description?.trim() || null,
        areas: parsed.data.areas?.trim() || "",
        baseFee: parsed.data.baseFee,
        freeShippingMin: parsed.data.freeShippingMin ?? null,
        etaMinDays: parsed.data.etaMinDays,
        etaMaxDays: parsed.data.etaMaxDays,
        codAvailable: parsed.data.codAvailable,
        isActive: parsed.data.isActive,
        sortOrder: parsed.data.sortOrder,
      },
    });

    revalidateShipping();
    return { data: toZoneDto(row), success: "Zone updated" };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteShippingZoneAction(id: string): Promise<ShippingActionResult> {
  try {
    await requireAdminPermission("shipping");
    await prisma.shippingZone.delete({ where: { id } });
    revalidateShipping();
    return { success: "Zone deleted" };
  } catch (error) {
    return handleError(error);
  }
}

export async function toggleShippingZoneActiveAction(
  id: string
): Promise<ShippingActionResult<AdminShippingZone>> {
  try {
    await requireAdminPermission("shipping");
    const existing = await prisma.shippingZone.findUnique({ where: { id } });
    if (!existing) return { error: "Zone not found." };
    const row = await prisma.shippingZone.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    revalidateShipping();
    return {
      data: toZoneDto(row),
      success: row.isActive ? "Zone activated" : "Zone deactivated",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function listShippingCouriersAction(): Promise<
  ShippingActionResult<AdminShippingCourier[]>
> {
  try {
    await requireAdminPermission("shipping");
    const rows = await prisma.shippingCourier.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return { data: rows.map(toCourierDto) };
  } catch (error) {
    return handleError(error);
  }
}

export async function createShippingCourierAction(
  input: ShippingCourierInput
): Promise<ShippingActionResult<AdminShippingCourier>> {
  try {
    await requireAdminPermission("shipping");
    const parsed = shippingCourierInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid courier" };
    }

    const row = await prisma.shippingCourier.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        contactPhone: parsed.data.contactPhone?.trim() || null,
        trackingUrl: parsed.data.trackingUrl?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
        isActive: parsed.data.isActive,
        sortOrder: parsed.data.sortOrder,
      },
    });

    revalidateShipping();
    return { data: toCourierDto(row), success: "Courier created" };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateShippingCourierAction(
  id: string,
  input: ShippingCourierInput
): Promise<ShippingActionResult<AdminShippingCourier>> {
  try {
    await requireAdminPermission("shipping");
    const parsed = shippingCourierInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid courier" };
    }

    const row = await prisma.shippingCourier.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        contactPhone: parsed.data.contactPhone?.trim() || null,
        trackingUrl: parsed.data.trackingUrl?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
        isActive: parsed.data.isActive,
        sortOrder: parsed.data.sortOrder,
      },
    });

    revalidateShipping();
    return { data: toCourierDto(row), success: "Courier updated" };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteShippingCourierAction(id: string): Promise<ShippingActionResult> {
  try {
    await requireAdminPermission("shipping");
    await prisma.shippingCourier.delete({ where: { id } });
    revalidateShipping();
    return { success: "Courier deleted" };
  } catch (error) {
    return handleError(error);
  }
}

export async function toggleShippingCourierActiveAction(
  id: string
): Promise<ShippingActionResult<AdminShippingCourier>> {
  try {
    await requireAdminPermission("shipping");
    const existing = await prisma.shippingCourier.findUnique({ where: { id } });
    if (!existing) return { error: "Courier not found." };
    const row = await prisma.shippingCourier.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    revalidateShipping();
    return {
      data: toCourierDto(row),
      success: row.isActive ? "Courier activated" : "Courier deactivated",
    };
  } catch (error) {
    return handleError(error);
  }
}
