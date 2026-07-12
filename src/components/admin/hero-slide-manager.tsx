"use client";

import {
  GripVertical,
  Info,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { useAdminHeroSlides, useContentMutations } from "@/hooks/use-admin-content";
import {
  confirmAdminAction,
  showAdminError,
  showAdminSuccess,
} from "@/lib/admin/alerts";
import type { AdminHeroSlide } from "@/lib/content/mapper";
import { cn } from "@/lib/utils";

export function HeroSlideManager() {
  const { data: slides = [], isLoading, refetch } = useAdminHeroSlides();
  const { createHero, updateHero, deleteHero, toggleHero, uploadImage } =
    useContentMutations();
  const [editing, setEditing] = useState<AdminHeroSlide | null>(null);
  const [creating, setCreating] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleDelete(id: string) {
    const ok = await confirmAdminAction({
      title: "Delete this slide?",
      text: "This removes the banner from the homepage slider.",
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await deleteHero.mutateAsync(id);
      await showAdminSuccess("Slide deleted", "Homepage slider updated.");
    } catch (err) {
      await showAdminError("Delete failed", err instanceof Error ? err.message : "Try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-neutral-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-green-600" />
        Loading slides…
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-neutral-900">Hero slider</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Homepage full-width banner images
          </p>
        </div>
        <Button
          className="h-10 rounded-xl bg-brand-green-600 text-white hover:bg-brand-green-900"
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add slide
        </Button>
      </header>

      <aside className="rounded-2xl border border-brand-green-100 bg-brand-green-50/80 px-4 py-3.5 text-sm text-brand-green-900 sm:px-5">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-600" />
          <div className="space-y-1.5">
            <p className="font-semibold">Image size instruction</p>
            <ul className="list-disc space-y-1 pl-4 text-[13px] leading-6 text-brand-green-900/90">
              <li>
                Recommended size: <strong>1920 × 700 px</strong> (width × height)
              </li>
              <li>
                Aspect ratio: <strong>about 16:6</strong> (wide landscape banner)
              </li>
              <li>
                Format: <strong>JPG, PNG, or WEBP</strong> · Max file size: <strong>5 MB</strong>
              </li>
              <li>
                Keep important text/logo in the center — edges may crop slightly on small screens
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <div className="space-y-3">
        {slides.map((slide) => (
          <article
            key={slide.id}
            className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-3 text-neutral-400">
              <GripVertical className="hidden h-4 w-4 sm:block" />
              <div className="relative h-20 w-36 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                {slide.imageUrl ? (
                  <Image alt="" className="object-cover" fill sizes="144px" src={slide.imageUrl} unoptimized />
                ) : null}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-neutral-900">
                {slide.headline || slide.alt}
              </p>
              <p className="mt-0.5 truncate text-xs text-neutral-500">{slide.imageUrl}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    slide.isActive
                      ? "bg-brand-green-100 text-brand-green-700"
                      : "bg-neutral-200 text-neutral-600"
                  )}
                >
                  {slide.isActive ? "Active" : "Hidden"}
                </span>
                {slide.linkUrl ? (
                  <span className="text-[11px] text-neutral-500">→ {slide.linkUrl}</span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                className="h-9 rounded-xl"
                onClick={() => void toggleHero.mutateAsync(slide.id).then(() => refetch())}
                type="button"
                variant="outline"
              >
                {slide.isActive ? "Hide" : "Show"}
              </Button>
              <Button
                className="h-9 rounded-xl"
                onClick={() => {
                  setCreating(false);
                  setEditing(slide);
                }}
                type="button"
                variant="outline"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                className="h-9 rounded-xl text-red-600 hover:bg-red-50"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await handleDelete(slide.id);
                  })
                }
                type="button"
                variant="outline"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </article>
        ))}

        {slides.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center text-sm text-neutral-500">
            No hero slides yet. Add your first homepage banner.
          </div>
        ) : null}
      </div>

      <HeroSlideModal
        open={creating || Boolean(editing)}
        slide={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={async () => {
          setCreating(false);
          setEditing(null);
          await refetch();
        }}
        createHero={createHero}
        updateHero={updateHero}
        uploadImage={uploadImage}
      />
    </section>
  );
}

