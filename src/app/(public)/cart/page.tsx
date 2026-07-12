import type { Metadata } from "next";

import { CartPageClient } from "@/components/public/cart-page";
import { getPublicStoreSettings } from "@/lib/settings/public-queries";
import { getPublicShippingZones } from "@/lib/shipping/public-queries";

export const metadata: Metadata = {
  title: "Shopping Cart | Well Health",
  description: "Review your Well Health cart and proceed to secure checkout.",
};

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
