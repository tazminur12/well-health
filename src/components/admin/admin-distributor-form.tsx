"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { bdDivisions, getBdDistricts } from "@/components/customer/address-card";
import { Button } from "@/components/ui/button";
import { useDistributorMutations } from "@/hooks/use-admin-distributors";
import { showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import {
  businessTypeLabels,
  distributorStatusMeta,
  experienceLabels,
  type CreateDistributorApplicationInput,
  type DistributorApplicationStatus,
  type DistributorBusinessType,
  type DistributorExperience,
} from "@/lib/distributors/schemas";

const fieldClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-brand-green-400 focus:ring-2 focus:ring-brand-green-400/20";

const textareaClass =
  "min-h-28 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-400 focus:ring-2 focus:ring-brand-green-400/20";

const emptyForm: CreateDistributorApplicationInput = {
  fullName: "",
  phone: "",
  email: "",
  division: "",
  district: "",
  businessName: "",
  businessType: "PHARMACY",
  experience: "NEW",
  coverageArea: "",
  message: "",
  status: "APPROVED",
  adminNotes: "",
};

export function AdminDistributorForm() {
  const router = useRouter();
  const { createApplication } = useDistributorMutations();
  const [form, setForm] = useState<CreateDistributorApplicationInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const districts = useMemo(() => getBdDistricts(form.division), [form.division]);

  function patch<K extends keyof CreateDistributorApplicationInput>(
    key: K,
    value: CreateDistributorApplicationInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await createApplication.mutateAsync(form);
      await showAdminSuccess("Distributor added", result.success ?? "Record saved.");
      router.push(`/admin/distributors?id=${result.data?.id ?? ""}`);
      router.refresh();
    } catch (err) {
      await showAdminError(
        "Couldn’t save",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
          href="/admin/distributors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Link>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-heading text-lg font-bold text-neutral-900">Contact details</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Primary contact for this distributor or partner.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm sm:col-span-2">
            <span className="font-medium text-neutral-700">Full name</span>
            <input
              className={fieldClass}
              onChange={(event) => patch("fullName", event.target.value)}
              placeholder="Partner full name"
              required
              value={form.fullName}
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium text-neutral-700">Phone</span>
            <input
              className={fieldClass}
              inputMode="tel"
              onChange={(event) => patch("phone", event.target.value)}
              placeholder="01XXXXXXXXX"
              required
              value={form.phone}
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium text-neutral-700">Email</span>
            <input
              className={fieldClass}
              onChange={(event) => patch("email", event.target.value)}
              placeholder="partner@example.com"
              required
              type="email"
              value={form.email}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-heading text-lg font-bold text-neutral-900">Territory</h2>
        <p className="mt-1 text-sm text-neutral-500">Division, district, and coverage area.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium text-neutral-700">Division</span>
            <select
              className={fieldClass}
              onChange={(event) => {
                patch("division", event.target.value);
                patch("district", "");
              }}
              required
              value={form.division}
            >
              <option value="">Select division</option>
              {bdDivisions.map((division) => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium text-neutral-700">District</span>
            <select
              className={fieldClass}
              disabled={!form.division}
              onChange={(event) => patch("district", event.target.value)}
              required
              value={form.district}
            >
              <option value="">
                {form.division ? "Select district" : "Select division first"}
              </option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-sm sm:col-span-2">
            <span className="font-medium text-neutral-700">Coverage area</span>
            <input
              className={fieldClass}
              onChange={(event) => patch("coverageArea", event.target.value)}
              placeholder="e.g. Gazipur + nearby upazilas"
              required
              value={form.coverageArea}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-heading text-lg font-bold text-neutral-900">Business profile</h2>
        <p className="mt-1 text-sm text-neutral-500">Shop or trading details for this partner.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium text-neutral-700">Business / shop name</span>
            <input
              className={fieldClass}
              onChange={(event) => patch("businessName", event.target.value)}
              placeholder="Optional"
              value={form.businessName ?? ""}
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium text-neutral-700">Business type</span>
            <select
              className={fieldClass}
              onChange={(event) =>
                patch("businessType", event.target.value as DistributorBusinessType)
              }
              required
              value={form.businessType}
            >
              {(Object.keys(businessTypeLabels) as DistributorBusinessType[]).map((key) => (
                <option key={key} value={key}>
                  {businessTypeLabels[key]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium text-neutral-700">Distribution experience</span>
            <select
              className={fieldClass}
              onChange={(event) =>
                patch("experience", event.target.value as DistributorExperience)
              }
              required
              value={form.experience}
            >
              {(Object.keys(experienceLabels) as DistributorExperience[]).map((key) => (
                <option key={key} value={key}>
                  {experienceLabels[key]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium text-neutral-700">Initial status</span>
            <select
              className={fieldClass}
              onChange={(event) =>
                patch("status", event.target.value as DistributorApplicationStatus)
              }
              required
              value={form.status}
            >
              {(Object.keys(distributorStatusMeta) as DistributorApplicationStatus[]).map((key) => (
                <option key={key} value={key}>
                  {distributorStatusMeta[key].label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-sm sm:col-span-2">
            <span className="font-medium text-neutral-700">Notes / introduction</span>
            <textarea
              className={textareaClass}
              onChange={(event) => patch("message", event.target.value)}
              placeholder="Optional partner background or referral notes"
              value={form.message ?? ""}
            />
          </label>
          <label className="space-y-1.5 text-sm sm:col-span-2">
            <span className="font-medium text-neutral-700">Internal admin notes</span>
            <textarea
              className={textareaClass}
              onChange={(event) => patch("adminNotes", event.target.value)}
              placeholder="Territory agreement, onboarding plan, follow-up…"
              value={form.adminNotes ?? ""}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button asChild className="h-11 rounded-xl" type="button" variant="outline">
          <Link href="/admin/distributors">Cancel</Link>
        </Button>
        <Button
          className="h-11 gap-2 rounded-xl bg-brand-green-600 hover:bg-brand-green-900"
          disabled={saving}
          type="submit"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Add distributor"}
        </Button>
      </div>
    </form>
  );
}
