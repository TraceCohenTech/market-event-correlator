"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, ComposedChart, Area, AreaChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Legend,
} from "recharts";
import {
  ROWS, SUMMARY, TYPE_STATS, CUM_THIN, BY_DOW, BY_MONTH,
  BY_YEAR, BY_YM, DISTRIBUTION, ROLLING_VOL, PRE_POST_WIDE,
  STREAKS, TOP_EVENT_DAYS, SPREAD_BY_TYPE, CALENDAR,
} from "./data";
import type {
  Row, CumPoint, TypeStat, DowStat, MonthStat, YearStat, YearMonthStat,
  DistBin, RollingVolPoint, PrePostPoint, Streaks, TopEventDay,
  SpreadByType, CalendarMonth, Summary, EventType,
} from "./types";

// ── DESIGN TOKENS ─────────────────────────────────────────────
const C = {
  blue:   "#0071e3",
  green:  "#34c759",
  red:    "#ff3b30",
  orange: "#ff9500",
  cyan:   "#5ac8fa",
  yellow: "#ffd60a",
  text:   "#1d1d1f",
  dim:    "#6e6e73",
  faint:  "#aeaeb2",
  bg:     "#f5f5f7",
  card:   "#ffffff",
  border: "rgba(0,0,0,0.08)",
};

// High-contrast palette used by the Event Anatomy lines and other multi-series
// overlays. No purple — uses teal in place of any violet hue.
const ANATOMY_PALETTE = [
  "#00d4ff", // cyan
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#f97316", // orange
  "#06b6d4", // teal
  "#10b981", // emerald
];

const TYPE_META: Record<EventType, { color: string; label: string; short: string }> = {
  "Fed":            { color: C.blue,    label: "Fed",          short: "FED" },
  "Macro":          { color: C.orange,  label: "Macro",        short: "MCR" },
  "Political":      { color: "#ff6b35", label: "Political",    short: "POL" },
  "Earnings":       { color: C.cyan,    label: "Earnings",     short: "EPS" },
  "AI":             { color: "#5856d6", label: "AI",           short: "AI·" },
  "IPO":            { color: C.green,   label: "IPO",          short: "IPO" },
  "Banking Crisis": { color: "#ff2d55", label: "Banking",      short: "BNK" },
  "Geopolitical":   { color: "#8e8e93", label: "Geopolitical", short: "GEO" },
};

// Derive ticker items from SUMMARY so they never go stale when data refreshes.
const S = SUMMARY as Summary;
const VOL_RATIO = (S.vol_event / S.vol_non_event).toFixed(2);
const TICKER_ITEMS = [
  `${S.total_days} Trading Days · Jan 2023 – Latest Session`,
  `${S.event_days} Annotated Events Across 8 Categories`,
  `Event-Day Volatility ${VOL_RATIO}× Normal Sessions`,
  `Best Day: QQQ +${S.best.qqq.toFixed(1)}% · ${S.best.date} — ${S.best.en ?? ""}`.trim(),
  `Worst Day: QQQ ${S.worst.qqq.toFixed(1)}% · ${S.worst.date} — ${S.worst.en ?? ""}`.trim(),
  "AI Events: 89% Win Rate · Avg +0.46%",
  "Fed Days: Perfect Coin Flip · 7 Up / 7 Down",
  "Monday is the Best Trading Day · +0.23% Avg",
  "Thursday is the Worst · −0.17% Avg",
  "Tech Underperforms on Macro Data Days (QQQ −SPY)",
];

// ── HELPERS ───────────────────────────────────────────────────
function pctColor(p: number) {
  if (p >=  3) return C.green;
  if (p >=  0) return "#34a853";
  if (p >= -3) return C.red;
  return "#c0392b";
}
function fmtPct(v: number, decimals = 3) {
  return (v >= 0 ? "+" : "") + v.toFixed(decimals) + "%";
}
function fmtDate(iso: string) {
  const p = iso.split("-");
  if (p.length === 3) return `${p[1]}/${p[2]}/${p[0]}`;
  if (p.length === 2) return `${p[1]}/${p[0].slice(2)}`;
  return iso;
}
function Card({ children, accent, style }: { children: React.ReactNode; accent?: string; style?: React.CSSProperties }) {
  return (
    <div className="card-lift" style={{
      background: C.card, borderRadius: 16,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
      borderTop: `2px solid ${accent ?? C.blue}`,
      ...style,
    }}>{children}</div>
  );
}
function CardHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: C.dim, marginTop: 3, lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}
function StatChip({ label, val, sub, accent }: { label: string; val: string | number; sub?: string; accent?: string }) {
  return (
    <div className="card-lift" style={{
      background: C.card, borderRadius: 14,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
      padding: "16px 18px", borderTop: `2px solid ${accent ?? C.blue}`,
    }}>
      <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
      <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: accent ?? C.text, lineHeight: 1.1, marginBottom: 4 }}>{val}</div>
      {sub && <div style={{ fontSize: 11, color: C.dim }}>{sub}</div>}
    </div>
  );
}
function PctPill({ val }: { val: number | null }) {
  if (val == null) return <span style={{ color: C.faint, fontFamily: "inherit" }}>—</span>;
  const color = pctColor(val);
  return (
    <span className="mono" style={{
      fontWeight: 700, color, fontSize: 12,
      background: color + "12", border: `1px solid ${color}28`,
      borderRadius: 6, padding: "2px 7px",
    }}>{fmtPct(val)}</span>
  );
}
const WM_STYLE: React.CSSProperties = {
  position: "absolute", top: 8, right: 10, zIndex: 10,
  fontSize: 10, pointerEvents: "none", userSelect: "none",
  color: "rgba(0,0,0,0.13)", letterSpacing: "0.03em",
  fontFamily: "'SF Mono','Fira Code','Cascadia Code',monospace",
};
function ChartWrap({ children, height }: { children: React.ReactElement; height: number }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={WM_STYLE}>@Trace_Cohen · t@nyvp.com</div>
      <ResponsiveContainer width="100%" height={height}>{children}</ResponsiveContainer>
    </div>
  );
}
function SectionLabel({ num, title }: { num: string; title: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
      <span className="mono" style={{ fontSize:11, fontWeight:800, color:C.blue, letterSpacing:"0.12em", opacity:0.7 }}>{num}</span>
      <span style={{ fontWeight:800, fontSize:21, color:C.text, letterSpacing:"-0.02em" }}>{title}</span>
      <div style={{ flex:1, height:1, background:"rgba(0,0,0,0.08)" }} />
    </div>
  );
}
const CHART_TOOLTIP = {
  contentStyle: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(14px) saturate(1.6)",
    WebkitBackdropFilter: "blur(14px) saturate(1.6)",
    border: "1px solid rgba(255,255,255,0.35)",
    borderRadius: 12,
    fontSize: 12,
    boxShadow: "0 4px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.65)",
  },
};

const UNEXPLAINED_DRIVERS: Record<string, string> = {
  "2023-08-24": "Pre-Jackson Hole anxiety — Powell speech scheduled Aug 25; traders de-risked the day before",
  "2024-04-15": "Iran-Israel escalation follow-through — Iran's drone attack on Israel (Apr 13) triggered 2-day risk-off",
  "2024-04-04": "Rate shock — services PMI beat pushed 10-yr yield above 4.4%, rotating capital out of tech",
  "2024-09-03": "Post-Labor Day return — markets reopened to weak ISM manufacturing data and global risk-off selling",
  "2023-02-09": "Post-Powell follow-through — 'higher for longer' message from Feb 7 Economic Club speech continued pressure",
  "2026-02-12": "Broad tech valuation re-rating — sector-wide de-rating amid macro uncertainty and elevated growth multiples",
  "2025-02-21": "DOGE/tariff crossfire — Trump policy uncertainty and AI valuation concerns still reverberating post-DeepSeek",
  "2023-05-26": "NVIDIA AI halo day 2 — follow-through from Nvidia's historic AI earnings guidance beat on May 25",
  "2023-08-29": "Post-Jackson Hole relief rally — recovery from Aug 25 sell-off; Nvidia Aug 23 earnings provided tailwind",
  "2025-03-10": "Tariff escalation spillover — steel/aluminum tariffs effective Mar 4 drove continued sector rotation",
  "2024-07-24": "Alphabet earnings miss — GOOGL Q2 YouTube revenue miss hit mega-cap sentiment week after CrowdStrike",
  "2025-04-11": "Tariff pause momentum — day-2 follow-through rally after Trump's historic +12% session on Apr 9",
  "2023-01-20": "January 2023 tech momentum — Fed pivot expectations drove one of the strongest January rallies in QQQ history",
  "2023-02-07": "Powell 'disinflation' speech — said 'disinflationary process has started' at Economic Club, sparking tech surge",
  "2023-01-06": "Soft NFP rally — Dec 2022 payrolls at +223K below estimates, reducing probability of 50bp hike",
};

const SECTIONS = ["Overview", "Time Patterns", "Event Intel", "Trends", "Timeline"] as const;

