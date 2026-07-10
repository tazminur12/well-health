"use client";

import {
  AlertTriangle,
  CheckCircle,
  Download,
  PackageCheck,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  type AdminOrder,
  AdminOrdersTable,
  type PaymentMethod,
} from "@/components/admin/admin-orders-table";
import { OrderDetailDrawer } from "@/components/admin/order-detail-drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DatePreset = "Today" | "Last 7 Days" | "Last 30 Days" | "Custom Range";

const summaryCards = [
  { icon: PackageCheck, value: "342", label: "Total Orders", tone: "text-neutral-700" },
  { icon: AlertTriangle, value: "28", label: "Pending", tone: "text-amber-600" },
  { icon: Truck, value: "156", label: "Processing/Shipped", tone: "text-indigo-600" },
  { icon: CheckCircle, value: "142", label: "Delivered", tone: "text-brand-green-600" },
  { icon: XCircle, value: "16", label: "Cancelled", tone: "text-red-600" },
];

const statusTabs = [
  { key: "All", label: "All", count: 342 },
  { key: "PENDING", label: "Pending", count: 28 },
  { key: "PAID", label: "Paid", count: 24 },
  { key: "PROCESSING", label: "Processing", count: 73 },
  { key: "SHIPPED", label: "Shipped", count: 83 },
  { key: "DELIVERED", label: "Delivered", count: 142 },
  { key: "CANCELLED", label: "Cancelled", count: 16 },
] as const;

