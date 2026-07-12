import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { BlogPostCard } from "@/components/public/blog-post-card";
import { CTABanner } from "@/components/public/cta-banner";
import { NewsletterStrip } from "@/components/public/newsletter-strip";
import { PageHero } from "@/components/public/page-hero";
import { TrustBadges } from "@/components/public/trust-badges";
import { BLOG_CATEGORIES } from "@/lib/blog/mapper";
import { categoryToSlug, listPublicBlogPosts } from "@/lib/blog/public-queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog | Well Health Trade International",
  description:
    "Evidence-minded wellness tips, supplement guides, and company updates from Well Health Trade International.",
};

type BlogPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const categoryParam = params.category?.trim().toLowerCase() ?? "";
  const activeCategory = BLOG_CATEGORIES.find(
    (category) => categoryToSlug(category) === categoryParam
  );

  const posts = await listPublicBlogPosts({
    category: activeCategory ? categoryParam : undefined,
  });

  const featured = !activeCategory ? (posts.find((post) => post.featured) ?? posts[0] ?? null) : null;
  const rest = featured ? posts.filter((post) => post.id !== featured.id) : posts;

  return (
    <div className="bg-white text-neutral-900">
      <PageHero
        crumbLabel="Blog"
        description="Clinical-minded guides on eye care, nutrition, and everyday supplement literacy — written for Bangladesh families who want trustworthy health information."
        eyebrow="Well Health Journal"
        footer={
          <div className="flex flex-wrap gap-2">
            <Link
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                !activeCategory
                  ? "bg-white text-brand-green-800 shadow-md"
                  : "bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25"
              )}
              href="/blog"
            >
              All articles
            </Link>
            {BLOG_CATEGORIES.map((category) => {
              const slug = categoryToSlug(category);
              const active = activeCategory === category;
              return (
                <Link
                  key={category}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                    active
                      ? "bg-white text-brand-green-800 shadow-md"
                      : "bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25"
                  )}
                  href={`/blog?category=${slug}`}
                >
                  {category}
                </Link>
              );
            })}
          </div>
        }
        title="Practical wellness, clearly explained"
        tone="blog"
      />

      <TrustBadges />

      <section className="py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {activeCategory ? (
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
                {activeCategory}
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                {posts.length} {posts.length === 1 ? "article" : "articles"} in this category
              </p>
            </div>
          ) : null}

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-[#F7F8F9] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green-100 text-brand-green-700">
                <BookOpen className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-heading text-2xl font-bold text-neutral-900">
                Articles coming soon
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-500">
                We&apos;re preparing practical wellness reads. Meanwhile, explore clinically trusted
                supplements in our shop.
              </p>
              <Link
                className="mt-7 inline-flex rounded-lg bg-brand-green-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
                href="/shop"
              >
                Visit shop
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {featured ? <BlogPostCard featured post={featured} /> : null}

              {rest.length > 0 ? (
                <div>
                  {!activeCategory && featured ? (
                    <div className="mb-6 flex items-end justify-between gap-4">
                      <div>
                        <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
                          Latest articles
                        </h2>
                        <p className="mt-1 text-sm text-neutral-500">
                          Fresh guidance from the Well Health team
                        </p>
                      </div>
                    </div>
                  ) : null}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((post) => (
                      <BlogPostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <NewsletterStrip />

      <CTABanner
        buttonLabel="Shop supplements"
        href="/shop"
        subtitle="Pair what you learn with clinically trusted formulations from Well Health."
        title="Ready to put wellness into practice?"
      />
    </div>
  );
}
