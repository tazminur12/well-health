import { Clock3, Mail, MapPin, Phone } from "lucide-react";

const contactCards = [
  { icon: Phone, title: "Call Us", detail: "+880 1712 345 678" },
  { icon: Mail, title: "Email Us", detail: "info@wellhealthint.com" },
  { icon: MapPin, title: "Visit Us", detail: "Dhaka, Bangladesh" },
  { icon: Clock3, title: "Working Hours", detail: "Sat - Thu: 9.00 AM - 6.00 PM" },
];

export function ContactInfoCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {contactCards.map(({ icon: Icon, title, detail }) => (
        <article
          key={title}
          className="group rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-brand-green-600 hover:shadow-lg"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-600 transition-transform duration-200 group-hover:scale-105">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-neutral-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-500">{detail}</p>
        </article>
      ))}
    </div>
  );
}