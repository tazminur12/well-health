"use client";

import { useState } from "react";

import { AboutContentEditor } from "@/components/admin/about-content-editor";
import { FaqContentManager } from "@/components/admin/faq-content-manager";
import { HeroSlideManager } from "@/components/admin/hero-slide-manager";
import { SiteAssetsManager } from "@/components/admin/site-assets-manager";
import { TrustBadgeManager } from "@/components/admin/trust-badge-manager";
import { cn } from "@/lib/utils";

type ContentTab =
  | "Hero Slider"
  | "Trust Badges"
  | "About Section"
  | "FAQ"
  | "Site Assets";

const tabs: ContentTab[] = [
  "Hero Slider",
  "Trust Badges",
  "About Section",
  "FAQ",
  "Site Assets",
];

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>("Hero Slider");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-neutral-900">Content Management</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage homepage banners, trust signals, about copy, FAQ, and brand assets
        </p>
      </header>

      <section className="border-b border-neutral-200">
        <div className="flex flex-wrap items-center gap-5">
          {tabs.map((tab) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                className={cn(
                  "border-b-2 px-0 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-brand-green-600 text-brand-green-600"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                )}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        {activeTab === "Hero Slider" ? <HeroSlideManager /> : null}
        {activeTab === "Trust Badges" ? <TrustBadgeManager /> : null}
        {activeTab === "About Section" ? <AboutContentEditor /> : null}
        {activeTab === "FAQ" ? <FaqContentManager /> : null}
        {activeTab === "Site Assets" ? <SiteAssetsManager /> : null}
      </section>
    </div>
  );
}
