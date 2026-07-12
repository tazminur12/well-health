export type CustomerStatus = "Active" | "Suspended";
export type CustomerTag = "VIP" | "New" | null;

export type CustomerOrderHistoryItem = {
  id: string;
  orderNumber: string;
  date: string;
  itemCount: number;
  total: number;
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
};

export type CustomerAddress = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  area?: string;
  city: string;
  postalCode: string;
  isDefault?: boolean;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  isVip: boolean;
  notes: string;
  tag: CustomerTag;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
  joinedAt: string;
  updatedAt: string;
  addresses: CustomerAddress[];
  orderHistory: CustomerOrderHistoryItem[];
};

const avatarTones = [
  "bg-[linear-gradient(135deg,#e8f5ee_0%,#cfe8dc_100%)] text-brand-green-700",
  "bg-[linear-gradient(135deg,#edf5ff_0%,#dbe8fb_100%)] text-blue-700",
  "bg-[linear-gradient(135deg,#fff4e8_0%,#f7e1c6_100%)] text-amber-700",
  "bg-[linear-gradient(135deg,#f3f0ff_0%,#e2dafb_100%)] text-purple-700",
  "bg-[linear-gradient(135deg,#ffeef0_0%,#f8dce0_100%)] text-rose-700",
];

export function formatCustomerPrice(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  })
    .format(value)
    .replace("BDT", "৳");
}

export function formatCustomerDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function formatRelativeDays(value: string | null) {
  if (!value) return "—";
  const dayDiff = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24))
  );
  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "1 day ago";
  return `${dayDiff} days ago`;
}

export function customerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function customerAvatarTone(name: string) {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarTones[hash % avatarTones.length];
}

export function customerTagPillClass(tag: CustomerTag) {
  if (tag === "VIP") return "bg-[#C9A24B]/15 text-[#8a6d2d]";
  if (tag === "New") return "bg-brand-green-100 text-brand-green-700";
  return "";
}

export function customerStatusPillClass(status: CustomerStatus) {
  if (status === "Suspended") return "bg-red-50 text-red-700";
  return "bg-brand-green-100 text-brand-green-700";
}
