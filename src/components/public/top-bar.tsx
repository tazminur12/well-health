import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Youtube,
  type LucideIcon,
} from "lucide-react";

import {
  formatStoreAddress,
  phoneTelHref,
  type StoreSettings,
} from "@/lib/settings/schemas";

const socialConfig: { key: keyof StoreSettings; label: string; icon: LucideIcon }[] = [
  { key: "facebookUrl", label: "Facebook", icon: Facebook },
  { key: "instagramUrl", label: "Instagram", icon: Instagram },
  { key: "linkedinUrl", label: "LinkedIn", icon: Linkedin },
  { key: "youtubeUrl", label: "YouTube", icon: Youtube },
];

type TopBarProps = {
  settings: StoreSettings;
};

export function TopBar({ settings }: TopBarProps) {
  const socialLinks = socialConfig.filter((item) => Boolean(settings[item.key]));
  const shortAddress = [settings.city, settings.country].filter(Boolean).join(", ");

  return (
    <div className="hidden bg-brand-green-900 text-white md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-2 text-xs lg:px-8">
        <p className="font-medium tracking-wide">
          Welcome to {settings.storeName}
        </p>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4 text-white/85">
            <a
              className="inline-flex items-center gap-1.5 hover:text-white"
              href={`mailto:${settings.supportEmail}`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>{settings.supportEmail}</span>
            </a>
            <a
              className="inline-flex items-center gap-1.5 hover:text-white"
              href={phoneTelHref(settings.supportPhone)}
            >
              <Phone className="h-3.5 w-3.5" />
              <span>{settings.supportPhone}</span>
            </a>
            <div className="inline-flex items-center gap-1.5" title={formatStoreAddress(settings)}>
              <MapPin className="h-3.5 w-3.5" />
              <span>{shortAddress || "Bangladesh"}</span>
            </div>
          </div>

          {socialLinks.length > 0 ? (
            <div className="flex items-center gap-2 border-l border-white/15 pl-5">
              {socialLinks.map(({ key, label, icon: Icon }) => (
                <a
                  key={label}
                  aria-label={label}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                  href={String(settings[key])}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
