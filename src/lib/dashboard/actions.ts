"use server";

import {
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  ReviewStatus,
  Role,
  UserStatus,
} from "@prisma/client";

import { AdminAuthError, requireAdminPermission } from "@/lib/admin/require-admin";
import {
  ORDER_STATUS_LABELS,
  type OrderStatusValue,
} from "@/lib/orders/schemas";
import { prisma } from "@/lib/prisma";

export type DashboardActionResult<T = undefined> = {
  error?: string;
  data?: T;
};

export type DashboardKpis = {
  revenue: number;
  revenuePrev: number;
  revenueDeltaPct: number | null;
  orders: number;
  ordersPrev: number;
  ordersDeltaPct: number | null;
  customers: number;
  customersPrev: number;
  customersDeltaPct: number | null;
  aov: number;
  lowStock: number;
  pendingOrders: number;
  processingOrders: number;
  unpaidOrders: number;
  unreadMessages: number;
  newDistributorApplications: number;
  pendingReviews: number;
  activeProducts: number;
};

export type DashboardSeriesPoint = {
  date: string;
  label: string;
  revenue: number;
  orders: number;
};

export type DashboardStatusSlice = {
  status: OrderStatusValue;
  label: string;
  count: number;
};

export type DashboardRecentOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: OrderStatusValue;
  paymentStatus: "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
};

export type DashboardLowStockItem = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  imageUrl: string | null;
};

export type DashboardTopProduct = {
  productName: string;
  quantity: number;
  revenue: number;
};

export type DashboardOverview = {
  generatedAt: string;
  rangeDays: number;
  kpis: DashboardKpis;
  revenueSeries: DashboardSeriesPoint[];
  statusBreakdown: DashboardStatusSlice[];
  recentOrders: DashboardRecentOrder[];
  lowStockProducts: DashboardLowStockItem[];
  topProducts: DashboardTopProduct[];
};

function handleError<T = undefined>(error: unknown): DashboardActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  console.error("Dashboard action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function pctDelta(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const paidRevenueWhere = {
  paymentStatus: PaymentStatus.PAID,
  status: { not: OrderStatus.CANCELLED },
} as const;

