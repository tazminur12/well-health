import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function parseDatabaseUrl(url: string | undefined) {
  if (!url?.trim()) {
    return { configured: false as const };
  }

  try {
    const parsed = new URL(url);
    return {
      configured: true as const,
      host: parsed.hostname,
      port: parsed.port || "5432",
      user: parsed.username,
      passwordLength: parsed.password.length,
      hasPercentEncoding: /%[0-9A-Fa-f]{2}/.test(url),
      hasPgbouncer: url.includes("pgbouncer=true"),
      urlLength: url.length,
    };
  } catch {
    return {
      configured: true as const,
      parseError: true as const,
      urlLength: url.length,
      hasPercentEncoding: /%[0-9A-Fa-f]{2}/.test(url),
    };
  }
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get("authorization")?.trim() ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return token === secret;
}

/** Masked env diagnostics for production debugging. Auth: Bearer CRON_SECRET */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const probe = new URL(request.url).searchParams.get("probe") === "1";
  const database = parseDatabaseUrl(process.env.DATABASE_URL);
  const direct = parseDatabaseUrl(process.env.DIRECT_URL);

  const payload: Record<string, unknown> = {
    checkedAt: new Date().toISOString(),
    database,
    direct,
    flags: {
      expectedPoolerHost: "aws-1-ap-south-1.pooler.supabase.com",
      expectedDirectHost: "db.rexaykwyznzwsbfsykpg.supabase.co",
      expectedPasswordLength: 20,
      nextPublicSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
      supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()),
      serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    },
  };

  if (probe) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      payload.databaseProbe = { ok: true };
    } catch (error) {
      payload.databaseProbe = {
        ok: false,
        message: error instanceof Error ? error.message : "Database probe failed",
      };
    }
  }

  return NextResponse.json(payload);
}
