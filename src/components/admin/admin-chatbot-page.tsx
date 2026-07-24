"use client";

import {
  Bot,
  HelpCircle,
  Loader2,
  MessageSquareWarning,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  useAdminChatbotQas,
  useAdminChatbotUnanswered,
  useChatbotMutations,
} from "@/hooks/use-admin-chatbot";
import {
  confirmAdminAction,
  showAdminError,
  showAdminSuccess,
} from "@/lib/admin/alerts";
import type { AdminChatbotQa, ChatbotQaInput } from "@/lib/chatbot/schemas";
import { cn } from "@/lib/utils";

type Tab = "knowledge" | "unanswered" | "test";

const emptyForm: ChatbotQaInput = {
  question: "",
  answer: "",
  aliases: [],
  keywords: [],
  category: "",
  isActive: true,
  isQuickReply: false,
  sortOrder: 0,
};

function listToTextarea(items: string[]) {
  return items.join("\n");
}

function textareaToList(value: string) {
  return value
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminChatbotPage() {
  const { data: items = [], isLoading, isError, error, refetch } = useAdminChatbotQas();
  const {
    data: unanswered = [],
    isLoading: unansweredLoading,
    refetch: refetchUnanswered,
  } = useAdminChatbotUnanswered();
  const {
    createQa,
    updateQa,
    deleteQa,
    toggleQa,
    dismissUnanswered,
    createFromUnanswered,
    testMatch,
  } = useChatbotMutations();

  const [tab, setTab] = useState<Tab>("knowledge");
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminChatbotQa | null>(null);
  const [form, setForm] = useState<ChatbotQaInput>(emptyForm);
  const [aliasesText, setAliasesText] = useState("");
  const [keywordsText, setKeywordsText] = useState("");
  const [fromUnansweredId, setFromUnansweredId] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState("");
  const [testResult, setTestResult] = useState<{
    score: number;
    confidence: number;
    answer: string;
    qa: AdminChatbotQa | null;
  } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [items, search]);

  const stats = useMemo(() => {
    const active = items.filter((i) => i.isActive).length;
    const quick = items.filter((i) => i.isQuickReply && i.isActive).length;
    const hits = items.reduce((sum, i) => sum + i.hitCount, 0);
    return { total: items.length, active, quick, hits, unanswered: unanswered.length };
  }, [items, unanswered.length]);

  function openCreate(seed?: Partial<ChatbotQaInput>, unansweredId?: string) {
    setEditing(null);
    setFromUnansweredId(unansweredId ?? null);
    const next = { ...emptyForm, sortOrder: items.length, ...seed };
    setForm(next);
    setAliasesText(listToTextarea(next.aliases ?? []));
    setKeywordsText(listToTextarea(next.keywords ?? []));
    setDrawerOpen(true);
  }

  function openEdit(item: AdminChatbotQa) {
    setEditing(item);
    setFromUnansweredId(null);
    setForm({
      question: item.question,
      answer: item.answer,
      aliases: item.aliases,
      keywords: item.keywords,
      category: item.category ?? "",
      isActive: item.isActive,
      isQuickReply: item.isQuickReply,
      sortOrder: item.sortOrder,
    });
    setAliasesText(listToTextarea(item.aliases));
    setKeywordsText(listToTextarea(item.keywords));
    setDrawerOpen(true);
  }

  async function handleSave() {
    const payload: ChatbotQaInput = {
      ...form,
      aliases: textareaToList(aliasesText),
      keywords: textareaToList(keywordsText),
    };
    try {
      if (fromUnansweredId) {
        await createFromUnanswered.mutateAsync({
          unansweredId: fromUnansweredId,
          input: payload,
        });
        await showAdminSuccess("Trained", "Unanswered question converted to Q&A.");
      } else if (editing) {
        await updateQa.mutateAsync({ id: editing.id, input: payload });
        await showAdminSuccess("Updated", "Q&A saved.");
      } else {
        await createQa.mutateAsync(payload);
        await showAdminSuccess("Created", "New Q&A added to the knowledge base.");
      }
      setDrawerOpen(false);
    } catch (err) {
      await showAdminError(
        "Save failed",
        err instanceof Error ? err.message : "Could not save Q&A."
      );
    }
  }

  async function handleDelete(item: AdminChatbotQa) {
    const ok = await confirmAdminAction({
      title: `Delete “${item.question.slice(0, 48)}”?`,
      text: "This removes the trained answer from the chatbot.",
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await deleteQa.mutateAsync(item.id);
      await showAdminSuccess("Deleted", "Q&A removed.");
    } catch (err) {
      await showAdminError(
        "Delete failed",
        err instanceof Error ? err.message : "Could not delete."
      );
    }
  }

  async function handleTest() {
    try {
      const result = await testMatch.mutateAsync(testMessage);
      setTestResult(result);
    } catch (err) {
      await showAdminError(
        "Test failed",
        err instanceof Error ? err.message : "Could not test match."
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-7 w-7 animate-spin text-brand-green-600" />
        Loading chatbot knowledge…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">
          Couldn’t load chatbot
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
        <Button className="mt-5 rounded-xl" onClick={() => void refetch()} type="button">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-green-100 bg-brand-green-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-green-800">
            <Bot className="h-3.5 w-3.5" />
            Knowledge base
          </div>
          <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Chatbot trainer
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            Add questions, aliases, and keywords so the public chat widget can answer visitors
            confidently — no AI API required.
          </p>
        </div>
        <Button
          className="rounded-xl bg-brand-green-600 hover:bg-brand-green-900"
          onClick={() => openCreate()}
          type="button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Q&A
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total Q&A", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Quick replies", value: stats.quick },
          { label: "Hits", value: stats.hits },
          { label: "Unanswered", value: stats.unanswered },
        ].map((stat) => (
          <div
            className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-[#E8F5EE] to-white p-4 shadow-sm"
            key={stat.label}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {stat.label}
            </p>
            <p className="mt-1 font-heading text-2xl font-bold text-neutral-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "knowledge" as const, label: "Knowledge", icon: Sparkles },
            { id: "unanswered" as const, label: "Unanswered", icon: MessageSquareWarning },
            { id: "test" as const, label: "Test match", icon: HelpCircle },
          ] as const
        ).map((item) => (
          <button
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
              tab === item.id
                ? "bg-brand-green-600 text-white"
                : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
            )}
            key={item.id}
            onClick={() => setTab(item.id)}
            type="button"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
            {item.id === "unanswered" && unanswered.length > 0 ? (
              <span className="rounded-full bg-white/20 px-1.5 text-[10px]">
                {unanswered.length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "knowledge" ? (
        <section className="space-y-4">
          <input
            className="h-11 w-full max-w-md rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-brand-green-400"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions, keywords…"
            value={search}
          />
          <div className="space-y-3">
            {filtered.map((item) => (
              <article
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
                key={item.id}
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
                        {item.isActive ? "Active" : "Off"}
                      </span>
                      {item.isQuickReply ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                          Quick reply
                        </span>
                      ) : null}
                      {item.category ? (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                          {item.category}
                        </span>
                      ) : null}
                      <span className="text-[11px] text-neutral-400">{item.hitCount} hits</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{item.answer}</p>
                    {item.keywords.length > 0 ? (
                      <p className="mt-2 text-xs text-neutral-400">
                        Keywords: {item.keywords.slice(0, 8).join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="h-8 rounded-lg"
                      onClick={() => void toggleQa.mutateAsync(item.id)}
                      type="button"
                      variant="outline"
                    >
                      {item.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      className="h-8 rounded-lg"
                      onClick={() => openEdit(item)}
                      type="button"
                      variant="outline"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      className="h-8 rounded-lg text-red-600 hover:bg-red-50"
                      onClick={() => void handleDelete(item)}
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
                No Q&A yet. Add your first trained answer.
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {tab === "unanswered" ? (
        <section className="space-y-3">
          {unansweredLoading ? (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : unanswered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
              No unanswered questions — visitors are getting matches, or nothing asked yet.
            </div>
          ) : (
            unanswered.map((row) => (
              <article
                className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 to-white p-4 shadow-sm"
                key={row.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-neutral-900">{row.question}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Asked {row.count}× · last{" "}
                      {new Date(row.lastAskedAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="h-8 rounded-lg bg-brand-green-600 text-white hover:bg-brand-green-900"
                      onClick={() =>
                        openCreate(
                          {
                            question: row.question,
                            aliases: [row.question],
                            keywords: [],
                          },
                          row.id
                        )
                      }
                      type="button"
                    >
                      Train answer
                    </Button>
                    <Button
                      className="h-8 rounded-lg"
                      onClick={() =>
                        void dismissUnanswered.mutateAsync(row.id).then(() => {
                          void refetchUnanswered();
                          void showAdminSuccess("Dismissed", "Removed from queue.");
                        })
                      }
                      type="button"
                      variant="outline"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      ) : null}

      {tab === "test" ? (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-neutral-900">Live match preview</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Type what a visitor might say and see which trained answer wins.
          </p>
          <textarea
            className="mt-4 min-h-[100px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-green-400"
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="e.g. COD আছে? / How do I track my order?"
            value={testMessage}
          />
          <Button
            className="mt-3 rounded-xl bg-brand-green-600 hover:bg-brand-green-900"
            disabled={testMatch.isPending || !testMessage.trim()}
            onClick={() => void handleTest()}
            type="button"
          >
            {testMatch.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing…
              </>
            ) : (
              "Run match"
            )}
          </Button>
          {testResult ? (
            <div className="mt-4 rounded-xl border border-brand-green-100 bg-brand-green-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-green-800">
                {testResult.qa
                  ? `Matched · score ${testResult.score.toFixed(2)}`
                  : "No confident match · fallback"}
              </p>
              {testResult.qa ? (
                <p className="mt-2 text-sm font-semibold text-neutral-900">
                  {testResult.qa.question}
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-neutral-700">{testResult.answer}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {drawerOpen && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[80] flex justify-end bg-black/40 p-0 sm:p-4">
              <button
                aria-label="Close"
                className="absolute inset-0 cursor-default"
                onClick={() => setDrawerOpen(false)}
                type="button"
              />
              <div className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl sm:rounded-2xl">
                <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-neutral-900">
                      {editing ? "Edit Q&A" : fromUnansweredId ? "Train from unanswered" : "New Q&A"}
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Aliases & keywords improve Bangla/English matching.
                    </p>
                  </div>
                  <button
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100"
                    onClick={() => setDrawerOpen(false)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-neutral-700">Question</span>
                    <input
                      className="h-11 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-brand-green-400"
                      onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                      value={form.question}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-neutral-700">Answer</span>
                    <textarea
                      className="min-h-[140px] w-full rounded-xl border border-neutral-200 px-3 py-2 outline-none focus:border-brand-green-400"
                      onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                      value={form.answer}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-neutral-700">
                      Aliases (one per line)
                    </span>
                    <textarea
                      className="min-h-[88px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-green-400"
                      onChange={(e) => setAliasesText(e.target.value)}
                      placeholder={"COD available?\nক্যাশ অন ডেলিভারি আছে?"}
                      value={aliasesText}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-neutral-700">
                      Keywords (comma or line)
                    </span>
                    <textarea
                      className="min-h-[72px] w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-green-400"
                      onChange={(e) => setKeywordsText(e.target.value)}
                      placeholder="cod, cash, ক্যাশ"
                      value={keywordsText}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-neutral-700">Category</span>
                    <input
                      className="h-11 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-brand-green-400"
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      placeholder="Shipping, Payment…"
                      value={form.category ?? ""}
                    />
                  </label>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input
                        checked={Boolean(form.isActive)}
                        onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                        type="checkbox"
                      />
                      Active
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        checked={Boolean(form.isQuickReply)}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, isQuickReply: e.target.checked }))
                        }
                        type="checkbox"
                      />
                      Show as quick reply chip
                    </label>
                  </div>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-neutral-700">Sort order</span>
                    <input
                      className="h-11 w-32 rounded-xl border border-neutral-200 px-3 outline-none focus:border-brand-green-400"
                      min={0}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
                      }
                      type="number"
                      value={form.sortOrder ?? 0}
                    />
                  </label>
                </div>
                <div className="border-t border-neutral-100 px-5 py-4">
                  <Button
                    className="w-full rounded-xl bg-brand-green-600 hover:bg-brand-green-900"
                    disabled={
                      createQa.isPending ||
                      updateQa.isPending ||
                      createFromUnanswered.isPending
                    }
                    onClick={() => void handleSave()}
                    type="button"
                  >
                    {createQa.isPending ||
                    updateQa.isPending ||
                    createFromUnanswered.isPending
                      ? "Saving…"
                      : editing
                        ? "Save changes"
                        : "Save Q&A"}
                  </Button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
