"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createUnitAction,
  deleteUnitAction,
  listActiveUnitsAction,
  listUnitsAction,
  reorderUnitAction,
  toggleUnitActiveAction,
  updateUnitAction,
} from "@/lib/units/actions";
import type { UnitInput } from "@/lib/units/schemas";

export const ADMIN_UNITS_KEY = ["admin-units"] as const;
export const ADMIN_ACTIVE_UNITS_KEY = ["admin-active-units"] as const;

export function useAdminUnits() {
  return useQuery({
    queryKey: ADMIN_UNITS_KEY,
    queryFn: async () => {
      const result = await listUnitsAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useActiveUnits() {
  return useQuery({
    queryKey: ADMIN_ACTIVE_UNITS_KEY,
    queryFn: async () => {
      const result = await listActiveUnitsAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useUnitMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ADMIN_UNITS_KEY });
    void queryClient.invalidateQueries({ queryKey: ADMIN_ACTIVE_UNITS_KEY });
  };

  const createUnit = useMutation({
    mutationFn: async (input: UnitInput) => {
      const result = await createUnitAction(input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const updateUnit = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UnitInput }) => {
      const result = await updateUnitAction(id, input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const deleteUnit = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteUnitAction(id);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  const toggleActive = useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleUnitActiveAction(id);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const reorder = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const result = await reorderUnitAction(id, direction);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  return { createUnit, updateUnit, deleteUnit, toggleActive, reorder };
}
