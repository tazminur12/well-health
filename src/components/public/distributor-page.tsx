import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  Handshake,
  MapPinned,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

import { DistributorApplicationForm } from "@/components/public/distributor-application-form";
import { PageHero } from "@/components/public/page-hero";
import { getPublicStoreSettings } from "@/lib/settings/public-queries";
import { phoneTelHref } from "@/lib/settings/schemas";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Trusted clinical brand",
    detail:
      "Partner with a premium supplement line built on quality, integrity, and nature-backed formulations.",
  },
  {
    icon: TrendingUp,
    title: "Growing demand",
    detail:
      "Expand your territory with products customers already search for — eye care, brain health, vitamins, and more.",
  },
  {
    icon: Users,
    title: "Partnership support",
    detail:
      "Get onboarding guidance, product knowledge, and a dedicated contact for order and fulfillment support.",
  },
  {
    icon: MapPinned,
    title: "Territory opportunity",
    detail:
      "Apply for district or multi-area coverage across Bangladesh — we match partners to market fit.",
  },
];

const steps = [
  {
    step: "01",
    title: "Submit application",
    detail: "Share your location, experience, and coverage interest through the form.",
  },
  {
    step: "02",
    title: "Partnership review",
    detail: "Our team reviews fit, territory availability, and business readiness.",
  },
  {
    step: "03",
    title: "Onboarding call",
    detail: "We discuss terms, product range, and next steps to start distribution.",
  },
];

const expectations = [
  "Valid trade license or willingness to operate as a registered reseller",
  "Ability to serve pharmacies, retailers, or local customers in your area",
  "Commitment to brand presentation and customer care standards",
  "Reliable communication for orders, stock, and delivery coordination",
];

export async function DistributorPageContent() {
  const settings = await getPublicStoreSettings();

  return (
    <>
      <PageHero
        crumbLabel="Become a Distributor"
        description="Join Well Health Trade International as an authorized distributor. Build a trusted health business in your district with clinical-premium products and partnership support."
        eyebrow="Partnership"
        title="Become a distributor"
        tone="distributor"
        actions={
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#F5E6C0]">
              Who can apply
            </p>
            <ul className="mt-3 space-y-2.5 text-sm leading-6 text-white/90">
              <li className="flex gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A24B]" />
                Pharmacy owners &amp; chemists
              </li>
              <li className="flex gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A24B]" />
                Wholesale &amp; retail traders
              </li>
              <li className="flex gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A24B]" />
                Regional entrepreneurs ready to grow
              </li>
            </ul>
            <Link
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#C9A24B] px-4 text-sm font-semibold text-[#062E24] transition-colors hover:bg-[#bb943e]"
              href="#apply"
            >
              Apply now
            </Link>
          </div>
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green-600">
            Why partner with us
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-neutral-900">
            A professional path to distribute wellness
          </h2>
          <p className="mt-3 text-sm leading-7 text-neutral-500 sm:text-base">
            We welcome serious partners who want to represent a clinical premium brand with
            care, consistency, and long-term growth across Bangladesh.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, detail }) => (
            <article
              key={title}
              className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green-600/25 hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green-100 text-brand-green-700">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-heading text-base font-bold text-neutral-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-500">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-200/70 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green-600">
              How it works
            </p>
            <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Three clear steps to partnership
            </h2>
            <ol className="mt-8 space-y-5">
              {steps.map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B4D3A] font-heading text-sm font-bold text-[#C9A24B]">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-bold text-neutral-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-neutral-500">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-[1.75rem] border border-brand-green-100 bg-gradient-to-br from-[#E8F5EE] via-white to-[#F5F0E6] p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green-600 text-white">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-heading text-xl font-bold text-neutral-900">
                  What we look for
                </h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Strong partners help us deliver trusted supplements with professionalism in
                  every district.
                </p>
              </div>
            </div>
            <ul className="mt-6 space-y-3">
              {expectations.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-neutral-700">
                  <Handshake className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-600" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-xl border border-brand-green-100 bg-white/80 px-4 py-3 text-sm text-neutral-600">
              Questions before applying? Call{" "}
              <a
                className="font-semibold text-brand-green-700 hover:text-brand-green-900"
                href={phoneTelHref(settings.supportPhone)}
              >
                {settings.supportPhone}
              </a>{" "}
              or email{" "}
              <a
                className="font-semibold text-brand-green-700 hover:text-brand-green-900"
                href={`mailto:${settings.supportEmail}`}
              >
                {settings.supportEmail}
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <DistributorApplicationForm />
      </section>
    </>
  );
}
