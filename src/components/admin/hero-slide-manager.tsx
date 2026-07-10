"use client";

import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { SlideEditModal, type HeroSlide } from "@/components/admin/slide-edit-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeroSlideManagerProps = {
  onToast: (message: string) => void;
};

const initialSlides: HeroSlide[] = [
  {
    id: "slide-1",
    headline: "Better Health, Better Life",
    subheading: "High quality supplements crafted for modern wellness routines.",
    primaryCtaText: "Shop Now",
    primaryCtaLink: "/shop",
    secondaryCtaText: "Learn More",
    secondaryCtaLink: "/about",
    active: true,
    imageTone: "bg-[linear-gradient(135deg,#e8f5ee_0%,#cfe8dc_100%)]",
    hasImage: true,
  },
  {
    id: "slide-2",
    headline: "Clinically Crafted Nutrition",
    subheading: "Science-backed formulas designed for daily confidence and care.",
    primaryCtaText: "Explore Products",
    primaryCtaLink: "/shop",
    secondaryCtaText: "Read Guides",
    secondaryCtaLink: "/blog",
    active: true,
    imageTone: "bg-[linear-gradient(135deg,#edf6ff_0%,#d8e9fb_100%)]",
    hasImage: true,
  },
  {
    id: "slide-3",
    headline: "Nature-Backed Daily Care",
    subheading: "Premium ingredients sourced with quality and transparency at every step.",
    primaryCtaText: "View Collection",
    primaryCtaLink: "/shop",
    secondaryCtaText: "Contact Us",
    secondaryCtaLink: "/contact",
    active: false,
    imageTone: "bg-[linear-gradient(135deg,#fff5e6_0%,#fbe4c1_100%)]",
    hasImage: true,
  },
];

export function HeroSlideManager({ onToast }: HeroSlideManagerProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function openEdit(slide: HeroSlide) {
    setEditingSlide(slide);
    setModalOpen(true);
  }

  function handleAddSlide() {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      headline: "New Slide Headline",
      subheading: "Add a short supporting message for this hero slide.",
      primaryCtaText: "Shop Now",
      primaryCtaLink: "/shop",
      secondaryCtaText: "Learn More",
      secondaryCtaLink: "/about",
      active: true,
      imageTone: "bg-[linear-gradient(135deg,#f3f0ff_0%,#e2dafb_100%)]",
      hasImage: false,
    };

    setSlides((current) => [newSlide, ...current]);
    openEdit(newSlide);
  }

  function handleSaveSlide(updatedSlide: HeroSlide) {
    setSlides((current) => current.map((slide) => (slide.id === updatedSlide.id ? updatedSlide : slide)));
    setModalOpen(false);
    onToast("Changes saved successfully");
    console.log("Save slide stub", updatedSlide);
  }

  function handleDeleteSlide(slideId: string) {
    setSlides((current) => current.filter((slide) => slide.id !== slideId));
    onToast("Slide removed");
    console.log("Delete slide stub", slideId);
  }

  function toggleActive(slideId: string) {
    setSlides((current) =>
      current.map((slide) => (slide.id === slideId ? { ...slide, active: !slide.active } : slide))
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-bold text-neutral-900">Hero Slides</h3>
          <p className="text-sm text-neutral-500">Manage the homepage slider - drag to reorder</p>
        </div>

        <Button
          className="h-10 rounded-lg bg-brand-green-600 text-white hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
          onClick={handleAddSlide}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add Slide
        </Button>
      </div>

      <div className="space-y-3">
        {slides.map((slide) => (
          <article
            key={slide.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <button
              aria-label="Drag to reorder"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              onClick={() => console.log("Drag handle stub", slide.id)}
              type="button"
            >
              <GripVertical className="h-4 w-4" />
            </button>

            <div className={cn("flex h-20 w-[120px] items-center justify-center rounded-lg text-xs font-semibold text-neutral-700", slide.imageTone)}>
              Slide Image
            </div>

            <div className="min-w-[240px] flex-1">
              <p className="font-semibold text-neutral-900">{slide.headline}</p>
              <p className="mt-1 line-clamp-1 text-xs text-neutral-500">{slide.subheading}</p>
              <p className="mt-1 text-xs text-neutral-500">
                {slide.primaryCtaText} ({slide.primaryCtaLink})
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button
                aria-label="Toggle active"
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  slide.active ? "bg-brand-green-600" : "bg-neutral-300"
                )}
                onClick={() => toggleActive(slide.id)}
                type="button"
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                    slide.active ? "translate-x-5" : "translate-x-1"
                  )}
                />
              </button>

              <button
                aria-label={`Edit ${slide.headline}`}
                className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                onClick={() => openEdit(slide)}
                type="button"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>

              <button
                aria-label={`Delete ${slide.headline}`}
                className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-red-600 hover:bg-red-50"
                onClick={() => handleDeleteSlide(slide.id)}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <SlideEditModal
        onClose={() => setModalOpen(false)}
        onSave={handleSaveSlide}
        open={modalOpen}
        slide={editingSlide}
      />
    </section>
  );
}
