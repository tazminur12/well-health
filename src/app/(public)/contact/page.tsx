import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { CTABanner } from "@/components/public/cta-banner";
import { ContactFormCard } from "@/components/public/contact-form-card";
import { ContactInfoCards } from "@/components/public/contact-info-cards";
import { FAQAccordion } from "@/components/public/faq-accordion";
import { MapCard } from "@/components/public/map-card";

export default function ContactPage() {
  return (
    <div className="bg-white text-neutral-900">
      <section className="bg-[radial-gradient(circle_at_top_right,_rgba(22,135,93,0.12),_transparent_28%),linear-gradient(135deg,_#eef8f2_0%,_#ffffff_46%,_#f8fbf9_100%)] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <div className="text-sm text-neutral-500">
              <Link className="transition-colors duration-200 hover:text-brand-green-600" href="/">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-brand-green-600">Contact Us</span>
            </div>

            <div className="max-w-3xl space-y-4">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                Contact Us
              </h1>
              <p className="text-lg leading-8 text-neutral-500">
                We&apos;d Love to Hear From You
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-8 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ContactInfoCards />
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <ContactFormCard />
            <MapCard />
          </div>
        </div>
      </section>

      <FAQAccordion />

      <CTABanner
        buttonClassName="bg-gold-accent text-brand-green-900 hover:bg-[#b88f3f]"
        buttonLabel="Chat With Us"
        href="/contact"
        buttonIcon={<MessageCircle className="h-4 w-4" />}
        subtitle="Still have questions? Our team is here to help you with products, orders, and general support."
        title="Still Have Questions?"
      />
    </div>
  );
}