"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type HeroImageSlide = {
  id: string;
  src: string;
  alt: string;
};

const slides: HeroImageSlide[] = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1920&q=80",
    alt: "Premium skincare and wellness products on a soft surface",
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=1920&q=80",
    alt: "Colorful vitamin capsules and daily supplements",
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=1920&q=80",
    alt: "Assorted medicine bottles and health essentials",
  },
  {
    id: "4",
    src: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1920&q=80",
    alt: "Clinical-grade medicine and supplement packaging",
  },
];

export function HeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = (index: number) => {
    setActiveSlide((index + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <section
      aria-label="Hero image slider"
      aria-roledescription="carousel"
      className="relative w-full overflow-hidden bg-neutral-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/*
        Full-image banner (looklify-style):
        width 100% + natural height — no aspect-ratio crop on mobile.
      */}
      <div className="relative w-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            aria-hidden={activeSlide !== index}
            className={cn(
              "w-full transition-opacity duration-500 ease-out",
              activeSlide === index
                ? "relative z-10 opacity-100"
                : "pointer-events-none absolute inset-x-0 top-0 z-0 opacity-0"
            )}
          >
            <Image
              alt={slide.alt}
              className="h-auto w-full object-contain"
              height={1080}
              priority={index === 0}
              sizes="100vw"
              src={slide.src}
              width={1920}
            />
          </div>
        ))}

        <button
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-neutral-900 shadow-md backdrop-blur-sm transition-all duration-200 active:scale-95 hover:bg-white sm:left-4 sm:h-11 sm:w-11"
          onClick={() => goTo(activeSlide - 1)}
          type="button"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          aria-label="Next slide"
          className="absolute right-2 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-neutral-900 shadow-md backdrop-blur-sm transition-all duration-200 active:scale-95 hover:bg-white sm:right-4 sm:h-11 sm:w-11"
          onClick={() => goTo(activeSlide + 1)}
          type="button"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-2 sm:bottom-4">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={activeSlide === index ? "true" : undefined}
              className={cn(
                "h-2 rounded-full shadow-sm transition-all duration-200",
                activeSlide === index
                  ? "w-7 bg-brand-green-600"
                  : "w-2 bg-white/80 ring-1 ring-black/10 active:bg-brand-green-600/70"
              )}
              onClick={() => goTo(index)}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
