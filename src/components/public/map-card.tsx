import {
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Youtube,
  type LucideIcon,
} from "lucide-react";

import {
  formatStoreAddress,
  googleMapsDirectionsUrl,
  googleMapsEmbedUrl,
  type StoreSettings,
} from "@/lib/settings/schemas";

const socialConfig: { key: keyof StoreSettings; label: string; icon: LucideIcon }[] = [
  { key: "facebookUrl", label: "Facebook", icon: Facebook },
  { key: "instagramUrl", label: "Instagram", icon: Instagram },
  { key: "linkedinUrl", label: "LinkedIn", icon: Linkedin },
  { key: "youtubeUrl", label: "YouTube", icon: Youtube },
];

type MapCardProps = {
  settings: StoreSettings;
};

export function MapCard({ settings }: MapCardProps) {
  const address = formatStoreAddress(settings);
  const mapsHref = googleMapsDirectionsUrl(settings);
  const embedSrc = googleMapsEmbedUrl(settings);
  const socialLinks = socialConfig.filter((item) => Boolean(settings[item.key]));

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#E6F4F0] via-white to-[#EEF8F3] shadow-[0_12px_36px_rgba(15,23,42,0.05)] ring-1 ring-neutral-200/70">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-[#0F766E] to-[#34D399]"
        />

        <div className="relative">
          <div className="border-b border-brand-green-100/60 bg-white/80 px-5 py-4 backdrop-blur-sm sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-green-600">
              Location
            </p>
            <h3 className="mt-1 font-heading text-xl font-bold text-neutral-900">
              Find our office
            </h3>
            <p className="mt-1 text-sm text-neutral-500">{address}</p>
          </div>

          <div className="relative aspect-[4/3] min-h-[280px] w-full bg-brand-green-50 sm:min-h-[320px]">
            <iframe
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={embedSrc}
              title={`${settings.storeName} location on Google Maps`}
            />
          </div>

          <div className="border-t border-brand-green-100/60 bg-white/90 p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green-50 text-brand-green-700">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{settings.storeName}</p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">{address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a
        className="inline-flex w-full items-center justify-center rounded-xl border border-brand-green-600/80 bg-white px-6 py-3.5 text-sm font-semibold text-brand-green-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-50 hover:shadow-md"
        href={mapsHref}
        rel="noopener noreferrer"
        target="_blank"
      >
        Get directions
      </a>

      {socialLinks.length > 0 ? (
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#F5F0E6] via-white to-[#E8F5EE] p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)] ring-1 ring-neutral-200/70">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#C9A24B] to-[#16875D]"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Follow us</p>
              <p className="mt-0.5 text-xs text-neutral-500">Updates, tips & offers</p>
            </div>

            <div className="flex items-center gap-2">
              {socialLinks.map(({ key, label, icon: Icon }) => (
                <a
                  key={label}
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-green-700 ring-1 ring-neutral-200/80 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-600 hover:text-white hover:ring-brand-green-600"
                  href={String(settings[key])}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
