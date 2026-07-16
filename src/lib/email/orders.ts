import type { Order, OrderItem, OrderStatus } from "@prisma/client";

import { buildGuestOrderSuccessUrl } from "@/lib/checkout/order-access-token";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatusValue,
  type PaymentMethodValue,
  type PaymentStatusValue,
} from "@/lib/orders/schemas";
import { getPublicStoreSettings } from "@/lib/settings/public-queries";

import {
  escapeHtml,
  formatEmailMoney,
  isValidEmail,
  renderEmailLayout,
} from "./html";
import { getAppUrl, getEmailFrom, getResendClientSafe } from "./resend";

export type OrderEmailItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderEmailPayload = {
  orderId: string;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  email: string;
  phone: string;
  paymentMethod: PaymentMethodValue;
  paymentStatus: PaymentStatusValue;
  status: OrderStatusValue;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  shippingFullName: string;
  shippingPhone: string;
  shippingDistrict: string;
  shippingArea: string;
  shippingDetails: string;
  shippingZoneName?: string | null;
  couponCode?: string | null;
  items: OrderEmailItem[];
};

export type SendOrderEmailResult = {
  ok: boolean;
  id?: string;
  error?: string;
  preview?: boolean;
  skipped?: boolean;
};

type OrderWithItems = Order & { items: OrderItem[] };

function decimal(value: { toString(): string } | number) {
  return typeof value === "number" ? value : Number(value);
}

export function toOrderEmailPayload(order: OrderWithItems): OrderEmailPayload {
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    paymentMethod: order.paymentMethod as PaymentMethodValue,
    paymentStatus: order.paymentStatus as PaymentStatusValue,
    status: order.status as OrderStatusValue,
    subtotal: decimal(order.subtotal),
    discount: decimal(order.discount),
    shippingFee: decimal(order.shippingFee),
    total: decimal(order.total),
    shippingFullName: order.shippingFullName,
    shippingPhone: order.shippingPhone,
    shippingDistrict: order.shippingDistrict,
    shippingArea: order.shippingArea,
    shippingDetails: order.shippingDetails,
    shippingZoneName: order.shippingZoneName,
    couponCode: order.couponCode,
    items: order.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: decimal(item.unitPrice),
      lineTotal: decimal(item.lineTotal),
    })),
  };
}

