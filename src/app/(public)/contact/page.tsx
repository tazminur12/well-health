import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { ContactPageContent } from "@/components/public/contact-page";
import { SEO_KEYWORDS } from "@/lib/seo/keywords";
import { getSeoAssets } from "@/lib/seo/page-assets";
import { buildContactPageStructuredData } from "@/lib/seo/structured-data";
import { buildPageMetadata } from "@/lib/seo/site";

export async function generateMetadata(): Promise<Metadata> {
  const { ogImage } = await getSeoAssets();

  return buildPageMetadata({
    title: "Contact Us — Support, Orders & Partnership",
    description:
      "Contact Well Health Trade International for product questions, order support, delivery help, and partnership enquiries. Reach our Dhaka team by phone, email, or WhatsApp.",
    path: "/contact",
    keywords: [...SEO_KEYWORDS.contact],
    ogImage,
  });
}

export default async function ContactPage() {
  const { settings } = await getSeoAssets();

  const structuredData = buildContactPageStructuredData({ settings });

  return (
    <>
      <JsonLd data={structuredData} />
      <ContactPageContent />
    </>
  );
}
