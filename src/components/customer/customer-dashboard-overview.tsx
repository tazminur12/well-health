import {
  Heart,
  MessageCircle,
  Package,
  ShoppingBag,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { DashboardStatCard } from "@/components/customer/dashboard-stat-card";
import { QuickActionCard } from "@/components/customer/quick-action-card";
import {
  RecentOrderCard,
  type RecentOrder,
} from "@/components/customer/recent-order-card";
import {
  WishlistPreviewStrip,
  type WishlistPreviewItem,
} from "@/components/customer/wishlist-preview-strip";
import { dummyCustomer } from "@/components/customer/customer-nav";

const stats = [
  {
    icon: ShoppingBag,
    iconClassName: "bg-brand-green-600",
    value: "12",
    label: "Total Orders",
  },
  {
    icon: Package,
    iconClassName: "bg-amber-500",
    value: "2",
    label: "Pending Orders",
  },
  {
    icon: Heart,
    iconClassName: "bg-rose-500",
    value: "5",
    label: "Wishlist Items",
  },
  {
    icon: Wallet,
    iconClassName: "bg-brand-green-900",
    value: "৳ 48,750",
    label: "Total Spent",
  },
];

const recentOrders: RecentOrder[] = [
  {
    id: "1",
    orderNumber: "WHT-2026-00042",
    status: "SHIPPED",
    date: "Jul 08, 2026",
    itemCount: 3,
    total: 4250,
  },
  {
    id: "2",
    orderNumber: "WHT-2026-00038",
    status: "PROCESSING",
    date: "Jul 05, 2026",
    itemCount: 1,
    total: 1890,
  },
  {
    id: "3",
    orderNumber: "WHT-2026-00031",
    status: "DELIVERED",
    date: "Jun 28, 2026",
    itemCount: 2,
    total: 3120,
  },
];

const wishlistItems: WishlistPreviewItem[] = [
  {
    id: "omega-3",
    name: "Omega-3 Fish Oil",
    price: 1450,
    imageTone: "bg-gradient-to-br from-brand-green-100 to-white",
  },
  {
    id: "vitamin-d",
    name: "Vitamin D3 2000 IU",
    price: 890,
    imageTone: "bg-gradient-to-br from-amber-50 to-white",
  },
  {
    id: "collagen",
    name: "Marine Collagen",
    price: 2200,
    imageTone: "bg-gradient-to-br from-rose-50 to-white",
  },
  {
    id: "probiotic",
    name: "Daily Probiotic",
    price: 1650,
    imageTone: "bg-gradient-to-br from-sky-50 to-white",
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha Extract",
    price: 1180,
    imageTone: "bg-gradient-to-br from-emerald-50 to-white",
  },
];

const quickActions = [
  { href: "/orders", icon: Truck, label: "Track Order" },
  { href: "/shop", icon: ShoppingBag, label: "Browse Products" },
  { href: "/messages", icon: MessageCircle, label: "Chat with Support" },
  { href: "/profile", icon: User, label: "Update Profile" },
];

export function CustomerDashboardOverview() {
  const firstName = dummyCustomer.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-heading text-xl font-bold text-neutral-900">
          Hi, {firstName} 👋
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Here&apos;s what&apos;s happening with your account
        </p>
      </section>

      {/* Mobile: horizontal snap scroll · md+: 4-col grid */}
      <section className="-mx-4 flex gap-3 overflow-x-auto px-4 scrollbar-hide snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0 md:snap-none">
        {stats.map((stat) => (
          <DashboardStatCard
            key={stat.label}
            icon={stat.icon}
            iconClassName={stat.iconClassName}
            label={stat.label}
            value={stat.value}
            className="md:w-auto"
          />
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-bold text-neutral-900">Recent Orders</h2>
          <Link
            className="min-h-11 inline-flex items-center text-sm font-semibold text-brand-green-600 transition-colors duration-200 active:text-brand-green-900 hover:text-brand-green-900"
            href="/orders"
          >
            View All
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {recentOrders.map((order) => (
            <RecentOrderCard key={order.id} order={order} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-neutral-900">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.label}
              href={action.href}
              icon={action.icon}
              label={action.label}
            />
          ))}
        </div>
      </section>

      <WishlistPreviewStrip items={wishlistItems} />
    </div>
  );
}
