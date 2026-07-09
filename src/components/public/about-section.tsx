import Link from "next/link";
import {
  Award,
  Building2,
  Gem,
  HeartHandshake,
  Target,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Our Mission",
    description: "Better Health, Better Tomorrow",
  },
  {
    icon: Gem,
    title: "Our Vision",
    description: "Global Health For Everyone",
  },
  {
    icon: HeartHandshake,
    title: "Our Values",
    description: "Quality | Integrity | Care | Innovation",
  },
  {
    icon: Award,
    title: "Why Choose Us",
    description: "Trusted Quality, Customer First",
  },
];

export function AboutSection() {
  return (
    <section className="bg-neutral-100 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14">
          <div className="order-1 lg:order-1">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md">
              <div className="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.12),_transparent_35%),linear-gradient(135deg,_#f4f5f4_0%,_#e5e7eb_100%)]">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/80 shadow-sm ring-1 ring-neutral-200">
                  <Building2 className="h-12 w-12 text-brand-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="order-2 space-y-6 lg:order-2">
            <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-brand-green-600">
              About Us
            </div>

            <div className="space-y-4">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Well Health Trade International
              </h2>

              <p className="max-w-2xl text-base leading-8 text-neutral-500 sm:text-lg">
                Well Health Trade International is a healthcare company dedicated to improving
                lives through high quality, safe, and effective health supplements. We focus on
                innovation, quality assurance, and customer satisfaction in everything we do.
              </p>
            </div>

            <Link
              className="inline-flex items-center justify-center rounded-lg bg-brand-green-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
              href="/about"
            >
              READ MORE
            </Link>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-green-600 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-brand-green-600 transition-transform duration-200 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}