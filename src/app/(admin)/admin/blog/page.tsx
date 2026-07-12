"use client";

import {
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { AdminBlogTable } from "@/components/admin/admin-blog-table";
import { Button } from "@/components/ui/button";
import { useAdminBlogPosts, useBlogMutations } from "@/hooks/use-admin-blog";
import {
  confirmAdminAction,
  showAdminError,
  showAdminSuccess,
} from "@/lib/admin/alerts";
import {
  BLOG_CATEGORIES,
  type AdminBlogCategory,
  type AdminBlogStatus,
} from "@/lib/blog/mapper";
import { cn } from "@/lib/utils";

type SortOption = "Newest" | "Oldest" | "Most Viewed" | "Updated";

export default function AdminBlogPage() {
  const { data: posts = [], isLoading, isError, error, refetch } = useAdminBlogPosts();
  const { deletePost, deletePosts, toggleFeatured } = useBlogMutations();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | AdminBlogStatus>("All");
  const [categoryFilter, setCategoryFilter] = useState<"All" | AdminBlogCategory>("All");
  const [sortBy, setSortBy] = useState<SortOption>("Updated");
  const [pageSize, setPageSize] = useState(8);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const stats = useMemo(() => {
    const published = posts.filter((p) => p.status === "Published").length;
    const drafts = posts.filter((p) => p.status === "Draft").length;
    const scheduled = posts.filter((p) => p.status === "Scheduled").length;
    const views = posts.reduce((sum, p) => sum + p.views, 0);
    return { total: posts.length, published, drafts, scheduled, views };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = posts.filter((post) => {
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.slug.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query));
      const matchesStatus = statusFilter === "All" ? true : post.status === statusFilter;
      const matchesCategory =
        categoryFilter === "All" ? true : post.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "Most Viewed") return b.views - a.views;
      if (sortBy === "Updated") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      const aDate = new Date(a.publishedAt ?? a.createdAt).getTime();
      const bDate = new Date(b.publishedAt ?? b.createdAt).getTime();
      return sortBy === "Oldest" ? aDate - bDate : bDate - aDate;
    });
  }, [categoryFilter, posts, search, sortBy, statusFilter]);

  const totalFiltered = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(page, totalPages);
  const visiblePosts = filteredPosts.slice((safePage - 1) * pageSize, safePage * pageSize);

  const summaryCards = [
    {
      icon: FileText,
      tone: "text-neutral-700 bg-neutral-100",
      label: "Total posts",
      value: stats.total,
    },
    {
      icon: CheckCircle,
      tone: "text-brand-green-700 bg-brand-green-100",
      label: "Published",
      value: stats.published,
    },
    {
      icon: Clock,
      tone: "text-amber-700 bg-amber-50",
      label: "Drafts",
      value: stats.drafts,
      hint: stats.scheduled ? `${stats.scheduled} scheduled` : undefined,
    },
    {
      icon: Eye,
      tone: "text-blue-700 bg-blue-50",
      label: "Total views",
      value: new Intl.NumberFormat("en-US").format(stats.views),
    },
  ];

  function resetPage() {
    setPage(1);
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function handleToggleSelectAll(ids: string[]) {
    const allSelected = ids.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
      return;
    }
    setSelectedIds((current) => [...new Set([...current, ...ids])]);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const confirmed = await confirmAdminAction({
        title: "Delete this post?",
        text: "This permanently removes the article and its featured image.",
        confirmText: "Delete post",
      });
      if (!confirmed) return;
      try {
        await deletePost.mutateAsync(id);
        setSelectedIds((current) => current.filter((item) => item !== id));
        await showAdminSuccess("Post deleted", "The article has been removed.");
      } catch (err) {
        await showAdminError(
          "Delete failed",
          err instanceof Error ? err.message : "Please try again."
        );
      }
    });
  }

  function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      const confirmed = await confirmAdminAction({
        title: `Delete ${selectedIds.length} posts?`,
        text: "Selected articles will be permanently removed.",
        confirmText: "Delete selected",
      });
      if (!confirmed) return;
      try {
        await deletePosts.mutateAsync(selectedIds);
        setSelectedIds([]);
        await showAdminSuccess("Posts deleted", "Selected articles were removed.");
      } catch (err) {
        await showAdminError(
          "Delete failed",
          err instanceof Error ? err.message : "Please try again."
        );
      }
    });
  }

  function handleToggleFeatured(id: string) {
    startTransition(async () => {
      try {
        const updated = await toggleFeatured.mutateAsync(id);
        await showAdminSuccess(
          updated.featured ? "Marked featured" : "Featured removed",
          updated.featured
            ? "This post can appear in featured placements."
            : "Post is no longer featured."
        );
      } catch (err) {
        await showAdminError(
          "Update failed",
          err instanceof Error ? err.message : "Please try again."
        );
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading blog posts…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">Couldn’t load posts</h2>
        <p className="mt-2 text-sm text-neutral-500">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
        <Button className="mt-5 rounded-xl" onClick={() => void refetch()} type="button">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900">Blog Management</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Create, schedule, and publish health & wellness articles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 ? (
            <Button
              className="h-10 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
              disabled={isPending}
              onClick={handleBulkDelete}
              type="button"
              variant="outline"
            >
              <Trash2 className="h-4 w-4" />
              Delete ({selectedIds.length})
            </Button>
          ) : null}
          <Button
            asChild
            className="h-10 rounded-xl bg-brand-green-600 text-white hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
          >
            <Link href="/admin/blog/new">
              <Plus className="h-4 w-4" />
              New post
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.label}
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    {card.label}
                  </p>
                  <p className="mt-1.5 font-heading text-2xl font-bold text-neutral-900">
                    {card.value}
                  </p>
                  {card.hint ? (
                    <p className="mt-1 text-xs text-neutral-500">{card.hint}</p>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-xl",
                    card.tone
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <label className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => {
              setSearch(event.target.value);
              resetPage();
            }}
            placeholder="Search title, slug, tags…"
            value={search}
          />
        </label>

        <select
          className="h-10 min-w-[150px] rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
          onChange={(event) => {
            setStatusFilter(event.target.value as "All" | AdminBlogStatus);
            resetPage();
          }}
          value={statusFilter}
        >
          <option value="All">All statuses</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Archived">Archived</option>
        </select>

        <select
          className="h-10 min-w-[180px] rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
          onChange={(event) => {
            setCategoryFilter(event.target.value as "All" | AdminBlogCategory);
            resetPage();
          }}
          value={categoryFilter}
        >
          <option value="All">All categories</option>
          {BLOG_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className="h-10 min-w-[150px] rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
          onChange={(event) => setSortBy(event.target.value as SortOption)}
          value={sortBy}
        >
          <option value="Updated">Recently updated</option>
          <option value="Newest">Newest published</option>
          <option value="Oldest">Oldest</option>
          <option value="Most Viewed">Most viewed</option>
        </select>
      </section>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green-100 text-brand-green-700">
            <FileText className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-heading text-xl font-bold text-neutral-900">
            No articles yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Publish your first health tip, product guide, or company update. Drafts stay private
            until you publish.
          </p>
          <Button
            asChild
            className="mt-6 h-10 rounded-xl bg-brand-green-600 text-white hover:bg-brand-green-900"
          >
            <Link href="/admin/blog/new">
              <Plus className="h-4 w-4" />
              Create first post
            </Link>
          </Button>
        </div>
      ) : (
        <AdminBlogTable
          isDeleting={isPending || deletePost.isPending}
          onDelete={handleDelete}
          onPageChange={setPage}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPage(1);
          }}
          onToggleFeatured={handleToggleFeatured}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          page={safePage}
          pageSize={pageSize}
          posts={visiblePosts}
          selectedIds={selectedIds}
          totalPosts={totalFiltered}
        />
      )}
    </div>
  );
}
