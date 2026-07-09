import Link from "next/link";
import type { ReactNode } from "react";

type CTABannerProps = {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  href?: string;
  buttonClassName?: string;
  buttonIcon?: ReactNode;
};

export function CTABanner({
  title = "Ready to Start Your Wellness Journey?",
  subtitle = "Explore premium supplements built with care, quality, and science at the center.",
  buttonLabel = "Shop Now",
  href = "/shop",
  buttonClassName = "bg-gold-accent text-brand-green-900 hover:bg-[#b88f3f]",
  buttonIcon,
}: CTABannerProps) {
  return (
    <section className="bg-brand-green-900 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-8 text-white/80 sm:text-lg">
            {subtitle}
          </p>

          <div className="mt-8">
            <Link
              className={`inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${buttonClassName}`}
              href={href}
            >
              {buttonIcon ? <span className="mr-2">{buttonIcon}</span> : null}
              {buttonLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}