"use client";

import {
  ArrowLeft,
  Loader2,
  Minus,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { bdDistricts } from "@/components/customer/address-card";
import { Button } from "@/components/ui/button";
import { useAdminCustomers } from "@/hooks/use-admin-customers";
import { useOrderMutations } from "@/hooks/use-admin-orders";
import { useAdminProducts } from "@/hooks/use-admin-products";
import { useAdminShippingZones } from "@/hooks/use-admin-shipping";
import { showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import { formatPrice } from "@/lib/format-price";
import type {
  AdminCreateOrderInput,
  OrderStatusValue,
  PaymentMethodValue,
  PaymentStatusValue,
} from "@/lib/orders/schemas";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-brand-green-400";

type LineDraft = {
  productId: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
  quantity: number;
};

export function AdminOrderForm() {
  const router = useRouter();
  const { createOrder } = useOrderMutations();
  const { data: products = [] } = useAdminProducts();
  const { data: customers = [] } = useAdminCustomers();
  const { data: zones = [] } = useAdminShippingZones();

  const activeZones = useMemo(
    () => zones.filter((zone) => zone.isActive),
    [zones]
  );
  const sellableProducts = useMemo(
    () => products.filter((product) => product.status === "Active" && product.stock > 0),
    [products]
  );

  const [userId, setUserId] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingFullName, setShippingFullName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingDistrict, setShippingDistrict] = useState("Dhaka");
  const [shippingArea, setShippingArea] = useState("");
  const [shippingDetails, setShippingDetails] = useState("");
  const [sameAsCustomer, setSameAsCustomer] = useState(true);
  const [zoneId, setZoneId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>("COD");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusValue>("UNPAID");
  const [status, setStatus] = useState<OrderStatusValue>("PENDING");
  const [couponCode, setCouponCode] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");

  const selectedZone =
    activeZones.find((zone) => zone.id === zoneId) ?? activeZones[0] ?? null;

  useEffect(() => {
    if (!zoneId && activeZones[0]?.id) {
      setZoneId(activeZones[0].id);
    }
  }, [zoneId, activeZones]);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers
      .filter(
        (customer) =>
          customer.name.toLowerCase().includes(q) ||
          customer.email.toLowerCase().includes(q) ||
          customer.phone.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [customers, customerQuery]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    const list = !q
      ? sellableProducts
      : sellableProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(q) ||
            product.sku.toLowerCase().includes(q)
        );
    return list.slice(0, 10);
  }, [sellableProducts, productQuery]);

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const shippingFee = selectedZone?.baseFee ?? 0;
  const estimatedTotal = subtotal + shippingFee;

  function applyCustomer(customerId: string) {
    const customer = customers.find((row) => row.id === customerId);
    if (!customer) return;
    setUserId(customer.id);
    setCustomerName(customer.name);
    setEmail(customer.email);
    setPhone(customer.phone);
    setCustomerQuery(customer.name);
    if (sameAsCustomer) {
      setShippingFullName(customer.name);
      setShippingPhone(customer.phone);
    }
  }

  function addProduct(productId: string) {
    const product = sellableProducts.find((row) => row.id === productId);
    if (!product) return;
    setLines((current) => {
      const existing = current.find((line) => line.productId === productId);
      if (existing) {
        if (existing.quantity >= product.stock) return current;
        return current.map((line) =>
          line.productId === productId
            ? { ...line, quantity: line.quantity + 1 }
            : line
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          price: product.offerPrice ?? product.price,
          stock: product.stock,
          imageUrl: product.imageUrls?.[0] ?? product.images?.[0]?.url,
          quantity: 1,
        },
      ];
    });
    setProductQuery("");
  }

  function updateQty(productId: string, quantity: number) {
    setLines((current) =>
      current
        .map((line) => {
          if (line.productId !== productId) return line;
          const next = Math.max(1, Math.min(line.stock, quantity));
          return { ...line, quantity: next };
        })
        .filter(Boolean)
    );
  }

  function removeLine(productId: string) {
    setLines((current) => current.filter((line) => line.productId !== productId));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (lines.length === 0) {
      await showAdminError("Add products", "Select at least one product for this order.");
      return;
    }

    const payload: AdminCreateOrderInput = {
      userId: userId || null,
      email,
      phone,
      customerName,
      shippingFullName: sameAsCustomer ? customerName : shippingFullName,
      shippingPhone: sameAsCustomer ? phone : shippingPhone,
      shippingDistrict,
      shippingArea,
      shippingDetails,
      shippingZoneId: selectedZone?.id ?? zoneId,
      paymentMethod,
      paymentStatus,
      status,
      notes,
      couponCode,
      items: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
      })),
    };

    try {
      const order = await createOrder.mutateAsync(payload);
      await showAdminSuccess("Order created", `${order.orderNumber} has been saved.`);
      router.push(`/admin/orders/${order.id}`);
    } catch (error) {
      await showAdminError(
        "Could not create order",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  }

  return (
    <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-brand-green-700"
          href="/admin/orders"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>
        <Button
          className="rounded-xl bg-brand-green-600 hover:bg-brand-green-900"
          disabled={createOrder.isPending}
          type="submit"
        >
          {createOrder.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            "Create order"
          )}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-neutral-900">Customer</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Link an existing account or enter guest details.
            </p>

            <div className="mt-4 space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  className={cn(fieldClass, "pl-10")}
                  onChange={(event) => {
                    setCustomerQuery(event.target.value);
                    if (!event.target.value) setUserId("");
                  }}
                  placeholder="Search customers by name, email, phone…"
                  value={customerQuery}
                />
              </div>
              {customerQuery.trim() ? (
                <div className="overflow-hidden rounded-xl border border-neutral-200">
                  {filteredCustomers.length === 0 ? (
                    <p className="px-3 py-3 text-sm text-neutral-500">No matching customers.</p>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <button
                        className="flex w-full items-center justify-between gap-3 border-b border-neutral-100 px-3 py-2.5 text-left last:border-0 hover:bg-brand-green-50/50"
                        key={customer.id}
                        onClick={() => applyCustomer(customer.id)}
                        type="button"
                      >
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{customer.name}</p>
                          <p className="text-xs text-neutral-500">
                            {customer.email} · {customer.phone}
                          </p>
                        </div>
                        {userId === customer.id ? (
                          <span className="text-xs font-semibold text-brand-green-700">Selected</span>
                        ) : null}
                      </button>
                    ))
                  )}
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium text-neutral-700">Full name</span>
                  <input
                    className={fieldClass}
                    onChange={(event) => {
                      setCustomerName(event.target.value);
                      if (sameAsCustomer) setShippingFullName(event.target.value);
                    }}
                    required
                    value={customerName}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium text-neutral-700">Phone</span>
                  <input
                    className={fieldClass}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      if (sameAsCustomer) setShippingPhone(event.target.value);
                    }}
                    required
                    value={phone}
                  />
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium text-neutral-700">Email</span>
                  <input
                    className={fieldClass}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    value={email}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-neutral-900">Shipping</h2>
                <p className="mt-1 text-sm text-neutral-500">Delivery address for this order.</p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-neutral-600">
                <input
                  checked={sameAsCustomer}
                  className="rounded border-neutral-300"
                  onChange={(event) => {
                    setSameAsCustomer(event.target.checked);
                    if (event.target.checked) {
                      setShippingFullName(customerName);
                      setShippingPhone(phone);
                    }
                  }}
                  type="checkbox"
                />
                Same as customer
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {!sameAsCustomer ? (
                <>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-neutral-700">Recipient</span>
                    <input
                      className={fieldClass}
                      onChange={(event) => setShippingFullName(event.target.value)}
                      required
                      value={shippingFullName}
                    />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-neutral-700">Shipping phone</span>
                    <input
                      className={fieldClass}
                      onChange={(event) => setShippingPhone(event.target.value)}
                      required
                      value={shippingPhone}
                    />
                  </label>
                </>
              ) : null}
              <label className="space-y-1.5 text-sm">
                <span className="font-medium text-neutral-700">District</span>
                <select
                  className={fieldClass}
                  onChange={(event) => setShippingDistrict(event.target.value)}
                  required
                  value={shippingDistrict}
                >
                  {bdDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium text-neutral-700">Area / Thana</span>
                <input
                  className={fieldClass}
                  onChange={(event) => setShippingArea(event.target.value)}
                  required
                  value={shippingArea}
                />
              </label>
              <label className="space-y-1.5 text-sm sm:col-span-2">
                <span className="font-medium text-neutral-700">Address details</span>
                <input
                  className={fieldClass}
                  onChange={(event) => setShippingDetails(event.target.value)}
                  placeholder="House, road, landmark"
                  required
                  value={shippingDetails}
                />
              </label>
              <label className="space-y-1.5 text-sm sm:col-span-2">
                <span className="font-medium text-neutral-700">Shipping zone</span>
                <select
                  className={fieldClass}
                  onChange={(event) => setZoneId(event.target.value)}
                  required
                  value={selectedZone?.id ?? zoneId}
                >
                  {activeZones.length === 0 ? (
                    <option value="">No active zones</option>
                  ) : (
                    activeZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} · {formatPrice(zone.baseFee)}
                      </option>
                    ))
                  )}
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-neutral-900">Products</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Stock is deducted when the order is created.
            </p>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                className={cn(fieldClass, "pl-10")}
                onChange={(event) => setProductQuery(event.target.value)}
                placeholder="Search products to add…"
                value={productQuery}
              />
            </div>

            {productQuery.trim() ? (
              <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-neutral-200">
                {filteredProducts.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-neutral-500">No products found.</p>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      className="flex w-full items-center gap-3 border-b border-neutral-100 px-3 py-2.5 text-left last:border-0 hover:bg-brand-green-50/50"
                      key={product.id}
                      onClick={() => addProduct(product.id)}
                      type="button"
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-neutral-100">
                        {(product.imageUrls?.[0] || product.images?.[0]?.url) && (
                          <Image
                            alt={product.name}
                            className="object-cover"
                            fill
                            sizes="40px"
                            src={product.imageUrls?.[0] ?? product.images![0].url}
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {formatPrice(product.offerPrice ?? product.price)} · Stock{" "}
                          {product.stock}
                        </p>
                      </div>
                      <Plus className="h-4 w-4 text-brand-green-600" />
                    </button>
                  ))
                )}
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              {lines.length === 0 ? (
                <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-500">
                  No products added yet.
                </p>
              ) : (
                lines.map((line) => (
                  <div
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50/70 p-3"
                    key={line.productId}
                  >
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white">
                      {line.imageUrl ? (
                        <Image
                          alt={line.name}
                          className="object-cover"
                          fill
                          sizes="48px"
                          src={line.imageUrl}
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">{line.name}</p>
                      <p className="text-xs text-neutral-500">
                        {formatPrice(line.price)} · Max {line.stock}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white">
                      <button
                        className="p-2 text-neutral-600 hover:text-brand-green-700"
                        onClick={() => updateQty(line.productId, line.quantity - 1)}
                        type="button"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        className="w-10 border-0 bg-transparent text-center text-sm outline-none"
                        min={1}
                        max={line.stock}
                        onChange={(event) =>
                          updateQty(line.productId, Number(event.target.value) || 1)
                        }
                        type="number"
                        value={line.quantity}
                      />
                      <button
                        className="p-2 text-neutral-600 hover:text-brand-green-700"
                        onClick={() => updateQty(line.productId, line.quantity + 1)}
                        type="button"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="w-24 text-right text-sm font-semibold text-neutral-900">
                      {formatPrice(line.price * line.quantity)}
                    </p>
                    <button
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      onClick={() => removeLine(line.productId)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-neutral-900">
              Payment & status
            </h2>
            <div className="mt-4 space-y-3">
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-neutral-700">Payment method</span>
                <select
                  className={fieldClass}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value as PaymentMethodValue)
                  }
                  value={paymentMethod}
                >
                  <option value="COD">Cash on Delivery</option>
                  <option value="SSLCOMMERZ">SSLCommerz</option>
                  <option value="BKASH">bKash</option>
                </select>
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-neutral-700">Payment status</span>
                <select
                  className={fieldClass}
                  onChange={(event) =>
                    setPaymentStatus(event.target.value as PaymentStatusValue)
                  }
                  value={paymentStatus}
                >
                  <option value="UNPAID">Unpaid</option>
                  <option value="PAID">Paid</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-neutral-700">Order status</span>
                <select
                  className={fieldClass}
                  onChange={(event) => setStatus(event.target.value as OrderStatusValue)}
                  value={status}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-neutral-700">Coupon (optional)</span>
                <input
                  className={fieldClass}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="WELL10"
                  value={couponCode}
                />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-neutral-700">Internal notes</span>
                <textarea
                  className="min-h-[96px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-green-400"
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Phone order, WhatsApp, etc."
                  value={notes}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-neutral-900">Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping (est.)</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <p className="text-xs text-neutral-400">
                Coupon discount and free-shipping rules are applied on the server.
              </p>
              <div className="flex items-end justify-between border-t border-neutral-100 pt-3">
                <span className="font-semibold text-neutral-900">Est. total</span>
                <span className="font-heading text-2xl font-bold text-brand-green-700">
                  {formatPrice(estimatedTotal)}
                </span>
              </div>
            </div>
            <Button
              className="mt-4 w-full rounded-xl bg-brand-green-600 hover:bg-brand-green-900"
              disabled={createOrder.isPending}
              type="submit"
            >
              {createOrder.isPending ? "Creating…" : "Create order"}
            </Button>
          </section>
        </aside>
      </div>
    </form>
  );
}