function orderItemsTableHtml(items: OrderEmailItem[]) {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#1A1D1F">${escapeHtml(item.productName)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:center;color:#4b5563">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;color:#1A1D1F;font-weight:600">${formatEmailMoney(item.lineTotal)}</td>
      </tr>`
    )
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead>
        <tr>
          <th style="padding:0 0 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af">Product</th>
          <th style="padding:0 8px 8px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af">Qty</th>
          <th style="padding:0 0 8px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function orderSummaryHtml(order: OrderEmailPayload) {
  const lines = [
    ["Subtotal", formatEmailMoney(order.subtotal)],
    order.discount > 0 ? ["Discount", `-${formatEmailMoney(order.discount)}`] : null,
    ["Delivery", order.shippingFee > 0 ? formatEmailMoney(order.shippingFee) : "Free"],
    ["Order total", formatEmailMoney(order.total)],
  ].filter(Boolean) as Array<[string, string]>;

  return `
    <div style="margin-top:18px;border-top:1px solid #e5e7eb;padding-top:14px">
      ${lines
        .map(
          ([label, value], index) => `
        <div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:${index === lines.length - 1 ? 0 : 8}px;${index === lines.length - 1 ? "font-size:16px;font-weight:700;color:#0B4D3A" : "font-size:14px;color:#4b5563"}">
          <span>${escapeHtml(label)}</span>
          <span>${value}</span>
        </div>`
        )
        .join("")}
    </div>`;
}

function shippingBlockHtml(order: OrderEmailPayload) {
  return `
    <div style="background:#F7F8F9;border-radius:12px;padding:14px 16px;margin:18px 0 0">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#0B4D3A;text-transform:uppercase;letter-spacing:0.08em">Delivery address</p>
      <p style="margin:0;line-height:1.6;color:#1A1D1F">
        <strong>${escapeHtml(order.shippingFullName)}</strong><br/>
        ${escapeHtml(order.shippingDetails)}, ${escapeHtml(order.shippingArea)}<br/>
        ${escapeHtml(order.shippingDistrict)}${order.shippingZoneName ? ` · ${escapeHtml(order.shippingZoneName)}` : ""}<br/>
        ${escapeHtml(order.shippingPhone)}
      </p>
    </div>`;
}

function ctaButton(label: string, href: string) {
  return `
    <a href="${href}" style="display:inline-block;background:#16875D;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;margin-top:18px">
      ${escapeHtml(label)}
    </a>`;
}

async function sendOrderEmail(input: {
  to: string;
  subject: string;
  html: string;
  logLabel: string;
}): Promise<SendOrderEmailResult> {
  if (!isValidEmail(input.to)) {
    return { ok: true, skipped: true };
  }

  const resend = getResendClientSafe();
  if (!resend) {
    console.info(`[${input.logLabel}] Resend not configured. Preview for:`, input.to, input.subject);
    return { ok: true, preview: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getEmailFrom(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      replyTo: process.env.EMAIL_SUPPORT?.trim() || undefined,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

function getCustomerOrderUrl(order: Pick<OrderEmailPayload, "orderId" | "orderNumber" | "userId">) {
  const appUrl = getAppUrl();
  if (order.userId) {
    return `${appUrl}/orders/${encodeURIComponent(order.orderNumber)}`;
  }
  return buildGuestOrderSuccessUrl(order.orderId, appUrl);
}

function buildConfirmationHtml(order: OrderEmailPayload, storeName: string, supportEmail: string) {
  const orderUrl = getCustomerOrderUrl(order);
  const greeting = order.customerName.trim()
    ? `Hi ${escapeHtml(order.customerName.trim())},`
    : "Hi,";

  const bodyHtml = `
    <p style="margin:0 0 14px">${greeting}</p>
    <p style="margin:0 0 14px;line-height:1.65;color:#4b5563">
      Thank you for shopping with us. Your order <strong>${escapeHtml(order.orderNumber)}</strong> has been received and is now being processed.
    </p>
    <div style="background:#E8F5EE;border-radius:12px;padding:14px 16px;margin:0 0 16px">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0B4D3A;text-transform:uppercase;letter-spacing:0.08em">Order summary</p>
      <p style="margin:0;line-height:1.6;color:#1A1D1F">
        Payment: <strong>${escapeHtml(PAYMENT_METHOD_LABELS[order.paymentMethod])}</strong> ·
        Status: <strong>${escapeHtml(ORDER_STATUS_LABELS[order.status])}</strong>
        ${order.couponCode ? `<br/>Coupon: <strong>${escapeHtml(order.couponCode)}</strong>` : ""}
      </p>
    </div>
    ${orderItemsTableHtml(order.items)}
    ${orderSummaryHtml(order)}
    ${shippingBlockHtml(order)}
    ${ctaButton("View your order", orderUrl)}
    <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#6b7280">
      Questions? Reply to this email or contact us at
      <a href="mailto:${escapeHtml(supportEmail)}" style="color:#16875D;text-decoration:none;font-weight:600">${escapeHtml(supportEmail)}</a>.
    </p>`;

  return renderEmailLayout({
    storeName,
    title: "Order confirmed",
    preheader: `Your order ${order.orderNumber} is confirmed.`,
    bodyHtml,
  });
}

const STATUS_EMAIL_COPY: Partial<
  Record<OrderStatus, { title: string; message: string; preheader: string }>
> = {
  PROCESSING: {
    title: "Order is being prepared",
    message: "Good news — we have started preparing your order for dispatch.",
    preheader: "Your order is now being prepared.",
  },
  SHIPPED: {
    title: "Your order is on the way",
    message: "Your package has been shipped and is on its way to you.",
    preheader: "Your order has been shipped.",
  },
  DELIVERED: {
    title: "Order delivered",
    message: "Your order has been marked as delivered. We hope you enjoy your products.",
    preheader: "Your order has been delivered.",
  },
  CANCELLED: {
    title: "Order cancelled",
    message: "Your order has been cancelled. If this was unexpected, please contact our support team.",
    preheader: "Your order has been cancelled.",
  },
};

function buildStatusUpdateHtml(
  order: OrderEmailPayload,
  status: OrderStatus,
  storeName: string,
  supportEmail: string
) {
  const copy = STATUS_EMAIL_COPY[status];
  if (!copy) return null;

  const orderUrl = getCustomerOrderUrl(order);
  const greeting = order.customerName.trim()
    ? `Hi ${escapeHtml(order.customerName.trim())},`
    : "Hi,";

  const bodyHtml = `
    <p style="margin:0 0 14px">${greeting}</p>
    <p style="margin:0 0 14px;line-height:1.65;color:#4b5563">${copy.message}</p>
    <div style="background:#E8F5EE;border-radius:12px;padding:14px 16px;margin:0 0 16px">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0B4D3A;text-transform:uppercase;letter-spacing:0.08em">Order ${escapeHtml(order.orderNumber)}</p>
      <p style="margin:0;line-height:1.6;color:#1A1D1F">
        Status: <strong>${escapeHtml(ORDER_STATUS_LABELS[order.status])}</strong><br/>
        Payment: <strong>${escapeHtml(PAYMENT_STATUS_LABELS[order.paymentStatus])}</strong> ·
        ${escapeHtml(PAYMENT_METHOD_LABELS[order.paymentMethod])}
      </p>
    </div>
    ${orderItemsTableHtml(order.items)}
    ${orderSummaryHtml(order)}
    ${ctaButton("Track your order", orderUrl)}
    <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#6b7280">
      Need help? Contact
      <a href="mailto:${escapeHtml(supportEmail)}" style="color:#16875D;text-decoration:none;font-weight:600">${escapeHtml(supportEmail)}</a>.
    </p>`;

  return renderEmailLayout({
    storeName,
    title: copy.title,
    preheader: copy.preheader,
    bodyHtml,
  });
}

function buildAdminNewOrderHtml(order: OrderEmailPayload, storeName: string) {
  const appUrl = getAppUrl();
  const adminUrl = `${appUrl}/admin/orders`;

  const bodyHtml = `
    <p style="margin:0 0 14px;line-height:1.65;color:#4b5563">
      A new order has been placed on <strong>${escapeHtml(storeName)}</strong>.
    </p>
    <div style="background:#E8F5EE;border-radius:12px;padding:14px 16px;margin:0 0 16px">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0B4D3A;text-transform:uppercase;letter-spacing:0.08em">${escapeHtml(order.orderNumber)}</p>
      <p style="margin:0;line-height:1.6;color:#1A1D1F">
        Customer: <strong>${escapeHtml(order.customerName)}</strong><br/>
        Phone: ${escapeHtml(order.phone)}${order.email ? `<br/>Email: ${escapeHtml(order.email)}` : ""}<br/>
        Total: <strong>${formatEmailMoney(order.total)}</strong> · ${escapeHtml(PAYMENT_METHOD_LABELS[order.paymentMethod])}
      </p>
    </div>
    ${orderItemsTableHtml(order.items)}
    ${ctaButton("Open in admin", adminUrl)}`;

  return renderEmailLayout({
    storeName,
    title: "New order received",
    preheader: `New order ${order.orderNumber} · ${formatEmailMoney(order.total)}`,
    bodyHtml,
    footerNote: `${storeName} · Admin notification`,
  });
}

export async function sendOrderConfirmationEmail(
  order: OrderWithItems
): Promise<SendOrderEmailResult> {
  const payload = toOrderEmailPayload(order);
  if (!isValidEmail(payload.email)) {
    return { ok: true, skipped: true };
  }

  const store = await getPublicStoreSettings();
  const html = buildConfirmationHtml(payload, store.storeName, store.supportEmail);

  return sendOrderEmail({
    to: payload.email,
    subject: `Order confirmed — ${payload.orderNumber} | ${store.storeName}`,
    html,
    logLabel: "order-confirmation",
  });
}

export async function sendOrderStatusEmail(
  order: OrderWithItems,
  status: OrderStatus
): Promise<SendOrderEmailResult> {
  const payload = toOrderEmailPayload({ ...order, status });
  if (!isValidEmail(payload.email)) {
    return { ok: true, skipped: true };
  }

  const store = await getPublicStoreSettings();
  const html = buildStatusUpdateHtml(payload, status, store.storeName, store.supportEmail);
  if (!html) {
    return { ok: true, skipped: true };
  }

  const copy = STATUS_EMAIL_COPY[status]!;

  return sendOrderEmail({
    to: payload.email,
    subject: `${copy.title} — ${payload.orderNumber} | ${store.storeName}`,
    html,
    logLabel: `order-status-${status.toLowerCase()}`,
  });
}

export async function sendAdminNewOrderEmail(
  order: OrderWithItems
): Promise<SendOrderEmailResult> {
  const payload = toOrderEmailPayload(order);
  const store = await getPublicStoreSettings();
  const adminEmail =
    process.env.ADMIN_EMAIL?.trim() || store.supportEmail?.trim() || "";

  if (!isValidEmail(adminEmail)) {
    return { ok: true, skipped: true };
  }

  const html = buildAdminNewOrderHtml(payload, store.storeName);

  return sendOrderEmail({
    to: adminEmail,
    subject: `New order ${payload.orderNumber} · ${formatEmailMoney(payload.total)}`,
    html,
    logLabel: "admin-new-order",
  });
}

/** Fire-and-forget helper — never blocks checkout/admin flows. */
export function queueOrderEmails(
  tasks: Array<() => Promise<SendOrderEmailResult>>
) {
  for (const task of tasks) {
    void task().catch((error) => {
      console.error("[order-email] send failed:", error);
    });
  }
}
