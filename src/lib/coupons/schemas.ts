import { z } from "zod";

export const couponTypeSchema = z.enum(["PERCENT", "FIXED"]);
export type CouponTypeValue = z.infer<typeof couponTypeSchema>;

export const couponLifecycleSchema = z.enum([
  "ACTIVE",
  "SCHEDULED",
  "EXPIRED",
  "DISABLED",
]);
export type CouponLifecycle = z.infer<typeof couponLifecycleSchema>;

export const couponInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters")
      .max(32, "Code is too long")
      .regex(/^[A-Z0-9_-]+$/i, "Use letters, numbers, hyphen or underscore"),
    name: z.string().trim().min(2, "Name is required").max(80),
    description: z.string().trim().max(240).optional().or(z.literal("")),
    type: couponTypeSchema,
    value: z.number().positive("Value must be greater than 0"),
    minOrderAmount: z.number().min(0).optional().nullable(),
    maxDiscount: z.number().min(0).optional().nullable(),
    usageLimit: z.number().int().min(1).optional().nullable(),
    perCustomerLimit: z.number().int().min(1).optional().nullable(),
    startsAt: z.string().optional().nullable().or(z.literal("")),
    endsAt: z.string().optional().nullable().or(z.literal("")),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.type === "PERCENT" && data.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Percent discount cannot exceed 100%",
        path: ["value"],
      });
    }
    if (data.startsAt && data.endsAt) {
      const start = new Date(data.startsAt).getTime();
      const end = new Date(data.endsAt).getTime();
      if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date must be after start date",
          path: ["endsAt"],
        });
      }
    }
  });

export type CouponInput = z.infer<typeof couponInputSchema>;

export type AdminCoupon = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: CouponTypeValue;
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  perCustomerLimit: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  lifecycle: CouponLifecycle;
  createdAt: string;
  updatedAt: string;
};

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function resolveCouponLifecycle(input: {
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  usageLimit: number | null;
  usageCount: number;
  now?: Date;
}): CouponLifecycle {
  const now = input.now ?? new Date();
  if (!input.isActive) return "DISABLED";
  if (input.usageLimit != null && input.usageCount >= input.usageLimit) {
    return "EXPIRED";
  }
  if (input.endsAt && input.endsAt.getTime() < now.getTime()) return "EXPIRED";
  if (input.startsAt && input.startsAt.getTime() > now.getTime()) return "SCHEDULED";
  return "ACTIVE";
}
