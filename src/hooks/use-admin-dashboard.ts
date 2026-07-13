"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getDashboardOverviewAction,
  type DashboardOverview,
} from "@/lib/dashboard/actions";

export const ADMIN_DASHBOARD_KEY = ["admin-dashboard"] as const;

export function useAdminDashboard(rangeDays: 7 | 30 = 30) {
  return useQuery({
    queryKey: [...ADMIN_DASHBOARD_KEY, rangeDays],
    queryFn: async (): Promise<DashboardOverview> => {
      const result = await getDashboardOverviewAction(rangeDays);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    staleTime: 30_000,
  });
}
