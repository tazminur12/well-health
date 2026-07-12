"use client";

import {
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MessageSquareText,
  Pencil,
  Plus,
  Search,
  Send,
  Smartphone,
  Trash2,
  Users,
  X,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  useAdminMarketingCampaigns,
  useAdminMarketingMeta,
  useMarketingMutations,
} from "@/hooks/use-admin-marketing";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import type {
  AdminMarketingCampaign,
  MarketingAudience,
  MarketingCampaignInput,
  MarketingChannel,
  MarketingCampaignStatus,
} from "@/lib/marketing/schemas";
import { cn } from "@/lib/utils";

type Tab = MarketingChannel;

const emptyForm = (channel: MarketingChannel): MarketingCampaignInput => ({
  name: "",
  channel,
  audience: "ALL_CUSTOMERS",
  subject: channel === "EMAIL" ? "" : null,
  body: "",
  customRecipients: "",
  scheduledAt: "",
});

const statusMeta: Record<
  MarketingCampaignStatus,
  { label: string; pill: string }
> = {
  DRAFT: { label: "Draft", pill: "bg-neutral-100 text-neutral-700" },
  SCHEDULED: { label: "Scheduled", pill: "bg-blue-100 text-blue-800" },
  SENDING: { label: "Sending", pill: "bg-amber-100 text-amber-900" },
  SENT: { label: "Sent", pill: "bg-brand-green-100 text-brand-green-800" },
  FAILED: { label: "Failed", pill: "bg-red-100 text-red-800" },
};

const audienceLabels: Record<MarketingAudience, string> = {
  ALL_CUSTOMERS: "All customers",
  VIP: "VIP customers",
  CUSTOM: "Custom list",
};

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20";

const textareaClass =
  "min-h-[140px] w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm text-neutral-800 outline-none transition focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function smsCharHint(body: string) {
  const len = body.length;
  const parts = Math.max(1, Math.ceil(len / 160));
  return `${len} / 480 · ~${parts} SMS segment${parts === 1 ? "" : "s"}`;
}

