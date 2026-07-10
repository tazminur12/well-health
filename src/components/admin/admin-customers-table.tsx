"use client";

import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

import { cn } from "@/lib/utils";

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
  city: string;
  postalCode: string;
  isDefault?: boolean;
};

export type CustomerTag = "VIP" | "New" | null;

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
  joinedAt: string;
  tag: CustomerTag;
  addresses: CustomerAddress[];
  orderHistory: CustomerOrderHistoryItem[];
};

type AdminCustomersTableProps = {
  customers: AdminCustomer[];
  totalCustomers: number;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  onView: (customer: AdminCustomer) => void;
};

const avatarTones = [
  "bg-[linear-gradient(135deg,#e8f5ee_0%,#cfe8dc_100%)] text-brand-green-700",
  "bg-[linear-gradient(135deg,#edf5ff_0%,#dbe8fb_100%)] text-blue-700",
  "bg-[linear-gradient(135deg,#fff4e8_0%,#f7e1c6_100%)] text-amber-700",
  "bg-[linear-gradient(135deg,#f3f0ff_0%,#e2dafb_100%)] text-purple-700",
  "bg-[linear-gradient(135deg,#ffeef0_0%,#f8dce0_100%)] text-rose-700",
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  })
    .format(value)
    .replace("BDT", "৳");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatRelativeDays(value: string) {
  const now = Date.now();
  const then = new Date(value).getTime();
  const dayDiff = Math.max(1, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
  return dayDiff === 1 ? "1 day ago" : `${dayDiff} days ago`;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function getAvatarTone(name: string) {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarTones[hash % avatarTones.length];
}

export function customerTagPillClass(tag: CustomerTag) {
  if (tag === "VIP") {
    return "bg-gold-accent/20 text-gold-accent";
  }

  if (tag === "New") {
    return "bg-brand-green-100 text-brand-green-700";
  }

  return "";
}

export function AdminCustomersTable({
  customers,
  totalCustomers,
  pageSize,
  onPageSizeChange,
  onView,
}: AdminCustomersTableProps) {
  const showingEnd = customers.length;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full text-left">
          <thead className="border-b border-neutral-200 bg-neutral-50/70 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3 text-center">Orders</th>
              <th className="px-4 py-3 text-right">Total Spent</th>
              <th className="px-4 py-3">Last Order</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Tag</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="cursor-pointer border-b border-neutral-100 text-sm hover:bg-neutral-100"
                onClick={() => onView(customer)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                        getAvatarTone(customer.name)
                      )}
                    >
                      {getInitials(customer.name)}
                    </span>

                    <div>
                      <p className="font-semibold text-neutral-900">{customer.name}</p>
                      <p className="text-xs text-neutral-500">{customer.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 text-neutral-700">{customer.phone}</td>

                <td className="px-4 py-3 text-center">
                  <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                    {customer.totalOrders}
                  </span>
                </td>

                <td className="px-4 py-3 text-right font-semibold text-brand-green-600">
                  {formatPrice(customer.totalSpent)}
                </td>

                <td className="px-4 py-3 text-neutral-700">{formatRelativeDays(customer.lastOrderAt)}</td>

                <td className="px-4 py-3 text-neutral-700">{formatDate(customer.joinedAt)}</td>

                <td className="px-4 py-3">
                  {customer.tag ? (
                    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", customerTagPillClass(customer.tag))}>
                      {customer.tag}
                    </span>
                  ) : (
                    <span className="inline-flex h-5 w-8" />
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <button
                      aria-label={`View details for ${customer.name}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900"
                      onClick={(event) => {
                        event.stopPropagation();
                        onView(customer);
                      }}
                      title="View Details"
                      type="button"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {customers.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-neutral-500" colSpan={8}>
                  No customers found for the selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 text-sm text-neutral-500">
        <p>
          Showing 1-{showingEnd} of {totalCustomers}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          <button
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={customers.length < pageSize}
            type="button"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>

          <label className="inline-flex items-center gap-2 pl-1 text-neutral-600">
            <span>Per page</span>
            <select
              className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              value={pageSize}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
      </footer>
    </div>
  );
}

export function formatCustomerPrice(value: number) {
  return formatPrice(value);
}

export function formatCustomerDate(value: string) {
  return formatDate(value);
}

export function customerAvatarTone(name: string) {
  return getAvatarTone(name);
}

export function customerInitials(name: string) {
  return getInitials(name);
}