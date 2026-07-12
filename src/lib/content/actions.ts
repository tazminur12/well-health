"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import {
  ABOUT_HOME_KEY,
  SITE_ASSETS_KEY,
  defaultAboutHome,
  defaultSiteAssets,
  mapFaqItem,
  mapHeroSlide,
  mapTrustBadge,
  toFaqCreateData,
  toHeroCreateData,
  toTrustCreateData,
  type AdminFaqItem,
  type AdminHeroSlide,
  type AdminTrustBadge,
} from "@/lib/content/mapper";
import {
  aboutHomeSchema,
  faqItemInputSchema,
  heroSlideInputSchema,
  siteAssetsSchema,
  trustBadgeInputSchema,
  type AboutHomeContent,
  type FaqItemInput,
  type HeroSlideInput,
  type SiteAssetsContent,
  type TrustBadgeInput,
} from "@/lib/content/schemas";
import { prisma } from "@/lib/prisma";

export type ContentActionResult<T = undefined> = {
  error?: string;
  data?: T;
};

function handleError<T = undefined>(error: unknown): ContentActionResult<T> {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return { error: "Item not found." };
  }
  console.error("Content action failed:", error);
  return {
    error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

function revalidateContent() {
  revalidatePath("/");
  revalidatePath("/admin/content");
  revalidatePath("/about");
}

// ——— Hero ———

export async function listHeroSlidesAction(): Promise<ContentActionResult<AdminHeroSlide[]>> {
  try {
    await requireAdmin();
    const rows = await prisma.heroSlide.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    return { data: rows.map(mapHeroSlide) };
  } catch (error) {
    return handleError(error);
  }
}

export async function createHeroSlideAction(
  input: HeroSlideInput
): Promise<ContentActionResult<AdminHeroSlide>> {
  try {
    await requireAdmin();
    const parsed = heroSlideInputSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid slide" };

    const count = await prisma.heroSlide.count();
    const slide = await prisma.heroSlide.create({
      data: toHeroCreateData({ ...parsed.data, sortOrder: parsed.data.sortOrder || count }),
    });
    revalidateContent();
    return { data: mapHeroSlide(slide) };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateHeroSlideAction(
  id: string,
  input: HeroSlideInput
): Promise<ContentActionResult<AdminHeroSlide>> {
  try {
    await requireAdmin();
    const parsed = heroSlideInputSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid slide" };

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: toHeroCreateData(parsed.data),
    });
    revalidateContent();
    return { data: mapHeroSlide(slide) };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteHeroSlideAction(id: string): Promise<ContentActionResult> {
  try {
    await requireAdmin();
    await prisma.heroSlide.delete({ where: { id } });
    revalidateContent();
    return {};
  } catch (error) {
    return handleError(error);
  }
}

export async function toggleHeroSlideActiveAction(
  id: string
): Promise<ContentActionResult<AdminHeroSlide>> {
  try {
    await requireAdmin();
    const existing = await prisma.heroSlide.findUnique({ where: { id } });
    if (!existing) return { error: "Slide not found." };
    const slide = await prisma.heroSlide.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    revalidateContent();
    return { data: mapHeroSlide(slide) };
  } catch (error) {
    return handleError(error);
  }
}

export async function reorderHeroSlidesAction(
  orderedIds: string[]
): Promise<ContentActionResult> {
  try {
    await requireAdmin();
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.heroSlide.update({ where: { id }, data: { sortOrder: index } })
      )
    );
    revalidateContent();
    return {};
  } catch (error) {
    return handleError(error);
  }
}

// ——— Trust badges ———

export async function listTrustBadgesAction(): Promise<ContentActionResult<AdminTrustBadge[]>> {
  try {
    await requireAdmin();
    const rows = await prisma.trustBadge.findMany({ orderBy: [{ sortOrder: "asc" }] });
    return { data: rows.map(mapTrustBadge) };
  } catch (error) {
    return handleError(error);
  }
}

export async function createTrustBadgeAction(
  input: TrustBadgeInput
): Promise<ContentActionResult<AdminTrustBadge>> {
  try {
    await requireAdmin();
    const parsed = trustBadgeInputSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid badge" };
    const count = await prisma.trustBadge.count();
    const badge = await prisma.trustBadge.create({
      data: toTrustCreateData({ ...parsed.data, sortOrder: parsed.data.sortOrder || count }),
    });
    revalidateContent();
    return { data: mapTrustBadge(badge) };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateTrustBadgeAction(
  id: string,
  input: TrustBadgeInput
): Promise<ContentActionResult<AdminTrustBadge>> {
  try {
    await requireAdmin();
    const parsed = trustBadgeInputSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid badge" };
    const badge = await prisma.trustBadge.update({
      where: { id },
      data: toTrustCreateData(parsed.data),
    });
    revalidateContent();
    return { data: mapTrustBadge(badge) };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteTrustBadgeAction(id: string): Promise<ContentActionResult> {
  try {
    await requireAdmin();
    await prisma.trustBadge.delete({ where: { id } });
    revalidateContent();
    return {};
  } catch (error) {
    return handleError(error);
  }
}

// ——— FAQ ———

export async function listFaqItemsAction(): Promise<ContentActionResult<AdminFaqItem[]>> {
  try {
    await requireAdmin();
    const rows = await prisma.faqItem.findMany({ orderBy: [{ sortOrder: "asc" }] });
    return { data: rows.map(mapFaqItem) };
  } catch (error) {
    return handleError(error);
  }
}

export async function createFaqItemAction(
  input: FaqItemInput
): Promise<ContentActionResult<AdminFaqItem>> {
  try {
    await requireAdmin();
    const parsed = faqItemInputSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid FAQ" };
    const count = await prisma.faqItem.count();
    const item = await prisma.faqItem.create({
      data: toFaqCreateData({ ...parsed.data, sortOrder: parsed.data.sortOrder || count }),
    });
    revalidateContent();
    return { data: mapFaqItem(item) };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateFaqItemAction(
  id: string,
  input: FaqItemInput
): Promise<ContentActionResult<AdminFaqItem>> {
  try {
    await requireAdmin();
    const parsed = faqItemInputSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid FAQ" };
    const item = await prisma.faqItem.update({
      where: { id },
      data: toFaqCreateData(parsed.data),
    });
    revalidateContent();
    return { data: mapFaqItem(item) };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteFaqItemAction(id: string): Promise<ContentActionResult> {
  try {
    await requireAdmin();
    await prisma.faqItem.delete({ where: { id } });
    revalidateContent();
    return {};
  } catch (error) {
    return handleError(error);
  }
}

export async function toggleFaqItemActiveAction(
  id: string
): Promise<ContentActionResult<AdminFaqItem>> {
  try {
    await requireAdmin();
    const existing = await prisma.faqItem.findUnique({ where: { id } });
    if (!existing) return { error: "FAQ not found." };
    const item = await prisma.faqItem.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    revalidateContent();
    return { data: mapFaqItem(item) };
  } catch (error) {
    return handleError(error);
  }
}

// ——— About + Assets ———

export async function getAboutHomeAction(): Promise<ContentActionResult<AboutHomeContent>> {
  try {
    await requireAdmin();
    const row = await prisma.siteSetting.findUnique({ where: { key: ABOUT_HOME_KEY } });
    if (!row) return { data: defaultAboutHome };
    const parsed = aboutHomeSchema.safeParse(row.value);
    return { data: parsed.success ? parsed.data : defaultAboutHome };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateAboutHomeAction(
  input: AboutHomeContent
): Promise<ContentActionResult<AboutHomeContent>> {
  try {
    await requireAdmin();
    const parsed = aboutHomeSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid about content" };

    await prisma.siteSetting.upsert({
      where: { key: ABOUT_HOME_KEY },
      create: { key: ABOUT_HOME_KEY, value: parsed.data },
      update: { value: parsed.data },
    });
    revalidateContent();
    return { data: parsed.data };
  } catch (error) {
    return handleError(error);
  }
}

export async function getSiteAssetsAction(): Promise<ContentActionResult<SiteAssetsContent>> {
  try {
    await requireAdmin();
    const row = await prisma.siteSetting.findUnique({ where: { key: SITE_ASSETS_KEY } });
    if (!row) return { data: defaultSiteAssets };
    const parsed = siteAssetsSchema.safeParse(row.value);
    return { data: parsed.success ? parsed.data : defaultSiteAssets };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateSiteAssetsAction(
  input: SiteAssetsContent
): Promise<ContentActionResult<SiteAssetsContent>> {
  try {
    await requireAdmin();
    const parsed = siteAssetsSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid assets" };

    await prisma.siteSetting.upsert({
      where: { key: SITE_ASSETS_KEY },
      create: { key: SITE_ASSETS_KEY, value: parsed.data },
      update: { value: parsed.data },
    });
    revalidateContent();
    return { data: parsed.data };
  } catch (error) {
    return handleError(error);
  }
}
