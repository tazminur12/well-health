import {
  BadgeCheck,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    description: "Lab Tested Products",
  },
  {
    icon: BadgeCheck,
    title: "GMP Certified",
    description: "Manufacturing",
  },
  {
    icon: FlaskConical,
    title: "Scientifically Formulated",
    description: "For Better Results",
  },
  {
    icon: Stethoscope,
    title: "Trusted by Doctors",
    description: "Recommended",
  },
];

export function TrustBadges() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8 lg:pb-14">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {badges.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group rounded-2xl border border-brand-green-100 bg-brand-green-100/35 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:bg-brand-green-100/55 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-brand-green-600 shadow-sm transition-transform duration-200 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                    {description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}