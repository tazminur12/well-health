"use client";

import Link from "next/link";
import { Heart, Share2, ShoppingCart, Star, Truck, ShieldCheck, RotateCcw, Plus, Minus } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type ProductInfo = {
  slug: string;
  category: string;
  categorySlug: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  saveLabel?: string;
  stockStatus: string;
  stockTone: "green" | "amber";
  rating: number;
  reviewsCount: number;
};

type ProductInfoPanelProps = {
  product: ProductInfo;
};

export function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  return (
    <section className="space-y-6">
      <div className="inline-flex rounded-full bg-brand-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-600">
        {product.category}
      </div>

      <div className="space-y-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          {product.name}
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-brand-green-600">
            {Array.from({ length: 5 }, (_, index) => (
              <Star key={index} className={`h-5 w-5 ${index < product.rating ? "fill-current" : "text-neutral-300"}`} />
            ))}
          </div>

          <Link className="text-sm text-neutral-500 underline-offset-4 transition-colors duration-200 hover:text-brand-green-600 hover:underline" href="#reviews-tab">
            ({product.reviewsCount} reviews)
          </Link>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <p className="font-heading text-3xl font-bold tracking-tight text-brand-green-600">{product.price}</p>
          {product.originalPrice ? <p className="text-lg text-neutral-400 line-through">{product.originalPrice}</p> : null}
          {product.saveLabel ? (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">{product.saveLabel}</span>
          ) : null}
        </div>

        <p className="text-base leading-7 text-neutral-500">{product.description}</p>

        <div className="flex items-center gap-3">
          <span className={cn("h-2.5 w-2.5 rounded-full", product.stockTone === "green" ? "bg-brand-green-600" : "bg-amber-500")} />
          <p className={cn("text-sm font-medium", product.stockTone === "green" ? "text-brand-green-600" : "text-amber-600")}>{product.stockStatus}</p>
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
                title="Decrease quantity"
                type="button"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-12 px-3 text-center text-sm font-medium text-neutral-900">{quantity}</span>
              <button
                aria-label="Increase quantity"
                className="inline-flex h-10 w-10 items-center justify-center text-neutral-500 transition-colors duration-200 hover:bg-neutral-100"
                onClick={() => setQuantity((current) => current + 1)}
                title="Increase quantity"
                type="button"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-green-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-green-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-100 hover:shadow-sm" type="button">
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
            <button className="inline-flex items-center justify-center rounded-lg bg-brand-green-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md" type="button">
              Buy Now
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green-600 hover:text-brand-green-600 hover:shadow-sm" onClick={() => setIsWishlisted((current) => !current)} type="button">
              <Heart className={cn("h-4.5 w-4.5", isWishlisted && "fill-current text-rose-500")} />
            </button>
            <button aria-label="Share product" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green-600 hover:text-brand-green-600 hover:shadow-sm" type="button">
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
              Lab Tested
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