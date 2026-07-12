"use server";

import { AdminAuthError, requireAdmin } from "@/lib/admin/require-admin";
import type {
  ApiHealthReport,
  HealthServiceResult,
  HealthStatus,
} from "@/lib/health/schemas";
import { cloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export type HealthActionResult = {
  error?: string;
  data?: ApiHealthReport;
};

function handleError(error: unknown): HealthActionResult {
  if (
    error instanceof AdminAuthError ||
    (error instanceof Error && error.name === "AdminAuthError")
  ) {
    return { error: error instanceof Error ? error.message : "Unauthorized" };
  }
  console.error("Health check failed:", error);
  return {
    error: error instanceof Error ? error.message : "Health check failed.",
  };
}

function envConfigured(...keys: string[]) {
  return keys.every((key) => {
    const value = process.env[key]?.trim() ?? "";
    return value.length > 0 && !value.includes("xxxxxxxx");
  });
}

async function timed<T>(
  fn: () => Promise<T>
): Promise<{ ok: true; value: T; latencyMs: number } | { ok: false; error: string; latencyMs: number }> {
  const started = Date.now();
  try {
    const value = await fn();
    return { ok: true, value, latencyMs: Date.now() - started };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      latencyMs: Date.now() - started,
    };
  }
}

function deriveOverall(services: HealthServiceResult[]): HealthStatus {
  const active = services.filter((s) => s.status !== "not_configured");
  if (active.some((s) => s.status === "down")) return "down";
  if (active.some((s) => s.status === "degraded")) return "degraded";
  if (active.every((s) => s.status === "healthy")) return "healthy";
  return "degraded";
}

async function checkApp(): Promise<HealthServiceResult> {
  const started = Date.now();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return {
    id: "app",
    name: "Application",
    description: "Next.js runtime and public app URL",
    status: "healthy",
    latencyMs: Date.now() - started,
    message: "Runtime responding",
    detail: `${process.env.NODE_ENV ?? "development"} · ${appUrl}`,
    category: "core",
  };
}

async function checkDatabase(): Promise<HealthServiceResult> {
  const base = {
    id: "database" as const,
    name: "PostgreSQL",
    description: "Supabase Postgres via Prisma",
    category: "core" as const,
  };

  if (!envConfigured("DATABASE_URL")) {
    return {
      ...base,
      status: "not_configured",
      latencyMs: null,
      message: "DATABASE_URL is missing",
    };
  }

  const result = await timed(async () => {
    await prisma.$queryRaw`SELECT 1`;
    const [products, users] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
    ]);
    return { products, users };
  });

  if (!result.ok) {
    return {
      ...base,
      status: "down",
      latencyMs: result.latencyMs,
      message: "Database unreachable",
      detail: result.error,
    };
  }

  return {
    ...base,
    status: result.latencyMs > 1200 ? "degraded" : "healthy",
    latencyMs: result.latencyMs,
    message: result.latencyMs > 1200 ? "Connected, but latency is high" : "Connected",
    detail: `${result.value.products} products · ${result.value.users} users`,
  };
}

