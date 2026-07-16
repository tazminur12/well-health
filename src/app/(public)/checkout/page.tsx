import type { Metadata } from "next";

import { CheckoutPageClient } from "@/components/public/checkout-page";
import { buildPageMetadata } from "@/lib/seo/site";
import { getPublicShippingZones } from "@/lib/shipping/public-queries";

export const metadata: Metadata = buildPageMetadata({
  title: "Checkout",
  description: "Complete your Well Health order with secure Bangladesh delivery options.",
  path: "/checkout",
  noIndex: true,
});

export default async function CheckoutPage() {
  const shippingZones = await getPublicShippingZones();

  return <CheckoutPageClient shippingZones={shippingZones} />;
}
