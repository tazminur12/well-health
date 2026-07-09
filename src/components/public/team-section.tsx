import { Linkedin, Mail, UserCircle2 } from "lucide-react";

const teamMembers = [
  { name: "Mst. Ayesha Rahman", role: "Founder & CEO" },
  { name: "Md. Tanvir Hasan", role: "Head of Quality Assurance" },
  { name: "Nusrat Jahan", role: "Operations Manager" },
  { name: "Rakib Ahmed", role: "Customer Relations Lead" },
];

export function TeamSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Meet Our Team
          </h2>
          <p className="mt-4 text-base leading-8 text-neutral-500 sm:text-lg">
            A small team focused on product quality, customer care, and steady growth.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {teamMembers.map((member) => (
            <article
              key={member.name}
              className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-brand-green-600 ring-1 ring-neutral-200">
                <UserCircle2 className="h-10 w-10" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-neutral-900">{member.name}</h3>
              <p className="mt-1 text-sm text-neutral-500">{member.role}</p>

              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  aria-label={`LinkedIn profile for ${member.name}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green-600 hover:text-brand-green-600 hover:shadow-sm"
                  type="button"
                >
                  <Linkedin className="h-4 w-4" />
                </button>
                <button
                  aria-label={`Email ${member.name}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green-600 hover:text-brand-green-600 hover:shadow-sm"
                  type="button"
                >
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}