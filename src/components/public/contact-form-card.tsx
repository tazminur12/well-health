"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ContactFormValues = {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
};

const contactFormSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-neutral-900" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100";

export function ContactFormCard() {
  const { register, handleSubmit, reset } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      phone: "",
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
    <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-8 space-y-3">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
          Send Us a Message
        </h2>
        <p className="text-sm leading-6 text-neutral-500">
          Share your question, order concern, or product inquiry and we’ll get back to you.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="name">Full Name</FieldLabel>
            <input className={inputClassName} id="name" placeholder="Your full name" {...register("name")} />
          </div>

          <div>
            <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
            <input className={inputClassName} id="phone" placeholder="01XXXXXXXXX" {...register("phone")} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <input className={inputClassName} id="email" placeholder="you@example.com" type="email" {...register("email")} />
          </div>

          <div>
            <FieldLabel htmlFor="subject">Subject</FieldLabel>
            <input className={inputClassName} id="subject" placeholder="How can we help?" {...register("subject")} />
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
        </div>

        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-green-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md"
          type="submit"
        >
          <Send className="h-4 w-4" />
          SEND MESSAGE
        </button>
      </form>
    </section>
  );
}