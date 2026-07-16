"use server";

import {
  AdminNotificationType,
  CouponType,
  PaymentMethod,
  PaymentStatus,
  ProductStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/session";
import {
  queueOrderEmails,
  sendAdminNewOrderEmail,
  sendOrderConfirmationEmail,
} from "@/lib/email/orders";
import {
  placeOrderSchema,
  type PlaceOrderInput,
} from "@/lib/checkout/schemas";
import {
  createOrderAccessToken,
  verifyOrderAccessToken,
} from "@/lib/checkout/order-access-token";
import { mapAdminToPublic } from "@/lib/products/public-mapper";
import { mapProductToAdmin } from "@/lib/products/mapper";
import { prisma } from "@/lib/prisma";
import { rateLimitForRequest } from "@/lib/rate-limit/server";
import {
  defaultStoreSettings,
  STORE_SETTINGS_KEY,
  storeSettingsSchema,
} from "@/lib/settings/schemas";

export type CheckoutAddress = {
  id: string;
  fullName: string;
  phone: string;
  district: string;
  area: string;
  details: string;
  isDefault: boolean;
};

export type CheckoutContext = {
  isAuthenticated: boolean;
  email: string;
  name: string;
  phone: string;
  addresses: CheckoutAddress[];
  freeShippingMin: number;
  codEnabled: boolean;
  supportPhone: string;
};

export type PlacedOrderSummary = {
  id: string;
  orderNumber: string;
  accessToken: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  email: string;
  customerName: string;
};

export type GuestOrderSummary = {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: string;
  shippingZoneName: string | null;
  shippingDetails: string;
  shippingArea: string;
  shippingDistrict: string;
  createdAt: string;
  items: Array<{
    productName: string;
    productSlug: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    imageUrl?: string;
  }>;
};

export type CheckoutResult<T = undefined> = {
  error?: string;
  data?: T;
  success?: string;
};

function normalizePhone(phone: string) {
  const digits = phone.replace(/[\s-]/g, "");
  if (digits.startsWith("+880")) return digits;
  if (digits.startsWith("880")) return `+${digits}`;
  if (digits.startsWith("0")) return `+880${digits.slice(1)}`;
  if (digits.startsWith("1") && digits.length === 10) return `+880${digits}`;
  return digits.startsWith("+") ? digits : `+880${digits}`;
}

function toLocalPhone(phone?: string | null) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length >= 13) return digits.slice(3);
  if (digits.startsWith("0") && digits.length >= 11) return digits.slice(1);
  return digits;
}

async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const prefix = `WHT-${year}-`;
  const latest = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  const next = latest
    ? Number(latest.orderNumber.replace(prefix, "")) + 1
    : 1;

  return `${prefix}${String(Math.max(1, next)).padStart(5, "0")}`;
}

async function getStoreCheckoutSettings() {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: STORE_SETTINGS_KEY } });
    if (!row) {
      return {
        freeShippingMin: defaultStoreSettings.freeShippingMin,
        codEnabled: defaultStoreSettings.codEnabled,
        supportPhone: defaultStoreSettings.supportPhone,
      };
    }
    const parsed = storeSettingsSchema.safeParse(row.value);
    const settings = parsed.success
      ? { ...defaultStoreSettings, ...parsed.data }
      : defaultStoreSettings;
    return {
      freeShippingMin: settings.freeShippingMin,
      codEnabled: settings.codEnabled,
      supportPhone: settings.supportPhone,
    };
  } catch {
    return {
      freeShippingMin: defaultStoreSettings.freeShippingMin,
      codEnabled: defaultStoreSettings.codEnabled,
      supportPhone: defaultStoreSettings.supportPhone,
    };
  }
}

export async function getCheckoutContextAction(): Promise<CheckoutResult<CheckoutContext>> {
  try {
    const [session, store] = await Promise.all([getSessionUser(), getStoreCheckoutSettings()]);

    if (!session) {
      return {
        data: {
          isAuthenticated: false,
          email: "",
          name: "",
          phone: "",
          addresses: [],
          ...store,
        },
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
      },
    });

    return {
      data: {
        isAuthenticated: true,
        email: user?.email ?? session.email,
        name: user?.name ?? session.name ?? "",
        phone: toLocalPhone(user?.phone ?? session.phone),
        addresses: (user?.addresses ?? []).map((address) => ({
          id: address.id,
          fullName: address.fullName,
          phone: toLocalPhone(address.phone),
          district: address.district,
          area: address.area,
          details: address.details,
          isDefault: address.isDefault,
        })),
        ...store,
      },
    };
  } catch (error) {
    console.error("getCheckoutContextAction:", error);
    return { error: "Could not load checkout details." };
  }
}

