import { z } from "zod";

export const reviewStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export type ReviewStatusValue = z.infer<typeof reviewStatusSchema>;

export const reviewReplySchema = z.object({
  adminReply: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const createReviewSchema = z.object({
  productId: z.string().trim().min(1, "Select a product"),
  customerName: z.string().trim().min(2, "Customer name is required").max(80),
  customerEmail: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  rating: z.number().int().min(1, "Rating is required").max(5),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  comment: z.string().trim().min(8, "Review must be at least 8 characters").max(2000),
  status: reviewStatusSchema.default("APPROVED"),
  isFeatured: z.boolean().default(false),
  adminReply: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export type ReviewProductOption = {
  id: string;
  name: string;
  sku: string;
};

export type AdminReview = {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImageUrl: string | null;
  customerName: string;
  customerEmail: string | null;
  rating: number;
  title: string | null;
  comment: string;
  status: ReviewStatusValue;
  isFeatured: boolean;
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
};
