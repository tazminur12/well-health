"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthInput } from "@/components/auth/auth-input";
import { AuthToast } from "@/components/auth/auth-toast";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2400);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  async function onSubmit(values: LoginFormValues) {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    console.log("Login submit stub", values);
    setLoading(false);
    setToastMessage("Signed in successfully!");
  }

  return (
    <>
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold text-neutral-900">Welcome Back</h1>
        <p className="text-sm text-neutral-500">Sign in to continue to your account</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <AuthInput
          icon={Mail}
          label="Email"
          placeholder="you@example.com"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />

        <AuthInput
          icon={Lock}
          label="Password"
          placeholder="Enter your password"
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

        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 text-neutral-600">
            <input
              className="h-4 w-4 rounded border-neutral-300 text-brand-green-600 focus:ring-brand-green-600"
              type="checkbox"
              {...register("remember")}
            />
            Remember me
          </label>

          <Link className="font-medium text-brand-green-600 hover:underline" href="#">
            Forgot Password?
          </Link>
        </div>

        <Button
          className="h-12 w-full rounded-lg bg-brand-green-600 text-white hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md disabled:translate-y-0"
          disabled={loading}
          type="submit"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "SIGN IN"}
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
        Don&apos;t have an account?{" "}
        <Link className="font-semibold text-brand-green-600 hover:underline" href="/register">
          Sign Up
        </Link>
      </p>

      <AuthToast message={toastMessage} onClose={() => setToastMessage(null)} />
    </>
  );
}
