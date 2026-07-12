"use client";

import Link from "next/link";
import {
  FlaskConical,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatPrice } from "@/lib/format-price";
import { getDisplayCompareAt } from "@/lib/products/public-mapper";
import type { PublicProduct } from "@/lib/products/public-types";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

type ProductInfoPanelProps = {
  product: PublicProduct;
};

export function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const compareAt = getDisplayCompareAt(product);

  const stockTone =
    product.stockBucket === "Out of Stock"
      ? "red"
      : product.stockBucket === "Low Stock"
        ? "amber"
        : "green";

  const stockStatus =
    product.stockBucket === "Out of Stock"
      ? "Currently out of stock"
      : product.stockBucket === "Low Stock"
        ? `Only ${product.stock} left in stock`
        : "In Stock — ships within 24–48 hours";

  function handleAddToCart() {
    if (!product.inStock) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      },
      quantity
    );
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/cart");
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.shortDescription, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // User cancelled share — ignore
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          className="inline-flex rounded-full bg-brand-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-600 transition-colors hover:bg-brand-green-100/80"
          href={`/shop?category=${product.categorySlug}`}
        >
          {product.category}
        </Link>
        {product.offerActive && product.offerBadge ? (
          <span className="inline-flex rounded-full bg-[#C9A24B]/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#8a6d2d]">
            {product.offerBadge}
            {product.discountPercent ? ` · ${product.discountPercent}% off` : ""}
          </span>
        ) : null}
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {product.name}
          </h1>
          {product.nameBn ? (
            <p className="mt-1 font-[family-name:var(--font-hind-siliguri)] text-lg text-neutral-500">
              {product.nameBn}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <p className="font-heading text-3xl font-bold tracking-tight text-brand-green-600">
            {formatPrice(product.price)}
          </p>
          {compareAt ? (
            <p className="text-lg text-neutral-400 line-through">{formatPrice(compareAt)}</p>
          ) : null}
          {product.saveLabel ? (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
              {product.saveLabel}
            </span>
          ) : null}
        </div>

        <p className="text-base leading-7 text-neutral-500">{product.shortDescription}</p>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 font-medium text-neutral-600">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                stockTone === "green" && "bg-brand-green-600",
                stockTone === "amber" && "bg-amber-500",
                stockTone === "red" && "bg-red-500"
              )}
            />
            <span
              className={cn(
                stockTone === "green" && "text-brand-green-600",
                stockTone === "amber" && "text-amber-600",
                stockTone === "red" && "text-red-600"
              )}
            >
              {stockStatus}
            </span>
          </span>
          <span className="text-neutral-300">·</span>
          <span className="text-neutral-500">
            {product.brand} · {product.unit}
            {product.packSize ? ` · ${product.packSize}` : ""}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.labTested ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-green-100 bg-brand-green-100/50 px-3 py-1 text-xs font-medium text-brand-green-900">
              <FlaskConical className="h-3.5 w-3.5" />
              Lab tested
            </span>
          ) : null}
          {product.doctorRecommended ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-green-100 bg-brand-green-100/50 px-3 py-1 text-xs font-medium text-brand-green-900">
              <Stethoscope className="h-3.5 w-3.5" />
              Doctor recommended
            </span>
          ) : null}
        </div>

        <div className="border-t border-neutral-200" />

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-900">Quantity</span>
            <div className="inline-flex items-center overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
              <button
                aria-label="Decrease quantity"
                className="inline-flex h-10 w-10 items-center justify-center text-neutral-500 transition-colors duration-200 hover:bg-neutral-100"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                type="button"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-12 px-3 text-center text-sm font-medium text-neutral-900">
                {quantity}
              </span>
              <button
                aria-label="Increase quantity"
                className="inline-flex h-10 w-10 items-center justify-center text-neutral-500 transition-colors duration-200 hover:bg-neutral-100"
                onClick={() =>
                  setQuantity((current) => {
                    if (product.stock > 0) return Math.min(product.stock, current + 1);
                    return current + 1;
                  })
                }
                type="button"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition-all duration-200",
                product.inStock
                  ? "border-brand-green-600 text-brand-green-600 hover:-translate-y-0.5 hover:bg-brand-green-100 hover:shadow-sm"
                  : "cursor-not-allowed border-neutral-200 text-neutral-400"
              )}
              disabled={!product.inStock}
              onClick={handleAddToCart}
              type="button"
            >
              <ShoppingCart className="h-4 w-4" />
              {justAdded ? "Added" : "Add to Cart"}
            </button>
            <button
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] shadow-sm transition-all duration-200",
                product.inStock
                  ? "bg-brand-green-600 text-white hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
                  : "cursor-not-allowed bg-neutral-200 text-neutral-500"
              )}
              disabled={!product.inStock}
              onClick={handleBuyNow}
              type="button"
            >
              Buy Now
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green-600 hover:text-brand-green-600 hover:shadow-sm"
              onClick={() => setIsWishlisted((current) => !current)}
              type="button"
            >
              <Heart className={cn("h-4.5 w-4.5", isWishlisted && "fill-current text-rose-500")} />
            </button>
            <button
              aria-label="Share product"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green-600 hover:text-brand-green-600 hover:shadow-sm"
              onClick={() => void handleShare()}
              type="button"
            >
              <Share2 className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand-green-600" />
              Fast Delivery
            </span>
            <span className="h-4 w-px bg-neutral-200" />
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-green-600" />
              Quality Assured
            </span>
            <span className="h-4 w-px bg-neutral-200" />
            <span className="inline-flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-brand-green-600" />
              Easy Returns
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
