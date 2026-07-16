"use client";

import {
  Archive,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Handshake,
  Loader2,
  Mail,
  MapPinned,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  useAdminDistributors,
  useDistributorMutations,
} from "@/hooks/use-admin-distributors";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import {
  businessTypeLabels,
  distributorStatusMeta,
  experienceLabels,
  type AdminDistributorApplication,
  type DistributorApplicationFilter,
  type DistributorApplicationStatus,
} from "@/lib/distributors/schemas";
import { cn } from "@/lib/utils";

const filters: { id: DistributorApplicationFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "reviewing", label: "Reviewing" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "archived", label: "Archived" },
];

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
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className={cn("rounded-2xl border px-4 py-3.5 shadow-sm", tone)}>
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

export function AdminDistributorsPage() {
  const searchParams = useSearchParams();
  const deepLinkId = searchParams.get("id");

  const [filter, setFilter] = useState<DistributorApplicationFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(deepLinkId);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const { data, isLoading, isError, error, refetch } = useAdminDistributors(filter);
  const { updateApplication, markReviewing, deleteApplication } = useDistributorMutations();

  const stats = data?.stats;
  const newCount = data?.newCount ?? 0;

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (item) =>
        item.fullName.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.phone.includes(query) ||
        item.district.toLowerCase().includes(query) ||
        item.division.toLowerCase().includes(query) ||
        (item.businessName?.toLowerCase().includes(query) ?? false) ||
        item.coverageArea.toLowerCase().includes(query)
    );
  }, [data?.items, search]);

  const selected: AdminDistributorApplication | null =
    filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

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
      void markReviewing.mutateAsync(selected.id).catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mark once when selection changes
  }, [selected?.id]);

  async function handleStatus(status: DistributorApplicationStatus) {
    if (!selected) return;
    try {
      const result = await updateApplication.mutateAsync({
        id: selected.id,
        input: { status, adminNotes: notes },
      });
      await showAdminSuccess(
        status === "APPROVED" ? "Partner approved" : "Updated",
        result.success ??
          `Application marked as ${distributorStatusMeta[status].label.toLowerCase()}.`
      );
    } catch (err) {
      await showAdminError("Update failed", err instanceof Error ? err.message : "Try again.");
    }
  }

  async function handleSaveNotes() {
    if (!selected) return;
    setSavingNotes(true);
    try {
      const result = await updateApplication.mutateAsync({
        id: selected.id,
        input: { adminNotes: notes },
      });
      await showAdminSuccess("Saved", result.success ?? "Internal notes updated.");
    } catch (err) {
      await showAdminError("Couldn’t save", err instanceof Error ? err.message : "Try again.");
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    const ok = await confirmAdminAction({
      title: "Delete application?",
      text: "This removes the distributor application permanently.",
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      const id = selected.id;
      await deleteApplication.mutateAsync(id);
      setSelectedId(null);
      await showAdminSuccess("Deleted", "Application removed.");
    } catch (err) {
      await showAdminError("Couldn’t delete", err instanceof Error ? err.message : "Try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-7 w-7 animate-spin text-brand-green-600" />
        Loading distributor applications…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-center">
        <p className="font-heading text-lg font-bold text-neutral-900">
          Couldn’t load applications
        </p>
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
      <section className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-[#0B4D3A] via-[#8B6914] to-[#16875D] p-6 text-white shadow-sm sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#C9A24B]/25 blur-3xl"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#F5E6C0] ring-1 ring-white/15">
              <Handshake className="h-3.5 w-3.5" />
              Partnership pipeline
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Distributor applications
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
              Review partnership enquiries submitted from the public distributor page. Track
              territory fit, approve partners, and keep internal notes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              asChild
              className="h-10 gap-2 rounded-xl border-0 bg-[#C9A24B] text-[#062E24] hover:bg-[#bb943e]"
            >
              <Link href="/admin/distributors/new">
                <Plus className="h-4 w-4" />
                Add distributor
              </Link>
            </Button>
            {newCount > 0 ? (
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20">
                {newCount} new application{newCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {stats ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard
            label="Total"
            tone="border-neutral-200/80 bg-white"
            value={stats.total}
          />
          <StatCard
            label="New"
            tone="border-brand-green-100 bg-brand-green-50/60"
            value={stats.new}
          />
          <StatCard
            label="Reviewing"
            tone="border-blue-100 bg-blue-50/60"
            value={stats.reviewing}
          />
          <StatCard
            label="Approved"
            tone="border-emerald-100 bg-emerald-50/60"
            value={stats.approved}
          />
          <StatCard
            label="Rejected"
            tone="border-red-100 bg-red-50/60"
            value={stats.rejected}
          />
          <StatCard
            label="Archived"
            tone="border-neutral-200 bg-neutral-50"
            value={stats.archived}
          />
        </section>
      ) : null}

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
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, district, business…"
              value={search}
            />
          </div>
        </div>

        <div className="grid min-h-[560px] lg:grid-cols-[380px_1fr]">
          <aside className="border-b border-neutral-100 lg:border-b-0 lg:border-r">
            {filtered.length === 0 ? (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 px-6 text-center">
                <Handshake className="h-9 w-9 text-neutral-300" />
                <p className="text-sm font-semibold text-neutral-800">No applications</p>
                <p className="text-xs text-neutral-500">
                  Distributor enquiries from the public site will appear here.
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
                          active ? "bg-brand-green-50/80" : "hover:bg-neutral-50",
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
                          {initials(item.fullName) || <UserRound className="h-4 w-4" />}
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
                              {item.fullName}
                            </span>
                            <span className="shrink-0 text-[11px] text-neutral-400">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </span>
                          <span className="mt-0.5 block truncate text-xs font-medium text-neutral-600">
                            {item.district}, {item.division}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-neutral-400">
                            {businessTypeLabels[item.businessType]}
                            {item.businessName ? ` · ${item.businessName}` : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          <section className="flex min-h-[420px] flex-col bg-gradient-to-b from-[#F8FAF9] to-white">
            {!selected ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
                <Handshake className="h-10 w-10 text-neutral-300" />
                <p className="font-heading text-lg font-bold text-neutral-900">
                  Select an application
                </p>
                <p className="text-sm text-neutral-500">
                  Choose a distributor enquiry to review details and update status.
                </p>
              </div>
            ) : (
              <>
                <header className="border-b border-neutral-100 bg-white px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-heading text-xl font-bold text-neutral-900">
                          {selected.fullName}
                        </h2>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            distributorStatusMeta[selected.status].pill
                          )}
                        >
                          {distributorStatusMeta[selected.status].label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-400">
                        Applied {formatFullDate(selected.createdAt)}
                        {selected.reviewedAt
                          ? ` · Reviewed ${formatFullDate(selected.reviewedAt)}`
                          : ""}
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
                          onClick={() => void handleStatus("REVIEWING")}
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
                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm transition-colors hover:border-brand-green-600/30 hover:bg-brand-green-50/40"
                      href={`tel:${selected.phone}`}
                    >
                      <Phone className="h-4 w-4 text-brand-green-600" />
                      <span className="font-medium text-neutral-800">{selected.phone}</span>
                    </a>
                    <a
                      className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm transition-colors hover:border-brand-green-600/30 hover:bg-brand-green-50/40"
                      href={`mailto:${selected.email}`}
                    >
                      <Mail className="h-4 w-4 text-brand-green-600" />
                      <span className="truncate font-medium text-neutral-800">{selected.email}</span>
                    </a>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-neutral-200 bg-white p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Location
                      </p>
                      <p className="mt-2 flex items-start gap-2 text-sm font-medium text-neutral-800">
                        <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-600" />
                        {selected.district}, {selected.division}
                      </p>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Coverage area
                      </p>
                      <p className="mt-2 text-sm font-medium text-neutral-800">
                        {selected.coverageArea}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-neutral-200 bg-white p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Business
                      </p>
                      <p className="mt-2 flex items-start gap-2 text-sm font-medium text-neutral-800">
                        <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-600" />
                        <span>
                          {businessTypeLabels[selected.businessType]}
                          {selected.businessName ? (
                            <>
                              <br />
                              <span className="font-normal text-neutral-500">
                                {selected.businessName}
                              </span>
                            </>
                          ) : null}
                        </span>
                      </p>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Experience
                      </p>
                      <p className="mt-2 text-sm font-medium text-neutral-800">
                        {experienceLabels[selected.experience]}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-200 bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Introduction
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-700">
                      {selected.message}
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-200 bg-white p-4">
                    <label
                      className="text-[11px] font-bold uppercase tracking-wider text-neutral-400"
                      htmlFor="distributor-notes"
                    >
                      Internal notes
                    </label>
                    <textarea
                      className="mt-3 min-h-28 w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-3 py-2.5 text-sm text-neutral-800 outline-none focus:border-brand-green-600 focus:bg-white focus:ring-2 focus:ring-brand-green-600/20"
                      id="distributor-notes"
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Territory notes, follow-up plan, onboarding details…"
                      value={notes}
                    />
                    <div className="mt-3 flex justify-end">
                      <Button
                        className="h-9 rounded-xl"
                        disabled={savingNotes}
                        onClick={() => void handleSaveNotes()}
                        size="sm"
                        type="button"
                      >
                        {savingNotes ? "Saving…" : "Save notes"}
                      </Button>
                    </div>
                  </div>
                </div>

                <footer className="border-t border-neutral-100 bg-white px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    {selected.status !== "APPROVED" ? (
                      <Button
                        className="h-10 gap-2 rounded-xl bg-brand-green-600 hover:bg-brand-green-900"
                        onClick={() => void handleStatus("APPROVED")}
                        type="button"
                      >
                        <BadgeCheck className="h-4 w-4" />
                        Approve partner
                      </Button>
                    ) : null}
                    {selected.status !== "REJECTED" ? (
                      <Button
                        className="h-10 gap-2 rounded-xl"
                        onClick={() => void handleStatus("REJECTED")}
                        type="button"
                        variant="outline"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    ) : null}
                    {selected.status === "NEW" || selected.status === "REVIEWING" ? (
                      <Button
                        className="h-10 gap-2 rounded-xl"
                        onClick={() => void handleStatus("REVIEWING")}
                        type="button"
                        variant="outline"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Keep reviewing
                      </Button>
                    ) : null}
                    <a
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 sm:ml-auto"
                      href={`mailto:${selected.email}?subject=${encodeURIComponent(`Well Health Distributor Application — ${selected.district}`)}`}
                    >
                      <Mail className="h-4 w-4" />
                      Email applicant
                    </a>
                  </div>
                </footer>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
