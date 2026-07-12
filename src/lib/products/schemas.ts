import { z } from "zod";

export const productStatusSchema = z.enum(["Active", "Draft", "Archived"]);
export const offerBadgeSchema = z.enum(["Sale", "Flash", "Bundle", "Clearance"]);

export const productInputSchema = z
  .object({
    name: z.string().trim().min(2, "Product name is required"),
    nameBn: z.string().trim().optional(),
    slug: z
      .string()
      .trim()
      .min(2, "Slug is required")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase slug with hyphens only"),
    category: z.string().trim().min(1, "Category is required"),
    brand: z.string().trim().min(1).default("Well Health"),
    sku: z.string().trim().min(2, "SKU is required"),
    barcode: z.string().trim().optional(),
    price: z.number().positive("Price must be greater than 0"),
    compareAtPrice: z.number().positive().optional(),
    costPrice: z.number().positive().optional(),
    offerEnabled: z.boolean().default(false),
    offerLabel: z.string().trim().optional(),
    discountPercent: z.number().min(0).max(90).optional(),
    offerPrice: z.number().positive().optional(),
    offerStartsAt: z.string().datetime().optional().or(z.literal("")),
    offerEndsAt: z.string().datetime().optional().or(z.literal("")),
    offerBadge: offerBadgeSchema.optional(),
    stock: z.number().int().min(0),
    lowStockThreshold: z.number().int().min(0).default(10),
    unit: z.string().trim().min(1),
    packSize: z.string().trim().optional(),
    servingSize: z.string().trim().optional(),
    shortDescription: z.string().trim().min(5, "Short description is required"),
    description: z.string().trim().min(10, "Description is required"),
    descriptionBn: z.string().trim().optional(),
    ingredients: z.string().trim().optional(),
    usageInstructions: z.string().trim().optional(),
    warnings: z.string().trim().optional(),
    tags: z.array(z.string().trim().min(1)).default([]),
    metaTitle: z.string().trim().optional(),
    metaDescription: z.string().trim().optional(),
    featured: z.boolean().default(false),
    labTested: z.boolean().default(false),
    doctorRecommended: z.boolean().default(false),
    status: productStatusSchema.default("Draft"),
    imageTone: z.string().optional(),
    imageCount: z.number().int().min(0).max(12).default(0),
  })
  .superRefine((values, ctx) => {
    if (values.compareAtPrice && values.compareAtPrice < values.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["compareAtPrice"],
        message: "Compare-at price should be higher than selling price",
      });
    }

    if (!values.offerEnabled) return;

    if (!values.offerLabel?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["offerLabel"],
        message: "Offer label is required when offer is enabled",
      });
    }

    if (!values.discountPercent && !values.offerPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountPercent"],
        message: "Set a discount % or offer price",
      });
    }

    if (values.offerPrice && values.offerPrice >= values.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["offerPrice"],
        message: "Offer price must be lower than selling price",
      });
    }

    if (values.offerStartsAt && values.offerEndsAt) {
      if (new Date(values.offerEndsAt).getTime() <= new Date(values.offerStartsAt).getTime()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["offerEndsAt"],
          message: "Offer end must be after start",
        });
      }
    }
  });

export type ProductInput = z.infer<typeof productInputSchema>;

export const productIdsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one product"),
});
