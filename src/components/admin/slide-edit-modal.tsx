"use client";

import { UploadCloud, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  headline: string;
  subheading: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  active: boolean;
  imageTone: string;
  hasImage: boolean;
};

type SlideEditModalProps = {
  open: boolean;
  slide: HeroSlide | null;
  onClose: () => void;
  onSave: (slide: HeroSlide) => void;
};

export function SlideEditModal({ open, slide, onClose, onSave }: SlideEditModalProps) {
  const [draft, setDraft] = useState<HeroSlide | null>(slide);

  useEffect(() => {
    setDraft(slide);
  }, [slide]);

  if (!draft) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-neutral-950/40 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <section
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[94vw] max-w-2xl -translate-x-1/2 rounded-xl border border-neutral-200 bg-white shadow-xl transition-all duration-200",
          open ? "translate-y-[-50%] opacity-100" : "pointer-events-none translate-y-[-46%] opacity-0"
        )}
      >
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-neutral-900">Edit Slide</h3>
            <p className="text-xs text-neutral-500">Update slide copy, CTA links, and image</p>
          </div>

          <button
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="max-h-[72vh] space-y-4 overflow-y-auto px-5 py-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Headline</label>
            <input
              className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setDraft((current) => (current ? { ...current, headline: event.target.value } : current))}
              value={draft.headline}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Subheading</label>
            <textarea
              className="min-h-[88px] w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setDraft((current) => (current ? { ...current, subheading: event.target.value } : current))}
              rows={3}
              value={draft.subheading}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Primary CTA Text</label>
              <input
                className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                onChange={(event) => setDraft((current) => (current ? { ...current, primaryCtaText: event.target.value } : current))}
                value={draft.primaryCtaText}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Primary CTA Link</label>
              <input
                className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                onChange={(event) => setDraft((current) => (current ? { ...current, primaryCtaLink: event.target.value } : current))}
                value={draft.primaryCtaLink}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Secondary CTA Text</label>
              <input
                className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                onChange={(event) => setDraft((current) => (current ? { ...current, secondaryCtaText: event.target.value } : current))}
                value={draft.secondaryCtaText}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Secondary CTA Link</label>
              <input
                className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                onChange={(event) => setDraft((current) => (current ? { ...current, secondaryCtaLink: event.target.value } : current))}
                value={draft.secondaryCtaLink}
              />
            </div>
          </div>

          <section className="space-y-3 rounded-xl border border-neutral-200 p-4">
            <h4 className="text-sm font-semibold text-neutral-800">Slide Image</h4>
            <button
              className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 px-4 py-6 text-center hover:bg-neutral-50"
              onClick={() => setDraft((current) => (current ? { ...current, hasImage: true } : current))}
              type="button"
            >
              <UploadCloud className="h-5 w-5 text-neutral-500" />
              <p className="mt-2 text-sm font-medium text-neutral-700">Click or drag to upload slide image</p>
              <p className="mt-1 text-xs text-neutral-500">Recommended: 1600x900px</p>
            </button>

            {draft.hasImage ? (
              <div className="relative overflow-hidden rounded-lg border border-neutral-200">
                <div className={cn("flex h-36 items-center justify-center text-sm font-semibold text-neutral-700", draft.imageTone)}>
                  Slide Preview
                </div>
                <button
                  aria-label="Remove image"
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm hover:bg-white"
                  onClick={() => setDraft((current) => (current ? { ...current, hasImage: false } : current))}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </section>

          <div className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2.5">
            <p className="text-sm font-medium text-neutral-700">Active</p>
            <button
              aria-label="Toggle slide active"
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                draft.active ? "bg-brand-green-600" : "bg-neutral-300"
              )}
              onClick={() => setDraft((current) => (current ? { ...current, active: !current.active } : current))}
              type="button"
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                  draft.active ? "translate-x-5" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-4">
          <Button className="h-10 rounded-lg" onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button
            className="h-10 rounded-lg bg-brand-green-600 text-white hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
            onClick={() => onSave(draft)}
            type="button"
          >
            Save Slide
          </Button>
        </footer>
      </section>
    </>
  );
}
