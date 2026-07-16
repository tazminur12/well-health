"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdminPermission } from "@/lib/admin/require-admin";
import { sendDistributorApprovalEmail } from "@/lib/email/distributor-approval";
import { mapDistributorApplication } from "@/lib/distributors/mapper";
import {
  createDistributorApplicationSchema,
  distributorApplicationFilterSchema,
  submitDistributorApplicationSchema,
  updateDistributorApplicationSchema,
  type AdminDistributorApplication,
  type CreateDistributorApplicationInput,
  type DistributorApplicationFilter,
  type DistributorApplicationStats,
  type DistributorApplicationStatus,
  type SubmitDistributorApplicationInput,
  type UpdateDistributorApplicationInput,
} from "@/lib/distributors/schemas";
import { createAdminNotification } from "@/lib/notifications/actions";
import { prisma } from "@/lib/prisma";
import { rateLimitForRequest } from "@/lib/rate-limit/server";

export type DistributorActionResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function handleError<T = undefined>(error: unknown): DistributorActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") return { error: "Application not found." };
  }
  console.error("Distributor action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

function revalidateDistributors() {
  revalidatePath("/admin/distributors");
  revalidatePath("/admin/distributors/new");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin", "layout");
}

function filterToWhere(filter: DistributorApplicationFilter) {
  switch (filter) {
    case "new":
      return { status: "NEW" as const };
    case "reviewing":
      return { status: "REVIEWING" as const };
    case "approved":
      return { status: "APPROVED" as const };
    case "rejected":
      return { status: "REJECTED" as const };
    case "archived":
      return { status: "ARCHIVED" as const };
    default:
      return {};
  }
}

async function notifyDistributorApproval(
  previousStatus: DistributorApplicationStatus,
  application: AdminDistributorApplication
) {
  if (application.status !== "APPROVED" || previousStatus === "APPROVED") {
    return undefined;
  }

  const emailResult = await sendDistributorApprovalEmail(application);
  if (emailResult.ok && !emailResult.preview) {
    return `Approved. Official approval letter emailed to ${application.email}.`;
  }
  if (emailResult.preview) {
    return "Approved. Resend is not configured — approval email was not sent.";
  }
  return `Approved, but the approval email could not be sent: ${emailResult.error}`;
}

/** Public — no auth. Distributor partnership page. */
export async function submitDistributorApplicationAction(
  input: SubmitDistributorApplicationInput
): Promise<DistributorActionResult<{ id: string }>> {
  try {
    const parsed = submitDistributorApplicationSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid application." };
    }

    const rateLimited = await rateLimitForRequest("form:distributor");
    if (rateLimited) return rateLimited;

    const row = await prisma.distributorApplication.create({
      data: {
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        email: parsed.data.email.toLowerCase(),
        division: parsed.data.division,
        district: parsed.data.district,
        businessName: parsed.data.businessName?.trim() || null,
        businessType: parsed.data.businessType,
        experience: parsed.data.experience,
        coverageArea: parsed.data.coverageArea,
        message: parsed.data.message,
        status: "NEW",
      },
    });

    await createAdminNotification({
      type: "CUSTOMER",
      title: "New distributor application",
      message: `${parsed.data.fullName} · ${parsed.data.district}`,
      href: `/admin/distributors?id=${row.id}`,
    });

    revalidateDistributors();
    return {
      data: { id: row.id },
      success: "Application submitted. Our partnership team will contact you soon.",
    };
  } catch (error) {
    return handleError(error);
  }
}

