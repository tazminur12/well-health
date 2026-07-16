"use server";

import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Role,
} from "@prisma/client";

import { AdminAuthError, requireAdminPermission } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";

import {
  reportRangeSchema,
  type AdminReportsData,
  type CategorySale,
  type PaymentSlice,
  type RegionSale,
  type ReportKpis,
  type ReportRange,
  type RevenuePoint,
  type StatusSlice,
  type TopProductRow,
} from "./schemas";

export type ReportsActionResult = {
  error?: string;
  data?: AdminReportsData;
};

const STATUS_META: Record<OrderStatus, { name: string; color: string }> = {
  PENDING: { name: "Pending", color: "#D97706" },
  PAID: { name: "Paid", color: "#2563EB" },
  PROCESSING: { name: "Processing", color: "#7C3AED" },
  SHIPPED: { name: "Shipped", color: "#4F46E5" },
  DELIVERED: { name: "Delivered", color: "#16875D" },
  CANCELLED: { name: "Cancelled", color: "#DC2626" },
};

const PAYMENT_META: Record<PaymentMethod, { name: string; color: string }> = {
  COD: { name: "COD", color: "#C9A24B" },
  SSLCOMMERZ: { name: "SSLCommerz", color: "#16875D" },
  BKASH: { name: "bKash", color: "#E11D48" },
};

type PeriodBounds = {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
};

