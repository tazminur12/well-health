"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlignJustify,
  Home,
  Info,
  Leaf,
  LogIn,
  Mail,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  UserCircle2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

const navLinks: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/our-products", label: "Our Products", icon: Package },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/contact", label: "Contact Us", icon: Mail },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const itemCount = useCartStore((state) => state.itemCount);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isLinkActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const closeMenu = () => setIsMenuOpen(false);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    router.push(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
    closeMenu();
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    closeMenu();
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
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-transparent bg-white/95 backdrop-blur-sm transition-shadow duration-200",
          isScrolled && "border-brand-green-100 shadow-md shadow-black/5"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            className="flex items-center gap-3 transition-opacity duration-200 active:opacity-70"
            href="/"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-900 shadow-sm sm:h-12 sm:w-12">
              <Leaf className="h-6 w-6" />
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
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
                    "relative font-medium text-neutral-900 transition-colors duration-200 hover:text-brand-green-600",
                    isActive &&
                      "text-brand-green-600 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-brand-green-600"
                  )}
                  href={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            <form
              className="flex h-11 w-[18rem] items-center gap-2 rounded-full bg-neutral-100 px-4 text-neutral-500 shadow-sm ring-1 ring-transparent transition hover:ring-brand-green-100 focus-within:ring-brand-green-600/30"
              onSubmit={handleSearch}
              role="search"
            >
              <button
                aria-label="Search"
                className="inline-flex shrink-0 items-center justify-center text-neutral-500 transition-colors duration-200 hover:text-brand-green-600"
                type="submit"
              >
                <Search className="h-4 w-4" />
              </button>
              <input
                aria-label="Search site"
                className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products"
                type="search"
                value={searchQuery}
              />
            </form>

            <Link
              aria-label="My account"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-green-100 bg-white text-neutral-900 shadow-sm transition-all duration-200 hover:border-brand-green-600/20 hover:text-brand-green-600 active:scale-95"
              href="/login"
            >
              <UserCircle2 className="h-5 w-5" />
            </Link>

            <Link
              aria-label="Cart"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-green-100 bg-white text-neutral-900 shadow-sm transition-all duration-200 hover:border-brand-green-600/20 hover:text-brand-green-600 active:scale-95"
              href="/cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-gold-accent px-1 text-[10px] font-semibold text-white shadow-sm">
                {itemCount}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <Link
              aria-label="Cart"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-green-100 bg-white text-neutral-900 shadow-sm transition-transform duration-200 active:scale-95"
              href="/cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-gold-accent px-1 text-[10px] font-semibold text-white shadow-sm">
                {itemCount}
              </span>
            </Link>

            <button
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-green-100 bg-white text-neutral-900 shadow-sm transition-transform duration-200 active:scale-95"
              onClick={() => setIsMenuOpen((value) => !value)}
              type="button"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <AlignJustify className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer lives OUTSIDE the sticky/blurred header so fixed positioning works correctly */}
      <div
        aria-hidden={!isMenuOpen}
        className={cn(
          "fixed inset-0 z-50 xl:hidden",
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <button
          aria-label="Close menu"
          className={cn(
            "absolute inset-0 bg-black/45 transition-opacity duration-200",
            isMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={closeMenu}
          type="button"
        />

        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(86vw,20rem)] flex-col bg-[#F7F8F9] shadow-[0_18px_40px_rgba(11,77,58,0.22)] transition-transform duration-200 ease-out",
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Brand header */}
          <div className="flex items-center justify-between gap-3 border-b border-brand-green-100/80 bg-white px-5 py-4">
            <Link className="flex min-w-0 items-center gap-3 active:opacity-70" href="/" onClick={closeMenu}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green-900 text-white shadow-sm">
                <Leaf className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-heading text-base font-bold text-brand-green-900">
                  Well Health
                </span>
                <span className="block truncate text-xs text-neutral-500">
                  Better Health, Better Life
                </span>
              </span>
            </Link>

            <button
              aria-label="Close menu"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-neutral-700 transition-colors duration-200 active:bg-neutral-200"
              onClick={closeMenu}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="border-b border-brand-green-100/60 bg-white px-5 py-3">
            <form
              className="flex h-11 items-center gap-2 rounded-xl bg-neutral-100 px-3.5 ring-1 ring-transparent focus-within:ring-brand-green-600/30"
              onSubmit={handleSearch}
              role="search"
            >
              <button
                aria-label="Search"
                className="inline-flex shrink-0 text-neutral-500 active:text-brand-green-600"
                type="submit"
              >
                <Search className="h-4 w-4" />
              </button>
              <input
                aria-label="Search products"
                className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products"
                type="search"
                value={searchQuery}
              />
            </form>
          </div>

          {/* Nav links — always visible, scroll if needed */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-brand-green-600">
              Explore
            </p>
            <ul className="space-y-1">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.href);
                const Icon = link.icon;

                return (
                  <li key={link.href}>
                    <Link
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors duration-200 active:bg-brand-green-100",
                        isActive
                          ? "bg-brand-green-100 text-brand-green-900"
                          : "text-neutral-800"
                      )}
                      href={link.href}
                      onClick={closeMenu}
                    >
                      <span
                        className={cn(
                          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          isActive
                            ? "bg-brand-green-600 text-white"
                            : "bg-white text-neutral-600 shadow-sm ring-1 ring-neutral-200/80"
                        )}
                      >
                        <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                      </span>
                      <span className="text-[15px] font-medium">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom account CTA */}
          <div className="border-t border-brand-green-100/80 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            <p className="mb-3 text-sm text-neutral-500">
              Sign in to track orders and manage your wishlist
            </p>
            <div className="grid gap-2.5">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-brand-green-600 px-4 text-sm font-semibold text-brand-green-600 transition-colors duration-200 active:bg-brand-green-100"
                href="/login"
                onClick={closeMenu}
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-4 text-sm font-semibold text-white transition-colors duration-200 active:bg-brand-green-900"
                href="/cart"
                onClick={closeMenu}
              >
                <ShoppingCart className="h-4 w-4" />
                View Cart ({itemCount})
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
