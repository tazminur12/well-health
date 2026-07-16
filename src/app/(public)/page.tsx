import type { Metadata } from "next";

import { AboutSection } from "@/components/public/about-section";
import { ContactSection } from "@/components/public/ContactSection";
import { CustomerReviews } from "@/components/public/customer-reviews";
import { DistributorSection } from "@/components/public/distributor-section";
import { FAQAccordion } from "@/components/public/faq-accordion";
import { FeaturedProducts } from "@/components/public/featured-products";
import { HeroSlider } from "@/components/public/hero-slider";
import { TrustBadges } from "@/components/public/trust-badges";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getPublicAboutHome,
  getPublicFaqItems,
  getPublicHeroSlides,
  getPublicTrustBadges,
} from "@/lib/content/public-queries";
import { SEO_KEYWORDS } from "@/lib/seo/keywords";
import { getSeoAssets } from "@/lib/seo/page-assets";
import { buildHomePageStructuredData } from "@/lib/seo/structured-data";
import { buildPageMetadata } from "@/lib/seo/site";
import { getPublicStoreSettings } from "@/lib/settings/public-queries";

export async function generateMetadata(): Promise<Metadata> {
  const { settings, ogImage } = await getSeoAssets();

  return buildPageMetadata({
    title: settings.seoTitle || "Premium Health Supplements Bangladesh",
    description:
      settings.seoDescription ||
      "Shop premium health supplements from Well Health Trade International — clinical quality, science-backed eye care, omega, brain health, and vitamin formulas with trusted delivery across Bangladesh.",
    path: "/",
    keywords: [...SEO_KEYWORDS.home],
    ogImage,
  });
}

export default async function HomePage() {
  const [heroSlides, trustBadges, about, faqs, settings, seo] = await Promise.all([
    getPublicHeroSlides(),
    getPublicTrustBadges(),
    getPublicAboutHome(),
    getPublicFaqItems(),
    getPublicStoreSettings(),
    getSeoAssets(),
  ]);

  const structuredData = buildHomePageStructuredData({
    settings: seo.settings,
    ogImage: seo.ogImage,
    faqs,
  });

  return (
    <>
      <JsonLd data={structuredData} />
      <div className="space-y-0">
        <HeroSlider slides={heroSlides} />
        <TrustBadges badges={trustBadges} />
        <AboutSection content={about} />
        <FeaturedProducts />
        <DistributorSection />
        <CustomerReviews />
        <FAQAccordion faqs={faqs} />
        <ContactSection settings={settings} />
      </div>
    </>
  );
}
