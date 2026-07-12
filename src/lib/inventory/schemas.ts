import { z } from "zod";

export const stockBucketSchema = z.enum(["In Stock", "Low Stock", "Out of Stock"]);
export type StockBucket = z.infer<typeof stockBucketSchema>;

export const updateStockSchema = z.object({
  productId: z.string().min(1),
  stock: z.number().int().min(0, "Stock cannot be negative").max(1_000_000),
  lowStockThreshold: z.number().int().min(0).max(100_000).optional(),
});

export const adjustStockSchema = z.object({
  productId: z.string().min(1),
  delta: z.number().int().min(-100000).max(100000),
});

export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: "Active" | "Draft" | "Archived";
  stock: number;
  lowStockThreshold: number;
  unit: string;
  imageUrl: string | null;
  bucket: StockBucket;
  updatedAt: string;
};

export function getStockBucket(stock: number, lowStockThreshold: number): StockBucket {
  if (stock <= 0) return "Out of Stock";
  if (stock <= lowStockThreshold) return "Low Stock";
  return "In Stock";
}
