"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { AuthInput } from "@/components/auth/auth-input";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator";
import { resetPasswordAction } from "@/lib/auth/actions";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password") ?? "";

  useEffect(() => {
    let active = true;

    async function verifyRecoverySession() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;
      setSessionReady(Boolean(session));
    }

    void verifyRecoverySession();

    return () => {
      active = false;
    };
  }, []);

  function onSubmit(values: ResetPasswordInput) {
    setFormError(null);
    startTransition(async () => {
      const result = await resetPasswordAction(values);
      if (result?.error) {
        setFormError(result.error);
      }
    });
  }

  if (sessionReady === null) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-5 w-5 animate-spin text-brand-green-600" />
        Verifying reset link...
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <ShieldAlert className="h-6 w-6" />
        </div>

        <div className="space-y-2 text-center">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Link expired
          </h1>
          <p className="text-sm leading-6 text-neutral-500">
            This password reset link is invalid or has already been used. Request a new one to
            continue.
          </p>
        </div>

        <Link
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.99] active:bg-brand-green-900 hover:bg-brand-green-900"
          href="/forgot-password"
        >
          Request new reset link
        </Link>

        <Link
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 text-sm font-semibold text-brand-green-600 transition-colors duration-200 hover:text-brand-green-900"
          href="/login"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Set new password
        </h1>
        <p className="text-sm leading-6 text-neutral-500">
          Choose a strong password you haven&apos;t used before. You&apos;ll sign in with it next.
        </p>
      </div>

      <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <AuthInput
            autoComplete="new-password"
            error={errors.password?.message}
            icon={Lock}
            label="New password"
            placeholder="Create a new password"
            rightSlot={
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors duration-200 active:bg-neutral-100 hover:bg-white hover:text-neutral-800"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            type={showPassword ? "text" : "password"}
            {...register("password")}
          />
          <PasswordStrengthIndicator password={password} />
        </div>

        <AuthInput
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          icon={Lock}
          label="Confirm password"
          placeholder="Re-enter new password"
          rightSlot={
            <button
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors duration-200 active:bg-neutral-100 hover:bg-white hover:text-neutral-800"
              onClick={() => setShowConfirmPassword((current) => !current)}
              type="button"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          type={showConfirmPassword ? "text" : "password"}
          {...register("confirmPassword")}
        />

        {formError ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {formError}
          </div>
        ) : null}

        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.99] active:bg-brand-green-900 hover:bg-brand-green-900 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isPending}
          type="submit"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500">
        Changed your mind?{" "}
        <Link
          className="font-semibold text-brand-green-600 transition-colors duration-200 hover:text-brand-green-900"
          href="/login"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
