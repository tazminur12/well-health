"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import {
  createReviewSchema,
  reviewReplySchema,
  reviewStatusSchema,
  type AdminReview,
  type CreateReviewInput,
  type ReviewProductOption,
  type ReviewStatusValue,
} from "@/lib/reviews/schemas";
import { prisma } from "@/lib/prisma";

export type ReviewActionResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function handleError<T = undefined>(error: unknown): ReviewActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") return { error: "Review not found." };
  }
  console.error("Review action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

type ReviewRow = {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string | null;
  rating: number;
  title: string | null;
  comment: string;
  status: ReviewStatusValue;
  isFeatured: boolean;
  adminReply: string | null;
  createdAt: Date;
  updatedAt: Date;
  product: {
    name: string;
    sku: string;
    images: Array<{ url: string }>;
  };
};

function toDto(row: ReviewRow): AdminReview {
  return {
    id: row.id,
    productId: row.productId,
    productName: row.product.name,
    productSku: row.product.sku,
    productImageUrl: row.product.images[0]?.url ?? null,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    rating: row.rating,
    title: row.title,
    comment: row.comment,
    status: row.status,
    isFeatured: row.isFeatured,
    adminReply: row.adminReply,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const reviewInclude = {
  product: {
    select: {
      name: true,
      sku: true,
      images: {
        orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }],
        take: 1,
      },
    },
  },
};

function revalidateReviews(productId?: string) {
  revalidatePath("/admin/reviews");
  if (productId) {
    revalidatePath(`/admin/products/${productId}/edit`);
  }
  revalidatePath("/");
  revalidatePath("/shop");
}

export async function listReviewsAction(): Promise<ReviewActionResult<AdminReview[]>> {
  try {
    await requireAdmin();
    const rows = await prisma.productReview.findMany({
      include: reviewInclude,
      orderBy: [{ createdAt: "desc" }],
    });
    return { data: rows.map(toDto) };
  } catch (error) {
    return handleError(error);
  }
}

export async function listReviewProductOptionsAction(): Promise<
  ReviewActionResult<ReviewProductOption[]>
> {
  try {
    await requireAdmin();
    const rows = await prisma.product.findMany({
      select: { id: true, name: true, sku: true },
      orderBy: [{ name: "asc" }],
    });
    return { data: rows };
  } catch (error) {
    return handleError(error);
  }
}

export async function createReviewAction(
  input: CreateReviewInput
): Promise<ReviewActionResult<AdminReview>> {
  try {
    await requireAdmin();
    const parsed = createReviewSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid review" };
    }

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      select: { id: true },
    });
    if (!product) return { error: "Product not found." };

    const featured =
      parsed.data.status === "APPROVED" ? Boolean(parsed.data.isFeatured) : false;

    const row = await prisma.productReview.create({
      data: {
        productId: parsed.data.productId,
        customerName: parsed.data.customerName.trim(),
        customerEmail: parsed.data.customerEmail?.trim() || null,
        rating: parsed.data.rating,
        title: parsed.data.title?.trim() || null,
        comment: parsed.data.comment.trim(),
        status: parsed.data.status,
        isFeatured: featured,
        adminReply: parsed.data.adminReply?.trim() || null,
      },
      include: reviewInclude,
    });

    revalidateReviews(row.productId);
    return { data: toDto(row), success: "Review created" };
  } catch (error) {
    return handleError(error);
  }
}

export async function setReviewStatusAction(
  id: string,
  status: ReviewStatusValue
): Promise<ReviewActionResult<AdminReview>> {
  try {
    await requireAdmin();
    const parsed = reviewStatusSchema.safeParse(status);
    if (!parsed.success) return { error: "Invalid status" };

    const row = await prisma.productReview.update({
      where: { id },
      data: {
        status: parsed.data,
        ...(parsed.data !== "APPROVED" ? { isFeatured: false } : {}),
      },
      include: reviewInclude,
    });

    revalidateReviews(row.productId);
    return {
      data: toDto(row),
      success:
        parsed.data === "APPROVED"
          ? "Review approved"
          : parsed.data === "REJECTED"
            ? "Review rejected"
            : "Review set to pending",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function toggleReviewFeaturedAction(
  id: string
): Promise<ReviewActionResult<AdminReview>> {
  try {
    await requireAdmin();
    const existing = await prisma.productReview.findUnique({ where: { id } });
    if (!existing) return { error: "Review not found." };
    if (existing.status !== "APPROVED" && !existing.isFeatured) {
      return { error: "Only approved reviews can be featured." };
    }

    const row = await prisma.productReview.update({
      where: { id },
      data: { isFeatured: !existing.isFeatured },
      include: reviewInclude,
    });

    revalidateReviews(row.productId);
    return {
      data: toDto(row),
      success: row.isFeatured ? "Marked as featured" : "Removed from featured",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateReviewReplyAction(
  id: string,
  adminReply: string
): Promise<ReviewActionResult<AdminReview>> {
  try {
    await requireAdmin();
    const parsed = reviewReplySchema.safeParse({ adminReply });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid reply" };
    }

    const row = await prisma.productReview.update({
      where: { id },
      data: { adminReply: parsed.data.adminReply?.trim() || null },
      include: reviewInclude,
    });

    revalidateReviews(row.productId);
    return { data: toDto(row), success: "Reply saved" };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteReviewAction(id: string): Promise<ReviewActionResult> {
  try {
    await requireAdmin();
    const existing = await prisma.productReview.findUnique({ where: { id } });
    if (!existing) return { error: "Review not found." };
    await prisma.productReview.delete({ where: { id } });
    revalidateReviews(existing.productId);
    return { success: "Review deleted" };
  } catch (error) {
    return handleError(error);
  }
}
