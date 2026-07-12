"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getPaymentOverviewAction,
  getPaymentSettingsAction,
  updatePaymentSettingsAction,
} from "@/lib/payments/actions";
import type { PaymentSettings } from "@/lib/payments/schemas";
import { updateOrderPaymentAction } from "@/lib/orders/actions";
import type { PaymentStatusValue } from "@/lib/orders/schemas";

export const ADMIN_PAYMENTS_KEY = ["admin-payments"] as const;
export const ADMIN_PAYMENT_SETTINGS_KEY = ["admin-payment-settings"] as const;

export function useAdminPaymentOverview() {
  return useQuery({
    queryKey: ADMIN_PAYMENTS_KEY,
    queryFn: async () => {
      const result = await getPaymentOverviewAction();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useAdminPaymentSettings() {
  return useQuery({
    queryKey: ADMIN_PAYMENT_SETTINGS_KEY,
    queryFn: async () => {
      const result = await getPaymentSettingsAction();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function usePaymentMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ADMIN_PAYMENTS_KEY });
    void queryClient.invalidateQueries({ queryKey: ADMIN_PAYMENT_SETTINGS_KEY });
    void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-order-stats"] });
  };

  const updateSettings = useMutation({
    mutationFn: async (input: PaymentSettings) => {
      const result = await updatePaymentSettingsAction(input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const updateOrderPayment = useMutation({
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

  return { updateSettings, updateOrderPayment };
}
