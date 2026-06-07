import { NextResponse } from "next/server";
import {
  ROWS, SUMMARY, TYPE_STATS, BY_DOW, BY_MONTH,
  BY_YEAR, BY_YM, DISTRIBUTION, ROLLING_VOL, PRE_POST_WIDE,
  STREAKS, TOP_EVENT_DAYS, SPREAD_BY_TYPE,
} from "../../data";

// Public read-only data endpoint. Returns the full dataset as JSON so the
// dashboard (or external consumers) can fetch a single payload instead of
// importing the 200 KB data module client-side.
//
// Cached at the edge for 1 hour; revalidated on demand via /api/refresh.
export const runtime = "edge";
export const revalidate = 3600;

export async function GET() {
  return NextResponse.json(
    {
      generated_at: new Date().toISOString(),
      rows: ROWS,
      summary: SUMMARY,
      type_stats: TYPE_STATS,
      by_dow: BY_DOW,
      by_month: BY_MONTH,
      by_year: BY_YEAR,
      by_ym: BY_YM,
      distribution: DISTRIBUTION,
      rolling_vol: ROLLING_VOL,
      pre_post_wide: PRE_POST_WIDE,
      streaks: STREAKS,
      top_event_days: TOP_EVENT_DAYS,
      spread_by_type: SPREAD_BY_TYPE,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
