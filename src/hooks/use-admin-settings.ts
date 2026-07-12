"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getStoreSettingsAction,
  updateStoreSettingsAction,
} from "@/lib/settings/actions";
import type { StoreSettings } from "@/lib/settings/schemas";

export const ADMIN_SETTINGS_KEY = ["admin-settings"] as const;

export function useAdminStoreSettings() {
  return useQuery({
    queryKey: ADMIN_SETTINGS_KEY,
    queryFn: async () => {
      const result = await getStoreSettingsAction();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useStoreSettingsMutations() {
  const queryClient = useQueryClient();

  const updateSettings = useMutation({
    mutationFn: async (input: StoreSettings) => {
      const result = await updateStoreSettingsAction(input);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY });
    },
  });

  return { updateSettings };
}
