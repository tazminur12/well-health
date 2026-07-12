import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Eye,
  FlaskConical,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { CTABanner } from "@/components/public/cta-banner";
import { PageHero } from "@/components/public/page-hero";
import { TrustBadges } from "@/components/public/trust-badges";
import { getPublicAboutHome } from "@/lib/content/public-queries";
import { cn } from "@/lib/utils";

const values = [
  {
    icon: ShieldCheck,
    title: "Uncompromising quality",
    description:
      "From ingredient selection to finished formulation, every batch is held to clinical-grade standards.",
    card: "from-[#E8F5EE] via-white to-[#F0F7F3]",
    bar: "from-[#0B4D3A] to-[#16875D]",
    iconWrap: "from-[#0B4D3A]/10 to-[#16875D]/15 text-brand-green-800",
    number: "text-brand-green-700/40",
  },
  {
    icon: HeartHandshake,
    title: "Integrity first",
    description:
      "Clear labeling, honest claims, and transparent practices that earn long-term customer trust.",
    card: "from-[#F5F0E6] via-white to-[#E8F5EE]",
    bar: "from-[#C9A24B] to-[#16875D]",
    iconWrap: "from-[#C9A24B]/15 to-[#16875D]/10 text-[#8B6B2E]",
    number: "text-[#C9A24B]/50",
  },
  {
    icon: Users,
    title: "Human care",
    description:
      "Support that feels personal — guidance for products, orders, and everyday wellness questions.",
    card: "from-[#E6F4F0] via-white to-[#EEF8F3]",
    bar: "from-[#0F766E] to-[#34D399]",
    iconWrap: "from-[#0F766E]/10 to-emerald-200/40 text-teal-800",
    number: "text-teal-700/35",
  },
  {
    icon: Sparkles,
    title: "Thoughtful innovation",
    description:
      "We improve continuously through science, feedback, and formulations that serve real needs.",
    card: "from-[#EEF8F3] via-white to-[#F5F0E6]",
    bar: "from-[#16875D] to-[#C9A24B]",
    iconWrap: "from-[#16875D]/12 to-[#C9A24B]/15 text-brand-green-800",
    number: "text-brand-green-600/35",
  },
];

const pillars = [
  {
    icon: FlaskConical,
    title: "Science-led formulas",
    text: "Evidence-minded compositions designed for clarity, safety, and measurable everyday benefit.",
    card: "from-[#E8F5EE] via-white to-[#F0F7F3]",
    bar: "from-[#0B4D3A] to-[#16875D]",
    iconWrap: "from-[#0B4D3A]/10 to-[#16875D]/15 text-brand-green-800",
    number: "text-brand-green-700/40",
  },
  {
    icon: Leaf,
    title: "Nature with discipline",
    text: "Botanical and nutrient sources chosen carefully — never as a shortcut for quality.",
    card: "from-[#F5F0E6] via-white to-[#E8F5EE]",
    bar: "from-[#C9A24B] to-[#16875D]",
    iconWrap: "from-[#C9A24B]/15 to-[#16875D]/10 text-[#8B6B2E]",
    number: "text-[#C9A24B]/50",
  },
  {
    icon: BadgeCheck,
    title: "Trusted delivery",
    text: "Reliable fulfilment across Bangladesh with packaging and service that protect product integrity.",
    card: "from-[#E6F4F0] via-white to-[#EEF8F3]",
    bar: "from-[#0F766E] to-[#34D399]",
    iconWrap: "from-[#0F766E]/10 to-emerald-200/40 text-teal-800",
    number: "text-teal-700/35",
  },
];

