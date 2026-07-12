"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import {
  couponInputSchema,
  normalizeCouponCode,
  resolveCouponLifecycle,
  type AdminCoupon,
  type CouponInput,
} from "@/lib/coupons/schemas";
import { prisma } from "@/lib/prisma";

export type CouponActionResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function handleError<T = undefined>(error: unknown): CouponActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return { error: "A coupon with this code already exists." };
    if (error.code === "P2025") return { error: "Coupon not found." };
  }
  console.error("Coupon action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

function decimalToNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value == null) return null;
  if (typeof value === "number") return value;
  return Number(value);
}

function parseOptionalDate(value?: string | null) {
  if (!value || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDto(row: {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: "PERCENT" | "FIXED";
  value: Prisma.Decimal;
  minOrderAmount: Prisma.Decimal | null;
  maxDiscount: Prisma.Decimal | null;
  usageLimit: number | null;
  usageCount: number;
  perCustomerLimit: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AdminCoupon {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    type: row.type,
    value: Number(row.value),
    minOrderAmount: decimalToNumber(row.minOrderAmount),
    maxDiscount: decimalToNumber(row.maxDiscount),
    usageLimit: row.usageLimit,
    usageCount: row.usageCount,
    perCustomerLimit: row.perCustomerLimit,
    startsAt: row.startsAt?.toISOString() ?? null,
    endsAt: row.endsAt?.toISOString() ?? null,
    isActive: row.isActive,
    lifecycle: resolveCouponLifecycle({
      isActive: row.isActive,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      usageLimit: row.usageLimit,
      usageCount: row.usageCount,
    }),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function revalidateCoupons() {
  revalidatePath("/admin/coupons");
}

function toPrismaData(input: CouponInput) {
  return {
    code: normalizeCouponCode(input.code),
    name: input.name.trim(),
    description: input.description?.trim() || null,
    type: input.type,
    value: input.value,
    minOrderAmount: input.minOrderAmount ?? null,
    maxDiscount: input.type === "PERCENT" ? input.maxDiscount ?? null : null,
    usageLimit: input.usageLimit ?? null,
    perCustomerLimit: input.perCustomerLimit ?? null,
    startsAt: parseOptionalDate(input.startsAt),
    endsAt: parseOptionalDate(input.endsAt),
    isActive: input.isActive,
  };
}

export async function listCouponsAction(): Promise<CouponActionResult<AdminCoupon[]>> {
  try {
    await requireAdmin();
    const rows = await prisma.coupon.findMany({
      orderBy: [{ updatedAt: "desc" }],
    });
    return { data: rows.map(toDto) };
  } catch (error) {
    return handleError(error);
  }
}

export async function createCouponAction(
  input: CouponInput
): Promise<CouponActionResult<AdminCoupon>> {
  try {
    await requireAdmin();
    const parsed = couponInputSchema.safeParse({
      ...input,
      code: normalizeCouponCode(input.code),
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid coupon" };
    }

    const row = await prisma.coupon.create({ data: toPrismaData(parsed.data) });
    revalidateCoupons();
    return { data: toDto(row), success: "Coupon created" };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateCouponAction(
  id: string,
  input: CouponInput
): Promise<CouponActionResult<AdminCoupon>> {
  try {
    await requireAdmin();
    const parsed = couponInputSchema.safeParse({
      ...input,
      code: normalizeCouponCode(input.code),
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid coupon" };
    }

    const row = await prisma.coupon.update({
      where: { id },
      data: toPrismaData(parsed.data),
    });
    revalidateCoupons();
    return { data: toDto(row), success: "Coupon updated" };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteCouponAction(id: string): Promise<CouponActionResult> {
  try {
    await requireAdmin();
    await prisma.coupon.delete({ where: { id } });
    revalidateCoupons();
    return { success: "Coupon deleted" };
  } catch (error) {
    return handleError(error);
  }
}

export async function toggleCouponActiveAction(
  id: string
): Promise<CouponActionResult<AdminCoupon>> {
  try {
    await requireAdmin();
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) return { error: "Coupon not found." };

    const row = await prisma.coupon.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    revalidateCoupons();
    return {
      data: toDto(row),
      success: row.isActive ? "Coupon enabled" : "Coupon disabled",
    };
  } catch (error) {
    return handleError(error);
  }
}
