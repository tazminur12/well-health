import { z } from "zod";

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export const PAYMENT_METHODS = ["COD", "SSLCOMMERZ", "BKASH"] as const;
export const PAYMENT_STATUSES = ["UNPAID", "PAID", "FAILED", "REFUNDED"] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];
export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];
export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number];

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const updateOrderPaymentSchema = z.object({
  paymentStatus: z.enum(PAYMENT_STATUSES),
});

export const updateOrderNotesSchema = z.object({
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const adminCreateOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const adminCreateOrderSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(10, "Enter a valid phone"),
  customerName: z.string().trim().min(2, "Customer name is required").max(120),
  shippingFullName: z.string().trim().min(2, "Recipient name is required").max(120),
  shippingPhone: z.string().trim().min(10, "Enter a valid shipping phone"),
  shippingDistrict: z.string().trim().min(2, "Select a district"),
  shippingArea: z.string().trim().min(2, "Area is required").max(120),
  shippingDetails: z.string().trim().min(5, "Enter a detailed address").max(500),
  shippingZoneId: z.string().min(1, "Select a shipping zone"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  paymentStatus: z.enum(PAYMENT_STATUSES).default("UNPAID"),
  status: z.enum(ORDER_STATUSES).default("PENDING"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
  items: z.array(adminCreateOrderItemSchema).min(1, "Add at least one product"),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateOrderPaymentInput = z.infer<typeof updateOrderPaymentSchema>;
export type UpdateOrderNotesInput = z.infer<typeof updateOrderNotesSchema>;
export type AdminCreateOrderInput = z.infer<typeof adminCreateOrderSchema>;

export type AdminOrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  productSlug: string;
  productSku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl: string | null;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  userId: string | null;
  email: string;
  phone: string;
  customerName: string;
  shippingFullName: string;
  shippingPhone: string;
  shippingDistrict: string;
  shippingArea: string;
  shippingDetails: string;
  shippingZoneId: string | null;
  shippingZoneName: string | null;
  shippingFee: number;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethodValue;
  paymentStatus: PaymentStatusValue;
  status: OrderStatusValue;
  notes: string | null;
  couponCode: string | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
};

export type AdminOrderStats = {
  total: number;
  pending: number;
  paid: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  revenue: number;
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodValue, string> = {
  COD: "Cash on Delivery",
  SSLCOMMERZ: "SSLCommerz",
  BKASH: "bKash",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatusValue, string> = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
