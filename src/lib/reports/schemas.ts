import { z } from "zod";

export const REPORT_RANGES = ["7d", "30d", "90d", "ytd"] as const;

export const reportRangeSchema = z.enum(REPORT_RANGES);

export type ReportRange = z.infer<typeof reportRangeSchema>;

export type ReportKpis = {
  revenue: number;
  revenueDelta: number;
  orders: number;
  ordersDelta: number;
  aov: number;
  aovDelta: number;
  customers: number;
  customersDelta: number;
  paidOrderRate: number;
  paidOrderRateDelta: number;
  cancelRate: number;
  cancelRateDelta: number;
};

export type RevenuePoint = {
  label: string;
  revenue: number;
  orders: number;
};

export type StatusSlice = {
  name: string;
  value: number;
  color: string;
};

export type CategorySale = {
  name: string;
  sales: number;
};

export type PaymentSlice = {
  name: string;
  value: number;
  color: string;
};

export type RegionSale = {
  name: string;
  orders: number;
  revenue: number;
};

export type TopProductRow = {
  name: string;
  sku: string;
  sold: number;
  revenue: number;
  stock: number;
};

export type AdminReportsData = {
  range: ReportRange;
  kpis: ReportKpis;
  revenueSeries: RevenuePoint[];
  orderStatus: StatusSlice[];
  categorySales: CategorySale[];
  paymentMix: PaymentSlice[];
  regionSales: RegionSale[];
  topProducts: TopProductRow[];
};