async function checkSupabase(): Promise<HealthServiceResult> {
  const base = {
    id: "supabase" as const,
    name: "Supabase Auth",
    description: "Auth API and project connectivity",
    category: "core" as const,
  };

  if (!envConfigured("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
    return {
      ...base,
      status: "not_configured",
      latencyMs: null,
      message: "Supabase public keys missing",
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
  const result = await timed(async () => {
    const response = await fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.status;
  });

  if (!result.ok) {
    return {
      ...base,
      status: "down",
      latencyMs: result.latencyMs,
      message: "Auth health endpoint failed",
      detail: result.error,
    };
  }

  const serviceRole = envConfigured("SUPABASE_SERVICE_ROLE_KEY");

  return {
    ...base,
    status: serviceRole ? "healthy" : "degraded",
    latencyMs: result.latencyMs,
    message: serviceRole ? "Auth API healthy" : "Auth OK · service role missing",
    detail: serviceRole
      ? "Anon + service role configured"
      : "Staff invites need SUPABASE_SERVICE_ROLE_KEY",
  };
}

async function checkCloudinary(): Promise<HealthServiceResult> {
  const base = {
    id: "cloudinary" as const,
    name: "Cloudinary",
    description: "Image CDN and signed uploads",
    category: "media" as const,
  };

  if (!envConfigured("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET")) {
    return {
      ...base,
      status: "not_configured",
      latencyMs: null,
      message: "Cloudinary credentials missing",
    };
  }

  const result = await timed(async () => {
    const ping = await cloudinary.api.ping();
    return ping;
  });

  if (!result.ok) {
    return {
      ...base,
      status: "down",
      latencyMs: result.latencyMs,
      message: "Cloudinary ping failed",
      detail: result.error,
    };
  }

  return {
    ...base,
    status: "healthy",
    latencyMs: result.latencyMs,
    message: "CDN reachable",
    detail: `Cloud · ${process.env.CLOUDINARY_CLOUD_NAME}`,
  };
}

async function checkResend(): Promise<HealthServiceResult> {
  const base = {
    id: "resend" as const,
    name: "Resend Email",
    description: "Transactional email delivery",
    category: "comms" as const,
  };

  if (!envConfigured("RESEND_API_KEY")) {
    return {
      ...base,
      status: "not_configured",
      latencyMs: null,
      message: "RESEND_API_KEY not set",
      detail: "Staff invites fall back to preview URLs locally",
    };
  }

  const result = await timed(async () => {
    const response = await fetch("https://api.resend.com/domains", {
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Unauthorized (${response.status})`);
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const json = (await response.json()) as { data?: unknown[] };
    return Array.isArray(json.data) ? json.data.length : 0;
  });

  if (!result.ok) {
    return {
      ...base,
      status: "down",
      latencyMs: result.latencyMs,
      message: "Resend API rejected the request",
      detail: result.error,
    };
  }

  return {
    ...base,
    status: "healthy",
    latencyMs: result.latencyMs,
    message: "API key valid",
    detail: `${result.value} domain${result.value === 1 ? "" : "s"} · from ${process.env.EMAIL_FROM ?? "default"}`,
  };
}

async function checkSslCommerz(): Promise<HealthServiceResult> {
  const configured = envConfigured(
    "SSLCOMMERZ_STORE_ID",
    "SSLCOMMERZ_STORE_PASSWORD"
  );
  return {
    id: "sslcommerz",
    name: "SSLCommerz",
    description: "Primary Bangladesh payment gateway",
    status: configured ? "healthy" : "not_configured",
    latencyMs: null,
    message: configured ? "Credentials present" : "Awaiting integration keys",
    detail: configured
      ? "Store ID configured"
      : "Add SSLCOMMERZ_STORE_ID & SSLCOMMERZ_STORE_PASSWORD when checkout ships",
    category: "payments",
  };
}

async function checkBkash(): Promise<HealthServiceResult> {
  const configured = envConfigured("BKASH_APP_KEY", "BKASH_APP_SECRET");
  return {
    id: "bkash",
    name: "bKash",
    description: "Secondary mobile wallet payments",
    status: configured ? "healthy" : "not_configured",
    latencyMs: null,
    message: configured ? "Credentials present" : "Awaiting integration keys",
    detail: configured
      ? "App credentials configured"
      : "Add BKASH_APP_KEY & BKASH_APP_SECRET when wallet checkout ships",
    category: "payments",
  };
}

export async function runApiHealthCheckAction(): Promise<HealthActionResult> {
  try {
    await requireAdmin();
    const started = Date.now();

    const services = await Promise.all([
      checkApp(),
      checkDatabase(),
      checkSupabase(),
      checkCloudinary(),
      checkResend(),
      checkSslCommerz(),
      checkBkash(),
    ]);

    const active = services.filter((s) => s.status !== "not_configured");
    const healthyCount = active.filter((s) => s.status === "healthy").length;

    return {
      data: {
        overall: deriveOverall(services),
        checkedAt: new Date().toISOString(),
        durationMs: Date.now() - started,
        healthyCount,
        totalCount: active.length || services.length,
        services,
        environment: process.env.NODE_ENV ?? "development",
        appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000",
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
