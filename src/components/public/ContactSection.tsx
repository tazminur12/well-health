"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const contactFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

const contactCards = [
  {
    icon: Phone,
    text: "+880 1712 345 678",
  },
  {
    icon: Mail,
    text: "info@wellhealthint.com",
  },
  {
    icon: MapPin,
    text: "Dhaka, Bangladesh",
  },
  {
    icon: Clock3,
    text: "Sat - Thu: 9.00 AM - 6.00 PM",
  },
];

export function ContactSection() {
  const { register, handleSubmit, reset } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    console.log("Contact form submit", values);
    reset();
  };

  return (
    <section className="bg-neutral-100 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <span className="h-8 w-1.5 rounded-full bg-brand-green-600" />
          <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Contact Us
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.4fr_0.3fr_0.3fr] lg:items-start">
          <div className="space-y-4">
            {contactCards.map(({ icon: Icon, text }) => (
              <article
                key={text}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green-600 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-600">
                  <Icon className="h-4.5 w-4.5" />
                </div>

                <p className="text-sm font-medium text-neutral-700">{text}</p>
              </article>
            ))}
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md">
              <div className="relative flex min-h-[22rem] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.16),_transparent_30%),linear-gradient(135deg,_#edf7ef_0%,_#f5f5f5_45%,_#e8ecef_100%)]">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute left-6 top-10 h-24 w-24 rounded-full border border-brand-green-600/20" />
                  <div className="absolute right-10 top-16 h-16 w-16 rounded-full border border-brand-green-600/15" />
                  <div className="absolute bottom-12 left-14 h-32 w-32 rounded-full border border-brand-green-600/15" />
                </div>

                <div className="relative flex flex-col items-center gap-4 text-center">
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

                <div className="absolute bottom-4 left-4 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md">
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
          </div>

          <div>
            <form
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700" htmlFor="name">
                    Name
                  </label>
                  <input
                    className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100"
                    id="name"
                    placeholder="Your name"
                    {...register("name")}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700" htmlFor="email">
                    Email
                  </label>
                  <input
                    className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100"
                    id="email"
                    placeholder="Your email"
                    type="email"
                    {...register("email")}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700" htmlFor="subject">
                    Subject
                  </label>
                  <input
                    className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100"
                    id="subject"
                    placeholder="Subject"
                    {...register("subject")}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    className="min-h-28 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100"
                    id="message"
                    placeholder="Write your message"
                    rows={4}
                    {...register("message")}
                  />
                </div>

                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-green-600 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
                  type="submit"
                >
                  <Send className="h-4 w-4" />
                  SEND MESSAGE
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}