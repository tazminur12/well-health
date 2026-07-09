import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { CTABanner } from "@/components/public/cta-banner";
import { ImageGallery } from "@/components/public/image-gallery";
import { ProductInfoPanel } from "@/components/public/product-info-panel";
import { ProductTabs } from "@/components/public/product-tabs";
import { RelatedProducts } from "@/components/public/related-products";

type ProductDetail = {
  slug: string;
  category: string;
  categorySlug: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  saveLabel?: string;
  stockStatus: string;
  stockTone: "green" | "amber";
  rating: number;
  reviewsCount: number;
  badgeLabel: string;
  specs: Array<{ label: string; value: string }>;
  fullDescription: string;
  reviews: Array<{ name: string; initials: string; date: string; rating: number; comment: string }>;
  related: Array<{ name: string; description: string; price: string; category: string }>;
};

const products: Record<string, ProductDetail> = {
  "eyecare-b": {
    slug: "eyecare-b",
    category: "Eye Care",
    categorySlug: "eye-care",
    name: "Eyecare-B",
    description: "Eye Vitamin & Mineral Supplement, 30 Tablets",
    price: "৳ 850.00",
    originalPrice: "৳ 999.00",
    saveLabel: "Save 15%",
    stockStatus: "In Stock - Ships within 24 hours",
    stockTone: "green",
    rating: 5,
    reviewsCount: 24,
    badgeLabel: "Best Seller",
    specs: [
      { label: "Weight / Volume", value: "30 Tablets" },
      { label: "Ingredients Highlight", value: "Lutein, Zinc, Vitamin A, Bilberry Extract" },
      { label: "Manufacturer", value: "Well Health Trade International" },
      { label: "Country of Origin", value: "Bangladesh" },
    ],
    fullDescription:
      `Eyecare-B is designed for customers who want dependable daily eye support in a simple tablet format. It combines key vitamins and minerals associated with healthy vision, making it a practical supplement for routine wellness.

    Our formulation approach prioritizes consistency, quality, and ease of use for the Bangladeshi market. The result is a clean, straightforward product experience built around trust, clarity, and everyday support.`,
    reviews: [
      { name: "Ayesha Rahman", initials: "AR", date: "2026-07-02", rating: 5, comment: "Great packaging and quick delivery. I’ve added this to my daily routine and it feels reliable." },
      { name: "Tanvir Hasan", initials: "TH", date: "2026-06-28", rating: 5, comment: "The product quality feels premium and the supplement is easy to take every day." },
      { name: "Nusrat Jahan", initials: "NJ", date: "2026-06-22", rating: 4, comment: "Good value for money and the brand presentation feels trustworthy." },
    ],
    related: [
      { name: "Vision Guard", description: "Advanced Eye Care Formula, 60 Tablets", price: "৳ 950.00", category: "Eye Care" },
      { name: "Blue Light Shield", description: "Daily Screen Support, 30 Capsules", price: "৳ 720.00", category: "Eye Care" },
      { name: "Vitamin C Plus", description: "Immune Support, 60 Tablets", price: "৳ 500.00", category: "Vitamins" },
      { name: "Multivitamin Daily", description: "Complete Daily Nutrition, 30 Tablets", price: "৳ 890.00", category: "Vitamins" },
    ],
  },
  "brain-health-syrup": {
    slug: "brain-health-syrup",
    category: "Brain Health",
    categorySlug: "brain-health",
    name: "Brain Health Syrup",
    description: "Omega 3,6,9 with Vitamins & Minerals, 200ml",
    price: "৳ 950.00",
    originalPrice: "৳ 1,100.00",
    saveLabel: "Save 14%",
    stockStatus: "Only 5 left in stock",
    stockTone: "amber",
    rating: 4,
    reviewsCount: 24,
    badgeLabel: "New",
    specs: [
      { label: "Weight / Volume", value: "200ml" },
      { label: "Ingredients Highlight", value: "Omega 3, 6, 9, Vitamins B & D, Minerals" },
      { label: "Manufacturer", value: "Well Health Trade International" },
      { label: "Country of Origin", value: "Bangladesh" },
    ],
    fullDescription:
      `Brain Health Syrup is a family-friendly wellness product made to support everyday nutritional needs in a convenient syrup format. It combines omega fatty acids with supportive vitamins and minerals for a balanced supplement experience.

This dummy detail page reflects the clinical, trustworthy tone used across the catalog while leaving room for real product content later. It is structured to feel informative without overloading the user.`,
    reviews: [
      { name: "Rakib Ahmed", initials: "RA", date: "2026-07-03", rating: 4, comment: "Nice product and easy to use. The packaging looks polished and professional." },
      { name: "Mim Akter", initials: "MA", date: "2026-06-30", rating: 4, comment: "Feels like a premium supplement. Delivery was quick and smooth." },
      { name: "Shahriar Islam", initials: "SI", date: "2026-06-20", rating: 5, comment: "Good flavor and great brand presentation. Will buy again." },
    ],
    related: [
      { name: "Mind Boost", description: "Daily Brain Support, 60 Capsules", price: "৳ 1,350.00", category: "Brain Health" },
      { name: "Focus Pro", description: "Cognitive Support, 30 Tablets", price: "৳ 1,100.00", category: "Brain Health" },
      { name: "Omega Balance", description: "Heart & Joint Support, 30 Softgels", price: "৳ 1,750.00", category: "Omega" },
      { name: "Ultra Omega", description: "Premium Omega Blend, 90 Softgels", price: "৳ 1,950.00", category: "Omega" },
    ],
  },
};

const defaultProduct = products["eyecare-b"];

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = products[slug] ?? defaultProduct;

  return (
    <div className="bg-white text-neutral-900">
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Link className="transition-colors duration-200 hover:text-brand-green-600" href="/">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link className="transition-colors duration-200 hover:text-brand-green-600" href="/shop">
              Shop
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>{product.category}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-brand-green-600">{product.name}</span>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <ImageGallery badgeLabel={product.badgeLabel} productName={product.name} />
            <ProductInfoPanel product={product} />
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductTabs
            description={product.fullDescription}
            reviews={product.reviews}
            specs={product.specs}
          />
        </div>
      </section>

      <RelatedProducts products={product.related} />

      <CTABanner />
    </div>
  );
}