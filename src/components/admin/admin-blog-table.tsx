"use client";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type BlogStatus = "Published" | "Draft" | "Scheduled";
export type BlogCategory = "Health Tips" | "Product Guides" | "Nutrition" | "Company News";

export type AdminBlogPost = {
  id: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  authorName: string;
  status: BlogStatus;
  publishedAt: string | null;
  views: number;
  thumbnailTone: string;
};

type AdminBlogTableProps = {
  posts: AdminBlogPost[];
  totalPosts: number;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
};

const statusPillClass: Record<BlogStatus, string> = {
  Published: "bg-brand-green-100 text-brand-green-700",
  Draft: "bg-neutral-200 text-neutral-700",
  Scheduled: "bg-blue-100 text-blue-700",
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

export function AdminBlogTable({ posts, totalPosts, pageSize, onPageSizeChange }: AdminBlogTableProps) {
  const showingEnd = posts.length;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1260px] w-full text-left">
          <thead className="border-b border-neutral-200 bg-neutral-50/70 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Thumbnail</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Published Date</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-neutral-100 text-sm hover:bg-neutral-100">
                <td className="px-4 py-3">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-lg border border-white/70 text-xs font-semibold text-neutral-700",
                      post.thumbnailTone
                    )}
                  >
                    IMG
                  </div>
                </td>

                <td className="px-4 py-3">
                  <p className="max-w-[280px] truncate font-semibold text-neutral-900">{post.title}</p>
                  <p className="max-w-[320px] truncate text-xs text-neutral-500">{post.excerpt}</p>
                </td>

                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-brand-green-100 px-2.5 py-1 text-xs font-semibold text-brand-green-700">
                    {post.category}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-neutral-700">
                    <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold", authorAvatarTone(post.authorName))}>
                      {getInitials(post.authorName)}
                    </span>
                    <span className="text-sm">{post.authorName}</span>
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", statusPillClass[post.status])}>
                    {post.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-neutral-700">
                  {post.publishedAt ? formatDate(post.publishedAt) : "Not published"}
                </td>

                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-neutral-700">
                    <Eye className="h-4 w-4 text-neutral-500" />
                    {new Intl.NumberFormat("en-US").format(post.views)}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      aria-label={`Preview ${post.title}`}
                      className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900"
                      onClick={() => console.log("Preview post stub", post.id)}
                      title="Preview"
                      type="button"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                    <Link
                      aria-label={`Edit ${post.title}`}
                      className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900"
                      href={`/admin/blog/${post.id}/edit`}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      aria-label={`Delete ${post.title}`}
                      className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-red-600 hover:bg-red-50"
                      onClick={() => console.log("Delete post stub", post.id)}
                      title="Delete"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {posts.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-neutral-500" colSpan={8}>
                  No posts found for the selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 text-sm text-neutral-500">
        <p>
          Showing 1-{showingEnd} of {totalPosts}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          <button
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={posts.length < pageSize}
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
