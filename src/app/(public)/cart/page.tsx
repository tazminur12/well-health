"use client";

import Link from "next/link";
import { Minus, Package2, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { formatPrice } from "@/lib/format-price";
import { useCartStore } from "@/store/cart-store";

export default function CartPage() {
  const { items, itemCount, subtotal, setQuantity, removeItem, clearCart } = useCartStore();

  return (
    <div className="min-h-[70vh] bg-[#F7F8F9] text-neutral-900">
      <section className="border-b border-brand-green-100/80 bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">Cart</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Your Cart
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {itemCount === 0
              ? "Your cart is empty."
              : `${itemCount} item${itemCount === 1 ? "" : "s"} ready for checkout.`}
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center shadow-sm">
              <ShoppingBag className="mx-auto h-10 w-10 text-brand-green-600" />
              <h2 className="mt-4 font-heading text-xl font-bold text-neutral-900">
                Nothing here yet
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Browse the shop and add clinically trusted supplements to your cart.
              </p>
              <Link
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-green-900"
                href="/shop"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                {items.map((item) => (
                  <article
                    key={item.productId}
                    className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
                  >
                    <Link
                      className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-50 ring-1 ring-neutral-200"
                      href={`/shop/${item.slug}`}
                    >
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="" className="h-full w-full object-cover" src={item.imageUrl} />
                      ) : (
                        <Package2 className="h-7 w-7 text-brand-green-600" />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            className="truncate font-semibold text-neutral-900 hover:text-brand-green-600"
                            href={`/shop/${item.slug}`}
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1 text-sm font-medium text-brand-green-600">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <button
                          aria-label={`Remove ${item.name}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:border-red-200 hover:text-red-600"
                          onClick={() => removeItem(item.productId)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center overflow-hidden rounded-lg border border-neutral-200">
                          <button
                            aria-label="Decrease"
                            className="inline-flex h-9 w-9 items-center justify-center text-neutral-500 hover:bg-neutral-50"
                            onClick={() => setQuantity(item.productId, item.quantity - 1)}
                            type="button"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-10 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            aria-label="Increase"
                            className="inline-flex h-9 w-9 items-center justify-center text-neutral-500 hover:bg-neutral-50"
                            onClick={() => setQuantity(item.productId, item.quantity + 1)}
                            type="button"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}

                <button
                  className="text-sm font-semibold text-red-600 underline-offset-4 hover:underline"
                  onClick={clearCart}
                  type="button"
                >
                  Clear cart
                </button>
              </div>

              <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="font-heading text-lg font-bold text-neutral-900">Order summary</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span className="text-neutral-500">Calculated at checkout</span>
                  </div>
                </div>
                <div className="mt-4 border-t border-neutral-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">Total</span>
                    <span className="font-heading text-xl font-bold text-brand-green-600">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>
                <button
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-green-600 text-sm font-semibold text-white transition-colors hover:bg-brand-green-900"
                  type="button"
                >
                  Checkout soon
                </button>
                <Link
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-brand-green-600 text-sm font-semibold text-brand-green-600 transition-colors hover:bg-brand-green-100"
                  href="/shop"
                >
                  Continue shopping
                </Link>
                <p className="mt-3 text-center text-xs text-neutral-500">
                  Payment gateways will be connected in the backend phase.
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
