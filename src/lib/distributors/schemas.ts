import { z } from "zod";

export const distributorApplicationStatusSchema = z.enum([
  "NEW",
  "REVIEWING",
  "APPROVED",
  "REJECTED",
  "ARCHIVED",
]);

export const distributorApplicationFilterSchema = z.enum([
  "all",
  "new",
  "reviewing",
  "approved",
  "rejected",
  "archived",
]);

export const distributorBusinessTypeSchema = z.enum([
  "PHARMACY",
  "RETAIL",
  "WHOLESALE",
  "ONLINE",
  "OTHER",
]);

export const distributorExperienceSchema = z.enum([
  "NEW",
  "YEARS_1_3",
  "YEARS_3_5",
  "YEARS_5_PLUS",
]);

export const submitDistributorApplicationSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  phone: z.string().trim().min(8, "Phone is required").max(30),
  email: z.string().trim().email("Enter a valid email").max(160),
  division: z.string().trim().min(2, "Select a division"),
  district: z.string().trim().min(2, "Select a district"),
  businessName: z.string().trim().max(160).optional().or(z.literal("")),
  businessType: distributorBusinessTypeSchema,
  experience: distributorExperienceSchema,
  coverageArea: z.string().trim().min(2, "Coverage area is required").max(200),
  message: z.string().trim().min(10, "Please share a short introduction").max(2000),
});

export const createDistributorApplicationSchema = submitDistributorApplicationSchema.extend({
  status: distributorApplicationStatusSchema.default("APPROVED"),
  adminNotes: z.string().trim().max(5000).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const updateDistributorApplicationSchema = z.object({
  status: distributorApplicationStatusSchema.optional(),
  adminNotes: z.string().trim().max(5000).optional().nullable(),
});

export type DistributorApplicationStatus = z.infer<typeof distributorApplicationStatusSchema>;
export type DistributorApplicationFilter = z.infer<typeof distributorApplicationFilterSchema>;
export type DistributorBusinessType = z.infer<typeof distributorBusinessTypeSchema>;
export type DistributorExperience = z.infer<typeof distributorExperienceSchema>;
export type SubmitDistributorApplicationInput = z.infer<typeof submitDistributorApplicationSchema>;
export type CreateDistributorApplicationInput = z.infer<typeof createDistributorApplicationSchema>;
export type UpdateDistributorApplicationInput = z.infer<typeof updateDistributorApplicationSchema>;

export type AdminDistributorApplication = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  division: string;
  district: string;
  businessName: string | null;
  businessType: DistributorBusinessType;
  experience: DistributorExperience;
  coverageArea: string;
  message: string;
  status: DistributorApplicationStatus;
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DistributorApplicationStats = {
  total: number;
  new: number;
  reviewing: number;
  approved: number;
  rejected: number;
  archived: number;
};

export const businessTypeLabels: Record<DistributorBusinessType, string> = {
  PHARMACY: "Pharmacy / Chemist",
  RETAIL: "Retail store",
  WHOLESALE: "Wholesale trading",
  ONLINE: "Online / e-commerce",
  OTHER: "Other",
};

export const experienceLabels: Record<DistributorExperience, string> = {
  NEW: "New to distribution",
  YEARS_1_3: "1–3 years",
  YEARS_3_5: "3–5 years",
  YEARS_5_PLUS: "5+ years",
};

export const distributorStatusMeta: Record<
  DistributorApplicationStatus,
  { label: string; pill: string }
> = {
  NEW: { label: "New", pill: "bg-brand-green-100 text-brand-green-800" },
  REVIEWING: { label: "Reviewing", pill: "bg-blue-100 text-blue-800" },
  APPROVED: { label: "Approved", pill: "bg-emerald-100 text-emerald-800" },
  REJECTED: { label: "Rejected", pill: "bg-red-100 text-red-800" },
  ARCHIVED: { label: "Archived", pill: "bg-neutral-100 text-neutral-600" },
};

/** Map public form values to Prisma enum values. */
export function mapPublicBusinessType(
  value: "pharmacy" | "retail" | "wholesale" | "online" | "other"
): DistributorBusinessType {
  const map = {
    pharmacy: "PHARMACY",
    retail: "RETAIL",
    wholesale: "WHOLESALE",
    online: "ONLINE",
    other: "OTHER",
  } as const;
  return map[value];
}

export function mapPublicExperience(
  value: "new" | "1-3" | "3-5" | "5plus"
): DistributorExperience {
  const map = {
    new: "NEW",
    "1-3": "YEARS_1_3",
    "3-5": "YEARS_3_5",
    "5plus": "YEARS_5_PLUS",
  } as const;
  return map[value];
}
