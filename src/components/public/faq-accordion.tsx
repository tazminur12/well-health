"use client";

import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

import type { AdminFaqItem } from "@/lib/content/mapper";
import { cn } from "@/lib/utils";

const fallbackFaqs: AdminFaqItem[] = [
  {
    id: "1",
    question: "How long does delivery take?",
    answer:
      "Most orders are processed within 24 hours and typically delivered in 2–5 business days across Bangladesh, depending on your district.",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "2",
    question: "Do you offer Cash on Delivery?",
    answer:
      "Yes. Cash on Delivery is available for eligible areas and orders. You’ll see COD as an option at checkout when it’s supported for your address.",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "3",
    question: "Are your products lab tested?",
    answer:
      "Yes. Our supplements follow quality-focused sourcing and lab-tested standards so you can trust what’s in every bottle.",
    sortOrder: 2,
    isActive: true,
  },
];

type FAQAccordionProps = {
  faqs?: AdminFaqItem[];
};

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const items = faqs && faqs.length > 0 ? faqs : fallbackFaqs;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(22,135,93,0.05),_transparent_50%)]"
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-4xl lg:px-8">
        <div className="mb-8 text-center sm:mb-10">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green-100 text-brand-green-600 sm:mb-4 sm:h-12 sm:w-12">
            <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
            Support
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
            Quick answers about ordering, delivery, and product quality.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-3.5">
          {items.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${faq.id}`;
            const buttonId = `faq-button-${faq.id}`;

            return (
              <article
                key={faq.id}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200",
                  isOpen ? "border-brand-green-600/35 shadow-md" : "border-neutral-200"
                )}
              >
                <button
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5 sm:py-4.5"
                  id={buttonId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  type="button"
                >
                  <span className="text-[15px] font-semibold text-neutral-900 sm:text-base">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-brand-green-600 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-200",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-neutral-100 px-4 pb-4 pt-3 text-sm leading-7 text-neutral-500 sm:px-5 sm:pb-5">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
