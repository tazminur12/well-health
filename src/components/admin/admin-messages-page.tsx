"use client";

import {
  Archive,
  CheckCheck,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  useAdminMessages,
  useMessageMutations,
} from "@/hooks/use-admin-messages";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import type {
  AdminContactMessage,
  ContactMessageFilter,
  ContactMessageStatus,
} from "@/lib/messages/schemas";
import { cn } from "@/lib/utils";

const filters: { id: ContactMessageFilter; label: string }[] = [
  { id: "all", label: "Inbox" },
  { id: "new", label: "New" },
  { id: "read", label: "Read" },
  { id: "replied", label: "Replied" },
  { id: "archived", label: "Archived" },
];

const statusMeta: Record<ContactMessageStatus, { label: string; pill: string }> = {
  NEW: { label: "New", pill: "bg-brand-green-100 text-brand-green-800" },
  READ: { label: "Read", pill: "bg-blue-100 text-blue-800" },
  REPLIED: { label: "Replied", pill: "bg-purple-100 text-purple-800" },
  ARCHIVED: { label: "Archived", pill: "bg-neutral-100 text-neutral-600" },
};

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminMessagesPage() {
  const searchParams = useSearchParams();
  const deepLinkId = searchParams.get("id");

  const [filter, setFilter] = useState<ContactMessageFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(deepLinkId);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const { data, isLoading, isError, error, refetch } = useAdminMessages(filter);
  const { markRead, markAllRead, updateMessage, deleteMessage } = useMessageMutations();

  const unreadCount = data?.unreadCount ?? 0;

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
    );
  }, [data?.items, search]);

  const selected: AdminContactMessage | null =
    filtered.find((m) => m.id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (deepLinkId) setSelectedId(deepLinkId);
  }, [deepLinkId]);

  useEffect(() => {
    if (!selected) {
      setNotes("");
      return;
    }
    setNotes(selected.adminNotes ?? "");
    setSelectedId(selected.id);
    if (selected.status === "NEW") {
      void markRead.mutateAsync(selected.id).catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mark once when selection changes
  }, [selected?.id]);

  async function handleStatus(status: ContactMessageStatus) {
    if (!selected) return;
    try {
      await updateMessage.mutateAsync({ id: selected.id, input: { status } });
      await showAdminSuccess("Updated", `Marked as ${statusMeta[status].label.toLowerCase()}.`);
    } catch (err) {
      await showAdminError("Update failed", err instanceof Error ? err.message : "Try again.");
    }
  }

  async function handleSaveNotes() {
    if (!selected) return;
    setSavingNotes(true);
    try {
      await updateMessage.mutateAsync({
        id: selected.id,
        input: { adminNotes: notes, status: selected.status === "NEW" ? "READ" : undefined },
      });
      await showAdminSuccess("Saved", "Internal notes updated.");
    } catch (err) {
      await showAdminError("Couldn’t save", err instanceof Error ? err.message : "Try again.");
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleMarkReplied() {
    if (!selected) return;
    try {
      await updateMessage.mutateAsync({
        id: selected.id,
        input: { status: "REPLIED", adminNotes: notes },
      });
      await showAdminSuccess("Replied", "Message marked as replied.");
    } catch (err) {
      await showAdminError("Update failed", err instanceof Error ? err.message : "Try again.");
    }
  }

  async function handleDelete() {
    if (!selected) return;
    const ok = await confirmAdminAction({
      title: "Delete message?",
      text: "This removes the contact inquiry permanently.",
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      const id = selected.id;
      await deleteMessage.mutateAsync(id);
      setSelectedId(null);
      await showAdminSuccess("Deleted", "Message removed.");
    } catch (err) {
      await showAdminError("Couldn’t delete", err instanceof Error ? err.message : "Try again.");
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllRead.mutateAsync();
      await showAdminSuccess("Done", "All new messages marked as read.");
    } catch (err) {
      await showAdminError("Failed", err instanceof Error ? err.message : "Try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-7 w-7 animate-spin text-brand-green-600" />
        Loading inbox…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-center">
        <p className="font-heading text-lg font-bold text-neutral-900">Couldn’t load messages</p>
        <p className="text-sm text-neutral-500">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
        <Button onClick={() => void refetch()} type="button" variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-[#0B4D3A] via-[#127A56] to-[#16875D] p-6 text-white shadow-sm sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#C9A24B]/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-accent ring-1 ring-white/15">
              <Inbox className="h-3.5 w-3.5" />
              Messages / Chat inbox
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Contact inquiries
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
              Messages submitted from the public Contact page land here for your support team.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 ? (
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20">
                {unreadCount} new
              </span>
            ) : null}
            <Button
              className="h-10 gap-2 rounded-xl border-0 bg-white/15 text-white hover:bg-white/25"
              disabled={unreadCount === 0}
              onClick={() => void handleMarkAllRead()}
              type="button"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((item) => (
              <button
                key={item.id}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                  filter === item.id
                    ? "bg-brand-green-600 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
                onClick={() => setFilter(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, subject…"
              value={search}
            />
          </div>
        </div>

        <div className="grid min-h-[560px] lg:grid-cols-[360px_1fr]">
          {/* Thread list */}
          <aside className="border-b border-neutral-100 lg:border-b-0 lg:border-r">
            {filtered.length === 0 ? (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 px-6 text-center">
                <MessageSquare className="h-9 w-9 text-neutral-300" />
                <p className="text-sm font-semibold text-neutral-800">No messages</p>
                <p className="text-xs text-neutral-500">
                  Contact form submissions will appear here.
                </p>
              </div>
            ) : (
              <ul className="max-h-[640px] divide-y divide-neutral-50 overflow-y-auto">
                {filtered.map((item) => {
                  const active = selected?.id === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        className={cn(
                          "flex w-full gap-3 px-4 py-3.5 text-left transition-colors",
                          active
                            ? "bg-brand-green-50/80"
                            : "hover:bg-neutral-50",
                          item.status === "NEW" && !active && "bg-[#F7FBF9]"
                        )}
                        onClick={() => setSelectedId(item.id)}
                        type="button"
                      >
                        <span
                          className={cn(
                            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                            item.status === "NEW"
                              ? "bg-brand-green-600 text-white"
                              : "bg-neutral-100 text-neutral-700"
                          )}
                        >
                          {initials(item.name) || <UserRound className="h-4 w-4" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span
                              className={cn(
                                "truncate text-sm",
                                item.status === "NEW"
                                  ? "font-bold text-neutral-900"
                                  : "font-semibold text-neutral-800"
                              )}
                            >
                              {item.name}
                            </span>
                            <span className="shrink-0 text-[11px] text-neutral-400">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </span>
                          <span className="mt-0.5 block truncate text-xs font-medium text-neutral-600">
                            {item.subject}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-neutral-400">
                            {item.message}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          {/* Detail pane */}
          <section className="flex min-h-[420px] flex-col bg-gradient-to-b from-[#F8FAF9] to-white">
            {!selected ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
                <Inbox className="h-10 w-10 text-neutral-300" />
                <p className="font-heading text-lg font-bold text-neutral-900">Select a message</p>
                <p className="text-sm text-neutral-500">Choose a conversation from the inbox.</p>
              </div>
            ) : (
              <>
                <header className="border-b border-neutral-100 bg-white px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-heading text-xl font-bold text-neutral-900">
                          {selected.subject}
                        </h2>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            statusMeta[selected.status].pill
                          )}
                        >
                          {statusMeta[selected.status].label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-400">
                        {formatFullDate(selected.createdAt)} · via{" "}
                        {selected.source === "home" ? "Homepage" : "Contact page"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selected.status !== "ARCHIVED" ? (
                        <Button
                          className="h-9 gap-1.5 rounded-xl"
                          onClick={() => void handleStatus("ARCHIVED")}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <Archive className="h-3.5 w-3.5" />
                          Archive
                        </Button>
                      ) : (
                        <Button
                          className="h-9 rounded-xl"
                          onClick={() => void handleStatus("READ")}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          Restore
                        </Button>
                      )}
                      <Button
                        className="h-9 gap-1.5 rounded-xl text-red-600 hover:bg-red-50"
                        onClick={() => void handleDelete()}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </header>

                <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                  {/* Contact card */}
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0B4D3A] to-[#16875D] text-sm font-bold text-white">
                        {initials(selected.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-900">{selected.name}</p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                          <a
                            className="inline-flex items-center gap-1 hover:text-brand-green-700"
                            href={`mailto:${selected.email}`}
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {selected.email}
                          </a>
                          <a
                            className="inline-flex items-center gap-1 hover:text-brand-green-700"
                            href={`tel:${selected.phone}`}
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {selected.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat-style bubble */}
                  <div className="flex gap-3">
                    <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green-100 text-xs font-bold text-brand-green-800">
                      {initials(selected.name)}
                    </span>
                    <div className="max-w-[920px] rounded-2xl rounded-tl-md border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                      <p className="text-xs font-semibold text-brand-green-800">{selected.name}</p>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                        {selected.message}
                      </p>
                      <p className="mt-2 text-[11px] text-neutral-400">
                        {formatFullDate(selected.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Internal notes */}
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-neutral-900">Internal notes / reply log</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Private to admin — not emailed automatically yet.
                    </p>
                    <textarea
                      className="mt-3 min-h-[110px] w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What you told the customer, next steps, etc."
                      value={notes}
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        className="h-10 rounded-xl"
                        disabled={savingNotes}
                        onClick={() => void handleSaveNotes()}
                        type="button"
                        variant="outline"
                      >
                        {savingNotes ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Save notes
                      </Button>
                      <Button
                        className="h-10 gap-2 rounded-xl"
                        onClick={() => void handleMarkReplied()}
                        type="button"
                      >
                        <CheckCheck className="h-4 w-4" />
                        Mark as replied
                      </Button>
                      <Button
                        asChild
                        className="h-10 gap-2 rounded-xl"
                        type="button"
                        variant="secondary"
                      >
                        <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}>
                          <Mail className="h-4 w-4" />
                          Reply by email
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
