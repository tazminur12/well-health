import type { Metadata } from "next";

import { BRAND_NAME } from "@/lib/branding";

/** Public site origin — used for canonical URLs and JSON-LD. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "https://wellhealthint.com";
}

export function buildCanonicalUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: "website" | "article";
  /** Use for cart, checkout, wishlist — keep out of search results. */
  noIndex?: boolean;
};

/** Shared metadata builder for public marketing pages. */
export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  ogImage,
  ogType = "website",
  noIndex = false,
}: PageMetadataInput): Metadata {
  const canonical = buildCanonicalUrl(path);
  const fullTitle = title.includes(BRAND_NAME) ? title : `${title} | ${BRAND_NAME}`;
  const image = ogImage?.trim() || buildCanonicalUrl("/logo/logo-mark-512.png");

  const robots = noIndex
    ? { index: false, follow: false, googleBot: { index: false, follow: false } }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large" as const,
          "max-snippet": -1,
        },
      };

  return {
    title: { absolute: fullTitle },
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: BRAND_NAME,
      type: ogType,
      locale: "en_BD",
      images: [{ url: image, width: 1200, height: 630, alt: BRAND_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    robots,
  };
}
