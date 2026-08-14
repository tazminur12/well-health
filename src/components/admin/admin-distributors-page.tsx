"use client";

import {
  BadgeCheck,
  Handshake,
  Loader2,
  Plus,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminDistributorsTable } from "@/components/admin/admin-distributors-table";
import { Button } from "@/components/ui/button";
import { useAdminDistributors } from "@/hooks/use-admin-distributors";
import {
  type DistributorApplicationFilter,
  type DistributorApplicationStatus,
} from "@/lib/distributors/schemas";
import { cn } from "@/lib/utils";

type DistributorSort = "Newest" | "Oldest" | "Name A-Z";

const typeFilters: { id: DistributorApplicationFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "reviewing", label: "Reviewing" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "archived", label: "Archived" },
];

const sortOptions: DistributorSort[] = ["Newest", "Oldest", "Name A-Z"];

const filterToStatus: Record<Exclude<DistributorApplicationFilter, "all">, DistributorApplicationStatus> =
  {
    new: "NEW",
    reviewing: "REVIEWING",
    approved: "APPROVED",
    rejected: "REJECTED",
    archived: "ARCHIVED",
  };

export function AdminDistributorsPage() {
  const { data, isLoading, isError, error, refetch } = useAdminDistributors("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<DistributorSort>("Newest");
  const [typeFilter, setTypeFilter] = useState<DistributorApplicationFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const applications = useMemo(() => data?.items ?? [], [data?.items]);
  const stats = data?.stats;

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = applications.filter((item) => {
      const matchesSearch =
        !query ||
        item.fullName.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.phone.toLowerCase().includes(query) ||
        item.district.toLowerCase().includes(query) ||
        item.division.toLowerCase().includes(query) ||
        item.coverageArea.toLowerCase().includes(query) ||
        (item.businessName?.toLowerCase().includes(query) ?? false);

      const matchesType =
        typeFilter === "all" ? true : item.status === filterToStatus[typeFilter];

      return matchesSearch && matchesType;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "Oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "Name A-Z") {
        return a.fullName.localeCompare(b.fullName);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [applications, search, sortBy, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filteredApplications.slice((safePage - 1) * pageSize, safePage * pageSize);

  const summaryCards = [
    {
      icon: Users,
      tone: "text-neutral-700",
      value: String(stats?.total ?? 0),
      label: "Total applications",
    },
    {
      icon: UserPlus,
      tone: "text-brand-green-600",
      value: String(stats?.new ?? 0),
      label: "New this queue",
    },
    {
      icon: Search,
      tone: "text-blue-600",
      value: String(stats?.reviewing ?? 0),
      label: "In review",
    },
    {
      icon: BadgeCheck,
      tone: "text-emerald-700",
      value: String(stats?.approved ?? 0),
      label: "Approved partners",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-600">
            Partnerships
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-neutral-900">Distributors</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Review partnership applications, territories, and partner status.
          </p>
        </div>

        <Button
          asChild
          className="h-11 rounded-xl bg-brand-green-600 px-5 text-white hover:bg-brand-green-900"
        >
          <Link href="/admin/distributors/new">
            <Plus className="h-4 w-4" />
            Add Distributor
          </Link>
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.label}
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 shadow-sm"
            >
              <span
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100",
                  card.tone
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="font-heading text-xl font-bold text-neutral-900">{card.value}</p>
                <p className="text-xs text-neutral-500">{card.label}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, phone, or district…"
              value={search}
            />
          </label>

          <select
            className="h-11 min-w-[180px] rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => {
              setSortBy(event.target.value as DistributorSort);
              setPage(1);
            }}
            value={sortBy}
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {typeFilters.map((filter) => {
            const active = filter.id === typeFilter;
            return (
              <button
                key={filter.id}
                className={cn(
                  "inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-green-600 text-white"
                    : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                )}
                onClick={() => {
                  setTypeFilter(filter.id);
                  setPage(1);
                }}
                type="button"
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </section>

      {isLoading ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white text-sm text-neutral-500 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
          Loading distributors…
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center shadow-sm">
          <p className="font-semibold text-red-700">Could not load distributors</p>
          <p className="mt-1 text-sm text-red-600">
            {error instanceof Error ? error.message : "Please try again."}
          </p>
          <Button className="mt-4 rounded-xl" onClick={() => void refetch()} type="button" variant="outline">
            Retry
          </Button>
        </div>
      ) : (
        <AdminDistributorsTable
          applications={visible}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          page={safePage}
          pageSize={pageSize}
          totalFiltered={filteredApplications.length}
        />
      )}

      {applications.length === 0 && !isLoading ? (
        <p className="text-xs text-neutral-400">
          Public applications from /distributor will appear here. You can also add a partner manually.
        </p>
      ) : (
        <p className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
          <Handshake className="h-3.5 w-3.5" />
          Open a row to review the full application, notes, and approval actions.
        </p>
      )}
    </div>
  );
}
