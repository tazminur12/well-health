"use client";

import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type CustomerReview = {
  id: string;
  name: string;
  initials: string;
  location: string;
  rating: number;
  comment: string;
  product: string;
};

const reviews: CustomerReview[] = [
  {
    id: "1",
    name: "Ayesha Rahman",
    initials: "AR",
    location: "Dhaka",
    rating: 5,
    comment:
      "Eyecare-B has become part of my daily routine. Packaging feels premium and delivery was quick.",
    product: "Eyecare-B",
  },
  {
    id: "2",
    name: "Tanvir Hasan",
    initials: "TH",
    location: "Chattogram",
    rating: 5,
    comment:
      "Honestly impressed by the quality. Omega Softgels are easy to take and the brand feels trustworthy.",
    product: "Omega 3 Softgels",
  },
  {
    id: "3",
    name: "Nusrat Jahan",
    initials: "NJ",
    location: "Sylhet",
    rating: 4,
    comment:
      "Good value and clear product information. Customer support answered my questions patiently.",
    product: "Multivitamin Daily",
  },
  {
    id: "4",
    name: "Rakib Ahmed",
    initials: "RA",
    location: "Rajshahi",
    rating: 5,
    comment:
      "Brain Health Syrup was easy for my family to use. Will order again from Well Health.",
    product: "Brain Health Syrup",
  },
  {
    id: "5",
    name: "Farhana Akter",
    initials: "FA",
    location: "Khulna",
    rating: 5,
    comment:
      "Ordered twice already. Products arrived sealed and fresh. Highly recommend for daily wellness.",
    product: "Eyecare-B",
  },
  {
    id: "6",
    name: "Imran Hossain",
    initials: "IH",
    location: "Gazipur",
    rating: 4,
    comment:
      "Nice packaging and reliable delivery. The vitamins feel like a solid everyday choice.",
    product: "Multivitamin Daily",
  },
  {
    id: "7",
    name: "Sadia Islam",
    initials: "SI",
    location: "Barishal",
    rating: 5,
    comment:
      "Softgels are easy to swallow and I noticed better consistency in my routine within weeks.",
    product: "Omega 3 Softgels",
  },
  {
    id: "8",
    name: "Mahmudul Hasan",
    initials: "MH",
    location: "Mymensingh",
    rating: 5,
    comment:
      "Trustworthy brand. Checkout was simple and support confirmed my order details quickly.",
    product: "Brain Health Syrup",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div
      aria-label={`${rating} out of 5 stars`}
      className="flex items-center gap-0.5 text-brand-green-600"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "h-3.5 w-3.5 sm:h-4 sm:w-4",
            index < rating ? "fill-current" : "text-neutral-300"
          )}
        />
      ))}
    </div>
  );
}

function usePerView() {
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      if (width >= 1024) setPerView(3);
      else if (width >= 640) setPerView(2);
      else setPerView(1);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return perView;
}

