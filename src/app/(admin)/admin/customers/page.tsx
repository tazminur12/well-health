"use client";

import {
  Loader2,
  Plus,
  Repeat,
  Search,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminCustomersTable } from "@/components/admin/admin-customers-table";
import type { AdminCustomer } from "@/components/admin/customers-data";
import { formatCustomerPrice } from "@/components/admin/customers-data";
import { Button } from "@/components/ui/button";
import { useAdminCustomers } from "@/hooks/use-admin-customers";
import { cn } from "@/lib/utils";

type CustomerTypeFilter = "All" | "New" | "VIP" | "Active" | "Suspended";
type CustomerSort = "Newest" | "Oldest" | "Name A-Z" | "VIP first";

const typeFilters: CustomerTypeFilter[] = ["All", "New", "VIP", "Active", "Suspended"];
const sortOptions: CustomerSort[] = ["Newest", "Oldest", "Name A-Z", "VIP first"];

export default function AdminCustomersPage() {
  const { data: customers = [], isLoading, isError, error, refetch } = useAdminCustomers();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<CustomerSort>("Newest");
  const [typeFilter, setTypeFilter] = useState<CustomerTypeFilter>("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const newThisMonth = customers.filter(
      (customer) => new Date(customer.joinedAt).getTime() >= monthStart
    ).length;
    const vip = customers.filter((customer) => customer.isVip).length;
    const active = customers.filter((customer) => customer.status === "Active").length;
    return {
      total: customers.length,
      newThisMonth,
      vip,
      active,
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = customers.filter((customer) => {
      const matchesSearch =
        !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "All"
          ? true
          : typeFilter === "VIP"
            ? customer.isVip || customer.tag === "VIP"
            : typeFilter === "New"
              ? customer.tag === "New"
              : typeFilter === "Active"
                ? customer.status === "Active"
                : customer.status === "Suspended";

      return matchesSearch && matchesType;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "Oldest") {
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      }
      if (sortBy === "Name A-Z") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "VIP first") {
        return Number(b.isVip) - Number(a.isVip) || a.name.localeCompare(b.name);
      }
      return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
    });
  }, [customers, search, sortBy, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleCustomers = filteredCustomers.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const summaryCards = [
    { icon: Users, tone: "text-neutral-700", value: String(stats.total), label: "Total customers" },
    {
      icon: UserPlus,
      tone: "text-brand-green-600",
      value: String(stats.newThisMonth),
      label: "New this month",
    },
    {
      icon: TrendingUp,
      tone: "text-[#8a6d2d]",
      value: String(stats.vip),
      label: "VIP accounts",
    },
    {
      icon: Repeat,
      tone: "text-neutral-700",
      value: String(stats.active),
      label: "Active accounts",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-600">
            CRM
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-neutral-900">Customers</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage registered shoppers, VIP flags, and account status.
          </p>
        </div>

        <Button
          asChild
          className="h-11 rounded-xl bg-brand-green-600 px-5 text-white hover:bg-brand-green-900"
        >
          <Link href="/admin/customers/new">
            <Plus className="h-4 w-4" />
            Add Customer
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
              placeholder="Search by name, email, or phone…"
              value={search}
            />
          </label>

          <select
            className="h-11 min-w-[180px] rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => {
              setSortBy(event.target.value as CustomerSort);
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
            const active = filter === typeFilter;
            return (
              <button
                key={filter}
                className={cn(
                  "inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-green-600 text-white"
                    : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                )}
                onClick={() => {
                  setTypeFilter(filter);
                  setPage(1);
                }}
                type="button"
              >
                {filter}
              </button>
            );
          })}
        </div>
      </section>

      {isLoading ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white text-sm text-neutral-500 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
          Loading customers…
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center shadow-sm">
          <p className="font-semibold text-red-700">Could not load customers</p>
          <p className="mt-1 text-sm text-red-600">
            {error instanceof Error ? error.message : "Please try again."}
          </p>
          <Button className="mt-4 rounded-xl" onClick={() => void refetch()} type="button" variant="outline">
            Retry
          </Button>
        </div>
      ) : (
        <AdminCustomersTable
          customers={visibleCustomers}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          page={safePage}
          pageSize={pageSize}
          totalFiltered={filteredCustomers.length}
        />
      )}

      <p className="text-xs text-neutral-400">
        Order totals stay at {formatCustomerPrice(0)} until the Orders backend is connected.
        {(customers as AdminCustomer[]).length === 0 ? " Add your first customer to get started." : ""}
      </p>
    </div>
  );
}
