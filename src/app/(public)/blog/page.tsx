import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

import { BlogPostCard } from "@/components/public/blog-post-card";
import { CTABanner } from "@/components/public/cta-banner";
import { NewsletterStrip } from "@/components/public/newsletter-strip";
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
      <section className="bg-[radial-gradient(circle_at_top_right,_rgba(22,135,93,0.12),_transparent_28%),linear-gradient(135deg,_#eef8f2_0%,_#ffffff_46%,_#f8fbf9_100%)] py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <Link className="transition-colors duration-200 hover:text-brand-green-600" href="/">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-brand-green-600">Blog</span>
          </nav>

          <div className="mt-6 max-w-3xl space-y-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-green-600">
              Well Health Journal
            </p>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
              Practical wellness, clearly explained
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-neutral-500">
              Clinical-minded guides on eye care, nutrition, and everyday supplement literacy —
              written for Bangladesh families who want trustworthy health information.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
                !activeCategory
                  ? "bg-brand-green-600 text-white shadow-sm"
                  : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:text-brand-green-700"
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
                    "rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
                    active
                      ? "bg-brand-green-600 text-white shadow-sm"
                      : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:text-brand-green-700"
                  )}
                  href={`/blog?category=${slug}`}
                >
                  {category}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

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
