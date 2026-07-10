"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthInput } from "@/components/auth/auth-input";
import { AuthToast } from "@/components/auth/auth-toast";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator";
import { Button } from "@/components/ui/button";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Please enter your full name"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email"),
    phone: z.string().min(9, "Enter a valid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
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

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2400);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  async function onSubmit(values: RegisterFormValues) {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 950));
    console.log("Register submit stub", values);
    setLoading(false);
    setToastMessage("Account created successfully!");
  }

  return (
    <>
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold text-neutral-900">Create Account</h1>
        <p className="text-sm text-neutral-500">Join us for a healthier tomorrow</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <AuthInput
          icon={User}
          label="Full Name"
          placeholder="Your full name"
          type="text"
          {...register("fullName")}
          error={errors.fullName?.message}
        />

        <AuthInput
          icon={Mail}
          label="Email"
          placeholder="you@example.com"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />

        <AuthInput
          icon={Phone}
          label="Phone Number"
          placeholder="1XXXXXXXXX"
          type="tel"
          {...register("phone")}
          error={errors.phone?.message}
          prefixBadge="+880"
        />

        <div className="space-y-2">
          <AuthInput
            icon={Lock}
            label="Password"
            placeholder="Create a password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            error={errors.password?.message}
            rightSlot={
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <PasswordStrengthIndicator password={password} />
        </div>

        <AuthInput
          icon={Lock}
          label="Confirm Password"
          placeholder="Re-enter password"
          type={showConfirmPassword ? "text" : "password"}
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          rightSlot={
            <button
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
              onClick={() => setShowConfirmPassword((current) => !current)}
              type="button"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        <label className="inline-flex items-start gap-2.5 text-sm text-neutral-600">
          <input
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-600"
            type="checkbox"
            {...register("acceptTerms")}
          />
          <span>
            I agree to the{" "}
            <Link className="font-medium text-brand-green-600 underline" href="#">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link className="font-medium text-brand-green-600 underline" href="#">
              Privacy Policy
            </Link>
          </span>
        </label>

        <Button
          className="h-12 w-full rounded-lg bg-brand-green-600 text-white hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md disabled:translate-y-0"
          disabled={!acceptedTerms || loading}
          type="submit"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "CREATE ACCOUNT"}
        </Button>
      </form>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-neutral-400">OR</span>
        </div>
      </div>

      <Button className="h-11 w-full rounded-lg border-neutral-200 bg-white" type="button" variant="outline">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-700">
          G
        </span>
        Continue with Google
      </Button>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link className="font-semibold text-brand-green-600 hover:underline" href="/login">
          Sign In
        </Link>
      </p>

      <AuthToast message={toastMessage} onClose={() => setToastMessage(null)} />
    </>
  );
}
