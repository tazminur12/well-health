import { BRAND_NAME } from "@/lib/branding";
import type { StoreSettings } from "@/lib/settings/schemas";

import {
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
  resolveLogoUrl,
} from "./organization";
import { buildCanonicalUrl, getSiteUrl } from "./site";

type AboutStructuredDataInput = {
  settings: StoreSettings;
  ogImage?: string;
};

export function buildAboutPageStructuredData({
  settings,
  ogImage,
}: AboutStructuredDataInput) {
  const siteUrl = getSiteUrl();
  const aboutUrl = buildCanonicalUrl("/about");
  const logoUrl = resolveLogoUrl(ogImage);

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationSchema({ settings, logoUrl }),
      {
        "@type": "AboutPage",
        "@id": `${aboutUrl}#webpage`,
        url: aboutUrl,
        name: `About ${settings.storeName || BRAND_NAME}`,
        description:
          "Learn about Well Health Trade International — our history, mission, vision, core values, leadership, and company timeline in Bangladesh.",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#organization` },
        primaryImageOfPage: logoUrl,
        inLanguage: "en-BD",
      },
      buildWebSiteSchema({ settings }),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "About Us",
            item: aboutUrl,
          },
        ],
      },
      buildLocalBusinessSchema({ settings, logoUrl }),
    ],
  };
}
