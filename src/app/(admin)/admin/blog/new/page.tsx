import { BlogPostForm } from "@/components/admin/blog-post-form";

export default function AdminNewBlogPostPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-neutral-900">Create New Blog Post</h1>
        <p className="mt-1 text-sm text-neutral-500">Compose and publish a new health/wellness article</p>
      </header>

      <BlogPostForm mode="create" />
    </div>
  );
}
