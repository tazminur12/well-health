import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";

const socialLinks = [
  { label: "Facebook", icon: Facebook },
  { label: "Instagram", icon: Instagram },
  { label: "LinkedIn", icon: Linkedin },
  { label: "YouTube", icon: Youtube },
];

export function TopBar() {
  return (
    <div className="hidden md:block bg-brand-green-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-2 text-xs lg:px-8">
        <p className="font-medium tracking-wide">
          Welcome to Well Health Trade International
        </p>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4 text-white/85">
            <a
              className="inline-flex items-center gap-1.5 hover:text-white"
              href="mailto:info@wellhealthint.com"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>info@wellhealthint.com</span>
            </a>
            <a
              className="inline-flex items-center gap-1.5 hover:text-white"
              href="tel:+8801712345678"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>+880 1712 345 678</span>
            </a>
            <div className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-white/15 pl-5">
            {socialLinks.map(({ label, icon: Icon }) => (
              <a
                key={label}
                aria-label={label}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                href="#"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}