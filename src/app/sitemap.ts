import type { MetadataRoute } from "next";

import { getPublicBlogSlugs } from "@/lib/blog/public-queries";
import { getActiveProducts } from "@/lib/products/public-queries";
import { getSiteUrl } from "@/lib/seo/site";

const STATIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/distributor", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  let blogEntries: MetadataRoute.Sitemap = [];

  try {
    const products = await getActiveProducts();
    productEntries = products.map((product) => ({
      url: `${siteUrl}/shop/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    productEntries = [];
  }

  try {
    const posts = await getPublicBlogSlugs();
    blogEntries = posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    blogEntries = [];
  }

  return [...staticEntries, ...productEntries, ...blogEntries];
}
