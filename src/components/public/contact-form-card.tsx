"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { showAuthError, showAuthSuccess } from "@/lib/auth/alerts";
import { submitContactMessageAction } from "@/lib/messages/actions";

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

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-neutral-800" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100";

export function ContactFormCard() {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
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

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitting(true);
    try {
      const result = await submitContactMessageAction({ ...values, source: "contact" });
      if (result.error) {
        await showAuthError("Couldn’t send", result.error);
        return;
      }
      reset();
      await showAuthSuccess("Message sent", result.success ?? "We’ll get back to you soon.");
    } catch {
      await showAuthError("Couldn’t send", "Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#E8F5EE] via-white to-[#F0F7F3] p-7 shadow-[0_12px_36px_rgba(15,23,42,0.05)] ring-1 ring-neutral-200/70 sm:p-8 lg:p-9">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0B4D3A] to-[#16875D]"
      />

      <div className="relative mb-8 space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-green-600">
          Contact form
        </p>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Send us a message
        </h2>
        <p className="text-sm leading-7 text-neutral-500">
          Share your question, order concern, or product inquiry — we&apos;ll respond with care.
        </p>
      </div>

      <form className="relative space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <input className={inputClassName} id="name" placeholder="Your full name" {...register("name")} />
            {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
          </div>

          <div>
            <FieldLabel htmlFor="phone">Phone number</FieldLabel>
            <input className={inputClassName} id="phone" placeholder="01XXXXXXXXX" {...register("phone")} />
            {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p> : null}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <input
              className={inputClassName}
              id="email"
              placeholder="you@example.com"
              type="email"
              {...register("email")}
            />
            {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
          </div>

          <div>
            <FieldLabel htmlFor="subject">Subject</FieldLabel>
            <input
              className={inputClassName}
              id="subject"
              placeholder="How can we help?"
              {...register("subject")}
            />
            {errors.subject ? (
              <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="message">Message</FieldLabel>
          <textarea
            className={`${inputClassName} min-h-36 resize-none`}
            id="message"
            placeholder="Write your message"
            rows={5}
            {...register("message")}
          />
          {errors.message ? (
            <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
          ) : null}
        </div>

        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          <Send className="h-4 w-4" />
          {submitting ? "Sending…" : "Send message"}
        </button>
      </form>
    </section>
  );
}
