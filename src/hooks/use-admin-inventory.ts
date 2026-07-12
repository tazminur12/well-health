"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adjustInventoryStockAction,
  listInventoryAction,
  updateInventoryStockAction,
} from "@/lib/inventory/actions";
import type { AdjustStockInput, UpdateStockInput } from "@/lib/inventory/schemas";

export const ADMIN_INVENTORY_KEY = ["admin-inventory"] as const;

export function useAdminInventory() {
  return useQuery({
    queryKey: ADMIN_INVENTORY_KEY,
    queryFn: async () => {
      const result = await listInventoryAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useInventoryMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ADMIN_INVENTORY_KEY });

  const updateStock = useMutation({
    mutationFn: async (input: UpdateStockInput) => {
      const result = await updateInventoryStockAction(input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const adjustStock = useMutation({
    mutationFn: async (input: AdjustStockInput) => {
      const result = await adjustInventoryStockAction(input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  return { updateStock, adjustStock };
}