function computeCouponDiscount(input: {
  type: CouponType;
  value: number;
  maxDiscount: number | null;
  subtotal: number;
}) {
  let discount =
    input.type === CouponType.PERCENT
      ? (input.subtotal * input.value) / 100
      : input.value;
  if (input.maxDiscount != null) {
    discount = Math.min(discount, input.maxDiscount);
  }
  return Math.max(0, Math.min(discount, input.subtotal));
}

export type AppliedCoupon = {
  code: string;
  name: string;
  type: CouponType;
  value: number;
  discount: number;
  label: string;
};

export async function resolveCoupon(
  codeInput: string,
  subtotal: number
): Promise<{ error?: string; data?: AppliedCoupon }> {
  const code = codeInput.trim().toUpperCase();
  if (!code) return { error: "Enter a coupon code." };

  const coupon = await prisma.coupon.findFirst({
    where: { code, isActive: true },
  });
  if (!coupon) return { error: "Coupon code is invalid." };

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { error: "This coupon is not active yet." };
  }
  if (coupon.endsAt && coupon.endsAt < now) {
    return { error: "This coupon has expired." };
  }
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    return { error: "This coupon has reached its usage limit." };
  }

  const minOrder = coupon.minOrderAmount != null ? Number(coupon.minOrderAmount) : 0;
  if (subtotal < minOrder) {
    return {
      error: `Minimum order for this coupon is ${minOrder.toLocaleString("en-BD", {
        style: "currency",
        currency: "BDT",
        minimumFractionDigits: 2,
      }).replace("BDT", "৳")}.`,
    };
  }

  const value = Number(coupon.value);
  const discount = computeCouponDiscount({
    type: coupon.type,
    value,
    maxDiscount: coupon.maxDiscount != null ? Number(coupon.maxDiscount) : null,
    subtotal,
  });

  const label =
    coupon.type === CouponType.PERCENT
      ? `${value}% off`
      : `৳ ${value.toFixed(0)} off`;

  return {
    data: {
      code: coupon.code,
      name: coupon.name,
      type: coupon.type,
      value,
      discount,
      label,
    },
  };
}

export async function validateCouponAction(input: {
  code: string;
  subtotal: number;
}): Promise<CheckoutResult<AppliedCoupon>> {
  try {
    const rateLimited = await rateLimitForRequest("checkout:coupon");
    if (rateLimited) return rateLimited;

    if (!Number.isFinite(input.subtotal) || input.subtotal <= 0) {
      return { error: "Add items to your cart before applying a coupon." };
    }
    const result = await resolveCoupon(input.code, input.subtotal);
    if (result.error || !result.data) {
      return { error: result.error ?? "Could not apply coupon." };
    }
    return {
      data: result.data,
      success: `${result.data.code} applied — you save ৳ ${result.data.discount.toFixed(2)}.`,
    };
  } catch (error) {
    console.error("validateCouponAction:", error);
    return { error: "Could not validate coupon. Please try again." };
  }
}