export function CustomerReviews() {
  const perView = usePerView();
  const maxIndex = Math.max(0, reviews.length - perView);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = (next: number) => {
    setIndex(Math.min(maxIndex, Math.max(0, next)));
    setDragPx(0);
  };

  const goPrev = () => goTo(index - 1);
  const goNext = () => goTo(index + 1);

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused || isDragging || maxIndex === 0) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, 4500);

    return () => window.clearInterval(timer);
  }, [isPaused, isDragging, maxIndex]);

  const onPointerDown = (clientX: number) => {
    setIsDragging(true);
    setIsPaused(true);
    startX.current = clientX;
    setDragPx(0);
  };

  const onPointerMove = (clientX: number) => {
    if (!isDragging) return;
    setDragPx(clientX - startX.current);
  };

  const onPointerUp = (clientX: number) => {
    if (!isDragging) return;
    const diff = startX.current - clientX;
    const width = trackRef.current?.offsetWidth ?? 320;

    if (Math.abs(diff) > width * 0.18) {
      if (diff > 0) goNext();
      else goPrev();
    } else {
      setDragPx(0);
    }

    setIsDragging(false);
    setIsPaused(false);
  };

  const slidePercent = 100 / perView;
  const dragPercent =
    trackRef.current && trackRef.current.offsetWidth > 0
      ? (dragPx / trackRef.current.offsetWidth) * 100
      : 0;

  const pageCount = maxIndex + 1;

  return (
    <section
      className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-24"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(22,135,93,0.05),_transparent_50%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5 sm:space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
              Testimonials
            </p>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl">
              Customer Reviews
            </h2>
            <p className="max-w-md text-sm leading-7 text-neutral-500 sm:text-base">
              Real feedback from customers who trust Well Health for everyday wellness.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-brand-green-100 bg-brand-green-100/40 px-4 py-3">
              <div>
                <p className="text-2xl font-bold leading-none text-brand-green-600">4.8</p>
                <Stars rating={5} />
              </div>
              <div className="min-w-0 border-l border-brand-green-200 pl-3">
                <p className="text-sm font-semibold text-neutral-900">Average rating</p>
                <p className="text-xs text-neutral-500">Based on 120+ reviews</p>
              </div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                aria-label="Previous reviews"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm transition-all duration-200 active:scale-95 hover:border-brand-green-600 hover:text-brand-green-600 disabled:opacity-40"
                disabled={index === 0}
                onClick={goPrev}
                type="button"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                aria-label="Next reviews"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm transition-all duration-200 active:scale-95 hover:border-brand-green-600 hover:text-brand-green-600 disabled:opacity-40"
                disabled={index >= maxIndex}
                onClick={goNext}
                type="button"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div
          aria-label="Customer reviews slider"
          aria-roledescription="carousel"
          className="relative select-none"
          onMouseDown={(e) => {
            e.preventDefault();
            onPointerDown(e.clientX);
          }}
          onMouseLeave={() => {
            if (isDragging) {
              setIsDragging(false);
              setDragPx(0);
              setIsPaused(false);
            }
          }}
          onMouseMove={(e) => onPointerMove(e.clientX)}
          onMouseUp={(e) => onPointerUp(e.clientX)}
          onTouchCancel={() => {
            setIsDragging(false);
            setDragPx(0);
            setIsPaused(false);
          }}
          onTouchEnd={(e) => onPointerUp(e.changedTouches[0].clientX)}
          onTouchMove={(e) => onPointerMove(e.touches[0].clientX)}
          onTouchStart={(e) => onPointerDown(e.touches[0].clientX)}
          ref={trackRef}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <div className="overflow-hidden">
            <div
              className="flex"
              style={{
                transform: `translateX(calc(-${index * slidePercent}% + ${dragPercent}%))`,
                transition: isDragging ? "none" : "transform 0.4s ease-out",
              }}
            >
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="shrink-0 grow-0 px-1.5 sm:px-2"
                  style={{ flexBasis: `${slidePercent}%`, width: `${slidePercent}%` }}
                >
                  <div className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <Stars rating={review.rating} />
                      <Quote className="h-4 w-4 shrink-0 text-brand-green-600/40" aria-hidden />
                    </div>

                    <p className="flex-1 text-sm leading-6 text-neutral-600 sm:leading-7">
                      “{review.comment}”
                    </p>

                    <div className="mt-4 flex items-center gap-3 border-t border-neutral-100 pt-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green-100 text-sm font-semibold text-brand-green-600">
                        {review.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-900">
                          {review.name}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                          {review.location}
                          <span className="mx-1 text-neutral-300">·</span>
                          {review.product}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Mobile arrows */}
          <div className="mt-4 flex items-center justify-center gap-3 sm:hidden">
            <button
              aria-label="Previous reviews"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm transition-transform duration-200 active:scale-95 disabled:opacity-40"
              disabled={index === 0}
              onClick={goPrev}
              type="button"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next reviews"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm transition-transform duration-200 active:scale-95 disabled:opacity-40"
              disabled={index >= maxIndex}
              onClick={goNext}
              type="button"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex justify-center gap-1.5 sm:mt-5">
            {Array.from({ length: pageCount }, (_, page) => (
              <button
                key={page}
                aria-current={index === page ? "true" : undefined}
                aria-label={`Go to reviews page ${page + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200 sm:h-2",
                  index === page
                    ? "w-5 bg-brand-green-600 sm:w-6"
                    : "w-1.5 bg-neutral-300 active:bg-brand-green-600/70 sm:w-2"
                )}
                onClick={() => goTo(page)}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
