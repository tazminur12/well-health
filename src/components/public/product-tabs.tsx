"use client";

import { ShieldCheck, Truck, RotateCcw, Star } from "lucide-react";
import { useMemo, useState } from "react";

import { RatingBreakdown } from "@/components/public/rating-breakdown";
import { ReviewCard } from "@/components/public/review-card";

type ProductTabsProps = {
  description: string;
  specs: Array<{ label: string; value: string }>;
  reviews: Array<{ name: string; initials: string; date: string; rating: number; comment: string }>;
};

const tabLabels = ["Description", "Reviews (24)", "Shipping Info"] as const;

export function ProductTabs({ description, specs, reviews }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabLabels)[number]>("Description");

  const ratingBreakdown = useMemo(
    () => [
      { stars: 5, percentage: 58 },
      { stars: 4, percentage: 24 },
      { stars: 3, percentage: 10 },
      { stars: 2, percentage: 5 },
      { stars: 1, percentage: 3 },
    ],
    []
  );

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-6">
        <div className="flex gap-6 overflow-x-auto">
          {tabLabels.map((tab) => {
            const isActive = tab === activeTab;

            return (
              <button
                key={tab}
                className={`relative whitespace-nowrap py-4 text-sm font-medium transition-colors duration-200 ${isActive ? "text-brand-green-600" : "text-neutral-500 hover:text-neutral-900"}`}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
                <span className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full transition-opacity duration-200 ${isActive ? "bg-brand-green-600 opacity-100" : "bg-transparent opacity-0"}`} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {activeTab === "Description" ? (
          <div className="space-y-8">
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              {description.split("\n\n").map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-neutral-200">
              {specs.map((spec, index) => (
                <div
                  key={spec.label}
                  className={`grid gap-4 px-4 py-4 sm:grid-cols-[220px_minmax(0,1fr)] ${index !== specs.length - 1 ? "border-b border-neutral-200" : ""}`}
                >
                  <p className="text-sm font-medium text-neutral-900">{spec.label}</p>
                  <p className="text-sm leading-6 text-neutral-500">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "Reviews (24)" ? (
          <div className="space-y-8">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start" id="reviews-tab">
              <div className="rounded-2xl bg-neutral-100 p-6">
                <div className="flex items-end gap-4">
                  <p className="font-heading text-5xl font-bold tracking-tight text-neutral-900">4.6</p>
                  <div className="pb-1">
                    <div className="flex items-center gap-1 text-brand-green-600">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star key={index} className={`h-5 w-5 ${index < 4 ? "fill-current" : "text-neutral-300"}`} />
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-neutral-500">Based on 24 reviews</p>
                  </div>
                </div>

                <div className="mt-6">
                  <RatingBreakdown ratings={ratingBreakdown} />
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-neutral-200 p-6">
                <button
                  className="inline-flex items-center justify-center rounded-lg border border-brand-green-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-green-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-100 hover:shadow-sm"
                  type="button"
                >
                  Write a Review
                </button>

                <div className="divide-y divide-neutral-200">
                  {reviews.map((review) => (
                    <ReviewCard key={`${review.name}-${review.date}`} {...review} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "Shipping Info" ? (
          <div className="space-y-4 text-sm leading-7 text-neutral-700">
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <Truck className="mt-0.5 h-5 w-5 text-brand-green-600" />
              <p>Delivery across Bangladesh typically takes 2-5 business days depending on your location.</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-brand-green-600" />
              <p>Cash on Delivery is supported for selected areas and will be confirmed at checkout later.</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <RotateCcw className="mt-0.5 h-5 w-5 text-brand-green-600" />
              <p>Easy returns are available for eligible items based on product condition and order support policy.</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}