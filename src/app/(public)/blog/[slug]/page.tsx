import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, Eye } from "lucide-react";

import { BlogPostCard } from "@/components/public/blog-post-card";
import { CTABanner } from "@/components/public/cta-banner";
import { NewsletterStrip } from "@/components/public/newsletter-strip";
import { requireAdmin } from "@/lib/admin/require-admin";
import type { AdminBlogPost } from "@/lib/blog/mapper";
import { renderBlogMarkdown } from "@/lib/blog/markdown";
import {
  categoryToSlug,
  getBlogPostBySlugForPreview,
  getPublicBlogPostBySlug,
  getPublicBlogSlugs,
  getRelatedBlogPosts,
  incrementBlogPostViews,
  type PublicBlogPost,
} from "@/lib/blog/public-queries";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

function toPublicShape(post: AdminBlogPost): PublicBlogPost {
  const words = post.content.trim().split(/\s+/).filter(Boolean).length;
  return {
    ...post,
    status: post.status === "Scheduled" ? "Scheduled" : "Published",
    readingMinutes: Math.max(1, Math.ceil(words / 220)),
  };
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

async function resolvePost(slug: string, preview: boolean) {
  if (preview) {
    try {
      await requireAdmin();
      const draft = await getBlogPostBySlugForPreview(slug);
      if (draft) return { post: toPublicShape(draft), isPreview: true };
    } catch {
      // Fall through to public
    }
  }
  const post = await getPublicBlogPostBySlug(slug);
  return post ? { post, isPreview: false } : null;
}

export async function generateStaticParams() {
  try {
    const rows = await getPublicBlogSlugs();
    return rows.map((row) => ({ slug: row.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const resolved = await resolvePost(slug, query.preview === "1");
  if (!resolved) return { title: "Article not found | Well Health" };
  const { post } = resolved;
  return {
    title: post.metaTitle || `${post.title} | Well Health Blog`,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: "article",
      images: post.featuredImageUrl ? [post.featuredImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params, searchParams }: BlogPostPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const resolved = await resolvePost(slug, query.preview === "1");
  if (!resolved) notFound();

  const { post, isPreview } = resolved;

  if (!isPreview) {
    void incrementBlogPostViews(slug);
  }

  const related = await getRelatedBlogPosts(post.id, post.category, 3);
  const html = renderBlogMarkdown(post.content);

  return (
    <div className="bg-white text-neutral-900">
      {isPreview ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900">
          Preview mode — this post is not public yet.{" "}
          <Link className="font-semibold underline" href={`/admin/blog/${post.id}/edit`}>
            Continue editing
          </Link>
        </div>
      ) : null}

      <section className="border-b border-neutral-100 bg-[#F7F8F9]/70 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <Link className="transition-colors duration-200 hover:text-brand-green-600" href="/">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link className="transition-colors duration-200 hover:text-brand-green-600" href="/blog">
              Blog
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              className="transition-colors duration-200 hover:text-brand-green-600"
              href={`/blog?category=${categoryToSlug(post.category)}`}
            >
              {post.category}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="line-clamp-1 text-brand-green-600">{post.title}</span>
          </nav>
        </div>
      </section>

      <article>
        <header className="mx-auto max-w-3xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-14">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-500">
            <Link
              className="font-semibold text-brand-green-600 hover:text-brand-green-900"
              href={`/blog?category=${categoryToSlug(post.category)}`}
            >
              {post.category}
            </Link>
            {post.publishedAt ? (
              <>
                <span className="text-neutral-300">·</span>
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </>
            ) : null}
          </div>

          <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl sm:leading-tight lg:text-[2.75rem]">
            {post.title}
          </h1>

          <p className="mt-5 text-lg leading-8 text-neutral-500">{post.excerpt}</p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-neutral-100 py-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-green-100 text-sm font-semibold text-brand-green-700">
                {getInitials(post.authorName)}
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{post.authorName}</p>
                <p className="text-xs text-neutral-500">Well Health Trade International</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-neutral-400" />
                {post.readingMinutes} min read
              </span>
              {!isPreview ? (
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-neutral-400" />
                  {new Intl.NumberFormat("en-US").format(post.views)} views
                </span>
              ) : null}
            </div>
          </div>
        </header>

        {post.featuredImageUrl ? (
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm">
              <Image
                alt={post.title}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                src={post.featuredImageUrl}
                unoptimized
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex aspect-[21/9] items-center justify-center rounded-2xl border border-neutral-200 bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.12),_transparent_40%),linear-gradient(135deg,_#e8f5ee_0%,_#dceee5_100%)] shadow-sm">
              <p className="font-heading text-sm font-semibold tracking-[0.22em] text-brand-green-700">
                WELL HEALTH
              </p>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div
            className="blog-prose space-y-5 text-base leading-8 text-neutral-600 [&_a]:font-semibold [&_a]:text-brand-green-600 [&_a]:underline-offset-2 hover:[&_a]:text-brand-green-900 [&_blockquote]:my-6 [&_blockquote]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-brand-green-600 [&_blockquote]:bg-brand-green-50/60 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:italic [&_blockquote]:text-neutral-700 [&_h2]:mt-10 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-neutral-900 [&_h3]:mt-8 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-neutral-900 [&_img]:my-8 [&_img]:w-full [&_img]:rounded-xl [&_li]:ml-5 [&_li]:pl-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_p]:text-neutral-600 [&_strong]:font-semibold [&_strong]:text-neutral-900 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {post.tags.length > 0 ? (
            <div className="mt-12 border-t border-neutral-100 pt-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
                Topics
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-[#F7F8F9] px-3 py-1.5 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <aside className="mt-10 rounded-2xl border border-brand-green-100 bg-[linear-gradient(135deg,_#eef8f2_0%,_#ffffff_55%,_#f8fbf9_100%)] p-6 sm:p-7">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-green-600">
              From the team
            </p>
            <div className="mt-4 flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-green-100 text-sm font-semibold text-brand-green-700">
                {getInitials(post.authorName)}
              </span>
              <div>
                <p className="font-heading text-lg font-bold text-neutral-900">{post.authorName}</p>
                <p className="mt-1 text-sm leading-7 text-neutral-500">
                  Sharing practical, science-minded wellness guidance from Well Health Trade
                  International — so healthier choices feel clear and credible.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="border-t border-neutral-100 bg-[#F7F8F9]/80 py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                Related articles
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                More reads in {post.category.toLowerCase()} and beyond
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <BlogPostCard key={item.id} post={item} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                className="inline-flex text-sm font-semibold text-brand-green-600 hover:text-brand-green-900"
                href="/blog"
              >
                View all articles →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <NewsletterStrip />

      <CTABanner
        buttonLabel="Explore shop"
        href="/shop"
        subtitle="Support your routine with premium, clinically trusted supplements."
        title="Turn insight into everyday wellness"
      />
    </div>
  );
}
