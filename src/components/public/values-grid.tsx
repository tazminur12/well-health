import {
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const values = [
  {
    icon: ShieldCheck,
    title: "Quality",
    description: "Uncompromising standards in sourcing, formulation, and presentation.",
  },
  {
    icon: HeartHandshake,
    title: "Integrity",
    description: "Honest, transparent practices that build confidence and long-term trust.",
  },
  {
    icon: Users,
    title: "Care",
    description: "Customer wellbeing first, with support that feels human and responsive.",
  },
  {
    icon: Sparkles,
    title: "Innovation",
    description: "Continuous improvement through science, learning, and better ideas.",
  },
];

export function ValuesGrid() {
  return (
    <section className="bg-neutral-100 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Our Core Values
          </h2>
          <p className="mt-4 text-base leading-8 text-neutral-500 sm:text-lg">
            The principles that shape how we build products, serve customers, and grow with
            responsibility.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {values.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-green-600 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-600 transition-transform duration-200 group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-neutral-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-500">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}