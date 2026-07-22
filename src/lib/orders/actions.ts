"use server";

import {
  AdminNotificationType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ProductStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdminPermission } from "@/lib/admin/require-admin";
import { queueOrderEmails, sendOrderConfirmationEmail, sendOrderStatusEmail } from "@/lib/email/orders";
import { resolveCoupon } from "@/lib/checkout/actions";
import { mapOrderToAdmin } from "@/lib/orders/mapper";
import {
  adminCreateOrderSchema,
  type AdminCreateOrderInput,
  type AdminOrder,
  type AdminOrderStats,
  updateOrderNotesSchema,
  updateOrderPaymentSchema,
  updateOrderStatusSchema,
} from "@/lib/orders/schemas";
import { mapAdminToPublic } from "@/lib/products/public-mapper";
import { mapProductToAdmin } from "@/lib/products/mapper";
import { prisma } from "@/lib/prisma";
import {
  defaultStoreSettings,
  STORE_SETTINGS_KEY,
  storeSettingsSchema,
} from "@/lib/settings/schemas";

export type OrderActionResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function handleError<T = undefined>(error: unknown): OrderActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  console.error("Order action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/[\s-]/g, "");
  if (digits.startsWith("+880")) return digits;
  if (digits.startsWith("880")) return `+${digits}`;
  if (digits.startsWith("0")) return `+880${digits.slice(1)}`;
  if (digits.startsWith("1") && digits.length === 10) return `+880${digits}`;
  return digits.startsWith("+") ? digits : `+880${digits}`;
}

async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const prefix = `WHT-${year}-`;
  const latest = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  const next = latest
    ? Number(latest.orderNumber.replace(prefix, "")) + 1
    : 1;

  return `${prefix}${String(Math.max(1, next)).padStart(5, "0")}`;
}

async function getStoreCheckoutSettings() {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: STORE_SETTINGS_KEY } });
    if (!row) {
      return {
        freeShippingMin: defaultStoreSettings.freeShippingMin,
        codEnabled: defaultStoreSettings.codEnabled,
      };
    }
    const parsed = storeSettingsSchema.safeParse(row.value);
    const settings = parsed.success ? parsed.data : defaultStoreSettings;
    return {
      freeShippingMin: settings.freeShippingMin,
      codEnabled: settings.codEnabled,
    };
  } catch {
    return {
      freeShippingMin: defaultStoreSettings.freeShippingMin,
      codEnabled: defaultStoreSettings.codEnabled,
    };
  }
}

function revalidateOrders(orderId?: string) {
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/orders");
  if (orderId) revalidatePath(`/admin/orders/${orderId}`);
}

const orderInclude = {
  items: {
    orderBy: { productName: "asc" as const },
    include: {
      product: { select: { sku: true } },
    },
  },
} satisfies Prisma.OrderInclude;

