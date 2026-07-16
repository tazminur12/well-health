import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  BookOpen,
  Handshake,
  Info,
  Leaf,
  Mail,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type PageHeroTone = "shop" | "blog" | "about" | "contact" | "distributor";

const toneStyles: Record<
  PageHeroTone,
  {
    shell: string;
    orbA: string;
    orbB: string;
    orbC: string;
    badge: string;
    accentBar: string;
    iconWrap: string;
    crumbActive: string;
    Icon: LucideIcon;
  }
> = {
  shop: {
    shell: "from-[#0B4D3A] via-[#126B4C] to-[#16875D]",
    orbA: "bg-[#C9A24B]/25",
    orbB: "bg-emerald-300/20",
    orbC: "bg-white/10",
    badge: "bg-white/15 text-emerald-50 ring-white/20",
    accentBar: "from-[#C9A24B] via-emerald-300 to-white",
    iconWrap: "bg-white/15 text-white ring-white/25",
    crumbActive: "text-[#F5E6C0]",
    Icon: ShoppingBag,
  },
  blog: {
    shell: "from-[#0F766E] via-[#16875D] to-[#1A9B6C]",
    orbA: "bg-sky-300/20",
    orbB: "bg-[#C9A24B]/20",
    orbC: "bg-teal-200/15",
    badge: "bg-white/15 text-teal-50 ring-white/20",
    accentBar: "from-teal-200 via-[#C9A24B] to-white",
    iconWrap: "bg-white/15 text-white ring-white/25",
    crumbActive: "text-teal-100",
    Icon: BookOpen,
  },
  about: {
    shell: "from-[#0B4D3A] via-[#147A55] to-[#A8843A]",
    orbA: "bg-[#C9A24B]/30",
    orbB: "bg-emerald-200/20",
    orbC: "bg-amber-100/15",
    badge: "bg-white/15 text-amber-50 ring-white/20",
    accentBar: "from-[#C9A24B] via-amber-200 to-white",
    iconWrap: "bg-white/15 text-white ring-white/25",
    crumbActive: "text-[#F5E6C0]",
    Icon: Info,
  },
  contact: {
    shell: "from-[#115E4B] via-[#16875D] to-[#0E7490]",
    orbA: "bg-cyan-300/20",
    orbB: "bg-[#C9A24B]/20",
    orbC: "bg-emerald-200/15",
    badge: "bg-white/15 text-cyan-50 ring-white/20",
    accentBar: "from-cyan-200 via-emerald-300 to-[#C9A24B]",
    iconWrap: "bg-white/15 text-white ring-white/25",
    crumbActive: "text-cyan-100",
    Icon: Mail,
  },
  distributor: {
    shell: "from-[#0B4D3A] via-[#0F5C45] to-[#8B6914]",
    orbA: "bg-[#C9A24B]/35",
    orbB: "bg-emerald-300/20",
    orbC: "bg-amber-200/15",
    badge: "bg-white/15 text-[#F5E6C0] ring-white/20",
    accentBar: "from-[#C9A24B] via-amber-100 to-white",
    iconWrap: "bg-white/15 text-white ring-white/25",
    crumbActive: "text-[#F5E6C0]",
    Icon: Handshake,
  },
};

type PageHeroProps = {
  tone: PageHeroTone;
  eyebrow: string;
  title: string;
  description: string;
  crumbLabel: string;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function PageHero({
  tone,
  eyebrow,
  title,
  description,
  crumbLabel,
  actions,
  footer,
  className,
}: PageHeroProps) {
  const style = toneStyles[tone];
  const Icon = style.Icon;

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-br text-white",
        style.shell,
        className
      )}
    >
      {/* Soft colorful atmosphere */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full blur-3xl",
          style.orbA
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -bottom-28 right-0 h-80 w-80 rounded-full blur-3xl",
          style.orbB
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/3 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full blur-3xl",
          style.orbC
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.55) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-white/70">
          <Link className="transition-colors duration-200 hover:text-white" href="/">
            Home
          </Link>
          <span className="text-white/40">/</span>
          <span className={cn("font-medium", style.crumbActive)}>{crumbLabel}</span>
        </nav>

        <div
          className={cn(
            "mt-7 flex flex-col gap-8",
            actions ? "lg:flex-row lg:items-end lg:justify-between" : ""
          )}
        >
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-2xl ring-1 backdrop-blur-sm",
                  style.iconWrap
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ring-1 backdrop-blur-sm",
                  style.badge
                )}
              >
                <Sparkles className="h-3 w-3" />
                {eyebrow}
              </span>
            </div>

            <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
              {title}
            </h1>

            <div
              aria-hidden
              className={cn("h-1 w-24 rounded-full bg-gradient-to-r", style.accentBar)}
            />

            <p className="max-w-xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
              {description}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium text-white/75">
              <Leaf className="h-3.5 w-3.5 text-[#C9A24B]" />
              <span>Clinical premium · Nature-backed · Trusted in Bangladesh</span>
            </div>
          </div>

          {actions ? <div className="w-full max-w-md shrink-0">{actions}</div> : null}
        </div>

        {footer ? <div className="relative mt-8">{footer}</div> : null}
      </div>

      {/* Bottom wave fade into page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/15 to-transparent"
      />
    </section>
  );
}
