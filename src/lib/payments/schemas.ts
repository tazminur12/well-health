import { z } from "zod";

import type {
  OrderStatusValue,
  PaymentMethodValue,
  PaymentStatusValue,
} from "@/lib/orders/schemas";

export const PAYMENT_SETTINGS_KEY = "payment_settings";

export const paymentSettingsSchema = z.object({
  codEnabled: z.boolean().default(true),
  sslcommerzEnabled: z.boolean().default(true),
  bkashEnabled: z.boolean().default(true),
  codInstructions: z
    .string()
    .trim()
    .max(400)
    .default("Pay cash to the delivery agent when you receive your order."),
  sslcommerzInstructions: z
    .string()
    .trim()
    .max(400)
    .default("Pay securely with cards, mobile banking, or internet banking."),
  bkashInstructions: z
    .string()
    .trim()
    .max(400)
    .default("Complete payment with your bKash wallet at checkout."),
});

export type PaymentSettings = z.infer<typeof paymentSettingsSchema>;

export const defaultPaymentSettings: PaymentSettings = {
  codEnabled: true,
  sslcommerzEnabled: true,
  bkashEnabled: true,
  codInstructions: "Pay cash to the delivery agent when you receive your order.",
  sslcommerzInstructions:
    "Pay securely with cards, mobile banking, or internet banking.",
  bkashInstructions: "Complete payment with your bKash wallet at checkout.",
};

export type PaymentGatewayId = "COD" | "SSLCOMMERZ" | "BKASH";

export type PaymentGatewayCard = {
  id: PaymentGatewayId;
  name: string;
  description: string;
  enabled: boolean;
  instructions: string;
  configured: boolean;
  configHint: string;
  orderCount: number;
  paidAmount: number;
  unpaidAmount: number;
};

export type PaymentLedgerItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  paymentMethod: PaymentMethodValue;
  paymentStatus: PaymentStatusValue;
  orderStatus: OrderStatusValue;
  total: number;
  createdAt: string;
  updatedAt: string;
};

export type PaymentOverview = {
  totalCollected: number;
  unpaidAmount: number;
  failedAmount: number;
  refundedAmount: number;
  paidOrders: number;
  unpaidOrders: number;
  codPendingCount: number;
  codPendingAmount: number;
  byMethod: Record<
    PaymentMethodValue,
    { count: number; paid: number; unpaid: number }
  >;
  gateways: PaymentGatewayCard[];
  settings: PaymentSettings;
  recent: PaymentLedgerItem[];
  unpaidCod: PaymentLedgerItem[];
};
