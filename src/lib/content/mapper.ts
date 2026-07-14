import type {
  FaqItem,
  HeroSlide,
  TrustBadge,
} from "@prisma/client";

import type {
  AboutHomeContent,
  FaqItemInput,
  HeroSlideInput,
  SiteAssetsContent,
  TrustBadgeInput,
} from "@/lib/content/schemas";

export type AdminHeroSlide = {
  id: string;
  imageUrl: string;
  alt: string;
  linkUrl: string | null;
  headline: string;
  subheading: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};

export type AdminTrustBadge = {
  id: string;
  iconKey: string;
  title: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

export type AdminFaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
};

export const ABOUT_HOME_KEY = "about_home";
export const SITE_ASSETS_KEY = "site_assets";

export const defaultAboutHome: AboutHomeContent = {
  eyebrow: "About Us",
  heading: "Well Health Trade International",
  description:
    "We improve everyday wellbeing with high-quality, safe, and effective health supplements — built on innovation, careful quality assurance, and genuine customer care.",
  imageUrl:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  imageAlt: "Well Health clinical wellness and care",
  highlights: [
    "Lab-tested formulations you can trust",
    "GMP-aligned manufacturing standards",
    "Clear guidance for everyday wellness",
  ],
  ctaLabel: "Read More",
  ctaHref: "/about",
  features: [
    { iconKey: "Target", title: "Our Mission", description: "Better Health, Better Tomorrow" },
    { iconKey: "Gem", title: "Our Vision", description: "Global Health For Everyone" },
    {
      iconKey: "HeartHandshake",
      title: "Our Values",
      description: "Quality · Integrity · Care · Innovation",
    },
    { iconKey: "Award", title: "Why Choose Us", description: "Trusted Quality, Customer First" },
  ],
};

export const defaultSiteAssets: SiteAssetsContent = {
  logoLightUrl: "/logo/logo-full.png",
  logoDarkUrl: "/logo/logo-mark.png",
  faviconUrl: "/logo/favicon-32.png",
  ogImageUrl: "/logo/logo-mark-512.png",
};

export function mapHeroSlide(slide: HeroSlide): AdminHeroSlide {
  return {
    id: slide.id,
    imageUrl: slide.imageUrl,
    alt: slide.alt,
    linkUrl: slide.linkUrl,
    headline: slide.headline ?? "",
    subheading: slide.subheading ?? "",
    primaryCtaText: slide.primaryCtaText ?? "",
    primaryCtaLink: slide.primaryCtaLink ?? "",
    secondaryCtaText: slide.secondaryCtaText ?? "",
    secondaryCtaLink: slide.secondaryCtaLink ?? "",
    sortOrder: slide.sortOrder,
    isActive: slide.isActive,
    updatedAt: slide.updatedAt.toISOString(),
  };
}

export function mapTrustBadge(badge: TrustBadge): AdminTrustBadge {
  return {
    id: badge.id,
    iconKey: badge.iconKey,
    title: badge.title,
    description: badge.description,
    sortOrder: badge.sortOrder,
    isActive: badge.isActive,
  };
}

export function mapFaqItem(item: FaqItem): AdminFaqItem {
  return {
    id: item.id,
    question: item.question,
    answer: item.answer,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
  };
}

export function toHeroCreateData(input: HeroSlideInput) {
  return {
    imageUrl: input.imageUrl.trim(),
    alt: input.alt.trim(),
    linkUrl: input.linkUrl?.trim() || null,
    headline: input.headline?.trim() || null,
    subheading: input.subheading?.trim() || null,
    primaryCtaText: input.primaryCtaText?.trim() || null,
    primaryCtaLink: input.primaryCtaLink?.trim() || null,
    secondaryCtaText: input.secondaryCtaText?.trim() || null,
    secondaryCtaLink: input.secondaryCtaLink?.trim() || null,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  };
}

export function toTrustCreateData(input: TrustBadgeInput) {
  return {
    iconKey: input.iconKey,
    title: input.title.trim(),
    description: input.description.trim(),
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  };
}

export function toFaqCreateData(input: FaqItemInput) {
  return {
    question: input.question.trim(),
    answer: input.answer.trim(),
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  };
}
