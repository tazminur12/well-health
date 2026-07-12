"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AdminCustomer } from "@/components/admin/customers-data";
import {
  createCustomerAction,
  deleteCustomerAction,
  getCustomerAction,
  listCustomersAction,
  setCustomerStatusAction,
  updateCustomerAction,
} from "@/lib/customers/actions";
import type { CreateCustomerInput, UpdateCustomerInput } from "@/lib/customers/schemas";

export const ADMIN_CUSTOMERS_KEY = ["admin-customers"] as const;

export function useAdminCustomers() {
  return useQuery({
    queryKey: ADMIN_CUSTOMERS_KEY,
    queryFn: async () => {
      const result = await listCustomersAction();
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useAdminCustomer(id?: string) {
  return useQuery({
    queryKey: [...ADMIN_CUSTOMERS_KEY, id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) return null;
      const result = await getCustomerAction(id);
      if (result.error) throw new Error(result.error);
      return result.data ?? null;
    },
  });
}

export function useCustomerMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ADMIN_CUSTOMERS_KEY });

  const createCustomer = useMutation({
    mutationFn: async (input: CreateCustomerInput) => {
      const result = await createCustomerAction(input);
      if (result.error) throw new Error(result.error);
      return result.data as AdminCustomer;
    },
    onSuccess: invalidate,
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateCustomerInput }) => {
      const result = await updateCustomerAction(id, input);
      if (result.error) throw new Error(result.error);
      return result.data as AdminCustomer;
    },
    onSuccess: invalidate,
  });

  const setStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "Active" | "Suspended";
    }) => {
      const result = await setCustomerStatusAction(id, status);
      if (result.error) throw new Error(result.error);
      return result.data as AdminCustomer;
    },
    onSuccess: invalidate,
  });

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCustomerAction(id);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: invalidate,
  });

  return { createCustomer, updateCustomer, setStatus, deleteCustomer };
}
