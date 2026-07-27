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
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  BadgeCheck,
  FlaskConical,
  Stethoscope,
  Award,
  Microscope,
};

/** Clinical-premium gradient palettes — green + gold, rotated per card */
const cardTones = [
  {
    panel: "from-[#0B4D3A] via-[#127A56] to-[#16875D]",
    soft: "from-[#E8F5EE] via-[#F4FAF7] to-white",
    icon: "from-[#0B4D3A] to-[#16875D]",
    glow: "bg-[#16875D]/25",
    accent: "from-[#C9A24B] via-[#E0C378] to-transparent",
    number: "text-[#C9A24B]",
    title: "text-neutral-900",
    desc: "text-neutral-500",
    mode: "light" as const,
  },
  {
    panel: "from-[#A8843A] via-[#C9A24B] to-[#E0C378]",
    soft: "from-[#FBF6EB] via-[#F8F1E3] to-white",
    icon: "from-[#8A6D2D] to-[#C9A24B]",
    glow: "bg-[#C9A24B]/30",
    accent: "from-[#0B4D3A] via-[#16875D] to-transparent",
    number: "text-[#A8843A]",
    title: "text-neutral-900",
    desc: "text-neutral-500",
    mode: "light" as const,
  },
  {
    panel: "from-[#0F766E] via-[#16875D] to-[#34D399]",
    soft: "from-[#E6F4F0] via-[#F3FAF7] to-white",
    icon: "from-[#0F766E] to-[#16875D]",
    glow: "bg-emerald-400/25",
    accent: "from-[#C9A24B] via-[#F5E6C0] to-transparent",
    number: "text-[#16875D]",
    title: "text-neutral-900",
    desc: "text-neutral-500",
    mode: "light" as const,
  },
  {
    panel: "from-[#0B4D3A] via-[#16875D] to-[#C9A24B]",
    soft: "from-[#F3F0E8] via-[#F7F8F9] to-white",
    icon: "from-[#0B4D3A] to-[#C9A24B]",
    glow: "bg-[#C9A24B]/20",
    accent: "from-[#C9A24B] via-[#16875D] to-transparent",
    number: "text-[#A8843A]",
    title: "text-neutral-900",
    desc: "text-neutral-500",
    mode: "light" as const,
  },
];

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
  /** Kept for About page compatibility — both variants now use premium gradients */
  variant?: "default" | "premium";
  /** Skip outer section chrome when nested in a parent section */
  embedded?: boolean;
};

export function TrustBadges({
  badges,
  variant = "default",
  embedded = false,
}: TrustBadgesProps) {
  const items = badges && badges.length > 0 ? badges : fallbackBadges;
  const isPremiumLayout = variant === "premium";

  const grid = (
    <div
      className={cn(
        "grid gap-3 sm:gap-4 lg:gap-5",
        isPremiumLayout
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-2 lg:grid-cols-4"
      )}
    >
      {items.map((badge, index) => {
        const Icon = iconMap[badge.iconKey] ?? ShieldCheck;
        const tone = cardTones[index % cardTones.length]!;

        return (
          <article
            key={badge.id}
            className={cn(
              "group relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br p-[1px] shadow-[0_12px_36px_rgba(15,23,42,0.06)] transition-all duration-300",
              "hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(11,77,58,0.14)]",
              tone.panel
            )}
          >
            {/* Inner soft panel */}
            <div
              className={cn(
                "relative flex h-full flex-col overflow-hidden rounded-[1.3rem] bg-gradient-to-br p-3.5 sm:p-5",
                tone.soft,
                isPremiumLayout ? "min-h-[11.5rem]" : "min-h-[7.5rem] sm:min-h-[9.5rem]"
              )}
            >
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100",
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
                    "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_10px_24px_rgba(11,77,58,0.22)] transition-transform duration-300 group-hover:scale-105",
                    isPremiumLayout ? "h-12 w-12" : "h-10 w-10 sm:h-12 sm:w-12",
                    tone.icon
                  )}
                >
                  <Icon
                    className={cn(isPremiumLayout ? "h-5 w-5" : "h-4 w-4 sm:h-5 sm:w-5")}
                    strokeWidth={1.75}
                  />
                </div>
                <span
                  className={cn(
                    "font-heading font-semibold tracking-[0.14em]",
                    isPremiumLayout ? "text-xs" : "text-[10px] sm:text-xs",
                    tone.number
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="relative mt-auto pt-3 sm:pt-4">
                <h3
                  className={cn(
                    "font-heading font-bold tracking-tight",
                    isPremiumLayout
                      ? "text-base sm:text-[1.05rem]"
                      : "text-[13px] leading-snug sm:text-base",
                    tone.title
                  )}
                >
                  {badge.title}
                </h3>
                <p
                  className={cn(
                    "mt-1.5 leading-5 sm:mt-2 sm:leading-6",
                    isPremiumLayout ? "text-sm" : "text-xs sm:text-sm",
                    tone.desc
                  )}
                >
                  {badge.description}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );

  if (embedded) {
    return grid;
  }

  return (
    <section className="relative overflow-hidden border-b border-brand-green-100/60 bg-gradient-to-b from-[#F7F8F9] via-white to-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,162,75,0.08),_transparent_45%),radial-gradient(ellipse_at_bottom,_rgba(22,135,93,0.06),_transparent_50%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-11">
        {grid}
      </div>
    </section>
  );
}
