"use client";

import { Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAdminAboutHome, useContentMutations } from "@/hooks/use-admin-content";
import { showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import type { AboutHomeContent } from "@/lib/content/schemas";

const featureIcons = [
  "Target",
  "Gem",
  "HeartHandshake",
  "Award",
  "Leaf",
  "ShieldCheck",
  "BadgeCheck",
] as const;

export function AboutContentEditor() {
  const { data, isLoading, refetch } = useAdminAboutHome();
  const { updateAbout, uploadImage } = useContentMutations();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<AboutHomeContent | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (isLoading || !form) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-neutral-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-green-600" />
        Loading about content…
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-neutral-900">About section</h2>
          <p className="mt-1 text-sm text-neutral-500">Homepage story block and feature cards</p>
        </div>
        <Button
          className="h-10 rounded-xl bg-brand-green-600 text-white hover:bg-brand-green-900"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await updateAbout.mutateAsync(form);
              await showAdminSuccess("About saved", "Homepage about section updated.");
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
          Save changes
        </Button>
      </header>

      <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:grid-cols-2">
        <label className="space-y-1.5 lg:col-span-2">
          <span className="text-sm font-medium">Heading</span>
          <input
            className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm"
            onChange={(e) => setForm({ ...form, heading: e.target.value })}
            value={form.heading}
          />
        </label>
        <label className="space-y-1.5 lg:col-span-2">
          <span className="text-sm font-medium">Description</span>
          <textarea
            className="min-h-[110px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            value={form.description}
          />
        </label>

        <div className="space-y-2 lg:col-span-2">
          <span className="text-sm font-medium">Image</span>
          <input
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              try {
                const url = await uploadImage.mutateAsync({ folder: "about", file });
                setForm({ ...form, imageUrl: url });
                await showAdminSuccess("Image uploaded", "About image ready.");
              } catch (err) {
                await showAdminError(
                  "Upload failed",
                  err instanceof Error ? err.message : "Try again."
                );
              }
            }}
            ref={fileRef}
            type="file"
          />
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            {form.imageUrl ? (
              <Image alt="" className="object-cover" fill sizes="640px" src={form.imageUrl} unoptimized />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                No image
              </div>
            )}
          </div>
          <Button
            className="h-9 rounded-xl"
            onClick={() => fileRef.current?.click()}
            type="button"
            variant="outline"
          >
            <UploadCloud className="h-4 w-4" />
            Upload image
          </Button>
        </div>

        <label className="space-y-1.5 lg:col-span-2">
          <span className="text-sm font-medium">Highlights (one per line)</span>
          <textarea
            className="min-h-[90px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            onChange={(e) =>
              setForm({
                ...form,
                highlights: e.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
            value={form.highlights.join("\n")}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {form.features.map((feature, index) => (
          <article
            key={`${feature.title}-${index}`}
            className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Feature {index + 1}
            </p>
            <select
              className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm"
              onChange={(e) => {
                const features = [...form.features];
                features[index] = {
                  ...feature,
                  iconKey: e.target.value as (typeof featureIcons)[number],
                };
                setForm({ ...form, features });
              }}
              value={feature.iconKey}
            >
              {featureIcons.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
            <input
              className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm"
              onChange={(e) => {
                const features = [...form.features];
                features[index] = { ...feature, title: e.target.value };
                setForm({ ...form, features });
              }}
              value={feature.title}
            />
            <input
              className="h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm"
              onChange={(e) => {
                const features = [...form.features];
                features[index] = { ...feature, description: e.target.value };
                setForm({ ...form, features });
              }}
              value={feature.description}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
