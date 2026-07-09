"use client";

import { useState } from "react";

export function NewsletterStrip() {
  const [email, setEmail] = useState("");

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-brand-green-100 px-6 py-6 shadow-sm sm:px-8 sm:py-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
                Get 10% Off Your First Order
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Join our newsletter for product updates, wellness tips, and special offers.
              </p>
            </div>

            <form className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto" onSubmit={(event) => event.preventDefault()}>
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100 sm:min-w-[20rem]"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button
                className="inline-flex items-center justify-center rounded-lg bg-gold-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-green-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#b88f3f] hover:shadow-md"
                type="submit"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}