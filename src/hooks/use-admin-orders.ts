"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAdminOrderAction,
  getOrderAction,
  getOrderStatsAction,
  listOrdersAction,
  updateOrderNotesAction,
  updateOrderPaymentAction,
  updateOrderStatusAction,
} from "@/lib/orders/actions";
import type {
  AdminCreateOrderInput,
  PaymentStatusValue,
  OrderStatusValue,
} from "@/lib/orders/schemas";

export const ADMIN_ORDERS_KEY = ["admin-orders"] as const;
export const ADMIN_ORDER_STATS_KEY = ["admin-order-stats"] as const;

export function useAdminOrders() {
  return useQuery({
    queryKey: ADMIN_ORDERS_KEY,
    queryFn: async () => {
      const result = await listOrdersAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useAdminOrderStats() {
  return useQuery({
    queryKey: ADMIN_ORDER_STATS_KEY,
    queryFn: async () => {
      const result = await getOrderStatsAction();
      if (result.error) throw new Error(result.error);
      return (
        result.data ?? {
          total: 0,
          pending: 0,
          paid: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          revenue: 0,
        }
      );
    },
  });
}

export function useAdminOrder(id: string | undefined) {
  return useQuery({
    queryKey: [...ADMIN_ORDERS_KEY, id],
    enabled: Boolean(id),
    queryFn: async () => {
      const result = await getOrderAction(id!);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useOrderMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY });
    void queryClient.invalidateQueries({ queryKey: ADMIN_ORDER_STATS_KEY });
    void queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
  };

  const createOrder = useMutation({
    mutationFn: async (input: AdminCreateOrderInput) => {
      const result = await createAdminOrderAction(input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatusValue }) => {
      const result = await updateOrderStatusAction(id, { status });
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const updatePayment = useMutation({
    mutationFn: async ({
      id,
      paymentStatus,
    }: {
      id: string;
      paymentStatus: PaymentStatusValue;
    }) => {
      const result = await updateOrderPaymentAction(id, { paymentStatus });
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const updateNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const result = await updateOrderNotesAction(id, { notes });
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  return { createOrder, updateStatus, updatePayment, updateNotes };
}
