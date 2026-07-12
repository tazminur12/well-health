"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { AuthInput } from "@/components/auth/auth-input";
import { forgotPasswordAction } from "@/lib/auth/actions";
import {
  closeAuthAlert,
  showAuthError,
  showAuthInfo,
  showAuthLoading,
  showAuthSuccess,
} from "@/lib/auth/alerts";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/auth/schemas";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const linkError = searchParams.get("error") === "invalid_link";

  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (!linkError) return;
    void showAuthError(
      "Link expired",
      "That reset link is invalid or expired. Request a new one below."
    );
  }, [linkError]);

  function onSubmit(values: ForgotPasswordInput) {
    startTransition(async () => {
      void showAuthLoading("Sending reset link...");
      const result = await forgotPasswordAction(values);
      closeAuthAlert();

      if (result?.error) {
        await showAuthError("Could not send link", result.error);
        return;
      }

      const email = values.email.trim().toLowerCase();
      setSubmittedEmail(email);
      await showAuthSuccess(
        "Check your inbox",
        result?.success ??
          `If an account exists for ${email}, we sent a password reset link.`
      );
    });
  }

  function onResend() {
    const email = submittedEmail ?? getValues("email");
    if (!email) return;

    startTransition(async () => {
      void showAuthLoading("Resending reset link...");
      const result = await forgotPasswordAction({ email });
      closeAuthAlert();

      if (result?.error) {
        await showAuthError("Could not resend", result.error);
        return;
      }

      await showAuthInfo(
        "Link resent",
        "If the email is registered, another reset link is on its way."
      );
    });
  }

  if (submittedEmail) {
    return (
      <div className="space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green-100 text-brand-green-600">
          <Mail className="h-6 w-6" />
        </div>

        <div className="space-y-2 text-center">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Check your email
          </h1>
          <p className="text-sm leading-6 text-neutral-500">
            We sent a password reset link to{" "}
            <span className="font-semibold text-neutral-800">{submittedEmail}</span> if an
            account exists for that address.
          </p>
        </div>

        <div className="space-y-3 rounded-xl border border-neutral-200 bg-[#F7F8F9] p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800">
            <ShieldCheck className="h-4 w-4 text-brand-green-600" />
            What to do next
          </p>
          <ul className="space-y-2.5 text-sm leading-6 text-neutral-600">
            <li className="flex gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-600" />
              Open the email and click the secure reset link.
            </li>
            <li className="flex gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-600" />
              The link expires after a short time for your security.
            </li>
            <li className="flex gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-600" />
              Check spam or promotions if you don&apos;t see it.
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-800 shadow-sm transition-all duration-200 active:bg-neutral-50 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isPending}
            onClick={onResend}
            type="button"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resend reset link"}
          </button>

          <Link
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 text-sm font-semibold text-brand-green-600 transition-colors duration-200 hover:text-brand-green-900"
            href="/login"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>

        <button
          className="w-full text-center text-sm text-neutral-500 transition-colors duration-200 hover:text-neutral-800"
          onClick={() => setSubmittedEmail(null)}
          type="button"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Forgot password?
        </h1>
        <p className="text-sm leading-6 text-neutral-500">
          Enter the email linked to your Well Health account and we&apos;ll send a secure reset
          link.
        </p>
      </div>

      <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
        <AuthInput
          autoComplete="email"
          error={errors.email?.message}
          icon={Mail}
          label="Email"
          placeholder="you@example.com"
          type="email"
          {...register("email")}
        />

        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.99] active:bg-brand-green-900 hover:bg-brand-green-900 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isPending}
          type="submit"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
        </button>
      </form>

      <div className="rounded-xl border border-neutral-200 bg-[#F7F8F9] px-4 py-3 text-sm leading-6 text-neutral-600">
        For your security, the reset link works only once and expires shortly after it is sent.
      </div>

      <p className="text-center text-sm text-neutral-500">
        Remember your password?{" "}
        <Link
          className="font-semibold text-brand-green-600 transition-colors duration-200 hover:text-brand-green-900"
          href="/login"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[240px] items-center justify-center text-sm text-neutral-500">
          Loading...
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
