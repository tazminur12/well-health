"use client";

import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { useAdminFaqItems, useContentMutations } from "@/hooks/use-admin-content";
import {
  confirmAdminAction,
  showAdminError,
  showAdminSuccess,
} from "@/lib/admin/alerts";
import type { AdminFaqItem } from "@/lib/content/mapper";
import type { FaqItemInput } from "@/lib/content/schemas";
import { cn } from "@/lib/utils";

export function FaqContentManager() {
  const { data: items = [], isLoading, refetch } = useAdminFaqItems();
  const { createFaq, updateFaq, deleteFaq, toggleFaq } = useContentMutations();
  const [editing, setEditing] = useState<AdminFaqItem | null>(null);
  const [creating, setCreating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[160px] items-center justify-center text-sm text-neutral-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-green-600" />
        Loading FAQs…
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-neutral-900">FAQ</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Homepage accordion answers for delivery, COD, and quality
          </p>
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
          Add question
        </Button>
      </header>

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-neutral-900">{item.question}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      item.isActive
                        ? "bg-brand-green-100 text-brand-green-700"
                        : "bg-neutral-200 text-neutral-600"
                    )}
                  >
                    {item.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{item.answer}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  className="h-8 rounded-lg"
                  onClick={() => void toggleFaq.mutateAsync(item.id).then(() => refetch())}
                  type="button"
                  variant="outline"
                >
                  {item.isActive ? "Hide" : "Show"}
                </Button>
                <Button
                  className="h-8 rounded-lg"
                  onClick={() => {
                    setCreating(false);
                    setEditing(item);
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
                      title: "Delete FAQ?",
                      text: "This question will be removed from the homepage.",
                      confirmText: "Delete",
                    });
                    if (!ok) return;
                    try {
                      await deleteFaq.mutateAsync(item.id);
                      await showAdminSuccess("FAQ deleted", "Homepage FAQ updated.");
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
        ))}
      </div>

      <FaqModal
        open={creating || Boolean(editing)}
        item={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={async (input) => {
          try {
            if (editing) await updateFaq.mutateAsync({ id: editing.id, input });
            else await createFaq.mutateAsync(input);
            await showAdminSuccess("FAQ saved", "Homepage FAQ updated.");
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

function FaqModal({
  open,
  item,
  onClose,
  onSave,
}: {
  open: boolean;
  item: AdminFaqItem | null;
  onClose: () => void;
  onSave: (input: FaqItemInput) => Promise<void>;
}) {
  const [mounted, setMounted] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    setQuestion(item?.question ?? "");
    setAnswer(item?.answer ?? "");
  }, [item, open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button aria-label="Close" className="absolute inset-0 bg-neutral-950/50" onClick={onClose} type="button" />
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold">{item ? "Edit FAQ" : "New FAQ"}</h3>
          <button onClick={onClose} type="button">
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>
        <div className="space-y-3">
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Question</span>
            <input
              className="h-10 w-full rounded-xl border border-neutral-200 px-3"
              onChange={(e) => setQuestion(e.target.value)}
              value={question}
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Answer</span>
            <textarea
              className="min-h-[120px] w-full rounded-xl border border-neutral-200 px-3 py-2"
              onChange={(e) => setAnswer(e.target.value)}
              value={answer}
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
                question,
                answer,
                sortOrder: item?.sortOrder ?? 0,
                isActive: item?.isActive ?? true,
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
