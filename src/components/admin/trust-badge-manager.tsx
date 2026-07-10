"use client";

import {
  Award,
  Microscope,
  Pencil,
  Plus,
  ShieldCheck,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type IconKey = "ShieldCheck" | "Award" | "Microscope" | "Stethoscope";

type TrustBadge = {
  id: string;
  icon: IconKey;
  title: string;
  description: string;
};

type TrustBadgeManagerProps = {
  onToast: (message: string) => void;
};

const iconMap = {
  ShieldCheck,
  Award,
  Microscope,
  Stethoscope,
};

const initialBadges: TrustBadge[] = [
  {
    id: "badge-1",
    icon: "Award",
    title: "Premium Quality",
    description: "Carefully sourced ingredients with strict quality checks.",
  },
  {
    id: "badge-2",
    icon: "ShieldCheck",
    title: "GMP Certified",
    description: "Produced in GMP-compliant facilities for safety and consistency.",
  },
  {
    id: "badge-3",
    icon: "Microscope",
    title: "Scientifically Formulated",
    description: "Evidence-based formulations reviewed by wellness specialists.",
  },
  {
    id: "badge-4",
    icon: "Stethoscope",
    title: "Trusted by Doctors",
    description: "Recommended by healthcare professionals across Bangladesh.",
  },
];

export function TrustBadgeManager({ onToast }: TrustBadgeManagerProps) {
  const [badges, setBadges] = useState<TrustBadge[]>(initialBadges);
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null);
  const editingBadge = useMemo(
    () => badges.find((badge) => badge.id === editingBadgeId) ?? null,
    [badges, editingBadgeId]
  );

  function handleSaveBadge(updatedBadge: TrustBadge) {
    setBadges((current) => current.map((badge) => (badge.id === updatedBadge.id ? updatedBadge : badge)));
    setEditingBadgeId(null);
    onToast("Changes saved successfully");
    console.log("Save badge stub", updatedBadge);
  }

  function handleDeleteBadge(id: string) {
    setBadges((current) => current.filter((badge) => badge.id !== id));
    onToast("Badge removed");
    console.log("Delete badge stub", id);
  }

  function handleAddBadge() {
    const newBadge: TrustBadge = {
      id: `badge-${Date.now()}`,
      icon: "ShieldCheck",
      title: "New Trust Badge",
      description: "Short supporting trust statement.",
    };

    setBadges((current) => [...current, newBadge]);
    setEditingBadgeId(newBadge.id);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-bold text-neutral-900">Trust Badges</h3>
          <p className="text-sm text-neutral-500">Manage credibility badges shown on the homepage</p>
        </div>

        <Button
          className="h-10 rounded-lg bg-brand-green-600 text-white hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
          onClick={handleAddBadge}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add Badge
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {badges.map((badge, index) => {
          const Icon = iconMap[badge.icon];

          return (
            <article
              key={badge.id}
              className={cn(
                "flex flex-wrap items-center gap-3 px-4 py-3",
                index !== badges.length - 1 && "border-b border-neutral-100"
              )}
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-700">
                <Icon className="h-4 w-4" />
              </span>

              <div className="min-w-[240px] flex-1">
                <p className="font-semibold text-neutral-900">{badge.title}</p>
                <p className="text-sm text-neutral-500">{badge.description}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  aria-label={`Edit ${badge.title}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                  onClick={() => setEditingBadgeId(badge.id)}
                  type="button"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  aria-label={`Delete ${badge.title}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteBadge(badge.id)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {editingBadge ? (
        <TrustBadgeEditModal
          badge={editingBadge}
          onClose={() => setEditingBadgeId(null)}
          onSave={handleSaveBadge}
        />
      ) : null}
    </section>
  );
}

function TrustBadgeEditModal({
  badge,
  onClose,
  onSave,
}: {
  badge: TrustBadge;
  onClose: () => void;
  onSave: (updated: TrustBadge) => void;
}) {
  const [draft, setDraft] = useState<TrustBadge>(badge);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-neutral-950/40" onClick={onClose} />

      <section className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <h4 className="font-heading text-base font-bold text-neutral-900">Edit Badge</h4>
          <button
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-3 px-4 py-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Icon</label>
            <select
              className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setDraft((current) => ({ ...current, icon: event.target.value as IconKey }))}
              value={draft.icon}
            >
              <option value="ShieldCheck">ShieldCheck</option>
              <option value="Award">Award</option>
              <option value="Microscope">Microscope</option>
              <option value="Stethoscope">Stethoscope</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Title</label>
            <input
              className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              value={draft.title}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Description</label>
            <input
              className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              value={draft.description}
            />
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-neutral-200 px-4 py-3">
          <Button className="h-9 rounded-lg" onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button
            className="h-9 rounded-lg bg-brand-green-600 text-white hover:bg-brand-green-900"
            onClick={() => onSave(draft)}
            type="button"
          >
            Save
          </Button>
        </footer>
      </section>
    </>
  );
}
