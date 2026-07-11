import { HeroSlider } from "@/components/public/hero-slider";
import { AboutSection } from "@/components/public/about-section";
import { FeaturedProducts } from "@/components/public/featured-products";
import { TrustBadges } from "@/components/public/trust-badges";
import { ShopPreview } from "@/components/public/shop-preview";

export default function HomePage() {
  return (
    <div className="space-y-0">
      <HeroSlider />
      <TrustBadges />
      <AboutSection />
      <FeaturedProducts />
      <ShopPreview />
    </div>
  );
}