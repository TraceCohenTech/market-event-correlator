import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Market Event Correlator — QQQ · SPY · NDX Daily Returns";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "72px 80px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Blue orb */}
        <div style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,113,227,0.38) 0%, transparent 70%)",
          top: -250,
          left: -180,
          display: "flex",
        }} />
        {/* Cyan orb */}
        <div style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(90,200,250,0.22) 0%, transparent 70%)",
          top: -60,
          right: "0%",
          display: "flex",
        }} />

        {/* Badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(0,113,227,0.14)",
          border: "1px solid rgba(0,113,227,0.38)",
          borderRadius: 24,
          padding: "7px 18px",
          marginBottom: 28,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#0071e3", display: "flex" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0071e3", letterSpacing: "0.08em" }}>
            VALUEADD VC · MARKET INTELLIGENCE
          </span>
        </div>

        {/* Title */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: 18,
        }}>
          <span style={{ fontSize: 68, fontWeight: 900, color: "#f5f5f7", letterSpacing: "-0.03em", lineHeight: 1.0 }}>
            Market Event
          </span>
          <span style={{ fontSize: 68, fontWeight: 900, color: "#5ac8fa", letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            Correlator
          </span>
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 20,
          color: "#8e8e93",
          marginBottom: 44,
          lineHeight: 1.5,
          display: "flex",
        }}>
          857 trading days of QQQ, SPY &amp; NDX open→close returns annotated with 81 major market events
        </div>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { label: "Best Day Ever",   val: "+12.1%",  color: "#34c759", sub: "Apr 9, 2025" },
            { label: "Event Volatility", val: "2.55×",   color: "#ff9500", sub: "vs normal sessions" },
            { label: "AI Win Rate",     val: "89%",     color: "#5856d6", sub: "8 of 9 events positive" },
            { label: "Fed Decisions",   val: "7 / 7",   color: "#0071e3", sub: "perfect coin flip" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderTop: `2.5px solid ${s.color}`,
              borderRadius: 14,
              padding: "16px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              minWidth: 200,
            }}>
              <div style={{ fontSize: 11, color: "#6e6e73", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: s.color, fontFamily: "monospace", lineHeight: 1.1 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "#8e8e93" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Bottom right URL */}
        <div style={{
          position: "absolute",
          bottom: 36,
          right: 80,
          fontSize: 14,
          color: "#48484a",
          display: "flex",
          letterSpacing: "0.02em",
        }}>
          market-event-correlator.vercel.app · @Trace_Cohen
        </div>
      </div>
    ),
    { ...size }
  );
}
