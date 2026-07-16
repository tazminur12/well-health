import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import {
  RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
  type RateLimitScope,
} from "@/lib/rate-limit/config";

type Duration = `${number} ms` | `${number} s` | `${number} m` | `${number} h` | `${number} d`;

type MemoryBucket = {
  count: number;
  resetAt: number;
};

const memoryBuckets = new Map<string, MemoryBucket>();
const upstashLimiters = new Map<RateLimitScope, Ratelimit>();

function hasUpstashConfig() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function getUpstashRedis() {
  if (!hasUpstashConfig()) return null;
  return Redis.fromEnv();
}

function parseWindowToMs(window: string) {
  const match = window.trim().match(/^(\d+)\s*(ms|s|m|h|d)$/);
  if (!match) return 60_000;

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "ms":
      return value;
    case "s":
      return value * 1_000;
    case "m":
      return value * 60_000;
    case "h":
      return value * 3_600_000;
    case "d":
      return value * 86_400_000;
    default:
      return 60_000;
  }
}

function getUpstashLimiter(scope: RateLimitScope) {
  const cached = upstashLimiters.get(scope);
  if (cached) return cached;

  const redis = getUpstashRedis();
  if (!redis) return null;

  const { limit, window } = RATE_LIMITS[scope];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window as Duration),
    prefix: `wht:${scope}`,
    analytics: true,
  });

  upstashLimiters.set(scope, limiter);
  return limiter;
}

function memoryRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { limited: true };
  }

  return { limited: false };
}

function buildRateLimitKey(scope: RateLimitScope, identifier: string, suffix?: string) {
  const normalizedSuffix = suffix?.trim().toLowerCase();
  return normalizedSuffix ? `${scope}:${identifier}:${normalizedSuffix}` : `${scope}:${identifier}`;
}

export function getClientIpFromRequest(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function checkRateLimit(
  scope: RateLimitScope,
  identifier: string,
  suffix?: string
) {
  const key = buildRateLimitKey(scope, identifier, suffix);
  const { limit, window } = RATE_LIMITS[scope];
  const upstashLimiter = getUpstashLimiter(scope);

  if (upstashLimiter) {
    const result = await upstashLimiter.limit(key);
    return {
      limited: !result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  const memoryResult = memoryRateLimit(key, limit, parseWindowToMs(window));
  return {
    limited: memoryResult.limited,
    remaining: null,
    reset: null,
  };
}

export async function rateLimitError(
  scope: RateLimitScope,
  identifier: string,
  suffix?: string
): Promise<{ error: string } | null> {
  const result = await checkRateLimit(scope, identifier, suffix);
  if (result.limited) {
    return { error: RATE_LIMIT_MESSAGE };
  }
  return null;
}

export async function rateLimitErrorFromRequest(
  request: NextRequest,
  scope: RateLimitScope,
  suffix?: string
): Promise<{ error: string } | null> {
  const identifier = getClientIpFromRequest(request);
  return rateLimitError(scope, identifier, suffix);
}

export function isRateLimitBackendDistributed() {
  return hasUpstashConfig();
}
