"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCouponAction,
  deleteCouponAction,
  listCouponsAction,
  toggleCouponActiveAction,
  updateCouponAction,
} from "@/lib/coupons/actions";
import type { CouponInput } from "@/lib/coupons/schemas";

export const ADMIN_COUPONS_KEY = ["admin-coupons"] as const;

export function useAdminCoupons() {
  return useQuery({
    queryKey: ADMIN_COUPONS_KEY,
    queryFn: async () => {
      const result = await listCouponsAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useCouponMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ADMIN_COUPONS_KEY });

  const createCoupon = useMutation({
    mutationFn: async (input: CouponInput) => {
      const result = await createCouponAction(input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const updateCoupon = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: CouponInput }) => {
      const result = await updateCouponAction(id, input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCouponAction(id);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  const toggleActive = useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleCouponActiveAction(id);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  return { createCoupon, updateCoupon, deleteCoupon, toggleActive };
}
