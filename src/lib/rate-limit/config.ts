export const RATE_LIMITS = {
  "auth:login": { limit: 10, window: "15 m" },
  "auth:register": { limit: 5, window: "1 h" },
  "auth:forgot-password": { limit: 5, window: "1 h" },
  "auth:reset-password": { limit: 10, window: "1 h" },
  "auth:change-password": { limit: 5, window: "1 h" },
  "auth:invite-token": { limit: 30, window: "15 m" },
  "auth:invite-accept": { limit: 10, window: "1 h" },
  "form:contact": { limit: 5, window: "1 h" },
  "form:distributor": { limit: 3, window: "1 h" },
  "checkout:place-order": { limit: 15, window: "1 h" },
  "checkout:coupon": { limit: 30, window: "15 m" },
  "checkout:order-lookup": { limit: 20, window: "15 m" },
} as const;

export type RateLimitScope = keyof typeof RATE_LIMITS;

export const RATE_LIMIT_MESSAGE =
  "Too many requests. Please wait a few minutes and try again.";
