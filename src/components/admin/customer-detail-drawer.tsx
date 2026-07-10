"use client";

import { AlertTriangle, Mail, MessageCircle, Phone, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  type AdminCustomer,
  customerAvatarTone,
  customerInitials,
  customerTagPillClass,
  formatCustomerDate,
  formatCustomerPrice,
} from "@/components/admin/admin-customers-table";
import { orderStatusPillClass } from "@/components/admin/admin-orders-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CustomerDetailDrawerProps = {
  open: boolean;
  customer: AdminCustomer | null;
  onClose: () => void;
};

export function CustomerDetailDrawer({ open, customer, onClose }: CustomerDetailDrawerProps) {
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote("");
  }, [customer?.id]);

  const avgOrderValue = useMemo(() => {
    if (!customer || customer.totalOrders === 0) return 0;
    return customer.totalSpent / customer.totalOrders;
  }, [customer]);

  if (!customer) {
    return null;
  }

  const recentOrders = customer.orderHistory.slice(0, 5);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-neutral-950/40 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-screen w-full max-w-[560px] bg-white shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <header className="space-y-4 border-b border-neutral-200 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold",
                    customerAvatarTone(customer.name)
                  )}
                >
                  {customerInitials(customer.name)}
                </span>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-lg font-bold text-neutral-900">{customer.name}</h2>
                    {customer.tag ? (
                      <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", customerTagPillClass(customer.tag))}>
                        {customer.tag}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-neutral-500">{customer.email}</p>
                </div>
              </div>

              <button
                aria-label="Close customer details"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <Button
              className="h-9 rounded-lg border-brand-green-600 px-3 text-brand-green-600 hover:bg-brand-green-50"
              onClick={() => console.log("Message customer stub", customer.id)}
              type="button"
              variant="outline"
            >
              <MessageCircle className="h-4 w-4" />
              Message Customer
            </Button>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <section className="grid gap-2 sm:grid-cols-2">
              <StatCard label="Total Orders" value={String(customer.totalOrders)} />
              <StatCard label="Total Spent" value={formatCustomerPrice(customer.totalSpent)} />
              <StatCard label="Avg. Order Value" value={formatCustomerPrice(avgOrderValue)} />
              <StatCard label="Member Since" value={formatCustomerDate(customer.joinedAt)} />
            </section>

            <section className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-800">Contact Info</h3>
              <p className="flex items-center gap-2 text-sm text-neutral-700">
                <Phone className="h-4 w-4 text-neutral-500" />
                {customer.phone}
              </p>
              <p className="flex items-center gap-2 text-sm text-neutral-700">
                <Mail className="h-4 w-4 text-neutral-500" />
                {customer.email}
              </p>
            </section>

            <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-800">Saved Addresses</h3>
              <div className="space-y-2">
                {customer.addresses.map((address) => (
                  <article key={address.id} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <p className="font-medium text-neutral-900">{address.label}</p>
                      {address.isDefault ? (
                        <span className="inline-flex rounded-full bg-brand-green-100 px-2 py-0.5 text-[11px] font-semibold text-brand-green-700">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <p>{address.line1}</p>
                    {address.line2 ? <p>{address.line2}</p> : null}
                    <p>
                      {address.city} {address.postalCode}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-800">Order History</h3>

              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <button
                    key={order.id}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-left hover:bg-neutral-100"
                    onClick={() => console.log("Open order detail stub", order.id)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-mono text-xs font-semibold text-neutral-900">{order.orderNumber}</p>
                        <p className="text-xs text-neutral-500">
                          {formatCustomerDate(order.date)} • {order.itemCount} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-neutral-900">{formatCustomerPrice(order.total)}</p>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            orderStatusPillClass(order.status)
                          )}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                className="text-sm font-medium text-brand-green-600 hover:text-brand-green-900"
                onClick={() => console.log("View all orders stub", customer.id)}
                type="button"
              >
                View All Orders ({customer.totalOrders})
              </button>
            </section>

            <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-800">Customer Notes</h3>

              <textarea
                className="min-h-[92px] w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add internal notes about service preferences, delivery concerns, or support history..."
                rows={4}
                value={note}
              />

              <button
                className="inline-flex h-9 items-center rounded-lg border border-neutral-200 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                onClick={() => console.log("Save customer note stub", customer.id, note)}
                type="button"
              >
                Save Note
              </button>
            </section>

            <section className="space-y-3 rounded-xl border border-red-100 bg-red-50/40 p-4">
              <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
              <p className="flex items-start gap-2 text-xs text-red-600">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                Suspending an account restricts customer login and ordering until reactivated.
              </p>

              <button
                className="inline-flex h-8 items-center rounded-lg border border-red-600 px-3 text-xs font-semibold text-red-600 hover:bg-red-100"
                onClick={() => console.log("Suspend account stub", customer.id)}
                type="button"
              >
                Suspend Account
              </button>
            </section>
          </div>

          <footer className="sticky bottom-0 border-t border-neutral-200 bg-white px-5 py-4">
            <Button className="h-11 w-full rounded-lg" onClick={onClose} type="button" variant="outline">
              Close
            </Button>
          </footer>
        </div>
      </aside>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-900">{value}</p>
    </article>
  );
}