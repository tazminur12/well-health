import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https?:\/\//i.test(value), {
    message: "Use a full URL starting with https://",
  });

export const shippingZoneInputSchema = z
  .object({
    name: z.string().trim().min(2, "Zone name is required").max(80),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
    description: z.string().trim().max(240).optional().or(z.literal("")),
    areas: z.string().trim().max(500).optional().or(z.literal("")),
    baseFee: z.number().min(0, "Fee cannot be negative"),
    freeShippingMin: z.number().min(0).optional().nullable(),
    etaMinDays: z.number().int().min(0).max(30),
    etaMaxDays: z.number().int().min(0).max(45),
    codAvailable: z.boolean().default(true),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().min(0).max(9999).default(0),
  })
  .superRefine((data, ctx) => {
    if (data.etaMaxDays < data.etaMinDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Max ETA must be ≥ min ETA",
        path: ["etaMaxDays"],
      });
    }
  });

export const shippingCourierInputSchema = z.object({
  name: z.string().trim().min(2, "Courier name is required").max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  contactPhone: z.string().trim().max(30).optional().or(z.literal("")),
  trackingUrl: optionalUrl.optional().or(z.literal("")),
  notes: z.string().trim().max(240).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
});

export type ShippingZoneInput = z.infer<typeof shippingZoneInputSchema>;
export type ShippingCourierInput = z.infer<typeof shippingCourierInputSchema>;

export type AdminShippingZone = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  areas: string;
  baseFee: number;
  freeShippingMin: number | null;
  etaMinDays: number;
  etaMaxDays: number;
  codAvailable: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminShippingCourier = {
  id: string;
  name: string;
  slug: string;
  contactPhone: string | null;
  trackingUrl: string | null;
  notes: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function slugifyShipping(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
