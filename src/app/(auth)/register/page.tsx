"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { AuthInput } from "@/components/auth/auth-input";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator";
import { registerAction } from "@/lib/auth/actions";
import {
  closeAuthAlert,
  showAuthError,
  showAuthLoading,
  showAuthSuccess,
} from "@/lib/auth/alerts";
import { registerSchema, type RegisterInput } from "@/lib/auth/schemas";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const password = watch("password") ?? "";
  const acceptedTerms = Boolean(watch("acceptTerms"));

  function onSubmit(values: RegisterInput) {
    startTransition(async () => {
      try {
        void showAuthLoading("Creating your account...");
        const result = await registerAction(values);

        if (result?.error) {
          closeAuthAlert();
          await showAuthError("Registration failed", result.error);
          return;
        }

        if (result?.success) {
          closeAuthAlert();
          await showAuthSuccess("Account created", result.success);
          router.push("/login");
          return;
        }

        closeAuthAlert();
        await showAuthSuccess("Welcome to Well Health", "Your account is ready.");
        router.refresh();
      } catch {
        closeAuthAlert();
        // Server redirect on successful signup with active session.
      }
    });
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Create account
        </h1>
        <p className="text-sm leading-6 text-neutral-500">
          Join Well Health for trusted supplements and easy order tracking.
        </p>
      </div>

      <form className="space-y-3.5 sm:space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
        <AuthInput
          autoComplete="name"
          error={errors.fullName?.message}
          icon={User}
          label="Full Name"
          placeholder="Your full name"
          type="text"
          {...register("fullName")}
        />

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
          autoComplete="tel"
          error={errors.phone?.message}
          icon={Phone}
          inputMode="tel"
          label="Phone Number"
          placeholder="1XXXXXXXXX"
          prefixBadge="+880"
          type="tel"
          {...register("phone")}
        />

        <div className="space-y-2">
          <AuthInput
            autoComplete="new-password"
            error={errors.password?.message}
            icon={Lock}
            label="Password"
            placeholder="Create a password"
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
          label="Confirm Password"
          placeholder="Re-enter password"
          rightSlot={
            <button
              aria-label={
                showConfirmPassword ? "Hide confirm password" : "Show confirm password"
              }
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

        <div className="space-y-1.5">
          <label className="inline-flex cursor-pointer items-start gap-2.5 text-sm leading-6 text-neutral-600">
            <input
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-600"
              type="checkbox"
              {...register("acceptTerms")}
            />
            <span>
              I agree to the{" "}
              <Link className="font-semibold text-brand-green-600 hover:text-brand-green-900" href="#">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link className="font-semibold text-brand-green-600 hover:text-brand-green-900" href="#">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.acceptTerms ? (
            <p className="text-xs text-red-600">{errors.acceptTerms.message}</p>
          ) : null}
        </div>

        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.99] active:bg-brand-green-900 hover:bg-brand-green-900 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={!acceptedTerms || isPending}
          type="submit"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{" "}
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
