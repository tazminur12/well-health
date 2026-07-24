"use client";

import {
  Activity,
  Cloud,
  CreditCard,
  Database,
  Globe,
  Loader2,
  Mail,
  RefreshCw,
  Server,
  ShieldCheck,
  Smartphone,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAdminApiHealth } from "@/hooks/use-admin-health";
import type {
  HealthServiceId,
  HealthServiceResult,
  HealthStatus,
} from "@/lib/health/schemas";
import { cn } from "@/lib/utils";

const serviceIcons: Record<HealthServiceId, LucideIcon> = {
  app: Globe,
  database: Database,
  supabase: ShieldCheck,
  cloudinary: Cloud,
  resend: Mail,
  sslcommerz: CreditCard,
  bkash: Smartphone,
  steadfast: Truck,
};

/** Soft clinical-premium gradients per service — brand greens + gold accents */
const serviceThemes: Record<
  HealthServiceId,
  { card: string; glow: string; icon: string; bar: string }
> = {
  app: {
    card: "from-[#E8F5EE] via-white to-[#F0F7F3]",
    glow: "bg-[#16875D]/15",
    icon: "from-[#0B4D3A] to-[#16875D] text-white shadow-[0_8px_20px_rgba(22,135,93,0.28)]",
    bar: "from-[#16875D] to-[#C9A24B]",
  },
  database: {
    card: "from-[#E6F4F0] via-[#F7FBFA] to-[#EEF6F2]",
    glow: "bg-emerald-400/20",
    icon: "from-[#0F766E] to-[#16875D] text-white shadow-[0_8px_20px_rgba(15,118,110,0.28)]",
    bar: "from-[#0F766E] to-[#34D399]",
  },
  supabase: {
    card: "from-[#E8F5EE] via-white to-[#F5F0E6]",
    glow: "bg-[#C9A24B]/18",
    icon: "from-[#16875D] to-[#0B4D3A] text-white shadow-[0_8px_20px_rgba(11,77,58,0.3)]",
    bar: "from-[#0B4D3A] via-[#16875D] to-[#C9A24B]",
  },
  cloudinary: {
    card: "from-[#EEF8F3] via-[#F8FBF9] to-[#F3F0E8]",
    glow: "bg-sky-300/20",
    icon: "from-[#1A7A5C] to-[#3BA88A] text-white shadow-[0_8px_20px_rgba(26,122,92,0.28)]",
    bar: "from-[#3BA88A] to-[#C9A24B]",
  },
  resend: {
    card: "from-[#F5F0E6] via-white to-[#E8F5EE]",
    glow: "bg-[#C9A24B]/20",
    icon: "from-[#A8843A] to-[#C9A24B] text-white shadow-[0_8px_20px_rgba(201,162,75,0.32)]",
    bar: "from-[#C9A24B] to-[#16875D]",
  },
  sslcommerz: {
    card: "from-[#EAF3FF] via-white to-[#F0F7F3]",
    glow: "bg-blue-400/15",
    icon: "from-[#1D4F91] to-[#2B6CB0] text-white shadow-[0_8px_20px_rgba(29,79,145,0.28)]",
    bar: "from-[#2B6CB0] to-[#16875D]",
  },
  bkash: {
    card: "from-[#FDF2F6] via-white to-[#F7F8F9]",
    glow: "bg-rose-300/20",
    icon: "from-[#BE185D] to-[#E11D48] text-white shadow-[0_8px_20px_rgba(190,24,93,0.28)]",
    bar: "from-[#E11D48] to-[#C9A24B]",
  },
  steadfast: {
    card: "from-[#E8F5EE] via-white to-[#F7F8F9]",
    glow: "bg-brand-green-600/15",
    icon: "from-[#0B4D3A] to-[#16875D] text-white shadow-[0_8px_20px_rgba(11,77,58,0.28)]",
    bar: "from-[#0B4D3A] to-[#C9A24B]",
  },
};

const statusMeta: Record<
  HealthStatus,
  { label: string; pill: string; soft: string; dot: string; ring: string }
> = {
  healthy: {
    label: "Healthy",
    pill: "bg-brand-green-100/90 text-brand-green-800 ring-1 ring-brand-green-600/15",
    soft: "from-[#0B4D3A] via-[#127A56] to-[#16875D]",
    dot: "bg-emerald-400",
    ring: "ring-white/25",
  },
  degraded: {
    label: "Degraded",
    pill: "bg-amber-100/90 text-amber-950 ring-1 ring-amber-500/20",
    soft: "from-[#92400E] via-[#B45309] to-[#C9A24B]",
    dot: "bg-amber-300",
    ring: "ring-white/25",
  },
  down: {
    label: "Down",
    pill: "bg-red-100/90 text-red-800 ring-1 ring-red-500/20",
    soft: "from-[#7F1D1D] via-[#B91C1C] to-[#DC2626]",
    dot: "bg-red-300",
    ring: "ring-white/25",
  },
  not_configured: {
    label: "Not configured",
    pill: "bg-white/90 text-neutral-700 ring-1 ring-neutral-200",
    soft: "from-[#334155] via-[#475569] to-[#64748B]",
    dot: "bg-neutral-300",
    ring: "ring-white/20",
  },
};