/** Admin — manually add a distributor / partner record. */
export async function createDistributorApplicationAction(
  input: CreateDistributorApplicationInput
): Promise<DistributorActionResult<AdminDistributorApplication>> {
  try {
    await requireAdminPermission("distributors");
    const parsed = createDistributorApplicationSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid application." };
    }

    const status = parsed.data.status;
    const row = await prisma.distributorApplication.create({
      data: {
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        email: parsed.data.email.toLowerCase(),
        division: parsed.data.division,
        district: parsed.data.district,
        businessName: parsed.data.businessName?.trim() || null,
        businessType: parsed.data.businessType,
        experience: parsed.data.experience,
        coverageArea: parsed.data.coverageArea,
        message: parsed.data.message?.trim() || "Manually added by admin.",
        status,
        adminNotes: parsed.data.adminNotes?.trim() || null,
        reviewedAt:
          status === "APPROVED" || status === "REJECTED" ? new Date() : null,
      },
    });

    const application = mapDistributorApplication(row);
    const approvalNotice =
      status === "APPROVED"
        ? await notifyDistributorApproval("NEW", application)
        : undefined;

    revalidateDistributors();
    return {
      data: application,
      success: approvalNotice ?? "Distributor added successfully.",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function listDistributorApplicationsAction(input?: {
  filter?: DistributorApplicationFilter;
}): Promise<
  DistributorActionResult<{
    items: AdminDistributorApplication[];
    stats: DistributorApplicationStats;
    newCount: number;
  }>
> {
  try {
    await requireAdminPermission("distributors");
    const filter = distributorApplicationFilterSchema.parse(input?.filter ?? "all");

    const [items, grouped] = await Promise.all([
      prisma.distributorApplication.findMany({
        where: filterToWhere(filter),
        orderBy: { createdAt: "desc" },
      }),
      prisma.distributorApplication.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    const counts = Object.fromEntries(
      grouped.map((row) => [row.status, row._count._all])
    ) as Record<string, number>;

    const stats: DistributorApplicationStats = {
      total: Object.values(counts).reduce((sum, count) => sum + count, 0),
      new: counts.NEW ?? 0,
      reviewing: counts.REVIEWING ?? 0,
      approved: counts.APPROVED ?? 0,
      rejected: counts.REJECTED ?? 0,
      archived: counts.ARCHIVED ?? 0,
    };

    return {
      data: {
        items: items.map(mapDistributorApplication),
        stats,
        newCount: stats.new,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getDistributorApplicationsUnreadCountAction(): Promise<
  DistributorActionResult<{ newCount: number }>
> {
  try {
    await requireAdminPermission("distributors");
    const newCount = await prisma.distributorApplication.count({
      where: { status: "NEW" },
    });
    return { data: { newCount } };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateDistributorApplicationAction(
  id: string,
  input: UpdateDistributorApplicationInput
): Promise<DistributorActionResult<AdminDistributorApplication>> {
  try {
    await requireAdminPermission("distributors");
    const parsed = updateDistributorApplicationSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid update." };
    }

    const existing = await prisma.distributorApplication.findUnique({ where: { id } });
    if (!existing) {
      return { error: "Application not found." };
    }

    const data: Prisma.DistributorApplicationUpdateInput = {};
    if (parsed.data.status) {
      data.status = parsed.data.status;
      if (parsed.data.status === "APPROVED" || parsed.data.status === "REJECTED") {
        data.reviewedAt = new Date();
      }
    }
    if (parsed.data.adminNotes !== undefined) {
      data.adminNotes = parsed.data.adminNotes;
    }

    const row = await prisma.distributorApplication.update({
      where: { id },
      data,
    });

    const application = mapDistributorApplication(row);
    const approvalNotice = parsed.data.status
      ? await notifyDistributorApproval(existing.status, application)
      : undefined;

    revalidateDistributors();
    return {
      data: application,
      success:
        approvalNotice ??
        (parsed.data.status
          ? `Marked as ${parsed.data.status.toLowerCase()}.`
          : "Application updated."),
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function markDistributorApplicationReviewingAction(
  id: string
): Promise<DistributorActionResult<AdminDistributorApplication>> {
  return updateDistributorApplicationAction(id, { status: "REVIEWING" });
}

export async function deleteDistributorApplicationAction(
  id: string
): Promise<DistributorActionResult> {
  try {
    await requireAdminPermission("distributors");
    await prisma.distributorApplication.delete({ where: { id } });
    revalidateDistributors();
    return { success: "Application deleted." };
  } catch (error) {
    return handleError(error);
  }
}
