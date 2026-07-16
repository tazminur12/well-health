import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileCheck2,
  Handshake,
  MapPinned,
  ShieldCheck,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Trusted clinical brand",
    detail: "Represent premium supplements customers already associate with quality and care.",
  },
  {
    icon: TrendingUp,
    title: "Strong market demand",
    detail: "Eye care, brain health, vitamins, and daily wellness — categories with repeat demand.",
  },
  {
    icon: Users,
    title: "Partnership support",
    detail: "Onboarding guidance, product knowledge, and coordination for orders and fulfillment.",
  },
  {
    icon: MapPinned,
    title: "Territory opportunity",
    detail: "Apply for district or multi-area coverage across Bangladesh.",
  },
];

const steps = [
  { step: "01", title: "Apply online", detail: "Share your district, business type, and coverage plan." },
  { step: "02", title: "Partnership review", detail: "Our team checks territory fit and readiness." },
  { step: "03", title: "Start distributing", detail: "Receive onboarding support and official approval." },
];

const partnerTypes = [
  { icon: Building2, label: "Pharmacies & chemists" },
  { icon: Store, label: "Retail & wholesale traders" },
  { icon: Handshake, label: "Regional entrepreneurs" },
];

export function DistributorSection() {
  return (
    <section
      className="relative overflow-hidden border-y border-brand-green-100/70 bg-white py-14 sm:py-16 lg:py-24"
      id="distributor"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,162,75,0.12),_transparent_42%),radial-gradient(ellipse_at_bottom_left,_rgba(22,135,93,0.1),_transparent_48%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#C9A24B]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-brand-green-100/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 xl:gap-16">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F0E6] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8B6B2E] ring-1 ring-[#C9A24B]/25">
              <Handshake className="h-3.5 w-3.5" />
              Partnership opportunity
            </div>

            <div className="space-y-4">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-[2.5rem] lg:leading-[1.12]">
                Grow with us as an authorized distributor
              </h2>
              <p className="max-w-xl text-base leading-8 text-neutral-600 sm:text-lg">
                Join Well Health Trade International and bring clinical-premium supplements to
                pharmacies, retailers, and communities across Bangladesh — with brand credibility,
                structured onboarding, and territory support.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {partnerTypes.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3.5 py-3"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-green-700 shadow-sm ring-1 ring-neutral-200/70">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-semibold leading-5 text-neutral-800">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
                href="/distributor#apply"
              >
                Apply to become a distributor
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green-600/30 hover:bg-brand-green-50 hover:text-brand-green-800"
                href="/distributor"
              >
                Learn more
              </Link>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-brand-green-100 bg-brand-green-50/50 px-4 py-3.5">
              <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-green-700" />
              <p className="text-sm leading-6 text-brand-green-900">
                Approved partners receive an official{" "}
                <span className="font-semibold">Partnership Approval Letter</span> by email for
                their records.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-gradient-to-br from-[#0B4D3A] via-[#127A56] to-[#8B6914] p-6 text-white shadow-[0_20px_50px_rgba(11,77,58,0.18)] sm:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5E6C0]">
                Why partner with Well Health
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {benefits.map(({ icon: Icon, title, detail }) => (
                  <article
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-[#F5E6C0]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="mt-3 font-heading text-sm font-bold text-white">{title}</h3>
                    <p className="mt-1.5 text-xs leading-6 text-white/75">{detail}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green-600">
                How it works
              </p>
              <ol className="mt-5 space-y-4">
                {steps.map((item) => (
                  <li key={item.step} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green-100 font-heading text-xs font-bold text-brand-green-800">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="font-heading text-sm font-bold text-neutral-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-neutral-500">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                <BadgeCheck className="h-4 w-4 shrink-0 text-brand-green-600" />
                Applications reviewed within 2–3 business days
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
