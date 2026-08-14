"use client";

import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import Link from "next/link";

import {
  businessTypeLabels,
  distributorStatusMeta,
  type AdminDistributorApplication,
} from "@/lib/distributors/schemas";
import { cn } from "@/lib/utils";

const avatarTones = [
  "bg-[linear-gradient(135deg,#e8f5ee_0%,#cfe8dc_100%)] text-brand-green-700",
  "bg-[linear-gradient(135deg,#edf5ff_0%,#dbe8fb_100%)] text-blue-700",
  "bg-[linear-gradient(135deg,#fff4e8_0%,#f7e1c6_100%)] text-amber-700",
  "bg-[linear-gradient(135deg,#f3f0ff_0%,#e2dafb_100%)] text-purple-700",
  "bg-[linear-gradient(135deg,#ffeef0_0%,#f8dce0_100%)] text-rose-700",
];

export function distributorInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function distributorAvatarTone(name: string) {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarTones[hash % avatarTones.length];
}

export function formatDistributorDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

type AdminDistributorsTableProps = {
  applications: AdminDistributorApplication[];
  totalFiltered: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: number) => void;
};

export function AdminDistributorsTable({
  applications,
  totalFiltered,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: AdminDistributorsTableProps) {
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
              <th className="px-4 py-3.5">Partner</th>
              <th className="px-4 py-3.5">Phone</th>
              <th className="px-4 py-3.5">Territory</th>
              <th className="px-4 py-3.5">Business</th>
              <th className="px-4 py-3.5">Applied</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((item) => (
              <tr
                key={item.id}
                className="border-b border-neutral-100 text-sm transition-colors hover:bg-brand-green-100/30"
              >
                <td className="px-4 py-3.5">
                  <Link className="flex items-center gap-3" href={`/admin/distributors/${item.id}`}>
                    <span
                      className={cn(
                        "inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                        distributorAvatarTone(item.fullName)
                      )}
                    >
                      {distributorInitials(item.fullName)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-neutral-900">
                        {item.fullName}
                      </span>
                      <span className="block truncate text-xs text-neutral-500">{item.email}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3.5 text-neutral-700">{item.phone}</td>
                <td className="px-4 py-3.5">
                  <p className="font-medium text-neutral-800">
                    {item.district}, {item.division}
                  </p>
                  <p className="truncate text-xs text-neutral-500">{item.coverageArea}</p>
                </td>
                <td className="px-4 py-3.5">
                  <p className="font-medium text-neutral-800">
                    {businessTypeLabels[item.businessType]}
                  </p>
                  <p className="truncate text-xs text-neutral-500">
                    {item.businessName || "—"}
                  </p>
                </td>
                <td className="px-4 py-3.5 text-neutral-700">
                  {formatDistributorDate(item.createdAt)}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      distributorStatusMeta[item.status].pill
                    )}
                  >
                    {distributorStatusMeta[item.status].label}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex justify-end">
                    <Link
                      aria-label={`View ${item.fullName}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                      href={`/admin/distributors/${item.id}`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {applications.length === 0 ? (
              <tr>
                <td className="px-4 py-12 text-center text-sm text-neutral-500" colSpan={7}>
                  No distributors found for the selected filters.
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
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
      </footer>
    </div>
  );
}