type OrderRow = {
  id: string;
  total: unknown;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingZoneName: string | null;
  shippingDistrict: string;
  createdAt: Date;
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function getPeriodBounds(range: ReportRange): PeriodBounds {
  const end = endOfDay(new Date());

  if (range === "7d") {
    const start = startOfDay(new Date(end));
    start.setDate(start.getDate() - 6);
    const prevEnd = endOfDay(new Date(start));
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = startOfDay(new Date(prevEnd));
    prevStart.setDate(prevStart.getDate() - 6);
    return { start, end, prevStart, prevEnd };
  }

  if (range === "30d") {
    const start = startOfDay(new Date(end));
    start.setDate(start.getDate() - 29);
    const prevEnd = endOfDay(new Date(start));
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = startOfDay(new Date(prevEnd));
    prevStart.setDate(prevStart.getDate() - 29);
    return { start, end, prevStart, prevEnd };
  }

  if (range === "90d") {
    const start = startOfDay(new Date(end));
    start.setDate(start.getDate() - 89);
    const prevEnd = endOfDay(new Date(start));
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = startOfDay(new Date(prevEnd));
    prevStart.setDate(prevStart.getDate() - 89);
    return { start, end, prevStart, prevEnd };
  }

  const start = startOfDay(new Date(end.getFullYear(), 0, 1));
  const prevStart = startOfDay(new Date(end.getFullYear() - 1, 0, 1));
  const prevEnd = endOfDay(
    new Date(end.getFullYear() - 1, end.getMonth(), end.getDate())
  );
  return { start, end, prevStart, prevEnd };
}

function pctDelta(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function isCountableOrder(status: OrderStatus) {
  return status !== OrderStatus.CANCELLED;
}

function sumRevenue(orders: OrderRow[]) {
  return orders
    .filter((order) => isCountableOrder(order.status))
    .reduce((sum, order) => sum + Number(order.total), 0);
}

function countOrders(orders: OrderRow[]) {
  return orders.filter((order) => isCountableOrder(order.status)).length;
}

function averageOrderValue(revenue: number, orders: number) {
  if (orders === 0) return 0;
  return Math.round(revenue / orders);
}

function paidOrderRate(orders: OrderRow[]) {
  const active = orders.filter((order) => isCountableOrder(order.status));
  if (active.length === 0) return 0;
  const paid = active.filter((order) => order.paymentStatus === PaymentStatus.PAID).length;
  return Math.round((paid / active.length) * 1000) / 10;
}

function cancelRate(orders: OrderRow[]) {
  if (orders.length === 0) return 0;
  const cancelled = orders.filter((order) => order.status === OrderStatus.CANCELLED).length;
  return Math.round((cancelled / orders.length) * 1000) / 10;
}

async function countNewCustomers(start: Date, end: Date) {
  return prisma.user.count({
    where: {
      role: Role.CUSTOMER,
      createdAt: { gte: start, lte: end },
    },
  });
}

function buildKpis(current: OrderRow[], previous: OrderRow[]): ReportKpis {
  return {
    revenue: sumRevenue(current),
    revenueDelta: pctDelta(sumRevenue(current), sumRevenue(previous)),
    orders: countOrders(current),
    ordersDelta: pctDelta(countOrders(current), countOrders(previous)),
    aov: averageOrderValue(sumRevenue(current), countOrders(current)),
    aovDelta: pctDelta(
      averageOrderValue(sumRevenue(current), countOrders(current)),
      averageOrderValue(sumRevenue(previous), countOrders(previous))
    ),
    customers: 0,
    customersDelta: 0,
    paidOrderRate: paidOrderRate(current),
    paidOrderRateDelta: pctDelta(paidOrderRate(current), paidOrderRate(previous)),
    cancelRate: cancelRate(current),
    cancelRateDelta: pctDelta(cancelRate(current), cancelRate(previous)),
  };
}

async function buildKpisWithCustomers(
  current: OrderRow[],
  previous: OrderRow[],
  range: ReportRange
): Promise<ReportKpis> {
  const bounds = getPeriodBounds(range);
  const [customers, prevCustomers] = await Promise.all([
    countNewCustomers(bounds.start, bounds.end),
    countNewCustomers(bounds.prevStart, bounds.prevEnd),
  ]);

  const base = buildKpis(current, previous);
  return {
    ...base,
    customers,
    customersDelta: pctDelta(customers, prevCustomers),
  };
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function weekStart(date: Date) {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? 6 : day - 1;
  next.setDate(next.getDate() - diff);
  return next;
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function buildRevenueSeries(orders: OrderRow[], range: ReportRange): RevenuePoint[] {
  const bounds = getPeriodBounds(range);
  const active = orders.filter((order) => isCountableOrder(order.status));

  if (range === "7d" || range === "30d") {
    const days = range === "7d" ? 7 : 30;
    const buckets = new Map<string, RevenuePoint>();

    for (let i = 0; i < days; i += 1) {
      const date = startOfDay(new Date(bounds.start));
      date.setDate(date.getDate() + i);
      const key = dayKey(date);
      buckets.set(key, {
        label: range === "7d" ? formatDayLabel(date) : `${date.getDate()}`,
        revenue: 0,
        orders: 0,
      });
    }

    for (const order of active) {
      const key = dayKey(order.createdAt);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.revenue += Number(order.total);
      bucket.orders += 1;
    }

    return Array.from(buckets.values());
  }

  if (range === "90d") {
    const weekBuckets: Array<{ key: string; label: string; start: Date; end: Date; revenue: number; orders: number }> = [];
    let cursor = weekStart(bounds.start);
    let weekIndex = 1;

    while (cursor <= bounds.end) {
      const weekEnd = endOfDay(new Date(cursor));
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekBuckets.push({
        key: dayKey(cursor),
        label: `W${weekIndex}`,
        start: new Date(cursor),
        end: weekEnd > bounds.end ? bounds.end : weekEnd,
        revenue: 0,
        orders: 0,
      });
      weekIndex += 1;
      cursor = startOfDay(new Date(cursor));
      cursor.setDate(cursor.getDate() + 7);
    }

    for (const order of active) {
      const bucket = weekBuckets.find(
        (item) => order.createdAt >= item.start && order.createdAt <= item.end
      );
      if (!bucket) continue;
      bucket.revenue += Number(order.total);
      bucket.orders += 1;
    }

    return weekBuckets.map(({ label, revenue, orders }) => ({ label, revenue, orders }));
  }

  const buckets = new Map<string, RevenuePoint>();
  const cursor = new Date(bounds.start.getFullYear(), bounds.start.getMonth(), 1);
  const endMonth = bounds.end.getMonth();

  while (cursor.getMonth() <= endMonth && cursor.getFullYear() === bounds.end.getFullYear()) {
    buckets.set(monthKey(cursor), {
      label: formatMonthLabel(cursor),
      revenue: 0,
      orders: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const order of active) {
    const key = monthKey(order.createdAt);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.revenue += Number(order.total);
    bucket.orders += 1;
  }

  return Array.from(buckets.values());
}

function buildOrderStatusSlices(orders: OrderRow[]): StatusSlice[] {
  const counts = new Map<OrderStatus, number>();
  for (const order of orders) {
    counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
  }

  return (Object.keys(STATUS_META) as OrderStatus[])
    .map((status) => ({
      name: STATUS_META[status].name,
      value: counts.get(status) ?? 0,
      color: STATUS_META[status].color,
    }))
    .filter((item) => item.value > 0);
}

function buildPaymentMix(orders: OrderRow[]): PaymentSlice[] {
  const active = orders.filter((order) => isCountableOrder(order.status));
  if (active.length === 0) {
    return (Object.keys(PAYMENT_META) as PaymentMethod[]).map((method) => ({
      name: PAYMENT_META[method].name,
      value: 0,
      color: PAYMENT_META[method].color,
    }));
  }

  const counts = new Map<PaymentMethod, number>();
  for (const order of active) {
    counts.set(order.paymentMethod, (counts.get(order.paymentMethod) ?? 0) + 1);
  }

  return (Object.keys(PAYMENT_META) as PaymentMethod[]).map((method) => ({
    name: PAYMENT_META[method].name,
    value: Math.round(((counts.get(method) ?? 0) / active.length) * 100),
    color: PAYMENT_META[method].color,
  }));
}

function buildRegionSales(orders: OrderRow[]): RegionSale[] {
  const active = orders.filter((order) => isCountableOrder(order.status));
  const map = new Map<string, RegionSale>();

  for (const order of active) {
    const name = order.shippingZoneName?.trim() || order.shippingDistrict || "Other";
    const current = map.get(name) ?? { name, orders: 0, revenue: 0 };
    current.orders += 1;
    current.revenue += Number(order.total);
    map.set(name, current);
  }

  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
}

async function buildCategorySales(start: Date, end: Date): Promise<CategorySale[]> {
  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: { gte: start, lte: end },
        status: { not: OrderStatus.CANCELLED },
      },
    },
    select: {
      lineTotal: true,
      product: {
        select: {
          category: { select: { name: true } },
        },
      },
    },
  });

  const map = new Map<string, number>();
  for (const item of items) {
    const name = item.product?.category.name ?? "Uncategorized";
    map.set(name, (map.get(name) ?? 0) + Number(item.lineTotal));
  }

  return Array.from(map.entries())
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 8);
}

async function buildTopProducts(start: Date, end: Date): Promise<TopProductRow[]> {
  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: { gte: start, lte: end },
        status: { not: OrderStatus.CANCELLED },
      },
    },
    select: {
      quantity: true,
      lineTotal: true,
      productName: true,
      productSlug: true,
      product: {
        select: {
          sku: true,
          stock: true,
        },
      },
    },
  });

  const map = new Map<
    string,
    { name: string; sku: string; sold: number; revenue: number; stock: number }
  >();

  for (const item of items) {
    const key = item.productSlug || item.productName;
    const current = map.get(key) ?? {
      name: item.productName,
      sku: item.product?.sku ?? item.productSlug.toUpperCase(),
      sold: 0,
      revenue: 0,
      stock: item.product?.stock ?? 0,
    };
    current.sold += item.quantity;
    current.revenue += Number(item.lineTotal);
    current.stock = item.product?.stock ?? current.stock;
    map.set(key, current);
  }

  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);
}

