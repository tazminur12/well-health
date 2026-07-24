"use client";

import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";

type ProductTabsProps = {
  description: string;
  ingredients?: string;
  usageInstructions?: string;
  warnings?: string;
  specs: Array<{ label: string; value: string }>;
};

const tabs = ["Description", "Specifications", "Ingredients & Use", "Shipping"] as const;

export function ProductTabs({
  description,
  ingredients,
  usageInstructions,
  warnings,
  specs,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Description");

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-6">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                className={`relative whitespace-nowrap py-4 text-sm font-medium transition-colors duration-200 ${
                  isActive ? "text-brand-green-600" : "text-neutral-500 hover:text-neutral-900"
                }`}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full transition-opacity duration-200 ${
                    isActive ? "bg-brand-green-600 opacity-100" : "bg-transparent opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {activeTab === "Description" ? (
          <div className="space-y-4 leading-relaxed text-neutral-700">
            {description
              .split(/\n\n+/)
              .filter(Boolean)
              .map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
          </div>
        ) : null}

        {activeTab === "Specifications" ? (
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              Pharmaceutical specs (ঔষধের তথ্য) for this product.
            </p>
            {specs.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-neutral-200">
                {specs.map((spec, index) => (
                  <div
                    key={spec.label}
                    className={`grid gap-4 px-4 py-4 sm:grid-cols-[240px_minmax(0,1fr)] ${
                      index !== specs.length - 1 ? "border-b border-neutral-200" : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-neutral-900">{spec.label}</p>
                    <p className="text-sm leading-6 text-neutral-600">{spec.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No specifications listed yet.</p>
            )}
          </div>
        ) : null}

        {activeTab === "Ingredients & Use" ? (
          <div className="space-y-6">
            <DetailBlock title="Ingredients" body={ingredients} empty="Ingredients details coming soon." />
            <DetailBlock
              title="Usage instructions"
              body={usageInstructions}
              empty="Usage guidance will be listed here."
            />
            <DetailBlock title="Warnings" body={warnings} empty="No special warnings listed." />
          </div>
        ) : null}

        {activeTab === "Shipping" ? (
          <div className="space-y-4 text-sm leading-7 text-neutral-700">
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <Truck className="mt-0.5 h-5 w-5 text-brand-green-600" />
              <p>
                Delivery across Bangladesh typically takes 2–5 business days depending on your
                location.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-brand-green-600" />
              <p>
                Cash on Delivery and online payments (SSLCommerz / bKash) will be confirmed at
                checkout.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <RotateCcw className="mt-0.5 h-5 w-5 text-brand-green-600" />
              <p>
                Easy returns are available for eligible items based on product condition and support
                policy.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DetailBlock({
  title,
  body,
  empty,
}: {
  title: string;
  body?: string;
  empty: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
      <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-neutral-900">{title}</h3>
      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-600">
        {body?.trim() || empty}
      </p>
    </div>
  );
}
