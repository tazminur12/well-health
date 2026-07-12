import type { Metadata } from "next";

import { CheckoutPageClient } from "@/components/public/checkout-page";
import { getPublicShippingZones } from "@/lib/shipping/public-queries";

export const metadata: Metadata = {
  title: "Checkout | Well Health",
  description: "Complete your Well Health order with secure Bangladesh delivery options.",
};

export default async function CheckoutPage() {
  const shippingZones = await getPublicShippingZones();

  return <CheckoutPageClient shippingZones={shippingZones} />;
}
