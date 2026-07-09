import { Eye, Target } from "lucide-react";

export function MissionVisionCards() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl bg-brand-green-100 p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200">
              <Target className="h-5 w-5 text-brand-green-600" />
            </div>
            <h3 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
              Our Mission
            </h3>
            <p className="mt-3 max-w-2xl text-base leading-8 text-neutral-600">
              To improve lives across Bangladesh by offering high quality, safe, and effective
              health supplements backed by science and delivered with care. We work to make
              wellness accessible, trustworthy, and consistent for every customer we serve.
            </p>
          </article>

          <article className="rounded-2xl bg-neutral-100 p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200">
              <Eye className="h-5 w-5 text-brand-green-600" />
            </div>
            <h3 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
              Our Vision
            </h3>
            <p className="mt-3 max-w-2xl text-base leading-8 text-neutral-600">
              To become a trusted wellness brand that supports healthier communities through
              transparent practices, continuous innovation, and products people can rely on.
              We aim to set a high standard for supplement quality in the Bangladeshi market.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}