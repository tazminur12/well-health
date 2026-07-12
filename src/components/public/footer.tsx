import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Youtube,
  type LucideIcon,
} from "lucide-react";

import {
  formatStoreAddress,
  phoneTelHref,
  type StoreSettings,
} from "@/lib/settings/schemas";
import { cn } from "@/lib/utils";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Shop", href: "/shop" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
const categories = [
  { label: "Eye Care", href: "/shop?category=eye-care" },
  { label: "Brain Health", href: "/shop?category=brain-health" },
  { label: "Omega", href: "/shop?category=omega" },
  { label: "Vitamins", href: "/shop?category=vitamins" },
];

const socialConfig: { key: keyof StoreSettings; label: string; icon: LucideIcon }[] = [
  { key: "facebookUrl", label: "Facebook", icon: Facebook },
  { key: "instagramUrl", label: "Instagram", icon: Instagram },
  { key: "linkedinUrl", label: "LinkedIn", icon: Linkedin },
  { key: "youtubeUrl", label: "YouTube", icon: Youtube },
];

type FooterProps = {
  settings: StoreSettings;
};

export function Footer({ settings }: FooterProps) {
  const socialLinks = socialConfig.filter((item) => Boolean(settings[item.key]));
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-green-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white shadow-sm">
                <Leaf className="h-6 w-6" />
              </span>
              <div>
                <p className="font-heading text-lg font-semibold tracking-[0.18em]">
                  WELL HEALTH
                </p>
                <p className="text-sm font-medium text-brand-green-100">
                  TRADE INTERNATIONAL
                </p>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-7 text-white/75">
              {settings.tagline ||
                "Premium health supplements with a clinical, trustworthy, and nature-backed identity built for everyday wellbeing."}
            </p>

            {socialLinks.length > 0 ? (
              <div className="flex items-center gap-2">
                {socialLinks.map(({ key, label, icon: Icon }) => (
                  <a
                    key={label}
                    aria-label={label}
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/85 shadow-sm hover:bg-white/10 hover:text-white"
                    )}
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

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/75">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link className="hover:text-white" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
              Categories
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/75">
              {categories.map((category) => (
                <li key={category.href}>
                  <Link className="hover:text-white" href={category.href}>
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
              Contact
            </h3>

            <div className="space-y-3 text-sm text-white/75">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formatStoreAddress(settings)}</span>
              </p>
              <a
                className="flex items-center gap-2 hover:text-white"
                href={phoneTelHref(settings.supportPhone)}
              >
                <Phone className="h-4 w-4" />
                <span>{settings.supportPhone}</span>
              </a>
              <a
                className="flex items-center gap-2 hover:text-white"
                href={`mailto:${settings.supportEmail}`}
              >
                <Mail className="h-4 w-4" />
                <span>{settings.supportEmail}</span>
              </a>
            </div>

            <form className="space-y-3">
              <label className="block text-sm text-white/80">Newsletter</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  aria-label="Newsletter email"
                  className="h-12 flex-1 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/50 shadow-sm outline-none ring-0 focus:border-gold-accent/60"
                  placeholder="Enter your email"
                  type="email"
                />
                <button
                  className="inline-flex h-12 items-center justify-center rounded-full bg-gold-accent px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#bb943e]"
                  type="submit"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-white/65">
          <p>
            Copyright © {year} {settings.storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
