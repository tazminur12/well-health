import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Leaf, Scale, Shield } from "lucide-react";

import { PageHero } from "@/components/public/page-hero";

type LegalSection = {
  title: string;
  body: ReactNode;
};

type LegalPageProps = {
  kind: "privacy" | "terms";
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
  storeName: string;
  supportEmail: string;
};

export function LegalPage({
  kind,
  title,
  description,
  updatedAt,
  sections,
  storeName,
  supportEmail,
}: LegalPageProps) {
  const isPrivacy = kind === "privacy";

  return (
    <div className="bg-[#F7F8F9] text-neutral-900">
      <PageHero
        crumbLabel={isPrivacy ? "Privacy Policy" : "Terms of Service"}
        description={description}
        eyebrow="Legal"
        title={title}
        tone={isPrivacy ? "contact" : "about"}
      />

      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <Link
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-green-600 transition-colors hover:text-brand-green-900"
              href="/"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
              Last updated · {updatedAt}
            </p>
          </div>

          <article className="relative overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)] ring-1 ring-neutral-200/70 sm:p-8 lg:p-10">
            <div
              aria-hidden
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
                isPrivacy
                  ? "from-[#0F766E] via-[#16875D] to-[#C9A24B]"
                  : "from-[#0B4D3A] via-[#C9A24B] to-[#16875D]"
              }`}
            />

            <div className="mb-8 flex items-start gap-4 border-b border-neutral-100 pb-8">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-green-100 text-brand-green-900">
                {isPrivacy ? <Shield className="h-5 w-5" /> : <Scale className="h-5 w-5" />}
              </span>
              <div>
                <p className="font-heading text-lg font-bold text-neutral-900">{storeName}</p>
                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  These terms apply to our website, online store, and related customer services in
                  Bangladesh. For questions, email{" "}
                  <a
                    className="font-medium text-brand-green-600 hover:text-brand-green-900"
                    href={`mailto:${supportEmail}`}
                  >
                    {supportEmail}
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <section key={section.title} id={`section-${index + 1}`}>
                  <h2 className="font-heading text-xl font-bold tracking-tight text-neutral-900">
                    <span className="mr-2 text-brand-green-600/50">{String(index + 1).padStart(2, "0")}</span>
                    {section.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-sm leading-7 text-neutral-600 sm:text-[15px]">
                    {section.body}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-2 rounded-2xl bg-brand-green-100/60 px-4 py-3 text-xs text-brand-green-900">
              <Leaf className="h-3.5 w-3.5 shrink-0" />
              <p>
                Well Health Trade International is committed to transparent, clinical-grade care —
                including how we handle your data and orders.
              </p>
            </div>
          </article>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              className="font-medium text-brand-green-600 hover:text-brand-green-900"
              href={isPrivacy ? "/terms" : "/privacy"}
            >
              {isPrivacy ? "View Terms of Service" : "View Privacy Policy"}
            </Link>
            <span className="text-neutral-300">·</span>
            <Link className="font-medium text-brand-green-600 hover:text-brand-green-900" href="/contact">
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
