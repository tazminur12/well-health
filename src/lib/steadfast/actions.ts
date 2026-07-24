"use server";

import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdminPermission } from "@/lib/admin/require-admin";
import { queueOrderEmails, sendOrderStatusEmail } from "@/lib/email/orders";
import { mapOrderToAdmin } from "@/lib/orders/mapper";
import type { AdminOrder } from "@/lib/orders/schemas";
import { prisma } from "@/lib/prisma";
import {
  createSteadfastOrder,
  createSteadfastReturnRequest,
  getSteadfastBalance,
  getSteadfastConfigStatus,
  isSteadfastConfigured,
  normalizeSteadfastPhone,
} from "@/lib/steadfast/client";
import { buildSteadfastTrackingUrl } from "@/lib/steadfast/display";
import {
  createSteadfastConsignmentSchema,
  createSteadfastReturnSchema,
  syncSteadfastStatusSchema,
  type SteadfastDashboardStats,
  type SteadfastRecentConsignment,
} from "@/lib/steadfast/schemas";
import {
  syncOpenSteadfastConsignments,
  syncOrderSteadfastStatus,
} from "@/lib/steadfast/sync-worker";

export type SteadfastActionResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

const orderInclude = {
  items: { include: { product: { select: { sku: true } } } },
} satisfies Prisma.OrderInclude;

function handleError<T = undefined>(error: unknown): SteadfastActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  console.error("Steadfast action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Steadfast action failed.",
  };
}

function revalidateSteadfast(orderId?: string) {
  revalidatePath("/admin/orders");
  revalidatePath("/admin/steadfast");
  revalidatePath("/admin/shipping");
  if (orderId) revalidatePath(`/admin/orders/${orderId}`);
}

function buildRecipientAddress(order: {
  shippingDetails: string;
  shippingArea: string;
  shippingDistrict: string;
}) {
  const parts = [
    order.shippingDetails.trim(),
    order.shippingArea.trim(),
    order.shippingDistrict.trim(),
  ].filter(Boolean);
  return parts.join(", ").slice(0, 250);
}

function resolveCodAmount(
  order: {
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    total: Prisma.Decimal | number;
  },
  override?: number
) {
  if (typeof override === "number") return override;
  const total = typeof order.total === "number" ? order.total : Number(order.total);
  if (order.paymentMethod === PaymentMethod.COD && order.paymentStatus !== PaymentStatus.PAID) {
    return Math.max(0, Math.round(total));
  }
  return 0;
}

export async function getSteadfastConnectionAction(): Promise<
  SteadfastActionResult<{
    configured: boolean;
    baseUrl: string;
    balance: number | null;
    latencyMs: number | null;
    error: string | null;
  }>
