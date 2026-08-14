"use client";

import {
  Archive,
  ArrowLeft,
  BadgeCheck,
  Building2,
  Handshake,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  distributorAvatarTone,
  distributorInitials,
  formatDistributorDate,
} from "@/components/admin/admin-distributors-table";
import { Button } from "@/components/ui/button";
import { useAdminDistributor, useDistributorMutations } from "@/hooks/use-admin-distributors";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import {
  businessTypeLabels,
  distributorStatusMeta,
  experienceLabels,
  type DistributorApplicationStatus,
} from "@/lib/distributors/schemas";
import { cn } from "@/lib/utils";

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminDistributorDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data: application, isLoading, isError, error } = useAdminDistributor(id);
  const { updateApplication, markReviewing, deleteApplication } = useDistributorMutations();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (!application) return;
    setNotes(application.adminNotes ?? "");
    if (application.status === "NEW") {
      void markReviewing.mutateAsync(application.id).catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mark once when record loads
  }, [application?.id]);

  async function handleStatus(status: DistributorApplicationStatus) {
    if (!application) return;
    startTransition(async () => {
      try {
        const result = await updateApplication.mutateAsync({
          id: application.id,
          input: { status, adminNotes: notes },
        });
        await showAdminSuccess(
          status === "APPROVED" ? "Partner approved" : "Status updated",
          result.success ?? `Marked as ${distributorStatusMeta[status].label.toLowerCase()}.`
        );
        router.refresh();
      } catch (err) {
        await showAdminError(
          "Update failed",
          err instanceof Error ? err.message : "Please try again."
        );
      }
    });
  }

  async function handleSaveNotes() {
    if (!application) return;
    setSavingNotes(true);
    try {
      const result = await updateApplication.mutateAsync({
        id: application.id,
        input: { adminNotes: notes },
      });
      await showAdminSuccess("Notes saved", result.success ?? "Internal notes updated.");
    } catch (err) {
      await showAdminError("Couldn’t save", err instanceof Error ? err.message : "Try again.");
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleDelete() {
    if (!application) return;
    const confirmed = await confirmAdminAction({
      title: "Delete application?",
      text: "This removes the distributor record permanently.",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteApplication.mutateAsync(application.id);
        await showAdminSuccess("Deleted", "The application has been removed.");
        router.push("/admin/distributors");
        router.refresh();
      } catch (err) {
        await showAdminError(
          "Delete failed",
          err instanceof Error ? err.message : "Please try again."
        );
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading distributor…
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">Distributor not found</h2>
        <p className="mt-2 text-sm text-neutral-500">
          {error instanceof Error ? error.message : "This application may have been deleted."}
        </p>
        <Link
          className="mt-5 inline-flex text-sm font-semibold text-brand-green-600 hover:underline"
          href="/admin/distributors"
        >
          Back to distributors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-brand-green-600"
          href="/admin/distributors"
        >
          <ArrowLeft className="h-4 w-4" />
          All distributors
        </Link>
        <div className="flex flex-wrap gap-2">
          {application.status !== "ARCHIVED" ? (
            <Button
              className="h-10 rounded-xl"
              disabled={isPending}
              onClick={() => void handleStatus("ARCHIVED")}
              type="button"
              variant="outline"
            >
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          ) : (
            <Button
              className="h-10 rounded-xl"
              disabled={isPending}
              onClick={() => void handleStatus("REVIEWING")}
              type="button"
              variant="outline"
            >
              Restore
            </Button>
          )}
          <Button
            className="h-10 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
            disabled={isPending}
            onClick={() => void handleDelete()}
            type="button"
            variant="outline"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 bg-[radial-gradient(circle_at_top_right,rgba(22,135,93,0.12),transparent_40%),linear-gradient(135deg,#f8fbf9,#ffffff)] px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "inline-flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold shadow-sm",
                  distributorAvatarTone(application.fullName)
                )}
              >
                {distributorInitials(application.fullName)}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading text-2xl font-bold text-neutral-900">
                    {application.fullName}
                  </h1>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      distributorStatusMeta[application.status].pill
                    )}
                  >
                    {distributorStatusMeta[application.status].label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  Applied {formatDistributorDate(application.createdAt)}
                  {application.businessName ? ` · ${application.businessName}` : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-medium text-neutral-700 transition-colors hover:border-brand-green-600 hover:text-brand-green-700"
                href={`mailto:${application.email}?subject=${encodeURIComponent(`Well Health Distributor — ${application.district}`)}`}
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
              <a
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-medium text-neutral-700 transition-colors hover:border-brand-green-600 hover:text-brand-green-700"
                href={`tel:${application.phone}`}
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-neutral-100 sm:grid-cols-3">
          {[
            { label: "Territory", value: `${application.district}, ${application.division}` },
            { label: "Business type", value: businessTypeLabels[application.businessType] },
            { label: "Experience", value: experienceLabels[application.experience] },
          ].map((stat) => (
            <div key={stat.label} className="bg-white px-5 py-4 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {stat.label}
              </p>
              <p className="mt-1 font-heading text-lg font-bold text-neutral-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-heading text-lg font-bold text-neutral-900">Contact</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-start gap-3 rounded-xl bg-neutral-50 px-4 py-3">
              <Mail className="mt-0.5 h-4 w-4 text-brand-green-600" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Email
                </dt>
                <dd className="mt-0.5 font-medium text-neutral-900">{application.email}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-neutral-50 px-4 py-3">
              <Phone className="mt-0.5 h-4 w-4 text-brand-green-600" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Phone
                </dt>
                <dd className="mt-0.5 font-medium text-neutral-900">{application.phone}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-neutral-50 px-4 py-3">
              <MapPin className="mt-0.5 h-4 w-4 text-brand-green-600" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Location
                </dt>
                <dd className="mt-0.5 font-medium text-neutral-900">
                  {application.district}, {application.division}
                </dd>
              </div>
            </div>
          </dl>

          <div className="border-t border-neutral-100 pt-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-neutral-900">
              Introduction
            </h3>
            <p className="mt-3 whitespace-pre-line rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600">
              {application.message.trim() || "No introduction provided."}
            </p>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-bold text-neutral-900">Business</h2>
            <Building2 className="h-4 w-4 text-neutral-400" />
          </div>
          <dl className="space-y-3 text-sm">
            <div className="rounded-xl bg-neutral-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Business name
              </dt>
              <dd className="mt-0.5 font-medium text-neutral-900">
                {application.businessName || "Not provided"}
              </dd>
            </div>
            <div className="rounded-xl bg-neutral-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Type
              </dt>
              <dd className="mt-0.5 font-medium text-neutral-900">
                {businessTypeLabels[application.businessType]}
              </dd>
            </div>
            <div className="rounded-xl bg-neutral-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Coverage area
              </dt>
              <dd className="mt-0.5 font-medium text-neutral-900">{application.coverageArea}</dd>
            </div>
            <div className="rounded-xl bg-neutral-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Experience
              </dt>
              <dd className="mt-0.5 font-medium text-neutral-900">
                {experienceLabels[application.experience]}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-bold text-neutral-900">Timeline & notes</h2>
          <Handshake className="h-4 w-4 text-neutral-400" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-neutral-50 px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Applied
            </p>
            <p className="mt-1 font-medium text-neutral-900">{formatFullDate(application.createdAt)}</p>
          </div>
          <div className="rounded-xl bg-neutral-50 px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Last reviewed
            </p>
            <p className="mt-1 font-medium text-neutral-900">
              {application.reviewedAt ? formatFullDate(application.reviewedAt) : "Not reviewed yet"}
            </p>
          </div>
        </div>
        <label className="mt-4 block text-sm font-bold uppercase tracking-[0.14em] text-neutral-900" htmlFor="distributor-notes">
          Internal notes
        </label>
        <textarea
          className="mt-3 min-h-32 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 outline-none focus:border-brand-green-600 focus:bg-white focus:ring-2 focus:ring-brand-green-600/20"
          id="distributor-notes"
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Territory notes, follow-up plan, onboarding details…"
          value={notes}
        />
        <div className="mt-3 flex justify-end">
          <Button
            className="h-10 rounded-xl"
            disabled={savingNotes}
            onClick={() => void handleSaveNotes()}
            type="button"
          >
            {savingNotes ? "Saving…" : "Save notes"}
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:flex-wrap sm:p-6">
        {application.status !== "APPROVED" ? (
          <Button
            className="h-11 gap-2 rounded-xl bg-brand-green-600 hover:bg-brand-green-900"
            disabled={isPending}
            onClick={() => void handleStatus("APPROVED")}
            type="button"
          >
            <BadgeCheck className="h-4 w-4" />
            Approve partner
          </Button>
        ) : null}
        {application.status !== "REJECTED" ? (
          <Button
            className="h-11 gap-2 rounded-xl"
            disabled={isPending}
            onClick={() => void handleStatus("REJECTED")}
            type="button"
            variant="outline"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
        ) : null}
        {application.status === "NEW" || application.status === "REVIEWING" ? (
          <Button
            className="h-11 gap-2 rounded-xl"
            disabled={isPending}
            onClick={() => void handleStatus("REVIEWING")}
            type="button"
            variant="outline"
          >
            Keep reviewing
          </Button>
        ) : null}
      </section>
    </div>
  );
}
