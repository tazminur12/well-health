"use client";

import {
  Bold,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Save,
  Star,
  Underline,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type RefObject,
} from "react";

import { Button } from "@/components/ui/button";
import { useBlogMutations } from "@/hooks/use-admin-blog";
import { showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import {
  BLOG_CATEGORIES,
  slugifyBlogTitle,
  type AdminBlogCategory,
  type AdminBlogPost,
  type AdminBlogStatus,
} from "@/lib/blog/mapper";
import type { BlogPostInput } from "@/lib/blog/schemas";
import { cn } from "@/lib/utils";

type BlogPostFormProps = {
  mode: "create" | "edit";
  initialData?: AdminBlogPost | null;
};

const toolbarItems = [
  { icon: Bold, label: "Bold", wrap: ["**", "**"] as const },
  { icon: Italic, label: "Italic", wrap: ["_", "_"] as const },
  { icon: Underline, label: "Underline", wrap: ["<u>", "</u>"] as const },
  { icon: Heading2, label: "H2", wrap: ["\n## ", "\n"] as const },
  { icon: Heading3, label: "H3", wrap: ["\n### ", "\n"] as const },
  { icon: List, label: "Bullet List", wrap: ["\n- ", ""] as const },
  { icon: ListOrdered, label: "Numbered List", wrap: ["\n1. ", ""] as const },
  { icon: LinkIcon, label: "Link", wrap: ["[", "](https://)"] as const },
  { icon: ImageIcon, label: "Image", wrap: ["![alt](", ")"] as const },
  { icon: Quote, label: "Quote", wrap: ["\n> ", "\n"] as const },
] as const;

function toDatetimeLocal(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function insertMarkdown(
  textarea: HTMLTextAreaElement | null,
  content: string,
  setContent: (value: string) => void,
  before: string,
  after: string
) {
  if (!textarea) {
    setContent(`${content}${before}text${after}`);
    return;
  }
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = content.slice(start, end) || "text";
  const next = `${content.slice(0, start)}${before}${selected}${after}${content.slice(end)}`;
  setContent(next);
  requestAnimationFrame(() => {
    textarea.focus();
    const cursor = start + before.length + selected.length + after.length;
    textarea.setSelectionRange(cursor, cursor);
  });
}

export function BlogPostForm({ mode, initialData }: BlogPostFormProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const {
    createPost,
    updatePost,
    uploadFeaturedImage,
    deleteFeaturedImage,
  } = useBlogMutations();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialData?.slug));
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [status, setStatus] = useState<AdminBlogStatus>(initialData?.status ?? "Draft");
  const [scheduledAt, setScheduledAt] = useState(toDatetimeLocal(initialData?.scheduledAt));
  const [category, setCategory] = useState<AdminBlogCategory>(
    initialData?.category ?? "Health Tips"
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription ?? "");
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [featuredImageUrl, setFeaturedImageUrl] = useState(initialData?.featuredImageUrl ?? null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [postId, setPostId] = useState(initialData?.id);

  useEffect(() => {
    if (!initialData) return;
    setTitle(initialData.title);
    setSlug(initialData.slug);
    setSlugManuallyEdited(true);
    setExcerpt(initialData.excerpt);
    setContent(initialData.content);
    setStatus(initialData.status);
    setScheduledAt(toDatetimeLocal(initialData.scheduledAt));
    setCategory(initialData.category);
    setTags(initialData.tags);
    setMetaTitle(initialData.metaTitle);
    setMetaDescription(initialData.metaDescription);
    setFeatured(initialData.featured);
    setFeaturedImageUrl(initialData.featuredImageUrl);
    setPostId(initialData.id);
  }, [initialData]);

  useEffect(() => {
    return () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    };
  }, [pendingPreview]);

  const effectiveSlug = useMemo(() => {
    if (slugManuallyEdited) return slug;
    return slugifyBlogTitle(title);
  }, [slug, slugManuallyEdited, title]);

  const imagePreview = pendingPreview ?? featuredImageUrl;
  const seoTitle = metaTitle.trim() || title.trim() || "Untitled post";
  const seoDescription =
    metaDescription.trim() || excerpt.trim() || "Write a short description for search results.";

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManuallyEdited) setSlug(slugifyBlogTitle(value));
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    setSlug(slugifyBlogTitle(value));
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

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  }

  async function removeFeaturedImage() {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);

    if (postId && featuredImageUrl) {
      try {
        await deleteFeaturedImage.mutateAsync(postId);
        setFeaturedImageUrl(null);
        await showAdminSuccess("Image removed", "Featured image cleared.");
      } catch (err) {
        await showAdminError(
          "Remove failed",
          err instanceof Error ? err.message : "Could not remove image."
        );
      }
      return;
    }
    setFeaturedImageUrl(null);
  }

  function buildPayload(nextStatus: AdminBlogStatus): BlogPostInput | null {
    if (title.trim().length < 3) {
      void showAdminError("Missing details", "Enter a post title (at least 3 characters).");
      return null;
    }
    if (effectiveSlug.length < 2) {
      void showAdminError("Missing details", "Slug is required.");
      return null;
    }
    if (excerpt.trim().length < 10) {
      void showAdminError("Missing details", "Add a short excerpt (10+ characters).");
      return null;
    }
    if (content.trim().length < 20) {
      void showAdminError("Missing details", "Write more article content before saving.");
      return null;
    }
    if (nextStatus === "Scheduled" && !scheduledAt) {
      void showAdminError("Schedule required", "Pick a future date and time.");
      return null;
    }

    return {
      title: title.trim(),
      slug: effectiveSlug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      category,
      tags,
      status: nextStatus === "Archived" ? "Archived" : nextStatus,
      featured,
      metaTitle: metaTitle.trim() || title.trim(),
      metaDescription: metaDescription.trim() || excerpt.trim(),
      scheduledAt:
        nextStatus === "Scheduled" && scheduledAt
          ? new Date(scheduledAt).toISOString()
          : "",
    };
  }

  function handleSubmit(nextStatus: AdminBlogStatus) {
    const payload = buildPayload(nextStatus);
    if (!payload) return;

    startTransition(async () => {
      try {
        let savedId = postId;
        if (mode === "edit" && postId) {
          await updatePost.mutateAsync({ id: postId, input: payload });
        } else {
          const created = await createPost.mutateAsync(payload);
          savedId = created.id;
          setPostId(created.id);
        }

        if (savedId && pendingFile) {
          const result = await uploadFeaturedImage.mutateAsync({
            id: savedId,
            file: pendingFile,
          });
          setFeaturedImageUrl(result.url ?? null);
          if (pendingPreview) URL.revokeObjectURL(pendingPreview);
          setPendingFile(null);
          setPendingPreview(null);
        }

        setStatus(nextStatus);
        await showAdminSuccess(
          mode === "edit" ? "Post updated" : "Post created",
          nextStatus === "Published"
            ? "Your article is live on the blog."
            : nextStatus === "Scheduled"
              ? "Post is scheduled for publishing."
              : "Draft saved successfully."
        );
        router.push("/admin/blog");
        router.refresh();
      } catch (err) {
        await showAdminError(
          mode === "edit" ? "Update failed" : "Create failed",
          err instanceof Error ? err.message : "Please try again."
        );
      }
    });
  }

  const busy =
    isPending ||
    createPost.isPending ||
    updatePost.isPending ||
    uploadFeaturedImage.isPending ||
    deleteFeaturedImage.isPending;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
      <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="space-y-3 border-b border-neutral-100 pb-5">
          <input
            className="w-full border-none bg-transparent p-0 font-heading text-2xl font-bold text-neutral-900 outline-none placeholder:text-neutral-400 sm:text-3xl"
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Enter post title…"
            value={title}
          />
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <span className="font-medium text-neutral-600">Permalink</span>
            <span className="rounded-md bg-neutral-50 px-2 py-1 font-mono text-xs text-neutral-500">
              /blog/
            </span>
            <input
              className="min-w-[200px] flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 font-mono text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:bg-white focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => handleSlugChange(event.target.value)}
              value={effectiveSlug}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Excerpt</label>
          <textarea
            className="min-h-[80px] w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm leading-relaxed text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => setExcerpt(event.target.value)}
            placeholder="Short summary shown in listings and social previews…"
            rows={2}
            value={excerpt}
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-neutral-200 border-b-0 bg-neutral-50 p-2">
            {toolbarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  aria-label={item.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-white hover:text-neutral-900 hover:shadow-sm"
                  onClick={() =>
                    insertMarkdown(
                      contentRef.current,
                      content,
                      setContent,
                      item.wrap[0],
                      item.wrap[1]
                    )
                  }
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
            <span className="ml-auto hidden text-[11px] text-neutral-400 sm:inline">
              Markdown supported
            </span>
          </div>
          <textarea
            ref={contentRef as RefObject<HTMLTextAreaElement>}
            className="min-h-[440px] w-full rounded-b-xl border border-neutral-200 px-4 py-3.5 font-body text-sm leading-7 text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => setContent(event.target.value)}
            placeholder="Start writing your article… Use the toolbar for headings, lists, and emphasis."
            value={content}
          />
        </div>
      </section>

      <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
        <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-800">Publish</h3>
          <select
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => setStatus(event.target.value as AdminBlogStatus)}
            value={status === "Archived" ? "Draft" : status}
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Scheduled">Scheduled</option>
          </select>

          {status === "Scheduled" ? (
            <input
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setScheduledAt(event.target.value)}
              type="datetime-local"
              value={scheduledAt}
            />
          ) : null}

          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700">
            <input
              checked={featured}
              className="h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-600/30"
              onChange={(event) => setFeatured(event.target.checked)}
              type="checkbox"
            />
            <Star className="h-3.5 w-3.5 text-amber-500" />
            Featured on blog home
          </label>

          <div className="flex gap-2">
            <Button
              className="h-10 flex-1 rounded-xl"
              disabled={busy}
              onClick={() => handleSubmit("Draft")}
              type="button"
              variant="outline"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save draft
            </Button>
            <Button
              className="h-10 flex-1 rounded-xl bg-brand-green-600 text-white hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
              disabled={busy}
              onClick={() => handleSubmit(status === "Scheduled" ? "Scheduled" : "Published")}
              type="button"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {status === "Scheduled" ? "Schedule" : "Publish"}
            </Button>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-800">Featured image</h3>
          <input
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />

          {imagePreview ? (
            <div className="relative overflow-hidden rounded-xl border border-neutral-200">
              <div className="relative aspect-[16/9] w-full bg-neutral-100">
                <Image
                  alt="Featured preview"
                  className="object-cover"
                  fill
                  sizes="320px"
                  src={imagePreview}
                  unoptimized
                />
              </div>
              <button
                aria-label="Remove featured image"
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-neutral-600 shadow-sm hover:bg-white"
                disabled={busy}
                onClick={() => void removeFeaturedImage()}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 px-4 py-8 text-center transition-colors hover:border-brand-green-600/40 hover:bg-brand-green-50/40"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <UploadCloud className="h-5 w-5 text-brand-green-600" />
              <p className="mt-2 text-sm font-medium text-neutral-700">Upload cover image</p>
              <p className="mt-1 text-xs text-neutral-500">1200×630 · JPG, PNG, WEBP · max 5MB</p>
            </button>
          )}

          {imagePreview ? (
            <Button
              className="h-9 w-full rounded-xl"
              onClick={() => fileInputRef.current?.click()}
              type="button"
              variant="outline"
            >
              Replace image
            </Button>
          ) : null}
        </section>

        <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-800">Category & tags</h3>
          <select
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
            onChange={(event) => setCategory(event.target.value as AdminBlogCategory)}
            value={category}
          >
            {BLOG_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <div className="rounded-xl border border-neutral-200 px-2.5 py-2">
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
                    onClick={() => setTags((current) => current.filter((item) => item !== tag))}
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

        <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-800">SEO</h3>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-600">Meta title</label>
            <input
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setMetaTitle(event.target.value)}
              value={metaTitle}
            />
            <p
              className={cn(
                "text-right text-[11px]",
                metaTitle.length > 60 ? "text-red-600" : "text-neutral-500"
              )}
            >
              {metaTitle.length}/60
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-600">Meta description</label>
            <textarea
              className="min-h-[92px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setMetaDescription(event.target.value)}
              rows={4}
              value={metaDescription}
            />
            <p
              className={cn(
                "text-right text-[11px]",
                metaDescription.length > 160 ? "text-red-600" : "text-neutral-500"
              )}
            >
              {metaDescription.length}/160
            </p>
          </div>

          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
              Search preview
            </p>
            <p className="mt-2 truncate text-base text-[#1a0dab]">{seoTitle}</p>
            <p className="truncate text-xs text-[#006621]">
              wellhealth.example/blog/{effectiveSlug || "post-slug"}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-600">{seoDescription}</p>
          </div>
        </section>
      </aside>
    </div>
  );
}
