"use client";

import {
  Download,
  Repeat,
  Search,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  type AdminCustomer,
  AdminCustomersTable,
} from "@/components/admin/admin-customers-table";
import { CustomerDetailDrawer } from "@/components/admin/customer-detail-drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CustomerTypeFilter = "All" | "New" | "Repeat" | "VIP";
type CustomerSort = "Newest" | "Oldest" | "Highest Spent" | "Most Orders" | "Name A-Z";

type CustomerHistoryStatus = AdminCustomer["orderHistory"][number]["status"];

type SeedCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
  lastOrderAt: string;
  tag: AdminCustomer["tag"];
  addresses: AdminCustomer["addresses"];
};

const customerTypeFilters: CustomerTypeFilter[] = ["All", "New", "Repeat", "VIP"];

const sortOptions: CustomerSort[] = [
  "Newest",
  "Oldest",
  "Highest Spent",
  "Most Orders",
  "Name A-Z",
];

const historyStatuses: CustomerHistoryStatus[] = [
  "DELIVERED",
  "DELIVERED",
  "SHIPPED",
  "PROCESSING",
  "PAID",
  "PENDING",
  "CANCELLED",
];

const customersSeed: SeedCustomer[] = [
  {
    id: "cust-1",
    name: "Farzana Rahman",
    email: "farzana.rahman@example.com",
    phone: "+8801711223344",
    totalOrders: 12,
    totalSpent: 22150,
    joinedAt: "2025-08-19T10:20:00+06:00",
    lastOrderAt: "2026-07-08T12:10:00+06:00",
    tag: "VIP",
    addresses: [
      {
        id: "addr-1-1",
        label: "Home",
        line1: "House 21, Road 8",
        area: "Dhanmondi",
        city: "Dhaka",
        postalCode: "1209",
        isDefault: true,
      },
      {
        id: "addr-1-2",
        label: "Office",
        line1: "Level 7, Building 14",
        line2: "Banani C/A",
        city: "Dhaka",
        postalCode: "1213",
      },
    ],
  },
  {
    id: "cust-2",
    name: "Naeem Hossain",
    email: "naeem.hossain@example.com",
    phone: "+8801811997755",
    totalOrders: 9,
    totalSpent: 17380,
    joinedAt: "2025-09-05T09:00:00+06:00",
    lastOrderAt: "2026-07-06T15:42:00+06:00",
    tag: "VIP",
    addresses: [
      {
        id: "addr-2-1",
        label: "Home",
        line1: "Flat 3B, House 11",
        area: "Uttara Sector 9",
        city: "Dhaka",
        postalCode: "1230",
        isDefault: true,
      },
    ],
  },
  {
    id: "cust-3",
    name: "Shamim Akter",
    email: "shamim.akter@example.com",
    phone: "+8801966554411",
    totalOrders: 2,
    totalSpent: 2140,
    joinedAt: "2026-06-22T11:30:00+06:00",
    lastOrderAt: "2026-07-09T16:25:00+06:00",
    tag: "New",
    addresses: [
      {
        id: "addr-3-1",
        label: "Primary",
        line1: "House 18, Lane 2",
        area: "Khilgaon",
        city: "Dhaka",
        postalCode: "1219",
        isDefault: true,
      },
    ],
  },
  {
    id: "cust-4",
    name: "Rifat Kabir",
    email: "rifat.kabir@example.com",
    phone: "+8801755771100",
    totalOrders: 1,
    totalSpent: 780,
    joinedAt: "2026-06-28T14:10:00+06:00",
    lastOrderAt: "2026-07-03T10:12:00+06:00",
    tag: "New",
    addresses: [
      {
        id: "addr-4-1",
        label: "Home",
        line1: "House 7, Road 3",
        area: "Bashundhara R/A",
        city: "Dhaka",
        postalCode: "1229",
        isDefault: true,
      },
    ],
  },
  {
    id: "cust-5",
    name: "Mahmudul Hasan",
    email: "mahmudul.hasan@example.com",
    phone: "+8801911335577",
    totalOrders: 7,
    totalSpent: 12860,
    joinedAt: "2025-11-17T08:40:00+06:00",
    lastOrderAt: "2026-07-01T09:16:00+06:00",
    tag: null,
    addresses: [
      {
        id: "addr-5-1",
        label: "Home",
        line1: "Flat 4C, Lake View Tower",
        area: "Agrabad",
        city: "Chattogram",
        postalCode: "4100",
        isDefault: true,
      },
      {
        id: "addr-5-2",
        label: "Parents",
        line1: "House 9, East Nasirabad",
        city: "Chattogram",
        postalCode: "4203",
      },
    ],
  },
  {
    id: "cust-6",
    name: "Tanjila Islam",
    email: "tanjila.islam@example.com",
    phone: "+8801822441133",
    totalOrders: 4,
    totalSpent: 5920,
    joinedAt: "2026-01-09T09:25:00+06:00",
    lastOrderAt: "2026-06-25T13:35:00+06:00",
    tag: null,
    addresses: [
      {
        id: "addr-6-1",
        label: "Home",
        line1: "House 15, Sonadanga",
        city: "Khulna",
        postalCode: "9100",
        isDefault: true,
      },
    ],
  },
  {
    id: "cust-7",
    name: "Jannatul Ferdous",
    email: "jannatul.ferdous@example.com",
    phone: "+8801677449922",
    totalOrders: 15,
    totalSpent: 24750,
    joinedAt: "2025-07-26T12:00:00+06:00",
    lastOrderAt: "2026-07-10T18:05:00+06:00",
    tag: "VIP",
    addresses: [
      {
        id: "addr-7-1",
        label: "Home",
        line1: "House 4, Boyra",
        city: "Khulna",
        postalCode: "9000",
        isDefault: true,
      },
      {
        id: "addr-7-2",
        label: "Office",
        line1: "Level 5, KDA Avenue",
        city: "Khulna",
        postalCode: "9100",
      },
    ],
  },
  {
    id: "cust-8",
    name: "Sajidul Alam",
    email: "sajidul.alam@example.com",
    phone: "+8801766112255",
    totalOrders: 3,
    totalSpent: 3290,
    joinedAt: "2026-03-12T10:45:00+06:00",
    lastOrderAt: "2026-06-14T11:22:00+06:00",
    tag: null,
    addresses: [
      {
        id: "addr-8-1",
        label: "Primary",
        line1: "House 2, Court Point",
        city: "Sylhet",
        postalCode: "3100",
        isDefault: true,
      },
    ],
  },
  {
    id: "cust-9",
    name: "Mim Nusrat",
    email: "mim.nusrat@example.com",
    phone: "+8801533447766",
    totalOrders: 5,
    totalSpent: 8740,
    joinedAt: "2025-12-04T07:50:00+06:00",
    lastOrderAt: "2026-06-05T17:31:00+06:00",
    tag: null,
    addresses: [
      {
        id: "addr-9-1",
        label: "Home",
        line1: "House 20, Laxmipur",
        city: "Rajshahi",
        postalCode: "6000",
        isDefault: true,
      },
    ],
  },
  {
    id: "cust-10",
    name: "Arif Chowdhury",
    email: "arif.chowdhury@example.com",
    phone: "+8801710554488",
    totalOrders: 6,
    totalSpent: 11020,
    joinedAt: "2025-10-10T16:20:00+06:00",
    lastOrderAt: "2026-06-30T19:10:00+06:00",
    tag: null,
    addresses: [
      {
        id: "addr-10-1",
        label: "Home",
        line1: "Flat B2, House 12",
        area: "Shyamoli",
        city: "Dhaka",
        postalCode: "1207",
        isDefault: true,
      },
      {
        id: "addr-10-2",
        label: "Village",
        line1: "Shibpur, Belabo",
        city: "Narsingdi",
        postalCode: "1630",
      },
    ],
  },
];

