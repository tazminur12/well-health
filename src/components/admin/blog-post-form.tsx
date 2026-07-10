"use client";

import {
  Bold,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Underline,
  UploadCloud,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BlogFormStatus = "Draft" | "Published" | "Scheduled";
export type BlogFormCategory = "Health Tips" | "Product Guides" | "Nutrition" | "Company News";

type BlogPostFormProps = {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    status: BlogFormStatus;
    scheduledAt?: string;
    category: BlogFormCategory;
    tags: string[];
    metaTitle: string;
    metaDescription: string;
    hasFeaturedImage: boolean;
  };
};

const toolbarItems = [
  { icon: Bold, label: "Bold" },
  { icon: Italic, label: "Italic" },
  { icon: Underline, label: "Underline" },
  { icon: Heading2, label: "H2" },
  { icon: Heading3, label: "H3" },
  { icon: List, label: "Bullet List" },
  { icon: ListOrdered, label: "Numbered List" },
  { icon: LinkIcon, label: "Link" },
  { icon: Image, label: "Image" },
  { icon: Quote, label: "Quote" },
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function BlogPostForm({ mode, initialData }: BlogPostFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialData?.slug));
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [status, setStatus] = useState<BlogFormStatus>(initialData?.status ?? "Draft");
  const [scheduledAt, setScheduledAt] = useState(initialData?.scheduledAt ?? "");
  const [category, setCategory] = useState<BlogFormCategory>(initialData?.category ?? "Health Tips");
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? ["Wellness"]);
  const [tagInput, setTagInput] = useState("");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription ?? "");
  const [hasFeaturedImage, setHasFeaturedImage] = useState(initialData?.hasFeaturedImage ?? false);

  const effectiveSlug = useMemo(() => {
    if (slugManuallyEdited) return slug;
    return slugify(title);
  }, [slug, slugManuallyEdited, title]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    setSlug(slugify(value));
  }

  function addTag() {
    const next = tagInput.trim();
    if (!next) return;
    if (tags.some((tag) => tag.toLowerCase() === next.toLowerCase())) {
      setTagInput("");
      return;
    }
    setTags((current) => [...current, next]);
    setTagInput("");
  }

  function removeTag(tagToRemove: string) {
    setTags((current) => current.filter((tag) => tag !== tagToRemove));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
      <section className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="space-y-3 border-b border-neutral-200 pb-4">
          <input
            className="w-full border-none bg-transparent p-0 font-heading text-2xl font-bold text-neutral-900 outline-none placeholder:text-neutral-400"
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Enter post title..."
            value={title}
          />

          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <span className="font-medium">URL:</span>
            <span>/blog/</span>
            <input
              className="min-w-[220px] flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => handleSlugChange(event.target.value)}
              value={effectiveSlug}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Excerpt</label>
          <textarea
            className="min-h-[72px] w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => setExcerpt(event.target.value)}
            placeholder="Short summary shown in blog listing..."
            rows={2}
            value={excerpt}
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-neutral-200 border-b-0 bg-neutral-50 p-2">
            {toolbarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  aria-label={item.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900"
                  onClick={() => console.log("Editor toolbar action", item.label)}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          <textarea
            className="min-h-[420px] w-full rounded-b-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => setContent(event.target.value)}
            placeholder="Start writing your article content here..."
            value={content}
          />
        </div>
      </section>

      <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
        <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-800">Publish</h3>

          <select
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => setStatus(event.target.value as BlogFormStatus)}
            value={status}
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Scheduled">Scheduled</option>
          </select>

          {status === "Scheduled" ? (
            <input
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setScheduledAt(event.target.value)}
              type="datetime-local"
              value={scheduledAt}
            />
          ) : null}

          <div className="flex gap-2">
            <Button className="h-10 flex-1 rounded-lg" type="button" variant="outline">
              Save Draft
            </Button>
            <Button
              className="h-10 flex-1 rounded-lg bg-brand-green-600 text-white hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
              type="button"
            >
              Publish
            </Button>
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-800">Featured Image</h3>

          <button
            className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 px-4 py-6 text-center hover:bg-neutral-50"
            onClick={() => setHasFeaturedImage(true)}
            type="button"
          >
            <UploadCloud className="h-5 w-5 text-neutral-500" />
            <p className="mt-2 text-sm font-medium text-neutral-700">Click or drag to upload featured image</p>
            <p className="mt-1 text-xs text-neutral-500">Recommended: 1200x630px</p>
          </button>

          {hasFeaturedImage ? (
            <div className="relative overflow-hidden rounded-lg border border-neutral-200">
              <div className="flex h-36 items-center justify-center bg-[linear-gradient(135deg,#e8f5ee_0%,#cfe8dc_100%)] text-sm font-semibold text-neutral-700">
                Featured Preview
              </div>
              <button
                aria-label="Remove featured image"
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm hover:bg-white"
                onClick={() => setHasFeaturedImage(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </section>

        <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-800">Category & Tags</h3>

          <select
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => setCategory(event.target.value as BlogFormCategory)}
            value={category}
          >
            <option value="Health Tips">Health Tips</option>
            <option value="Product Guides">Product Guides</option>
            <option value="Nutrition">Nutrition</option>
            <option value="Company News">Company News</option>
          </select>

          <div className="rounded-lg border border-neutral-200 px-2 py-2">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-green-100 px-2.5 py-1 text-xs font-medium text-brand-green-700"
                >
                  {tag}
                  <button
                    aria-label={`Remove ${tag}`}
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-brand-green-200"
                    onClick={() => removeTag(tag)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <input
              className="h-8 w-full border-none px-1 text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag();
                }
              }}
              placeholder="Type tag and press Enter"
              value={tagInput}
            />
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-800">SEO</h3>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-600">Meta Title</label>
            <input
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setMetaTitle(event.target.value)}
              value={metaTitle}
            />
            <p className={cn("text-right text-[11px]", metaTitle.length > 60 ? "text-red-600" : "text-neutral-500")}>{metaTitle.length}/60</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-600">Meta Description</label>
            <textarea
              className="min-h-[92px] w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setMetaDescription(event.target.value)}
              rows={4}
              value={metaDescription}
            />
            <p className={cn("text-right text-[11px]", metaDescription.length > 160 ? "text-red-600" : "text-neutral-500")}>{metaDescription.length}/160</p>
          </div>
        </section>
      </aside>

      <div className="xl:col-span-2">
        <p className="text-xs text-neutral-500">
          {mode === "create"
            ? "Creating a new blog post with placeholder editor controls."
            : "Editing an existing blog post with placeholder editor controls."}
        </p>
      </div>
    </div>
  );
}
