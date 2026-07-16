"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createDistributorApplicationAction,
  deleteDistributorApplicationAction,
  getDistributorApplicationsUnreadCountAction,
  listDistributorApplicationsAction,
  markDistributorApplicationReviewingAction,
  updateDistributorApplicationAction,
} from "@/lib/distributors/actions";
import type {
  CreateDistributorApplicationInput,
  DistributorApplicationFilter,
  UpdateDistributorApplicationInput,
} from "@/lib/distributors/schemas";

export const ADMIN_DISTRIBUTORS_KEY = ["admin-distributors"] as const;
export const ADMIN_DISTRIBUTORS_UNREAD_KEY = ["admin-distributors-unread"] as const;

export function useAdminDistributors(filter: DistributorApplicationFilter = "all") {
  return useQuery({
    queryKey: [...ADMIN_DISTRIBUTORS_KEY, filter],
    queryFn: async () => {
      const result = await listDistributorApplicationsAction({ filter });
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useAdminDistributorsUnreadCount(enabled = true) {
  return useQuery({
    queryKey: ADMIN_DISTRIBUTORS_UNREAD_KEY,
    enabled,
    queryFn: async () => {
      const result = await getDistributorApplicationsUnreadCountAction();
      if (result.error) throw new Error(result.error);
      return result.data?.newCount ?? 0;
    },
    refetchInterval: 30_000,
  });
}

export function useDistributorMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ADMIN_DISTRIBUTORS_KEY });
    void queryClient.invalidateQueries({ queryKey: ADMIN_DISTRIBUTORS_UNREAD_KEY });
  };

  const createApplication = useMutation({
    mutationFn: async (input: CreateDistributorApplicationInput) => {
      const result = await createDistributorApplicationAction(input);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: invalidate,
  });

  const updateApplication = useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateDistributorApplicationInput;
    }) => {
      const result = await updateDistributorApplicationAction(id, input);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: invalidate,
  });

  const markReviewing = useMutation({
    mutationFn: async (id: string) => {
      const result = await markDistributorApplicationReviewingAction(id);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: invalidate,
  });

  const deleteApplication = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteDistributorApplicationAction(id);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: invalidate,
  });

  return { createApplication, updateApplication, markReviewing, deleteApplication };
}
