import { z } from "zod";

export const wishlistProductIdSchema = z.object({
  productId: z.string().trim().min(1, "Product is required"),
});

export const wishlistSyncSchema = z.object({
  productIds: z.array(z.string().trim().min(1)).max(100),
});

export type WishlistProductIdInput = z.infer<typeof wishlistProductIdSchema>;
export type WishlistSyncInput = z.infer<typeof wishlistSyncSchema>;
