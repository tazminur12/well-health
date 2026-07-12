"use server";

import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import type {
  CustomerOrder,
  CustomerOrderStats,
} from "@/components/customer/orders-data";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export type CustomerOrderResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

const orderInclude = {
  items: { orderBy: { productName: "asc" as const } },
} satisfies Prisma.OrderInclude;

function decimalToNumber(value: Prisma.Decimal | number) {
  return typeof value === "number" ? value : Number(value);
}

function mapOrder(order: Prisma.OrderGetPayload<{ include: typeof orderInclude }>): CustomerOrder {
  const items = order.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.productName,
    slug: item.productSlug,
    quantity: item.quantity,
    unitPrice: decimalToNumber(item.unitPrice),
    lineTotal: decimalToNumber(item.lineTotal),
    imageUrl: item.imageUrl,
  }));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    placedAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: decimalToNumber(order.subtotal),
    shippingFee: decimalToNumber(order.shippingFee),
    discount: decimalToNumber(order.discount),
    total: decimalToNumber(order.total),
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    couponCode: order.couponCode,
    notes: order.notes,
    shippingFullName: order.shippingFullName,
    shippingPhone: order.shippingPhone,
    shippingDetails: order.shippingDetails,
    shippingArea: order.shippingArea,
    shippingDistrict: order.shippingDistrict,
    shippingZoneName: order.shippingZoneName,
    cancelReason:
      order.status === OrderStatus.CANCELLED
        ? "This order was cancelled."
        : null,
  };
}

async function requireCustomer() {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Please sign in to view your orders." } as const;
  }
  return { user } as const;
}

function ownershipWhere(userId: string, email: string): Prisma.OrderWhereInput {
  return {
    OR: [{ userId }, { email: { equals: email, mode: "insensitive" } }],
  };
}

export async function listMyOrdersAction(): Promise<
  CustomerOrderResult<CustomerOrder[]>
> {
  try {
    const auth = await requireCustomer();
    if ("error" in auth) return { error: auth.error };

    const { user } = auth;

    // Link guest checkout orders (same email, no userId) to this account
    await prisma.order.updateMany({
      where: {
        userId: null,
        email: { equals: user.email, mode: "insensitive" },
      },
      data: { userId: user.id },
    });

    const rows = await prisma.order.findMany({
      where: ownershipWhere(user.id, user.email),
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });

    return { data: rows.map(mapOrder) };
  } catch (error) {
    console.error("listMyOrdersAction:", error);
    return { error: "Could not load your orders." };
  }
}

export async function getMyOrderStatsAction(): Promise<
  CustomerOrderResult<CustomerOrderStats>
> {
  try {
    const auth = await requireCustomer();
    if ("error" in auth) return { error: auth.error };
    const { user } = auth;

    const where = ownershipWhere(user.id, user.email);

    const [totalOrders, pendingOrders, spent] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({
        where: {
          ...where,
          status: {
            in: [
              OrderStatus.PENDING,
              OrderStatus.PAID,
              OrderStatus.PROCESSING,
              OrderStatus.SHIPPED,
            ],
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          ...where,
          status: { not: OrderStatus.CANCELLED },
          paymentStatus: PaymentStatus.PAID,
        },
        _sum: { total: true },
      }),
    ]);

    return {
      data: {
        totalOrders,
        pendingOrders,
        totalSpent: Number(spent._sum.total ?? 0),
      },
    };
  } catch (error) {
    console.error("getMyOrderStatsAction:", error);
    return { error: "Could not load order stats." };
  }
}

export async function getMyOrderAction(
  orderNumber: string
): Promise<CustomerOrderResult<CustomerOrder>> {
  try {
    const auth = await requireCustomer();
    if ("error" in auth) return { error: auth.error };
    const { user } = auth;

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        ...ownershipWhere(user.id, user.email),
      },
      include: orderInclude,
    });

    if (!order) return { error: "Order not found." };

    if (!order.userId) {
      await prisma.order.update({
        where: { id: order.id },
        data: { userId: user.id },
      });
    }

    return { data: mapOrder(order) };
  } catch (error) {
    console.error("getMyOrderAction:", error);
    return { error: "Could not load this order." };
  }
}

export async function cancelMyOrderAction(
  orderNumber: string
): Promise<CustomerOrderResult<CustomerOrder>> {
  try {
    const auth = await requireCustomer();
    if ("error" in auth) return { error: auth.error };
    const { user } = auth;

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        ...ownershipWhere(user.id, user.email),
      },
      include: orderInclude,
    });

    if (!order) return { error: "Order not found." };

    const cancellable =
      order.status === OrderStatus.PENDING ||
      (order.status === OrderStatus.PAID &&
        order.paymentMethod !== PaymentMethod.COD);

    if (!cancellable) {
      return {
        error:
          "This order can no longer be cancelled. Contact support if you need help.",
      };
    }

    const updated = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (!item.productId) continue;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus:
            order.paymentStatus === PaymentStatus.UNPAID
              ? PaymentStatus.FAILED
              : order.paymentStatus,
          notes: order.notes
            ? `${order.notes}\n[Cancelled by customer]`
            : "[Cancelled by customer]",
        },
        include: orderInclude,
      });
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderNumber}`);
    revalidatePath("/dashboard");
    revalidatePath("/admin/orders");
    revalidatePath("/shop");

    return {
      data: mapOrder(updated),
      success: "Order cancelled successfully.",
    };
  } catch (error) {
    console.error("cancelMyOrderAction:", error);
    return { error: "Could not cancel this order." };
  }
}