export async function listOrdersAction(): Promise<OrderActionResult<AdminOrder[]>> {
  try {
    await requireAdminPermission("orders");
    const rows = await prisma.order.findMany({
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
    return { data: rows.map(mapOrderToAdmin) };
  } catch (error) {
    return handleError(error);
  }
}

export async function getOrderStatsAction(): Promise<OrderActionResult<AdminOrderStats>> {
  try {
    await requireAdminPermission("orders");
    const [grouped, revenueAgg] = await Promise.all([
      prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.order.aggregate({
        where: { status: { not: OrderStatus.CANCELLED }, paymentStatus: PaymentStatus.PAID },
        _sum: { total: true },
      }),
    ]);

    const counts = Object.fromEntries(
      grouped.map((row) => [row.status, row._count._all])
    ) as Partial<Record<OrderStatus, number>>;

    const total = grouped.reduce((sum, row) => sum + row._count._all, 0);

    return {
      data: {
        total,
        pending: counts.PENDING ?? 0,
        paid: counts.PAID ?? 0,
        processing: counts.PROCESSING ?? 0,
        shipped: counts.SHIPPED ?? 0,
        delivered: counts.DELIVERED ?? 0,
        cancelled: counts.CANCELLED ?? 0,
        revenue: Number(revenueAgg._sum.total ?? 0),
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getOrderAction(id: string): Promise<OrderActionResult<AdminOrder>> {
  try {
    await requireAdminPermission("orders");
    const row = await prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
    if (!row) return { error: "Order not found." };
    return { data: mapOrderToAdmin(row) };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateOrderStatusAction(
  id: string,
  input: unknown
): Promise<OrderActionResult<AdminOrder>> {
  try {
    await requireAdminPermission("orders");
    const parsed = updateOrderStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid status." };
    }

    const existing = await prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
    if (!existing) return { error: "Order not found." };

    const nextStatus = parsed.data.status as OrderStatus;
    if (existing.status === nextStatus) {
      return { data: mapOrderToAdmin(existing), success: "Status unchanged." };
    }

    if (existing.status === OrderStatus.CANCELLED && nextStatus !== OrderStatus.CANCELLED) {
      return { error: "Cancelled orders cannot be reopened." };
    }

    if (existing.status === OrderStatus.DELIVERED && nextStatus === OrderStatus.CANCELLED) {
      return { error: "Delivered orders cannot be cancelled." };
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (
        nextStatus === OrderStatus.CANCELLED &&
        existing.status !== OrderStatus.CANCELLED
      ) {
        for (const item of existing.items) {
          if (!item.productId) continue;
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      const paymentPatch: { paymentStatus?: PaymentStatus } = {};
      if (nextStatus === OrderStatus.PAID || nextStatus === OrderStatus.DELIVERED) {
        paymentPatch.paymentStatus = PaymentStatus.PAID;
      }
      if (nextStatus === OrderStatus.CANCELLED && existing.paymentStatus === PaymentStatus.UNPAID) {
        paymentPatch.paymentStatus = PaymentStatus.FAILED;
      }

      return tx.order.update({
        where: { id },
        data: {
          status: nextStatus,
          ...paymentPatch,
        },
        include: orderInclude,
      });
    });

    const customerStatusEmails: OrderStatus[] = [
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
    ];
    if (customerStatusEmails.includes(nextStatus)) {
      queueOrderEmails([() => sendOrderStatusEmail(updated, nextStatus)]);
    }

    revalidateOrders(id);
    return {
      data: mapOrderToAdmin(updated),
      success: `Order marked as ${nextStatus.toLowerCase()}.`,
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateOrderPaymentAction(
  id: string,
  input: unknown
): Promise<OrderActionResult<AdminOrder>> {
  try {
    await requireAdminPermission("orders");
    const parsed = updateOrderPaymentSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid payment status." };
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return { error: "Order not found." };
    if (existing.status === OrderStatus.CANCELLED) {
      return { error: "Cannot update payment on a cancelled order." };
    }

    const paymentStatus = parsed.data.paymentStatus as PaymentStatus;
    const statusPatch: { status?: OrderStatus } = {};
    // Prepaid only: confirm payment moves PENDING → PAID. COD stays unpaid until delivered.
    if (
      paymentStatus === PaymentStatus.PAID &&
      existing.status === OrderStatus.PENDING &&
      existing.paymentMethod !== PaymentMethod.COD
    ) {
      statusPatch.status = OrderStatus.PAID;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { paymentStatus, ...statusPatch },
      include: orderInclude,
    });

    revalidateOrders(id);
    return {
      data: mapOrderToAdmin(updated),
      success: "Payment status updated.",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateOrderNotesAction(
  id: string,
  input: unknown
): Promise<OrderActionResult<AdminOrder>> {
  try {
    await requireAdminPermission("orders");
    const parsed = updateOrderNotesSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid notes." };
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { notes: parsed.data.notes?.trim() || null },
      include: orderInclude,
    });

    revalidateOrders(id);
    return { data: mapOrderToAdmin(updated), success: "Notes saved." };
  } catch (error) {
    return handleError(error);
  }
}

export async function createAdminOrderAction(
  input: unknown
): Promise<OrderActionResult<AdminOrder>> {
  try {
    await requireAdminPermission("orders");
    const parsed = adminCreateOrderSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid order details." };
    }

    const data = parsed.data as AdminCreateOrderInput;
    const store = await getStoreCheckoutSettings();

    const zone = await prisma.shippingZone.findFirst({
      where: { id: data.shippingZoneId, isActive: true },
    });
    if (!zone) return { error: "Selected shipping zone is unavailable." };

    if (data.paymentMethod === "COD" && (!store.codEnabled || !zone.codAvailable)) {
      return { error: "Cash on delivery is not available for this delivery area." };
    }

    if (data.userId) {
      const customer = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { id: true },
      });
      if (!customer) return { error: "Selected customer was not found." };
    }

    const productIds = [...new Set(data.items.map((item) => item.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: ProductStatus.ACTIVE },
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      },
    });

    if (products.length !== productIds.length) {
      return { error: "One or more products are unavailable." };
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const qtyByProduct = new Map<string, number>();
    for (const item of data.items) {
      qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) ?? 0) + item.quantity);
    }

    const lineItems: Array<{
      productId: string;
      productName: string;
      productSlug: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
      imageUrl?: string;
    }> = [];

    for (const [productId, quantity] of qtyByProduct) {
      const product = productMap.get(productId);
      if (!product) return { error: "Product unavailable." };
      if (product.stock < quantity) {
        return { error: `Only ${product.stock} left in stock for ${product.name}.` };
      }
      const publicProduct = mapAdminToPublic(mapProductToAdmin(product));
      const unitPrice = publicProduct.price;
      lineItems.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        unitPrice,
        quantity,
        lineTotal: unitPrice * quantity,
        imageUrl: publicProduct.imageUrl,
      });
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);

    let discount = 0;
    let couponCode: string | null = null;
    const code = data.couponCode?.trim().toUpperCase();
    if (code) {
      const couponResult = await resolveCoupon(code, subtotal);
      if (couponResult.error || !couponResult.data) {
        return { error: couponResult.error ?? "Coupon code is invalid." };
      }
      discount = couponResult.data.discount;
      couponCode = couponResult.data.code;
    }

    const freeThreshold =
      zone.freeShippingMin != null ? Number(zone.freeShippingMin) : store.freeShippingMin;
    const shippingFee =
      freeThreshold > 0 && subtotal - discount >= freeThreshold
        ? 0
        : Number(zone.baseFee);
    const total = Math.max(0, subtotal - discount + shippingFee);

    let status = data.status as OrderStatus;
    let paymentStatus = data.paymentStatus as PaymentStatus;

    if (status === OrderStatus.CANCELLED) {
      return { error: "Create the order first, then cancel if needed." };
    }
    if (paymentStatus === PaymentStatus.PAID && status === OrderStatus.PENDING) {
      status = OrderStatus.PAID;
    }
    if (status === OrderStatus.PAID || status === OrderStatus.DELIVERED) {
      paymentStatus = PaymentStatus.PAID;
    }

    const orderNumber = await generateOrderNumber();
    const phone = normalizePhone(data.phone);
    const shippingPhone = normalizePhone(data.shippingPhone);

    const order = await prisma.$transaction(async (tx) => {
      for (const item of lineItems) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new Error(`Insufficient stock for ${item.productName}`);
        }
      }

      if (couponCode) {
        await tx.coupon.updateMany({
          where: { code: couponCode, isActive: true },
          data: { usageCount: { increment: 1 } },
        });
      }

      return tx.order.create({
        data: {
          orderNumber,
          userId: data.userId || null,
          email: data.email.trim().toLowerCase(),
          phone,
          customerName: data.customerName.trim(),
          shippingFullName: data.shippingFullName.trim(),
          shippingPhone,
          shippingDistrict: data.shippingDistrict.trim(),
          shippingArea: data.shippingArea.trim(),
          shippingDetails: data.shippingDetails.trim(),
          shippingZoneId: zone.id,
          shippingZoneName: zone.name,
          shippingFee,
          subtotal,
          discount,
          total,
          paymentMethod: data.paymentMethod as PaymentMethod,
          paymentStatus,
          status,
          notes: data.notes?.trim() || null,
          couponCode,
          items: {
            create: lineItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productSlug: item.productSlug,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              lineTotal: item.lineTotal,
              imageUrl: item.imageUrl,
            })),
          },
        },
        include: orderInclude,
      });
    });

    try {
      await prisma.adminNotification.create({
        data: {
          type: AdminNotificationType.ORDER,
          title: "Manual order created",
          message: `${order.orderNumber} · ${data.customerName} · ৳ ${total.toFixed(2)}`,
          href: `/admin/orders/${order.id}`,
        },
      });
    } catch {
      // best-effort
    }

    queueOrderEmails([() => sendOrderConfirmationEmail(order)]);

    revalidateOrders(order.id);
    revalidatePath("/shop");
    revalidatePath("/admin/inventory");

    return {
      data: mapOrderToAdmin(order),
      success: `Order ${order.orderNumber} created.`,
    };
  } catch (error) {
    return handleError(error);
  }
}
