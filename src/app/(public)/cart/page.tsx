import type { Metadata } from "next";

import { CartPageClient } from "@/components/public/cart-page";
import { buildPageMetadata } from "@/lib/seo/site";
import { getPublicStoreSettings } from "@/lib/settings/public-queries";
import { getPublicShippingZones } from "@/lib/shipping/public-queries";

export const metadata: Metadata = buildPageMetadata({
  title: "Shopping Cart",
  description: "Review your Well Health supplement cart and proceed to secure checkout.",
  path: "/cart",
  noIndex: true,
});

export default async function CartPage() {
  const [settings, shippingZones] = await Promise.all([
    getPublicStoreSettings(),
    getPublicShippingZones(),
  ]);

  return (
    <CartPageClient
      codEnabled={settings.codEnabled}
      freeShippingMin={settings.freeShippingMin}
      shippingZones={shippingZones}
      supportPhone={settings.supportPhone}
    />
  );
}
