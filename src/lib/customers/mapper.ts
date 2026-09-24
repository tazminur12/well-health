import type { Address, Order, OrderStatus, User, UserStatus as PrismaUserStatus } from "@prisma/client";
import { UserStatus } from "@prisma/client";

import type {
  AdminCustomer,
  CustomerOrderHistoryItem,
  CustomerStatus,
  CustomerTag,
} from "@/components/admin/customers-data";
import { displayCustomerEmail } from "@/lib/customers/sync-from-order";

const NEW_CUSTOMER_DAYS = 30;

export function toUiCustomerStatus(status: PrismaUserStatus): CustomerStatus {
  return status === UserStatus.SUSPENDED ? "Suspended" : "Active";
}

export function toPrismaCustomerStatus(status: CustomerStatus): PrismaUserStatus {
  return status === "Suspended" ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
}

export function deriveCustomerTag(user: Pick<User, "isVip" | "createdAt">): CustomerTag {
  if (user.isVip) return "VIP";
  const ageMs = Date.now() - user.createdAt.getTime();
  if (ageMs <= NEW_CUSTOMER_DAYS * 24 * 60 * 60 * 1000) return "New";
  return null;
}

type CustomerOrderRecord = Pick<
  Order,
  | "id"
  | "orderNumber"
  | "status"
  | "total"
  | "createdAt"
  | "shippingDetails"
  | "shippingArea"
  | "shippingDistrict"
  | "shippingZoneName"
> & { items?: { id: string }[] };

function sameText(left: string, right: string) {
  return left.trim().toLowerCase().replace(/\s+/g, " ") === right.trim().toLowerCase().replace(/\s+/g, " ");
}

function zoneForAddress(address: Address, orders: CustomerOrderRecord[]) {
  const match = orders.find(
    (order) =>
      sameText(order.shippingDetails, address.details) &&
      sameText(order.shippingArea, address.area) &&
      sameText(order.shippingDistrict, address.district)
  );
  return match?.shippingZoneName ?? null;
}

/** Map DB user → admin CRM DTO, including saved addresses and linked orders. */
export function mapUserToAdminCustomer(
  user: User & { addresses?: Address[]; orders?: CustomerOrderRecord[] }
): AdminCustomer {
  const orders = [...(user.orders ?? [])].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  const billable = orders.filter((order) => order.status !== "CANCELLED");
  const orderHistory: CustomerOrderHistoryItem[] = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    date: order.createdAt.toISOString(),
    itemCount: order.items?.length ?? 0,
    total: Number(order.total),
    status: order.status as OrderStatus,
  }));

  return {
    id: user.id,
    name: user.name?.trim() || "Unnamed customer",
    email: displayCustomerEmail(user.email),
    phone: user.phone?.trim() || "—",
    status: toUiCustomerStatus(user.status),
    isVip: user.isVip,
    notes: user.notes ?? "",
    tag: deriveCustomerTag(user),
    totalOrders: billable.length,
    totalSpent: billable.reduce((sum, order) => sum + Number(order.total), 0),
    lastOrderAt: orders[0]?.createdAt.toISOString() ?? null,
    joinedAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    addresses: (user.addresses ?? []).map((address) => ({
      id: address.id,
      label: address.isDefault ? "Default shipping" : "Shipping",
      fullName: address.fullName,
      phone: address.phone,
      line1: address.details,
      area: address.area,
      city: address.district,
      postalCode: "",
      zone: zoneForAddress(address, orders),
      isDefault: address.isDefault,
    })),
    orderHistory,
  };
}
