import type { Metadata } from "next";

import { BRAND_LOGO, BRAND_NAME, BRAND_TAGLINE } from "@/lib/branding";
import type { StoreSettings } from "@/lib/settings/schemas";

import {
  DEFAULT_SEO_DESCRIPTION,
  ROOT_SEO_KEYWORDS,
} from "./keywords";
import { resolveLogoUrl } from "./organization";
import { buildCanonicalUrl, getSiteUrl } from "./site";

type RootMetadataInput = {
  settings: StoreSettings;
  ogImage?: string;
};

/** Default metadata for the entire site — used by the root layout. */
export function buildRootMetadata({ settings, ogImage }: RootMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const storeName = settings.storeName || BRAND_NAME;
  const title = settings.seoTitle?.trim() || storeName;
  const description = settings.seoDescription?.trim() || DEFAULT_SEO_DESCRIPTION;
  const image = resolveLogoUrl(ogImage);
  const tagline = settings.tagline?.trim() || BRAND_TAGLINE;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${storeName}`,
    },
    description,
    keywords: [...ROOT_SEO_KEYWORDS],
    applicationName: storeName,
    creator: storeName,
    publisher: storeName,
    category: "Health & Wellness",
    alternates: {
      canonical: siteUrl,
      languages: {
        "en-BD": siteUrl,
        "bn-BD": siteUrl,
        "x-default": siteUrl,
      },
    },
    icons: {
      icon: [{ url: BRAND_LOGO.favicon, type: "image/png", sizes: "32x32" }],
      apple: [{ url: BRAND_LOGO.appleTouchIcon, sizes: "180x180" }],
      shortcut: [BRAND_LOGO.favicon],
    },
    manifest: buildCanonicalUrl("/manifest.webmanifest"),
    openGraph: {
      type: "website",
      locale: "en_BD",
      alternateLocale: ["bn_BD"],
      url: siteUrl,
      siteName: storeName,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${storeName} — ${tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
    other: {
      "geo.region": "BD",
      "geo.placename": settings.city || "Dhaka",
      language: "English, Bangla",
    },
  };
}
