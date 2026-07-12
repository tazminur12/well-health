"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { PublicHeroSlide } from "@/lib/content/public-queries";
import { cn } from "@/lib/utils";

const BANNER_WIDTH = 1920;
const BANNER_HEIGHT = 700;

type HeroSliderProps = {
  slides: PublicHeroSlide[];
};

export function HeroSlider({ slides }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPx, setDragPx] = useState(0);
  const startX = useRef(0);
  const startTime = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const safeSlides = slides.length > 0 ? slides : [];

  const goTo = (index: number) => {
    if (safeSlides.length === 0) return;
    setCurrentSlide(((index % safeSlides.length) + safeSlides.length) % safeSlides.length);
    setDragPx(0);
  };

  const goPrev = () => goTo(currentSlide - 1);
  const goNext = () => goTo(currentSlide + 1);

  useEffect(() => {
    if (isDragging || safeSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % safeSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isDragging, safeSlides.length]);

  if (safeSlides.length === 0) return null;

  const onPointerDown = (clientX: number) => {
    if (safeSlides.length <= 1) return;
    setIsDragging(true);
    startX.current = clientX;
    startTime.current = Date.now();
    setDragPx(0);
  };

  const onPointerMove = (clientX: number) => {
    if (!isDragging) return;
    setDragPx(clientX - startX.current);
  };

  const onPointerUp = (clientX: number) => {
    if (!isDragging) return;
    const diff = startX.current - clientX;
    const elapsed = Date.now() - startTime.current;
    const width = trackRef.current?.offsetWidth ?? 375;
    const threshold = Math.min(80, width * 0.18);

    if (Math.abs(diff) > threshold || (Math.abs(diff) > 30 && elapsed < 300)) {
      if (diff > 0) goNext();
      else goPrev();
    } else {
      setDragPx(0);
    }
    setIsDragging(false);
  };

  const translatePercent = -currentSlide * 100;
  const dragPercent =
    trackRef.current && trackRef.current.offsetWidth > 0
      ? (dragPx / trackRef.current.offsetWidth) * 100
      : 0;

  return (
    <section
      aria-label="Hero image slider"
      aria-roledescription="carousel"
      className="relative w-full select-none overflow-hidden bg-neutral-100"
      ref={trackRef}
      onMouseDown={(e) => {
        e.preventDefault();
        onPointerDown(e.clientX);
      }}
      onMouseLeave={() => {
        if (isDragging) {
          setIsDragging(false);
          setDragPx(0);
        }
      }}
      onMouseMove={(e) => onPointerMove(e.clientX)}
      onMouseUp={(e) => onPointerUp(e.clientX)}
      onTouchCancel={() => {
        setIsDragging(false);
        setDragPx(0);
      }}
      onTouchEnd={(e) => onPointerUp(e.changedTouches[0].clientX)}
      onTouchMove={(e) => onPointerMove(e.touches[0].clientX)}
      onTouchStart={(e) => onPointerDown(e.touches[0].clientX)}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <div
        className="flex w-full"
        style={{
          transform: `translateX(calc(${translatePercent}% + ${dragPercent}%))`,
          transition: isDragging ? "none" : "transform 0.35s ease-out",
        }}
      >
        {safeSlides.map((slide, index) => {
          const image = (
            <Image
              alt={slide.alt}
              className="pointer-events-none block h-auto w-full"
              draggable={false}
              height={BANNER_HEIGHT}
              priority={index === 0}
              sizes="100vw"
              src={slide.imageUrl}
              unoptimized={slide.imageUrl.startsWith("/uploads/")}
              width={BANNER_WIDTH}
            />
          );

          return (
            <div key={slide.id} className="relative w-full shrink-0 grow-0 basis-full">
              {slide.linkUrl ? (
                <Link className="block" href={slide.linkUrl} onClick={(e) => e.stopPropagation()}>
                  {image}
                </Link>
              ) : (
                image
              )}
            </div>
          );
        })}
      </div>

      {safeSlides.length > 1 ? (
        <>
          <button
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-black/50 md:inline-flex"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            type="button"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-black/50 md:inline-flex"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            type="button"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      {safeSlides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-2.5 z-20 flex justify-center gap-1.5 sm:bottom-3 sm:gap-2">
          {safeSlides.map((slide, index) => (
            <button
              key={slide.id}
              aria-current={currentSlide === index ? "true" : undefined}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200 sm:h-2",
                currentSlide === index
                  ? "w-5 bg-white shadow-sm sm:w-6"
                  : "w-1.5 bg-white/55 active:bg-white/80 sm:w-2"
              )}
              onClick={(e) => {
                e.stopPropagation();
                goTo(index);
              }}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
