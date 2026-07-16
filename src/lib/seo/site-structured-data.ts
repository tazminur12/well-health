import type { StoreSettings } from "@/lib/settings/schemas";

import {
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
  resolveLogoUrl,
} from "./organization";

type SiteStructuredDataInput = {
  settings: StoreSettings;
  ogImage?: string;
};

/** Global JSON-LD injected from the root layout on every public page. */
export function buildSiteStructuredData({ settings, ogImage }: SiteStructuredDataInput) {
  const logoUrl = resolveLogoUrl(ogImage);

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationSchema({ settings, logoUrl }),
      buildWebSiteSchema({ settings }),
      buildLocalBusinessSchema({ settings, logoUrl }),
    ],
  };
}
