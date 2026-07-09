import Link from "next/link";
import { Building2 } from "lucide-react";

import { CTABanner } from "@/components/public/cta-banner";
import { MissionVisionCards } from "@/components/public/mission-vision-cards";
import { TeamSection } from "@/components/public/team-section";
import { TrustBadges } from "@/components/public/trust-badges";
import { ValuesGrid } from "@/components/public/values-grid";

export default function AboutPage() {
  return (
    <div className="bg-white text-neutral-900">
      <section className="bg-[radial-gradient(circle_at_top_right,_rgba(22,135,93,0.12),_transparent_28%),linear-gradient(135deg,_#eef8f2_0%,_#ffffff_46%,_#f8fbf9_100%)] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <div className="text-sm text-neutral-500">
              <Link className="transition-colors duration-200 hover:text-brand-green-600" href="/">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-brand-green-600">About Us</span>
            </div>

            <div className="max-w-3xl space-y-4">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                About Us
              </h1>
              <p className="text-lg leading-8 text-neutral-500">
                Committed to Better Health, Better Life
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14">
            <div className="order-1 lg:order-1">
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md">
                <div className="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.12),_transparent_35%),linear-gradient(135deg,_#f4f5f4_0%,_#e5e7eb_100%)]">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/80 shadow-sm ring-1 ring-neutral-200">
                    <Building2 className="h-12 w-12 text-brand-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="order-2 space-y-6 lg:order-2">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-brand-green-600">
                Our Story
              </div>

              <div className="space-y-4">
                <h2 className="font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                  Who We Are
                </h2>

                <div className="space-y-4 text-base leading-8 text-neutral-500 sm:text-lg">
                  <p>
                    Well Health Trade International is a healthcare company dedicated to improving
                    lives through high quality, safe, and effective health supplements. Our work is
                    rooted in trust and shaped by a clear commitment to science-backed wellness.
                  </p>
                  <p>
                    Founded to support the Bangladeshi market’s evolving wellness needs, we focus on
                    dependable formulations, responsible sourcing, and a customer experience that
                    feels clear, caring, and credible.
                  </p>
                  <p>
                    Every product and every decision is made with long-term health in mind, combining
                    modern standards with a strong respect for the people we serve.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MissionVisionCards />
      <ValuesGrid />

      <section className="bg-neutral-100 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TrustBadges />
        </div>
      </section>

      <TeamSection />
      <CTABanner />
    </div>
  );
}