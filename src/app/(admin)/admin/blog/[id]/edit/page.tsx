import { BlogPostForm } from "@/components/admin/blog-post-form";

type AdminEditBlogPostPageProps = {
  params: {
    id: string;
  };
};

const dummyPosts = {
  "blog-1": {
    id: "blog-1",
    title: "7 Daily Eye Care Habits for Screen-Heavy Lifestyles",
    slug: "daily-eye-care-habits-screen-heavy-lifestyles",
    excerpt: "Simple routines to reduce digital eye strain for office and remote professionals.",
    content:
      "Start with the 20-20-20 rule. Every 20 minutes, look at something 20 feet away for 20 seconds.\n\nPair this with hydration, screen brightness adjustments, and omega-rich nutrition for better visual comfort.",
    status: "Published" as const,
    category: "Health Tips" as const,
    tags: ["Eye Care", "Daily Habits", "Screen Health"],
    metaTitle: "7 Daily Eye Care Habits | Well Health Blog",
    metaDescription: "Learn simple daily eye care routines to reduce digital strain and support long-term visual wellness.",
    hasFeaturedImage: true,
  },
  "blog-2": {
    id: "blog-2",
    title: "How to Choose the Right Omega-3 Supplement",
    slug: "how-to-choose-right-omega-3-supplement",
    excerpt: "A practical guide to EPA, DHA, and label reading for better supplement decisions.",
    content:
      "Compare EPA and DHA levels before price. Look for third-party quality verification and transparent sourcing information.",
    status: "Draft" as const,
    category: "Product Guides" as const,
    tags: ["Omega-3", "Supplements", "Label Reading"],
    metaTitle: "How to Choose the Right Omega-3",
    metaDescription: "A beginner-friendly guide to selecting omega-3 supplements with confidence.",
    hasFeaturedImage: false,
  },
} as const;

export default function AdminEditBlogPostPage({ params }: AdminEditBlogPostPageProps) {
  const fallback = dummyPosts["blog-1"];
  const post = dummyPosts[params.id as keyof typeof dummyPosts] ?? fallback;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-neutral-900">Edit Blog Post</h1>
        <p className="mt-1 text-sm text-neutral-500">Update article content, settings, and SEO metadata</p>
      </header>

      <BlogPostForm initialData={post} mode="edit" />
    </div>
  );
}
