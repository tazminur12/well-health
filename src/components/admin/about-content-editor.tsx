"use client";

import { BadgeCheck, Leaf, ShieldCheck, UploadCloud } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type AboutContentEditorProps = {
  onToast: (message: string) => void;
};

type AboutBlock = {
  id: string;
  icon: "Leaf" | "ShieldCheck" | "BadgeCheck";
  title: string;
  description: string;
};

const iconOptions = {
  Leaf,
  ShieldCheck,
  BadgeCheck,
} as const;

export function AboutContentEditor({ onToast }: AboutContentEditorProps) {
  const [aboutHeading, setAboutHeading] = useState("About Well Health");
  const [aboutDescription, setAboutDescription] = useState(
    "We combine clinical inspiration with nature-backed formulations to support daily wellness in every household."
  );
  const [hasImage, setHasImage] = useState(true);
  const [blocks, setBlocks] = useState<AboutBlock[]>([
    {
      id: "about-1",
      icon: "Leaf",
      title: "Mission",
      description: "Make premium wellness solutions accessible for families across Bangladesh.",
    },
    {
      id: "about-2",
      icon: "ShieldCheck",
      title: "Vision",
      description: "Become the most trusted health supplement brand in the region.",
    },
    {
      id: "about-3",
      icon: "BadgeCheck",
      title: "Values",
      description: "Integrity, transparency, and evidence-first product development.",
    },
    {
      id: "about-4",
      icon: "Leaf",
      title: "Why Choose Us",
      description: "Consistent quality, expert guidance, and customer-centered support.",
    },
  ]);

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-1.5 lg:col-span-2">
            <span className="text-sm font-medium text-neutral-700">About Heading</span>
            <input
              className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setAboutHeading(event.target.value)}
              value={aboutHeading}
            />
          </label>

          <label className="space-y-1.5 lg:col-span-2">
            <span className="text-sm font-medium text-neutral-700">About Description</span>
            <textarea
              className="min-h-[120px] w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setAboutDescription(event.target.value)}
              rows={4}
              value={aboutDescription}
            />
          </label>

          <div className="lg:col-span-2">
            <p className="mb-2 text-sm font-medium text-neutral-700">About Image</p>
            <button
              className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 px-4 py-7 text-center hover:bg-neutral-50"
              onClick={() => setHasImage(true)}
              type="button"
            >
              <UploadCloud className="h-5 w-5 text-neutral-500" />
              <p className="mt-2 text-sm font-medium text-neutral-700">Click or drag to upload section image</p>
              <p className="mt-1 text-xs text-neutral-500">Recommended: 1200x900px</p>
            </button>

            {hasImage ? (
              <div className="mt-3 flex h-32 items-center justify-center rounded-lg border border-neutral-200 bg-[linear-gradient(135deg,#e8f5ee_0%,#cfe8dc_100%)] text-sm font-semibold text-neutral-700">
                About Image Preview
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {blocks.map((block) => {
          const Icon = iconOptions[block.icon];

          return (
            <article key={block.id} className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-700">
                  <Icon className="h-4 w-4" />
                </span>
                <select
                  className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                  onChange={(event) =>
                    setBlocks((current) =>
                      current.map((item) =>
                        item.id === block.id ? { ...item, icon: event.target.value as AboutBlock["icon"] } : item
                      )
                    )
                  }
                  value={block.icon}
                >
                  <option value="Leaf">Leaf</option>
                  <option value="ShieldCheck">ShieldCheck</option>
                  <option value="BadgeCheck">BadgeCheck</option>
                </select>
              </div>

              <input
                className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                onChange={(event) =>
                  setBlocks((current) =>
                    current.map((item) => (item.id === block.id ? { ...item, title: event.target.value } : item))
                  )
                }
                value={block.title}
              />

              <textarea
                className="min-h-[90px] w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                onChange={(event) =>
                  setBlocks((current) =>
                    current.map((item) =>
                      item.id === block.id ? { ...item, description: event.target.value } : item
                    )
                  )
                }
                rows={3}
                value={block.description}
              />
            </article>
          );
        })}
      </div>

      <Button
        className="h-10 rounded-lg bg-brand-green-600 text-white hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
        onClick={() => {
          console.log("Save about section stub", { aboutHeading, aboutDescription, blocks });
          onToast("Changes saved successfully");
        }}
        type="button"
      >
        Save Changes
      </Button>
    </section>
  );
}
