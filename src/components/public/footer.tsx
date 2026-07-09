import {
  Facebook,
  Instagram,
  Linkedin,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";

import { cn } from "@/lib/utils";

const quickLinks = ["Home", "About", "Shop", "Contact", "Privacy Policy"];
const categories = ["Eye Care", "Brain Health", "Omega", "Vitamins"];
const socialLinks = [
  { label: "Facebook", icon: Facebook },
  { label: "Instagram", icon: Instagram },
  { label: "LinkedIn", icon: Linkedin },
  { label: "YouTube", icon: Youtube },
];

export function Footer() {
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
              Premium health supplements with a clinical, trustworthy, and
              nature-backed identity built for everyday wellbeing.
            </p>

            <div className="flex items-center gap-2">
              {socialLinks.map(({ label, icon: Icon }) => (
                <a
                  key={label}
                  aria-label={label}
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/85 shadow-sm hover:bg-white/10 hover:text-white"
                  )}
                  href="#"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/75">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a className="hover:text-white" href="#">
                    {link}
                  </a>
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
                <li key={category}>
                  <a className="hover:text-white" href="#">
                    {category}
                  </a>
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
                <span>House 24, Road 12, Dhanmondi, Dhaka, Bangladesh</span>
              </p>
              <a className="flex items-center gap-2 hover:text-white" href="tel:+8801712345678">
                <Phone className="h-4 w-4" />
                <span>+880 1712 345 678</span>
              </a>
              <a className="flex items-center gap-2 hover:text-white" href="mailto:info@wellhealthint.com">
                <Mail className="h-4 w-4" />
                <span>info@wellhealthint.com</span>
              </a>
            </div>

            <form className="space-y-3">
              <label className="block text-sm text-white/80">
                Newsletter
              </label>
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
          <p>Copyright © 2026 Well Health Trade International. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}