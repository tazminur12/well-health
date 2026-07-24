import { NextResponse } from "next/server";

import { syncOpenSteadfastConsignments } from "@/lib/steadfast/sync-worker";

/**
 * Periodic Steadfast status sync — marks Delivered + Paid when courier completes.
 * Auth: Authorization Bearer CRON_SECRET
 * Schedule via Vercel cron every 30 minutes on /api/cron/steadfast-sync
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization")?.trim() ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncOpenSteadfastConsignments();

  return NextResponse.json({
    ok: true,
    ...result,
    at: new Date().toISOString(),
  });
}
