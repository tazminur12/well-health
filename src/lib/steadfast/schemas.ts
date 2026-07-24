import { z } from "zod";

export const createSteadfastConsignmentSchema = z.object({
  orderId: z.string().min(1),
  /** Override COD amount. Omit to auto-calc (COD unpaid → total, else 0). */
  codAmount: z.number().min(0).max(1_000_000).optional(),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  deliveryType: z.union([z.literal(0), z.literal(1)]).optional().default(0),
  /** When true (default), mark order SHIPPED after successful create. */
  markShipped: z.boolean().optional().default(true),
});

export const syncSteadfastStatusSchema = z.object({
  orderId: z.string().min(1),
  /** When true (default), map delivered → DELIVERED on our order. */
  syncOrderStatus: z.boolean().optional().default(true),
});

export const createSteadfastReturnSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CreateSteadfastConsignmentInput = z.infer<
  typeof createSteadfastConsignmentSchema
>;
export type SyncSteadfastStatusInput = z.infer<typeof syncSteadfastStatusSchema>;
export type CreateSteadfastReturnInput = z.infer<typeof createSteadfastReturnSchema>;

export type SteadfastDashboardStats = {
  configured: boolean;
  baseUrl: string;
  balance: number | null;
  balanceError: string | null;
  latencyMs: number | null;
  consignmentsTotal: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  recent: SteadfastRecentConsignment[];
};

export type SteadfastRecentConsignment = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  trackingCode: string | null;
  consignmentId: number | null;
  steadfastStatus: string | null;
  orderStatus: string;
  codAmount: number | null;
  syncedAt: string | null;
  createdAt: string;
};
