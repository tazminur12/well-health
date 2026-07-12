"use client";

import { useQuery } from "@tanstack/react-query";

import { runApiHealthCheckAction } from "@/lib/health/actions";

export const ADMIN_API_HEALTH_KEY = ["admin-api-health"] as const;

export function useAdminApiHealth(enabled = true) {
  return useQuery({
    queryKey: ADMIN_API_HEALTH_KEY,
    enabled,
    queryFn: async () => {
      const result = await runApiHealthCheckAction();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
