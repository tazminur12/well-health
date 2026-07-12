import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Gem,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Target,
  type LucideIcon,
} from "lucide-react";

import type { AboutHomeContent } from "@/lib/content/schemas";
import { defaultAboutHome } from "@/lib/content/mapper";

const featureIconMap: Record<string, LucideIcon> = {
  Target,
  Gem,
  HeartHandshake,
  Award,
  Leaf,
  ShieldCheck,
  BadgeCheck,
};

type AboutSectionProps = {
  content?: AboutHomeContent;
};

export function AboutSection({ content }: AboutSectionProps) {
  const data = content ?? defaultAboutHome;

  return (
    <section className="relative overflow-hidden bg-[#F7F8F9] py-12 sm:py-16 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(22,135,93,0.08),_transparent_45%),radial-gradient(ellipse_at_bottom_right,_rgba(201,162,75,0.06),_transparent_40%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_50px_rgba(11,77,58,0.08)] ring-1 ring-brand-green-100/80 sm:rounded-3xl">
              <div className="relative aspect-[4/3] w-full sm:aspect-[5/4] lg:aspect-[4/3]">
                <Image
                  alt={data.imageAlt}
                  className="object-cover"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src={data.imageUrl}
                  unoptimized={data.imageUrl.startsWith("/uploads/")}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-brand-green-900/35 via-transparent to-transparent"
                />
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-auto">
              <div className="inline-flex max-w-full items-center gap-2.5 rounded-xl border border-white/60 bg-white/95 px-3.5 py-2.5 shadow-md backdrop-blur-sm sm:px-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-green-100 text-brand-green-600">
                  <Award className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-neutral-900">
                    Science-backed wellness
                  </span>
                  <span className="block truncate text-xs text-neutral-500">
                    Trusted across Bangladesh
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-5 sm:space-y-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
              {data.eyebrow}
            </p>

            <div className="space-y-3 sm:space-y-4">
              <h2 className="font-heading text-[1.75rem] font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-[2.5rem]">
                {data.heading}
              </h2>
              <p className="max-w-xl text-[15px] leading-7 text-neutral-500 sm:text-base sm:leading-8 lg:text-lg">
                {data.description}
              </p>
            </div>

            {data.highlights.length > 0 ? (
              <ul className="space-y-2.5 text-sm text-neutral-700 sm:text-[15px]">
                {data.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <Link
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-6 text-sm font-semibold tracking-wide text-white shadow-sm transition-all duration-200 active:scale-[0.98] active:bg-brand-green-900 hover:bg-brand-green-900 sm:w-auto sm:min-w-[10.5rem]"
              href={data.ctaHref || "/about"}
            >
              {data.ctaLabel || "Read More"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {data.features.length > 0 ? (
          <div className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:mt-16 lg:grid-cols-4">
            {data.features.map((feature) => {
              const Icon = featureIconMap[feature.iconKey] ?? Award;
              return (
                <article
                  key={feature.title}
                  className="group flex min-h-[5.5rem] items-start gap-3.5 rounded-2xl border border-brand-green-100/80 bg-white p-4 shadow-sm transition-all duration-200 active:bg-brand-green-100/40 hover:-translate-y-0.5 hover:border-brand-green-600/40 hover:shadow-md sm:min-h-0 sm:flex-col sm:gap-4 sm:p-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green-100 text-brand-green-600 transition-transform duration-200 group-hover:scale-105 sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold text-neutral-900 sm:text-base">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-neutral-500">{feature.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
