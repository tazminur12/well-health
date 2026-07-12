"use client";

import {
  Award,
  BadgeCheck,
  FlaskConical,
  Loader2,
  Microscope,
  Pencil,
  Plus,
  ShieldCheck,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { useAdminTrustBadges, useContentMutations } from "@/hooks/use-admin-content";
import {
  confirmAdminAction,
  showAdminError,
  showAdminSuccess,
} from "@/lib/admin/alerts";
import type { AdminTrustBadge } from "@/lib/content/mapper";
import type { TrustBadgeInput } from "@/lib/content/schemas";

const iconOptions = {
  ShieldCheck,
  BadgeCheck,
  FlaskConical,
  Stethoscope,
  Award,
  Microscope,
} as const;

type IconKey = keyof typeof iconOptions;

export function TrustBadgeManager() {
  const { data: badges = [], isLoading, refetch } = useAdminTrustBadges();
  const { createBadge, updateBadge, deleteBadge } = useContentMutations();
  const [editing, setEditing] = useState<AdminTrustBadge | null>(null);
  const [creating, setCreating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[160px] items-center justify-center text-sm text-neutral-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-green-600" />
        Loading badges…
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-neutral-900">Trust badges</h2>
          <p className="mt-1 text-sm text-neutral-500">Homepage credibility strip under the hero</p>
        </div>
        <Button
          className="h-10 rounded-xl bg-brand-green-600 text-white hover:bg-brand-green-900"
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add badge
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {badges.map((badge) => {
          const Icon = iconOptions[badge.iconKey as IconKey] ?? ShieldCheck;
          return (
            <article
              key={badge.id}
              className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green-100 text-brand-green-700">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-900">{badge.title}</p>
                <p className="mt-1 text-sm text-neutral-500">{badge.description}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    className="h-8 rounded-lg"
                    onClick={() => {
                      setCreating(false);
                      setEditing(badge);
                    }}
                    type="button"
                    variant="outline"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    className="h-8 rounded-lg text-red-600 hover:bg-red-50"
                    onClick={async () => {
                      const ok = await confirmAdminAction({
                        title: "Delete badge?",
                        text: "This removes it from the homepage.",
                        confirmText: "Delete",
                      });
                      if (!ok) return;
                      try {
                        await deleteBadge.mutateAsync(badge.id);
                        await showAdminSuccess("Badge deleted", "Trust strip updated.");
                      } catch (err) {
                        await showAdminError(
                          "Delete failed",
                          err instanceof Error ? err.message : "Try again."
                        );
                      }
                    }}
                    type="button"
                    variant="outline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <BadgeModal
        open={creating || Boolean(editing)}
        badge={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={async (input) => {
          try {
            if (editing) {
              await updateBadge.mutateAsync({ id: editing.id, input });
            } else {
              await createBadge.mutateAsync(input);
            }
            await showAdminSuccess("Badge saved", "Homepage trust strip updated.");
            setCreating(false);
            setEditing(null);
            await refetch();
          } catch (err) {
            await showAdminError("Save failed", err instanceof Error ? err.message : "Try again.");
          }
        }}
      />
    </section>
  );
}

function BadgeModal({
  open,
  badge,
  onClose,
  onSave,
}: {
  open: boolean;
  badge: AdminTrustBadge | null;
  onClose: () => void;
  onSave: (input: TrustBadgeInput) => Promise<void>;
}) {
  const [mounted, setMounted] = useState(false);
  const [iconKey, setIconKey] = useState<IconKey>("ShieldCheck");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    setIconKey((badge?.iconKey as IconKey) || "ShieldCheck");
    setTitle(badge?.title ?? "");
    setDescription(badge?.description ?? "");
  }, [badge, open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button aria-label="Close" className="absolute inset-0 bg-neutral-950/50" onClick={onClose} type="button" />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold">{badge ? "Edit badge" : "New badge"}</h3>
          <button onClick={onClose} type="button">
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>
        <div className="space-y-3">
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Icon</span>
            <select
              className="h-10 w-full rounded-xl border border-neutral-200 px-3"
              onChange={(e) => setIconKey(e.target.value as IconKey)}
              value={iconKey}
            >
              {Object.keys(iconOptions).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Title</span>
            <input
              className="h-10 w-full rounded-xl border border-neutral-200 px-3"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Description</span>
            <input
              className="h-10 w-full rounded-xl border border-neutral-200 px-3"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button
            className="bg-brand-green-600 text-white hover:bg-brand-green-900"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              await onSave({
                iconKey,
                title,
                description,
                sortOrder: badge?.sortOrder ?? 0,
                isActive: true,
              });
              setSaving(false);
            }}
            type="button"
          >
            Save
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
