import { Clock3, Mail, MapPin, Phone } from "lucide-react";

import {
  formatStoreAddress,
  phoneTelHref,
  type StoreSettings,
} from "@/lib/settings/schemas";

type ContactInfoCardsProps = {
  settings: StoreSettings;
};

export function ContactInfoCards({ settings }: ContactInfoCardsProps) {
  const address = formatStoreAddress(settings);
  const contactCards = [
    {
      icon: Phone,
      title: "Call Us",
      detail: settings.supportPhone,
      href: phoneTelHref(settings.supportPhone),
    },
    {
      icon: Mail,
      title: "Email Us",
      detail: settings.supportEmail,
      href: `mailto:${settings.supportEmail}`,
    },
    {
      icon: MapPin,
      title: "Visit Us",
      detail: address,
      href: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
    },
    {
      icon: Clock3,
      title: "Working Hours",
      detail: settings.workingHours,
      href: undefined as string | undefined,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {contactCards.map(({ icon: Icon, title, detail, href }) => {
        const inner = (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-600 transition-transform duration-200 group-hover:scale-105">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-neutral-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-500">{detail}</p>
          </>
        );

        const className =
          "group block rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-brand-green-600 hover:shadow-lg";

        if (href) {
          return (
            <a
              key={title}
              className={className}
              href={href}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              target={href.startsWith("http") ? "_blank" : undefined}
            >
              {inner}
            </a>
          );
        }

        return (
          <article key={title} className={className}>
            {inner}
          </article>
        );
      })}
    </div>
  );
}
