"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminReportsAction } from "@/lib/reports/actions";
import type { ReportRange } from "@/lib/reports/schemas";

export const ADMIN_REPORTS_KEY = ["admin-reports"] as const;

export function useAdminReports(range: ReportRange) {
  return useQuery({
    queryKey: [...ADMIN_REPORTS_KEY, range],
    queryFn: async () => {
      const result = await getAdminReportsAction(range);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}
