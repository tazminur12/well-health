import { Facebook, Instagram, Linkedin, MapPin, Youtube } from "lucide-react";

const socialLinks = [
  { label: "Facebook", icon: Facebook },
  { label: "Instagram", icon: Instagram },
  { label: "LinkedIn", icon: Linkedin },
  { label: "YouTube", icon: Youtube },
];

export function MapCard() {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md">
        <div className="relative min-h-[320px] bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.14),_transparent_28%),linear-gradient(135deg,_#edf7ef_0%,_#f5f5f5_45%,_#e8ecef_100%)]">
          <div className="absolute inset-0 opacity-25">
            <div className="absolute left-6 top-10 h-24 w-24 rounded-full border border-brand-green-600/20" />
            <div className="absolute right-10 top-16 h-16 w-16 rounded-full border border-brand-green-600/15" />
            <div className="absolute bottom-12 left-14 h-32 w-32 rounded-full border border-brand-green-600/15" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200">
                <MapPin className="h-8 w-8 text-brand-green-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-neutral-900">
                  Well Health Trade International
                </p>
                <p className="mt-1 text-sm text-neutral-500">Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 rounded-lg border border-neutral-200 bg-white px-3 py-3 shadow-md">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-600" />
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Well Health Trade International
                </p>
                <p className="text-xs text-neutral-500">Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        className="inline-flex w-full items-center justify-center rounded-lg border border-brand-green-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-green-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-100 hover:shadow-sm"
        type="button"
      >
        Get Directions
      </button>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-neutral-900">Follow Us</p>

          <div className="flex items-center gap-2">
            {socialLinks.map(({ label, icon: Icon }) => (
              <button
                key={label}
                aria-label={label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-600 hover:text-white hover:shadow-sm"
                type="button"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}