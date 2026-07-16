import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { DistributorPageContent } from "@/components/public/distributor-page";
import { SEO_KEYWORDS } from "@/lib/seo/keywords";
import { getSeoAssets } from "@/lib/seo/page-assets";
import { buildDistributorPageStructuredData } from "@/lib/seo/structured-data";
import { buildPageMetadata } from "@/lib/seo/site";

export async function generateMetadata(): Promise<Metadata> {
  const { ogImage } = await getSeoAssets();

  return buildPageMetadata({
    title: "Become a Distributor — Partner With Well Health",
    description:
      "Apply to become an authorized distributor of Well Health Trade International. Join a clinical premium supplement brand with structured onboarding and territory support across Bangladesh.",
    path: "/distributor",
    keywords: [...SEO_KEYWORDS.distributor],
    ogImage,
  });
}

export default function DistributorPage() {
  const structuredData = buildDistributorPageStructuredData();

  return (
    <>
      <JsonLd data={structuredData} />
      <DistributorPageContent />
    </>
  );
}
