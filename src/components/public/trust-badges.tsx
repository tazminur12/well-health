import {
  Award,
  BadgeCheck,
  FlaskConical,
  Microscope,
  ShieldCheck,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import type { AdminTrustBadge } from "@/lib/content/mapper";

const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  BadgeCheck,
  FlaskConical,
  Stethoscope,
  Award,
  Microscope,
};

const fallbackBadges: AdminTrustBadge[] = [
  {
    id: "1",
    iconKey: "ShieldCheck",
    title: "Premium Quality",
    description: "Lab Tested Products",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "2",
    iconKey: "BadgeCheck",
    title: "GMP Certified",
    description: "Manufacturing",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "3",
    iconKey: "FlaskConical",
    title: "Scientifically Formulated",
    description: "For Better Results",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "4",
    iconKey: "Stethoscope",
    title: "Trusted by Doctors",
    description: "Recommended",
    sortOrder: 3,
    isActive: true,
  },
];

type TrustBadgesProps = {
  badges?: AdminTrustBadge[];
};

export function TrustBadges({ badges }: TrustBadgesProps) {
  const items = badges && badges.length > 0 ? badges : fallbackBadges;

  return (
    <section className="relative border-b border-brand-green-100/60 bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,_rgba(232,245,238,0.55)_0%,_rgba(255,255,255,1)_100%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {items.map((badge) => {
            const Icon = iconMap[badge.iconKey] ?? ShieldCheck;
            return (
              <article
                key={badge.id}
                className="group flex min-h-[7.25rem] flex-col items-start gap-3 rounded-2xl border border-brand-green-100 bg-white p-3.5 shadow-sm transition-all duration-200 active:scale-[0.99] active:bg-brand-green-100/50 hover:-translate-y-0.5 hover:border-brand-green-600/35 hover:shadow-md sm:min-h-0 sm:flex-row sm:items-start sm:gap-4 sm:p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green-100 text-brand-green-600 transition-transform duration-200 group-hover:scale-105 sm:h-12 sm:w-12 sm:rounded-full">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[13px] font-semibold leading-snug text-neutral-900 sm:text-base">
                    {badge.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-neutral-500 sm:text-sm sm:leading-6">
                    {badge.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