const team = [
  { name: "Mst. Ayesha Rahman", role: "Founder & CEO", tone: "from-[#E8F5EE] to-[#CFE8DC]" },
  { name: "Md. Tanvir Hasan", role: "Head of Quality", tone: "from-[#F5F0E6] to-[#E8D9B8]" },
  { name: "Nusrat Jahan", role: "Operations", tone: "from-[#EAF3FF] to-[#D5E4F7]" },
  { name: "Rakib Ahmed", role: "Customer Relations", tone: "from-[#F3F0FF] to-[#E2DAFB]" },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export async function AboutPageContent() {
  const about = await getPublicAboutHome();

  return (
    <div className="bg-[#F7F8F9] text-neutral-900">
      <PageHero
        crumbLabel="About Us"
        description="Science-backed supplements, nature-minded care, and a promise of trust for families across Bangladesh."
        eyebrow="Well Health Trade International"
        title="Better Health, Better Life"
        tone="about"
      />

      {/* Brand story — editorial, premium */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,162,75,0.08),_transparent_42%),radial-gradient(ellipse_at_bottom_left,_rgba(22,135,93,0.07),_transparent_40%)]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="order-2 space-y-7 lg:order-1">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
                Who we are
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                A clinical premium brand built for lasting trust
              </h2>
              <div className="h-1 w-20 rounded-full bg-gradient-to-r from-brand-green-600 to-[#C9A24B]" />
              <div className="space-y-5 text-base leading-8 text-neutral-600 sm:text-lg sm:leading-9">
                <p>
                  {about.description ||
                    "Well Health Trade International is dedicated to improving lives through high-quality, safe, and effective health supplements. Our work is rooted in trust and shaped by science-backed wellness."}
                </p>
                <p>
                  Founded for Bangladesh&apos;s evolving wellness needs, we focus on dependable
                  formulations, responsible sourcing, and a customer experience that feels clear,
                  caring, and credible.
                </p>
                <p>
                  Every product decision is made with long-term health in mind — combining modern
                  standards with deep respect for the people we serve.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
                  href="/shop"
                >
                  Explore products
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:border-brand-green-200 hover:bg-brand-green-50 hover:text-brand-green-800"
                  href="/contact"
                >
                  Talk to us
                </Link>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-brand-green-100/90 via-transparent to-[#C9A24B]/25 blur-sm" />
              <div className="relative overflow-hidden rounded-[1.75rem] bg-white shadow-[0_28px_70px_rgba(11,77,58,0.14)] ring-1 ring-brand-green-100/80">
                <div className="relative aspect-[4/5] w-full sm:aspect-[5/6] lg:aspect-[4/5]">
                  <Image
                    alt={about.imageAlt || "Well Health Trade International"}
                    className="object-cover"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    src={about.imageUrl}
                    unoptimized={about.imageUrl.startsWith("/uploads/")}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-brand-green-900/55 via-brand-green-900/10 to-transparent"
                  />
                </div>

                <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-auto">
                  <div className="inline-flex max-w-full items-center gap-3 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green-100 text-brand-green-700">
                      <Award className="h-5 w-5" />
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

              <div className="absolute -bottom-4 -right-2 hidden rounded-2xl bg-gradient-to-br from-[#0B4D3A] to-[#16875D] px-4 py-3 text-white shadow-xl sm:block lg:-right-4">
                <p className="font-heading text-lg font-bold text-[#F5E6C0]">Premium</p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/75">
                  Clinical care
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promise band */}
      <section className="relative overflow-hidden bg-brand-green-900 py-14 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(201,162,75,0.18),_transparent_45%)]"
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#C9A24B]">
            Our promise
          </p>
          <p className="mt-4 font-heading text-2xl font-bold leading-snug text-white sm:text-3xl sm:leading-snug">
            We never trade credibility for shortcuts — every formula, pack, and delivery
            should feel worthy of your trust.
          </p>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
              Direction
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Mission & vision
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <article className="group relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-green-600 to-brand-green-900 p-8 text-white shadow-[0_20px_50px_rgba(11,77,58,0.18)] sm:p-10">
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#C9A24B]/20 blur-2xl transition-transform duration-500 group-hover:scale-110"
              />
              <div className="relative">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                  <Target className="h-5 w-5 text-[#F5E6C0]" />
                </span>
                <h3 className="mt-6 font-heading text-2xl font-bold tracking-tight">
                  Our Mission
                </h3>
                <p className="mt-4 text-base leading-8 text-white/85">
                  To improve lives across Bangladesh with high-quality, safe, and effective
                  health supplements — backed by science and delivered with care. We make
                  wellness accessible, trustworthy, and consistent.
                </p>
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-10">
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-green-600 via-[#C9A24B] to-brand-green-600"
              />
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green-50 text-brand-green-700 ring-1 ring-brand-green-100">
                <Eye className="h-5 w-5" />
              </span>
              <h3 className="mt-6 font-heading text-2xl font-bold tracking-tight text-neutral-900">
                Our Vision
              </h3>
              <p className="mt-4 text-base leading-8 text-neutral-600">
                To become the wellness brand Bangladesh trusts most — through transparent
                practices, continuous improvement, and products people can rely on every day.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-y border-brand-green-100/70 bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
              How we work
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Three pillars of premium care
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            {pillars.map((pillar, index) => (
              <article
                className={cn(
                  "group relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-7 shadow-[0_12px_36px_rgba(15,23,42,0.05)] ring-1 ring-neutral-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(22,135,93,0.1)] sm:p-8",
                  pillar.card
                )}
                key={pillar.title}
              >
                <div
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                    pillar.bar
                  )}
                />

                <div className="relative space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-white/80",
                        pillar.iconWrap
                      )}
                    >
                      <pillar.icon className="h-6 w-6" />
                    </span>
                    <p
                      className={cn(
                        "font-heading text-3xl font-bold tracking-tight",
                        pillar.number
                      )}
                    >
                      0{index + 1}
                    </p>
                  </div>

                  <h3 className="font-heading text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-7 text-neutral-600">{pillar.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
              Principles
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Values that guide every decision
            </h2>
            <p className="mt-4 text-base leading-8 text-neutral-500">
              Quiet standards. Clear priorities. No compromise on the things that matter.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {values.map((value, index) => (
              <article
                className={cn(
                  "group relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-7 shadow-[0_12px_36px_rgba(15,23,42,0.05)] ring-1 ring-neutral-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(22,135,93,0.1)] sm:p-8",
                  value.card
                )}
                key={value.title}
              >
                <div
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                    value.bar
                  )}
                />

                <div className="relative space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-white/80",
                        value.iconWrap
                      )}
                    >
                      <value.icon className="h-6 w-6" />
                    </span>
                    <p
                      className={cn(
                        "font-heading text-3xl font-bold tracking-tight",
                        value.number
                      )}
                    >
                      0{index + 1}
                    </p>
                  </div>

                  <h3 className="font-heading text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-7 text-neutral-600">{value.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
              Assurance
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-neutral-900">
              Signals you can feel
            </h2>
          </div>
          <TrustBadges />
        </div>
      </section>

      {/* Team */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(22,135,93,0.06),_transparent_55%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
              People
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              The team behind the brand
            </h2>
            <p className="mt-4 text-base leading-8 text-neutral-500">
              Quality, operations, and care — led by people who treat wellness as a
              responsibility.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {team.map((member) => (
              <article
                className="overflow-hidden rounded-2xl bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)] ring-1 ring-neutral-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(11,77,58,0.1)]"
                key={member.name}
              >
                <div
                  className={cn(
                    "flex aspect-[4/3] items-center justify-center bg-gradient-to-br",
                    member.tone
                  )}
                >
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 font-heading text-xl font-bold text-brand-green-800 shadow-sm ring-1 ring-white">
                    {initials(member.name)}
                  </span>
                </div>
                <div className="px-5 py-5 text-center">
                  <h3 className="font-heading text-base font-bold text-neutral-900">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm text-brand-green-700">{member.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        buttonLabel="Shop Well Health"
        subtitle="Discover clinically trusted supplements crafted for everyday wellbeing — premium quality, delivered with care."
        title="Begin your wellness journey"
      />
    </div>
  );
}
