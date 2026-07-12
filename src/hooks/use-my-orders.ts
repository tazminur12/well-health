"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelMyOrderAction,
  getMyOrderAction,
  getMyOrderStatsAction,
  listMyOrdersAction,
} from "@/lib/customer-orders/actions";

export const MY_ORDERS_KEY = ["my-orders"] as const;
export const MY_ORDER_STATS_KEY = ["my-order-stats"] as const;

export function useMyOrders() {
  return useQuery({
    queryKey: MY_ORDERS_KEY,
    queryFn: async () => {
      const result = await listMyOrdersAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useMyOrderStats() {
  return useQuery({
    queryKey: MY_ORDER_STATS_KEY,
    queryFn: async () => {
      const result = await getMyOrderStatsAction();
      if (result.error) throw new Error(result.error);
      return (
        result.data ?? {
          totalOrders: 0,
          pendingOrders: 0,
          totalSpent: 0,
        }
      );
    },
  });
}

export function useMyOrder(orderNumber: string | undefined) {
  return useQuery({
    queryKey: [...MY_ORDERS_KEY, orderNumber],
    enabled: Boolean(orderNumber),
    queryFn: async () => {
      const result = await getMyOrderAction(orderNumber!);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useMyOrderMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: MY_ORDERS_KEY });
    void queryClient.invalidateQueries({ queryKey: MY_ORDER_STATS_KEY });
  };

  const cancelOrder = useMutation({
    mutationFn: async (orderNumber: string) => {
      const result = await cancelMyOrderAction(orderNumber);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  return { cancelOrder };
}
