"use client";

import { Package2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type ImageGalleryProps = {
  productName: string;
  badgeLabel?: string;
  images: string[];
  imageTone?: string;
};

export function ImageGallery({
  productName,
  badgeLabel,
  images,
  imageTone,
}: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = images.length > 0 ? images : [""];
  const active = slides[Math.min(activeIndex, slides.length - 1)];

  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md">
        <div
          className={cn(
            "relative flex aspect-square items-center justify-center overflow-hidden",
            !active &&
              (imageTone ||
                "bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.12),_transparent_45%),linear-gradient(160deg,#f8faf9,#eef2f0)]")
          )}
        >
          {badgeLabel ? (
            <div className="absolute left-4 top-4 z-10 rounded-full bg-[#C9A24B] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
              {badgeLabel}
            </div>
          ) : null}

          {active ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={productName}
              className="h-full w-full object-cover"
              src={active}
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-neutral-200">
              <Package2 className="h-14 w-14 text-brand-green-600" />
            </div>
          )}
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {slides.map((url, index) => (
            <button
              aria-label={`Open image ${index + 1}`}
              className={cn(
                "flex aspect-square items-center justify-center overflow-hidden rounded-lg border p-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
                index === activeIndex
                  ? "border-brand-green-600 ring-1 ring-brand-green-600"
                  : "border-neutral-200"
              )}
              key={`${url}-${index}`}
              onClick={() => setActiveIndex(index)}
              title={`Open image ${index + 1}`}
              type="button"
            >
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" className="h-full w-full rounded-md object-cover" src={url} />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-md bg-neutral-100">
                  <Package2 className="h-6 w-6 text-brand-green-600" />
                </div>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
