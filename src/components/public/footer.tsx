import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
  Youtube,
  type LucideIcon,
} from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import {
  formatStoreAddress,
  phoneTelHref,
  type StoreSettings,
} from "@/lib/settings/schemas";
import { cn } from "@/lib/utils";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Product List", href: "/product-list" },
  { label: "Blog", href: "/blog" },
  { label: "About us", href: "/about" },
  { label: "Become a distributor", href: "/distributor" },
  { label: "Contact", href: "/contact" },
];

const supportLinks = [
  { label: "Help & support", href: "/contact" },
  { label: "My orders", href: "/orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of service", href: "/terms" },
];

const categoryLinks = [
  { label: "Eye Care", href: "/shop?category=eye-care" },
  { label: "Brain Health", href: "/shop?category=brain-health" },
  { label: "Omega", href: "/shop?category=omega" },
  { label: "Vitamins", href: "/shop?category=vitamins" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const socialConfig: { key: keyof StoreSettings; label: string; icon: LucideIcon }[] = [
  { key: "facebookUrl", label: "Facebook", icon: Facebook },
  { key: "instagramUrl", label: "Instagram", icon: Instagram },
  { key: "linkedinUrl", label: "LinkedIn", icon: Linkedin },
  { key: "youtubeUrl", label: "YouTube", icon: Youtube },
];

const trustItems = [
  { icon: ShieldCheck, label: "Lab-minded quality" },
  { icon: Truck, label: "Nationwide delivery" },
  { icon: Leaf, label: "Nature-backed formulas" },
];

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C9A24B]">
        {title}
      </h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      className="group inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors duration-200 hover:text-white"
      href={href}
    >
      <span className="h-px w-0 bg-[#C9A24B] transition-all duration-200 group-hover:w-3" />
      {children}
    </Link>
  );
}

type FooterProps = {
  settings: StoreSettings;
};

export function Footer({ settings }: FooterProps) {
  const socialLinks = socialConfig.filter((item) => Boolean(settings[item.key]));
  const year = new Date().getFullYear();
  const address = formatStoreAddress(settings);
  const whatsappDigits = settings.whatsapp?.replace(/\D/g, "") ?? "";
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits.replace(/^0/, "880")}`
    : "/contact";

  return (
    <footer className="relative overflow-hidden bg-[#062E24] text-white">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#16875D]/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[#C9A24B]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0B4D3A] via-[#C9A24B] to-[#16875D]"
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8 lg:pt-16">
        {/* Top CTA strip */}
        <div className="mb-12 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C9A24B]">
              Stay well informed
            </p>
            <p className="mt-2 font-heading text-xl font-bold tracking-tight text-white sm:text-2xl">
              Questions about products or delivery?
            </p>
            <p className="mt-1.5 text-sm leading-6 text-white/65">
              Our care team is ready — usually within one business day.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9A24B] px-5 py-3 text-sm font-semibold text-[#062E24] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#bb943e]"
              href="/contact"
            >
              Contact us
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
              href={whatsappHref}
              rel={whatsappDigits ? "noopener noreferrer" : undefined}
              target={whatsappDigits ? "_blank" : undefined}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Main columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-5 lg:col-span-4">
            <BrandLogo size="md" tone="dark" variant="lockup" />

            <p className="max-w-sm text-sm leading-7 text-white/65">
              Premium health supplements with clinical quality and nature-backed
              formulations for everyday wellbeing across Bangladesh.
            </p>

            {socialLinks.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {socialLinks.map(({ key, label, icon: Icon }) => (
                  <a
                    key={label}
                    aria-label={label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A24B]/40 hover:bg-white/10 hover:text-white"
                    href={String(settings[key])}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title="Explore">
              <ul className="space-y-3">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </FooterColumn>
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title="Categories">
              <ul className="space-y-3">
                {categoryLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </FooterColumn>
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title="Support">
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </FooterColumn>
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <FooterColumn title="Visit & call">
              <div className="space-y-4 text-sm text-white/70">
                <p className="flex items-start gap-2.5 leading-6">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A24B]" />
                  <span>{address}</span>
                </p>
                <a
                  className="flex items-center gap-2.5 transition-colors hover:text-white"
                  href={phoneTelHref(settings.supportPhone)}
                >
                  <Phone className="h-4 w-4 shrink-0 text-[#C9A24B]" />
                  <span>{settings.supportPhone}</span>
                </a>
                <a
                  className="flex items-center gap-2.5 break-all transition-colors hover:text-white"
                  href={`mailto:${settings.supportEmail}`}
                >
                  <Mail className="h-4 w-4 shrink-0 text-[#C9A24B]" />
                  <span>{settings.supportEmail}</span>
                </a>
                {settings.workingHours ? (
                  <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs leading-5 text-white/60">
                    <span className="font-semibold text-white/80">Hours · </span>
                    {settings.workingHours}
                  </p>
                ) : null}
              </div>
            </FooterColumn>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-12 grid gap-3 border-t border-white/10 py-8 sm:grid-cols-3">
          {trustItems.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C9A24B]/15 text-[#C9A24B]">
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-sm font-medium text-white/80">{label}</p>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.storeName}. All rights reserved.
          </p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {legalLinks.map((link, index) => (
              <span key={link.href} className="inline-flex items-center gap-4">
                {index > 0 ? <span className="hidden text-white/25 sm:inline">|</span> : null}
                <Link
                  className={cn(
                    "transition-colors duration-200 hover:text-white",
                    "underline-offset-4 hover:underline"
                  )}
                  href={link.href}
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
