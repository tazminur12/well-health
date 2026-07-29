import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/branding";
import type { StoreSettings } from "@/lib/settings/schemas";

import { buildCanonicalUrl, getSiteUrl } from "./site";

type OrganizationSchemaInput = {
  settings: StoreSettings;
  logoUrl: string;
};

export function buildOrganizationSchema({ settings, logoUrl }: OrganizationSchemaInput) {
  const siteUrl = getSiteUrl();

  return {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: settings.storeName || BRAND_NAME,
    alternateName: [
      "Well Health",
      "Well Health Trade",
      "ওয়েল হেলথ",
      "ওয়েল হেলথ ট্রেড ইন্টারন্যাশনাল",
    ],
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
    },
    image: logoUrl,
    description:
      settings.seoDescription ||
      "Premium health supplements with clinical quality and nature-backed formulations for everyday wellbeing in Bangladesh. বাংলাদেশে প্রিমিয়াম স্বাস্থ্য সাপ্লিমেন্ট — ভিটামিন, ওমেগা ও ক্লিনিক্যাল কোয়ালিটির ফর্মুলা।",
    slogan: settings.tagline || BRAND_TAGLINE,
    email: settings.supportEmail,
    telephone: settings.supportPhone,
    knowsLanguage: ["en", "bn"],
    address: {
      "@type": "PostalAddress",
      streetAddress: [settings.addressLine1, settings.addressLine2].filter(Boolean).join(", "),
      addressLocality: settings.city,
      addressCountry: settings.country,
    },
    areaServed: {
      "@type": "Country",
      name: "Bangladesh",
    },
    sameAs: [
      settings.facebookUrl,
      settings.instagramUrl,
      settings.linkedinUrl,
      settings.youtubeUrl,
    ].filter(Boolean),
  };
}

export function buildWebSiteSchema({ settings }: { settings: StoreSettings }) {
  const siteUrl = getSiteUrl();

  return {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: settings.storeName || BRAND_NAME,
    description: settings.seoDescription || settings.tagline || BRAND_TAGLINE,
    publisher: { "@id": `${siteUrl}/#organization` },
    inLanguage: ["en-BD", "bn-BD"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildLocalBusinessSchema({
  settings,
  logoUrl,
}: OrganizationSchemaInput) {
  const siteUrl = getSiteUrl();
  const address = [settings.addressLine1, settings.addressLine2, settings.city, settings.country]
    .filter(Boolean)
    .join(", ");

  return {
    "@type": "HealthAndBeautyBusiness",
    "@id": `${siteUrl}/#localbusiness`,
    name: settings.storeName || BRAND_NAME,
    image: logoUrl,
    url: siteUrl,
    telephone: settings.supportPhone,
    email: settings.supportEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: settings.city,
      addressCountry: settings.country,
    },
    openingHours: settings.workingHours,
    priceRange: "৳৳",
    areaServed: "Bangladesh",
    availableLanguage: ["English", "Bengali"],
    parentOrganization: { "@id": `${siteUrl}/#organization` },
  };
}

export function resolveLogoUrl(ogImage?: string): string {
  return ogImage?.trim() || buildCanonicalUrl("/logo/logo-mark-512.png");
}
