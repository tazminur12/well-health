import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Eye } from "lucide-react";

import type { PublicBlogPost } from "@/lib/blog/public-queries";
import { categoryToSlug } from "@/lib/blog/public-queries";
import { cn } from "@/lib/utils";

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export function BlogPostCard({
  post,
  featured = false,
}: {
  post: PublicBlogPost;
  featured?: boolean;
}) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green-600/20 hover:shadow-md",
        featured && "lg:grid lg:grid-cols-2 lg:items-stretch"
      )}
    >
      <Link
        className={cn(
          "relative block overflow-hidden bg-[linear-gradient(135deg,#e8f5ee_0%,#cfe8dc_100%)]",
          featured ? "aspect-[16/10] lg:aspect-auto lg:min-h-[320px]" : "aspect-[16/10]"
        )}
        href={`/blog/${post.slug}`}
      >
        {post.featuredImageUrl ? (
          <Image
            alt={post.title}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            fill
            sizes={featured ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
            src={post.featuredImageUrl}
            unoptimized
          />
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center font-heading text-sm font-semibold tracking-[0.22em] text-brand-green-700">
            WELL HEALTH
          </div>
        )}
        {featured ? (
          <span className="absolute left-4 top-4 rounded-lg bg-brand-green-900/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
            Featured
          </span>
        ) : null}
      </Link>

      <div className={cn("flex flex-1 flex-col p-5 sm:p-6", featured && "lg:justify-center lg:p-8")}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-neutral-500">
          <Link
            className="font-semibold text-brand-green-600 transition-colors hover:text-brand-green-900"
            href={`/blog?category=${categoryToSlug(post.category)}`}
          >
            {post.category}
          </Link>
          {post.publishedAt ? (
            <>
              <span className="text-neutral-300">·</span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </>
          ) : null}
        </div>

        <h2
          className={cn(
            "mt-3 font-heading font-bold tracking-tight text-neutral-900 transition-colors group-hover:text-brand-green-700",
            featured ? "text-2xl leading-snug sm:text-3xl" : "text-lg leading-snug"
          )}
        >
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>

        <p
          className={cn(
            "mt-3 text-sm leading-7 text-neutral-500",
            featured ? "line-clamp-3 sm:text-base sm:leading-8" : "line-clamp-2"
          )}
        >
          {post.excerpt}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-green-100 text-[11px] font-semibold text-brand-green-700">
              {getInitials(post.authorName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-800">{post.authorName}</p>
              <p className="flex items-center gap-2 text-[11px] text-neutral-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readingMinutes} min
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {new Intl.NumberFormat("en-US").format(post.views)}
                </span>
              </p>
            </div>
          </div>

          <Link
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-green-600 transition-all duration-200 hover:gap-1.5 hover:text-brand-green-900"
            href={`/blog/${post.slug}`}
          >
            Read article
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
