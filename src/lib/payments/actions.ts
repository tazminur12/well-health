"use server";

import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethodValue,
} from "@/lib/orders/schemas";
import {
  defaultPaymentSettings,
  PAYMENT_SETTINGS_KEY,
  paymentSettingsSchema,
  type PaymentGatewayCard,
  type PaymentLedgerItem,
  type PaymentOverview,
  type PaymentSettings,
} from "@/lib/payments/schemas";
import { prisma } from "@/lib/prisma";
import {
  defaultStoreSettings,
  STORE_SETTINGS_KEY,
  storeSettingsSchema,
} from "@/lib/settings/schemas";

export type PaymentActionResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function handleError<T = undefined>(error: unknown): PaymentActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  console.error("Payment action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

function envConfigured(...keys: string[]) {
  return keys.every((key) => Boolean(process.env[key]?.trim()));
}

async function readPaymentSettings(): Promise<PaymentSettings> {
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: PAYMENT_SETTINGS_KEY },
    });
    if (!row) {
      // Fall back to store COD flag
      const storeRow = await prisma.siteSetting.findUnique({
        where: { key: STORE_SETTINGS_KEY },
      });
      const storeParsed = storeRow
        ? storeSettingsSchema.safeParse(storeRow.value)
        : null;
      const codEnabled = storeParsed?.success
        ? storeParsed.data.codEnabled
        : defaultStoreSettings.codEnabled;
      return { ...defaultPaymentSettings, codEnabled };
    }
    const parsed = paymentSettingsSchema.safeParse(row.value);
    return parsed.success
      ? { ...defaultPaymentSettings, ...parsed.data }
      : defaultPaymentSettings;
  } catch {
    return defaultPaymentSettings;
  }
}

function toLedgerItem(order: {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  total: Prisma.Decimal | number;
  createdAt: Date;
  updatedAt: Date;
}): PaymentLedgerItem {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    phone: order.phone,
    paymentMethod: order.paymentMethod as PaymentMethodValue,
    paymentStatus: order.paymentStatus,
    orderStatus: order.status,
    total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export async function getPaymentSettingsAction(): Promise<
  PaymentActionResult<PaymentSettings>
> {
  try {
    await requireAdmin();
    return { data: await readPaymentSettings() };
  } catch (error) {
    return handleError(error);
  }
}

export async function updatePaymentSettingsAction(
  input: unknown
): Promise<PaymentActionResult<PaymentSettings>> {
  try {
    await requireAdmin();
    const parsed = paymentSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid payment settings." };
    }

    const settings = { ...defaultPaymentSettings, ...parsed.data };

    await prisma.siteSetting.upsert({
      where: { key: PAYMENT_SETTINGS_KEY },
      create: { key: PAYMENT_SETTINGS_KEY, value: settings },
      update: { value: settings },
    });

    // Keep store COD flag in sync for checkout
    const storeRow = await prisma.siteSetting.findUnique({
      where: { key: STORE_SETTINGS_KEY },
    });
    const storeParsed = storeRow
      ? storeSettingsSchema.safeParse(storeRow.value)
      : null;
    const storeBase = storeParsed?.success
      ? { ...defaultStoreSettings, ...storeParsed.data }
      : defaultStoreSettings;

    await prisma.siteSetting.upsert({
      where: { key: STORE_SETTINGS_KEY },
      create: {
        key: STORE_SETTINGS_KEY,
        value: { ...storeBase, codEnabled: settings.codEnabled },
      },
      update: {
        value: { ...storeBase, codEnabled: settings.codEnabled },
      },
    });

    revalidatePath("/admin/payments");
    revalidatePath("/admin/settings");
    revalidatePath("/checkout");

    return { data: settings, success: "Payment settings saved." };
  } catch (error) {
    return handleError(error);
  }
}

export async function getPaymentOverviewAction(): Promise<
  PaymentActionResult<PaymentOverview>