export function AdminMarketingPage() {
  const [tab, setTab] = useState<Tab>("EMAIL");
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMarketingCampaign | null>(null);
  const [form, setForm] = useState<MarketingCampaignInput>(emptyForm("EMAIL"));
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const { data: campaigns = [], isLoading, isError, error, refetch } =
    useAdminMarketingCampaigns(tab);
  const { data: meta } = useAdminMarketingMeta();
  const { createCampaign, updateCampaign, deleteCampaign, sendCampaign } =
    useMarketingMutations();

  useEffect(() => {
    setForm(emptyForm(tab));
    setEditing(null);
    setDrawerOpen(false);
  }, [tab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q) ||
        c.body.toLowerCase().includes(q)
    );
  }, [campaigns, search]);

  const stats = {
    total: campaigns.length,
    sent: campaigns.filter((c) => c.status === "SENT").length,
    drafts: campaigns.filter((c) => c.status === "DRAFT" || c.status === "SCHEDULED").length,
  };

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(tab));
    setDrawerOpen(true);
  }

  function openEdit(campaign: AdminMarketingCampaign) {
    if (campaign.status === "SENT" || campaign.status === "SENDING") {
      void showAdminError("Locked", "Sent campaigns can’t be edited.");
      return;
    }
    setEditing(campaign);
    setForm({
      name: campaign.name,
      channel: campaign.channel,
      audience: campaign.audience,
      subject: campaign.subject,
      body: campaign.body,
      customRecipients: campaign.customRecipients ?? "",
      scheduledAt: campaign.scheduledAt
        ? campaign.scheduledAt.slice(0, 16)
        : "",
    });
    setDrawerOpen(true);
  }

  async function handleSave(andSend: boolean) {
    setSaving(true);
    try {
      const payload: MarketingCampaignInput = {
        ...form,
        channel: tab,
        subject: tab === "EMAIL" ? form.subject : null,
      };

      let id = editing?.id;
      if (editing) {
        const result = await updateCampaign.mutateAsync({ id: editing.id, input: payload });
        id = result.data?.id ?? editing.id;
        await showAdminSuccess("Updated", result.success ?? "Campaign saved.");
      } else {
        const result = await createCampaign.mutateAsync(payload);
        id = result.data?.id;
        await showAdminSuccess("Saved", result.success ?? "Campaign created.");
      }

      setDrawerOpen(false);
      setEditing(null);

      if (andSend && id) {
        await handleSend(id);
      }
    } catch (err) {
      await showAdminError("Couldn’t save", err instanceof Error ? err.message : "Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSend(id: string) {
    const ok = await confirmAdminAction({
      title: tab === "EMAIL" ? "Send email campaign?" : "Send SMS campaign?",
      text:
        tab === "SMS" && !meta?.sms.configured
          ? "SMS credentials are not in .env yet — send will be blocked until you add them."
          : "This will deliver to the selected audience (max 100 recipients per send).",
      confirmText: "Send now",
    });
    if (!ok) return;

    setSendingId(id);
    try {
      const result = await sendCampaign.mutateAsync(id);
      await showAdminSuccess("Sent", result.success ?? "Campaign sent.");
    } catch (err) {
      await showAdminError("Send failed", err instanceof Error ? err.message : "Try again.");
    } finally {
      setSendingId(null);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirmAdminAction({
      title: "Delete campaign?",
      text: "This cannot be undone.",
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await deleteCampaign.mutateAsync(id);
      await showAdminSuccess("Deleted", "Campaign removed.");
    } catch (err) {
      await showAdminError("Couldn’t delete", err instanceof Error ? err.message : "Try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-7 w-7 animate-spin text-brand-green-600" />
        Loading marketing…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-center">
        <p className="font-heading text-lg font-bold text-neutral-900">Couldn’t load campaigns</p>
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
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-[#0B4D3A] via-[#127A56] to-[#16875D] p-6 text-white shadow-sm sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-[#C9A24B]/25 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-accent ring-1 ring-white/15">
              <MessageSquareText className="h-3.5 w-3.5" />
              Campaigns
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Email & SMS marketing
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Reach customers with clinical-premium promotions, restocks, and health tips — email
              via Resend, SMS when provider credentials are added.
            </p>
          </div>

          <Button
            className="h-11 gap-2 rounded-xl border-0 bg-gold-accent text-brand-green-950 hover:bg-[#d4b05c]"
            onClick={openCreate}
            type="button"
          >
            <Plus className="h-4 w-4" />
            New {tab === "EMAIL" ? "email" : "SMS"} campaign
          </Button>
        </div>
      </section>

      {/* Provider status */}
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-[#E8F5EE] via-white to-[#F5F0E6] p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B4D3A] to-[#16875D] text-white shadow-md">
              <Mail className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-neutral-900">Email (Resend)</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    meta?.emailConfigured
                      ? "bg-brand-green-100 text-brand-green-800"
                      : "bg-amber-100 text-amber-900"
                  )}
                >
                  {meta?.emailConfigured ? "Ready" : "Preview mode"}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                {meta?.emailConfigured
                  ? "RESEND_API_KEY detected — live sends enabled."
                  : "No live Resend key yet — sends are logged as preview."}
              </p>
              <p className="mt-2 text-xs text-neutral-400">
                {meta?.audience.withEmail ?? 0} customers with email
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-[#F5F0E6] via-white to-[#EAF3FF] p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#A8843A] to-[#C9A24B] text-white shadow-md">
              <Smartphone className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-neutral-900">SMS provider</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    meta?.sms.configured
                      ? "bg-brand-green-100 text-brand-green-800"
                      : "bg-neutral-100 text-neutral-600"
                  )}
                >
                  {meta?.sms.configured ? "Configured" : "Not configured"}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                {meta?.sms.configured
                  ? `Provider: ${meta.sms.provider ?? "custom"} · Sender: ${meta.sms.senderId}`
                  : "Add SMS_API_KEY + SMS_SENDER_ID to .env later. Drafts work now."}
              </p>
              <p className="mt-2 text-xs text-neutral-400">
                {meta?.audience.withPhone ?? 0} customers with phone
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* Tabs + search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-100 p-1">
          {(
            [
              { key: "EMAIL" as const, label: "Email", icon: Mail },
              { key: "SMS" as const, label: "SMS", icon: Smartphone },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all",
                  tab === item.key
                    ? "bg-white text-brand-green-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                )}
                onClick={() => setTab(item.key)}
                type="button"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className={cn(inputClass, "pl-9")}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns…"
            value={search}
          />
        </div>
      </div>

      {/* Mini stats */}
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: `${tab === "EMAIL" ? "Email" : "SMS"} campaigns`, value: stats.total, icon: MessageSquareText },
          { label: "Sent", value: stats.sent, icon: CheckCircle2 },
          { label: "Drafts / scheduled", value: stats.drafts, icon: Clock3 },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 shadow-sm"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-50 text-brand-green-800">
                <Icon className="h-4.5 w-4.5 h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-medium text-neutral-500">{item.label}</p>
                <p className="font-heading text-xl font-bold text-neutral-900">{item.value}</p>
              </div>
            </div>
          );
        })}
      </section>

      {tab === "SMS" && !meta?.sms.configured ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3.5 text-sm text-amber-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p>
            SMS sending is disabled until you add provider credentials to{" "}
            <code className="rounded bg-white/80 px-1.5 py-0.5 text-xs">.env</code>. You can compose
            and save SMS drafts now.
          </p>
        </div>
      ) : null}

      {/* Campaign list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <Users className="mx-auto h-10 w-10 text-neutral-300" />
          <p className="mt-3 font-heading text-lg font-bold text-neutral-900">No campaigns yet</p>
          <p className="mt-1 text-sm text-neutral-500">
            Create your first {tab === "EMAIL" ? "email" : "SMS"} campaign to reach customers.
          </p>
          <Button className="mt-5 gap-2 rounded-xl" onClick={openCreate} type="button">
            <Plus className="h-4 w-4" />
            Create campaign
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((campaign, index) => {
            const status = statusMeta[campaign.status];
            const gradients = [
              "from-[#E8F5EE] via-white to-[#F5F0E6]",
              "from-[#EAF3FF] via-white to-[#F0F7F3]",
              "from-[#F5F0E6] via-white to-[#E8F5EE]",
            ];
            const bars = [
              "from-[#0B4D3A] to-[#16875D]",
              "from-[#16875D] to-[#C9A24B]",
              "from-[#1D4F91] to-[#16875D]",
            ];
            const busy = sendingId === campaign.id;

            return (
              <article
                key={campaign.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br p-5 shadow-sm",
                  gradients[index % gradients.length]
                )}
              >
                <div
                  aria-hidden
                  className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", bars[index % bars.length])}
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", status.pill)}>
                        {status.label}
                      </span>
                      <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-neutral-600 ring-1 ring-neutral-200">
                        {audienceLabels[campaign.audience]}
                      </span>
                    </div>
                    <h3 className="mt-2 truncate font-heading text-lg font-bold text-neutral-900">
                      {campaign.name}
                    </h3>
                    {campaign.subject ? (
                      <p className="mt-0.5 truncate text-sm text-neutral-500">{campaign.subject}</p>
                    ) : null}
                  </div>
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/90 text-brand-green-800 shadow-sm ring-1 ring-neutral-100">
                    {campaign.channel === "EMAIL" ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <Smartphone className="h-4 w-4" />
                    )}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-600">
                  {campaign.body}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <span>Created {formatDate(campaign.createdAt)}</span>
                  {campaign.sentAt ? <span>Sent {formatDate(campaign.sentAt)}</span> : null}
                  {campaign.recipientCount > 0 ? (
                    <span>
                      {campaign.successCount}/{campaign.recipientCount} delivered
                    </span>
                  ) : null}
                </div>

                {campaign.lastError ? (
                  <p className="mt-2 line-clamp-2 text-xs text-red-600">{campaign.lastError}</p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {campaign.status !== "SENT" && campaign.status !== "SENDING" ? (
                    <>
                      <Button
                        className="h-9 gap-1.5 rounded-xl"
                        disabled={busy}
                        onClick={() => void handleSend(campaign.id)}
                        size="sm"
                        type="button"
                      >
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        Send
                      </Button>
                      <Button
                        className="h-9 gap-1.5 rounded-xl"
                        onClick={() => openEdit(campaign)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </>
                  ) : null}
                  <Button
                    className="h-9 gap-1.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => void handleDelete(campaign.id)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            aria-label="Close drawer"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
            type="button"
          />
          <aside className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-green-700">
                  {tab === "EMAIL" ? "Email campaign" : "SMS campaign"}
                </p>
                <h2 className="font-heading text-lg font-bold text-neutral-900">
                  {editing ? "Edit campaign" : "New campaign"}
                </h2>
              </div>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
                onClick={() => setDrawerOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-neutral-700">Campaign name</span>
                <input
                  className={inputClass}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ramadan wellness offer"
                  value={form.name}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-neutral-700">Audience</span>
                <select
                  className={inputClass}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      audience: e.target.value as MarketingAudience,
                    }))
                  }
                  value={form.audience}
                >
                  <option value="ALL_CUSTOMERS">
                    All customers ({meta?.audience.allCustomers ?? 0})
                  </option>
                  <option value="VIP">VIP only ({meta?.audience.vipCustomers ?? 0})</option>
                  <option value="CUSTOM">Custom list</option>
                </select>
              </label>

              {form.audience === "CUSTOM" ? (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-neutral-700">
                    Recipients ({tab === "EMAIL" ? "emails" : "phone numbers"})
                  </span>
                  <textarea
                    className={textareaClass}
                    onChange={(e) => setForm((f) => ({ ...f, customRecipients: e.target.value }))}
                    placeholder={
                      tab === "EMAIL"
                        ? "one@email.com\ntwo@email.com"
                        : "01700000000\n01800000000"
                    }
                    value={form.customRecipients ?? ""}
                  />
                </label>
              ) : null}

              {tab === "EMAIL" ? (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-neutral-700">Subject</span>
                  <input
                    className={inputClass}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    placeholder="Exclusive Well Health offer inside"
                    value={form.subject ?? ""}
                  />
                </label>
              ) : null}

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-neutral-700">
                  {tab === "EMAIL" ? "Email body" : "SMS message"}
                </span>
                <textarea
                  className={cn(textareaClass, tab === "SMS" && "min-h-[120px]")}
                  maxLength={tab === "SMS" ? 480 : undefined}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder={
                    tab === "EMAIL"
                      ? "Write your message… (plain text; line breaks become paragraphs)"
                      : "Short SMS copy for Bangladesh customers…"
                  }
                  value={form.body}
                />
                {tab === "SMS" ? (
                  <p className="text-xs text-neutral-400">{smsCharHint(form.body)}</p>
                ) : null}
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-neutral-700">
                  Schedule (optional)
                </span>
                <input
                  className={inputClass}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  type="datetime-local"
                  value={form.scheduledAt ?? ""}
                />
                <p className="text-xs text-neutral-400">
                  Scheduling marks the campaign as Scheduled. Use Send to deliver now.
                </p>
              </label>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-neutral-100 bg-neutral-50/80 px-5 py-4">
              <Button
                className="h-11 flex-1 rounded-xl"
                disabled={saving}
                onClick={() => void handleSave(false)}
                type="button"
                variant="outline"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save draft
              </Button>
              <Button
                className="h-11 flex-1 gap-2 rounded-xl"
                disabled={saving || (tab === "SMS" && !meta?.sms.configured)}
                onClick={() => void handleSave(true)}
                type="button"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Save & send
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
