"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { AuthInput } from "@/components/auth/auth-input";
import { loginAction } from "@/lib/auth/actions";
import { showAuthError, showAuthSuccess } from "@/lib/auth/alerts";
import { loginSchema, type LoginInput } from "@/lib/auth/schemas";

/** Temporary demo accounts — remove before production. */
const DEMO_ACCOUNTS = [
  {
    label: "Customer",
    email: "customer@wellhealth.demo",
    password: "Demo@1234",
  },
  {
    label: "Admin",
    email: "admin@wellhealth.demo",
    password: "Demo@1234",
  },
] as const;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? undefined;
  const resetSuccess = searchParams.get("reset") === "success";

  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  useEffect(() => {
    if (!resetSuccess) return;
    void showAuthSuccess(
      "Password updated",
      "Please sign in with your new password to continue."
    );
  }, [resetSuccess]);

  function fillDemo(email: string, password: string) {
    setValue("email", email, { shouldValidate: true, shouldDirty: true });
    setValue("password", password, { shouldValidate: true, shouldDirty: true });
  }

  function onSubmit(values: LoginInput) {
    startTransition(async () => {
      try {
        const result = await loginAction(values, nextPath);
        if (result?.error) {
          await showAuthError("Sign in failed", result.error);
          return;
        }
        await showAuthSuccess("Welcome back", "You have signed in successfully.");
        router.refresh();
      } catch {
        // Server redirect on successful login — expected.
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Welcome back
        </h1>
        <p className="text-sm leading-6 text-neutral-500">
          Sign in to continue to your Well Health account.
        </p>
      </div>

      {/* TODO: remove demo login block before production */}
      <div className="rounded-xl border border-dashed border-brand-green-600/30 bg-brand-green-100/50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-green-900">
          Demo login (temporary)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              className="rounded-lg border border-brand-green-600/20 bg-white px-3 py-2.5 text-left transition-colors duration-200 hover:border-brand-green-600 hover:bg-white active:bg-brand-green-100"
              onClick={() => fillDemo(account.email, account.password)}
              type="button"
            >
              <span className="block text-sm font-semibold text-neutral-900">{account.label}</span>
              <span className="mt-0.5 block truncate text-[11px] text-neutral-500">
                {account.email}
              </span>
              <span className="mt-0.5 block text-[11px] text-neutral-400">{account.password}</span>
            </button>
          ))}
        </div>
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

        <AuthInput
          autoComplete="current-password"
          error={errors.password?.message}
          icon={Lock}
          label="Password"
          placeholder="Enter your password"
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

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2.5 text-neutral-600">
            <input
              className="h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-600"
              type="checkbox"
              {...register("remember")}
            />
            Remember me
          </label>

          <Link
            className="font-semibold text-brand-green-600 transition-colors duration-200 hover:text-brand-green-900"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>

        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.99] active:bg-brand-green-900 hover:bg-brand-green-900 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isPending}
          type="submit"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link
          className="font-semibold text-brand-green-600 transition-colors duration-200 hover:text-brand-green-900"
          href="/register"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[240px] items-center justify-center text-sm text-neutral-500">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
