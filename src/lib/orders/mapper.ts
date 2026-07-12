import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

import type { AdminOrder, AdminOrderItem } from "@/lib/orders/schemas";

type OrderWithItems = Order & { items: OrderItem[] };

function decimalToNumber(value: { toString(): string } | number) {
  if (typeof value === "number") return value;
  return Number(value);
}

export function mapOrderItemToAdmin(item: OrderItem): AdminOrderItem {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    productSlug: item.productSlug,
    unitPrice: decimalToNumber(item.unitPrice),
    quantity: item.quantity,
    lineTotal: decimalToNumber(item.lineTotal),
    imageUrl: item.imageUrl,
  };
}

export function mapOrderToAdmin(order: OrderWithItems): AdminOrder {
  const items = order.items.map(mapOrderItemToAdmin);
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    email: order.email,
    phone: order.phone,
    customerName: order.customerName,
    shippingFullName: order.shippingFullName,
    shippingPhone: order.shippingPhone,
    shippingDistrict: order.shippingDistrict,
    shippingArea: order.shippingArea,
    shippingDetails: order.shippingDetails,
    shippingZoneId: order.shippingZoneId,
    shippingZoneName: order.shippingZoneName,
    shippingFee: decimalToNumber(order.shippingFee),
    subtotal: decimalToNumber(order.subtotal),
    discount: decimalToNumber(order.discount),
    total: decimalToNumber(order.total),
    paymentMethod: order.paymentMethod as PaymentMethod,
    paymentStatus: order.paymentStatus as PaymentStatus,
    status: order.status as OrderStatus,
    notes: order.notes,
    couponCode: order.couponCode,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items,
  };
}
