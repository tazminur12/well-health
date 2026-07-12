import { z } from "zod";

export const blogStatusSchema = z.enum(["Draft", "Published", "Scheduled", "Archived"]);
export const blogCategorySchema = z.enum([
  "Health Tips",
  "Product Guides",
  "Nutrition",
  "Company News",
]);

export const blogPostInputSchema = z
  .object({
    title: z.string().trim().min(3, "Title is required"),
    slug: z
      .string()
      .trim()
      .min(2, "Slug is required")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase slug with hyphens only"),
    excerpt: z.string().trim().min(10, "Excerpt should be at least 10 characters"),
    content: z.string().trim().min(20, "Content should be at least 20 characters"),
    category: blogCategorySchema,
    tags: z.array(z.string().trim().min(1)).max(20).default([]),
    status: blogStatusSchema.default("Draft"),
    featured: z.boolean().default(false),
    metaTitle: z.string().trim().max(70).optional(),
    metaDescription: z.string().trim().max(180).optional(),
    scheduledAt: z.string().datetime().optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.status === "Scheduled") {
      if (!values.scheduledAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledAt"],
          message: "Pick a schedule date and time",
        });
      } else if (new Date(values.scheduledAt).getTime() <= Date.now()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledAt"],
          message: "Schedule time must be in the future",
        });
      }
    }
  });

export type BlogPostInput = z.infer<typeof blogPostInputSchema>;

export const blogPostIdsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one post"),
});
