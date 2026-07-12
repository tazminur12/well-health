"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createMarketingCampaignAction,
  deleteMarketingCampaignAction,
  getMarketingMetaAction,
  listMarketingCampaignsAction,
  sendMarketingCampaignAction,
  updateMarketingCampaignAction,
} from "@/lib/marketing/actions";
import type {
  MarketingCampaignInput,
  MarketingChannel,
} from "@/lib/marketing/schemas";

export const ADMIN_MARKETING_KEY = ["admin-marketing"] as const;
export const ADMIN_MARKETING_META_KEY = ["admin-marketing-meta"] as const;

export function useAdminMarketingCampaigns(channel?: MarketingChannel) {
  return useQuery({
    queryKey: [...ADMIN_MARKETING_KEY, channel ?? "all"],
    queryFn: async () => {
      const result = await listMarketingCampaignsAction(channel);
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useAdminMarketingMeta() {
  return useQuery({
    queryKey: ADMIN_MARKETING_META_KEY,
    queryFn: async () => {
      const result = await getMarketingMetaAction();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useMarketingMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ADMIN_MARKETING_KEY });
    void queryClient.invalidateQueries({ queryKey: ADMIN_MARKETING_META_KEY });
  };

  const createCampaign = useMutation({
    mutationFn: async (input: MarketingCampaignInput) => {
      const result = await createMarketingCampaignAction(input);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: invalidate,
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: MarketingCampaignInput }) => {
      const result = await updateMarketingCampaignAction(id, input);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: invalidate,
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteMarketingCampaignAction(id);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: invalidate,
  });

  const sendCampaign = useMutation({
    mutationFn: async (id: string) => {
      const result = await sendMarketingCampaignAction(id);
      if (result.error && !result.data) throw new Error(result.error);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: invalidate,
  });

  return { createCampaign, updateCampaign, deleteCampaign, sendCampaign };
}
