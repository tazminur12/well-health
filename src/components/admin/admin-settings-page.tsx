"use client";

import {
  Globe,
  Loader2,
  MapPin,
  Package,
  Phone,
  Save,
  Search,
  Share2,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAdminStoreSettings, useStoreSettingsMutations } from "@/hooks/use-admin-settings";
import { showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import {
  defaultStoreSettings,
  type StoreSettings,
} from "@/lib/settings/schemas";
import { cn } from "@/lib/utils";

type SettingsTab = "general" | "contact" | "social" | "orders" | "seo";

const tabs: { id: SettingsTab; label: string; icon: typeof Store }[] = [
  { id: "general", label: "General", icon: Store },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "social", label: "Social", icon: Share2 },
  { id: "orders", label: "Orders", icon: Package },
  { id: "seo", label: "SEO", icon: Search },
];

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20";

const labelClass = "text-sm font-medium text-neutral-700";

export function AdminSettingsPage() {
  const { data, isLoading, isError, error, refetch } = useAdminStoreSettings();
  const { updateSettings } = useStoreSettingsMutations();
  const [tab, setTab] = useState<SettingsTab>("general");
  const [form, setForm] = useState<StoreSettings>(defaultStoreSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function patch<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateSettings.mutateAsync(form);
      await showAdminSuccess("Settings saved", "Storefront contact and store details updated.");
      await refetch();
    } catch (err) {
      await showAdminError(
        "Save failed",
        err instanceof Error ? err.message : "Please check the fields and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading settings…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">Couldn’t load settings</h2>
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
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900">Settings</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Store identity, contact details, shipping defaults, and SEO
          </p>
        </div>
        <Button
          className="h-10 rounded-xl bg-brand-green-600 text-white hover:bg-brand-green-900"
          disabled={saving || updateSettings.isPending}
          onClick={() => void handleSave()}
          type="button"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </Button>
      </header>

      {form.maintenanceMode ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Maintenance mode is on. Keep this disabled unless you intentionally need to pause the
          storefront experience.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="h-fit rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-green-100 text-brand-green-800"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )}
                onClick={() => setTab(id)}
                type="button"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          {tab === "general" ? (
            <div className="space-y-5">
              <SectionHeader
                icon={Store}
                title="General store"
                description="Brand name and basic identity shown across the site"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Store name" className="sm:col-span-2">
                  <input
                    className={inputClass}
                    onChange={(e) => patch("storeName", e.target.value)}
                    value={form.storeName}
                  />
                </Field>
                <Field label="Tagline" className="sm:col-span-2">
                  <input
                    className={inputClass}
                    onChange={(e) => patch("tagline", e.target.value)}
                    placeholder="Better Health, Better Life"
                    value={form.tagline}
                  />
                </Field>
                <Field label="Currency code">
                  <input
                    className={inputClass}
                    onChange={(e) => patch("currencyCode", e.target.value.toUpperCase())}
                    value={form.currencyCode}
                  />
                </Field>
                <Field label="Currency symbol">
                  <input
                    className={inputClass}
                    onChange={(e) => patch("currencySymbol", e.target.value)}
                    value={form.currencySymbol}
                  />
                </Field>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <input
                  checked={form.maintenanceMode}
                  className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand-green-600"
                  onChange={(e) => patch("maintenanceMode", e.target.checked)}
                  type="checkbox"
                />
                <span>
                  <span className="block text-sm font-semibold text-neutral-900">
                    Maintenance mode
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    Flag for upcoming storefront pause messaging (does not lock routes yet)
                  </span>
                </span>
              </label>
            </div>
          ) : null}

          {tab === "contact" ? (
            <div className="space-y-5">
              <SectionHeader
                icon={MapPin}
                title="Contact details"
                description="Used in top bar, footer, and contact pages"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Support email">
                  <input
                    className={inputClass}
                    onChange={(e) => patch("supportEmail", e.target.value)}
                    type="email"
                    value={form.supportEmail}
                  />
                </Field>
                <Field label="Support phone">
                  <input
                    className={inputClass}
                    onChange={(e) => patch("supportPhone", e.target.value)}
                    value={form.supportPhone}
                  />
                </Field>
                <Field label="WhatsApp number" className="sm:col-span-2">
                  <input
                    className={inputClass}
                    onChange={(e) => patch("whatsapp", e.target.value)}
                    placeholder="+8801XXXXXXXXX"
                    value={form.whatsapp}
                  />
                </Field>
                <Field label="Address line 1" className="sm:col-span-2">
                  <input
                    className={inputClass}
                    onChange={(e) => patch("addressLine1", e.target.value)}
                    value={form.addressLine1}
                  />
                </Field>
                <Field label="Address line 2" className="sm:col-span-2">
                  <input
                    className={inputClass}
                    onChange={(e) => patch("addressLine2", e.target.value)}
                    value={form.addressLine2}
                  />
                </Field>
                <Field label="City">
                  <input
                    className={inputClass}
                    onChange={(e) => patch("city", e.target.value)}
                    value={form.city}
                  />
                </Field>
                <Field label="Country">
                  <input
                    className={inputClass}
                    onChange={(e) => patch("country", e.target.value)}
                    value={form.country}
                  />
                </Field>
                <Field label="Working hours" className="sm:col-span-2">
                  <input
                    className={inputClass}
                    onChange={(e) => patch("workingHours", e.target.value)}
                    value={form.workingHours}
                  />
                </Field>
              </div>
            </div>
          ) : null}

          {tab === "social" ? (
            <div className="space-y-5">
              <SectionHeader
                icon={Share2}
                title="Social profiles"
                description="Full URLs for top bar and footer icons"
              />
              <div className="grid gap-4">
                {(
                  [
                    ["facebookUrl", "Facebook URL"],
                    ["instagramUrl", "Instagram URL"],
                    ["linkedinUrl", "LinkedIn URL"],
                    ["youtubeUrl", "YouTube URL"],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label}>
                    <input
                      className={inputClass}
                      onChange={(e) => patch(key, e.target.value)}
                      placeholder="https://"
                      value={form[key]}
                    />
                  </Field>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "orders" ? (
            <div className="space-y-5">
              <SectionHeader
                icon={Package}
                title="Orders & shipping"
                description="Checkout defaults for Bangladesh delivery"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Free shipping minimum (৳)" className="sm:col-span-2">
                  <input
                    className={inputClass}
                    min={0}
                    onChange={(e) => patch("freeShippingMin", Number(e.target.value) || 0)}
                    type="number"
                    value={form.freeShippingMin}
                  />
                </Field>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <input
                  checked={form.codEnabled}
                  className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand-green-600"
                  onChange={(e) => patch("codEnabled", e.target.checked)}
                  type="checkbox"
                />
                <span>
                  <span className="block text-sm font-semibold text-neutral-900">
                    Enable Cash on Delivery
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    Shown as available in FAQ and future checkout options
                  </span>
                </span>
              </label>
            </div>
          ) : null}

          {tab === "seo" ? (
            <div className="space-y-5">
              <SectionHeader
                icon={Globe}
                title="Default SEO"
                description="Fallback title and description for marketing pages"
              />
              <Field label="Default meta title">
                <input
                  className={inputClass}
                  onChange={(e) => patch("seoTitle", e.target.value)}
                  value={form.seoTitle}
                />
                <p
                  className={cn(
                    "mt-1 text-right text-[11px]",
                    form.seoTitle.length > 60 ? "text-red-600" : "text-neutral-500"
                  )}
                >
                  {form.seoTitle.length}/60
                </p>
              </Field>
              <Field label="Default meta description">
                <textarea
                  className="min-h-[110px] w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
                  onChange={(e) => patch("seoDescription", e.target.value)}
                  value={form.seoDescription}
                />
                <p
                  className={cn(
                    "mt-1 text-right text-[11px]",
                    form.seoDescription.length > 160 ? "text-red-600" : "text-neutral-500"
                  )}
                >
                  {form.seoDescription.length}/160
                </p>
              </Field>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                  Search preview
                </p>
                <p className="mt-2 truncate text-base text-[#1a0dab]">
                  {form.seoTitle || form.storeName}
                </p>
                <p className="truncate text-xs text-[#006621]">wellhealth.example</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-600">
                  {form.seoDescription || form.tagline}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex justify-end border-t border-neutral-100 pt-5">
            <Button
              className="h-10 rounded-xl bg-brand-green-600 text-white hover:bg-brand-green-900"
              disabled={saving || updateSettings.isPending}
              onClick={() => void handleSave()}
              type="button"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Store;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-neutral-100 pb-4">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-100 text-brand-green-700">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2 className="font-heading text-lg font-bold text-neutral-900">{title}</h2>
        <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}
