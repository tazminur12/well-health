"use client";

import { Package2 } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type ImageGalleryProps = {
  productName: string;
  badgeLabel: string;
};

const imageVariants = [
  { label: "Front", tone: "from-white to-neutral-100" },
  { label: "Side", tone: "from-brand-green-100 to-white" },
  { label: "Ingredients", tone: "from-amber-50 to-white" },
  { label: "Packaging", tone: "from-neutral-100 to-white" },
];

export function ImageGallery({ productName, badgeLabel }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeTone = useMemo(() => imageVariants[activeIndex % imageVariants.length].tone, [activeIndex]);

  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md">
        <div className={cn("relative flex aspect-square cursor-zoom-in items-center justify-center bg-gradient-to-br", activeTone)}>
          <div className="absolute left-4 top-4 rounded-full bg-gold-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
            {badgeLabel}
          </div>

          <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-neutral-200">
            <Package2 className="h-14 w-14 text-brand-green-600" />
          </div>

          <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 px-3 py-2 text-xs font-medium text-neutral-700 shadow-sm">
            {productName}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {imageVariants.map((variant, index) => (
          <button
            aria-label={`Open image ${variant.label}`}
            title={`Open image ${variant.label}`}
            key={variant.label}
            className={cn(
              "flex aspect-square items-center justify-center rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
              index === activeIndex ? "border-brand-green-600 ring-1 ring-brand-green-600" : "border-neutral-200"
            )}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <div className={cn("flex h-full w-full items-center justify-center rounded-md bg-gradient-to-br", variant.tone)}>
              <Package2 className="h-6 w-6 text-brand-green-600" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}