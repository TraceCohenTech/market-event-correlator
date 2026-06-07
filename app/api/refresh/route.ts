import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Webhook target for refreshing the dashboard data.
//
// In production, this endpoint should be called by:
//   1. A scheduled GitHub Action (cron) that fetches the latest market data
//      from Yahoo Finance, regenerates app/data.ts, commits, and pushes.
//      Vercel then auto-deploys the new bundle.
//   2. A Vercel Cron Job pointing at this path — it triggers a revalidation
//      of the cached /api/data response and the root page.
//   3. Manual call: `curl -X POST -H "x-refresh-token: $TOKEN" ...`
//
// The handler validates a shared secret (REFRESH_TOKEN env var) and then
// purges the ISR cache for the dataset endpoint and the home page.
//
// To actually rewrite app/data.ts, the GitHub Action approach is required —
// Vercel's runtime filesystem is read-only. This route handles the cache
// invalidation half of the refresh cycle.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Accept either a custom header, query param, or Vercel Cron's
  // Authorization: Bearer <CRON_SECRET> pattern.
  const expected = process.env.REFRESH_TOKEN ?? process.env.CRON_SECRET;
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const provided =
    bearer ||
    req.headers.get("x-refresh-token") ||
    new URL(req.url).searchParams.get("token") ||
    "";

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "REFRESH_TOKEN (or CRON_SECRET) env var not configured on the server" },
      { status: 500 },
    );
  }
  if (provided !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  revalidatePath("/");
  revalidatePath("/api/data");

  return NextResponse.json({
    ok: true,
    revalidated: ["/", "/api/data"],
    at: new Date().toISOString(),
  });
}

// GET is allowed too so Vercel Cron (which always sends GET) can call it.
export async function GET(req: NextRequest) {
  return POST(req);
}
