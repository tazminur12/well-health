import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BlogPostForm } from "@/components/admin/blog-post-form";

export default function AdminNewBlogPostPage() {
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
          <h1 className="font-heading text-2xl font-bold text-neutral-900">
            Create new post
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Compose a wellness article, set SEO, and publish when ready
          </p>
        </div>
      </header>

      <BlogPostForm mode="create" />
    </div>
  );
}
