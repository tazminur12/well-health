"use client";

import { useEffect, useState } from "react";

import { AboutContentEditor } from "@/components/admin/about-content-editor";
import { HeroSlideManager } from "@/components/admin/hero-slide-manager";
import { SiteAssetsManager } from "@/components/admin/site-assets-manager";
import { TrustBadgeManager } from "@/components/admin/trust-badge-manager";
import { cn } from "@/lib/utils";

type ContentTab = "Hero Slider" | "Trust Badges" | "About Section" | "Site Assets";

const tabs: ContentTab[] = ["Hero Slider", "Trust Badges", "About Section", "Site Assets"];

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>("Hero Slider");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-neutral-900">Content Management</h1>
        <p className="mt-1 text-sm text-neutral-500">Manage homepage sections and site imagery</p>
      </header>

      <section className="border-b border-neutral-200">
        <div className="flex flex-wrap items-center gap-6">
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
        {activeTab === "Hero Slider" ? <HeroSlideManager onToast={setToastMessage} /> : null}
        {activeTab === "Trust Badges" ? <TrustBadgeManager onToast={setToastMessage} /> : null}
        {activeTab === "About Section" ? <AboutContentEditor onToast={setToastMessage} /> : null}
        {activeTab === "Site Assets" ? <SiteAssetsManager onToast={setToastMessage} /> : null}
      </section>

      <div
        className={cn(
          "fixed right-6 top-6 z-[60] rounded-lg border border-brand-green-200 bg-white px-4 py-3 text-sm font-medium text-brand-green-700 shadow-lg transition-all",
          toastMessage ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        )}
        role="status"
      >
        {toastMessage ?? ""}
      </div>
    </div>
  );
}
