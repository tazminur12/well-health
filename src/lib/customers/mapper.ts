import type { User, UserStatus as PrismaUserStatus } from "@prisma/client";
import { UserStatus } from "@prisma/client";

import type {
  AdminCustomer,
  CustomerStatus,
  CustomerTag,
} from "@/components/admin/customers-data";

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

/** Map DB user → admin CRM DTO. Order metrics stay 0 until Order model ships. */
export function mapUserToAdminCustomer(user: User): AdminCustomer {
  return {
    id: user.id,
    name: user.name?.trim() || "Unnamed customer",
    email: user.email,
    phone: user.phone?.trim() || "—",
    status: toUiCustomerStatus(user.status),
    isVip: user.isVip,
    notes: user.notes ?? "",
    tag: deriveCustomerTag(user),
    totalOrders: 0,
    totalSpent: 0,
    lastOrderAt: null,
    joinedAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    addresses: [],
    orderHistory: [],
  };
}
