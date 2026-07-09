"use client";

import Link from "next/link";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Eye,
  Leaf,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Slide = {
  eyebrow: string;
  headlinePrimary: string;
  headlineAccent: string;
  subheading: string;
  primaryCta: string;
  secondaryCta: string;
  products: Array<{
    label: string;
    sublabel: string;
    icon: typeof Eye;
    tone: string;
    accent: string;
    className: string;
  }>;
};

const slides: Slide[] = [
  {
    eyebrow: "Clinical premium wellness",
    headlinePrimary: "Better Health",
    headlineAccent: "Better Life",
    subheading:
      "High Quality Supplements for a Healthy and Brighter Tomorrow",
    primaryCta: "SHOP NOW",
    secondaryCta: "LEARN MORE",
    products: [
      {
        label: "Eyecare-B",
        sublabel: "Vision support",
        icon: Eye,
        tone: "from-emerald-100 to-white",
        accent: "text-brand-green-600",
        className: "translate-y-3 -rotate-6",
      },
      {
        label: "Brain Health Syrup",
        sublabel: "Cognitive wellness",
        icon: Brain,
        tone: "from-white to-brand-green-100/75",
        accent: "text-brand-green-900",
        className: "z-10 -translate-y-3",
      },
      {
        label: "Omega 3",
        sublabel: "Daily balance",
        icon: ShieldCheck,
        tone: "from-amber-50 to-white",
        accent: "text-gold-accent",
        className: "translate-y-2 rotate-6",
      },
    ],
  },
  {
    eyebrow: "Nature-backed formulations",
    headlinePrimary: "Fuel Everyday",
    headlineAccent: "Wellbeing",
    subheading:
      "Carefully selected supplements designed for balanced routines and consistent results.",
    primaryCta: "EXPLORE FORMULAS",
    secondaryCta: "SEE INGREDIENTS",
    products: [
      {
        label: "Immune Shield",
        sublabel: "Daily defense",
        icon: ShieldCheck,
        tone: "from-white to-emerald-100/80",
        accent: "text-brand-green-600",
        className: "translate-y-3 -rotate-6",
      },
      {
        label: "Mind Boost",
        sublabel: "Focus support",
        icon: Sparkles,
        tone: "from-brand-green-100/70 to-white",
        accent: "text-brand-green-900",
        className: "z-10 -translate-y-3",
      },
      {
        label: "Omega Softgels",
        sublabel: "Heart care",
        icon: Leaf,
        tone: "from-amber-50 to-white",
        accent: "text-gold-accent",
        className: "translate-y-2 rotate-6",
      },
    ],
  },
  {
    eyebrow: "Trusted supplement essentials",
    headlinePrimary: "Healthy Routines",
    headlineAccent: "Made Simple",
    subheading:
      "Build a reliable wellness habit with premium products built for daily use.",
    primaryCta: "BUILD YOUR KIT",
    secondaryCta: "TALK TO US",
    products: [
      {
        label: "Eye Defense",
        sublabel: "Screen care",
        icon: Eye,
        tone: "from-white to-brand-green-100/70",
        accent: "text-brand-green-600",
        className: "translate-y-3 -rotate-6",
      },
      {
        label: "Daily Balance",
        sublabel: "Complete support",
        icon: Sparkles,
        tone: "from-emerald-100/80 to-white",
        accent: "text-brand-green-900",
        className: "z-10 -translate-y-3",
      },
      {
        label: "Omega Care",
        sublabel: "Healthy fats",
        icon: ShieldCheck,
        tone: "from-amber-50 to-white",
        accent: "text-gold-accent",
        className: "translate-y-2 rotate-6",
      },
    ],
  },
];