const ordersData: AdminOrder[] = [
  {
    id: "ord-1",
    orderNumber: "WHT-2026-00001",
    customerName: "Amina Rahman",
    customerPhone: "+8801712345001",
    customerEmail: "amina.rahman@example.com",
    placedAt: "2026-07-10T10:22:00+06:00",
    paymentMethod: "SSLCommerz",
    status: "PENDING",
    shippingFee: 80,
    transactionId: "TXN-SSLC-7841201",
    paymentStatus: "Pending",
    shippingAddress: {
      line1: "House 23, Road 7",
      area: "Dhanmondi",
      city: "Dhaka",
      postalCode: "1209",
    },
    items: [
      { id: "1-1", name: "Vision Guard Plus", quantity: 1, unitPrice: 1450, imageTone: "bg-[linear-gradient(135deg,#edf6ff_0%,#d8e9fb_100%)]" },
      { id: "1-2", name: "Daily Multivitamin Core", quantity: 2, unitPrice: 980, imageTone: "bg-[linear-gradient(135deg,#f2f9ed_0%,#deefd2_100%)]" },
    ],
  },
  {
    id: "ord-2",
    orderNumber: "WHT-2026-00002",
    customerName: "Fahim Hasan",
    customerPhone: "+8801811122200",
    customerEmail: "fahim.hasan@example.com",
    placedAt: "2026-07-10T13:10:00+06:00",
    paymentMethod: "bKash",
    status: "PAID",
    shippingFee: 100,
    transactionId: "TXN-BKASH-223190",
    paymentStatus: "Paid",
    shippingAddress: {
      line1: "Flat 5B, House 12",
      line2: "Block C",
      area: "Mirpur DOHS",
      city: "Dhaka",
      postalCode: "1216",
    },
    items: [
      { id: "2-1", name: "Neuro Balance Plus", quantity: 1, unitPrice: 1780, imageTone: "bg-[linear-gradient(135deg,#f1f5ff_0%,#dee7fb_100%)]" },
      { id: "2-2", name: "Omega 3 Triple Strength", quantity: 1, unitPrice: 1680, imageTone: "bg-[linear-gradient(135deg,#eaf8ff_0%,#d5ebf8_100%)]" },
      { id: "2-3", name: "Vitamin D3+K2 Gold", quantity: 1, unitPrice: 1120, imageTone: "bg-[linear-gradient(135deg,#fff5e6_0%,#fbe4c1_100%)]" },
    ],
  },
  {
    id: "ord-3",
    orderNumber: "WHT-2026-00003",
    customerName: "Nusrat Jahan",
    customerPhone: "+8801912456708",
    customerEmail: "nusrat.jahan@example.com",
    placedAt: "2026-07-09T09:42:00+06:00",
    paymentMethod: "Cash on Delivery",
    status: "PROCESSING",
    shippingFee: 120,
    transactionId: "TXN-COD-39012",
    paymentStatus: "Pending",
    shippingAddress: {
      line1: "House 88, Road 10",
      area: "Uttara Sector 7",
      city: "Dhaka",
      postalCode: "1230",
    },
    items: [
      { id: "3-1", name: "Cardio Omega Softgel", quantity: 2, unitPrice: 1490, imageTone: "bg-[linear-gradient(135deg,#ecf6f2_0%,#d9ece5_100%)]" },
    ],
  },
  {
    id: "ord-4",
    orderNumber: "WHT-2026-00004",
    customerName: "Tariq Mahmud",
    customerPhone: "+8801755588899",
    customerEmail: "tariq.mahmud@example.com",
    placedAt: "2026-07-08T15:32:00+06:00",
    paymentMethod: "SSLCommerz",
    status: "SHIPPED",
    shippingFee: 70,
    transactionId: "TXN-SSLC-7802291",
    paymentStatus: "Paid",
    shippingAddress: {
      line1: "House 4, Road 2",
      area: "Khilgaon",
      city: "Dhaka",
      postalCode: "1219",
    },
    items: [
      { id: "4-1", name: "Retina Shield Omega", quantity: 2, unitPrice: 1320, imageTone: "bg-[linear-gradient(135deg,#edf8f5_0%,#d8ede7_100%)]" },
      { id: "4-2", name: "Daily Multivitamin Core", quantity: 1, unitPrice: 980, imageTone: "bg-[linear-gradient(135deg,#f2f9ed_0%,#deefd2_100%)]" },
    ],
  },
  {
    id: "ord-5",
    orderNumber: "WHT-2026-00005",
    customerName: "Sadia Akter",
    customerPhone: "+8801612345567",
    customerEmail: "sadia.akter@example.com",
    placedAt: "2026-07-08T11:20:00+06:00",
    paymentMethod: "bKash",
    status: "DELIVERED",
    shippingFee: 90,
    transactionId: "TXN-BKASH-229908",
    paymentStatus: "Paid",
    shippingAddress: {
      line1: "Flat 3A, House 34",
      area: "Agrabad",
      city: "Chattogram",
      postalCode: "4100",
    },
    items: [
      { id: "5-1", name: "Vision Guard Plus", quantity: 1, unitPrice: 1450, imageTone: "bg-[linear-gradient(135deg,#edf6ff_0%,#d8e9fb_100%)]" },
      { id: "5-2", name: "Vitamin D3+K2 Gold", quantity: 2, unitPrice: 1120, imageTone: "bg-[linear-gradient(135deg,#fff5e6_0%,#fbe4c1_100%)]" },
    ],
  },
  {
    id: "ord-6",
    orderNumber: "WHT-2026-00006",
    customerName: "Raihan Kabir",
    customerPhone: "+8801887766554",
    customerEmail: "raihan.kabir@example.com",
    placedAt: "2026-07-07T16:05:00+06:00",
    paymentMethod: "Cash on Delivery",
    status: "CANCELLED",
    shippingFee: 0,
    transactionId: "TXN-COD-39021",
    paymentStatus: "Pending",
    shippingAddress: {
      line1: "House 16, Lane 3",
      area: "Banasree",
      city: "Dhaka",
      postalCode: "1213",
    },
    items: [
      { id: "6-1", name: "Mind Spark Junior", quantity: 1, unitPrice: 1210, imageTone: "bg-[linear-gradient(135deg,#fdf4e8_0%,#f8e2c2_100%)]" },
    ],
  },
  {
    id: "ord-7",
    orderNumber: "WHT-2026-00007",
    customerName: "Mahbub Alam",
    customerPhone: "+8801722881144",
    customerEmail: "mahbub.alam@example.com",
    placedAt: "2026-07-06T10:40:00+06:00",
    paymentMethod: "SSLCommerz",
    status: "PROCESSING",
    shippingFee: 80,
    transactionId: "TXN-SSLC-7830042",
    paymentStatus: "Paid",
    shippingAddress: {
      line1: "House 10, Road 1",
      area: "Rajshahi Sadar",
      city: "Rajshahi",
      postalCode: "6000",
    },
    items: [
      { id: "7-1", name: "Neuro Balance Plus", quantity: 1, unitPrice: 1780, imageTone: "bg-[linear-gradient(135deg,#f1f5ff_0%,#dee7fb_100%)]" },
      { id: "7-2", name: "Daily Multivitamin Core", quantity: 1, unitPrice: 980, imageTone: "bg-[linear-gradient(135deg,#f2f9ed_0%,#deefd2_100%)]" },
    ],
  },
  {
    id: "ord-8",
    orderNumber: "WHT-2026-00008",
    customerName: "Farzana Islam",
    customerPhone: "+8801966772211",
    customerEmail: "farzana.islam@example.com",
    placedAt: "2026-07-05T18:12:00+06:00",
    paymentMethod: "bKash",
    status: "SHIPPED",
    shippingFee: 100,
    transactionId: "TXN-BKASH-223477",
    paymentStatus: "Paid",
    shippingAddress: {
      line1: "House 7, Road 11",
      area: "Khulna City",
      city: "Khulna",
      postalCode: "9100",
    },
    items: [
      { id: "8-1", name: "Omega 3 Triple Strength", quantity: 1, unitPrice: 1680, imageTone: "bg-[linear-gradient(135deg,#eaf8ff_0%,#d5ebf8_100%)]" },
      { id: "8-2", name: "Cardio Omega Softgel", quantity: 1, unitPrice: 1490, imageTone: "bg-[linear-gradient(135deg,#ecf6f2_0%,#d9ece5_100%)]" },
    ],
  },
  {
    id: "ord-9",
    orderNumber: "WHT-2026-00009",
    customerName: "Jahid Hossain",
    customerPhone: "+8801766554433",
    customerEmail: "jahid.hossain@example.com",
    placedAt: "2026-07-04T12:06:00+06:00",
    paymentMethod: "Cash on Delivery",
    status: "DELIVERED",
    shippingFee: 80,
    transactionId: "TXN-COD-39071",
    paymentStatus: "Paid",
    shippingAddress: {
      line1: "House 1, Court Para",
      area: "Sylhet Sadar",
      city: "Sylhet",
      postalCode: "3100",
    },
    items: [
      { id: "9-1", name: "Retina Shield Omega", quantity: 1, unitPrice: 1320, imageTone: "bg-[linear-gradient(135deg,#edf8f5_0%,#d8ede7_100%)]" },
      { id: "9-2", name: "Vitamin D3+K2 Gold", quantity: 1, unitPrice: 1120, imageTone: "bg-[linear-gradient(135deg,#fff5e6_0%,#fbe4c1_100%)]" },
      { id: "9-3", name: "Daily Multivitamin Core", quantity: 1, unitPrice: 980, imageTone: "bg-[linear-gradient(135deg,#f2f9ed_0%,#deefd2_100%)]" },
    ],
  },
  {
    id: "ord-10",
    orderNumber: "WHT-2026-00010",
    customerName: "Sharmeen Nahar",
    customerPhone: "+8801799445522",
    customerEmail: "sharmeen.nahar@example.com",
    placedAt: "2026-07-03T14:28:00+06:00",
    paymentMethod: "SSLCommerz",
    status: "PAID",
    shippingFee: 90,
    transactionId: "TXN-SSLC-7808821",
    paymentStatus: "Paid",
    shippingAddress: {
      line1: "House 18, Road 9",
      area: "Barishal Sadar",
      city: "Barishal",
      postalCode: "8200",
    },
    items: [
      { id: "10-1", name: "Vision Guard Plus", quantity: 2, unitPrice: 1450, imageTone: "bg-[linear-gradient(135deg,#edf6ff_0%,#d8e9fb_100%)]" },
    ],
  },
];

