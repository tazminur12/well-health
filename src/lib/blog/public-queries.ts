import type { BlogCategory as PrismaBlogCategory, BlogPost, Prisma } from "@prisma/client";

import {
  mapBlogPostToAdmin,
  type AdminBlogCategory,
  type AdminBlogPost,
} from "@/lib/blog/mapper";
import { prisma } from "@/lib/prisma";

export type PublicBlogPost = Omit<AdminBlogPost, "status"> & {
  status: "Published" | "Scheduled";
  readingMinutes: number;
};

const CATEGORY_FILTER: Record<string, PrismaBlogCategory> = {
  "health-tips": "HEALTH_TIPS",
  "product-guides": "PRODUCT_GUIDES",
  nutrition: "NUTRITION",
  "company-news": "COMPANY_NEWS",
};

function estimateReadingMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function isPubliclyVisible(post: BlogPost, now = new Date()) {
  if (post.status === "PUBLISHED") return true;
  if (post.status === "SCHEDULED" && post.scheduledAt && post.scheduledAt <= now) {
    return true;
  }
  return false;
}

function toPublicPost(post: BlogPost): PublicBlogPost {
  const mapped = mapBlogPostToAdmin(post);
  return {
    ...mapped,
    status: mapped.status === "Scheduled" ? "Scheduled" : "Published",
    readingMinutes: estimateReadingMinutes(post.content),
  };
}

function publicWhere(now = new Date()): Prisma.BlogPostWhereInput {
  return {
    OR: [
      { status: "PUBLISHED" },
      { status: "SCHEDULED", scheduledAt: { lte: now } },
    ],
  };
}

export async function listPublicBlogPosts(options?: {
  category?: string;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<PublicBlogPost[]> {
  const now = new Date();
  const categoryKey = options?.category?.trim().toLowerCase();
  const category = categoryKey ? CATEGORY_FILTER[categoryKey] : undefined;

  const posts = await prisma.blogPost.findMany({
    where: {
      AND: [
        publicWhere(now),
        category ? { category } : {},
        options?.featuredOnly ? { featured: true } : {},
      ],
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: options?.limit,
  });

  return posts.filter((post) => isPubliclyVisible(post, now)).map(toPublicPost);
}

export async function getPublicBlogPostBySlug(slug: string): Promise<PublicBlogPost | null> {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !isPubliclyVisible(post)) return null;
  return toPublicPost(post);
}

/** Admin preview: any post by slug (drafts included). Caller must gate auth. */
export async function getBlogPostBySlugForPreview(slug: string): Promise<AdminBlogPost | null> {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return null;
  return mapBlogPostToAdmin(post);
}

export async function incrementBlogPostViews(slug: string) {
  try {
    await prisma.blogPost.updateMany({
      where: {
        slug,
        OR: [
          { status: "PUBLISHED" },
          { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
        ],
      },
      data: { views: { increment: 1 } },
    });
  } catch {
    // Non-critical
  }
}

export async function getPublicBlogSlugs() {
  const now = new Date();
  return prisma.blogPost.findMany({
    where: publicWhere(now),
    select: { slug: true },
  });
}

export async function getRelatedBlogPosts(
  postId: string,
  category: AdminBlogCategory,
  limit = 3
): Promise<PublicBlogPost[]> {
  const now = new Date();
  const categoryKey = categoryToSlug(category);
  const prismaCategory = CATEGORY_FILTER[categoryKey];

  const sameCategory = await prisma.blogPost.findMany({
    where: {
      AND: [
        publicWhere(now),
        { id: { not: postId } },
        prismaCategory ? { category: prismaCategory } : {},
      ],
    },
    orderBy: [{ publishedAt: "desc" }],
    take: limit,
  });

  if (sameCategory.length >= limit) {
    return sameCategory.map(toPublicPost);
  }

  const extra = await prisma.blogPost.findMany({
    where: {
      AND: [
        publicWhere(now),
        {
          id: {
            notIn: [postId, ...sameCategory.map((post) => post.id)],
          },
        },
      ],
    },
    orderBy: [{ publishedAt: "desc" }],
    take: limit - sameCategory.length,
  });

  return [...sameCategory, ...extra].map(toPublicPost);
}

export function categoryToSlug(category: AdminBlogCategory) {
  return category.toLowerCase().replace(/\s+/g, "-");
}