export async function getDashboardOverviewAction(
  rangeDays: 7 | 30 = 30
): Promise<DashboardActionResult<DashboardOverview>> {
  try {
    await requireAdminPermission("dashboard");

    const now = new Date();
    const currentStart = startOfDay(addDays(now, -(rangeDays - 1)));
    const previousStart = startOfDay(addDays(currentStart, -rangeDays));
    const previousEnd = currentStart;

    const [
      revenueCurrent,
      revenuePrevious,
      ordersCurrent,
      ordersPrevious,
      customersCurrent,
      customersPrevious,
      customersTotal,
      statusGrouped,
      unpaidOrders,
      unreadMessages,
      newDistributorApplications,
      pendingReviews,
      activeProducts,
      lowStockCountRows,
      seriesOrders,
      recentOrderRows,
      lowStockRows,
      topItemRows,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          ...paidRevenueWhere,
          createdAt: { gte: currentStart },
        },
        _sum: { total: true },
        _count: { _all: true },
      }),
      prisma.order.aggregate({
        where: {
          ...paidRevenueWhere,
          createdAt: { gte: previousStart, lt: previousEnd },
        },
        _sum: { total: true },
        _count: { _all: true },
      }),
      prisma.order.count({
        where: {
          status: { not: OrderStatus.CANCELLED },
          createdAt: { gte: currentStart },
        },
      }),
      prisma.order.count({
        where: {
          status: { not: OrderStatus.CANCELLED },
          createdAt: { gte: previousStart, lt: previousEnd },
        },
      }),
      prisma.user.count({
        where: {
          role: Role.CUSTOMER,
          createdAt: { gte: currentStart },
        },
      }),
      prisma.user.count({
        where: {
          role: Role.CUSTOMER,
          createdAt: { gte: previousStart, lt: previousEnd },
        },
      }),
      prisma.user.count({
        where: { role: Role.CUSTOMER, status: UserStatus.ACTIVE },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.order.count({
        where: {
          paymentStatus: PaymentStatus.UNPAID,
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.DELIVERED] },
        },
      }),
      prisma.contactMessage.count({ where: { status: "NEW" } }),
      prisma.distributorApplication.count({ where: { status: "NEW" } }),
      prisma.productReview.count({ where: { status: ReviewStatus.PENDING } }),
      prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
      prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*)::int AS count
        FROM products
        WHERE status <> 'ARCHIVED'
          AND stock <= low_stock_threshold
      `,
      prisma.order.findMany({
        where: {
          status: { not: OrderStatus.CANCELLED },
          createdAt: { gte: currentStart },
        },
        select: {
          createdAt: true,
          total: true,
          paymentStatus: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          total: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
      prisma.product.findMany({
        where: { status: { not: ProductStatus.ARCHIVED } },
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          lowStockThreshold: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
            select: { url: true },
          },
        },
        orderBy: { stock: "asc" },
        take: 40,
      }),
      prisma.orderItem.groupBy({
        by: ["productName"],
        where: {
          order: {
            status: { not: OrderStatus.CANCELLED },
            createdAt: { gte: currentStart },
          },
        },
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    const lowStockProducts = lowStockRows
      .filter((p) => p.stock <= p.lowStockThreshold)
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        imageUrl: p.images[0]?.url ?? null,
      }));

    const lowStock = Number(lowStockCountRows[0]?.count ?? lowStockProducts.length);

    const revenue = Number(revenueCurrent._sum.total ?? 0);
    const revenuePrev = Number(revenuePrevious._sum.total ?? 0);
    const paidOrderCount = revenueCurrent._count._all;
    const aov = paidOrderCount > 0 ? revenue / paidOrderCount : 0;

    const statusMap = Object.fromEntries(
      statusGrouped.map((row) => [row.status, row._count._all])
    ) as Partial<Record<OrderStatus, number>>;

    const statusBreakdown: DashboardStatusSlice[] = (
      Object.keys(ORDER_STATUS_LABELS) as OrderStatusValue[]
    ).map((status) => ({
      status,
      label: ORDER_STATUS_LABELS[status],
      count: statusMap[status] ?? 0,
    }));

    const dayBuckets = new Map<string, { revenue: number; orders: number }>();
    for (let i = 0; i < rangeDays; i += 1) {
      const key = toDateKey(addDays(currentStart, i));
      dayBuckets.set(key, { revenue: 0, orders: 0 });
    }
    for (const order of seriesOrders) {
      const key = toDateKey(order.createdAt);
      const bucket = dayBuckets.get(key);
      if (!bucket) continue;
      bucket.orders += 1;
      if (order.paymentStatus === PaymentStatus.PAID) {
        bucket.revenue += Number(order.total);
      }
    }

    const revenueSeries: DashboardSeriesPoint[] = Array.from(dayBuckets.entries()).map(
      ([date, bucket]) => ({
        date,
        label: formatDayLabel(date),
        revenue: Number(bucket.revenue.toFixed(2)),
        orders: bucket.orders,
      })
    );

    return {
      data: {
        generatedAt: now.toISOString(),
        rangeDays,
        kpis: {
          revenue,
          revenuePrev,
          revenueDeltaPct: pctDelta(revenue, revenuePrev),
          orders: ordersCurrent,
          ordersPrev: ordersPrevious,
          ordersDeltaPct: pctDelta(ordersCurrent, ordersPrevious),
          customers: customersTotal,
          customersPrev: customersPrevious,
          customersDeltaPct: pctDelta(customersCurrent, customersPrevious),
          aov: Number(aov.toFixed(2)),
          lowStock,
          pendingOrders: statusMap.PENDING ?? 0,
          processingOrders: statusMap.PROCESSING ?? 0,
          unpaidOrders,
          unreadMessages,
          newDistributorApplications,
          pendingReviews,
          activeProducts,
        },
        revenueSeries,
        statusBreakdown,
        recentOrders: recentOrderRows.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          total: Number(order.total),
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt.toISOString(),
        })),
        lowStockProducts,
        topProducts: topItemRows.map((row) => ({
          productName: row.productName,
          quantity: row._sum.quantity ?? 0,
          revenue: Number(row._sum.lineTotal ?? 0),
        })),
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
