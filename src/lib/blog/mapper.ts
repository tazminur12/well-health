import type { BlogCategory as PrismaBlogCategory, BlogPost, BlogStatus as PrismaBlogStatus } from "@prisma/client";

import type { BlogPostInput } from "@/lib/blog/schemas";

export type AdminBlogStatus = "Published" | "Draft" | "Scheduled" | "Archived";
export type AdminBlogCategory =
  | "Health Tips"
  | "Product Guides"
  | "Nutrition"
  | "Company News";

export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: AdminBlogCategory;
  tags: string[];
  authorName: string;
  authorId: string | null;
  status: AdminBlogStatus;
  featured: boolean;
  featuredImageUrl: string | null;
  metaTitle: string;
  metaDescription: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
};

const STATUS_TO_ADMIN: Record<PrismaBlogStatus, AdminBlogStatus> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  SCHEDULED: "Scheduled",
  ARCHIVED: "Archived",
};

const STATUS_TO_PRISMA: Record<AdminBlogStatus, PrismaBlogStatus> = {
  Draft: "DRAFT",
  Published: "PUBLISHED",
  Scheduled: "SCHEDULED",
  Archived: "ARCHIVED",
};

const CATEGORY_TO_ADMIN: Record<PrismaBlogCategory, AdminBlogCategory> = {
  HEALTH_TIPS: "Health Tips",
  PRODUCT_GUIDES: "Product Guides",
  NUTRITION: "Nutrition",
  COMPANY_NEWS: "Company News",
};

const CATEGORY_TO_PRISMA: Record<AdminBlogCategory, PrismaBlogCategory> = {
  "Health Tips": "HEALTH_TIPS",
  "Product Guides": "PRODUCT_GUIDES",
  Nutrition: "NUTRITION",
  "Company News": "COMPANY_NEWS",
};

export const BLOG_CATEGORIES: AdminBlogCategory[] = [
  "Health Tips",
  "Product Guides",
  "Nutrition",
  "Company News",
];

export function toPrismaBlogStatus(status: AdminBlogStatus): PrismaBlogStatus {
  return STATUS_TO_PRISMA[status];
}

export function toPrismaBlogCategory(category: AdminBlogCategory): PrismaBlogCategory {
  return CATEGORY_TO_PRISMA[category];
}

export function slugifyBlogTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function mapBlogPostToAdmin(post: BlogPost): AdminBlogPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    category: CATEGORY_TO_ADMIN[post.category],
    tags: post.tags,
    authorName: post.authorName?.trim() || "Well Health Team",
    authorId: post.authorId,
    status: STATUS_TO_ADMIN[post.status],
    featured: post.featured,
    featuredImageUrl: post.featuredImageUrl,
    metaTitle: post.metaTitle ?? post.title,
    metaDescription: post.metaDescription ?? post.excerpt,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    scheduledAt: post.scheduledAt?.toISOString() ?? null,
    views: post.views,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export function buildPrismaBlogData(
  input: BlogPostInput,
  author: { id: string; name: string | null; email: string }
) {
  const status = toPrismaBlogStatus(input.status);
  const scheduledAt =
    input.status === "Scheduled" && input.scheduledAt
      ? new Date(input.scheduledAt)
      : null;

  let publishedAt: Date | null = null;
  if (input.status === "Published") {
    publishedAt = new Date();
  } else if (input.status === "Scheduled" && scheduledAt) {
    publishedAt = scheduledAt;
  }

  return {
    title: input.title.trim(),
    slug: input.slug.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    category: toPrismaBlogCategory(input.category),
    tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
    status,
    featured: input.featured,
    metaTitle: input.metaTitle?.trim() || input.title.trim(),
    metaDescription: input.metaDescription?.trim() || input.excerpt.trim(),
    scheduledAt,
    publishedAt,
    authorId: author.id,
    authorName: author.name?.trim() || author.email.split("@")[0] || "Well Health Team",
  };
}

/** Keep publishedAt when updating an already-published post. */
export function resolvePublishedAtForUpdate(
  input: BlogPostInput,
  existingPublishedAt: Date | null
): Date | null {
  if (input.status === "Draft" || input.status === "Archived") {
    return existingPublishedAt;
  }
  if (input.status === "Published") {
    return existingPublishedAt ?? new Date();
  }
  if (input.status === "Scheduled" && input.scheduledAt) {
    return new Date(input.scheduledAt);
  }
  return existingPublishedAt;
}
