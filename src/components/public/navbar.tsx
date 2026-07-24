"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlignJustify,
  BookOpen,
  Handshake,
  Heart,
  Home,
  Info,
  LayoutDashboard,
  LayoutList,
  LogIn,
  LogOut,
  Mail,
  ShoppingBag,
  ShoppingCart,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { BrandLogo } from "@/components/brand-logo";
import {
  NavLoginButton,
  NavUserMenu,
  type NavAuthUser,
} from "@/components/public/nav-user-menu";
import { logoutAction } from "@/lib/auth/actions";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";

const navLinks: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/product-list", label: "Product List", icon: LayoutList },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/distributor", label: "Distributor", icon: Handshake },
  { href: "/contact", label: "Contact Us", icon: Mail },
];

type NavbarProps = {
  user?: NavAuthUser | null;
};

export function Navbar({ user = null }: NavbarProps) {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.itemCount);
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, startLogout] = useTransition();

  const isLinkActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const closeMenu = () => setIsMenuOpen(false);
  const dashboardHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";

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

  const mobileInitials = user
    ? (() => {
        const trimmed = user.name?.trim();
        if (trimmed) {
          const parts = trimmed.split(/\s+/).filter(Boolean);
          if (parts.length >= 2) {
            return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
          }
          return trimmed.slice(0, 2).toUpperCase();
        }
        return user.email.slice(0, 2).toUpperCase();
      })()
    : "";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-transparent bg-white/95 backdrop-blur-sm transition-shadow duration-200",
          isScrolled && "border-brand-green-100 shadow-md shadow-black/5"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0 shrink">
            <BrandLogo priority size="md" variant="lockup" />
          </div>

          <nav className="hidden items-center gap-5 2xl:gap-7 xl:flex">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              const isDistributor = link.href === "/distributor";

              return (
                <Link
                  key={link.href}
                  className={cn(
                    "relative whitespace-nowrap font-medium transition-colors duration-200",
                    isDistributor
                      ? "rounded-full bg-[#C9A24B]/12 px-3 py-1.5 text-[#8B6B2E] hover:bg-[#C9A24B]/20 hover:text-[#6F5420]"
                      : "text-neutral-900 hover:text-brand-green-600",
                    isActive &&
                      !isDistributor &&
                      "text-brand-green-600 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-brand-green-600",
                    isActive &&
                      isDistributor &&
                      "bg-[#C9A24B]/20 text-[#6F5420] ring-1 ring-[#C9A24B]/35"
                  )}
                  href={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            {user ? <NavUserMenu user={user} /> : <NavLoginButton />}

            <Link
              aria-label="Wishlist"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-green-100 bg-white text-neutral-900 shadow-sm transition-all duration-200 hover:border-brand-green-600/20 hover:text-rose-500 active:scale-95"
              href="/wishlist"
            >
              <Heart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white shadow-sm">
                {wishlistCount}
              </span>
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
            {user ? (
              <NavUserMenu compact user={user} />
            ) : (
              <Link
                aria-label="Login"
                className="inline-flex h-11 items-center justify-center rounded-full bg-brand-green-600 px-3.5 text-sm font-semibold text-white shadow-sm transition-transform duration-200 active:scale-95"
                href="/login"
              >
                Login
              </Link>
            )}

            <Link
              aria-label="Wishlist"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-green-100 bg-white text-neutral-900 shadow-sm transition-transform duration-200 active:scale-95"
              href="/wishlist"
            >
              <Heart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white shadow-sm">
                {wishlistCount}
              </span>
            </Link>

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
          <div className="flex items-center justify-between gap-3 border-b border-brand-green-100/80 bg-white px-5 py-4">
            <BrandLogo
              className="min-w-0"
              onClick={closeMenu}
              size="sm"
              variant="lockup"
            />

            <button
              aria-label="Close menu"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-neutral-700 transition-colors duration-200 active:bg-neutral-200"
              onClick={closeMenu}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

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
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="text-[15px] font-medium">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-brand-green-100/80 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            {user ? (
              <>
                <div className="mb-3 flex items-center gap-3 rounded-xl bg-brand-green-100/50 px-3 py-2.5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-green-600 text-sm font-bold text-white">
                    {mobileInitials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-900">
                      {user.name?.trim() || user.email}
                    </p>
                    <p className="truncate text-xs text-neutral-500">{user.email}</p>
                  </div>
                </div>
                <div className="grid gap-2.5">
                  <Link
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-brand-green-600 px-4 text-sm font-semibold text-brand-green-600 transition-colors duration-200 active:bg-brand-green-100"
                    href={dashboardHref}
                    onClick={closeMenu}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition-colors duration-200 active:bg-red-50 disabled:opacity-60"
                    disabled={isLoggingOut}
                    onClick={() => {
                      closeMenu();
                      startLogout(async () => {
                        await logoutAction();
                      });
                    }}
                    type="button"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? "Signing out…" : "Logout"}
                  </button>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 text-sm font-semibold text-neutral-700 transition-colors duration-200 active:bg-neutral-50"
                      href="/wishlist"
                      onClick={closeMenu}
                    >
                      <Heart className="h-4 w-4 text-rose-500" />
                      Wishlist ({wishlistCount})
                    </Link>
                    <Link
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-3 text-sm font-semibold text-white transition-colors duration-200 active:bg-brand-green-900"
                      href="/cart"
                      onClick={closeMenu}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Cart ({itemCount})
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
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
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 text-sm font-semibold text-neutral-700"
                      href="/wishlist"
                      onClick={closeMenu}
                    >
                      <Heart className="h-4 w-4 text-rose-500" />
                      Wishlist ({wishlistCount})
                    </Link>
                    <Link
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-3 text-sm font-semibold text-white"
                      href="/cart"
                      onClick={closeMenu}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Cart ({itemCount})
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
