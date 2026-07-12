"use client";

import {
  Heart,
  Loader2,
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
import { RecentOrderCard } from "@/components/customer/recent-order-card";
import {
  WishlistPreviewStrip,
  type WishlistPreviewItem,
} from "@/components/customer/wishlist-preview-strip";
import { useMyOrders, useMyOrderStats } from "@/hooks/use-my-orders";
import { formatOrderDate, formatPrice } from "@/components/customer/orders-data";
import { useWishlistStore } from "@/store/wishlist-store";

const quickActions = [
  { href: "/orders", icon: Truck, label: "Track Order" },
  { href: "/shop", icon: ShoppingBag, label: "Browse Products" },
  { href: "/contact", icon: MessageCircle, label: "Contact Support" },
  { href: "/profile", icon: User, label: "Update Profile" },
];

export function CustomerDashboardOverview({
  customerName,
}: {
  customerName?: string | null;
}) {
  const firstName =
    customerName?.trim().split(/\s+/).filter(Boolean)[0] || "there";

  const { data: stats, isLoading: statsLoading } = useMyOrderStats();
  const { data: orders = [], isLoading: ordersLoading } = useMyOrders();
  const wishlistItems = useWishlistStore((state) => state.items);

  const recentOrders = orders.slice(0, 3);

  const wishlistPreview: WishlistPreviewItem[] = wishlistItems.slice(0, 5).map((item) => ({
    id: item.productId,
    name: item.name,
    price: item.price,
    imageTone: item.imageTone || "bg-gradient-to-br from-brand-green-100 to-white",
  }));

  const statCards = [
    {
      icon: ShoppingBag,
      iconClassName: "bg-brand-green-600",
      value: statsLoading ? "—" : String(stats?.totalOrders ?? 0),
      label: "Total Orders",
    },
    {
      icon: Package,
      iconClassName: "bg-amber-500",
      value: statsLoading ? "—" : String(stats?.pendingOrders ?? 0),
      label: "Active Orders",
    },
    {
      icon: Heart,
      iconClassName: "bg-rose-500",
      value: String(wishlistItems.length),
      label: "Wishlist Items",
    },
    {
      icon: Wallet,
      iconClassName: "bg-brand-green-900",
      value: statsLoading ? "—" : formatPrice(stats?.totalSpent ?? 0),
      label: "Total Spent",
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-heading text-xl font-bold text-neutral-900">
          Hi, {firstName}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Here&apos;s what&apos;s happening with your account
        </p>
      </section>

      <section className="-mx-4 flex gap-3 overflow-x-auto px-4 scrollbar-hide snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0 md:snap-none">
        {statCards.map((stat) => (
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
            className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-green-600 transition-colors duration-200 hover:text-brand-green-900 active:text-brand-green-900"
            href="/orders"
          >
            View All
          </Link>
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-10 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading orders…
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-10 text-center">
            <p className="text-sm font-medium text-neutral-700">No orders yet</p>
            <p className="mt-1 text-xs text-neutral-500">
              Browse the shop and your first order will show up here.
            </p>
            <Link
              className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-brand-green-600 px-4 text-sm font-semibold text-white"
              href="/shop"
            >
              Shop now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <RecentOrderCard
                key={order.id}
                order={{
                  id: order.id,
                  orderNumber: order.orderNumber,
                  status: order.status,
                  date: formatOrderDate(order.placedAt),
                  itemCount: order.itemCount,
                  total: order.total,
                }}
              />
            ))}
          </div>
        )}
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

      <WishlistPreviewStrip items={wishlistPreview} />
    </div>
  );
}