function matchesDatePreset(orderDate: Date, preset: DatePreset) {
  if (preset === "Custom Range") return true;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (preset === "Today") {
    return orderDate >= startOfToday;
  }

  if (preset === "Last 7 Days") {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - 6);
    return orderDate >= start;
  }

  const start = new Date(startOfToday);
  start.setDate(start.getDate() - 29);
  return orderDate >= start;
}

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState<(typeof statusTabs)[number]["key"]>("All");
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("Last 30 Days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"All" | PaymentMethod>("All");
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredOrders = useMemo(() => {
    return ordersData.filter((order) => {
      const query = search.trim().toLowerCase();
      const orderDate = new Date(order.placedAt);

      const matchesSearch =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerPhone.toLowerCase().includes(query);

      const matchesStatus = activeTab === "All" ? true : order.status === activeTab;

      const matchesPayment = paymentMethod === "All" ? true : order.paymentMethod === paymentMethod;

      let matchesDate = true;
      if (datePreset === "Custom Range") {
        if (customStartDate) {
          matchesDate = matchesDate && orderDate >= new Date(`${customStartDate}T00:00:00`);
        }
        if (customEndDate) {
          matchesDate = matchesDate && orderDate <= new Date(`${customEndDate}T23:59:59`);
        }
      } else {
        matchesDate = matchesDatePreset(orderDate, datePreset);
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [activeTab, customEndDate, customStartDate, datePreset, paymentMethod, search]);

  const visibleOrders = filteredOrders.slice(0, pageSize);

  function handleViewOrder(order: AdminOrder) {
    setSelectedOrder(order);
    setDrawerOpen(true);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900">Orders</h1>
          <p className="mt-1 text-sm text-neutral-500">Track and manage customer orders</p>
        </div>

        <Button className="h-10 rounded-lg" variant="outline">
          <Download className="h-4 w-4" />
          Export Orders
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
            >
              <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100", card.tone)}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <p className="text-sm text-neutral-700">
                <span className="font-semibold text-neutral-900">{card.value}</span> {card.label}
              </p>
            </article>
          );
        })}
      </section>

      <section className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
        {statusTabs.map((tab) => {
          const active = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
                active
                  ? "bg-brand-green-600 text-white"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
              )}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  active ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <label className="relative min-w-[280px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by order #, customer name, or phone..."
            value={search}
          />
        </label>

        <select
          className="h-10 min-w-[180px] rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
          onChange={(event) => setDatePreset(event.target.value as DatePreset)}
          value={datePreset}
        >
          <option value="Today">Today</option>
          <option value="Last 7 Days">Last 7 Days</option>
          <option value="Last 30 Days">Last 30 Days</option>
          <option value="Custom Range">Custom Range</option>
        </select>

        {datePreset === "Custom Range" ? (
          <>
            <input
              className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setCustomStartDate(event.target.value)}
              type="date"
              value={customStartDate}
            />
            <input
              className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setCustomEndDate(event.target.value)}
              type="date"
              value={customEndDate}
            />
          </>
        ) : null}

        <select
          className="h-10 min-w-[190px] rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
          onChange={(event) => setPaymentMethod(event.target.value as "All" | PaymentMethod)}
          value={paymentMethod}
        >
          <option value="All">All Payment Methods</option>
          <option value="SSLCommerz">SSLCommerz</option>
          <option value="bKash">bKash</option>
          <option value="Cash on Delivery">Cash on Delivery</option>
        </select>
      </section>

      <AdminOrdersTable
        onPageSizeChange={setPageSize}
        onView={handleViewOrder}
        orders={visibleOrders}
        pageSize={pageSize}
        totalOrders={342}
      />

      <OrderDetailDrawer
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        order={selectedOrder}
      />
    </div>
  );
}