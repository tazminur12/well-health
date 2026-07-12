"use client";

import { ChevronLeft, ChevronRight, Eye, Pencil } from "lucide-react";
import Link from "next/link";

import {
  type AdminCustomer,
  customerAvatarTone,
  customerInitials,
  customerStatusPillClass,
  customerTagPillClass,
  formatCustomerDate,
  formatCustomerPrice,
  formatRelativeDays,
} from "@/components/admin/customers-data";
import { cn } from "@/lib/utils";

type AdminCustomersTableProps = {
  customers: AdminCustomer[];
  totalFiltered: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: number) => void;
};

export function AdminCustomersTable({
  customers,
  totalFiltered,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: AdminCustomersTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(page, totalPages);
  const showingStart = totalFiltered === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingEnd = Math.min(safePage * pageSize, totalFiltered);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1080px] w-full text-left">
          <thead className="border-b border-neutral-200 bg-neutral-50/70 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3.5">Customer</th>
              <th className="px-4 py-3.5">Phone</th>
              <th className="px-4 py-3.5 text-center">Orders</th>
              <th className="px-4 py-3.5 text-right">Total Spent</th>
              <th className="px-4 py-3.5">Last Order</th>
              <th className="px-4 py-3.5">Joined</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Tag</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-neutral-100 text-sm transition-colors hover:bg-brand-green-100/30"
              >
                <td className="px-4 py-3.5">
                  <Link className="flex items-center gap-3" href={`/admin/customers/${customer.id}`}>
                    <span
                      className={cn(
                        "inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                        customerAvatarTone(customer.name)
                      )}
                    >
                      {customerInitials(customer.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-neutral-900">
                        {customer.name}
                      </span>
                      <span className="block truncate text-xs text-neutral-500">
                        {customer.email}
                      </span>
                    </span>
                  </Link>
                </td>

                <td className="px-4 py-3.5 text-neutral-700">{customer.phone}</td>

                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                    {customer.totalOrders}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-right font-semibold text-brand-green-600">
                  {formatCustomerPrice(customer.totalSpent)}
                </td>

                <td className="px-4 py-3.5 text-neutral-700">
                  {formatRelativeDays(customer.lastOrderAt)}
                </td>

                <td className="px-4 py-3.5 text-neutral-700">
                  {formatCustomerDate(customer.joinedAt)}
                </td>

                <td className="px-4 py-3.5">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      customerStatusPillClass(customer.status)
                    )}
                  >
                    {customer.status}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  {customer.tag ? (
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        customerTagPillClass(customer.tag)
                      )}
                    >
                      {customer.tag}
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400">—</span>
                  )}
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex justify-end gap-1">
                    <Link
                      aria-label={`View ${customer.name}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                      href={`/admin/customers/${customer.id}`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                    <Link
                      aria-label={`Edit ${customer.name}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-brand-green-700 transition-colors hover:bg-brand-green-100"
                      href={`/admin/customers/${customer.id}/edit`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}

            {customers.length === 0 ? (
              <tr>
                <td className="px-4 py-12 text-center text-sm text-neutral-500" colSpan={9}>
                  No customers found for the selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 text-sm text-neutral-500">
        <p>
          Showing {showingStart}–{showingEnd} of {totalFiltered}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <span className="px-2 text-neutral-600">
            {safePage} / {totalPages}
          </span>
          <button
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
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
              <option value={8}>8</option>
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
