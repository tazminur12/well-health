import {
  ABOUT_HOME_KEY,
  SITE_ASSETS_KEY,
  defaultAboutHome,
  defaultSiteAssets,
  mapFaqItem,
  mapHeroSlide,
  mapTrustBadge,
  type AdminFaqItem,
  type AdminHeroSlide,
  type AdminTrustBadge,
} from "@/lib/content/mapper";
import {
  aboutHomeSchema,
  siteAssetsSchema,
  type AboutHomeContent,
  type SiteAssetsContent,
} from "@/lib/content/schemas";
import { prisma } from "@/lib/prisma";

export type PublicHeroSlide = Pick<
  AdminHeroSlide,
  "id" | "imageUrl" | "alt" | "linkUrl" | "headline" | "subheading"
>;

const fallbackHero: PublicHeroSlide[] = [
  {
    id: "fallback-1",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1920&h=700&q=80",
    alt: "Healthcare and wellness essentials banner",
    linkUrl: null,
    headline: "",
    subheading: "",
  },
  {
    id: "fallback-2",
    imageUrl:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1920&h=700&q=80",
    alt: "Premium wellness product banner",
    linkUrl: null,
    headline: "",
    subheading: "",
  },
];

export async function getPublicHeroSlides(): Promise<PublicHeroSlide[]> {
  try {
    const rows = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }],
    });
    if (rows.length === 0) return fallbackHero;
    return rows.map((row) => {
      const mapped = mapHeroSlide(row);
      return {
        id: mapped.id,
        imageUrl: mapped.imageUrl,
        alt: mapped.alt,
        linkUrl: mapped.linkUrl,
        headline: mapped.headline,
        subheading: mapped.subheading,
      };
    });
  } catch {
    return fallbackHero;
  }
}

export async function getPublicTrustBadges(): Promise<AdminTrustBadge[]> {
  try {
    const rows = await prisma.trustBadge.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }],
    });
    return rows.map(mapTrustBadge);
  } catch {
    return [];
  }
}

export async function getPublicFaqItems(): Promise<AdminFaqItem[]> {
  try {
    const rows = await prisma.faqItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }],
    });
    return rows.map(mapFaqItem);
  } catch {
    return [];
  }
}

export async function getPublicAboutHome(): Promise<AboutHomeContent> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: ABOUT_HOME_KEY } });
    if (!row) return defaultAboutHome;
    const parsed = aboutHomeSchema.safeParse(row.value);
    return parsed.success ? parsed.data : defaultAboutHome;
  } catch {
    return defaultAboutHome;
  }
}

export async function getPublicSiteAssets(): Promise<SiteAssetsContent> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: SITE_ASSETS_KEY } });
    if (!row) return defaultSiteAssets;
    const parsed = siteAssetsSchema.safeParse(row.value);
    return parsed.success ? parsed.data : defaultSiteAssets;
  } catch {
    return defaultSiteAssets;
  }
}
