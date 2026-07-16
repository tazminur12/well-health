"use server";

import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/lib/auth/schemas";
import { syncUserProfile } from "@/lib/auth/session";
import { rateLimitForRequest } from "@/lib/rate-limit/server";
import { createClient } from "@/lib/supabase/server";

export type AuthActionResult = {
  error?: string;
  success?: string;
};

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function safeRedirectPath(path?: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }
  return path;
}

export async function loginAction(
  input: LoginInput,
  nextPath?: string
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid login details" };
  }

  const rateLimited = await rateLimitForRequest("auth:login");
  if (rateLimited) return rateLimited;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.trim().toLowerCase(),
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  let role: Role = Role.CUSTOMER;
  if (data.user) {
    const meta = data.user.user_metadata ?? {};
    const roleFromMeta = String(meta.role ?? "CUSTOMER").toUpperCase();
    role =
      roleFromMeta === "ADMIN" || roleFromMeta === "SUPPORT"
        ? (roleFromMeta as Role)
        : Role.CUSTOMER;

    await syncUserProfile({
      id: data.user.id,
      email: data.user.email ?? parsed.data.email,
      name: (meta.full_name as string | undefined) ?? null,
      phone: (meta.phone as string | undefined) ?? null,
      role,
    });
  }

  const fallback = role === Role.ADMIN ? "/admin" : "/dashboard";
  redirect(nextPath ? safeRedirectPath(nextPath) : fallback);
}

export async function registerAction(input: RegisterInput): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid registration details" };
  }

  const rateLimited = await rateLimitForRequest("auth:register");
  if (rateLimited) return rateLimited;

  const email = parsed.data.email.trim().toLowerCase();
  const phone = parsed.data.phone.trim();
  const fullName = parsed.data.fullName.trim();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: fullName,
        phone,
        role: Role.CUSTOMER,
      },
      emailRedirectTo: `${getAppUrl()}/login`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await syncUserProfile({
      id: data.user.id,
      email: data.user.email ?? email,
      name: fullName,
      phone,
      role: Role.CUSTOMER,
    });
  }

  // Email confirmation enabled → no session yet
  if (!data.session) {
    return {
      success: "Account created. Please check your email to confirm, then sign in.",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(
  input: ForgotPasswordInput
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please enter a valid email" };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const rateLimited = await rateLimitForRequest("auth:forgot-password", email);
  if (rateLimited) return rateLimited;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppUrl()}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  // Always return the same message to avoid email enumeration.
  return {
    success: "If an account exists for that email, we sent a password reset link.",
  };
}

export async function resetPasswordAction(
  input: ResetPasswordInput
): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your password" };
  }

  const rateLimited = await rateLimitForRequest("auth:reset-password");
  if (rateLimited) return rateLimited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "This reset link is invalid or has expired. Please request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  redirect("/login?reset=success");
}
