import {
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import { CTABanner } from "@/components/public/cta-banner";
import { ContactFormCard } from "@/components/public/contact-form-card";
import { FAQAccordion } from "@/components/public/faq-accordion";
import { MapCard } from "@/components/public/map-card";
import { PageHero } from "@/components/public/page-hero";
import { getPublicFaqItems } from "@/lib/content/public-queries";
import {
  formatStoreAddress,
  googleMapsDirectionsUrl,
  phoneTelHref,
  type StoreSettings,
} from "@/lib/settings/schemas";
import { getPublicStoreSettings } from "@/lib/settings/public-queries";
import { cn } from "@/lib/utils";

const infoStyles = [
  {
    card: "from-[#E8F5EE] via-white to-[#F0F7F3]",
    bar: "from-[#0B4D3A] to-[#16875D]",
    iconWrap: "from-[#0B4D3A]/10 to-[#16875D]/15 text-brand-green-800",
  },
  {
    card: "from-[#F5F0E6] via-white to-[#E8F5EE]",
    bar: "from-[#C9A24B] to-[#16875D]",
    iconWrap: "from-[#C9A24B]/15 to-[#16875D]/10 text-[#8B6B2E]",
  },
  {
    card: "from-[#E6F4F0] via-white to-[#EEF8F3]",
    bar: "from-[#0F766E] to-[#34D399]",
    iconWrap: "from-[#0F766E]/10 to-emerald-200/40 text-teal-800",
  },
  {
    card: "from-[#EEF8F3] via-white to-[#F5F0E6]",
    bar: "from-[#16875D] to-[#C9A24B]",
    iconWrap: "from-[#16875D]/12 to-[#C9A24B]/15 text-brand-green-800",
  },
];

function ContactInfoGrid({ settings }: { settings: StoreSettings }) {
  const address = formatStoreAddress(settings);
  const cards = [
    {
      icon: Phone,
      title: "Call us",
      detail: settings.supportPhone,
      href: phoneTelHref(settings.supportPhone),
      hint: "Speak with our support team",
    },
    {
      icon: Mail,
      title: "Email us",
      detail: settings.supportEmail,
      href: `mailto:${settings.supportEmail}`,
      hint: "We usually reply within 24 hours",
    },
    {
      icon: MapPin,
      title: "Visit us",
      detail: address,
      href: googleMapsDirectionsUrl(settings),
      hint: `${settings.city}, ${settings.country}`,
    },
    {
      icon: Clock3,
      title: "Working hours",
      detail: settings.workingHours,
      href: undefined as string | undefined,
      hint: "Customer care schedule",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const style = infoStyles[index % infoStyles.length]!;
        const Icon = card.icon;
        const className = cn(
          "group relative block overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)] ring-1 ring-neutral-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(22,135,93,0.1)] sm:p-7",
          style.card
        );

        const body = (
          <>
            <div
              aria-hidden
              className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", style.bar)}
            />
            <div className="relative space-y-4">
              <span
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-white/80",
                  style.iconWrap
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-heading text-lg font-bold text-neutral-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-700">{card.detail}</p>
                <p className="mt-2 text-xs text-neutral-500">{card.hint}</p>
              </div>
            </div>
          </>
        );

        if (card.href) {
          return (
            <a
              className={className}
              href={card.href}
              key={card.title}
              rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
              target={card.href.startsWith("http") ? "_blank" : undefined}
            >
              {body}
            </a>
          );
        }

        return (
          <article className={className} key={card.title}>
            {body}
          </article>
        );
      })}
    </div>
  );
}

export async function ContactPageContent() {
  const [settings, faqs] = await Promise.all([
    getPublicStoreSettings(),
    getPublicFaqItems(),
  ]);

  const whatsappDigits = settings.whatsapp?.replace(/\D/g, "") ?? "";
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits.replace(/^0/, "880")}`
    : "/contact";

  return (
    <div className="bg-[#F7F8F9] text-neutral-900">
      <PageHero
        crumbLabel="Contact Us"
        description="Product questions, order help, or partnership enquiries — our team is ready with clear, caring support."
        eyebrow="Get in touch"
        title="We're here to help"
        tone="contact"
      />

      {/* Soft promise strip */}
      <section className="border-b border-brand-green-100/70 bg-white py-10">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
            Customer care
          </p>
          <p className="mt-3 font-heading text-xl font-bold text-neutral-900 sm:text-2xl">
            Reach us by phone, email, or visit — premium support without the wait.
          </p>
        </div>
      </section>

      {/* Info cards */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
              Channels
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Choose how to reach us
            </h2>
          </div>
          <ContactInfoGrid settings={settings} />
        </div>
      </section>

      {/* Form + map */}
      <section className="relative overflow-hidden bg-white py-14 sm:py-16 lg:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(22,135,93,0.06),_transparent_45%),radial-gradient(ellipse_at_bottom_left,_rgba(201,162,75,0.05),_transparent_40%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
              Message
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Send a note — we&apos;ll follow up
            </h2>
            <p className="mt-3 text-base leading-8 text-neutral-500">
              Share your question or order concern. Our support team reviews every message
              carefully.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.85fr] lg:items-start lg:gap-8">
            <ContactFormCard />
            <MapCard settings={settings} />
          </div>
        </div>
      </section>

      <FAQAccordion faqs={faqs} />

      <CTABanner
        buttonClassName={
          whatsappDigits
            ? "bg-[#25D366] text-white shadow-md hover:bg-[#1ebe57] hover:shadow-lg"
            : "bg-brand-green-900 text-white shadow-md hover:bg-brand-green-600 hover:shadow-lg"
        }
        buttonIcon={<MessageCircle className="h-4 w-4" />}
        buttonLabel={whatsappDigits ? "WhatsApp us" : "Send a message"}
        href={whatsappHref}
        subtitle="Still unsure? Message us directly — we’re happy to guide you on products, orders, and delivery."
        title="Need a quicker reply?"
        variant="soft"
      />
    </div>
  );
}
