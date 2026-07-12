"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

import { BlogPostForm } from "@/components/admin/blog-post-form";
import { useAdminBlogPost } from "@/hooks/use-admin-blog";

export default function AdminEditBlogPostPage() {
  const params = useParams<{ id: string }>();
  const { data: post, isLoading, isError, error } = useAdminBlogPost(params.id);

  if (isLoading) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading post…
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">Post not found</h2>
        <p className="mt-2 text-sm text-neutral-500">
          {error instanceof Error ? error.message : "This article may have been deleted."}
        </p>
        <Link
          className="mt-5 inline-flex text-sm font-semibold text-brand-green-600 hover:underline"
          href="/admin/blog"
        >
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-brand-green-700"
          href="/admin/blog"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900">Edit post</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Update content, publishing, featured image, and SEO
          </p>
        </div>
      </header>

      <BlogPostForm initialData={post} mode="edit" />
    </div>
  );
}
