"use client";

import {
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  type AdminBlogPost,
  type BlogCategory,
  type BlogStatus,
  AdminBlogTable,
} from "@/components/admin/admin-blog-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SortOption = "Newest" | "Oldest" | "Most Viewed";

const postsData: AdminBlogPost[] = [
  {
    id: "blog-1",
    title: "7 Daily Eye Care Habits for Screen-Heavy Lifestyles",
    excerpt: "Simple routines to reduce digital eye strain for office and remote professionals.",
    category: "Health Tips",
    authorName: "Dr. Amina Rahman",
    status: "Published",
    publishedAt: "2026-07-02T09:10:00+06:00",
    views: 2380,
    thumbnailTone: "bg-[linear-gradient(135deg,#edf6ff_0%,#d8e9fb_100%)]",
  },
  {
    id: "blog-2",
    title: "How to Choose the Right Omega-3 Supplement",
    excerpt: "A practical guide to EPA, DHA, and label reading for better supplement decisions.",
    category: "Product Guides",
    authorName: "Farhan Kabir",
    status: "Published",
    publishedAt: "2026-06-28T14:20:00+06:00",
    views: 1845,
    thumbnailTone: "bg-[linear-gradient(135deg,#ecf6f2_0%,#d9ece5_100%)]",
  },
  {
    id: "blog-3",
    title: "Balanced Plate Basics for Busy Bangladeshi Families",
    excerpt: "Nutrition-friendly meal planning ideas with locally available ingredients.",
    category: "Nutrition",
    authorName: "Nusrat Jahan",
    status: "Published",
    publishedAt: "2026-06-18T11:00:00+06:00",
    views: 1570,
    thumbnailTone: "bg-[linear-gradient(135deg,#f2f9ed_0%,#deefd2_100%)]",
  },
  {
    id: "blog-4",
    title: "Behind the Scenes: Our New Quality Testing Workflow",
    excerpt: "A quick look at our upgraded batch testing and verification process.",
    category: "Company News",
    authorName: "Mahmudul Hasan",
    status: "Published",
    publishedAt: "2026-06-10T10:30:00+06:00",
    views: 965,
    thumbnailTone: "bg-[linear-gradient(135deg,#fff5e6_0%,#fbe4c1_100%)]",
  },
  {
    id: "blog-5",
    title: "Hydration Myths That Affect Your Daily Energy",
    excerpt: "Debunking common hydration myths and what actually helps energy levels.",
    category: "Health Tips",
    authorName: "Sadia Akter",
    status: "Draft",
    publishedAt: null,
    views: 0,
    thumbnailTone: "bg-[linear-gradient(135deg,#eef3ff_0%,#d9e3fb_100%)]",
  },
  {
    id: "blog-6",
    title: "Beginner's Guide to Reading Supplement Labels",
    excerpt: "Understand serving size, active ingredients, and quality markers at a glance.",
    category: "Product Guides",
    authorName: "Raihan Ahmed",
    status: "Draft",
    publishedAt: null,
    views: 0,
    thumbnailTone: "bg-[linear-gradient(135deg,#fdf4e8_0%,#f8e2c2_100%)]",
  },
  {
    id: "blog-7",
    title: "Protein Timing: Does It Matter for Everyday Wellness?",
    excerpt: "Exploring practical protein timing strategies for non-athlete routines.",
    category: "Nutrition",
    authorName: "Tanjila Islam",
    status: "Scheduled",
    publishedAt: "2026-07-15T08:00:00+06:00",
    views: 120,
    thumbnailTone: "bg-[linear-gradient(135deg,#f3f0ff_0%,#e2dafb_100%)]",
  },
  {
    id: "blog-8",
    title: "Community Health Camp Recap: June 2026",
    excerpt: "Highlights and outcomes from our latest wellness outreach initiative.",
    category: "Company News",
    authorName: "Arif Chowdhury",
    status: "Draft",
    publishedAt: null,
    views: 88,
    thumbnailTone: "bg-[linear-gradient(135deg,#ffeef0_0%,#f8dce0_100%)]",
  },
];

const summaryCards = [
  { icon: FileText, tone: "text-neutral-700", text: "24 Total Posts" },
  { icon: CheckCircle, tone: "text-brand-green-600", text: "18 Published" },
  { icon: Clock, tone: "text-amber-600", text: "4 Draft" },
  { icon: Eye, tone: "text-neutral-700", text: "12,400 Total Views" },
];

export default function AdminBlogPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | BlogStatus>("All");
  const [categoryFilter, setCategoryFilter] = useState<"All" | BlogCategory>("All");
  const [sortBy, setSortBy] = useState<SortOption>("Newest");
  const [pageSize, setPageSize] = useState(8);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = postsData.filter((post) => {
      const matchesSearch = !query || post.title.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" ? true : post.status === statusFilter;
      const matchesCategory = categoryFilter === "All" ? true : post.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "Most Viewed") {
        return b.views - a.views;
      }

      const aDate = new Date(a.publishedAt ?? "2026-01-01T00:00:00+06:00").getTime();
      const bDate = new Date(b.publishedAt ?? "2026-01-01T00:00:00+06:00").getTime();

      if (sortBy === "Oldest") {
        return aDate - bDate;
      }

      return bDate - aDate;
    });
  }, [categoryFilter, search, sortBy, statusFilter]);

  const visiblePosts = filteredPosts.slice(0, pageSize);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900">Blog Management</h1>
          <p className="mt-1 text-sm text-neutral-500">Create and manage health articles</p>
        </div>

        <Button
          asChild
          className="h-10 rounded-lg bg-brand-green-600 text-white hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
        >
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4" />
            + New Post
          </Link>
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.text}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
            >
              <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100", card.tone)}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <p className="text-sm font-medium text-neutral-700">{card.text}</p>
            </article>
          );
        })}
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <label className="relative min-w-[280px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search posts by title..."
            value={search}
          />
        </label>

        <select
          className="h-10 min-w-[160px] rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
          onChange={(event) => setStatusFilter(event.target.value as "All" | BlogStatus)}
          value={statusFilter}
        >
          <option value="All">All</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Scheduled">Scheduled</option>
        </select>

        <select
          className="h-10 min-w-[190px] rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
          onChange={(event) => setCategoryFilter(event.target.value as "All" | BlogCategory)}
          value={categoryFilter}
        >
          <option value="All">All Categories</option>
          <option value="Health Tips">Health Tips</option>
          <option value="Product Guides">Product Guides</option>
          <option value="Nutrition">Nutrition</option>
          <option value="Company News">Company News</option>
        </select>

        <select
          className="h-10 min-w-[160px] rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
          onChange={(event) => setSortBy(event.target.value as SortOption)}
          value={sortBy}
        >
          <option value="Newest">Newest</option>
          <option value="Oldest">Oldest</option>
          <option value="Most Viewed">Most Viewed</option>
        </select>
      </section>

      <AdminBlogTable
        onPageSizeChange={setPageSize}
        pageSize={pageSize}
        posts={visiblePosts}
        totalPosts={24}
      />
    </div>
  );
}
