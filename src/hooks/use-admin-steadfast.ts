"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ADMIN_ORDERS_KEY, ADMIN_ORDER_STATS_KEY } from "@/hooks/use-admin-orders";
import {
  createSteadfastConsignmentAction,
  createSteadfastReturnForOrderAction,
  getSteadfastDashboardAction,
  syncAllOpenSteadfastStatusesAction,
  syncSteadfastStatusAction,
} from "@/lib/steadfast/actions";
import type { CreateSteadfastConsignmentInput } from "@/lib/steadfast/schemas";

export const ADMIN_STEADFAST_KEY = ["admin-steadfast"] as const;

export function useAdminSteadfastDashboard() {
  return useQuery({
    queryKey: ADMIN_STEADFAST_KEY,
    queryFn: async () => {
      const result = await getSteadfastDashboardAction();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    refetchInterval: 60_000,
  });
}

export function useSteadfastMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ADMIN_STEADFAST_KEY });
    void queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY });
    void queryClient.invalidateQueries({ queryKey: ADMIN_ORDER_STATS_KEY });
  };

  const createConsignment = useMutation({
    mutationFn: async (input: CreateSteadfastConsignmentInput) => {
      const result = await createSteadfastConsignmentAction(input);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: invalidate,
  });

  const syncStatus = useMutation({
    mutationFn: async (orderId: string) => {
      const result = await syncSteadfastStatusAction({
        orderId,
        syncOrderStatus: true,
      });
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: invalidate,
  });

  const createReturn = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      const result = await createSteadfastReturnForOrderAction({ orderId, reason });
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: invalidate,
  });

  const syncAllOpen = useMutation({
    mutationFn: async () => {
      const result = await syncAllOpenSteadfastStatusesAction();
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: invalidate,
  });

  return { createConsignment, syncStatus, createReturn, syncAllOpen };
}
