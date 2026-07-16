import { getPublicSiteAssets } from "@/lib/content/public-queries";
import { getPublicStoreSettings } from "@/lib/settings/public-queries";
import type { StoreSettings } from "@/lib/settings/schemas";

export type SeoAssets = {
  settings: StoreSettings;
  ogImage?: string;
};

/** Fetch live store settings and OG image for page-level SEO. */
export async function getSeoAssets(): Promise<SeoAssets> {
  const [settings, assets] = await Promise.all([
    getPublicStoreSettings(),
    getPublicSiteAssets(),
  ]);

  return {
    settings,
    ogImage: assets.ogImageUrl?.trim() || undefined,
  };
}
