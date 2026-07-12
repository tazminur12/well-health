import type {
  OrderStatusValue,
  PaymentMethodValue,
  PaymentStatusValue,
} from "@/lib/orders/schemas";

export type CustomerOrderStatus = OrderStatusValue;

export type CustomerOrderItem = {
  id: string;
  productId: string | null;
  name: string;
  slug: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string | null;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  status: CustomerOrderStatus;
  placedAt: string;
  updatedAt: string;
  items: CustomerOrderItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethodValue;
  paymentStatus: PaymentStatusValue;
  couponCode: string | null;
  notes: string | null;
  shippingFullName: string;
  shippingPhone: string;
  shippingDetails: string;
  shippingArea: string;
  shippingDistrict: string;
  shippingZoneName: string | null;
  cancelReason?: string | null;
};

export type CustomerOrderStats = {
  totalOrders: number;
  pendingOrders: number;
  totalSpent: number;
};

export const orderStatusPillClass: Record<CustomerOrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-brand-green-100 text-brand-green-600",
  CANCELLED: "bg-red-100 text-red-700",
};

export { formatPrice } from "@/lib/format-price";

export function formatOrderDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function formatOrderDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function orderItemCount(order: CustomerOrder) {
  return order.itemCount || order.items.reduce((sum, item) => sum + item.quantity, 0);
}

export const orderStatusFilters: Array<{
  label: string;
  value: CustomerOrderStatus | "ALL";
}> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export type TimelineStepState = "completed" | "current" | "upcoming";

export type TimelineStep = {
  key: string;
  label: string;
  timestamp?: string;
  state: TimelineStepState;
};

const prepaidTimeline: Array<{ key: string; label: string; statuses: CustomerOrderStatus[] }> = [
  { key: "placed", label: "Order Placed", statuses: ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
  { key: "payment", label: "Payment Confirmed", statuses: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
  { key: "processing", label: "Processing", statuses: ["PROCESSING", "SHIPPED", "DELIVERED"] },
  { key: "shipped", label: "Shipped", statuses: ["SHIPPED", "DELIVERED"] },
  { key: "delivered", label: "Delivered", statuses: ["DELIVERED"] },
];

const codTimeline: Array<{ key: string; label: string; statuses: CustomerOrderStatus[] }> = [
  { key: "placed", label: "Order Placed", statuses: ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
  { key: "processing", label: "Processing", statuses: ["PROCESSING", "SHIPPED", "DELIVERED", "PAID"] },
  { key: "shipped", label: "Out for Delivery", statuses: ["SHIPPED", "DELIVERED"] },
  { key: "delivered", label: "Delivered · Paid", statuses: ["DELIVERED"] },
];

function currentStepIndex(
  steps: Array<{ statuses: CustomerOrderStatus[] }>,
  status: CustomerOrderStatus
) {
  let index = 0;
  for (let i = 0; i < steps.length; i += 1) {
    if (steps[i]!.statuses.includes(status)) index = i;
  }
  return index;
}

export function buildTimeline(order: CustomerOrder): TimelineStep[] {
  if (order.status === "CANCELLED") return [];

  const steps = order.paymentMethod === "COD" ? codTimeline : prepaidTimeline;
  const currentIndex = currentStepIndex(steps, order.status);
  const delivered = order.status === "DELIVERED";

  return steps.map((step, index) => {
    let state: TimelineStepState;
    if (delivered || index < currentIndex) state = "completed";
    else if (index === currentIndex) state = "current";
    else state = "upcoming";

    return {
      key: step.key,
      label: step.label,
      timestamp:
        state === "upcoming"
          ? undefined
          : index === 0
            ? formatOrderDate(order.placedAt)
            : state === "completed"
              ? formatOrderDate(order.updatedAt)
              : "In progress",
      state,
    };
  });
}