export async function placeOrderAction(
  input: PlaceOrderInput
): Promise<CheckoutResult<PlacedOrderSummary>> {
  try {
    const parsed = placeOrderSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid checkout details" };
    }

    const rateLimited = await rateLimitForRequest("checkout:place-order");
    if (rateLimited) return rateLimited;

    const data = parsed.data;
    const session = await getSessionUser();
    const store = await getStoreCheckoutSettings();

    if (data.paymentMethod === "COD" && !store.codEnabled) {
      return { error: "Cash on delivery is currently unavailable." };
    }

    const zone = await prisma.shippingZone.findFirst({
      where: { id: data.shippingZoneId, isActive: true },
    });
    if (!zone) return { error: "Selected delivery area is unavailable." };

    if (data.paymentMethod === "COD" && !zone.codAvailable) {
      return { error: "Cash on delivery is not available for this delivery area." };
    }

    const productIds = [...new Set(data.items.map((item) => item.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: ProductStatus.ACTIVE },
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      },
    });

    if (products.length !== productIds.length) {
      return { error: "One or more products are no longer available." };
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const lineItems: Array<{
      productId: string;
      productName: string;
      productSlug: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
      imageUrl?: string;
      stock: number;
    }> = [];

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) return { error: `${item.name} is unavailable.` };
      if (product.stock < item.quantity) {
        return {
          error: `Only ${product.stock} left in stock for ${product.name}.`,
        };
      }

      const publicProduct = mapAdminToPublic(mapProductToAdmin(product));
      const unitPrice = publicProduct.price;
      lineItems.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        unitPrice,
        quantity: item.quantity,
        lineTotal: unitPrice * item.quantity,
        imageUrl: publicProduct.imageUrl,
        stock: product.stock,
      });
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);

    let discount = 0;
    let couponCode: string | null = null;
    const code = data.couponCode?.trim().toUpperCase();
    if (code) {
      const couponResult = await resolveCoupon(code, subtotal);
      if (couponResult.error || !couponResult.data) {
        return { error: couponResult.error ?? "Coupon code is invalid." };
      }
      discount = couponResult.data.discount;
      couponCode = couponResult.data.code;
    }

    const freeThreshold =
      zone.freeShippingMin != null ? Number(zone.freeShippingMin) : store.freeShippingMin;
    const shippingFee =
      freeThreshold > 0 && subtotal - discount >= freeThreshold
        ? 0
        : Number(zone.baseFee);
    const total = Math.max(0, subtotal - discount + shippingFee);

    const orderNumber = await generateOrderNumber();
    const phone = normalizePhone(data.phone);
    const shippingPhone = normalizePhone(data.shippingPhone);

    const order = await prisma.$transaction(async (tx) => {
      for (const item of lineItems) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new Error(`Insufficient stock for ${item.productName}`);
        }
      }

      if (couponCode) {
        await tx.coupon.updateMany({
          where: { code: couponCode, isActive: true },
          data: { usageCount: { increment: 1 } },
        });
      }

      return tx.order.create({
        data: {
          orderNumber,
          userId: session?.id,
          email: data.email?.trim().toLowerCase() || "",
          phone,
          customerName: data.customerName.trim(),
          shippingFullName: data.shippingFullName.trim(),
          shippingPhone,
          shippingDistrict: data.shippingDistrict.trim(),
          shippingArea: data.shippingArea.trim(),
          shippingDetails: data.shippingDetails.trim(),
          shippingZoneId: zone.id,
          shippingZoneName: zone.name,
          shippingFee,
          subtotal,
          discount,
          total,
          paymentMethod: data.paymentMethod as PaymentMethod,
          paymentStatus: PaymentStatus.UNPAID,
          status: "PENDING",
          notes: data.notes?.trim() || null,
          couponCode,
          items: {
            create: lineItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productSlug: item.productSlug,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              lineTotal: item.lineTotal,
              imageUrl: item.imageUrl,
            })),
          },
        },
      });
    });

    try {
      await prisma.adminNotification.create({
        data: {
          type: AdminNotificationType.ORDER,
          title: "New order received",
          message: `${order.orderNumber} · ${data.customerName} · ৳ ${total.toFixed(2)}`,
          href: `/admin/orders/${order.id}`,
        },
      });
    } catch {
      // notifications are best-effort
    }

    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });
    if (orderWithItems) {
      queueOrderEmails([
        () => sendOrderConfirmationEmail(orderWithItems),
        () => sendAdminNewOrderEmail(orderWithItems),
      ]);
    }

    revalidatePath("/orders");
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    revalidatePath("/shop");

    return {
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        accessToken: createOrderAccessToken(order.id),
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        email: order.email,
        customerName: order.customerName,
      },
      success: "Order placed successfully.",
    };
  } catch (error) {
    console.error("placeOrderAction:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not place your order. Please try again.",
    };
  }
}

export async function getOrderByAccessTokenAction(
  token: string
): Promise<CheckoutResult<GuestOrderSummary>> {
  try {
    const rateLimited = await rateLimitForRequest("checkout:order-lookup");
    if (rateLimited) return rateLimited;

    if (!token || token.length < 20) {
      return { error: "This confirmation link is invalid or has expired." };
    }

    const verified = verifyOrderAccessToken(token);
    if (!verified) {
      return { error: "This confirmation link is invalid or has expired." };
    }

    const order = await prisma.order.findUnique({
      where: { id: verified.orderId },
      include: { items: true },
    });
    if (!order) return { error: "This confirmation link is invalid or has expired." };

    return {
      data: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        email: order.email,
        phone: order.phone,
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        discount: Number(order.discount),
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        shippingZoneName: order.shippingZoneName,
        shippingDetails: order.shippingDetails,
        shippingArea: order.shippingArea,
        shippingDistrict: order.shippingDistrict,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((item) => ({
          productName: item.productName,
          productSlug: item.productSlug,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.lineTotal),
          imageUrl: item.imageUrl ?? undefined,
        })),
      },
    };
  } catch (error) {
    console.error("getOrderByAccessTokenAction:", error);
    return { error: "Could not load order." };
  }
}
