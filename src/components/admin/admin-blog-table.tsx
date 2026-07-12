"use client";

import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Loader2,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { AdminBlogPost, AdminBlogStatus } from "@/lib/blog/mapper";
import { cn } from "@/lib/utils";

export type { AdminBlogPost, AdminBlogStatus };
export type BlogStatus = AdminBlogStatus;
export type BlogCategory = AdminBlogPost["category"];

type AdminBlogTableProps = {
  posts: AdminBlogPost[];
  totalPosts: number;
  page: number;
  pageSize: number;
  selectedIds: string[];
  isDeleting?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: number) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[]) => void;
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string) => void;
};

const statusPillClass: Record<AdminBlogStatus, string> = {
  Published: "bg-brand-green-100 text-brand-green-700",
  Draft: "bg-neutral-200 text-neutral-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Archived: "bg-amber-100 text-amber-800",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function authorAvatarTone(name: string) {
  const tones = [
    "bg-[linear-gradient(135deg,#e8f5ee_0%,#cfe8dc_100%)] text-brand-green-700",
    "bg-[linear-gradient(135deg,#edf5ff_0%,#dbe8fb_100%)] text-blue-700",
    "bg-[linear-gradient(135deg,#fff4e8_0%,#f7e1c6_100%)] text-amber-700",
    "bg-[linear-gradient(135deg,#f3f0ff_0%,#e2dafb_100%)] text-purple-700",
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return tones[hash % tones.length];
}

export function AdminBlogTable({
  posts,
  totalPosts,
  page,
  pageSize,
  selectedIds,
  isDeleting,
  onPageChange,
  onPageSizeChange,
  onToggleSelect,
  onToggleSelectAll,
  onDelete,
  onToggleFeatured,
}: AdminBlogTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));
  const showingStart = totalPosts === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingEnd = Math.min(page * pageSize, totalPosts);
  const pageIds = posts.map((post) => post.id);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1180px] w-full text-left">
          <thead className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] uppercase tracking-[0.14em] text-neutral-500">
            <tr>
              <th className="px-4 py-3.5">
                <input
                  aria-label="Select all posts on this page"
                  checked={allSelected}
                  className="h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-600/30"
                  onChange={() => onToggleSelectAll(pageIds)}
                  type="checkbox"
                />
              </th>
              <th className="px-4 py-3.5">Post</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Author</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Published</th>
              <th className="px-4 py-3.5">Views</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {posts.map((post) => {
              const previewHref =
                post.status === "Published" || post.status === "Scheduled"
                  ? `/blog/${post.slug}`
                  : `/blog/${post.slug}?preview=1`;

              return (
                <tr
                  key={post.id}
                  className="border-b border-neutral-100 text-sm transition-colors hover:bg-brand-green-50/40"
                >
                  <td className="px-4 py-3.5 align-middle">
                    <input
                      aria-label={`Select ${post.title}`}
                      checked={selectedIds.includes(post.id)}
                      className="h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-600/30"
                      onChange={() => onToggleSelect(post.id)}
                      type="checkbox"
                    />
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-start gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                        {post.featuredImageUrl ? (
                          <Image
                            alt=""
                            className="object-cover"
                            fill
                            sizes="56px"
                            src={post.featuredImageUrl}
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#e8f5ee_0%,#cfe8dc_100%)] text-[10px] font-semibold tracking-wide text-brand-green-700">
                            WHT
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="max-w-[280px] truncate font-semibold text-neutral-900">
                            {post.title}
                          </p>
                          {post.featured ? (
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          ) : null}
                        </div>
                        <p className="mt-0.5 max-w-[320px] truncate text-xs text-neutral-500">
                          {post.excerpt}
                        </p>
                        <p className="mt-1 truncate text-[11px] text-neutral-400">
                          /blog/{post.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="inline-flex rounded-full bg-brand-green-100 px-2.5 py-1 text-xs font-semibold text-brand-green-700">
                      {post.category}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-2 text-neutral-700">
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold",
                          authorAvatarTone(post.authorName)
                        )}
                      >
                        {getInitials(post.authorName)}
                      </span>
                      <span className="text-sm">{post.authorName}</span>
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        statusPillClass[post.status]
                      )}
                    >
                      {post.status}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-neutral-700">
                    {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-neutral-700">
                      <Eye className="h-4 w-4 text-neutral-400" />
                      {new Intl.NumberFormat("en-US").format(post.views)}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        aria-label={post.featured ? "Unpin featured" : "Mark featured"}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-amber-50 hover:text-amber-600"
                        onClick={() => onToggleFeatured(post.id)}
                        title={post.featured ? "Remove featured" : "Mark featured"}
                        type="button"
                      >
                        <Star
                          className={cn(
                            "h-4 w-4",
                            post.featured && "fill-amber-400 text-amber-500"
                          )}
                        />
                      </button>
                      <Link
                        aria-label={`Preview ${post.title}`}
                        className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                        href={previewHref}
                        target="_blank"
                        title="Preview"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </Link>
                      <Link
                        aria-label={`Edit ${post.title}`}
                        className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                        href={`/admin/blog/${post.id}/edit`}
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        aria-label={`Delete ${post.title}`}
                        className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        disabled={isDeleting}
                        onClick={() => onDelete(post.id)}
                        title="Delete"
                        type="button"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {posts.length === 0 ? (
              <tr>
                <td className="px-4 py-16 text-center text-sm text-neutral-500" colSpan={8}>
                  No posts match these filters. Try clearing search or create a new article.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3.5 text-sm text-neutral-500">
        <p>
          Showing {showingStart}–{showingEnd} of {totalPosts}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <span className="px-1 text-xs text-neutral-500">
            {page} / {totalPages}
          </span>
          <button
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            type="button"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>

          <label className="inline-flex items-center gap-2 pl-1 text-neutral-600">
            <span>Per page</span>
            <select
              className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              value={pageSize}
            >
              <option value={8}>8</option>
              <option value={16}>16</option>
              <option value={24}>24</option>
            </select>
          </label>
        </div>
      </footer>
    </div>
  );
}