const customersData: AdminCustomer[] = customersSeed.map((seed) => ({
  ...seed,
  orderHistory: createOrderHistory(seed.id, seed.totalOrders, seed.totalSpent, seed.lastOrderAt),
}));

const summaryCards = [
  { icon: Users, tone: "text-neutral-700", text: "128 Total Customers" },
  { icon: UserPlus, tone: "text-brand-green-600", text: "12 New This Month" },
  { icon: TrendingUp, tone: "text-neutral-700", text: "৳ 18,500 Avg. Lifetime Value" },
  { icon: Repeat, tone: "text-neutral-700", text: "34 Repeat Customers" },
];

function createOrderHistory(
  customerId: string,
  totalOrders: number,
  totalSpent: number,
  lastOrderAt: string
): AdminCustomer["orderHistory"] {
  const count = Math.min(Math.max(totalOrders, 3), 8);
  const avgValue = Math.max(450, Math.round(totalSpent / Math.max(totalOrders, 1)));

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(lastOrderAt);
    date.setDate(date.getDate() - index * 11);

    const multiplier = 1 + ((count - index) % 3) * 0.14;
    const itemCount = 1 + ((count + index) % 4);

    return {
      id: `${customerId}-order-${index + 1}`,
      orderNumber: `WHT-2026-${String(1020 + index + Number(customerId.replace("cust-", ""))).padStart(5, "0")}`,
      date: date.toISOString(),
      itemCount,
      total: Math.round(avgValue * multiplier),
      status: historyStatuses[index % historyStatuses.length],
    };
  });
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<CustomerSort>("Newest");
  const [typeFilter, setTypeFilter] = useState<CustomerTypeFilter>("All");
  const [pageSize, setPageSize] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = customersData.filter((customer) => {
      const matchesSearch =
        !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "All"
          ? true
          : typeFilter === "VIP"
            ? customer.tag === "VIP"
            : typeFilter === "New"
              ? customer.tag === "New"
              : customer.totalOrders > 1;

      return matchesSearch && matchesType;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "Newest") {
        return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
      }

      if (sortBy === "Oldest") {
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      }

      if (sortBy === "Highest Spent") {
        return b.totalSpent - a.totalSpent;
      }

      if (sortBy === "Most Orders") {
        return b.totalOrders - a.totalOrders;
      }

      return a.name.localeCompare(b.name);
    });
  }, [search, sortBy, typeFilter]);

  const visibleCustomers = filteredCustomers.slice(0, pageSize);

  function handleViewCustomer(customer: AdminCustomer) {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900">Customers</h1>
          <p className="mt-1 text-sm text-neutral-500">View and manage your customer base</p>
        </div>

        <Button className="h-10 rounded-lg" variant="outline">
          <Download className="h-4 w-4" />
          Export Customers
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.text}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
            >
              <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100", card.tone)}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <p className="text-sm font-medium text-neutral-700">{card.text}</p>
            </article>
          );
        })}
      </section>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[280px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or phone..."
              value={search}
            />
          </label>

          <select
            className="h-10 min-w-[190px] rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => setSortBy(event.target.value as CustomerSort)}
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
          {customerTypeFilters.map((filter) => {
            const active = filter === typeFilter;

            return (
              <button
                key={filter}
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-green-600 text-white"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                )}
                onClick={() => setTypeFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            );
          })}
        </div>
      </section>

      <AdminCustomersTable
        customers={visibleCustomers}
        onPageSizeChange={setPageSize}
        onView={handleViewCustomer}
        pageSize={pageSize}
        totalCustomers={128}
      />

      <CustomerDetailDrawer
        customer={selectedCustomer}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      />
    </div>
  );
}