> {
  try {
    await requireAdminPermission("shipping");
    const config = getSteadfastConfigStatus();
    if (!config.configured) {
      return {
        data: {
          configured: false,
          baseUrl: config.baseUrl,
          balance: null,
          latencyMs: null,
          error: "Add STEADFAST_API_KEY and STEADFAST_SECRET_KEY to .env",
        },
      };
    }

    const balance = await getSteadfastBalance();
    if (!balance.ok) {
      return {
        data: {
          configured: true,
          baseUrl: config.baseUrl,
          balance: null,
          latencyMs: balance.latencyMs,
          error: balance.error,
        },
      };
    }

    return {
      data: {
        configured: true,
        baseUrl: config.baseUrl,
        balance: balance.data.current_balance,
        latencyMs: balance.latencyMs,
        error: null,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getSteadfastDashboardAction(): Promise<
  SteadfastActionResult<SteadfastDashboardStats>
> {
  try {
    await requireAdminPermission("shipping");
    const config = getSteadfastConfigStatus();

    let balance: number | null = null;
    let balanceError: string | null = null;
    let latencyMs: number | null = null;

    if (config.configured) {
      const result = await getSteadfastBalance();
      latencyMs = result.latencyMs;
      if (result.ok) balance = result.data.current_balance;
      else balanceError = result.error;
    } else {
      balanceError = "API keys not configured";
    }

    const where: Prisma.OrderWhereInput = {
      OR: [
        { steadfastConsignmentId: { not: null } },
        { steadfastTrackingCode: { not: null } },
      ],
    };

    const [consignmentsTotal, delivered, cancelled, inTransit, recentRows] =
      await Promise.all([
        prisma.order.count({ where }),
        prisma.order.count({
          where: {
            AND: [
              where,
              {
                OR: [
                  { steadfastStatus: { in: ["delivered", "partial_delivered", "delivered_approval_pending", "partial_delivered_approval_pending"] } },
                  {
                    status: OrderStatus.DELIVERED,
                    steadfastTrackingCode: { not: null },
                  },
                ],
              },
            ],
          },
        }),
        prisma.order.count({
          where: {
            AND: [
              where,
              {
                OR: [
                  { steadfastStatus: "cancelled" },
                  { status: OrderStatus.CANCELLED },
                ],
              },
            ],
          },
        }),
        prisma.order.count({
          where: {
            steadfastTrackingCode: { not: null },
            status: { in: [OrderStatus.PROCESSING, OrderStatus.SHIPPED] },
            NOT: {
              steadfastStatus: {
                in: [
                  "delivered",
                  "partial_delivered",
                  "delivered_approval_pending",
                  "partial_delivered_approval_pending",
                  "cancelled",
                ],
              },
            },
          },
        }),
        prisma.order.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          take: 20,
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            status: true,
            steadfastConsignmentId: true,
            steadfastTrackingCode: true,
            steadfastStatus: true,
            steadfastCodAmount: true,
            steadfastSyncedAt: true,
            createdAt: true,
          },
        }),
      ]);

    const recent: SteadfastRecentConsignment[] = recentRows.map((row) => ({
      orderId: row.id,
      orderNumber: row.orderNumber,
      customerName: row.customerName,
      trackingCode: row.steadfastTrackingCode,
      consignmentId: row.steadfastConsignmentId,
      steadfastStatus: row.steadfastStatus,
      orderStatus: row.status,
      codAmount: row.steadfastCodAmount != null ? Number(row.steadfastCodAmount) : null,
      syncedAt: row.steadfastSyncedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    }));

    return {
      data: {
        configured: config.configured,
        baseUrl: config.baseUrl,
        balance,
        balanceError,
        latencyMs,
        consignmentsTotal,
        inTransit,
        delivered,
        cancelled,
        recent,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function createSteadfastConsignmentAction(
  input: unknown
): Promise<SteadfastActionResult<AdminOrder & { trackingUrl: string | null }>> {
  try {
    await requireAdminPermission("orders");
    const parsed = createSteadfastConsignmentSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    if (!isSteadfastConfigured()) {
      return {
        error:
          "Steadfast is not configured. Add STEADFAST_API_KEY and STEADFAST_SECRET_KEY to .env.",
      };
    }

    const { orderId, codAmount, note, deliveryType, markShipped } = parsed.data;

    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });
    if (!existing) return { error: "Order not found." };
    if (existing.status === OrderStatus.CANCELLED) {
      return { error: "Cannot create a consignment for a cancelled order." };
    }
    if (existing.steadfastConsignmentId || existing.steadfastTrackingCode) {
      return {
        error: `Consignment already exists (tracking ${existing.steadfastTrackingCode ?? existing.steadfastConsignmentId}).`,
      };
    }

    const phone = normalizeSteadfastPhone(existing.shippingPhone);
    if (!phone) {
      return {
        error:
          "Shipping phone must be a valid 11-digit BD number (01XXXXXXXXX) for Steadfast.",
      };
    }

    const address = buildRecipientAddress(existing);
    if (address.length < 5) {
      return { error: "Shipping address is too short for Steadfast." };
    }

    const itemsDescription = existing.items
      .map((item) => `${item.productName} × ${item.quantity}`)
      .join(", ")
      .slice(0, 500);

    const lot = existing.items.reduce((sum, item) => sum + item.quantity, 0);
    const resolvedCod = resolveCodAmount(existing, codAmount);
    const invoice = existing.orderNumber.replace(/[^a-zA-Z0-9_-]/g, "-");

    const apiResult = await createSteadfastOrder({
      invoice,
      recipient_name: existing.shippingFullName.slice(0, 100),
      recipient_phone: phone,
      recipient_address: address,
      recipient_email: existing.email || undefined,
      cod_amount: resolvedCod,
      note: (note?.trim() || existing.notes || undefined)?.slice(0, 500),
      item_description: itemsDescription || undefined,
      total_lot: lot > 0 ? lot : undefined,
      delivery_type: deliveryType,
    });

    if (!apiResult.ok) {
      return { error: apiResult.error };
    }

    const consignment = apiResult.data;
    const shouldShip =
      markShipped &&
      existing.status !== OrderStatus.SHIPPED &&
      existing.status !== OrderStatus.DELIVERED;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        steadfastConsignmentId: consignment.consignment_id,
        steadfastInvoice: consignment.invoice || invoice,
        steadfastTrackingCode: consignment.tracking_code,
        steadfastStatus: consignment.status || "in_review",
        steadfastCodAmount: resolvedCod,
        steadfastSyncedAt: new Date(),
        ...(shouldShip ? { status: OrderStatus.SHIPPED } : {}),
      },
      include: orderInclude,
    });

    if (shouldShip) {
      queueOrderEmails([() => sendOrderStatusEmail(updated, OrderStatus.SHIPPED)]);
    }

    revalidateSteadfast(orderId);
    return {
      data: {
        ...mapOrderToAdmin(updated),
        trackingUrl: buildSteadfastTrackingUrl(consignment.tracking_code),
      },
      success: `Steadfast consignment created · tracking ${consignment.tracking_code}`,
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function syncSteadfastStatusAction(
  input: unknown
): Promise<SteadfastActionResult<AdminOrder>> {
  try {
    await requireAdminPermission("orders");
    const parsed = syncSteadfastStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    const result = await syncOrderSteadfastStatus(parsed.data.orderId, {
      syncOrderStatus: parsed.data.syncOrderStatus,
    });

    if (!result.ok) return { error: result.error };

    const parts = [`Steadfast status: ${result.deliveryStatus}`];
    if (result.markedDelivered) {
      parts.push("order Delivered");
      if (result.markedPaid) parts.push("payment Paid");
    }

    return {
      data: result.order,
      success: parts.join(" · "),
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function createSteadfastReturnForOrderAction(
  input: unknown
): Promise<SteadfastActionResult<AdminOrder>> {
  try {
    await requireAdminPermission("orders");
    const parsed = createSteadfastReturnSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    if (!isSteadfastConfigured()) {
      return { error: "Steadfast is not configured." };
    }

    const existing = await prisma.order.findUnique({
      where: { id: parsed.data.orderId },
      include: orderInclude,
    });
    if (!existing) return { error: "Order not found." };
    if (!existing.steadfastConsignmentId && !existing.steadfastTrackingCode) {
      return { error: "No Steadfast consignment to return." };
    }

    const payload: {
      consignment_id?: number;
      invoice?: string;
      tracking_code?: string;
      reason?: string;
    } = {};
    if (existing.steadfastConsignmentId) {
      payload.consignment_id = existing.steadfastConsignmentId;
    } else if (existing.steadfastTrackingCode) {
      payload.tracking_code = existing.steadfastTrackingCode;
    } else if (existing.steadfastInvoice) {
      payload.invoice = existing.steadfastInvoice;
    }
    if (parsed.data.reason?.trim()) payload.reason = parsed.data.reason.trim();

    const result = await createSteadfastReturnRequest(payload);
    if (!result.ok) return { error: result.error };

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        steadfastStatus: "return_requested",
        steadfastSyncedAt: new Date(),
      },
      include: orderInclude,
    });

    revalidateSteadfast(existing.id);
    return {
      data: mapOrderToAdmin(updated),
      success: "Return request submitted to Steadfast.",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function syncAllOpenSteadfastStatusesAction(): Promise<
  SteadfastActionResult<{ synced: number; failed: number; errors: string[]; paid: number }>
> {
  try {
    await requireAdminPermission("shipping");
    const result = await syncOpenSteadfastConsignments();
    if (result.errors.length === 1 && result.synced === 0 && result.failed === 0) {
      return { error: result.errors[0] };
    }
    return {
      data: result,
      success: `Synced ${result.synced} · ${result.paid} marked Paid${
        result.failed ? ` · ${result.failed} failed` : ""
      }.`,
    };
  } catch (error) {
    return handleError(error);
  }
}
