import { HeroSlider } from "@/components/public/hero-slider";
import { AboutSection } from "@/components/public/about-section";
import { FeaturedProducts } from "@/components/public/featured-products";
import { TrustBadges } from "@/components/public/trust-badges";
import { ShopPreview } from "@/components/public/shop-preview";
import { CustomerReviews } from "@/components/public/customer-reviews";
import { FAQAccordion } from "@/components/public/faq-accordion";
import { ContactSection } from "@/components/public/ContactSection";
import {
  getPublicAboutHome,
  getPublicFaqItems,
  getPublicHeroSlides,
  getPublicTrustBadges,
} from "@/lib/content/public-queries";
import { toPublicProductCard } from "@/lib/products/public-mapper";
import { getActiveProducts } from "@/lib/products/public-queries";
import { getPublicStoreSettings } from "@/lib/settings/public-queries";

export default async function HomePage() {
  const [products, heroSlides, trustBadges, about, faqs, settings] =
    await Promise.all([
      getActiveProducts(),
      getPublicHeroSlides(),
      getPublicTrustBadges(),
      getPublicAboutHome(),
      getPublicFaqItems(),
      getPublicStoreSettings(),
    ]);
  const previewProducts = products.slice(0, 8).map(toPublicProductCard);

  return (
    <div className="space-y-0">
      <HeroSlider slides={heroSlides} />
      <TrustBadges badges={trustBadges} />
      <AboutSection content={about} />
      <FeaturedProducts />
      <ShopPreview products={previewProducts} />
      <CustomerReviews />
      <FAQAccordion faqs={faqs} />
      <ContactSection settings={settings} />
    </div>
  );
}