function HeroSlideModal({
  open,
  slide,
  onClose,
  onSaved,
  createHero,
  updateHero,
  uploadImage,
}: {
  open: boolean;
  slide: AdminHeroSlide | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  createHero: ReturnType<typeof useContentMutations>["createHero"];
  updateHero: ReturnType<typeof useContentMutations>["updateHero"];
  uploadImage: ReturnType<typeof useContentMutations>["uploadImage"];
}) {
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [subheading, setSubheading] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setImageUrl(slide?.imageUrl ?? "");
    setAlt(slide?.alt ?? "");
    setLinkUrl(slide?.linkUrl ?? "");
    setHeadline(slide?.headline ?? "");
    setSubheading(slide?.subheading ?? "");
    setIsActive(slide?.isActive ?? true);
  }, [open, slide]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, open, saving]);

  if (!mounted || !open) return null;

  async function handleUpload(file: File) {
    try {
      const url = await uploadImage.mutateAsync({ folder: "hero", file });
      setImageUrl(url);
      await showAdminSuccess("Image uploaded", "Banner image ready.");
    } catch (err) {
      await showAdminError("Upload failed", err instanceof Error ? err.message : "Try again.");
    }
  }

  async function handleSave() {
    if (!imageUrl.trim() || alt.trim().length < 2) {
      await showAdminError("Missing details", "Image and alt text are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        imageUrl,
        alt,
        linkUrl,
        headline,
        subheading,
        primaryCtaText: "",
        primaryCtaLink: "",
        secondaryCtaText: "",
        secondaryCtaLink: "",
        sortOrder: slide?.sortOrder ?? 0,
        isActive,
      };
      if (slide) {
        await updateHero.mutateAsync({ id: slide.id, input: payload });
      } else {
        await createHero.mutateAsync(payload);
      }
      await showAdminSuccess(slide ? "Slide updated" : "Slide created", "Homepage hero refreshed.");
      await onSaved();
    } catch (err) {
      await showAdminError("Save failed", err instanceof Error ? err.message : "Try again.");
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-neutral-950/50"
        onClick={() => !saving && onClose()}
        type="button"
      />
      <div className="relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-xl sm:rounded-2xl">
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-neutral-900">
              {slide ? "Edit slide" : "New slide"}
            </h3>
            <p className="text-xs text-neutral-500">Banner image, alt text, and optional link</p>
          </div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-50"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <div className="rounded-xl border border-brand-green-100 bg-brand-green-50/70 px-3.5 py-3 text-[13px] leading-6 text-brand-green-900">
            <p className="font-semibold">Upload size</p>
            <p className="mt-1 text-brand-green-900/90">
              Use <strong>1920 × 700 px</strong> landscape image. JPG / PNG / WEBP, max{" "}
              <strong>5 MB</strong>.
            </p>
          </div>

          <input
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void handleUpload(file);
            }}
            ref={fileRef}
            type="file"
          />
          {imageUrl ? (
            <div className="relative aspect-[16/6] overflow-hidden rounded-xl border border-neutral-200">
              <Image alt="" className="object-cover" fill sizes="560px" src={imageUrl} unoptimized />
              <Button
                className="absolute bottom-3 right-3 h-9 rounded-xl bg-white/95"
                onClick={() => fileRef.current?.click()}
                type="button"
                variant="outline"
              >
                Replace
              </Button>
            </div>
          ) : (
            <button
              className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 px-4 py-10 text-center hover:bg-neutral-50"
              onClick={() => fileRef.current?.click()}
              type="button"
            >
              <UploadCloud className="h-5 w-5 text-brand-green-600" />
              <p className="mt-2 text-sm font-medium">Upload banner image</p>
              <p className="mt-1 text-xs text-neutral-500">
                Best: 1920 × 700 px · JPG / PNG / WEBP · max 5 MB
              </p>
            </button>
          )}

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Alt text</span>
            <input
              className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(e) => setAlt(e.target.value)}
              value={alt}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Headline (optional)</span>
            <input
              className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(e) => setHeadline(e.target.value)}
              value={headline}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Link URL (optional)</span>
            <input
              className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="/shop"
              value={linkUrl}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              checked={isActive}
              className="h-4 w-4 rounded border-neutral-300 text-brand-green-600"
              onChange={(e) => setIsActive(e.target.checked)}
              type="checkbox"
            />
            Active on homepage
          </label>
        </div>

        <footer className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-4">
          <Button className="h-10 rounded-xl" disabled={saving} onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button
            className="h-10 rounded-xl bg-brand-green-600 text-white hover:bg-brand-green-900"
            disabled={saving || uploadImage.isPending}
            onClick={() => void handleSave()}
            type="button"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save slide
          </Button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
