import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { AboutPageContent } from "@/components/public/about-page";
import { SEO_KEYWORDS } from "@/lib/seo/keywords";
import { getSeoAssets } from "@/lib/seo/page-assets";
import { buildAboutPageStructuredData } from "@/lib/seo/about-structured-data";
import { buildPageMetadata } from "@/lib/seo/site";

export async function generateMetadata(): Promise<Metadata> {
  const { ogImage } = await getSeoAssets();

  return buildPageMetadata({
    title: "About Us — Mission, Vision, History & Leadership",
    description:
      "Discover Well Health Trade International: our company history, mission, vision, core values, managing director's message, and milestones serving families across Bangladesh with science-backed supplements.",
    path: "/about",
    keywords: [...SEO_KEYWORDS.about],
    ogImage,
  });
}

export default async function AboutPage() {
  const { settings, ogImage } = await getSeoAssets();

  const structuredData = buildAboutPageStructuredData({
    settings,
    ogImage,
  });

  return (
    <>
      <JsonLd data={structuredData} />
      <AboutPageContent />
    </>
  );
}