const categoryLabels = {
  core: "Core platform",
  media: "Media & CDN",
  comms: "Communications",
  payments: "Payments",
  logistics: "Logistics",
} as const;

function formatCheckedAt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AdminApiHealthPage() {
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminApiHealth();

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-7 w-7 animate-spin text-brand-green-600" />
        Running live health checks…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-[#F7F8F9] to-[#E8F5EE] p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">
          Couldn’t run health checks
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

  const overall = statusMeta[data.overall];
  const grouped = (Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map(
    (category) => ({
      category,
      label: categoryLabels[category],
      items: data.services.filter((service) => service.category === category),
    })
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-green-100 bg-gradient-to-r from-brand-green-50 to-[#F5F0E6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-green-800">
            <Activity className="h-3.5 w-3.5" />
            System monitor
          </div>
          <h1 className="mt-3 font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">
            API Health
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-neutral-500">
            Live connectivity for database, auth, media, email, and payment providers —
            checked against production credentials without exposing secrets.
          </p>
        </div>
        <Button
          className="h-10 rounded-xl bg-gradient-to-r from-brand-green-900 to-brand-green-600 text-white shadow-[0_10px_24px_rgba(22,135,93,0.28)] hover:from-brand-green-900 hover:to-brand-green-900"
          disabled={isFetching}
          onClick={() => void refetch()}
          type="button"
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh checks
        </Button>
      </header>

      <section
        className={cn(
          "relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-6 text-white shadow-[0_20px_50px_rgba(11,77,58,0.22)] sm:p-8",
          overall.soft
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-[#C9A24B]/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.16),_transparent_45%)]"
        />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-sm ring-4 backdrop-blur-sm",
                  overall.ring
                )}
              >
                <Server className="h-6 w-6 text-white" />
                <span
                  className={cn(
                    "absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full ring-2 ring-white/80",
                    overall.dot,
                    data.overall === "healthy" && "animate-pulse"
                  )}
                />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                  Overall status
                </p>
                <p className="mt-1 font-heading text-3xl font-bold tracking-tight text-white">
                  {overall.label}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                  overall.pill
                )}
              >
                {data.healthyCount}/{data.totalCount} active healthy
              </span>
            </div>

            <p className="max-w-lg text-sm leading-7 text-white/80">
              Last sweep finished in{" "}
              <span className="font-semibold text-white">{data.durationMs}ms</span>.
              Core services are probed live; payment gateways report configuration readiness
              until checkout credentials are wired.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Environment" value={data.environment} />
            <MetricCard label="Check duration" value={`${data.durationMs}ms`} />
            <MetricCard
              label="Checked at"
              value={formatCheckedAt(data.checkedAt)}
              className="col-span-2"
            />
            <MetricCard label="App URL" value={data.appUrl} className="col-span-2" />
          </div>
        </div>
      </section>

      {grouped.map(({ category, label, items }) =>
        items.length ? (
          <section key={category} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-bold text-neutral-900">{label}</h2>
              <span className="text-xs font-medium text-neutral-400">
                {items.length} service{items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </section>
        ) : null
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/20 bg-gradient-to-br from-white/20 to-white/5 px-4 py-3 shadow-sm backdrop-blur-md",
        className
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function ServiceCard({ service }: { service: HealthServiceResult }) {
  const meta = statusMeta[service.status];
  const theme = serviceThemes[service.id];
  const Icon = serviceIcons[service.id];

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]",
        theme.card,
        service.status === "down" && "ring-1 ring-red-200/80",
        service.status === "degraded" && "ring-1 ring-amber-200/80"
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full blur-2xl transition-opacity duration-200 group-hover:opacity-100",
          theme.glow
        )}
      />
      <div
        aria-hidden
        className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", theme.bar)}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br",
              theme.icon
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-base font-bold text-neutral-900">
              {service.name}
            </h3>
            <p className="mt-0.5 text-xs leading-5 text-neutral-500">{service.description}</p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm",
            service.status === "healthy" &&
              "bg-brand-green-100/90 text-brand-green-800 ring-1 ring-brand-green-600/15",
            service.status === "degraded" &&
              "bg-amber-100/90 text-amber-950 ring-1 ring-amber-500/20",
            service.status === "down" && "bg-red-100/90 text-red-800 ring-1 ring-red-500/20",
            service.status === "not_configured" &&
              "bg-white/80 text-neutral-600 ring-1 ring-neutral-200"
          )}
        >
          {meta.label}
        </span>
      </div>

      <div className="relative mt-4 space-y-2 border-t border-neutral-900/5 pt-4">
        <p className="text-sm font-medium text-neutral-800">{service.message}</p>
        {service.detail ? (
          <p className="text-xs leading-5 text-neutral-500">{service.detail}</p>
        ) : null}
        <div className="flex items-center justify-between rounded-xl bg-white/55 px-3 py-2 text-[11px] text-neutral-500 backdrop-blur-sm">
          <span>Latency</span>
          <span className="font-semibold text-neutral-800">
            {service.latencyMs == null ? "—" : `${service.latencyMs}ms`}
          </span>
        </div>
      </div>
    </article>
  );
}
