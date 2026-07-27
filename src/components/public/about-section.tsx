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
import { cn } from "@/lib/utils";

const featureIconMap: Record<string, LucideIcon> = {
  Target,
  Gem,
  HeartHandshake,
  Award,
  Leaf,
  ShieldCheck,
  BadgeCheck,
};

const cardTones = [
  {
    border: "from-[#0B4D3A] via-[#127A56] to-[#16875D]",
    soft: "from-[#E8F5EE] via-[#F4FAF7] to-white",
    icon: "from-[#0B4D3A] to-[#16875D]",
    glow: "bg-[#16875D]/25",
    accent: "from-[#C9A24B] via-[#E0C378] to-transparent",
    number: "text-[#C9A24B]",
  },
  {
    border: "from-[#A8843A] via-[#C9A24B] to-[#E0C378]",
    soft: "from-[#FBF6EB] via-[#F8F1E3] to-white",
    icon: "from-[#8A6D2D] to-[#C9A24B]",
    glow: "bg-[#C9A24B]/30",
    accent: "from-[#0B4D3A] via-[#16875D] to-transparent",
    number: "text-[#A8843A]",
  },
  {
    border: "from-[#0F766E] via-[#16875D] to-[#34D399]",
    soft: "from-[#E6F4F0] via-[#F3FAF7] to-white",
    icon: "from-[#0F766E] to-[#16875D]",
    glow: "bg-emerald-400/25",
    accent: "from-[#C9A24B] via-[#F5E6C0] to-transparent",
    number: "text-[#16875D]",
  },
  {
    border: "from-[#0B4D3A] via-[#16875D] to-[#C9A24B]",
    soft: "from-[#F3F0E8] via-[#F7F8F9] to-white",
    icon: "from-[#0B4D3A] to-[#C9A24B]",
    glow: "bg-[#C9A24B]/20",
    accent: "from-[#C9A24B] via-[#16875D] to-transparent",
    number: "text-[#A8843A]",
  },
];

type AboutSectionProps = {
  content?: AboutHomeContent;
};

export function AboutSection({ content }: AboutSectionProps) {
  const data = content ?? defaultAboutHome;

  return (
    <section className="relative overflow-hidden bg-[#F7F8F9] py-12 sm:py-16 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(22,135,93,0.08),_transparent_45%),radial-gradient(ellipse_at_bottom_right,_rgba(201,162,75,0.08),_transparent_40%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <div className="relative">
            <div className="overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-[#0B4D3A] via-[#16875D] to-[#C9A24B] p-[1px] shadow-[0_18px_50px_rgba(11,77,58,0.12)] sm:rounded-3xl">
              <div className="overflow-hidden rounded-[1.3rem] bg-white sm:rounded-[1.4rem]">
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
                    className="absolute inset-0 bg-gradient-to-t from-brand-green-900/40 via-transparent to-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-auto">
              <div className="inline-flex max-w-full items-center gap-2.5 rounded-xl border border-white/70 bg-white/95 px-3.5 py-2.5 shadow-md backdrop-blur-sm sm:px-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0B4D3A] to-[#C9A24B] text-white shadow-sm">
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
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A8843A]">
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
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-[#16875D] to-[#C9A24B]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <Link
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0B4D3A] via-[#16875D] to-[#127A56] px-6 text-sm font-semibold tracking-wide text-white shadow-[0_10px_24px_rgba(11,77,58,0.25)] transition-all duration-200 active:scale-[0.98] hover:brightness-110 sm:w-auto sm:min-w-[10.5rem]"
              href={data.ctaHref || "/about"}
            >
              {data.ctaLabel || "Read More"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {data.features.length > 0 ? (
          <div className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:mt-16 lg:grid-cols-4">
            {data.features.map((feature, index) => {
              const Icon = featureIconMap[feature.iconKey] ?? Award;
              const tone = cardTones[index % cardTones.length]!;
              return (
                <article
                  key={feature.title}
                  className={cn(
                    "group relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br p-[1px] shadow-[0_12px_36px_rgba(15,23,42,0.06)] transition-all duration-300",
                    "hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(11,77,58,0.14)]",
                    tone.border
                  )}
                >
                  <div
                    className={cn(
                      "relative flex h-full min-h-[5.75rem] flex-col overflow-hidden rounded-[1.3rem] bg-gradient-to-br p-4 sm:min-h-[9.25rem] sm:p-5",
                      tone.soft
                    )}
                  >
                    <div
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl",
                        tone.glow
                      )}
                    />
                    <div
                      aria-hidden
                      className={cn(
                        "absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r opacity-90",
                        tone.accent
                      )}
                    />

                    <div className="relative flex items-start justify-between gap-2">
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_10px_24px_rgba(11,77,58,0.22)] transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12",
                          tone.icon
                        )}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </div>
                      <span
                        className={cn(
                          "font-heading text-[10px] font-semibold tracking-[0.14em] sm:text-xs",
                          tone.number
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="relative mt-auto pt-3 sm:pt-4">
                      <h3 className="font-heading text-[15px] font-bold tracking-tight text-neutral-900 sm:text-base">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-neutral-500">
                        {feature.description}
                      </p>
                    </div>
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