> {
  try {
    await requireAdmin();
    const settings = await readPaymentSettings();

    const orders = await prisma.order.findMany({
      where: { status: { not: OrderStatus.CANCELLED } },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        phone: true,
        paymentMethod: true,
        paymentStatus: true,
        status: true,
        total: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const byMethod: PaymentOverview["byMethod"] = {
      COD: { count: 0, paid: 0, unpaid: 0 },
      SSLCOMMERZ: { count: 0, paid: 0, unpaid: 0 },
      BKASH: { count: 0, paid: 0, unpaid: 0 },
    };

    let totalCollected = 0;
    let unpaidAmount = 0;
    let failedAmount = 0;
    let refundedAmount = 0;
    let paidOrders = 0;
    let unpaidOrders = 0;
    let codPendingCount = 0;
    let codPendingAmount = 0;

    for (const order of orders) {
      const total = Number(order.total);
      const method = order.paymentMethod as PaymentMethodValue;
      byMethod[method].count += 1;

      if (order.paymentStatus === PaymentStatus.PAID) {
        totalCollected += total;
        paidOrders += 1;
        byMethod[method].paid += total;
      } else if (order.paymentStatus === PaymentStatus.UNPAID) {
        unpaidAmount += total;
        unpaidOrders += 1;
        byMethod[method].unpaid += total;
        if (method === "COD") {
          codPendingCount += 1;
          codPendingAmount += total;
        }
      } else if (order.paymentStatus === PaymentStatus.FAILED) {
        failedAmount += total;
      } else if (order.paymentStatus === PaymentStatus.REFUNDED) {
        refundedAmount += total;
      }
    }

    const sslConfigured = envConfigured(
      "SSLCOMMERZ_STORE_ID",
      "SSLCOMMERZ_STORE_PASSWORD"
    );
    const bkashConfigured = envConfigured("BKASH_APP_KEY", "BKASH_APP_SECRET");

    const gatewayDefs: Array<Omit<PaymentGatewayCard, "orderCount" | "paidAmount" | "unpaidAmount">> =
      [
        {
          id: "COD",
          name: "Cash on Delivery",
          description: "Collect cash when the order is delivered.",
          enabled: settings.codEnabled,
          instructions: settings.codInstructions,
          configured: true,
          configHint: "No gateway keys required",
        },
        {
          id: "SSLCOMMERZ",
          name: "SSLCommerz",
          description: "Cards, Nagad, Rocket, and internet banking.",
          enabled: settings.sslcommerzEnabled,
          instructions: settings.sslcommerzInstructions,
          configured: sslConfigured,
          configHint: sslConfigured
            ? "Store credentials detected in environment"
            : "Add SSLCOMMERZ_STORE_ID & SSLCOMMERZ_STORE_PASSWORD",
        },
        {
          id: "BKASH",
          name: "bKash",
          description: "Mobile wallet checkout for Bangladesh.",
          enabled: settings.bkashEnabled,
          instructions: settings.bkashInstructions,
          configured: bkashConfigured,
          configHint: bkashConfigured
            ? "Wallet credentials detected in environment"
            : "Add BKASH_APP_KEY & BKASH_APP_SECRET",
        },
      ];

    const gateways: PaymentGatewayCard[] = gatewayDefs.map((gateway) => ({
      ...gateway,
      orderCount: byMethod[gateway.id].count,
      paidAmount: byMethod[gateway.id].paid,
      unpaidAmount: byMethod[gateway.id].unpaid,
    }));

    const unpaidCod = orders
      .filter(
        (order) =>
          order.paymentMethod === PaymentMethod.COD &&
          order.paymentStatus === PaymentStatus.UNPAID
      )
      .map(toLedgerItem);

    const recent = orders.slice(0, 25).map(toLedgerItem);

    return {
      data: {
        totalCollected,
        unpaidAmount,
        failedAmount,
        refundedAmount,
        paidOrders,
        unpaidOrders,
        codPendingCount,
        codPendingAmount,
        byMethod,
        gateways,
        settings,
        recent,
        unpaidCod,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

/** Used by checkout to know which methods are offered. */
export async function getPublicPaymentMethods(): Promise<{
  codEnabled: boolean;
  sslcommerzEnabled: boolean;
  bkashEnabled: boolean;
  labels: typeof PAYMENT_METHOD_LABELS;
}> {
  const settings = await readPaymentSettings();
  return {
    codEnabled: settings.codEnabled,
    sslcommerzEnabled: settings.sslcommerzEnabled,
    bkashEnabled: settings.bkashEnabled,
    labels: PAYMENT_METHOD_LABELS,
  };
}
