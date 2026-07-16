"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Package2,
  ShoppingBag,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { getOrderByAccessTokenAction } from "@/lib/checkout/actions";
import { formatPrice } from "@/lib/format-price";

function SuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<
    NonNullable<Awaited<ReturnType<typeof getOrderByAccessTokenAction>>["data"]> | undefined
  >(undefined);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    void getOrderByAccessTokenAction(token).then((result) => {
      if (result.error) {
        setError(result.error);
      } else {
        setOrder(result.data);
      }
      setLoading(false);
    });
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-brand-green-100 bg-gradient-to-br from-brand-green-50 to-white px-6 py-10 text-center sm:px-10">
          <div className="mx-auto mb-4 flex justify-center">
            <BrandLogo href={null} size="md" variant="mark" />
          </div>
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-green-600 text-white shadow-md">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-heading text-3xl font-bold text-neutral-900">
            Thank you for your order
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {order
              ? "Your order is confirmed. A summary is below."
              : error
                ? error
                : "Your order was placed successfully."}
          </p>
          {order ? (
            <p className="mt-4 inline-flex rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-brand-green-800 ring-1 ring-brand-green-100">
              Order {order.orderNumber}
            </p>
          ) : null}
        </div>

        {order ? (
          <div className="space-y-6 px-6 py-6 sm:px-10">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard label="Customer" value={order.customerName} />
              <InfoCard label="Email" value={order.email} />
              <InfoCard
                label="Payment"
                value={
                  order.paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : order.paymentMethod === "BKASH"
                      ? "bKash"
                      : "SSLCommerz"
                }
              />
              <InfoCard
                label="Delivery"
                value={`${order.shippingArea}, ${order.shippingDistrict}`}
              />
            </div>

            <div>
              <h2 className="font-heading text-base font-bold text-neutral-900">Items</h2>
              <ul className="mt-3 divide-y divide-neutral-100 rounded-xl border border-neutral-200">
                {order.items.map((item) => (
                  <li className="flex gap-3 p-3" key={`${item.productSlug}-${item.quantity}`}>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-50 ring-1 ring-neutral-200">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="" className="h-full w-full object-cover" src={item.imageUrl} />
                      ) : (
                        <Package2 className="h-5 w-5 text-brand-green-600" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-neutral-900">
                        {item.productName}
                      </span>
                      <span className="text-xs text-neutral-500">Qty {item.quantity}</span>
                    </span>
                    <span className="text-sm font-semibold text-neutral-900">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 rounded-xl bg-neutral-50 px-4 py-3 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between text-neutral-600">
                  <span>Discount</span>
                  <span className="font-semibold text-brand-green-700">
                    −{formatPrice(order.discount)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="font-semibold text-neutral-900">
                  {order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="font-heading text-xl font-bold text-brand-green-700">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            {order.paymentMethod !== "COD" ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
                Online payment for this order is pending. SSLCommerz / bKash gateway connection is
                next — our team may contact you to complete payment, or you can switch to COD by
                messaging support.
              </p>
            ) : (
              <p className="rounded-xl border border-brand-green-100 bg-brand-green-50 px-4 py-3 text-xs leading-relaxed text-brand-green-900">
                Please keep the exact amount ready for cash on delivery. Our courier will contact
                you before arrival.
              </p>
            )}
          </div>
        ) : error ? (
          <div className="px-6 py-6 text-center sm:px-10">
            <p className="text-sm text-neutral-600">
              Sign in to <strong>My orders</strong> if you have an account, or check your confirmation
              email for a valid link.
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-neutral-100 px-6 py-5 sm:flex-row sm:justify-center sm:px-10">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white hover:bg-brand-green-900"
            href="/shop"
          >
            Continue shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            href="/orders"
          >
            <ShoppingBag className="h-4 w-4" />
            My orders
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

export function CheckoutSuccessClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green-600 border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
