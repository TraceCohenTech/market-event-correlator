"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Legend,
} from "recharts";
import {
  ROWS, SUMMARY, TYPE_STATS, CUM_THIN, BY_DOW, BY_MONTH,
  BY_YEAR, BY_YM, DISTRIBUTION, ROLLING_VOL, PRE_POST_WIDE,
  STREAKS, TOP_EVENT_DAYS, SPREAD_BY_TYPE, CALENDAR,
} from "./data";

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

const TYPE_META: Record<string, { color: string; label: string; short: string }> = {
  "Fed":            { color: C.blue,    label: "Fed",          short: "FED" },
  "Macro":          { color: C.orange,  label: "Macro",        short: "MCR" },
  "Political":      { color: "#ff6b35", label: "Political",    short: "POL" },
  "Earnings":       { color: C.cyan,    label: "Earnings",     short: "EPS" },
  "AI":             { color: "#5856d6", label: "AI",           short: "AI·" },
  "IPO":            { color: C.green,   label: "IPO",          short: "IPO" },
  "Banking Crisis": { color: "#ff2d55", label: "Banking",      short: "BNK" },
  "Geopolitical":   { color: "#8e8e93", label: "Geopolitical", short: "GEO" },
};

const TICKER_ITEMS = [
  "857 Trading Days · Jan 2023–Jun 2026",
  "89 Annotated Events Across 8 Categories",
  "Event-Day Volatility 2.55× Normal Sessions",
  "Best Day: QQQ +12.1% · Apr 9 2025 — Tariff Pause",
  "Worst Day: QQQ −5.0% · Apr 8 2025 — China 104% Tariff",
  "AI Events: 89% Win Rate · Avg +0.46%",
  "Fed Days: Perfect Coin Flip · 7 Up / 7 Down",
  "Monday is the Best Trading Day · +0.23% Avg",
  "Thursday is the Worst · −0.17% Avg",
  "2025 Had 2× Higher Volatility Than 2023",
];

// ── TYPES ─────────────────────────────────────────────────────
type Row = { date: string; qqq: number; spy: number | null; ndx: number | null; et?: string; en?: string; ed?: string };

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
const CHART_TOOLTIP = {
  contentStyle: { background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 12 },
};

const SECTIONS = ["Overview", "Time Patterns", "Event Intel", "Trends", "Timeline"] as const;

