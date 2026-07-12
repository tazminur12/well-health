"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Lock,
  MapPin,
  Package2,
  ShieldCheck,
  Smartphone,
  Truck,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { bdDistricts } from "@/components/customer/address-card";
import {
  getCheckoutContextAction,
  placeOrderAction,
  validateCouponAction,
  type AppliedCoupon,
  type CheckoutAddress,
  type CheckoutContext,
} from "@/lib/checkout/actions";
import { showError, showSuccess } from "@/lib/alerts";
import { formatPrice } from "@/lib/format-price";
import type { PublicShippingZone } from "@/lib/shipping/public-queries";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

type PaymentMethod = "COD" | "SSLCOMMERZ" | "BKASH";

type CheckoutPageClientProps = {
  shippingZones: PublicShippingZone[];
};

const STEPS = [
  { id: 1, label: "Details" },
  { id: 2, label: "Delivery" },
  { id: 3, label: "Payment" },
] as const;

export function CheckoutPageClient({ shippingZones }: CheckoutPageClientProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [context, setContext] = useState<CheckoutContext | null>(null);
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingFullName, setShippingFullName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingDistrict, setShippingDistrict] = useState("");
  const [shippingArea, setShippingArea] = useState("");
  const [shippingDetails, setShippingDetails] = useState("");
  const [zoneId, setZoneId] = useState(shippingZones[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, startApplyCoupon] = useTransition();
  const [sameAsContact, setSameAsContact] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    void getCheckoutContextAction().then((result) => {
      if (!result.data) return;
      setContext(result.data);
      setEmail((current) => current || result.data!.email);
      setCustomerName((current) => current || result.data!.name);
      setPhone((current) => current || result.data!.phone);
      const defaultAddress =
        result.data.addresses.find((address) => address.isDefault) ??
        result.data.addresses[0];
      if (defaultAddress) {
        applyAddress(defaultAddress);
        setSelectedAddressId(defaultAddress.id);
      }
    });
  }, []);

  useEffect(() => {
    if (!sameAsContact) return;
    setShippingFullName(customerName);
    setShippingPhone(phone);
  }, [sameAsContact, customerName, phone]);

  const selectedZone = useMemo(
    () => shippingZones.find((zone) => zone.id === zoneId) ?? shippingZones[0] ?? null,
    [shippingZones, zoneId]
  );

  const freeThreshold =
    selectedZone?.freeShippingMin ?? context?.freeShippingMin ?? 2000;
  const discount = appliedCoupon?.discount ?? 0;
  const qualifiesFree = freeThreshold > 0 && subtotal - discount >= freeThreshold;
  const shippingFee = !selectedZone || qualifiesFree ? 0 : selectedZone.baseFee;
  const estimatedTotal = Math.max(0, subtotal - discount + shippingFee);
  const codEnabled = context?.codEnabled !== false && (selectedZone?.codAvailable ?? true);

  function applyAddress(address: CheckoutAddress) {
    setShippingFullName(address.fullName);
    setShippingPhone(address.phone);
    setShippingDistrict(address.district);
    setShippingArea(address.area);
    setShippingDetails(address.details);
    setSameAsContact(false);
  }

  function validateStep(current: number) {
    if (current === 1) {
      if (customerName.trim().length < 2) return "Enter your full name.";
      if (!email.includes("@")) return "Enter a valid email.";
      if (phone.trim().length < 10) return "Enter a valid phone number.";
      return null;
    }
    if (current === 2) {
      if (shippingFullName.trim().length < 2) return "Enter recipient name.";
      if (shippingPhone.trim().length < 10) return "Enter a valid shipping phone.";
      if (!shippingDistrict) return "Select a district.";
      if (shippingArea.trim().length < 2) return "Enter area / thana.";
      if (shippingDetails.trim().length < 5) return "Enter a detailed address.";
      if (!zoneId) return "Select a delivery area.";
      return null;
    }
    if (current === 3) {
      if (paymentMethod === "COD" && !codEnabled) {
        return "Cash on delivery is unavailable for this area.";
      }
      return null;
    }
    return null;
  }

  function goNext() {
    const error = validateStep(step);
    if (error) {
      void showError("Almost there", error);
      return;
    }
    setStep((current) => Math.min(3, current + 1));
  }

  function handleApplyCoupon() {
    const code = couponCode.trim();
    if (!code) {
      setCouponError("Enter a coupon code.");
      return;
    }
    setCouponError(null);
    startApplyCoupon(async () => {
      const result = await validateCouponAction({ code, subtotal });
      if (result.error || !result.data) {
        setAppliedCoupon(null);
        setCouponError(result.error ?? "Could not apply coupon.");
        await showError("Coupon not applied", result.error ?? "Please check the code and try again.");
        return;
      }
      setAppliedCoupon(result.data);
      setCouponCode(result.data.code);
      setCouponError(null);
      await showSuccess("Coupon applied", result.success ?? `${result.data.code} saved ${formatPrice(result.data.discount)}.`);
    });
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  }

  function placeOrder() {
    const error = validateStep(1) || validateStep(2) || validateStep(3);
    if (error) {
      void showError("Check your details", error);
      return;
    }
    if (items.length === 0) {
      void showError("Empty cart", "Add products before checkout.");
      router.push("/shop");
      return;
    }

    startTransition(async () => {
      const result = await placeOrderAction({
        email,
        phone,
        customerName,
        shippingFullName: sameAsContact ? customerName : shippingFullName,
        shippingPhone: sameAsContact ? phone : shippingPhone,
        shippingDistrict,
        shippingArea,
        shippingDetails,
        shippingZoneId: zoneId,
        paymentMethod,
        notes,
        couponCode: appliedCoupon?.code ?? "",
        items: items.map((item) => ({
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
        })),
      });

      if (result.error || !result.data) {
        await showError("Order failed", result.error ?? "Please try again.");
        return;
      }

      clearCart();
      await showSuccess(
        "Order placed",
        `${result.data.orderNumber} is confirmed. Thank you for shopping with Well Health.`
      );
      router.push(`/checkout/success?order=${encodeURIComponent(result.data.orderNumber)}`);
    });
  }

  if (!mounted) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center px-4 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green-600 border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Package2 className="mx-auto h-12 w-12 text-brand-green-600" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-neutral-900">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Add products to your cart before starting checkout.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white hover:bg-brand-green-900"
          href="/shop"
        >
          Browse shop
        </Link>
      </div>
    );
  }

  const fieldClass =
    "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition-all focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20";

  return (
    <div className="min-h-[70vh] bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.07),_transparent_40%),linear-gradient(to_bottom,_#ffffff,_#f7f8f9_45%,_#f7f8f9)] text-neutral-900">
      <section className="border-b border-neutral-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Link className="hover:text-brand-green-700" href="/">
              Home
            </Link>
            <span>/</span>
            <Link className="hover:text-brand-green-700" href="/cart">
              Cart
            </Link>
            <span>/</span>
            <span className="font-medium text-brand-green-700">Checkout</span>
          </nav>
          <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Secure checkout for Well Health supplements across Bangladesh
          </p>

          <ol className="mt-6 flex items-center gap-2 sm:gap-3">
            {STEPS.map((item, index) => {
              const active = step === item.id;
              const done = step > item.id;
              return (
                <li key={item.id} className="flex flex-1 items-center gap-2 sm:gap-3">
                  <button
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all",
                      active && "border-brand-green-600 bg-brand-green-50 shadow-sm",
                      done && "border-brand-green-200 bg-white",
                      !active && !done && "border-neutral-200 bg-white"
                    )}
                    onClick={() => {
                      if (item.id < step) setStep(item.id);
                    }}
                    type="button"
                  >
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        active || done
                          ? "bg-brand-green-600 text-white"
                          : "bg-neutral-100 text-neutral-500"
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : item.id}
                    </span>
                    <span
                      className={cn(
                        "truncate text-xs font-semibold sm:text-sm",
                        active ? "text-brand-green-900" : "text-neutral-600"
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                  {index < STEPS.length - 1 ? (
                    <span className="hidden h-px w-4 bg-neutral-200 sm:block" />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="pb-28 pt-8 sm:pb-12 sm:pt-10">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8 lg:items-start">
          <div className="space-y-5">
            {step === 1 ? (
              <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <header className="border-b border-neutral-100 bg-gradient-to-br from-brand-green-50/70 to-white px-5 py-4">
                  <h2 className="font-heading text-lg font-bold text-neutral-900">
                    Contact details
                  </h2>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    We&apos;ll send order updates to this email and phone
                  </p>
                </header>
                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  <Field label="Full name" className="sm:col-span-2">
                    <input
                      className={fieldClass}
                      onChange={(event) => setCustomerName(event.target.value)}
                      value={customerName}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      className={fieldClass}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      value={email}
                    />
                  </Field>
                  <Field label="Phone">
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 focus-within:border-brand-green-600 focus-within:ring-2 focus-within:ring-brand-green-600/20">
                      <span className="text-xs font-medium text-neutral-500">+880</span>
                      <input
                        className="h-full w-full border-none bg-transparent p-0 text-sm outline-none"
                        inputMode="tel"
                        onChange={(event) => setPhone(event.target.value)}
                        value={phone}
                      />
                    </div>
                  </Field>
                  {!context?.isAuthenticated ? (
                    <p className="sm:col-span-2 rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
                      Already have an account?{" "}
                      <Link
                        className="font-semibold text-brand-green-700 hover:underline"
                        href="/login?next=/checkout"
                      >
                        Sign in
                      </Link>{" "}
                      for faster checkout with saved addresses.
                    </p>
                  ) : null}
                </div>
              </section>
            ) : null}

            {step === 2 ? (
              <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <header className="border-b border-neutral-100 bg-gradient-to-br from-brand-green-50/70 to-white px-5 py-4">
                  <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-neutral-900">
                    <MapPin className="h-5 w-5 text-brand-green-600" />
                    Shipping address
                  </h2>
                </header>
                <div className="space-y-4 p-5">
                  {context?.addresses && context.addresses.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Saved addresses
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {context.addresses.map((address) => (
                          <button
                            className={cn(
                              "rounded-xl border p-3 text-left transition-all",
                              selectedAddressId === address.id
                                ? "border-brand-green-600 bg-brand-green-50 ring-2 ring-brand-green-600/15"
                                : "border-neutral-200 hover:border-brand-green-600/40"
                            )}
                            key={address.id}
                            onClick={() => {
                              setSelectedAddressId(address.id);
                              applyAddress(address);
                            }}
                            type="button"
                          >
                            <p className="text-sm font-semibold text-neutral-900">
                              {address.fullName}
                              {address.isDefault ? (
                                <span className="ml-2 rounded-full bg-brand-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-green-700">
                                  Default
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                              {address.details}, {address.area}, {address.district}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <label className="flex min-h-10 cursor-pointer items-center gap-2.5">
                    <input
                      checked={sameAsContact}
                      className="h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-600"
                      onChange={(event) => setSameAsContact(event.target.checked)}
                      type="checkbox"
                    />
                    <span className="text-sm text-neutral-700">
                      Shipping contact same as buyer details
                    </span>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {!sameAsContact ? (
                      <>
                        <Field label="Recipient name" className="sm:col-span-2">
                          <input
                            className={fieldClass}
                            onChange={(event) => setShippingFullName(event.target.value)}
                            value={shippingFullName}
                          />
                        </Field>
                        <Field label="Recipient phone" className="sm:col-span-2">
                          <div className="flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 focus-within:border-brand-green-600 focus-within:ring-2 focus-within:ring-brand-green-600/20">
                            <span className="text-xs font-medium text-neutral-500">+880</span>
                            <input
                              className="h-full w-full border-none bg-transparent p-0 text-sm outline-none"
                              inputMode="tel"
                              onChange={(event) => setShippingPhone(event.target.value)}
                              value={shippingPhone}
                            />
                          </div>
                        </Field>
                      </>
                    ) : null}

                    <Field label="District">
                      <select
                        className={fieldClass}
                        onChange={(event) => setShippingDistrict(event.target.value)}
                        value={shippingDistrict}
                      >
                        <option value="">Select district</option>
                        {bdDistricts.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Area / Thana">
                      <input
                        className={fieldClass}
                        onChange={(event) => setShippingArea(event.target.value)}
                        value={shippingArea}
                      />
                    </Field>
                    <Field label="Detailed address" className="sm:col-span-2">
                      <textarea
                        className="min-h-[96px] w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                        onChange={(event) => setShippingDetails(event.target.value)}
                        placeholder="House, road, landmark"
                        value={shippingDetails}
                      />
                    </Field>
                    <Field label="Delivery area" className="sm:col-span-2">
                      <select
                        className={fieldClass}
                        onChange={(event) => setZoneId(event.target.value)}
                        value={zoneId}
                      >
                        {shippingZones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name} — {formatPrice(zone.baseFee)} · {zone.etaMinDays}–
                            {zone.etaMaxDays} days
                          </option>
                        ))}
                      </select>
                      {selectedZone ? (
                        <p className="mt-1.5 text-xs text-neutral-500">
                          <Truck className="mr-1 inline h-3.5 w-3.5 text-brand-green-600" />
                          ETA {selectedZone.etaMinDays}–{selectedZone.etaMaxDays} days
                          {qualifiesFree
                            ? " · Free shipping unlocked"
                            : freeThreshold > 0
                              ? ` · Free over ${formatPrice(freeThreshold)}`
                              : ""}
                        </p>
                      ) : null}
                    </Field>
                  </div>
                </div>
              </section>
            ) : null}

            {step === 3 ? (
              <section className="space-y-5">
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <header className="border-b border-neutral-100 bg-gradient-to-br from-brand-green-50/70 to-white px-5 py-4">
                    <h2 className="font-heading text-lg font-bold text-neutral-900">
                      Payment method
                    </h2>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Choose how you&apos;d like to pay
                    </p>
                  </header>
                  <div className="grid gap-3 p-5">
                    <PaymentOption
                      active={paymentMethod === "COD"}
                      description={
                        codEnabled
                          ? "Pay when your order arrives"
                          : "Unavailable for this delivery area"
                      }
                      disabled={!codEnabled}
                      icon={Wallet}
                      label="Cash on Delivery"
                      onSelect={() => setPaymentMethod("COD")}
                    />
                    <PaymentOption
                      active={paymentMethod === "SSLCOMMERZ"}
                      badge="Cards & mobile banking"
                      description="Visa, Mastercard, Nagad, Rocket and more"
                      icon={CreditCard}
                      label="SSLCommerz"
                      onSelect={() => setPaymentMethod("SSLCOMMERZ")}
                    />
                    <PaymentOption
                      active={paymentMethod === "BKASH"}
                      badge="Popular"
                      description="Pay instantly with your bKash wallet"
                      icon={Smartphone}
                      label="bKash"
                      onSelect={() => setPaymentMethod("BKASH")}
                    />
                    {paymentMethod !== "COD" ? (
                      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        Online payment gateways are being connected. Your order will be placed now
                        and marked unpaid until payment is completed.
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="space-y-4 p-5">
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-neutral-700">Coupon code</span>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          className={cn(fieldClass, "sm:flex-1")}
                          disabled={Boolean(appliedCoupon) || isApplyingCoupon}
                          onChange={(event) => {
                            setCouponCode(event.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              if (!appliedCoupon) handleApplyCoupon();
                            }
                          }}
                          placeholder="Enter code e.g. WELL10"
                          value={couponCode}
                        />
                        {appliedCoupon ? (
                          <button
                            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                            onClick={handleRemoveCoupon}
                            type="button"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-green-900 disabled:opacity-60"
                            disabled={isApplyingCoupon || !couponCode.trim()}
                            onClick={handleApplyCoupon}
                            type="button"
                          >
                            {isApplyingCoupon ? "Checking…" : "Apply"}
                          </button>
                        )}
                      </div>
                      {couponError ? (
                        <p className="text-xs font-medium text-red-600">{couponError}</p>
                      ) : null}
                      {appliedCoupon ? (
                        <p className="rounded-xl border border-brand-green-100 bg-brand-green-50 px-3 py-2 text-xs font-medium text-brand-green-800">
                          {appliedCoupon.code} applied ({appliedCoupon.label}) — you save{" "}
                          {formatPrice(appliedCoupon.discount)}.
                        </p>
                      ) : (
                        <p className="text-xs text-neutral-500">
                          Have a promo code? Enter it and tap Apply to check the discount.
                        </p>
                      )}
                    </div>

                    <Field label="Order notes (optional)">
                      <input
                        className={fieldClass}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Delivery instructions"
                        value={notes}
                      />
                    </Field>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <h3 className="font-heading text-base font-bold text-neutral-900">
                    Review & confirm
                  </h3>
                  <dl className="mt-3 space-y-2 text-sm text-neutral-600">
                    <div className="flex justify-between gap-3">
                      <dt>Contact</dt>
                      <dd className="text-right font-medium text-neutral-900">
                        {customerName}
                        <br />
                        <span className="text-xs font-normal text-neutral-500">{email}</span>
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Ship to</dt>
                      <dd className="max-w-[60%] text-right font-medium text-neutral-900">
                        {shippingDetails}, {shippingArea}, {shippingDistrict}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Payment</dt>
                      <dd className="font-medium text-neutral-900">
                        {paymentMethod === "COD"
                          ? "Cash on Delivery"
                          : paymentMethod === "BKASH"
                            ? "bKash"
                            : "SSLCommerz"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              {step > 1 ? (
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setStep((current) => current - 1)}
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <Link
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                  href="/cart"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to cart
                </Link>
              )}

              {step < 3 ? (
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white hover:bg-brand-green-900"
                  onClick={goNext}
                  type="button"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white hover:bg-brand-green-900 disabled:opacity-60"
                  disabled={isPending}
                  onClick={placeOrder}
                  type="button"
                >
                  {isPending ? "Placing order…" : "Place order"}
                  <Lock className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-100 bg-gradient-to-br from-brand-green-50/60 to-white px-5 py-4">
                <h2 className="font-heading text-lg font-bold text-neutral-900">
                  Order summary
                </h2>
              </div>
              <ul className="max-h-64 divide-y divide-neutral-100 overflow-y-auto">
                {items.map((item) => (
                  <li className="flex gap-3 px-5 py-3" key={item.productId}>
                    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-50 ring-1 ring-neutral-200">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="" className="h-full w-full object-cover" src={item.imageUrl} />
                      ) : (
                        <Package2 className="h-5 w-5 text-brand-green-600" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm font-medium text-neutral-900">
                        {item.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500">
                        Qty {item.quantity} · {formatPrice(item.price)}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-neutral-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 border-t border-neutral-100 px-5 py-4 text-sm">
                <Row label="Subtotal" value={formatPrice(subtotal)} />
                {appliedCoupon ? (
                  <Row
                    label={`Discount (${appliedCoupon.code})`}
                    value={
                      <span className="font-semibold text-brand-green-700">
                        −{formatPrice(appliedCoupon.discount)}
                      </span>
                    }
                  />
                ) : null}
                <Row
                  label="Shipping"
                  value={
                    qualifiesFree ? (
                      <span className="font-semibold text-brand-green-700">Free</span>
                    ) : (
                      formatPrice(shippingFee)
                    )
                  }
                />
                <div className="flex items-end justify-between border-t border-neutral-100 pt-3">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="font-heading text-2xl font-bold text-brand-green-700">
                    {formatPrice(estimatedTotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-green-600" />
              <div>
                <p className="text-sm font-semibold text-neutral-900">Secure checkout</p>
                <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                  Your information is protected. Need help? Call{" "}
                  {context?.supportPhone || "support"}.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {step === 3 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-neutral-500">Total</p>
              <p className="font-heading text-lg font-bold text-brand-green-700">
                {formatPrice(estimatedTotal)}
              </p>
            </div>
            <button
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-green-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
              disabled={isPending}
              onClick={placeOrder}
              type="button"
            >
              {isPending ? "Placing…" : "Place order"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-neutral-600">
      <span>{label}</span>
      <span className="font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

function PaymentOption({
  active,
  label,
  description,
  badge,
  icon: Icon,
  disabled,
  onSelect,
}: {
  active: boolean;
  label: string;
  description: string;
  badge?: string;
  icon: typeof Wallet;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
        active
          ? "border-brand-green-600 bg-brand-green-50 ring-2 ring-brand-green-600/15"
          : "border-neutral-200 hover:border-brand-green-600/40",
        disabled && "cursor-not-allowed opacity-50"
      )}
      disabled={disabled}
      onClick={onSelect}
      type="button"
    >
      <span
        className={cn(
          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          active ? "bg-brand-green-600 text-white" : "bg-neutral-100 text-neutral-600"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900">{label}</span>
          {badge ? (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-xs text-neutral-500">{description}</span>
      </span>
      <span
        className={cn(
          "mt-1 h-4 w-4 shrink-0 rounded-full border-2",
          active ? "border-brand-green-600 bg-brand-green-600" : "border-neutral-300"
        )}
      />
    </button>
  );
}