async function fetchOrdersBetween(start: Date, end: Date): Promise<OrderRow[]> {
  return prisma.order.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: {
      id: true,
      total: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      shippingZoneName: true,
      shippingDistrict: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getAdminReportsAction(
  input: unknown
): Promise<ReportsActionResult> {
  try {
    await requireAdminPermission("reports");

    const parsed = reportRangeSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid report range." };
    }

    const range = parsed.data;
    const bounds = getPeriodBounds(range);

    const [currentOrders, previousOrders, pipelineOrders, categorySales, topProducts] =
      await Promise.all([
        fetchOrdersBetween(bounds.start, bounds.end),
        fetchOrdersBetween(bounds.prevStart, bounds.prevEnd),
        prisma.order.findMany({
          select: {
            id: true,
            total: true,
            status: true,
            paymentStatus: true,
            paymentMethod: true,
            shippingZoneName: true,
            shippingDistrict: true,
            createdAt: true,
          },
        }),
        buildCategorySales(bounds.start, bounds.end),
        buildTopProducts(bounds.start, bounds.end),
      ]);

    const kpis = await buildKpisWithCustomers(currentOrders, previousOrders, range);

    return {
      data: {
        range,
        kpis,
        revenueSeries: buildRevenueSeries(currentOrders, range),
        orderStatus: buildOrderStatusSlices(pipelineOrders),
        categorySales,
        paymentMix: buildPaymentMix(currentOrders),
        regionSales: buildRegionSales(currentOrders),
        topProducts,
      },
    };
  } catch (error) {
    if (
      error instanceof AdminAuthError ||
      (error instanceof Error && error.name === "AdminAuthError")
    ) {
      return { error: error instanceof Error ? error.message : "Unauthorized" };
    }
    console.error("getAdminReportsAction:", error);
    return { error: "Failed to load reports." };
  }
}