// ── COMPONENT ─────────────────────────────────────────────────
export default function MarketEventDashboard() {
  const [activeSection, setActiveSection] = useState<string>("Overview");
  const [yearFilter, setYearFilter]   = useState("ALL");
  const [evTypeFilter, setEvTypeFilter] = useState("ALL");
  const [evOnly, setEvOnly]           = useState(false);
  const [extremeOnly, setExtremeOnly] = useState(false);
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(0);
  const PAGE = 25;

  const rows = ROWS as unknown as Row[];
  const s = SUMMARY as { total_days:number; event_days:number; avg_all:number; vol_event:number; vol_non_event:number; best:Row; worst:Row; big_moves:number };
  const streaks = STREAKS as { up:{len:number;start:string;end:string}; down:{len:number;start:string;end:string} };

  // ── Timeline filtered rows ────────────────────────────────
  const filtered = useMemo(() => {
    let r = [...rows];
    if (yearFilter !== "ALL") {
      if (yearFilter === "2025–26") r = r.filter(x => x.date >= "2025");
      else r = r.filter(x => x.date.startsWith(yearFilter));
    }
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
  const prePostTypes = ["AI", "Political", "Fed", "Macro"];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" }}>

      {/* ════ HERO ════ */}
      <div style={{ position: "relative", background: "#000", overflow: "hidden" }}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

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
            857 trading days of QQQ, SPY & NDX open→close returns annotated with{" "}
            <span style={{ color: "#e5e5ea" }}>89 major market events</span> — Fed decisions, tariff shocks, AI launches, IPOs, earnings, and more. Every correlation, pattern, and causal signal in one place.
          </p>

          {/* KPI hero cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 12, maxWidth: 780 }}>
            {[
              { badge:"DATASET",   label:"Trading Days",        val:"857",    sub:"Jan 2023 – Jun 2026",             accent: C.blue   },
              { badge:"INSIGHT",   label:"Event-Day Volatility", val:"2.55×",  sub:"vs normal days (σ 2.15% vs 0.84%)", accent: C.green  },
              { badge:"RECORD",    label:"Best Single Day",      val:"+12.1%", sub:"Apr 9 2025 — 90-day tariff pause", accent: C.cyan   },
              { badge:"EDGE",      label:"Monday vs Thursday",   val:"+0.40%", sub:"best vs worst day of week spread", accent: C.orange },
            ].map(k => (
              <div key={k.label} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderTop:`2px solid ${k.accent}`, borderRadius:14, padding:"16px 18px" }}>
                <span style={{ fontSize:9, fontWeight:800, color:k.accent, letterSpacing:"0.1em", background:k.accent+"18", border:`1px solid ${k.accent}30`, borderRadius:4, padding:"2px 6px", display:"inline-block", marginBottom:10 }}>{k.badge}</span>
                <div className="mono" style={{ fontSize:28, fontWeight:800, color:"#f5f5f7", lineHeight:1, marginBottom:6 }}>{k.val}</div>
                <div style={{ fontSize:11, color:"#8e8e93", fontWeight:600, marginBottom:3 }}>{k.label}</div>
                <div style={{ fontSize:11, color:"#6e6e73" }}>{k.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════ STICKY NAV ════ */}
      <div className="nav-glass" style={{ position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:1140, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", gap:4, height:52, overflowX:"auto" }}>
          {SECTIONS.map(sec => (
            <button key={sec} onClick={() => { setActiveSection(sec); document.getElementById("dash-content")?.scrollIntoView({behavior:"smooth"}); }} style={{
              color: activeSection === sec ? "#f5f5f7" : "#8e8e93",
              background: activeSection === sec ? "rgba(255,255,255,0.1)" : "transparent",
              border:"none", padding:"5px 14px", borderRadius:20, fontSize:12,
              fontWeight:600, letterSpacing:"0.02em", cursor:"pointer",
              fontFamily:"inherit", whiteSpace:"nowrap", transition:"all 0.15s",
            }}>{sec}</button>
          ))}
          <div style={{ flex:1 }} />
          <span style={{ fontSize:11, color:"#6e6e73", whiteSpace:"nowrap" }}>QQQ · SPY · NDX · 2023–2026</span>
        </div>
      </div>

      {/* ════ MAIN CONTENT ════ */}
      <div id="dash-content" style={{ maxWidth:1140, margin:"0 auto", padding:"32px 24px 100px" }}>

        {/* ── Persistent stat row ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12, marginBottom:28 }}>
          <StatChip label="Total Days"      val={s.total_days}                           accent={C.blue}   sub="Jan 2023 – Jun 2026" />
          <StatChip label="Event Days"      val={s.event_days}                           accent={C.blue}   sub={`${((s.event_days/s.total_days)*100).toFixed(1)}% of sessions`} />
          <StatChip label="Avg Return/Day"  val={fmtPct(s.avg_all,3)}                    accent={s.avg_all>=0?C.green:C.red} />
          <StatChip label="Event-Day Vol"   val={s.vol_event.toFixed(2)+"%"}             accent={C.orange} sub="annualized σ" />
          <StatChip label="Normal-Day Vol"  val={s.vol_non_event.toFixed(2)+"%"}         accent={C.cyan}   sub={`${(s.vol_event/s.vol_non_event).toFixed(2)}× lower`} />
          <StatChip label="Best Day (QQQ)"  val={"+"+s.best.qqq.toFixed(2)+"%"}          accent={C.green}  sub={s.best.date} />
          <StatChip label="Worst Day (QQQ)" val={s.worst.qqq.toFixed(2)+"%"}             accent={C.red}    sub={s.worst.date} />
          <StatChip label="±2%+ Days"       val={s.big_moves}                            accent={C.orange} sub={`${((s.big_moves/s.total_days)*100).toFixed(1)}% of days`} />
        </div>

        {/* ════════════════════════════════════
            SECTION: OVERVIEW
        ════════════════════════════════════ */}
        {activeSection === "Overview" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* Cumulative Return */}
            <Card accent={C.blue} style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Cumulative Open→Close Return: QQQ vs SPY</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20, lineHeight:1.5 }}>
                Sum of daily open-to-close returns since Jan 2, 2023. Not total return (excludes overnight gaps & dividends) — measures pure intraday directional alpha. QQQ has accumulated <span style={{ color:C.blue, fontWeight:700 }}>{fmtPct((CUM_THIN as Array<{qqq:number}>).at(-1)?.qqq ?? 0, 1)}</span> of intraday gains vs SPY&apos;s <span style={{ color:C.orange, fontWeight:700 }}>{fmtPct((CUM_THIN as Array<{spy:number}>).at(-1)?.spy ?? 0, 1)}</span>.
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={CUM_THIN as object[]} margin={{ top:4, right:8, bottom:4, left:8 }}>
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
              </ResponsiveContainer>
            </Card>

            {/* Distribution + Streaks */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }} className="two-col">

              {/* Distribution histogram */}
              <Card accent={C.cyan} style={{ padding:24 }}>
                <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Daily Return Distribution</div>
                <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>Histogram of QQQ open→close returns across all 857 sessions. The market is modestly positively skewed — more large-up days than large-down days, but the fat left tail hits harder.</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={DISTRIBUTION as object[]} margin={{ top:4, right:8, bottom:4, left:8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="range" tick={{ fill:C.dim, fontSize:10 }} />
                    <YAxis tick={{ fill:C.dim, fontSize:11 }} label={{ value:"Days", angle:-90, position:"insideLeft", fill:C.dim, fontSize:11 }} />
                    <Tooltip {...CHART_TOOLTIP} formatter={(v:unknown) => [v as number, "Trading Days"]} />
                    <Bar dataKey="count" radius={[4,4,0,0]}>
                      {(DISTRIBUTION as Array<{range:string;count:number}>).map(b => (
                        <Cell key={b.range} fill={b.range.startsWith(">") || b.range.startsWith("0") || b.range.startsWith("1") || b.range.startsWith("2") || b.range.startsWith("3") ? C.green : C.red} fillOpacity={0.82} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Streak records + year comparison */}
              <Card accent={C.green} style={{ overflow:"hidden" }}>
                <CardHeader title="Records & Milestones" sub="Notable streaks, extremes, and structural stats from 857 sessions" />
                <div style={{ padding:"0 0 4px" }}>
                  {[
                    { label:"Longest Win Streak",  val:`${streaks.up.len} days`,     sub:`${streaks.up.start} → ${streaks.up.end}`,   color:C.green  },
                    { label:"Longest Loss Streak", val:`${streaks.down.len} days`,   sub:`${streaks.down.start} → ${streaks.down.end}`, color:C.red   },
                    { label:"Best Day Ever",        val:fmtPct(s.best.qqq,2),        sub:`${s.best.date} · Trump tariff pause`,         color:C.green  },
                    { label:"Worst Day Ever",       val:fmtPct(s.worst.qqq,2),       sub:`${s.worst.date} · China 104% tariff`,         color:C.red    },
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
                        <th key={h} style={{ padding:"10px 20px", textAlign:"left", color:C.dim, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(BY_YEAR as Array<{year:string;avg:number;vol:number;count:number;up:number;down:number;best:number;worst:number}>).map((y,i) => (
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

          </div>
        )}

        {/* ════════════════════════════════════
            SECTION: TIME PATTERNS
        ════════════════════════════════════ */}
        {activeSection === "Time Patterns" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* Day of week + Monthly side by side */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }} className="two-col">

              <Card accent={C.blue} style={{ padding:24 }}>
                <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Avg Return by Day of Week</div>
                <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>
                  Monday leads by a wide margin (+0.23%). Thursday is the only day averaging negative returns (−0.17%). The Mon–Thu spread is the most reliable day-of-week edge in the dataset.
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={BY_DOW as object[]} margin={{ top:4, right:8, bottom:4, left:8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="day" tick={{ fill:C.dim, fontSize:12 }} />
                    <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v => fmtPct(v,2)} />
                    <Tooltip {...CHART_TOOLTIP} formatter={(v:unknown) => [fmtPct(v as number,4), "Avg QQQ Return"]} />
                    <ReferenceLine y={0} stroke={C.dim} strokeWidth={1} />
                    <Bar dataKey="avg" radius={[5,5,0,0]}>
                      {(BY_DOW as Array<{day:string;avg:number}>).map(d => (
                        <Cell key={d.day} fill={d.avg>=0?C.blue:C.red} fillOpacity={d.day==="Mon"?0.95:d.day==="Thu"?0.95:0.65} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6 }}>
                  {(BY_DOW as Array<{day:string;avg:number;up:number;count:number;vol:number}>).map(d => (
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
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={BY_MONTH as object[]} margin={{ top:4, right:8, bottom:4, left:8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="month" tick={{ fill:C.dim, fontSize:10 }} />
                    <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v => fmtPct(v,2)} />
                    <Tooltip {...CHART_TOOLTIP} formatter={(v:unknown) => [fmtPct(v as number,4), "Avg QQQ Return"]} />
                    <ReferenceLine y={0} stroke={C.dim} strokeWidth={1} />
                    <Bar dataKey="avg" radius={[4,4,0,0]}>
                      {(BY_MONTH as Array<{month:string;avg:number}>).map(m => (
                        <Cell key={m.month} fill={m.avg>=0?C.cyan:C.red} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Calendar heatmap */}
            <Card accent={C.green} style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Daily Return Calendar Heatmap — All 857 Sessions</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>Each square = one trading day. Green = positive open→close, Red = negative. Intensity scales with magnitude. April 2025 is visually unmistakable — the tariff shock week followed by the +12% recovery.</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:16 }}>
                {(CALENDAR as Array<{ym:string;days:Array<{date:string;qqq:number;et?:string;en?:string}>}>).map(({ ym, days }) => (
                  <div key={ym} style={{ minWidth:0 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:C.dim, letterSpacing:"0.06em", marginBottom:5 }}>{ym.slice(2).replace("-","'")}</div>
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
              <div style={{ marginTop:16, display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ fontSize:11, color:C.dim }}>Outlined squares = annotated events</div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:`rgba(52,199,89,0.9)` }} />
                  <span style={{ fontSize:11, color:C.dim }}>Strong up (&gt;3%)</span>
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:`rgba(255,59,48,0.9)` }} />
                  <span style={{ fontSize:11, color:C.dim }}>Strong down (&lt;−3%)</span>
                </div>
              </div>
            </Card>

            {/* Monthly YM heatmap grid */}
            <Card accent={C.orange} style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Monthly Average Daily Return — Year × Month Grid</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>Avg daily QQQ return per calendar month. Quickly spot which months in which years drove or hurt performance.</div>
              {(() => {
                const years = Array.from(new Set((BY_YM as Array<{year:string}>).map(r => r.year))).sort();
                const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                const ym_map = Object.fromEntries((BY_YM as Array<{ym:string;avg:number;count:number}>).map(r => [r.ym, r]));
                return (
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ borderCollapse:"collapse", fontSize:12, width:"100%" }}>
                      <thead>
                        <tr>
                          <th style={{ padding:"6px 12px", textAlign:"left", color:C.dim, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>Year</th>
                          {months.map(m=>(
                            <th key={m} style={{ padding:"6px 10px", textAlign:"center", color:C.dim, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" }}>{m}</th>
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

          </div>
        )}

        {/* ════════════════════════════════════
            SECTION: EVENT INTELLIGENCE
        ════════════════════════════════════ */}
        {activeSection === "Event Intel" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* Avg return by type */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }} className="two-col">
              <Card accent={C.blue} style={{ padding:24 }}>
                <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Avg QQQ Return by Event Type</div>
                <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>AI and Banking Crisis events are surprisingly bullish on average. Macro data and Geopolitical events are the most reliably negative catalysts for QQQ.</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[...TYPE_STATS as object[]].sort((a:object,b:object)=>(b as {avg:number}).avg-(a as {avg:number}).avg)} margin={{ top:4, right:8, bottom:4, left:8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="type" tick={{ fill:C.dim, fontSize:10 }} />
                    <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v => fmtPct(v,2)} />
                    <Tooltip {...CHART_TOOLTIP} formatter={(v:unknown) => [fmtPct(v as number,3), "Avg QQQ Return"]} />
                    <ReferenceLine y={0} stroke={C.dim} strokeWidth={1} />
                    <Bar dataKey="avg" radius={[5,5,0,0]}>
                      {([...TYPE_STATS as Array<{type:string;avg:number}>].sort((a,b)=>b.avg-a.avg)).map(ts=>(
                        <Cell key={ts.type} fill={ts.avg>=0?(TYPE_META[ts.type]?.color??C.blue):C.red} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card accent={C.green} style={{ overflow:"hidden" }}>
                <CardHeader title="Win Rate & Volatility by Event Type" sub="Does knowing the event type tell you which way QQQ will go?" />
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.08)" }}>
                        {["Type","Events","Avg Return","Win Rate","Volatility σ"].map(h=>(
                          <th key={h} style={{ padding:"9px 16px", textAlign:"left", color:C.dim, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {([...TYPE_STATS as Array<{type:string;avg:number;count:number;up:number;down:number;vol:number}>].sort((a,b)=>b.avg-a.avg)).map((ts,i)=>{
                        const m = TYPE_META[ts.type];
                        const wr = (ts.up/ts.count)*100;
                        return (
                          <tr key={ts.type} className="tr-hover" style={{ borderBottom:"1px solid rgba(0,0,0,0.04)", background:i%2===0?"transparent":"rgba(0,0,0,0.01)" }}>
                            <td style={{ padding:"10px 16px" }}>
                              <span style={{ fontSize:11, fontWeight:700, color:m?.color??C.blue, background:(m?.color??C.blue)+"15", border:`1px solid ${(m?.color??C.blue)}30`, borderRadius:20, padding:"2px 8px" }}>{ts.type}</span>
                            </td>
                            <td className="mono" style={{ padding:"10px 16px", color:C.dim }}>{ts.count}</td>
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
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={PRE_POST_WIDE as object[]} margin={{ top:4, right:8, bottom:4, left:8 }}>
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
              </ResponsiveContainer>
            </Card>

            {/* QQQ-SPY spread */}
            <Card accent={C.orange} style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>QQQ − SPY Spread by Event Type</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>
                Positive spread = tech (QQQ) outperformed the broad market (SPY). AI and Earnings events drive the strongest tech outperformance. Macro and Geopolitical events trigger rotation away from tech into defensives, closing the spread.
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={SPREAD_BY_TYPE as object[]} margin={{ top:4, right:8, bottom:4, left:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="type" tick={{ fill:C.dim, fontSize:10 }} />
                  <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v => fmtPct(v,2)} />
                  <Tooltip {...CHART_TOOLTIP} formatter={(v:unknown) => [fmtPct(v as number,3), "QQQ−SPY Spread"]} />
                  <ReferenceLine y={0} stroke={C.dim} strokeWidth={1} />
                  <Bar dataKey="avg" radius={[5,5,0,0]}>
                    {(SPREAD_BY_TYPE as Array<{type:string;avg:number}>).map(d=>(
                      <Cell key={d.type} fill={d.avg>=0?(TYPE_META[d.type]?.color??C.blue):C.red} fillOpacity={0.82} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Top event impact days */}
            <Card accent={C.red} style={{ overflow:"hidden" }}>
              <CardHeader title="Top 20 Biggest Event-Driven Moves" sub="Largest absolute QQQ moves on annotated event days — both directions" />
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.08)" }}>
                      {["#","Date","QQQ","SPY","Type","Event"].map(h=>(
                        <th key={h} style={{ padding:"10px 16px", textAlign:"left", color:C.dim, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(TOP_EVENT_DAYS as Array<{date:string;qqq:number;spy:number|null;et:string;en:string;ed:string}>).map((r,i)=>{
                      const m = TYPE_META[r.et];
                      return (
                        <tr key={r.date} className="tr-hover" style={{ borderBottom:"1px solid rgba(0,0,0,0.04)", background:i%2===0?"transparent":"rgba(0,0,0,0.01)", borderLeft:`3px solid ${m?.color??C.dim}` }}>
                          <td className="mono" style={{ padding:"10px 16px", color:C.faint, fontSize:11 }}>{i+1}</td>
                          <td className="mono" style={{ padding:"10px 16px", color:C.dim, whiteSpace:"nowrap" }}>{r.date}</td>
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
                { color:"#ff2d55", title:"Banking crisis days average +0.96% — a counterintuitive positive", body:"Markets front-run FDIC/Fed backstop announcements faster than the initial panic. SVB's closure weekend was already partially priced by Monday open; the BTFP facility announcement drove a relief rally. Bailout speed matters more than the crisis itself." },
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

          </div>
        )}

        {/* ════════════════════════════════════
            SECTION: TRENDS
        ════════════════════════════════════ */}
        {activeSection === "Trends" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* Rolling volatility */}
            <Card accent={C.orange} style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>30-Day Rolling Volatility (Annualized)</div>
              <div style={{ fontSize:13, color:C.dim, marginBottom:20, lineHeight:1.5 }}>
                Annualized volatility computed from daily open→close returns over a 30-day rolling window. Spikes correspond directly to tariff shock weeks (April 2025), Japan carry-trade unwind (August 2024), and DeepSeek (January 2025). The 2023 baseline ≈ 12–15% annualized; April 2025 peak exceeded 50%.
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={ROLLING_VOL as object[]} margin={{ top:4, right:8, bottom:4, left:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" tick={{ fill:C.dim, fontSize:10 }} tickFormatter={v => (v as string).slice(2,7).replace("-","'")} interval={39} />
                  <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip {...CHART_TOOLTIP} labelFormatter={v=>`Date: ${v}`} formatter={(v:unknown)=>[`${(v as number).toFixed(1)}%`, "Annualized Vol"]} />
                  <Line type="monotone" dataKey="vol" stroke={C.orange} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Volatility event breakdown + Year avg vol */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }} className="two-col">
              <Card accent={C.cyan} style={{ padding:24 }}>
                <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>Volatility on Event vs Normal Days</div>
                <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>2.55× — the core quantitative finding of this entire dataset.</div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {[
                    { label:"Event Days (89 sessions)", vol: s.vol_event, color:C.orange, n:s.event_days, pct:"9.5%" },
                    { label:"Non-Event Days (768 sessions)", vol:s.vol_non_event, color:C.blue, n:s.total_days - s.event_days, pct:"90.5%" },
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
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={BY_YEAR as object[]} margin={{ top:4, right:8, bottom:4, left:8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="year" tick={{ fill:C.dim, fontSize:12 }} />
                    <YAxis tick={{ fill:C.dim, fontSize:11 }} tickFormatter={v=>`${v}%`} />
                    <Tooltip {...CHART_TOOLTIP} formatter={(v:unknown)=>[`${(v as number).toFixed(3)}%`, "Daily Vol σ"]} />
                    <Bar dataKey="vol" radius={[5,5,0,0]}>
                      {(BY_YEAR as Array<{year:string;vol:number}>).map(y=>(
                        <Cell key={y.year} fill={y.vol>1?C.red:y.vol>0.9?C.orange:C.blue} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ marginTop:12, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                  {(BY_YEAR as Array<{year:string;avg:number;vol:number;up:number;count:number}>).map(y=>(
                    <div key={y.year} style={{ textAlign:"center", background:"rgba(0,0,0,0.03)", borderRadius:8, padding:"8px 6px" }}>
                      <div style={{ fontSize:11, fontWeight:700, color:C.dim }}>{y.year}</div>
                      <div className="mono" style={{ fontSize:11, fontWeight:700, color:y.vol>1?C.red:C.dim }}>σ {y.vol.toFixed(2)}%</div>
                      <div style={{ fontSize:10, color:C.faint }}>{((y.up/y.count)*100).toFixed(0)}% up</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

          </div>
        )}

        {/* ════════════════════════════════════
            SECTION: TIMELINE
        ════════════════════════════════════ */}
        {activeSection === "Timeline" && (
          <div>
            {/* Filters */}
            <Card style={{ padding:"16px 20px", marginBottom:16, borderTop:`2px solid ${C.blue}` }}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                {["ALL","2026","2025","2024","2023"].map(y=>(
                  <button key={y} onClick={()=>{setYearFilter(y==="2025"?"2025":y==="2026"?"2025–26":y);setPage(0);}} style={{
                    padding:"5px 12px", borderRadius:20, border:`1px solid ${yearFilter===y||(y==="2026"&&yearFilter==="2025–26")||(y==="2025"&&yearFilter==="2025")?C.blue:"rgba(0,0,0,0.12)"}`,
                    background: (yearFilter==="ALL"&&y==="ALL")||(yearFilter==="2025–26"&&(y==="2025"||y==="2026"))||(yearFilter===y) ? C.blue+"12":"transparent",
                    color: (yearFilter===y||(yearFilter==="2025–26"&&(y==="2025"||y==="2026"))) ? C.blue:C.dim,
                    fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                  }}>{y}</button>
                ))}
                <div style={{ width:1, height:20, background:"rgba(0,0,0,0.1)", margin:"0 4px" }} />
                {Object.entries(TYPE_META).map(([et,m])=>(
                  <button key={et} onClick={()=>{setEvTypeFilter(evTypeFilter===et?"ALL":et);setPage(0);}} style={{
                    padding:"4px 10px", borderRadius:20, fontSize:11,
                    border:`1px solid ${evTypeFilter===et?m.color:"rgba(0,0,0,0.10)"}`,
                    background: evTypeFilter===et?m.color+"12":"transparent",
                    color: evTypeFilter===et?m.color:C.dim, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                  }}>{m.label}</button>
                ))}
                <div style={{ width:1, height:20, background:"rgba(0,0,0,0.1)", margin:"0 4px" }} />
                <button onClick={()=>{setEvOnly(!evOnly);setPage(0);}} style={{
                  padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:600,
                  border:`1px solid ${evOnly?C.blue:"rgba(0,0,0,0.12)"}`,
                  background:evOnly?C.blue+"12":"transparent",
                  color:evOnly?C.blue:C.dim, cursor:"pointer", fontFamily:"inherit",
                }}>Events Only</button>
                <button onClick={()=>{setExtremeOnly(!extremeOnly);setPage(0);}} style={{
                  padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:600,
                  border:`1px solid ${extremeOnly?C.red:"rgba(0,0,0,0.12)"}`,
                  background:extremeOnly?C.red+"12":"transparent",
                  color:extremeOnly?C.red:C.dim, cursor:"pointer", fontFamily:"inherit",
                }}>±2%+ Only</button>
                <input placeholder="Search date or event…" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} style={{
                  padding:"5px 12px", borderRadius:20, border:"1px solid rgba(0,0,0,0.12)",
                  fontSize:12, outline:"none", fontFamily:"inherit", color:C.text, background:"#f5f5f7", width:200,
                }} />
                <div style={{ marginLeft:"auto", fontSize:12, color:C.dim, fontWeight:600 }}>{filtered.length} days</div>
              </div>
            </Card>

            {/* Table */}
            <Card style={{ overflow:"hidden", borderTop:`2px solid ${C.blue}` }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.08)" }}>
                    {["Date","Event Type","QQQ","SPY","NDX","QQQ−SPY","Event"].map(h=>(
                      <th key={h} style={{ padding:"10px 16px", textAlign:"left", color:C.dim, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>{h}</th>
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
                        <td className="mono" style={{ padding:"9px 16px", color:C.dim, fontSize:12, whiteSpace:"nowrap" }}>{row.date}</td>
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
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:48, paddingTop:24, borderTop:"1px solid rgba(0,0,0,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div style={{ fontSize:11, color:C.faint }}>Data: Yahoo Finance · Open→Close intraday return · Not adjusted for dividends or overnight gaps · For informational use only</div>
          <div style={{ display:"flex", gap:20 }}>
            <a href="https://x.com/Trace_Cohen" target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:C.dim, textDecoration:"none", fontWeight:600 }}>@Trace_Cohen</a>
            <a href="mailto:t@nyvp.com" style={{ fontSize:12, color:C.dim, textDecoration:"none", fontWeight:600 }}>t@nyvp.com</a>
          </div>
        </div>
      </div>

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
        .nav-glass{background:rgba(0,0,0,0.78);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,0.06);}
        @media(max-width:680px){.two-col{grid-template-columns:1fr !important;}}
      `}</style>
    </div>
  );
}
