"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Heart,
  Lock,
  Minus,
  Package2,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { confirmAction, showSuccess } from "@/lib/alerts";
import { formatPrice } from "@/lib/format-price";
import type { PublicShippingZone } from "@/lib/shipping/public-queries";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

type CartPageClientProps = {
  freeShippingMin: number;
  codEnabled: boolean;
  supportPhone: string;
  shippingZones: PublicShippingZone[];
};

export function CartPageClient({
  freeShippingMin,
  codEnabled,
  supportPhone,
  shippingZones,
}: CartPageClientProps) {
  const router = useRouter();
  const { items, itemCount, subtotal, setQuantity, removeItem, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [zoneId, setZoneId] = useState(shippingZones[0]?.id ?? "");

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedZone = useMemo(
    () => shippingZones.find((zone) => zone.id === zoneId) ?? shippingZones[0] ?? null,
    [shippingZones, zoneId]
  );

  const threshold = selectedZone?.freeShippingMin ?? freeShippingMin;
  const qualifiesFreeShipping = threshold > 0 && subtotal >= threshold;
  const shippingFee =
    !selectedZone || qualifiesFreeShipping ? 0 : selectedZone.baseFee;
  const remainingForFree = Math.max(0, threshold - subtotal);
  const freeProgress =
    threshold > 0 ? Math.min(100, Math.round((subtotal / threshold) * 100)) : 100;
  const total = subtotal + shippingFee;

  async function handleClearCart() {
    const ok = await confirmAction({
      title: "Clear your cart?",
      text: "All items will be removed. This cannot be undone.",
      confirmText: "Clear cart",
      cancelText: "Keep items",
      icon: "warning",
    });
    if (!ok) return;
    clearCart();
    await showSuccess("Cart cleared", "Your cart is empty again.");
  }

  async function handleRemove(productId: string, name: string) {
    removeItem(productId);
    await showSuccess("Removed", `${name} was removed from your cart.`);
  }

  function handleCheckout() {
    router.push("/checkout");
  }

  if (!mounted) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center px-4 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.07),_transparent_40%),linear-gradient(to_bottom,_#ffffff,_#f7f8f9_45%,_#f7f8f9)] text-neutral-900">
      <section className="border-b border-neutral-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Link className="transition-colors hover:text-brand-green-700" href="/">
              Home
            </Link>
            <span>/</span>
            <Link className="transition-colors hover:text-brand-green-700" href="/shop">
              Shop
            </Link>
            <span>/</span>
            <span className="font-medium text-brand-green-700">Cart</span>
          </nav>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Shopping Cart
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                {itemCount === 0
                  ? "Your cart is empty — find something that supports your wellness."
                  : `${itemCount} ${itemCount === 1 ? "item" : "items"} ready for checkout`}
              </p>
            </div>
            {items.length > 0 ? (
              <Link
                className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-brand-green-700 transition-colors hover:text-brand-green-900"
                href="/shop"
              >
                Continue shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="pb-28 pt-8 sm:pb-12 sm:pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
              <div className="space-y-4">
                {threshold > 0 ? (
                  <div className="overflow-hidden rounded-2xl border border-brand-green-100 bg-gradient-to-br from-brand-green-50/90 to-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green-600 text-white shadow-sm">
                        <Truck className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-neutral-900">
                          {qualifiesFreeShipping
                            ? "You’ve unlocked free shipping"
                            : `Add ${formatPrice(remainingForFree)} more for free shipping`}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          Free delivery on orders over {formatPrice(threshold)}
                          {selectedZone ? ` (${selectedZone.name})` : ""}.
                        </p>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white ring-1 ring-brand-green-100">
                          <div
                            className="h-full rounded-full bg-brand-green-600 transition-all duration-300"
                            style={{ width: `${freeProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 sm:px-5">
                    <h2 className="font-heading text-base font-bold text-neutral-900">
                      Cart items
                    </h2>
                    <button
                      className="text-xs font-semibold text-red-600 transition-colors hover:text-red-700"
                      onClick={() => void handleClearCart()}
                      type="button"
                    >
                      Clear all
                    </button>
                  </div>

                  <ul className="divide-y divide-neutral-100">
                    {items.map((item) => (
                      <li key={item.productId} className="p-4 sm:p-5">
                        <div className="flex gap-3 sm:gap-4">
                          <Link
                            className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-50 ring-1 ring-neutral-200 sm:h-24 sm:w-24"
                            href={`/shop/${item.slug}`}
                          >
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                alt={item.name}
                                className="h-full w-full object-cover"
                                src={item.imageUrl}
                              />
                            ) : (
                              <Package2 className="h-8 w-8 text-brand-green-600" />
                            )}
                          </Link>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <Link
                                  className="line-clamp-2 font-semibold text-neutral-900 transition-colors hover:text-brand-green-700"
                                  href={`/shop/${item.slug}`}
                                >
                                  {item.name}
                                </Link>
                                <p className="mt-1 text-sm text-neutral-500">
                                  {formatPrice(item.price)} each
                                </p>
                              </div>
                              <button
                                aria-label={`Remove ${item.name}`}
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                onClick={() => void handleRemove(item.productId, item.name)}
                                type="button"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                              <div className="inline-flex items-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50/50">
                                <button
                                  aria-label="Decrease quantity"
                                  className="inline-flex h-10 w-10 items-center justify-center text-neutral-600 transition-colors hover:bg-white hover:text-brand-green-700"
                                  onClick={() =>
                                    setQuantity(item.productId, item.quantity - 1)
                                  }
                                  type="button"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="min-w-11 text-center text-sm font-semibold text-neutral-900">
                                  {item.quantity}
                                </span>
                                <button
                                  aria-label="Increase quantity"
                                  className="inline-flex h-10 w-10 items-center justify-center text-neutral-600 transition-colors hover:bg-white hover:text-brand-green-700"
                                  onClick={() =>
                                    setQuantity(item.productId, item.quantity + 1)
                                  }
                                  type="button"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <p className="font-heading text-base font-bold text-neutral-900 sm:text-lg">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <TrustChip
                    icon={ShieldCheck}
                    label="Lab-tested quality"
                    detail="Clinical-grade supplements"
                  />
                  <TrustChip
                    icon={Lock}
                    label="Secure checkout"
                    detail="SSL encrypted payments"
                  />
                  <TrustChip
                    icon={Heart}
                    label="Support"
                    detail={supportPhone || "Help when you need it"}
                  />
                </div>
              </div>

              <aside className="space-y-4 lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="border-b border-neutral-100 bg-gradient-to-br from-brand-green-50/60 to-white px-5 py-4">
                    <h2 className="font-heading text-lg font-bold text-neutral-900">
                      Order summary
                    </h2>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Review totals before you place your order
                    </p>
                  </div>

                  <div className="space-y-4 px-5 py-5">
                    {shippingZones.length > 0 ? (
                      <div className="space-y-1.5">
                        <label
                          className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
                          htmlFor="cart-zone"
                        >
                          Delivery area
                        </label>
                        <select
                          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition-all focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                          id="cart-zone"
                          onChange={(event) => setZoneId(event.target.value)}
                          value={selectedZone?.id ?? ""}
                        >
                          {shippingZones.map((zone) => (
                            <option key={zone.id} value={zone.id}>
                              {zone.name} — {formatPrice(zone.baseFee)}
                            </option>
                          ))}
                        </select>
                        {selectedZone ? (
                          <p className="text-xs text-neutral-500">
                            ETA {selectedZone.etaMinDays}–{selectedZone.etaMaxDays} days
                            {selectedZone.codAvailable && codEnabled
                              ? " · Cash on delivery available"
                              : ""}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="space-y-3 text-sm">
                      <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
                      <SummaryRow
                        label="Shipping"
                        value={
                          qualifiesFreeShipping ? (
                            <span className="font-semibold text-brand-green-700">Free</span>
                          ) : selectedZone ? (
                            formatPrice(shippingFee)
                          ) : (
                            <span className="text-neutral-500">At checkout</span>
                          )
                        }
                      />
                      {qualifiesFreeShipping ? (
                        <p className="rounded-xl bg-brand-green-50 px-3 py-2 text-xs font-medium text-brand-green-800">
                          Free shipping applied on this order.
                        </p>
                      ) : null}
                    </div>

                    <div className="border-t border-neutral-200 pt-4">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">Estimated total</p>
                          <p className="text-xs text-neutral-500">Incl. delivery estimate</p>
                        </div>
                        <p className="font-heading text-2xl font-bold text-brand-green-700">
                          {formatPrice(total)}
                        </p>
                      </div>
                    </div>

                    <button
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-green-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-green-900 hover:shadow-md"
                      onClick={() => void handleCheckout()}
                      type="button"
                    >
                      Proceed to checkout
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <Link
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 transition-colors hover:border-brand-green-600/40 hover:bg-brand-green-50 hover:text-brand-green-800"
                      href="/shop"
                    >
                      Continue shopping
                    </Link>

                    <p className="text-center text-[11px] leading-relaxed text-neutral-400">
                      By continuing you agree to our store policies. Payment via SSLCommerz &
                      bKash will be available at checkout.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      {/* Mobile sticky checkout */}
      {items.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-neutral-500">Estimated total</p>
              <p className="font-heading text-lg font-bold text-brand-green-700">
                {formatPrice(total)}
              </p>
            </div>
            <button
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-green-600 px-4 text-sm font-semibold text-white"
              onClick={() => void handleCheckout()}
              type="button"
            >
              Checkout
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center shadow-sm">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-green-50 text-brand-green-700 ring-1 ring-brand-green-100">
        <ShoppingBag className="h-8 w-8" />
      </span>
      <h2 className="mt-5 font-heading text-2xl font-bold text-neutral-900">Your cart is empty</h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        Explore lab-tested supplements and add your favourites — they&apos;ll show up here ready
        for checkout.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-green-900"
          href="/shop"
        >
          Browse products
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 transition-colors hover:border-brand-green-600/40 hover:bg-brand-green-50"
          href="/wishlist"
        >
          View wishlist
        </Link>
      </div>
    </div>
  );
}

function TrustChip({
  icon: Icon,
  label,
  detail,
}: {
  icon: typeof ShieldCheck;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-sm">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green-50 text-brand-green-700">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-neutral-900">{label}</span>
        <span className="block truncate text-xs text-neutral-500">{detail}</span>
      </span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-neutral-600">
      <span>{label}</span>
      <span className={cn("font-semibold text-neutral-900")}>{value}</span>
    </div>
  );
}
