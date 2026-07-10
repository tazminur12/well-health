"use client";

import { UploadCloud, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type SiteAssetsManagerProps = {
  onToast: (message: string) => void;
};

type SiteAsset = {
  id: string;
  label: string;
  recommendation: string;
  hasImage: boolean;
};

const initialAssets: SiteAsset[] = [
  { id: "logo-light", label: "Logo (Light)", recommendation: "Recommended: 320x96px", hasImage: true },
  { id: "logo-dark", label: "Logo (Dark)", recommendation: "Recommended: 320x96px", hasImage: true },
  { id: "favicon", label: "Favicon", recommendation: "Recommended: 64x64px", hasImage: true },
  { id: "og-default", label: "Default OG Image", recommendation: "Recommended: 1200x630px", hasImage: true },
];

export function SiteAssetsManager({ onToast }: SiteAssetsManagerProps) {
  const [assets, setAssets] = useState<SiteAsset[]>(initialAssets);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="font-heading text-xl font-bold text-neutral-900">Site Assets</h2>
        <p className="mt-1 text-sm text-neutral-500">Manage global site imagery and brand files</p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {assets.map((asset) => (
          <article key={asset.id} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">{asset.label}</h3>
            <div className="relative overflow-hidden rounded-lg border border-neutral-200">
              <div className="flex h-28 items-center justify-center bg-neutral-100 text-sm font-medium text-neutral-500">
                {asset.hasImage ? "Current Preview" : "No Asset Uploaded"}
              </div>
              {asset.hasImage ? (
                <button
                  aria-label={`Remove ${asset.label}`}
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm hover:bg-white"
                  onClick={() =>
                    setAssets((current) =>
                      current.map((item) => (item.id === asset.id ? { ...item, hasImage: false } : item))
                    )
                  }
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <p className="text-xs text-neutral-500">{asset.recommendation}</p>

            <Button
              className="h-9 rounded-lg"
              onClick={() => setActiveUploadId((current) => (current === asset.id ? null : asset.id))}
              type="button"
              variant="outline"
            >
              Replace
            </Button>

            {activeUploadId === asset.id ? (
              <button
                className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 px-4 py-7 text-center hover:bg-neutral-50"
                onClick={() => {
                  setAssets((current) =>
                    current.map((item) => (item.id === asset.id ? { ...item, hasImage: true } : item))
                  );
                  setActiveUploadId(null);
                  console.log("Replace site asset stub", asset.id);
                  onToast("Changes saved successfully");
                }}
                type="button"
              >
                <UploadCloud className="h-5 w-5 text-neutral-500" />
                <p className="mt-2 text-sm font-medium text-neutral-700">Click or drag to upload replacement image</p>
                <p className="mt-1 text-xs text-neutral-500">{asset.recommendation}</p>
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
