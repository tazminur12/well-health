import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  imageUrl: z.string().optional(),
  quantity: z.number().int().min(1).max(99),
});

export const placeOrderSchema = z.object({
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Enter a valid email",
    }),
  phone: z.string().trim().min(10, "Enter a valid phone number").max(20),
  customerName: z.string().trim().min(2, "Full name is required"),
  shippingFullName: z.string().trim().min(2, "Recipient name is required"),
  shippingPhone: z.string().trim().min(10, "Enter a valid shipping phone").max(20),
  shippingDistrict: z.string().trim().min(2, "Select a district"),
  shippingArea: z.string().trim().min(2, "Area / thana is required"),
  shippingDetails: z.string().trim().min(5, "Enter a detailed address"),
  shippingZoneId: z.string().trim().min(1, "Select a delivery area"),
  paymentMethod: z.enum(["COD", "SSLCOMMERZ", "BKASH"]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty"),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;
