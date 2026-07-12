"use client";

import { Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAdminSiteAssets, useContentMutations } from "@/hooks/use-admin-content";
import { showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import type { SiteAssetsContent } from "@/lib/content/schemas";

const slots: {
  key: keyof SiteAssetsContent;
  label: string;
  recommendation: string;
  folder: string;
}[] = [
  {
    key: "logoLightUrl",
    label: "Logo (Light)",
    recommendation: "Recommended: 320×96px",
    folder: "assets",
  },
  {
    key: "logoDarkUrl",
    label: "Logo (Dark)",
    recommendation: "Recommended: 320×96px",
    folder: "assets",
  },
  {
    key: "faviconUrl",
    label: "Favicon",
    recommendation: "Recommended: 64×64px",
    folder: "assets",
  },
  {
    key: "ogImageUrl",
    label: "Default OG Image",
    recommendation: "Recommended: 1200×630px",
    folder: "assets",
  },
];

export function SiteAssetsManager() {
  const { data, isLoading, refetch } = useAdminSiteAssets();
  const { updateAssets, uploadImage } = useContentMutations();
  const [form, setForm] = useState<SiteAssetsContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeKey, setActiveKey] = useState<keyof SiteAssetsContent | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (isLoading || !form) {
    return (
      <div className="flex min-h-[160px] items-center justify-center text-sm text-neutral-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-green-600" />
        Loading assets…
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-neutral-900">Site assets</h2>
          <p className="mt-1 text-sm text-neutral-500">Global brand imagery and social preview</p>
        </div>
        <Button
          className="h-10 rounded-xl bg-brand-green-600 text-white hover:bg-brand-green-900"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await updateAssets.mutateAsync(form);
              await showAdminSuccess("Assets saved", "Site branding files updated.");
              await refetch();
            } catch (err) {
              await showAdminError(
                "Save failed",
                err instanceof Error ? err.message : "Try again."
              );
            } finally {
              setSaving(false);
            }
          }}
          type="button"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save assets
        </Button>
      </header>

      <input
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file || !activeKey) return;
          try {
            const url = await uploadImage.mutateAsync({ folder: "assets", file });
            setForm({ ...form, [activeKey]: url });
            await showAdminSuccess("Uploaded", "Asset image ready — remember to save.");
          } catch (err) {
            await showAdminError(
              "Upload failed",
              err instanceof Error ? err.message : "Try again."
            );
          } finally {
            setActiveKey(null);
          }
        }}
        ref={fileRef}
        type="file"
      />

      <div className="grid gap-3 md:grid-cols-2">
        {slots.map((slot) => {
          const url = form[slot.key];
          return (
            <article
              key={slot.key}
              className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-neutral-900">{slot.label}</h3>
              <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                <div className="relative flex h-28 items-center justify-center">
                  {url ? (
                    <Image alt="" className="object-contain p-3" fill sizes="280px" src={url} unoptimized />
                  ) : (
                    <span className="text-sm text-neutral-500">No asset uploaded</span>
                  )}
                </div>
                {url ? (
                  <button
                    aria-label={`Remove ${slot.label}`}
                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-neutral-600 shadow-sm"
                    onClick={() => setForm({ ...form, [slot.key]: "" })}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <p className="text-xs text-neutral-500">{slot.recommendation}</p>
              <Button
                className="h-9 rounded-xl"
                onClick={() => {
                  setActiveKey(slot.key);
                  fileRef.current?.click();
                }}
                type="button"
                variant="outline"
              >
                <UploadCloud className="h-4 w-4" />
                {url ? "Replace" : "Upload"}
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
