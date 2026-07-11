export type CustomerOrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  imageTone: string;
};

export type CustomerOrder = {
  orderNumber: string;
  status: CustomerOrderStatus;
  placedAt: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: "SSLCommerz" | "bKash" | "Cash on Delivery";
  paymentStatus: "Paid" | "Pending";
  transactionId: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    details: string;
    area: string;
    district: string;
  };
  cancelReason?: string;
};

export const orderStatusPillClass: Record<CustomerOrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-brand-green-100 text-brand-green-600",
  CANCELLED: "bg-red-100 text-red-700",
};

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  })
    .format(value)
    .replace("BDT", "৳");
}

export function formatOrderDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function orderItemCount(order: CustomerOrder) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

const tones = [
  "bg-gradient-to-br from-brand-green-100 to-white",
  "bg-gradient-to-br from-amber-50 to-white",
  "bg-gradient-to-br from-rose-50 to-white",
  "bg-gradient-to-br from-sky-50 to-white",
  "bg-gradient-to-br from-emerald-50 to-white",
];

export const customerOrders: CustomerOrder[] = [
  {
    orderNumber: "WHT-2026-00006",
    status: "PENDING",
    placedAt: "2026-07-11",
    items: [
      { id: "p1", name: "Omega-3 Fish Oil", quantity: 1, unitPrice: 1450, imageTone: tones[0] },
      { id: "p2", name: "Vitamin D3 2000 IU", quantity: 2, unitPrice: 890, imageTone: tones[1] },
    ],
    subtotal: 3230,
    shippingFee: 60,
    total: 3290,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    transactionId: "—",
    shippingAddress: {
      fullName: "Ayesha Rahman",
      phone: "1712345678",
      details: "House 42, Road 8, Block C",
      area: "Dhanmondi",
      district: "Dhaka",
    },
  },
  {
    orderNumber: "WHT-2026-00005",
    status: "PAID",
    placedAt: "2026-07-08",
    items: [
      { id: "p3", name: "Marine Collagen", quantity: 1, unitPrice: 2200, imageTone: tones[2] },
    ],
    subtotal: 2200,
    shippingFee: 60,
    total: 2260,
    paymentMethod: "bKash",
    paymentStatus: "Paid",
    transactionId: "BKH8K2L9QX",
    shippingAddress: {
      fullName: "Ayesha Rahman",
      phone: "1712345678",
      details: "House 42, Road 8, Block C",
      area: "Dhanmondi",
      district: "Dhaka",
    },
  },
  {
    orderNumber: "WHT-2026-00004",
    status: "PROCESSING",
    placedAt: "2026-07-07",
    items: [
      { id: "p4", name: "Daily Probiotic", quantity: 1, unitPrice: 1650, imageTone: tones[3] },
      { id: "p5", name: "Ashwagandha Extract", quantity: 1, unitPrice: 1180, imageTone: tones[4] },
      { id: "p6", name: "Zinc + Vitamin C", quantity: 3, unitPrice: 620, imageTone: tones[0] },
    ],
    subtotal: 4690,
    shippingFee: 60,
    total: 4750,
    paymentMethod: "SSLCommerz",
    paymentStatus: "Paid",
    transactionId: "SSL2026X4821",
    shippingAddress: {
      fullName: "Ayesha Rahman",
      phone: "1712345678",
      details: "House 42, Road 8, Block C",
      area: "Dhanmondi",
      district: "Dhaka",
    },
  },
  {
    orderNumber: "WHT-2026-00003",
    status: "SHIPPED",
    placedAt: "2026-07-05",
    items: [
      { id: "p7", name: "Multivitamin Complete", quantity: 1, unitPrice: 1950, imageTone: tones[1] },
      { id: "p8", name: "Magnesium Glycinate", quantity: 2, unitPrice: 1100, imageTone: tones[2] },
    ],
    subtotal: 4150,
    shippingFee: 60,
    total: 4210,
    paymentMethod: "SSLCommerz",
    paymentStatus: "Paid",
    transactionId: "SSL2026X4655",
    shippingAddress: {
      fullName: "Ayesha Rahman",
      phone: "1712345678",
      details: "House 42, Road 8, Block C",
      area: "Dhanmondi",
      district: "Dhaka",
    },
  },
  {
    orderNumber: "WHT-2026-00002",
    status: "DELIVERED",
    placedAt: "2026-06-28",
    items: [
      { id: "p9", name: "Eyecare-B", quantity: 2, unitPrice: 1350, imageTone: tones[3] },
      { id: "p10", name: "Turmeric Curcumin", quantity: 1, unitPrice: 980, imageTone: tones[4] },
    ],
    subtotal: 3680,
    shippingFee: 60,
    total: 3740,
    paymentMethod: "bKash",
    paymentStatus: "Paid",
    transactionId: "BKH7M1P4RT",
    shippingAddress: {
      fullName: "Ayesha Rahman",
      phone: "1712345678",
      details: "House 42, Road 8, Block C",
      area: "Dhanmondi",
      district: "Dhaka",
    },
  },
  {
    orderNumber: "WHT-2026-00001",
    status: "CANCELLED",
    placedAt: "2026-06-20",
    items: [
      { id: "p11", name: "Collagen Peptides", quantity: 1, unitPrice: 2450, imageTone: tones[0] },
    ],
    subtotal: 2450,
    shippingFee: 60,
    total: 2510,
    paymentMethod: "SSLCommerz",
    paymentStatus: "Pending",
    transactionId: "SSL2026X4102",
    shippingAddress: {
      fullName: "Ayesha Rahman",
      phone: "1712345678",
      details: "House 42, Road 8, Block C",
      area: "Dhanmondi",
      district: "Dhaka",
    },
    cancelReason: "Cancelled at your request before dispatch.",
  },
];

export const orderStatusFilters: Array<{ label: string; value: CustomerOrderStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function getOrderByNumber(orderNumber: string) {
  return customerOrders.find((order) => order.orderNumber === orderNumber);
}

export type TimelineStepState = "completed" | "current" | "upcoming";

export type TimelineStep = {
  key: string;
  label: string;
  timestamp?: string;
  state: TimelineStepState;
};

const timelineOrder: Array<{ key: string; label: string }> = [
  { key: "placed", label: "Order Placed" },
  { key: "payment", label: "Payment Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const statusToCurrentIndex: Record<Exclude<CustomerOrderStatus, "CANCELLED">, number> = {
  PENDING: 1,
  PAID: 2,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
};

export function buildTimeline(order: CustomerOrder): TimelineStep[] {
  if (order.status === "CANCELLED") return [];

  const currentIndex = statusToCurrentIndex[order.status];
  const base = new Date(order.placedAt);

  const timestamps = timelineOrder.map((_, index) => {
    const date = new Date(base);
    date.setDate(date.getDate() + index);
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  });

  const delivered = order.status === "DELIVERED";

  return timelineOrder.map((step, index) => {
    let state: TimelineStepState;
    if (delivered) {
      state = "completed";
    } else if (index < currentIndex) {
      state = "completed";
    } else if (index === currentIndex) {
      state = "current";
    } else {
      state = "upcoming";
    }

    return {
      key: step.key,
      label: step.label,
      timestamp: state === "upcoming" ? undefined : timestamps[index],
      state,
    };
  });
}
