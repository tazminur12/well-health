import {
  OrderStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { queueOrderEmails, sendOrderStatusEmail } from "@/lib/email/orders";
import { mapOrderToAdmin } from "@/lib/orders/mapper";
import type { AdminOrder } from "@/lib/orders/schemas";
import { prisma } from "@/lib/prisma";
import {
  getSteadfastStatusByCid,
  getSteadfastStatusByInvoice,
  getSteadfastStatusByTracking,
  isSteadfastConfigured,
} from "@/lib/steadfast/client";

const orderInclude = {
  items: { include: { product: { select: { sku: true } } } },
} satisfies Prisma.OrderInclude;

export function isSteadfastDeliveryComplete(deliveryStatus: string) {
  const status = deliveryStatus.toLowerCase();
  return (
    status === "delivered" ||
    status === "partial_delivered" ||
    status === "delivered_approval_pending" ||
    status === "partial_delivered_approval_pending"
  );
}

export function mapSteadfastDeliveryToOrderStatus(
  deliveryStatus: string
): OrderStatus | null {
  const status = deliveryStatus.toLowerCase();
  if (isSteadfastDeliveryComplete(status)) {
    return OrderStatus.DELIVERED;
  }
  if (status === "cancelled" || status === "cancelled_approval_pending") {
    return OrderStatus.CANCELLED;
  }
  if (status === "pending" || status === "in_review" || status === "hold") {
    return OrderStatus.SHIPPED;
  }
  return null;
}

function revalidateSteadfast(orderId?: string) {
  revalidatePath("/admin/orders");
  revalidatePath("/admin/steadfast");
  revalidatePath("/admin/shipping");
  if (orderId) revalidatePath(`/admin/orders/${orderId}`);
}

export type SyncOrderSteadfastResult =
  | { ok: true; order: AdminOrder; deliveryStatus: string; markedPaid: boolean; markedDelivered: boolean }
  | { ok: false; error: string };

/**
 * Pull Steadfast delivery status and update local order.
 * When delivery is complete → order Delivered + payment Paid (COD cash collected).
 */
export async function syncOrderSteadfastStatus(
  orderId: string,
  options?: { syncOrderStatus?: boolean }
): Promise<SyncOrderSteadfastResult> {
  if (!isSteadfastConfigured()) {
    return { ok: false, error: "Steadfast is not configured." };
  }

  const syncOrderStatus = options?.syncOrderStatus !== false;

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });
  if (!existing) return { ok: false, error: "Order not found." };

  if (
    !existing.steadfastConsignmentId &&
    !existing.steadfastTrackingCode &&
    !existing.steadfastInvoice
  ) {
    return { ok: false, error: "No Steadfast consignment on this order yet." };
  }

  let statusResult;
  if (existing.steadfastConsignmentId) {
    statusResult = await getSteadfastStatusByCid(existing.steadfastConsignmentId);
  } else if (existing.steadfastTrackingCode) {
    statusResult = await getSteadfastStatusByTracking(existing.steadfastTrackingCode);
  } else {
    statusResult = await getSteadfastStatusByInvoice(existing.steadfastInvoice!);
  }

  if (!statusResult.ok) {
    return { ok: false, error: statusResult.error };
  }

  const deliveryStatus = statusResult.data.delivery_status;
  const deliveryComplete = isSteadfastDeliveryComplete(deliveryStatus);
  const mapped = syncOrderStatus
    ? mapSteadfastDeliveryToOrderStatus(deliveryStatus)
    : null;

  let nextOrderStatus: OrderStatus | null = null;
  if (
    mapped &&
    mapped !== OrderStatus.CANCELLED &&
    existing.status !== OrderStatus.CANCELLED
  ) {
    if (existing.status !== mapped) {
      if (
        existing.status === OrderStatus.DELIVERED &&
        mapped === OrderStatus.SHIPPED
      ) {
        nextOrderStatus = null;
      } else {
        nextOrderStatus = mapped;
      }
    }
  }

  const shouldMarkPaid =
    deliveryComplete && existing.paymentStatus !== PaymentStatus.PAID;

  const data: Prisma.OrderUpdateInput = {
    steadfastStatus: deliveryStatus,
    steadfastSyncedAt: new Date(),
  };

  if (nextOrderStatus) {
    data.status = nextOrderStatus;
  }
  if (shouldMarkPaid) {
    data.paymentStatus = PaymentStatus.PAID;
  }
  if (
    deliveryComplete &&
    existing.status !== OrderStatus.DELIVERED &&
    existing.status !== OrderStatus.CANCELLED
  ) {
    data.status = OrderStatus.DELIVERED;
    nextOrderStatus = OrderStatus.DELIVERED;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data,
    include: orderInclude,
  });

  const finalStatus = updated.status;
  if (finalStatus !== existing.status) {
    if (
      finalStatus === OrderStatus.SHIPPED ||
      finalStatus === OrderStatus.DELIVERED
    ) {
      queueOrderEmails([() => sendOrderStatusEmail(updated, finalStatus)]);
    }
  }

  revalidateSteadfast(orderId);

  return {
    ok: true,
    order: mapOrderToAdmin(updated),
    deliveryStatus,
    markedPaid: shouldMarkPaid || updated.paymentStatus === PaymentStatus.PAID,
    markedDelivered: deliveryComplete,
  };
}

export async function syncOpenSteadfastConsignments(limit = 40) {
  if (!isSteadfastConfigured()) {
    return { synced: 0, failed: 0, errors: ["Steadfast is not configured."], paid: 0 };
  }

  const open = await prisma.order.findMany({
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
    select: { id: true },
    take: limit,
    orderBy: { updatedAt: "asc" },
  });

  let synced = 0;
  let failed = 0;
  let paid = 0;
  const errors: string[] = [];

  for (const row of open) {
    const result = await syncOrderSteadfastStatus(row.id, { syncOrderStatus: true });
    if (!result.ok) {
      failed += 1;
      if (errors.length < 5) errors.push(result.error);
    } else {
      synced += 1;
      if (result.markedPaid && result.markedDelivered) paid += 1;
    }
  }

  revalidateSteadfast();
  return { synced, failed, errors, paid };
}
