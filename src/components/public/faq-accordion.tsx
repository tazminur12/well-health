"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How long does delivery take?",
    answer:
      "Most orders are processed quickly and typically delivered within a few business days depending on your location in Bangladesh.",
  },
  {
    question: "Do you offer Cash on Delivery?",
    answer:
      "Yes, COD can be supported for selected areas and eligible orders, with payment options shown during checkout later.",
  },
  {
    question: "Are your products lab tested?",
    answer:
      "Our product standards are built around quality assurance, lab testing, and careful sourcing to help ensure consistency.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Order tracking will be available from your account dashboard once the checkout and backend flow are connected.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Returns are handled based on product condition and order issues. The final policy will be formalized before launch.",
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-neutral-100 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base leading-8 text-neutral-500 sm:text-lg">
            A quick set of answers to common questions about ordering, delivery, and product quality.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={faq.question}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
              >
                <button
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-200 hover:bg-neutral-50"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  type="button"
                >
                  <span className="font-medium text-neutral-900">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-brand-green-600 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`} />
                </button>

                <div
                  className={`grid transition-all duration-200 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden px-6 pb-5 text-sm leading-7 text-neutral-500">
                    {faq.answer}
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