export function HeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const trackPositionClasses = [
    "translate-x-0",
    "-translate-x-full",
    "-translate-x-[200%]",
  ];

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <section
      aria-label="Hero slider"
      className="overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(22,135,93,0.16),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(201,162,75,0.12),_transparent_28%),linear-gradient(135deg,_#eef8f2_0%,_#ffffff_52%,_#f8fbf9_100%)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-brand-green-100/80 bg-white/70 shadow-[0_24px_70px_rgba(11,77,58,0.08)] backdrop-blur-sm">
          <button
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-brand-green-100 bg-white text-neutral-900 shadow-sm hover:-translate-y-[calc(50%+2px)] hover:shadow-md sm:left-5"
            onClick={() =>
              setActiveSlide((current) => (current - 1 + slides.length) % slides.length)
            }
            type="button"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-brand-green-100 bg-white text-neutral-900 shadow-sm hover:-translate-y-[calc(50%+2px)] hover:shadow-md sm:right-5"
            onClick={() =>
              setActiveSlide((current) => (current + 1) % slides.length)
            }
            type="button"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            className={cn(
              "flex transform transition-transform duration-500 ease-out",
              trackPositionClasses[activeSlide]
            )}
          >
            {slides.map((slide) => (
              <article key={slide.headlinePrimary} className="w-full shrink-0">
                <div className="grid gap-10 px-6 py-10 sm:px-8 sm:py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-8 lg:px-12 lg:py-14 xl:px-16">
                  <div className="max-w-2xl space-y-6 lg:pr-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-brand-green-100 bg-brand-green-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-green-600 shadow-sm">
                      <Leaf className="h-3.5 w-3.5" />
                      {slide.eyebrow}
                    </div>

                    <div className="space-y-2">
                      <h1 className="font-heading text-5xl font-bold leading-[0.95] tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl">
                        <span className="block">{slide.headlinePrimary}</span>
                        <span className="block text-brand-green-600">
                          {slide.headlineAccent}
                        </span>
                      </h1>

                      <p className="max-w-xl text-lg leading-8 text-neutral-500">
                        {slide.subheading}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Link
                        className="inline-flex items-center justify-center rounded-lg bg-brand-green-600 px-8 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-sm hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
                        href="/shop"
                      >
                        {slide.primaryCta}
                      </Link>
                      <Link
                        className="inline-flex items-center justify-center rounded-lg border border-brand-green-600 px-8 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-green-600 hover:-translate-y-0.5 hover:bg-brand-green-100 hover:shadow-sm"
                        href="/about"
                      >
                        {slide.secondaryCta}
                      </Link>
                    </div>
                  </div>

                  <div className="relative min-h-[24rem] lg:min-h-[34rem]">
                    <div className="absolute left-5 top-8 h-28 w-28 rounded-full bg-brand-green-100/55 blur-3xl" />
                    <div className="absolute right-4 top-12 h-24 w-24 rounded-full bg-gold-accent/18 blur-3xl" />
                    <div className="absolute bottom-8 left-8 h-20 w-20 rounded-full bg-brand-green-600/10 blur-2xl" />

                    <div className="absolute inset-x-8 bottom-10 h-24 rounded-full bg-gradient-to-b from-[#d6b894] to-[#9b6a42] shadow-[0_18px_40px_rgba(88,56,28,0.18)] sm:inset-x-14 lg:bottom-16" />

                    <div className="absolute left-1/2 top-1/2 grid w-[min(24rem,88%)] -translate-x-1/2 -translate-y-[42%] grid-cols-3 items-end gap-3 sm:w-[min(30rem,88%)] lg:w-[min(34rem,88%)]">
                      {slide.products.map((product) => {
                        const Icon = product.icon;

                        return (
                          <div
                            key={product.label}
                            className={cn(
                              "rounded-[1.6rem] border border-white/80 bg-gradient-to-b p-4 shadow-[0_18px_40px_rgba(11,77,58,0.12)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(11,77,58,0.16)]",
                              product.tone,
                              product.className
                            )}
                          >
                            <div className="space-y-3 text-center">
                              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                                <Icon className={cn("h-7 w-7", product.accent)} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-neutral-900">
                                  {product.label}
                                </p>
                                <p className="mt-1 text-xs text-neutral-500">
                                  {product.sublabel}
                                </p>
                              </div>
                              <div className="mx-auto h-10 w-full rounded-[1rem] bg-white/70" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.headlinePrimary}
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-200",
                  activeSlide === index ? "w-8 bg-brand-green-600" : "w-2.5 bg-neutral-300"
                )}
                onClick={() => setActiveSlide(index)}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}