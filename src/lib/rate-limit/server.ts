import { headers } from "next/headers";

import { rateLimitError } from "@/lib/rate-limit";
import type { RateLimitScope } from "@/lib/rate-limit/config";

export async function getRequestClientIp() {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return headersList.get("x-real-ip") ?? "unknown";
}

export async function rateLimitForRequest(
  scope: RateLimitScope,
  suffix?: string
): Promise<{ error: string } | null> {
  const ip = await getRequestClientIp();
  return rateLimitError(scope, ip, suffix);
}
