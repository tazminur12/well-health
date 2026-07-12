"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  formatStoreAddress,
  phoneTelHref,
  type StoreSettings,
} from "@/lib/settings/schemas";
import { submitContactMessageAction } from "@/lib/messages/actions";
import { showAuthError, showAuthSuccess } from "@/lib/auth/alerts";
import { cn } from "@/lib/utils";

type ContactFormValues = {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
};

const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(8, "Phone is required"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(5, "Message is required"),
});

const inputClassName =
  "min-h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100";

type ContactSectionProps = {
  settings: StoreSettings;
};

export function ContactSection({ settings }: ContactSectionProps) {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const address = formatStoreAddress(settings);
  const mapsQuery = encodeURIComponent(address);
  const contactCards = [
    {
      icon: Phone,
      title: "Call Us",
      detail: settings.supportPhone,
      href: phoneTelHref(settings.supportPhone),
    },
    {
      icon: Mail,
      title: "Email Us",
      detail: settings.supportEmail,
      href: `mailto:${settings.supportEmail}`,
    },
    {
      icon: MapPin,
      title: "Visit Us",
      detail: [settings.city, settings.country].filter(Boolean).join(", "),
      href: `https://maps.google.com/?q=${mapsQuery}`,
    },
    {
      icon: Clock3,
      title: "Working Hours",
      detail: settings.workingHours,
      href: undefined as string | undefined,
    },
  ];

  const onSubmit = async (values: ContactFormValues) => {
    try {
      const result = await submitContactMessageAction({ ...values, source: "home" });
      if (result.error) {
        await showAuthError("Couldn’t send", result.error);
        return;
      }
      setSubmitted(true);
      reset();
      window.setTimeout(() => setSubmitted(false), 3500);
      await showAuthSuccess("Message sent", result.success ?? "We’ll get back to you soon.");
    } catch {
      await showAuthError("Couldn’t send", "Please try again in a moment.");
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#F7F8F9] py-12 sm:py-16 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(22,135,93,0.07),_transparent_45%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-1.5 sm:mb-8 sm:space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-green-600">
            Get in touch
          </p>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl">
            Contact Us
          </h2>
          <p className="max-w-lg text-sm leading-7 text-neutral-500 sm:text-base">
            Questions about products or orders? Reach our team — we usually reply within one business day.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
          {contactCards.map(({ icon: Icon, title, detail, href }) => {
            const content = (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-100 text-brand-green-600 sm:h-11 sm:w-11">
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-500 sm:text-sm">{title}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-neutral-900 sm:text-[15px]">
                    {detail}
                  </p>
                </div>
              </>
            );

            const className =
              "flex min-h-[5.5rem] flex-col gap-2.5 rounded-2xl border border-brand-green-100/80 bg-white p-3.5 shadow-sm transition-all duration-200 active:bg-brand-green-100/40 hover:-translate-y-0.5 hover:border-brand-green-600/35 hover:shadow-md sm:min-h-0 sm:flex-row sm:items-center sm:gap-3.5 sm:p-4";

            if (href) {
              return (
                <a
                  key={title}
                  className={className}
                  href={href}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  target={href.startsWith("http") ? "_blank" : undefined}
                >
                  {content}
                </a>
              );
            }

            return (
              <article key={title} className={className}>
                {content}
              </article>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-2 lg:items-start lg:gap-6">
          <form
            className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mb-5 space-y-1">
              <h3 className="font-heading text-lg font-bold text-neutral-900 sm:text-xl">
                Send a Message
              </h3>
              <p className="text-sm text-neutral-500">
                Fill in the form and our support team will get back to you.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800" htmlFor="home-contact-name">
                    Full Name
                  </label>
                  <input
                    className={inputClassName}
                    id="home-contact-name"
                    placeholder="Your name"
                    {...register("name")}
                  />
                  {errors.name ? (
                    <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800" htmlFor="home-contact-phone">
                    Phone
                  </label>
                  <input
                    className={inputClassName}
                    id="home-contact-phone"
                    inputMode="tel"
                    placeholder="01XXXXXXXXX"
                    {...register("phone")}
                  />
                  {errors.phone ? (
                    <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800" htmlFor="home-contact-email">
                    Email
                  </label>
                  <input
                    className={inputClassName}
                    id="home-contact-email"
                    placeholder="you@example.com"
                    type="email"
                    {...register("email")}
                  />
                  {errors.email ? (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800" htmlFor="home-contact-subject">
                    Subject
                  </label>
                  <input
                    className={inputClassName}
                    id="home-contact-subject"
                    placeholder="How can we help?"
                    {...register("subject")}
                  />
                  {errors.subject ? (
                    <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800" htmlFor="home-contact-message">
                  Message
                </label>
                <textarea
                  className={cn(inputClassName, "min-h-32 resize-none py-3")}
                  id="home-contact-message"
                  placeholder="Write your message..."
                  rows={4}
                  {...register("message")}
                />
                {errors.message ? (
                  <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                ) : null}
              </div>

              {submitted ? (
                <div
                  className="flex items-center gap-2 rounded-xl bg-brand-green-100 px-4 py-3 text-sm font-medium text-brand-green-900"
                  role="status"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Message sent — we&apos;ll reply soon.
                </div>
              ) : null}

              <button
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.99] active:bg-brand-green-900 hover:bg-brand-green-900 disabled:opacity-70"
                disabled={isSubmitting}
                type="submit"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </div>
          </form>

          <div className="space-y-3 sm:space-y-4">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="relative min-h-[16rem] bg-[radial-gradient(circle_at_top,_rgba(22,135,93,0.14),_transparent_32%),linear-gradient(135deg,_#edf7ef_0%,_#f5f5f5_50%,_#e8ecef_100%)] sm:min-h-[20rem] lg:min-h-[28rem]">
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200 sm:h-16 sm:w-16">
                      <MapPin className="h-7 w-7 text-brand-green-600 sm:h-8 sm:w-8" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-neutral-900">
                        {settings.storeName}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">{address}</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/70 bg-white/95 px-3 py-2.5 shadow-md backdrop-blur-sm sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-600" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {settings.city}
                      </p>
                      <p className="text-xs text-neutral-500">{settings.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <a
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-brand-green-600 px-5 text-sm font-semibold text-brand-green-600 transition-all duration-200 active:bg-brand-green-100 hover:bg-brand-green-100"
              href={`https://maps.google.com/?q=${mapsQuery}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
