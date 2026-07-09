"use client";

import { AlertTriangle, DollarSign, ShoppingBag, Users } from "lucide-react";

import {
  AdminStatCard,
  RecentOrdersTable,
  SalesChart,
} from "@/components/admin/admin-shell";

const statCards = [
  {
    icon: DollarSign,
    iconClassName: "bg-brand-green-600",
    label: "Total Revenue",
    value: "৳ 4,52,000",
    trend: "+8% this month",
  },
  {
    icon: ShoppingBag,
    iconClassName: "bg-blue-600",
    label: "Total Orders",
    value: "342",
    trend: "+15% this month",
  },
  {
    icon: Users,
    iconClassName: "bg-brand-green-900",
    label: "Total Customers",
    value: "128",
    trend: "+5% this month",
  },
  {
    icon: AlertTriangle,
    iconClassName: "bg-gold-accent",
    label: "Low Stock Alerts",
    value: "6",
    trend: "Needs attention",
    trendTone: "amber" as const,
  },
];

export function AdminDashboardOverview() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <AdminStatCard
            key={card.label}
            icon={card.icon}
            iconClassName={card.iconClassName}
            label={card.label}
            trend={card.trend}
            trendTone={card.trendTone}
            value={card.value}
          />
        ))}
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.45fr_1fr]">
        <SalesChart />
        <RecentOrdersTable />
      </div>
    </div>
  );
}