"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlignJustify,
  ArrowRight,
  Leaf,
  Search,
  ShoppingCart,
  UserCircle2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", subtitle: "Start your wellness journey" },
  { href: "/about", label: "About Us", subtitle: "Who we are and what we stand for" },
  { href: "/our-products", label: "Our Products", subtitle: "Discover our complete range" },
  { href: "/shop", label: "Shop", subtitle: "Browse and buy essentials" },
  { href: "/contact", label: "Contact Us", subtitle: "Talk to our support team" },
];

export function Navbar() {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.itemCount);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isLinkActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-transparent bg-white/95 backdrop-blur-sm transition-shadow duration-200",
        isScrolled && "shadow-md shadow-black/5 border-brand-green-100"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-900 shadow-sm">
            <Leaf className="h-6 w-6" />
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="font-heading text-lg font-semibold tracking-[0.18em] text-brand-green-900">
              WELL HEALTH
            </span>
            <span className="text-sm font-medium text-brand-green-600">
              TRADE INTERNATIONAL
            </span>
            <span className="text-xs italic text-neutral-500">
              Better Health, Better Life
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 xl:flex">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href);

            return (
              <Link
                key={link.href}
                className={cn(
                  "relative font-medium text-neutral-900 hover:text-brand-green-600",
                  isActive && "text-brand-green-600 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-brand-green-600"
                )}
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <label className="flex h-11 w-[18rem] items-center gap-2 rounded-full bg-neutral-100 px-4 text-neutral-500 shadow-sm ring-1 ring-transparent transition hover:ring-brand-green-100 focus-within:ring-brand-green-600/30">
            <Search className="h-4 w-4" />
            <input
              aria-label="Search site"
              className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
              placeholder="Search products"
              type="search"
            />
          </label>

          <button
            aria-label="Account"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-green-100 bg-white text-neutral-900 shadow-sm hover:border-brand-green-600/20 hover:text-brand-green-600"
            type="button"
          >
            <UserCircle2 className="h-5 w-5" />
          </button>

          <button
            aria-label="Cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-green-100 bg-white text-neutral-900 shadow-sm hover:border-brand-green-600/20 hover:text-brand-green-600"
            type="button"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-gold-accent px-1 text-[10px] font-semibold text-white shadow-sm">
              {itemCount}
            </span>
          </button>
        </div>

        <button
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-green-100 bg-white text-neutral-900 shadow-sm xl:hidden"
          onClick={() => setIsMenuOpen((value) => !value)}
          type="button"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <AlignJustify className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-200 xl:hidden",
          isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <button
          aria-label="Close menu"
          className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setIsMenuOpen(false)}
          type="button"
        />

        <aside
          className={cn(
            "relative flex h-full w-[min(90vw,24rem)] flex-col border-r border-brand-green-100 bg-neutral-100 px-5 pb-5 pt-6 shadow-[0_18px_40px_rgba(11,77,58,0.2)] transition-transform duration-200",
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-brand-green-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-900 shadow-sm">
                <Leaf className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-base font-semibold tracking-[0.14em] text-brand-green-900">
                  WELL HEALTH
                </p>
                <p className="text-xs font-medium text-brand-green-600">
                  TRADE INTERNATIONAL
                </p>
              </div>
            </div>

            <button
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-green-100 bg-white text-neutral-900 shadow-sm"
              onClick={() => setIsMenuOpen(false)}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 flex min-h-0 flex-1 flex-col justify-between gap-5">
            <nav className="space-y-3 overflow-y-auto pr-1">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.href);

                return (
                  <Link
                    key={link.href}
                    className={cn(
                      "group flex items-center justify-between rounded-2xl border border-brand-green-100 bg-white px-4 py-3 text-neutral-900 shadow-sm",
                      isActive && "border-brand-green-600/30 bg-brand-green-100"
                    )}
                    href={link.href}
                  >
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block truncate text-base font-semibold",
                          isActive ? "text-brand-green-700" : "text-neutral-900"
                        )}
                      >
                        {link.label}
                      </span>
                      <span className="block truncate pt-0.5 text-xs text-neutral-500">
                        {link.subtitle}
                      </span>
                    </span>
                    <ArrowRight
                      className={cn(
                        "h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200 group-hover:translate-x-0.5",
                        isActive && "text-brand-green-600"
                      )}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="grid gap-3 rounded-2xl border border-brand-green-100 bg-white p-4 text-sm text-neutral-900 shadow-sm">
              <label className="flex h-11 items-center gap-2 rounded-full bg-neutral-100 px-4 ring-1 ring-brand-green-100/60">
                <Search className="h-4 w-4 text-neutral-500" />
                <input
                  aria-label="Search site mobile"
                  className="w-full bg-transparent text-sm placeholder:text-neutral-500 focus:outline-none"
                  placeholder="Search products"
                  type="search"
                />
              </label>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm"
                type="button"
              >
                <ShoppingCart className="h-4 w-4" />
                Cart ({itemCount})
              </button>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}