// ── ANIMATION: scroll-triggered reveal ─────────────────────────
function useInView<T extends HTMLElement>(): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function AnimatedSection({
  id, children, style,
}: { id: string; children: React.ReactNode; style?: React.CSSProperties }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div
      id={id}
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 500ms ease, transform 500ms ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── COMPONENT ─────────────────────────────────────────────────
export default function MarketEventDashboard() {
  const [yearFilter, setYearFilter]   = useState("ALL");
  const [evTypeFilter, setEvTypeFilter] = useState("ALL");
  const [evOnly, setEvOnly]           = useState(false);
  const [extremeOnly, setExtremeOnly] = useState(false);
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(0);
  const PAGE = 25;

  // ── Entrance animation: hero KPI cards slide-up + fade ───────
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  const rows = ROWS as readonly Row[];
  const s = SUMMARY as Summary;
  const streaks = STREAKS as Streaks;

  // Typed aliases — one cast each, used everywhere below.
  const typeStats     = TYPE_STATS     as readonly TypeStat[];
  const cumThin       = CUM_THIN       as readonly CumPoint[];
  const byDow         = BY_DOW         as readonly DowStat[];
  const byMonth       = BY_MONTH       as readonly MonthStat[];
  const byYear        = BY_YEAR        as readonly YearStat[];
  const byYm          = BY_YM          as readonly YearMonthStat[];
  const distribution  = DISTRIBUTION   as readonly DistBin[];
  const rollingVol    = ROLLING_VOL    as readonly RollingVolPoint[];
  const prePostWide   = PRE_POST_WIDE  as readonly PrePostPoint[];
  const topEventDays  = TOP_EVENT_DAYS as readonly TopEventDay[];
  const spreadByType  = SPREAD_BY_TYPE as readonly SpreadByType[];
  const calendar      = CALENDAR       as readonly CalendarMonth[];

  // ── Derived analytics (computed once from rows) ─────────────
  // Drawdown: peak-to-trough on the cumulative open→close curve.
  // Volatility clustering: identifies consecutive |return| ≥ 1% sessions.
  const { drawdown, maxDD, clusters, longestCluster, dailyAutocorr } = useMemo(() => {
    let cum = 0;
    let peak = 0;
    let maxDD = 0;
    let maxDDDate = "";
    const dd: Array<{ date: string; cum: number; dd: number }> = [];

    for (const r of rows) {
      cum += r.qqq;
      if (cum > peak) peak = cum;
      const drawPct = cum - peak; // negative or zero
      dd.push({ date: r.date, cum, dd: drawPct });
      if (drawPct < maxDD) {
        maxDD = drawPct;
        maxDDDate = r.date;
      }
    }

    // Thin the drawdown series for charting (every ~5th day, plus extreme points).
    const ddThin = dd.filter((d, i) => i % 5 === 0 || d.dd === maxDD || i === dd.length - 1);

    // Volatility clustering — consecutive |r| ≥ 1% sessions.
    const clusters: Array<{ start: string; end: string; len: number; sumAbs: number }> = [];
    let cs: { start: string; end: string; len: number; sumAbs: number } | null = null;
    for (const r of rows) {
      if (Math.abs(r.qqq) >= 1) {
        if (!cs) cs = { start: r.date, end: r.date, len: 1, sumAbs: Math.abs(r.qqq) };
        else { cs.end = r.date; cs.len += 1; cs.sumAbs += Math.abs(r.qqq); }
      } else if (cs) {
        if (cs.len >= 3) clusters.push(cs);
        cs = null;
      }
    }
    if (cs && cs.len >= 3) clusters.push(cs);
    clusters.sort((a, b) => b.len - a.len);
    const longestCluster = clusters[0];

    // Lag-1 autocorrelation of daily QQQ returns — does yesterday predict today?
    const r = rows.map(x => x.qqq);
    const mean = r.reduce((a, b) => a + b, 0) / r.length;
    let num = 0, den = 0;
    for (let i = 0; i < r.length; i++) {
      const dev = r[i] - mean;
      den += dev * dev;
      if (i > 0) num += dev * (r[i - 1] - mean);
    }
    const dailyAutocorr = den === 0 ? 0 : num / den;

    return { drawdown: ddThin, maxDD: { val: maxDD, date: maxDDDate }, clusters, longestCluster, dailyAutocorr };
  }, [rows]);

  // ── Timeline filtered rows ────────────────────────────────
  const filtered = useMemo(() => {
    let r = [...rows];
    if (yearFilter !== "ALL") r = r.filter(x => x.date.startsWith(yearFilter));
    if (evOnly) r = r.filter(x => !!x.et);
    if (extremeOnly) r = r.filter(x => Math.abs(x.qqq) >= 2);
    if (evTypeFilter !== "ALL") r = r.filter(x => x.et === evTypeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(x => x.date.includes(q) || (x.en ?? "").toLowerCase().includes(q) || (x.et ?? "").toLowerCase().includes(q));
    }
    return [...r].reverse();
  }, [rows, yearFilter, evOnly, extremeOnly, evTypeFilter, search]);

  const paginated  = filtered.slice(page * PAGE, (page + 1) * PAGE);
  const totalPages = Math.ceil(filtered.length / PAGE);

  // ── PRE/POST chart: show only 4 types ────────────────────
  const prePostTypes: EventType[] = ["AI", "Political", "Fed", "Macro"];

  // ── Event Anatomy state ───────────────────────────────────
  const ANATOMY_PRE = 5;
  const ANATOMY_POST = 20;
  const ALL_EVENT_TYPES: EventType[] = useMemo(() => {
    const seen = new Set<EventType>();
    for (const r of rows) if (r.et) seen.add(r.et);
    return Array.from(seen);
  }, [rows]);
  const [anatomyTypes, setAnatomyTypes] = useState<EventType[]>(["AI", "Political", "Fed", "Macro"]);

  // Composite D-5..D+20 path for each selected event type.
  const anatomyData = useMemo(() => {
    // Build offset → { offset, [type]: avg } record.
    const offsets: number[] = [];
    for (let i = -ANATOMY_PRE; i <= ANATOMY_POST; i++) offsets.push(i);
    type Row2 = { offset: number; label: string } & Partial<Record<EventType, number>>;
    const out: Row2[] = offsets.map(o => ({ offset: o, label: o === 0 ? "D+0" : (o > 0 ? `D+${o}` : `D${o}`) }));

    for (const type of anatomyTypes) {
      // For each event of this type, build a cum return path indexed by offset.
      const paths: number[][] = []; // paths[i][offsetIdx] = cum return from D-5
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].et !== type) continue;
        // Need window from i-5 to i+20 all inside rows.
        if (i - ANATOMY_PRE < 0 || i + ANATOMY_POST >= rows.length) continue;
        const path: number[] = [];
        let cum = 0;
        // D-5 baseline starts at 0 (we measure cumulative return FROM D-5).
        for (let k = -ANATOMY_PRE; k <= ANATOMY_POST; k++) {
          const idx = i + k;
          // Skip the D-5 day's return so D-5 starts at exactly 0; accumulate the
          // return earned moving from the previous session into this one.
          if (k > -ANATOMY_PRE) cum += rows[idx].qqq;
          path.push(cum);
        }
        paths.push(path);
      }
      if (paths.length === 0) continue;
      for (let oi = 0; oi < offsets.length; oi++) {
        let sum = 0;
        for (const p of paths) sum += p[oi];
        out[oi][type] = sum / paths.length;
      }
    }
    return out;
  }, [rows, anatomyTypes]);

  // ── Outcome Simulator state ───────────────────────────────
  const [simType, setSimType] = useState<EventType>("AI");
  const [simWindow, setSimWindow] = useState<number>(5);

  const simResults = useMemo(() => {
    // For every event of simType, compute cumulative QQQ return over next simWindow sessions.
    const outcomes: Array<{ date: string; en: string | undefined; ret: number }> = [];
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].et !== simType) continue;
      if (i + simWindow >= rows.length) continue;
      let cum = 0;
      for (let k = 1; k <= simWindow; k++) cum += rows[i + k].qqq;
      outcomes.push({ date: rows[i].date, en: rows[i].en, ret: cum });
    }
    if (outcomes.length === 0) {
      return { outcomes, bins: [], mean: 0, median: 0, best: 0, worst: 0, pctPos: 0, n: 0 };
    }
    const vals = outcomes.map(o => o.ret).sort((a, b) => a - b);
    const median = vals.length % 2 === 1 ? vals[(vals.length - 1) / 2] : (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2;
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const best = vals[vals.length - 1];
    const worst = vals[0];
    const pctPos = (outcomes.filter(o => o.ret > 0).length / outcomes.length) * 100;
    // Bin into 1% buckets, anchored to integers, range from floor(worst) to ceil(best).
    const lo = Math.floor(worst);
    const hi = Math.ceil(best);
    const buckets: Array<{ range: string; mid: number; count: number }> = [];
    for (let b = lo; b < Math.max(lo + 1, hi); b++) {
      buckets.push({ range: `${b >= 0 ? "+" : ""}${b}%`, mid: b + 0.5, count: 0 });
    }
    for (const v of vals) {
      const idx = Math.min(buckets.length - 1, Math.max(0, Math.floor(v) - lo));
      buckets[idx].count += 1;
    }
    return { outcomes, bins: buckets, mean, median, best, worst, pctPos, n: outcomes.length };
  }, [rows, simType, simWindow]);

  // ── Return Heatmap (GitHub-style, per year) ───────────────
  const heatmapByYear = useMemo(() => {
    // Map date -> row for fast lookup.
    const byDate = new Map<string, Row>();
    for (const r of rows) byDate.set(r.date, r);

    const years = Array.from(new Set(rows.map(r => r.date.slice(0, 4)))).sort();

    type Cell = { date: string; row: Row | null; col: number; dow: number };
    type YearGrid = { year: string; cells: Cell[]; weeks: number; monthLabels: Array<{ col: number; m: string }> };
    const out: YearGrid[] = [];

    const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (const year of years) {
      const cells: Cell[] = [];
      const monthLabels: Array<{ col: number; m: string }> = [];
      const start = new Date(`${year}-01-01T00:00:00Z`);
      const end = new Date(`${year}-12-31T00:00:00Z`);
      // Walk every calendar day; only render Mon-Fri.
      // Column = ISO week index starting from week 0 of the year.
      const firstDay = new Date(start);
      const firstDow = (firstDay.getUTCDay() + 6) % 7; // Mon=0..Sun=6
      // Week 0 begins on the Monday of the week containing Jan 1.
      const weekStart = new Date(firstDay);
      weekStart.setUTCDate(firstDay.getUTCDate() - firstDow);

      let col = 0;
      let lastMonth = -1;
      const cur = new Date(weekStart);
      while (cur.getUTCFullYear() <= Number(year) && cur <= end) {
        // For each weekday Mon..Fri:
        for (let d = 0; d < 5; d++) {
          const day = new Date(cur);
          day.setUTCDate(cur.getUTCDate() + d);
          if (day.getUTCFullYear() !== Number(year)) {
            // Out of the year boundary; still consume the cell slot to keep grid aligned.
            cells.push({ date: "", row: null, col, dow: d });
            continue;
          }
          const iso = day.toISOString().slice(0, 10);
          const row = byDate.get(iso) ?? null;
          cells.push({ date: iso, row, col, dow: d });
          const m = day.getUTCMonth();
          if (m !== lastMonth && d === 0) {
            monthLabels.push({ col, m: monthsShort[m] });
            lastMonth = m;
          }
        }
        cur.setUTCDate(cur.getUTCDate() + 7);
        col += 1;
      }
      out.push({ year, cells, weeks: col, monthLabels });
    }
    return out;
  }, [rows]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" }}>

      {/* ════ HERO ════ */}
      <header style={{ position: "relative", background: "#000", overflow: "hidden" }}>
        <div className="orb orb-1" aria-hidden="true" />
        <div className="orb orb-2" aria-hidden="true" />
        <div className="orb orb-3" aria-hidden="true" />

        {/* Ticker */}
        <div className="ticker-wrap" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 0", position: "relative", zIndex: 2 }}>
          <div className="ticker-inner">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 28, padding: "0 32px", color: "#8e8e93", fontSize: 12 }}>
                <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: C.blue, display: "inline-block" }} />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Hero body */}
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "64px 32px 72px", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,113,227,0.12)", border: "1px solid rgba(0,113,227,0.35)", borderRadius: 20, padding: "5px 16px", marginBottom: 24 }}>
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: C.blue }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: C.blue, letterSpacing: "0.02em" }}>VALUEADD VC · MARKET INTELLIGENCE</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px,5vw,58px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.03em", color: "#f5f5f7", marginBottom: 18, maxWidth: 780 }}>
            <span className="shimmer-text">Market Event</span> Correlator
          </h1>
          <p style={{ fontSize: 17, color: "#8e8e93", lineHeight: 1.7, maxWidth: 620, marginBottom: 40 }}>
            {s.total_days} trading days of QQQ, SPY & NDX open→close returns annotated with{" "}
            <span style={{ color: "#e5e5ea" }}>{s.event_days} major market events</span> — Fed decisions, tariff shocks, AI launches, IPOs, earnings, and more. Every correlation, pattern, and causal signal in one place.
          </p>

          {/* KPI hero cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 12, maxWidth: 780 }}>
            {[
              { badge:"DATASET",   label:"Trading Days",        val:String(s.total_days),    sub:"Jan 2023 – Latest Session",             accent: C.blue   },
              { badge:"INSIGHT",   label:"Event-Day Volatility", val:`${(s.vol_event/s.vol_non_event).toFixed(2)}×`,  sub:`vs normal days (σ ${s.vol_event.toFixed(2)}% vs ${s.vol_non_event.toFixed(2)}%)`, accent: C.green  },
              { badge:"RECORD",    label:"Best Single Day",      val:`+${s.best.qqq.toFixed(1)}%`, sub:`${fmtDate(s.best.date)} — ${s.best.en?.slice(0,30) ?? ""}`, accent: C.cyan   },
              { badge:"EDGE",      label:"Monday vs Thursday",   val:"+0.40%", sub:"best vs worst day of week spread", accent: C.orange },
            ].map((k, idx) => (
              <div key={k.label} style={{
                position: "relative",
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(20px) saturate(1.8)",
                WebkitBackdropFilter: "blur(20px) saturate(1.8)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderTop: `2px solid ${k.accent}`,
                borderRadius: 14,
                padding: "16px 18px",
                boxShadow: `0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 0.5px rgba(255,255,255,0.06)`,
                overflow: "hidden",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 520ms cubic-bezier(0.22,1,0.36,1) ${idx * 100}ms, transform 520ms cubic-bezier(0.22,1,0.36,1) ${idx * 100}ms, box-shadow 0.2s ease`,
                willChange: "opacity, transform",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 0.5px rgba(255,255,255,0.10)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = mounted ? "translateY(0)" : "translateY(20px)"; e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 0.5px rgba(255,255,255,0.06)`; }}
              >
                {/* specular highlight */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:40, background:"linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)", borderRadius:"14px 14px 0 0", pointerEvents:"none" }} />
                <span style={{ fontSize:9, fontWeight:800, color:k.accent, letterSpacing:"0.1em", background:k.accent+"25", border:`1px solid ${k.accent}40`, borderRadius:4, padding:"2px 6px", display:"inline-block", marginBottom:10 }}>{k.badge}</span>
                <div className="mono" style={{ fontSize:28, fontWeight:800, color:"#f5f5f7", lineHeight:1, marginBottom:6 }}>{k.val}</div>
                <div style={{ fontSize:11, color:"#8e8e93", fontWeight:600, marginBottom:3 }}>{k.label}</div>
                <div style={{ fontSize:11, color:"#6e6e73" }}>{k.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ════ STICKY NAV ════ */}
      <nav className="nav-glass" aria-label="Dashboard sections" style={{ position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:1140, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", gap:4, height:52, overflowX:"auto" }}>
          {SECTIONS.map(sec => (
            <button
              key={sec}
              type="button"
              aria-label={`Jump to ${sec} section`}
              onClick={() => document.getElementById(`section-${sec.toLowerCase().replace(" ","-")}`)?.scrollIntoView({behavior:"smooth",block:"start"})}
              style={{
                color: "#8e8e93",
                background: "transparent",
                border:"none", padding:"5px 14px", borderRadius:20, fontSize:12,
                fontWeight:600, letterSpacing:"0.02em", cursor:"pointer",
                fontFamily:"inherit", whiteSpace:"nowrap", transition:"all 0.15s",
              }}
              onMouseEnter={e=>(e.currentTarget.style.color="#f5f5f7")}
              onMouseLeave={e=>(e.currentTarget.style.color="#8e8e93")}
            >{sec}</button>
          ))}
          <div style={{ flex:1 }} />
          <span style={{ fontSize:11, color:"#6e6e73", whiteSpace:"nowrap" }}>QQQ · SPY · NDX · 2023–{(rows.at(-1)?.date ?? "2026").slice(0,4)}</span>
        </div>
      </nav>

      {/* ════ MAIN CONTENT ════ */}
      <div id="dash-content" style={{ maxWidth:1140, margin:"0 auto", padding:"32px 24px 100px", display:"flex", flexDirection:"column", gap:60 }}>

        {/* ── Persistent stat row ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12 }}>
          <StatChip label="Total Days"      val={s.total_days}                           accent={C.blue}   sub="Jan 2023 – Jun 2026" />
          <StatChip label="Event Days"      val={s.event_days}                           accent={C.blue}   sub={`${((s.event_days/s.total_days)*100).toFixed(1)}% of sessions`} />
          <StatChip label="Avg Return/Day"  val={fmtPct(s.avg_all,3)}                    accent={s.avg_all>=0?C.green:C.red} />
          <StatChip label="Event-Day Vol"   val={s.vol_event.toFixed(2)+"%"}             accent={C.orange} sub="annualized σ" />
          <StatChip label="Normal-Day Vol"  val={s.vol_non_event.toFixed(2)+"%"}         accent={C.cyan}   sub={`${(100-((s.event_days/s.total_days)*100)).toFixed(1)}% of all sessions`} />
          <StatChip label="Best Day (QQQ)"  val={"+"+s.best.qqq.toFixed(2)+"%"}          accent={C.green}  sub={fmtDate(s.best.date)} />
          <StatChip label="Worst Day (QQQ)" val={s.worst.qqq.toFixed(2)+"%"}             accent={C.red}    sub={fmtDate(s.worst.date)} />
        </div>

        {/* ════════════════════════════════════
            SECTION: OVERVIEW
        ════════════════════════════════════ */}
        <AnimatedSection id="section-overview">
          <SectionLabel num="01" title="Overview" />

            {/* Cumulative Return */}
            <Card accent={C.blue} style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Cumulative Open→Close Return: QQQ vs SPY</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20, lineHeight:1.5 }}>
                Sum of daily open-to-close returns since Jan 2, 2023. Not total return (excludes overnight gaps & dividends) — measures pure intraday directional alpha. QQQ has accumulated <span style={{ color:C.blue, fontWeight:700 }}>{fmtPct(cumThin.at(-1)?.qqq ?? 0, 1)}</span> of intraday gains vs SPY&apos;s <span style={{ color:C.orange, fontWeight:700 }}>{fmtPct(cumThin.at(-1)?.spy ?? 0, 1)}</span>.
              </div>
              <ChartWrap height={280}>
                <LineChart data={[...cumThin]} margin={{ top:4, right:8, bottom:4, left:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" tick={{ fill:C.dim, fontSize:10 }} tickFormatter={v => v.slice(2,7).replace("-","'")} interval={29} />
                  <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v => fmtPct(v,0)} />
                  <Tooltip {...CHART_TOOLTIP} labelFormatter={v => `Date: ${v}`}
                    formatter={(v:unknown, name:unknown) => [fmtPct(v as number, 2), name === "qqq" ? "QQQ" : "SPY"]} />
                  <ReferenceLine y={0} stroke={C.dim} strokeWidth={1} />
                  <Line type="monotone" dataKey="qqq" stroke={C.blue}   strokeWidth={2.5} dot={false} name="QQQ" />
                  <Line type="monotone" dataKey="spy" stroke={C.orange} strokeWidth={2}   dot={false} name="SPY" strokeDasharray="5 3" />
                  <Legend formatter={(v) => v === "qqq" ? "QQQ (Nasdaq-100)" : "SPY (S&P 500)"} />
                </LineChart>
              </ChartWrap>
            </Card>

            {/* NEW: Drawdown Curve — running underwater chart */}
            <Card accent={C.red} style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>QQQ Open→Close Drawdown Curve</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20, lineHeight:1.5 }}>
                Distance from the rolling all-time-high on the cumulative open→close curve. Stays at 0 during new highs, slides negative during corrections. Deepest underwater: <span style={{ color:C.red, fontWeight:700 }}>{fmtPct(maxDD.val, 1)}</span> on <span className="mono" style={{ color:C.text, fontWeight:700 }}>{fmtDate(maxDD.date)}</span> — the bottom of the April 2025 tariff shock sequence.
              </div>
              <ChartWrap height={220}>
                <AreaChart data={drawdown} margin={{ top:4, right:8, bottom:4, left:8 }}>
                  <defs>
                    <linearGradient id="ddFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.red} stopOpacity={0.05} />
                      <stop offset="100%" stopColor={C.red} stopOpacity={0.45} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" tick={{ fill:C.dim, fontSize:10 }} tickFormatter={v => v.slice(2,7).replace("-","'")} interval={29} />
                  <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v => fmtPct(v,0)} />
                  <Tooltip {...CHART_TOOLTIP} labelFormatter={v=>`Date: ${v}`}
                    formatter={(v:unknown) => [fmtPct(v as number, 2), "Drawdown from peak"]} />
                  <ReferenceLine y={0} stroke={C.dim} strokeWidth={1} />
                  <Area type="monotone" dataKey="dd" stroke={C.red} strokeWidth={2} fill="url(#ddFill)" />
                </AreaChart>
              </ChartWrap>
            </Card>

            {/* Distribution + Streaks */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }} className="two-col">

              {/* Distribution histogram */}
              <Card accent={C.cyan} style={{ padding:24 }}>
                <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Daily Return Distribution</div>
                <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>Histogram of QQQ open→close returns across all 857 sessions. The market is modestly positively skewed — more large-up days than large-down days, but the fat left tail hits harder.</div>
                <ChartWrap height={220}>
                  <BarChart data={[...distribution]} margin={{ top:4, right:8, bottom:4, left:8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="range" tick={{ fill:C.dim, fontSize:10 }} />
                    <YAxis tick={{ fill:C.dim, fontSize:11 }} label={{ value:"Days", angle:-90, position:"insideLeft", fill:C.dim, fontSize:11 }} />
                    <Tooltip {...CHART_TOOLTIP} formatter={(v:unknown) => [v as number, "Trading Days"]} />
                    <Bar dataKey="count" radius={[4,4,0,0]}>
                      {distribution.map(b => (
                        <Cell key={b.range} fill={b.range.startsWith(">") || b.range.startsWith("0") || b.range.startsWith("1") || b.range.startsWith("2") || b.range.startsWith("3") ? C.green : C.red} fillOpacity={0.82} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartWrap>
              </Card>

              {/* Streak records + year comparison */}
              <Card accent={C.green} style={{ overflow:"hidden" }}>
                <CardHeader title="Records & Milestones" sub="Notable streaks, extremes, and structural stats from 857 sessions" />
                <div style={{ padding:"0 0 4px" }}>
                  {[
                    { label:"Longest Win Streak",  val:`${streaks.up.len} days`,     sub:`${fmtDate(streaks.up.start)} → ${fmtDate(streaks.up.end)}`,   color:C.green  },
                    { label:"Longest Loss Streak", val:`${streaks.down.len} days`,   sub:`${fmtDate(streaks.down.start)} → ${fmtDate(streaks.down.end)}`, color:C.red   },
                    { label:"Best Day Ever",        val:fmtPct(s.best.qqq,2),        sub:`${fmtDate(s.best.date)} · Trump tariff pause`,         color:C.green  },
                    { label:"Worst Day Ever",       val:fmtPct(s.worst.qqq,2),       sub:`${fmtDate(s.worst.date)} · China 104% tariff`,         color:C.red    },
                    { label:"Event-Day Volatility", val:`${s.vol_event.toFixed(2)}%`, sub:"vs 0.84% on non-event days (2.55× higher)",  color:C.orange },
                    { label:"Big Move Days (±2%+)", val:`${s.big_moves} days`,       sub:`${((s.big_moves/s.total_days)*100).toFixed(1)}% of all sessions`, color:C.orange },
                  ].map((r,i,arr) => (
                    <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 24px", borderBottom: i<arr.length-1 ? "1px solid rgba(0,0,0,0.05)":"none" }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{r.label}</div>
                        <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{r.sub}</div>
                      </div>
                      <div className="mono" style={{ fontWeight:800, fontSize:15, color:r.color, textAlign:"right", flexShrink:0, marginLeft:12 }}>{r.val}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Year comparison */}
            <Card accent={C.orange} style={{ overflow:"hidden" }}>
              <CardHeader title="Year-by-Year Performance" sub="Average daily return, volatility, win rate, and extremes by calendar year" />
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.08)" }}>
                      {["Year","Days","Avg Daily","Volatility","Win Rate","Best Day","Worst Day"].map(h=>(
                        <th key={h} scope="col" style={{ padding:"10px 20px", textAlign:"left", color:C.dim, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {byYear.map((y,i) => (
                      <tr key={y.year} className="tr-hover" style={{ borderBottom:"1px solid rgba(0,0,0,0.04)", background: i%2===0?"transparent":"rgba(0,0,0,0.01)" }}>
                        <td style={{ padding:"11px 20px", fontWeight:800, fontSize:14 }}>{y.year}</td>
                        <td className="mono" style={{ padding:"11px 20px", color:C.dim }}>{y.count}</td>
                        <td style={{ padding:"11px 20px" }}><PctPill val={y.avg} /></td>
                        <td className="mono" style={{ padding:"11px 20px", color: y.vol > 1 ? C.red : C.dim }}>{y.vol.toFixed(3)}%</td>
                        <td className="mono" style={{ padding:"11px 20px", color: (y.up/y.count)>0.5?C.green:C.red }}>{((y.up/y.count)*100).toFixed(0)}%</td>
                        <td style={{ padding:"11px 20px" }}><PctPill val={y.best} /></td>
                        <td style={{ padding:"11px 20px" }}><PctPill val={y.worst} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

        </AnimatedSection>

        <AnimatedSection id="section-time-patterns">
          <SectionLabel num="02" title="Time Patterns" />

            {/* Day of week + Monthly side by side */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }} className="two-col">

              <Card accent={C.blue} style={{ padding:24 }}>
                <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Avg Return by Day of Week</div>
                <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>
                  Monday leads by a wide margin (+0.23%). Thursday is the only day averaging negative returns (−0.17%). The Mon–Thu spread is the most reliable day-of-week edge in the dataset.
                </div>
                <ChartWrap height={200}>
                  <BarChart data={[...byDow]} margin={{ top:4, right:8, bottom:4, left:8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="day" tick={{ fill:C.dim, fontSize:12 }} />
                    <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v => fmtPct(v,2)} />
                    <Tooltip {...CHART_TOOLTIP} formatter={(v:unknown) => [fmtPct(v as number,4), "Avg QQQ Return"]} />
                    <ReferenceLine y={0} stroke={C.dim} strokeWidth={1} />
                    <Bar dataKey="avg" radius={[5,5,0,0]}>
                      {byDow.map(d => (
                        <Cell key={d.day} fill={d.avg>=0?C.blue:C.red} fillOpacity={d.day==="Mon"?0.95:d.day==="Thu"?0.95:0.65} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartWrap>
                <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6 }}>
                  {byDow.map(d => (
                    <div key={d.day} style={{ textAlign:"center", background:"rgba(0,0,0,0.03)", borderRadius:8, padding:"8px 4px" }}>
                      <div style={{ fontSize:11, fontWeight:700, color:C.dim }}>{d.day}</div>
                      <div className="mono" style={{ fontSize:13, fontWeight:800, color:d.avg>=0?C.green:C.red }}>{fmtPct(d.avg,2)}</div>
                      <div style={{ fontSize:10, color:C.faint }}>{((d.up/d.count)*100).toFixed(0)}% up</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card accent={C.cyan} style={{ padding:24 }}>
                <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Avg Return by Calendar Month</div>
                <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>
                  Across 2023–2026. January, March, and October lead. September and December lag — driven by FOMC surprises and year-end tax-loss selling respectively.
                </div>
                <ChartWrap height={200}>
                  <BarChart data={[...byMonth]} margin={{ top:4, right:8, bottom:4, left:8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="month" tick={{ fill:C.dim, fontSize:10 }} />
                    <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v => fmtPct(v,2)} />
                    <Tooltip {...CHART_TOOLTIP} formatter={(v:unknown) => [fmtPct(v as number,4), "Avg QQQ Return"]} />
                    <ReferenceLine y={0} stroke={C.dim} strokeWidth={1} />
                    <Bar dataKey="avg" radius={[4,4,0,0]}>
                      {byMonth.map(m => (
                        <Cell key={m.month} fill={m.avg>=0?C.cyan:C.red} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartWrap>
              </Card>
            </div>

            {/* Calendar heatmap */}
            <Card accent={C.green} style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Daily Return Calendar Heatmap — All 857 Sessions</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>Each square = one trading day. Green = positive open→close, Red = negative. Intensity scales with magnitude. April 2025 is visually unmistakable — the tariff shock week followed by the +12% recovery.</div>
              <div style={{ position:"relative" }}>
              <div style={WM_STYLE}>@Trace_Cohen · t@nyvp.com</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:16 }}>
                {calendar.map(({ ym, days }) => (
                  <div key={ym} style={{ minWidth:0 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:C.dim, letterSpacing:"0.06em", marginBottom:5 }}>{ym.slice(5,7)}/{ym.slice(2,4)}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:2 }}>
                      {days.map(day => {
                        const abs = Math.min(Math.abs(day.qqq)/4, 1);
                        const bg = day.qqq>=0 ? `rgba(52,199,89,${0.15 + abs*0.80})` : `rgba(255,59,48,${0.15 + abs*0.80})`;
                        return (
                          <div key={day.date} title={`${day.date}: ${fmtPct(day.qqq)}${day.en ? " · " + day.en : ""}`} style={{
                            width:10, height:10, borderRadius:2, background:bg, cursor:"default",
                            outline: day.et ? `1.5px solid ${TYPE_META[day.et]?.color ?? "#fff"}` : "none",
                          }} />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              </div>
              <div style={{ marginTop:16, display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ fontSize:11, color:C.dim, fontWeight:600 }}>Intensity = magnitude · Outlined = annotated event</div>
                {[
                  { bg:"rgba(52,199,89,0.22)", label:"< +1%" },
                  { bg:"rgba(52,199,89,0.55)", label:"+1–3%" },
                  { bg:"rgba(52,199,89,0.95)", label:"> +3%" },
                  { bg:"rgba(255,59,48,0.22)", label:"> −1%" },
                  { bg:"rgba(255,59,48,0.55)", label:"−1–3%" },
                  { bg:"rgba(255,59,48,0.95)", label:"< −3%" },
                ].map(s => (
                  <div key={s.label} style={{ display:"flex", gap:5, alignItems:"center" }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:s.bg }} />
                    <span style={{ fontSize:11, color:C.dim }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Monthly YM heatmap grid */}
            <Card accent={C.orange} style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Monthly Average Daily Return — Year × Month Grid</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>Avg daily QQQ return per calendar month. Quickly spot which months in which years drove or hurt performance.</div>
              {(() => {
                const years = Array.from(new Set(byYm.map(r => r.year))).sort();

                const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                const ym_map: Record<string, YearMonthStat> = Object.fromEntries(byYm.map(r => [r.ym, r]));
                return (
                  <div style={{ overflowX:"auto", position:"relative" }}>
                  <div style={WM_STYLE}>@Trace_Cohen · t@nyvp.com</div>
                    <table style={{ borderCollapse:"collapse", fontSize:12, width:"100%" }}>
                      <thead>
                        <tr>
                          <th scope="col" style={{ padding:"6px 12px", textAlign:"left", color:C.dim, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>Year</th>
                          {months.map(m=>(
                            <th key={m} scope="col" style={{ padding:"6px 10px", textAlign:"center", color:C.dim, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" }}>{m}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {years.map(yr => (
                          <tr key={yr}>
                            <td style={{ padding:"6px 12px", fontWeight:800, fontSize:13 }}>{yr}</td>
                            {months.map((m,mi) => {
                              const key = `${yr}-${String(mi+1).padStart(2,"0")}`;
                              const cell = ym_map[key];
                              if (!cell) return <td key={m} style={{ padding:"6px 10px", textAlign:"center", color:C.faint }}>—</td>;
                              const intensity = Math.min(Math.abs(cell.avg)/1.5, 1);
                              const bg = cell.avg>=0 ? `rgba(52,199,89,${0.12+intensity*0.6})` : `rgba(255,59,48,${0.12+intensity*0.6})`;
                              return (
                                <td key={m} title={`${key}: avg ${fmtPct(cell.avg,3)}/day · ${cell.count} sessions`} style={{ padding:"6px 10px", textAlign:"center", background:bg, borderRadius:6 }}>
                                  <div className="mono" style={{ fontWeight:700, fontSize:12, color: cell.avg>=0?"#1a7f3c":"#c0392b" }}>{fmtPct(cell.avg,2)}</div>
                                  <div style={{ fontSize:9, color:"rgba(0,0,0,0.35)" }}>{cell.count}d</div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </Card>

            {/* NEW: GitHub-style Daily Return Heatmap (per year, weeks × Mon-Fri) */}
            <Card accent={C.cyan} style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Daily Return Heatmap — All Sessions</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20, lineHeight:1.5 }}>
                GitHub-style contribution grid: each cell is one trading day, coloured by QQQ open→close return intensity. Weeks run left-to-right, Mon→Fri top-to-bottom. Years are stacked side-by-side so you can spot regime shifts at a glance.
              </div>
              <div style={{ position:"relative" }}>
                <div style={WM_STYLE}>@Trace_Cohen · t@nyvp.com</div>
                <div style={{ display:"flex", gap:24, overflowX:"auto", paddingBottom:8 }}>
                  {heatmapByYear.map(({ year, cells, weeks, monthLabels }) => {
                    const CELL = 11;
                    const GAP = 2;
                    const ROWS = 5; // Mon-Fri
                    const labelW = 18;
                    const width = labelW + weeks * (CELL + GAP);
                    const height = 18 + ROWS * (CELL + GAP);
                    return (
                      <div key={year} style={{ flex:"0 0 auto" }}>
                        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:6 }}>
                          <div className="mono" style={{ fontSize:13, fontWeight:800, color:C.text }}>{year}</div>
                        </div>
                        <svg width={width} height={height} role="img" aria-label={`${year} daily return heatmap`} style={{ display:"block" }}>
                          {/* Month labels */}
                          {monthLabels.map(ml => (
                            <text key={ml.col + ml.m} x={labelW + ml.col * (CELL + GAP)} y={11} fontSize={10} fill={C.dim} fontWeight={700}>{ml.m}</text>
                          ))}
                          {/* DOW labels */}
                          {["M","T","W","T","F"].map((d, di) => (
                            <text key={d + di} x={0} y={18 + di * (CELL + GAP) + CELL - 2} fontSize={9} fill={C.faint}>{d}</text>
                          ))}
                          {cells.map((c, idx) => {
                            const x = labelW + c.col * (CELL + GAP);
                            const y = 18 + c.dow * (CELL + GAP);
                            let fill = "#374151";
                            let titleStr = "";
                            if (c.row) {
                              const q = c.row.qqq;
                              if (q <= -3) fill = "#dc2626";
                              else if (q <= -1) fill = "#f87171";
                              else if (q < 0) fill = "#fca5a5";
                              else if (q < 1) fill = "#86efac";
                              else if (q < 3) fill = "#22c55e";
                              else fill = "#15803d";
                              titleStr = `${c.row.date}: ${fmtPct(q, 2)}${c.row.en ? " · " + c.row.en : ""}`;
                            } else if (c.date) {
                              titleStr = `${c.date}: no session`;
                            }
                            // Stagger the entrance: each cell fades in with a small delay based on idx.
                            const delay = Math.min(idx * 2.5, 1500); // cap so very long grids don't lag
                            return (
                              <rect
                                key={`${year}-${c.col}-${c.dow}-${idx}`}
                                className="hm-cell"
                                x={x}
                                y={y}
                                width={CELL}
                                height={CELL}
                                rx={2}
                                ry={2}
                                fill={fill}
                                style={{ animationDelay: `${delay}ms` }}
                              >
                                {titleStr && <title>{titleStr}</title>}
                              </rect>
                            );
                          })}
                        </svg>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginTop:16, display:"flex", gap:14, alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ fontSize:11, color:C.dim, fontWeight:600 }}>QQQ Open→Close Return:</div>
                {[
                  { bg:"#dc2626", label:"≤ −3%" },
                  { bg:"#f87171", label:"−1 to −3%" },
                  { bg:"#fca5a5", label:"0 to −1%" },
                  { bg:"#86efac", label:"0 to +1%" },
                  { bg:"#22c55e", label:"+1 to +3%" },
                  { bg:"#15803d", label:"≥ +3%" },
                  { bg:"#374151", label:"no session" },
                ].map(s => (
                  <div key={s.label} style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:s.bg }} />
                    <span style={{ fontSize:11, color:C.dim }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </Card>

        </AnimatedSection>

        <AnimatedSection id="section-event-intel">
          <SectionLabel num="03" title="Event Intelligence" />

            {/* Avg return by type */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }} className="two-col">
              <Card accent={C.blue} style={{ padding:24 }}>
                <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Avg QQQ Return by Event Type</div>
                <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>AI and Banking Crisis events are surprisingly bullish on average. Macro data and Geopolitical events are the most reliably negative catalysts for QQQ.</div>
                <ChartWrap height={220}>
                  <BarChart data={[...typeStats].sort((a,b)=>b.avg-a.avg)} margin={{ top:4, right:8, bottom:4, left:8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="type" tick={{ fill:C.dim, fontSize:10 }} />
                    <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v => fmtPct(v,2)} />
                    <Tooltip {...CHART_TOOLTIP} formatter={(v:unknown) => [fmtPct(v as number,3), "Avg QQQ Return"]} />
                    <ReferenceLine y={0} stroke={C.dim} strokeWidth={1} />
                    <Bar dataKey="avg" radius={[5,5,0,0]}>
                      {[...typeStats].sort((a,b)=>b.avg-a.avg).map(ts=>(
                        <Cell key={ts.type} fill={ts.avg>=0?(TYPE_META[ts.type]?.color??C.blue):C.red} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartWrap>
              </Card>

              <Card accent={C.green} style={{ overflow:"hidden" }}>
                <CardHeader title="Win Rate & Volatility by Event Type" sub="Does knowing the event type tell you which way QQQ will go?" />
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.08)" }}>
                        {["Type","Events","Avg Return","Win Rate","Volatility σ"].map(h=>(
                          <th key={h} scope="col" style={{ padding:"9px 16px", textAlign:"left", color:C.dim, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...typeStats].sort((a,b)=>b.avg-a.avg).map((ts,i)=>{
                        const m = TYPE_META[ts.type];
                        const wr = (ts.up/ts.count)*100;
                        return (
                          <tr key={ts.type} className="tr-hover" style={{ borderBottom:"1px solid rgba(0,0,0,0.04)", background:i%2===0?"transparent":"rgba(0,0,0,0.01)" }}>
                            <td style={{ padding:"10px 16px" }}>
                              <span style={{ fontSize:11, fontWeight:700, color:m?.color??C.blue, background:(m?.color??C.blue)+"15", border:`1px solid ${(m?.color??C.blue)}30`, borderRadius:20, padding:"2px 8px" }}>{ts.type}</span>
                            </td>
                            <td className="mono" style={{ padding:"10px 16px", color:C.dim }}>{ts.count}{ts.count < 5 && <span style={{ fontSize:9, color:C.orange, marginLeft:4, fontWeight:700 }}>LOW N</span>}</td>
                            <td style={{ padding:"10px 16px" }}><PctPill val={ts.avg} /></td>
                            <td className="mono" style={{ padding:"10px 16px", fontWeight:700, color:wr>=50?C.green:wr>=40?C.orange:C.red }}>{wr.toFixed(0)}%</td>
                            <td className="mono" style={{ padding:"10px 16px", color:ts.vol>2?C.red:C.dim }}>σ {ts.vol.toFixed(2)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Pre/Post event window */}
            <Card accent={C.cyan} style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Pre/Post Event Return Window — D-2 through D+5</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>
                Average QQQ return in the days surrounding key event types. AI events show persistent positive drift after D0. Political (tariff) events show the sharpest D0 spike, then mean-reversion. Macro events show weakness before and after.
              </div>
              <ChartWrap height={240}>
                <ComposedChart data={[...prePostWide]} margin={{ top:4, right:8, bottom:4, left:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="day" tick={{ fill:C.dim, fontSize:12 }} />
                  <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v => fmtPct(v,2)} />
                  <Tooltip {...CHART_TOOLTIP} formatter={(v:unknown, name:unknown) => [fmtPct(v as number, 3), name as string]} />
                  <ReferenceLine y={0} stroke={C.dim} strokeWidth={1} />
                  <ReferenceLine x="D0" stroke={C.orange} strokeDasharray="4 3" strokeWidth={1.5} label={{ value:"Event Day", position:"top", fill:C.orange, fontSize:10 }} />
                  {prePostTypes.map(type => (
                    <Line key={type} type="monotone" dataKey={type} stroke={TYPE_META[type]?.color ?? C.dim} strokeWidth={2} dot={{ r:4, fill:TYPE_META[type]?.color ?? C.dim }} name={type} />
                  ))}
                  <Legend />
                </ComposedChart>
              </ChartWrap>
            </Card>

            {/* QQQ-SPY spread */}
            <Card accent={C.orange} style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>QQQ − SPY Spread by Event Type</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>
                Positive spread = tech (QQQ) outperformed the broad market (SPY). AI and Earnings events drive the strongest tech outperformance. Macro and Geopolitical events trigger rotation away from tech into defensives, closing the spread.
              </div>
              <ChartWrap height={200}>
                <BarChart data={[...spreadByType]} margin={{ top:4, right:8, bottom:4, left:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="type" tick={{ fill:C.dim, fontSize:10 }} />
                  <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v => fmtPct(v,2)} />
                  <Tooltip {...CHART_TOOLTIP} formatter={(v:unknown) => [fmtPct(v as number,3), "QQQ−SPY Spread"]} />
                  <ReferenceLine y={0} stroke={C.dim} strokeWidth={1} />
                  <Bar dataKey="avg" radius={[5,5,0,0]}>
                    {spreadByType.map(d=>(
                      <Cell key={d.type} fill={d.avg>=0?(TYPE_META[d.type]?.color??C.blue):C.red} fillOpacity={0.82} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartWrap>
            </Card>

            {/* Top event impact days */}
            <Card accent={C.red} style={{ overflow:"hidden" }}>
              <CardHeader title="Top 20 Biggest Event-Driven Moves" sub="Largest absolute QQQ moves on annotated event days — both directions" />
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.08)" }}>
                      {["#","Date","QQQ","SPY","Type","Event"].map(h=>(
                        <th key={h} scope="col" style={{ padding:"10px 16px", textAlign:"left", color:C.dim, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topEventDays.map((r,i)=>{
                      const m = TYPE_META[r.et];
                      return (
                        <tr key={r.date} className="tr-hover" style={{ borderBottom:"1px solid rgba(0,0,0,0.04)", background:i%2===0?"transparent":"rgba(0,0,0,0.01)", borderLeft:`3px solid ${m?.color??C.dim}` }}>
                          <td className="mono" style={{ padding:"10px 16px", color:C.faint, fontSize:11 }}>{i+1}</td>
                          <td className="mono" style={{ padding:"10px 16px", color:C.dim, whiteSpace:"nowrap" }}>{fmtDate(r.date)}</td>
                          <td style={{ padding:"10px 16px" }}><PctPill val={r.qqq} /></td>
                          <td style={{ padding:"10px 16px" }}><PctPill val={r.spy??null} /></td>
                          <td style={{ padding:"10px 16px" }}>
                            {m && <span style={{ fontSize:10, fontWeight:700, color:m.color, background:m.color+"15", border:`1px solid ${m.color}30`, borderRadius:20, padding:"2px 8px", whiteSpace:"nowrap" }}>{m.label}</span>}
                          </td>
                          <td style={{ padding:"10px 16px" }}>
                            <div style={{ fontWeight:700, fontSize:12, color:C.text }}>{r.en}</div>
                            <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{r.ed?.slice(0,100)}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Key findings */}
            <Card accent={C.green} style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:16 }}>Key Findings: What the Data Actually Shows</div>
              {[
                { color:"#5856d6", title:"AI events are the strongest catalyst (89% win rate)", body:"Avg +0.46% QQQ, 8 of 9 events positive. The only exception was DeepSeek (Jan 27 2025) which dragged QQQ −3.8% intraday as NVDA fell 17%. Every other AI event — Sora, GPT-4o, Apple Intelligence, Stargate — was positive." },
                { color:"#ff2d55", title:"Banking crisis days average +0.96% — a counterintuitive positive (n=3)", body:"Markets front-run FDIC/Fed backstop announcements faster than the initial panic. SVB's closure weekend was already partially priced by Monday open; the BTFP facility announcement drove a relief rally. Bailout speed matters more than the crisis itself. Small sample — treat with caution." },
                { color:C.blue,   title:"Fed days are a perfect coin flip: 7 up, 7 down (avg +0.07%)", body:"The decision itself is irrelevant — only the language vs expectations matters. The Dec 2024 FOMC (−3.5%) held rates but projected only 2 cuts for 2025 instead of 4. Jun 2023 held rates for the first time in 15 months and rallied +0.8%." },
                { color:C.orange, title:"Macro data days skew negative: avg −0.48%", body:"Hot CPI means rate fears. Weak jobs means recession fears. Strong jobs means 'Fed won't cut.' The market finds a reason to sell on almost any data outcome during uncertain cycles. CPI prints are particularly toxic for QQQ vs SPY." },
                { color:"#ff6b35",title:"Political (tariff) events have the highest volatility (σ=4.32%) but positive avg", body:"Apr 9 2025 (+12.1%) alone pulls the average positive. Excluding that day, political events average −0.8%. The lesson: tariff escalations are predictably negative; pause/rollback announcements are massive positive shocks." },
                { color:C.green,  title:"Monday is the best trading day (+0.23%), Thursday the worst (−0.17%)", body:"The Mon/Thu spread of 0.40% is the most persistent time-of-week pattern in the dataset. Possible explanations: weekend news digestion driving Monday optimism, Thursday pre-announcement anxiety (many FOMC/earnings happen Thursday evening/Friday morning)." },
                { color:C.cyan,   title:"AI and Earnings events drive the largest QQQ outperformance over SPY", body:"On AI event days, QQQ outperforms SPY by an average of +0.35%. On Macro data days, SPY outperforms QQQ — classic defensive rotation. This spread is your tech-vs-broad-market signal." },
              ].map((f,i,arr)=>(
                <div key={i} style={{ display:"flex", gap:14, padding:"14px 0", borderBottom: i<arr.length-1 ? "1px solid rgba(0,0,0,0.05)":"none" }}>
                  <div style={{ width:3, minWidth:3, borderRadius:2, background:f.color, alignSelf:"stretch" }} />
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:4 }}>{f.title}</div>
                    <div style={{ fontSize:13, color:C.dim, lineHeight:1.65 }}>{f.body}</div>
                  </div>
                </div>
              ))}
            </Card>

            {/* Biggest unexplained moves */}
            {(() => {
              const unexplained = (rows as Row[])
                .filter(r => !r.et && Math.abs(r.qqq) >= 1.5)
                .sort((a, b) => Math.abs(b.qqq) - Math.abs(a.qqq))
                .slice(0, 15);
              return (
                <Card accent={C.faint} style={{ overflow:"hidden" }}>
                  <CardHeader title="Biggest Unannotated Moves" sub="Largest QQQ swings (≥ 1.5%) on days without a tagged event — each has a real driver" />
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                      <thead>
                        <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.08)" }}>
                          {["#","Date","QQQ","SPY","What Actually Happened"].map(h=>(
                            <th key={h} scope="col" style={{ padding:"9px 16px", textAlign:"left", color:C.dim, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {unexplained.map((r, i) => (
                          <tr key={r.date} className="tr-hover" style={{ borderBottom:"1px solid rgba(0,0,0,0.04)", background:i%2===0?"transparent":"rgba(0,0,0,0.01)" }}>
                            <td className="mono" style={{ padding:"10px 16px", color:C.faint, fontSize:11 }}>{i+1}</td>
                            <td className="mono" style={{ padding:"10px 16px", color:C.dim, whiteSpace:"nowrap" }}>{fmtDate(r.date)}</td>
                            <td style={{ padding:"10px 16px" }}><PctPill val={r.qqq} /></td>
                            <td style={{ padding:"10px 16px" }}><PctPill val={r.spy??null} /></td>
                            <td style={{ padding:"10px 16px", fontSize:12, color:C.text, lineHeight:1.5, maxWidth:400 }}>{UNEXPLAINED_DRIVERS[r.date] ?? "Follow-through or untracked catalyst — cross-reference news archives"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              );
            })()}

            {/* Market Anomalies */}
            <Card accent={C.yellow} style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Market Anomalies & Freakonomics</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>Counterintuitive patterns hiding in 857 sessions of data. These are the things the textbooks don&apos;t tell you.</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }} className="two-col">
                {[
                  { accent:C.red,    title:"The Thursday Curse", body:"Thursday is the ONLY weekday averaging negative returns (−0.17%). FOMC decisions fall on Wednesdays, making Thursday the reflexive 'second-guess' sell day. Many earnings also drop Thursday evening, adding pre-weekend risk. Avoid levered long positions into Thursday close." },
                  { accent:"#ff2d55",title:"Banking Panics Are Buy Signals", body:"The 3 banking crisis days in this dataset averaged +0.96% — the 4th best event type. Markets have learned to price Fed backstops before the FDIC even finishes its press release. The crisis itself is the buy signal." },
                  { accent:C.green,  title:"Best & Worst Days Were 24 Hours Apart", body:"Apr 8 2025 (−5.04%) and Apr 9 2025 (+12.14%) are consecutive trading sessions — the worst and best days in 857 sessions. The 17.2pp swing in 48 hours is the largest 2-day whipsaw in the entire dataset. Both were driven by a single tweet." },
                  { accent:C.orange, title:"IPO Days Are Bad for Existing Tech", body:"On IPO days, QQQ averages −0.20%. The hype flows to the new listing while capital drains from existing holdings. The more exciting the IPO, the more existing tech gets sold to fund allocations. IPO days are 'sell the existing, buy the new' events." },
                  { accent:"#5856d6",title:"AI Events: Great Win Rate, Modest Returns", body:"AI events average +0.46% — roughly what two average Mondays return combined. The 89% win rate is exceptional, but the magnitude is unimpressive. AI news is priced in faster than it moves the index. The exception: NVDA earnings, which land differently than product launches." },
                  { accent:C.blue,   title:"Fed Decisions Are Pure Noise", body:"Perfect 7-7 coin flip across 14 Fed meetings. The biggest single Fed day loss (−3.5%, Dec 2024) came from a HOLD decision — not a hike or cut. One word in the statement ('patient', 'data-dependent', 'restrictive') moves the market more than the actual rate decision." },
                  { accent:C.cyan,   title:"The DeepSeek Monday Exception", body:"Jan 27 2025 broke two statistical rules simultaneously: it was both an AI event AND a Monday — yet QQQ fell −3.8%. The only AI event to go negative, and one of the worst Mondays in the dataset. Cheap AI models threatening NVDA's moat triggered a semiconductor-led selloff." },
                  { accent:C.orange, title:"Macro Data Hurts Tech More Than Broad Market", body:"On macro data days, SPY outperforms QQQ by an average of 0.39%. Every hot CPI print triggers a rotation from growth stocks (QQQ) into defensives and value (SPY). This QQQ-SPY spread is the most reliable tech-vs-value signal in the dataset — bigger than any single event type." },
                ].map((a,i)=>(
                  <div key={i} style={{ background:"rgba(0,0,0,0.02)", borderRadius:12, padding:"16px 18px", borderLeft:`3px solid ${a.accent}` }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:6 }}>{a.title}</div>
                    <div style={{ fontSize:12, color:C.dim, lineHeight:1.65 }}>{a.body}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Weather Effect */}
            <Card accent="#5ac8fa" style={{ padding:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <div style={{ fontWeight:700, fontSize:15, color:C.text }}>NYC Weather vs. Market Returns</div>
                <span style={{ fontSize:11, fontWeight:700, background:"rgba(90,200,250,0.12)", color:"#0071e3", borderRadius:20, padding:"3px 10px", letterSpacing:"0.06em" }}>190 SUMMER DAYS · 2023–2025</span>
              </div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20, lineHeight:1.5 }}>
                Matched NYC summer weather data (Jun–Aug 2023–2025) against QQQ daily returns. Overall correlation is near zero (r ≈ 0.08, p = 0.26) — Wall Street traders have air conditioning. But one pattern stands out.
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }} className="three-col">
                {/* Temperature gradient */}
                <div style={{ background:"rgba(0,0,0,0.02)", borderRadius:12, padding:"16px 18px" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.dim, letterSpacing:"0.06em", marginBottom:12 }}>TEMPERATURE EFFECT</div>
                  {[
                    { label:"75–79°F", val:"+0.29%", color:C.green },
                    { label:"80–84°F", val:"+0.08%", color:"#34a853" },
                    { label:"85–89°F", val:"−0.01%", color:C.dim },
                    { label:"90°F +",  val:"−0.41%", color:C.red },
                  ].map(r=>(
                    <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:12, color:C.dim }}>{r.label}</span>
                      <span className="mono" style={{ fontSize:13, fontWeight:800, color:r.color }}>{r.val}</span>
                    </div>
                  ))}
                  <div style={{ fontSize:11, color:C.faint, marginTop:4 }}>avg QQQ daily return</div>
                </div>
                {/* Win rate comparison */}
                <div style={{ background:"rgba(0,0,0,0.02)", borderRadius:12, padding:"16px 18px" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.dim, letterSpacing:"0.06em", marginBottom:12 }}>WIN RATE</div>
                  {[
                    { label:"Hot days (≥88°F)", val:"41%", sub:"n=41", color:C.red },
                    { label:"Cool days (<88°F)", val:"58%", sub:"n=149", color:C.green },
                    { label:"Rainy days",        val:"53%", sub:"n=30",  color:C.cyan },
                    { label:"Clear days",        val:"55%", sub:"n=168", color:C.blue },
                  ].map(r=>(
                    <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:12, color:C.dim }}>{r.label}</div>
                        <div style={{ fontSize:10, color:C.faint }}>{r.sub}</div>
                      </div>
                      <span className="mono" style={{ fontSize:14, fontWeight:800, color:r.color }}>{r.val}</span>
                    </div>
                  ))}
                </div>
                {/* Verdict */}
                <div style={{ background:"rgba(90,200,250,0.06)", borderRadius:12, padding:"16px 18px", borderLeft:`3px solid ${C.cyan}` }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.dim, letterSpacing:"0.06em", marginBottom:10 }}>THE VERDICT</div>
                  <div style={{ fontSize:13, color:C.text, lineHeight:1.7, fontWeight:500 }}>
                    Rain barely matters. Temperature does — slightly. Hot NYC summer days (90°F+) averaged −0.41% vs +0.29% on mild days. Hypothesis: heat-induced energy consumption spikes raise input costs and dampen economic sentiment. Or traders are just crankier when it&apos;s hot. Either way, the correlation is statistically weak (p=0.26) — don&apos;t trade on it.
                  </div>
                  <div style={{ marginTop:12, fontSize:11, color:C.faint }}>
                    Bonus find: Mondays after rainy weekends (+0.38%) beat Mondays after dry weekends (+0.17%). Traders feeling rested from staying indoors?
                  </div>
                </div>
              </div>
            </Card>

            {/* NEW: Event Anatomy — D-5 → D+20 composite path */}
            <Card accent={C.blue} style={{ padding:24 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:4 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Event Anatomy: Average Return Path</div>
                  <div style={{ fontSize:13, color:C.dim, lineHeight:1.5, maxWidth:760 }}>
                    Composite average cumulative QQQ return from D-5 through D+20 for each selected event type. The D-5 baseline anchors every event at 0 — every line shows the average <em>relative</em> path a portfolio would have taken around that catalyst. Toggle types below.
                  </div>
                </div>
              </div>
              <div role="group" aria-label="Event type filters" style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:14, marginBottom:18 }}>
                {ALL_EVENT_TYPES.map((t, i) => {
                  const active = anatomyTypes.includes(t);
                  const color = ANATOMY_PALETTE[i % ANATOMY_PALETTE.length];
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setAnatomyTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                      style={{
                        padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:700,
                        border:`1px solid ${active ? color : "rgba(0,0,0,0.12)"}`,
                        background: active ? color + "1a" : "transparent",
                        color: active ? color : C.dim,
                        cursor:"pointer", fontFamily:"inherit",
                        transition:"all 0.15s ease",
                      }}
                    >
                      <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:color, marginRight:8, verticalAlign:"middle", opacity: active ? 1 : 0.4 }} />
                      {TYPE_META[t]?.label ?? t}
                    </button>
                  );
                })}
              </div>
              <ChartWrap height={300}>
                <ComposedChart data={anatomyData} margin={{ top:8, right:16, bottom:4, left:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="label" tick={{ fill:C.dim, fontSize:11 }} interval={1} />
                  <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v => fmtPct(v as number, 1)} />
                  <Tooltip {...CHART_TOOLTIP} formatter={(v:unknown, name:unknown) => [fmtPct(v as number, 3), name as string]} labelFormatter={v => `Offset: ${v}`} />
                  <ReferenceLine y={0} stroke={C.dim} strokeWidth={1} />
                  <ReferenceLine x="D+0" stroke={C.orange} strokeDasharray="4 3" strokeWidth={1.5} label={{ value:"D+0 Event Day", position:"top", fill:C.orange, fontSize:10, fontWeight:700 }} />
                  {anatomyTypes.map((t, idx) => {
                    const palIdx = ALL_EVENT_TYPES.indexOf(t);
                    const color = ANATOMY_PALETTE[(palIdx >= 0 ? palIdx : idx) % ANATOMY_PALETTE.length];
                    return (
                      <Line
                        key={t}
                        type="monotone"
                        dataKey={t}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={false}
                        name={t}
                        isAnimationActive
                        animationBegin={idx * 180}
                        animationDuration={900}
                      />
                    );
                  })}
                  <Legend />
                </ComposedChart>
              </ChartWrap>
              <div style={{ marginTop:10, fontSize:11, color:C.faint }}>
                Each line = composite average path across every annotated event of that type with a complete D-5 to D+20 window in the dataset.
              </div>
            </Card>

            {/* NEW: Outcome Simulator */}
            <Card accent={C.green} style={{ padding:24 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:4 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Outcome Simulator</div>
                  <div style={{ fontSize:13, color:C.dim, lineHeight:1.5, maxWidth:720 }}>
                    Pick an event type and a forward window. We compute the cumulative QQQ return over the next N trading sessions following <em>every</em> occurrence and plot the distribution.
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginTop:16, marginBottom:18, alignItems:"center" }}>
                <label style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:C.dim, letterSpacing:"0.08em", textTransform:"uppercase" }}>Event Type</span>
                  <select
                    value={simType}
                    onChange={e => setSimType(e.target.value as EventType)}
                    style={{
                      padding:"7px 12px", borderRadius:10, border:"1px solid rgba(0,0,0,0.14)",
                      background:"#fff", color:C.text, fontSize:13, fontFamily:"inherit", fontWeight:600,
                      cursor:"pointer", minWidth:180,
                    }}
                  >
                    {ALL_EVENT_TYPES.map(t => (
                      <option key={t} value={t}>{TYPE_META[t]?.label ?? t}</option>
                    ))}
                  </select>
                </label>
                <label style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:C.dim, letterSpacing:"0.08em", textTransform:"uppercase" }}>Lookback Window</span>
                  <select
                    value={simWindow}
                    onChange={e => setSimWindow(Number(e.target.value))}
                    style={{
                      padding:"7px 12px", borderRadius:10, border:"1px solid rgba(0,0,0,0.14)",
                      background:"#fff", color:C.text, fontSize:13, fontFamily:"inherit", fontWeight:600,
                      cursor:"pointer", minWidth:180,
                    }}
                  >
                    {[1, 3, 5, 10].map(n => <option key={n} value={n}>Next {n} session{n === 1 ? "" : "s"}</option>)}
                  </select>
                </label>
                <div style={{ marginLeft:"auto", fontSize:12, color:C.dim, fontWeight:600 }} aria-live="polite">
                  Based on <span className="mono" style={{ color:C.text, fontWeight:800 }}>{simResults.n}</span> historical event{simResults.n === 1 ? "" : "s"}
                </div>
              </div>

              {simResults.n === 0 ? (
                <div style={{ padding:"40px 20px", textAlign:"center", color:C.faint, fontSize:13 }}>
                  No qualifying events for this combination.
                </div>
              ) : (
                <>
                  <ChartWrap height={220}>
                    <BarChart data={simResults.bins} margin={{ top:4, right:8, bottom:4, left:8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="range" tick={{ fill:C.dim, fontSize:10 }} />
                      <YAxis tick={{ fill:C.dim, fontSize:11 }} allowDecimals={false} />
                      <Tooltip {...CHART_TOOLTIP} formatter={(v:unknown) => [v as number, "Events"]} labelFormatter={v => `Bucket: ${v}`} />
                      <ReferenceLine x={`${simResults.median >= 0 ? "+" : ""}${Math.floor(simResults.median)}%`} stroke={C.orange} strokeDasharray="3 3" />
                      <Bar dataKey="count" radius={[4,4,0,0]} isAnimationActive animationDuration={600}>
                        {simResults.bins.map(b => (
                          <Cell key={b.range} fill={b.mid >= 0 ? C.green : C.red} fillOpacity={0.82} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartWrap>
                  <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10 }}>
                    {[
                      { label:"Mean",       val: fmtPct(simResults.mean, 2),   color: simResults.mean   >= 0 ? C.green : C.red },
                      { label:"Median",     val: fmtPct(simResults.median, 2), color: simResults.median >= 0 ? C.green : C.red },
                      { label:"Best Case",  val: fmtPct(simResults.best, 2),   color: C.green },
                      { label:"Worst Case", val: fmtPct(simResults.worst, 2),  color: C.red },
                      { label:"% Positive", val: `${simResults.pctPos.toFixed(0)}%`, color: simResults.pctPos >= 50 ? C.green : C.orange },
                    ].map(s => (
                      <div key={s.label} style={{ background:"rgba(0,0,0,0.03)", borderRadius:10, padding:"10px 14px" }}>
                        <div style={{ fontSize:10, fontWeight:700, color:C.dim, letterSpacing:"0.08em", textTransform:"uppercase" }}>{s.label}</div>
                        <div className="mono" style={{ fontSize:17, fontWeight:800, color:s.color, marginTop:4 }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

        </AnimatedSection>

        <AnimatedSection id="section-trends">
          <SectionLabel num="04" title="Trends" />

            {/* Rolling volatility */}
            <Card accent={C.orange} style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>30-Day Rolling Volatility (Annualized)</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20, lineHeight:1.5 }}>
                Annualized volatility computed from daily open→close returns over a 30-day rolling window. Spikes correspond directly to tariff shock weeks (April 2025), Japan carry-trade unwind (August 2024), and DeepSeek (January 2025). The 2023 baseline ≈ 12–15% annualized; April 2025 peak exceeded 50%.
              </div>
              <ChartWrap height={260}>
                <LineChart data={[...rollingVol]} margin={{ top:4, right:8, bottom:4, left:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" tick={{ fill:C.dim, fontSize:10 }} tickFormatter={v => (v as string).slice(2,7).replace("-","'")} interval={39} />
                  <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip {...CHART_TOOLTIP} labelFormatter={v=>`Date: ${v}`} formatter={(v:unknown)=>[`${(v as number).toFixed(1)}%`, "Annualized Vol"]} />
                  <Line type="monotone" dataKey="vol" stroke={C.orange} strokeWidth={2} dot={false} />
                </LineChart>
              </ChartWrap>
            </Card>

            {/* Volatility event breakdown + Year avg vol */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }} className="two-col">
              <Card accent={C.cyan} style={{ padding:24 }}>
                <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Volatility on Event vs Normal Days</div>
                <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>{(s.vol_event/s.vol_non_event).toFixed(2)}× — the core quantitative finding of this entire dataset.</div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {[
                    { label:`Event Days (${s.event_days} sessions)`, vol: s.vol_event, color:C.orange, n:s.event_days, pct:`${((s.event_days/s.total_days)*100).toFixed(1)}%` },
                    { label:`Non-Event Days (${s.total_days - s.event_days} sessions)`, vol:s.vol_non_event, color:C.blue, n:s.total_days - s.event_days, pct:`${(((s.total_days-s.event_days)/s.total_days)*100).toFixed(1)}%` },
                  ].map(v=>(
                    <div key={v.label} style={{ background:"rgba(0,0,0,0.03)", borderRadius:12, padding:"16px 18px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{v.label}</div>
                        <div className="mono" style={{ fontWeight:800, fontSize:20, color:v.color }}>σ {v.vol.toFixed(2)}%</div>
                      </div>
                      <div style={{ height:8, background:"rgba(0,0,0,0.08)", borderRadius:4, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${Math.min(v.vol/3*100,100)}%`, background:v.color, borderRadius:4 }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ fontSize:13, color:C.dim, lineHeight:1.65, marginTop:4 }}>
                    If you could correctly predict the <em>direction</em> of moves on event days, your expected daily return would be ~2.15% vs 0.84% on quiet days. This is why event-driven trading strategies exist.
                  </div>
                </div>
              </Card>

              <Card accent={C.blue} style={{ padding:24 }}>
                <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Annual Volatility Comparison</div>
                <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>2025 was twice as volatile as 2023 — driven almost entirely by the tariff shock sequence in April. Without April 2025, 2025 vol would have been roughly in line with 2024.</div>
                <ChartWrap height={180}>
                  <BarChart data={[...byYear]} margin={{ top:4, right:8, bottom:4, left:8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="year" tick={{ fill:C.dim, fontSize:12 }} />
                    <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v=>`${v}%`} />
                    <Tooltip {...CHART_TOOLTIP} formatter={(v:unknown)=>[`${(v as number).toFixed(3)}%`, "Daily Vol σ"]} />
                    <Bar dataKey="vol" radius={[5,5,0,0]}>
                      {byYear.map(y=>(
                        <Cell key={y.year} fill={y.vol>1?C.red:y.vol>0.9?C.orange:C.blue} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartWrap>
                <div style={{ marginTop:12, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                  {byYear.map(y=>(
                    <div key={y.year} style={{ textAlign:"center", background:"rgba(0,0,0,0.03)", borderRadius:8, padding:"8px 6px" }}>
                      <div style={{ fontSize:11, fontWeight:700, color:C.dim }}>{y.year}</div>
                      <div className="mono" style={{ fontSize:11, fontWeight:700, color:y.vol>1?C.red:C.dim }}>σ {y.vol.toFixed(2)}%</div>
                      <div style={{ fontSize:10, color:C.faint }}>{((y.up/y.count)*100).toFixed(0)}% up</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* NEW: Volatility Clustering — consecutive |QQQ| ≥ 1% sessions */}
            <Card accent={C.red} style={{ overflow:"hidden" }}>
              <CardHeader
                title="Volatility Clustering — Stretches of Consecutive ±1%+ Sessions"
                sub="Big-move days arrive in waves. These are every run of 3+ back-to-back trading days where QQQ moved at least 1% in either direction — a direct measure of volatility regime persistence."
              />
              <div style={{ padding:"14px 24px 8px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12, borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:C.dim, letterSpacing:"0.08em" }}>CLUSTERS FOUND</div>
                  <div className="mono" style={{ fontSize:22, fontWeight:800, color:C.red }}>{clusters.length}</div>
                  <div style={{ fontSize:11, color:C.faint }}>runs of 3+ consecutive big-move days</div>
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:C.dim, letterSpacing:"0.08em" }}>LONGEST RUN</div>
                  <div className="mono" style={{ fontSize:22, fontWeight:800, color:C.orange }}>{longestCluster?.len ?? 0} days</div>
                  <div style={{ fontSize:11, color:C.faint }}>
                    {longestCluster ? `${fmtDate(longestCluster.start)} → ${fmtDate(longestCluster.end)}` : "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:C.dim, letterSpacing:"0.08em" }}>LAG-1 AUTOCORRELATION</div>
                  <div className="mono" style={{ fontSize:22, fontWeight:800, color: Math.abs(dailyAutocorr) > 0.05 ? C.orange : C.dim }}>
                    {dailyAutocorr >= 0 ? "+" : ""}{dailyAutocorr.toFixed(3)}
                  </div>
                  <div style={{ fontSize:11, color:C.faint }}>does yesterday predict today?</div>
                </div>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.08)" }}>
                      {["#","Start","End","Length","Cumulative |Move|","Avg Per Day"].map(h=>(
                        <th key={h} scope="col" style={{ padding:"9px 16px", textAlign:"left", color:C.dim, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clusters.slice(0,10).map((c,i)=>(
                      <tr key={c.start} className="tr-hover" style={{ borderBottom:"1px solid rgba(0,0,0,0.04)", background:i%2===0?"transparent":"rgba(0,0,0,0.01)" }}>
                        <td className="mono" style={{ padding:"10px 16px", color:C.faint, fontSize:11 }}>{i+1}</td>
                        <td className="mono" style={{ padding:"10px 16px", color:C.dim, whiteSpace:"nowrap" }}>{fmtDate(c.start)}</td>
                        <td className="mono" style={{ padding:"10px 16px", color:C.dim, whiteSpace:"nowrap" }}>{fmtDate(c.end)}</td>
                        <td className="mono" style={{ padding:"10px 16px", fontWeight:800, color:c.len>=6?C.red:c.len>=4?C.orange:C.text }}>{c.len} days</td>
                        <td className="mono" style={{ padding:"10px 16px", color:C.text }}>{c.sumAbs.toFixed(2)}%</td>
                        <td className="mono" style={{ padding:"10px 16px", color:C.dim }}>{(c.sumAbs / c.len).toFixed(2)}% / day</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding:"14px 24px 18px", fontSize:12, color:C.dim, lineHeight:1.6 }}>
                {Math.abs(dailyAutocorr) < 0.05
                  ? "Daily returns are essentially uncorrelated day-to-day (|ρ| < 0.05) — yesterday's direction tells you almost nothing about today's. But volatility magnitude clusters strongly: once the market enters a high-vol regime, expect the next several sessions to also be loud."
                  : `Lag-1 autocorrelation is ${dailyAutocorr.toFixed(3)} — modest but non-zero. Directional momentum is weak; volatility clustering is the dominant pattern.`}
              </div>
            </Card>

        </AnimatedSection>

        <AnimatedSection id="section-timeline" style={{ gap: 0 }}>
          <SectionLabel num="05" title="Full Timeline" />
          <div style={{ marginBottom:16 }} />
            {/* Filters */}
            <Card style={{ padding:"16px 20px", marginBottom:16, borderTop:`2px solid ${C.blue}` }}>
              <div role="group" aria-label="Timeline filters" style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                {["ALL","2026","2025","2024","2023"].map(y=>(
                  <button key={y} type="button" aria-pressed={yearFilter===y} aria-label={`Filter to year ${y}`} onClick={()=>{setYearFilter(y);setPage(0);}} style={{
                    padding:"5px 12px", borderRadius:20,
                    border:`1px solid ${yearFilter===y?C.blue:"rgba(0,0,0,0.12)"}`,
                    background: yearFilter===y ? C.blue+"12":"transparent",
                    color: yearFilter===y ? C.blue:C.dim,
                    fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                  }}>{y}</button>
                ))}
                <div aria-hidden="true" style={{ width:1, height:20, background:"rgba(0,0,0,0.1)", margin:"0 4px" }} />
                {(Object.entries(TYPE_META) as Array<[EventType, typeof TYPE_META[EventType]]>).map(([et,m])=>(
                  <button key={et} type="button" aria-pressed={evTypeFilter===et} aria-label={`Filter by event type ${m.label}`} onClick={()=>{setEvTypeFilter(evTypeFilter===et?"ALL":et);setPage(0);}} style={{
                    padding:"4px 10px", borderRadius:20, fontSize:11,
                    border:`1px solid ${evTypeFilter===et?m.color:"rgba(0,0,0,0.10)"}`,
                    background: evTypeFilter===et?m.color+"12":"transparent",
                    color: evTypeFilter===et?m.color:C.dim, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                  }}>{m.label}</button>
                ))}
                <div aria-hidden="true" style={{ width:1, height:20, background:"rgba(0,0,0,0.1)", margin:"0 4px" }} />
                <button type="button" aria-pressed={evOnly} onClick={()=>{setEvOnly(!evOnly);setPage(0);}} style={{
                  padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:600,
                  border:`1px solid ${evOnly?C.blue:"rgba(0,0,0,0.12)"}`,
                  background:evOnly?C.blue+"12":"transparent",
                  color:evOnly?C.blue:C.dim, cursor:"pointer", fontFamily:"inherit",
                }}>Events Only</button>
                <button type="button" aria-pressed={extremeOnly} onClick={()=>{setExtremeOnly(!extremeOnly);setPage(0);}} style={{
                  padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:600,
                  border:`1px solid ${extremeOnly?C.red:"rgba(0,0,0,0.12)"}`,
                  background:extremeOnly?C.red+"12":"transparent",
                  color:extremeOnly?C.red:C.dim, cursor:"pointer", fontFamily:"inherit",
                }}>±2%+ Only</button>
                <label htmlFor="timeline-search" style={{ position:"absolute", width:1, height:1, overflow:"hidden", clip:"rect(0 0 0 0)" }}>Search timeline by date or event</label>
                <input id="timeline-search" type="search" placeholder="Search date or event…" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} aria-label="Search timeline by date or event" style={{
                  padding:"5px 12px", borderRadius:20, border:"1px solid rgba(0,0,0,0.12)",
                  fontSize:12, outline:"none", fontFamily:"inherit", color:C.text, background:"#f5f5f7", width:200,
                }} />
                <div aria-live="polite" style={{ marginLeft:"auto", fontSize:12, color:C.dim, fontWeight:600 }}>{filtered.length} days</div>
              </div>
            </Card>

            {/* Table */}
            <Card style={{ overflow:"hidden", borderTop:`2px solid ${C.blue}` }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.08)" }}>
                    {["Date","Event Type","QQQ","SPY","NDX","QQQ−SPY","Event"].map(h=>(
                      <th key={h} scope="col" style={{ padding:"10px 16px", textAlign:"left", color:C.dim, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length===0 && (
                    <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:C.faint, fontSize:13 }}>No results for current filters.</td></tr>
                  )}
                  {paginated.map((row,i)=>{
                    const m = row.et ? TYPE_META[row.et] : null;
                    const spread = row.spy != null ? row.qqq - row.spy : null;
                    return (
                      <tr key={row.date} className="tr-hover" style={{
                        borderBottom:"1px solid rgba(0,0,0,0.04)",
                        background: m ? m.color+"08" : (i%2===0?"transparent":"rgba(0,0,0,0.01)"),
                        borderLeft: m ? `3px solid ${m.color}` : "3px solid transparent",
                      }}>
                        <td className="mono" style={{ padding:"9px 16px", color:C.dim, fontSize:12, whiteSpace:"nowrap" }}>{fmtDate(row.date)}</td>
                        <td style={{ padding:"9px 16px" }}>
                          {m && <span style={{ fontSize:10, fontWeight:700, color:m.color, background:m.color+"15", border:`1px solid ${m.color}30`, borderRadius:20, padding:"2px 8px", whiteSpace:"nowrap" }}>{m.label}</span>}
                        </td>
                        <td style={{ padding:"9px 16px" }}><PctPill val={row.qqq} /></td>
                        <td style={{ padding:"9px 16px" }}><PctPill val={row.spy??null} /></td>
                        <td style={{ padding:"9px 16px" }}><PctPill val={row.ndx??null} /></td>
                        <td style={{ padding:"9px 16px" }}>{spread!=null?<PctPill val={Math.round(spread*1000)/1000} />:"—"}</td>
                        <td style={{ padding:"9px 16px", maxWidth:340 }}>
                          {row.en && (
                            <>
                              <div style={{ fontWeight:700, fontSize:12, color:m?.color??C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.en}</div>
                              <div style={{ fontSize:11, color:C.dim, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:320, marginTop:2 }}>{row.ed?.slice(0,110)}</div>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:8, marginTop:16 }}>
                <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{
                  padding:"6px 18px", borderRadius:20, border:"1px solid rgba(0,0,0,0.12)",
                  background:page===0?"#f5f5f7":"#fff", color:page===0?C.faint:C.text,
                  cursor:page===0?"not-allowed":"pointer", fontSize:12, fontFamily:"inherit", fontWeight:600,
                }}>← Prev</button>
                <span style={{ fontSize:12, color:C.dim }}>Page {page+1} of {totalPages} · {filtered.length} rows · 25 per page</span>
                <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page===totalPages-1} style={{
                  padding:"6px 18px", borderRadius:20, border:"1px solid rgba(0,0,0,0.12)",
                  background:page===totalPages-1?"#f5f5f7":"#fff", color:page===totalPages-1?C.faint:C.text,
                  cursor:page===totalPages-1?"not-allowed":"pointer", fontSize:12, fontFamily:"inherit", fontWeight:600,
                }}>Next →</button>
              </div>
            )}
        </AnimatedSection>

        {/* Footer */}
        <footer style={{ marginTop:48, paddingTop:24, borderTop:"1px solid rgba(0,0,0,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div style={{ fontSize:11, color:C.faint }}>Data: Yahoo Finance · Open→Close intraday return · Not adjusted for dividends or overnight gaps · For informational use only · <a href="/api/data" style={{ color:C.blue, textDecoration:"none" }}>JSON API</a></div>
          <div style={{ display:"flex", gap:20, alignItems:"center" }}>
            <a href="https://x.com/Trace_Cohen" target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:C.dim, textDecoration:"none", fontWeight:600 }}>@Trace_Cohen</a>
            <a href="mailto:t@nyvp.com" style={{ fontSize:12, color:C.dim, textDecoration:"none", fontWeight:600 }}>t@nyvp.com</a>
          </div>
        </footer>
      </div>

      {/* Scroll to top */}
      <button type="button" aria-label="Scroll to top of page" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{
        position:"fixed", bottom:28, right:28, zIndex:100,
        width:42, height:42, borderRadius:"50%",
        background:C.blue, border:"none", cursor:"pointer",
        boxShadow:"0 4px 16px rgba(0,113,227,0.4)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:18, color:"#fff", fontFamily:"inherit",
        transition:"all 0.2s",
      }}
      onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.1)")}
      onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}
      title="Back to top"
      ><span aria-hidden="true">↑</span></button>

      <style>{`
        * { box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        body { -webkit-font-smoothing:antialiased; }
        .mono { font-family:'SF Mono','Fira Code','Cascadia Code',monospace; }
        .card-lift { transition:box-shadow 0.2s ease,transform 0.2s ease; }
        .card-lift:hover { box-shadow:0 8px 28px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.06) !important; transform:translateY(-1px); }
        .tr-hover:hover { background:rgba(0,113,227,0.04) !important; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:#f5f5f7; }
        ::-webkit-scrollbar-thumb { background:#d2d2d7; border-radius:4px; }
        input::placeholder { color:#aeaeb2; }
        button { transition:all 0.12s; }
        .orb { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; will-change:transform; }
        .orb-1 { width:500px; height:500px; background:radial-gradient(circle,rgba(0,113,227,0.35),transparent); top:-120px; left:-80px; animation:orb1 12s ease-in-out infinite; }
        .orb-2 { width:400px; height:400px; background:radial-gradient(circle,rgba(90,200,250,0.25),transparent); top:40px; right:5%; animation:orb2 15s ease-in-out infinite; }
        .orb-3 { width:320px; height:320px; background:radial-gradient(circle,rgba(52,199,89,0.2),transparent); bottom:-60px; left:35%; animation:orb3 10s ease-in-out infinite; }
        @keyframes orb1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(60px,-40px) scale(1.08)}66%{transform:translate(-30px,50px) scale(0.95)}}
        @keyframes orb2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-50px,60px) scale(1.05)}66%{transform:translate(40px,-30px) scale(0.92)}}
        @keyframes orb3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,30px) scale(1.1)}}
        .shimmer-text{background:linear-gradient(135deg,#f5f5f7 30%,#5ac8fa 50%,#f5f5f7 70%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite;}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .ticker-wrap{overflow:hidden;white-space:nowrap;}
        .ticker-inner{display:inline-flex;animation:ticker 50s linear infinite;}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .pulse-dot{animation:pulse-dot 2s ease-in-out infinite;}
        @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}
        .nav-glass{background:rgba(0,0,0,0.62);backdrop-filter:blur(24px) saturate(1.8);-webkit-backdrop-filter:blur(24px) saturate(1.8);border-bottom:1px solid rgba(255,255,255,0.10);box-shadow:0 1px 0 rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07);}
        @media(max-width:680px){.two-col{grid-template-columns:1fr !important;}}
        .hm-cell{opacity:0;animation:hmFade 380ms ease forwards;will-change:opacity;}
        @keyframes hmFade{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}
        select:focus{outline:none;box-shadow:0 0 0 3px rgba(0,113,227,0.18);}
      `}</style>
    </div>
  );
}
