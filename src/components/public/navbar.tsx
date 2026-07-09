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
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/our-products", label: "Our Products" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact Us" },
];

export function Navbar() {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.itemCount);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

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
          "fixed inset-0 z-50 bg-white/98 px-6 py-6 transition-transform duration-200 xl:hidden",
          isMenuOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-brand-green-100 pb-4">
          <div>
            <p className="font-heading text-lg font-semibold tracking-[0.18em] text-brand-green-900">
              WELL HEALTH
            </p>
            <p className="text-sm font-medium text-brand-green-600">
              TRADE INTERNATIONAL
            </p>
          </div>

          <button
            aria-label="Close menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-green-100 bg-white text-neutral-900 shadow-sm"
            onClick={() => setIsMenuOpen(false)}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 flex h-[calc(100vh-8rem)] flex-col justify-between">
          <nav className="space-y-4">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border border-brand-green-100 px-5 py-4 text-xl font-medium text-neutral-900 shadow-sm",
                    isActive && "border-brand-green-600/30 bg-brand-green-100 text-brand-green-600"
                  )}
                  href={link.href}
                >
                  {link.label}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              );
            })}
          </nav>

          <div className="grid gap-3 rounded-2xl bg-brand-green-100 p-5 text-sm text-neutral-900">
            <label className="flex h-12 items-center gap-2 rounded-full bg-white px-4 shadow-sm ring-1 ring-brand-green-100">
              <Search className="h-4 w-4 text-neutral-500" />
              <input
                aria-label="Search site mobile"
                className="w-full bg-transparent text-sm focus:outline-none"
                placeholder="Search products"
                type="search"
              />
            </label>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-green-600 px-5 py-3 font-medium text-white shadow-sm"
              type="button"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart ({itemCount})
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}