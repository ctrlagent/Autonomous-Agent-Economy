import { useState } from "react";
import { useGetRecentActivity } from "@workspace/api-client-react";
import { motion } from "framer-motion";

const FILTERS = ["ALL", "REVENUE", "AGENTS", "ERRORS"];

const ROLE_HEX: Record<string, string> = {
  research:  "#4df0d8", strategy:  "#9b6dff", builder:   "#4d7fff",
  design:    "#ff4d9b", growth:    "#4dff9b", analytics: "#ff4d6d", content:   "#ffb84d",
};
function getRoleHex(role: string) { return ROLE_HEX[role?.toLowerCase()] ?? "#636b8a"; }

function formatTime(ts: string): string {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts.substring(0, 8);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch { return ts.substring(0, 5); }
}

export default function Timeline() {
  const [filter, setFilter] = useState("ALL");
  const { data: activity } = useGetRecentActivity({ limit: 50 });

  const filtered = (activity ?? []).filter(item => {
    if (filter === "ALL") return true;
    if (filter === "AGENTS") return item.agentName?.toLowerCase() !== "system";
    if (filter === "REVENUE") return item.action.toLowerCase().includes("revenue") || item.action.toLowerCase().includes("sale") || item.details?.toLowerCase().includes("$");
    if (filter === "ERRORS") return item.action.toLowerCase().includes("error") || item.action.toLowerCase().includes("fail");
    return true;
  });

  const mono = { fontFamily: "'Space Mono', monospace" };

  // activity heatmap data (mock grid)
  const heatGrid = Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: 24 }, (_, col) => {
      const v = Math.random();
      return v < 0.3 ? 0 : v < 0.6 ? 1 : v < 0.85 ? 2 : 3;
    })
  );
  const heatColors = ["var(--ae-border)", "var(--ae-cyan-dim)", "var(--ae-cyan)", "#a0fff4"];

  // events per hour bar chart (mock)
  const eventsPerHour = [2, 5, 3, 8, 12, 7, 4, 6, 9, 11, 8, 5, 3, 7, 10, 14, 8, 6, 4, 9, 13, 7, 5, 3];
  const maxEvents = Math.max(...eventsPerHour);

  // revenue 24h chart (mock)
  const rev24h = [100, 180, 120, 250, 310, 290, 340, 380, 360, 400, 420, 390, 450, 480, 510, 490, 530, 580, 540, 600, 620, 590, 640, 680];

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* LEFT: TIMELINE */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          flexShrink: 0, padding: "12px 20px 10px",
          borderBottom: "1px solid var(--ae-border)",
          background: "rgba(0,0,0,0.2)",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: "var(--ae-text)", letterSpacing: "0.04em" }}>⏱ TIMELINE</span>
            <span style={{ ...mono, fontSize: 8, color: "var(--ae-muted)" }}>
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}
            </span>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                ...mono, fontSize: 8, padding: "3px 10px",
                border: `1px solid ${filter === f ? (f === "ERRORS" ? "var(--ae-red)" : f === "REVENUE" ? "var(--ae-green)" : f === "AGENTS" ? "var(--ae-blue)" : "var(--ae-cyan)") : "var(--ae-border)"}`,
                background: filter === f ? "rgba(0,0,0,0.4)" : "transparent",
                color: filter === f ? (f === "ERRORS" ? "var(--ae-red)" : f === "REVENUE" ? "var(--ae-green)" : f === "AGENTS" ? "var(--ae-blue)" : "var(--ae-cyan)") : "var(--ae-muted)",
                cursor: "pointer", letterSpacing: "0.06em", transition: "all 0.15s",
              }}>[{f}]</button>
            ))}
          </div>
        </div>

        {/* Events */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px" }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 72, top: 0, bottom: 0, width: 1, background: "var(--ae-border)" }} />
            {filtered.map((item, i) => {
              const color = getRoleHex(item.agentRole);
              const isRevenue = item.action.toLowerCase().includes("revenue") || item.details?.toLowerCase().includes("$");
              const isError = item.action.toLowerCase().includes("error") || item.action.toLowerCase().includes("fail");
              const dotColor = isError ? "var(--ae-red)" : isRevenue ? "var(--ae-green)" : color;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.6) }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 0, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                >
                  <div style={{ width: 60, flexShrink: 0, textAlign: "right", paddingRight: 12, paddingTop: 2, ...mono, fontSize: 9, color: "var(--ae-dim)" }}>
                    {formatTime(item.timestamp)}
                  </div>
                  <div style={{ width: 24, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 4 }}>
                    {isError ? (
                      <div style={{ width: 10, height: 10, background: "var(--ae-red)", boxShadow: "0 0 6px var(--ae-red)", position: "relative", zIndex: 1 }}>
                        <div style={{ position: "absolute", inset: 2, background: "var(--ae-bg)" }} />
                      </div>
                    ) : (
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, boxShadow: `0 0 6px ${dotColor}`, border: "1px solid var(--ae-bg)", position: "relative", zIndex: 1 }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingLeft: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ ...mono, fontWeight: 700, fontSize: 11, color: dotColor }}>{item.agentName}:</span>
                      <span style={{ ...mono, fontSize: 10, color: "var(--ae-text)", opacity: 0.9 }}>
                        {item.action}
                        {item.details && <span style={{ color: "var(--ae-muted)" }}> — {item.details}</span>}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", padding: "40px 0", textAlign: "center" }}>
                NO EVENTS FOR FILTER: {filter}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: CHARTS */}
      <div style={{ width: 220, flexShrink: 0, borderLeft: "1px solid var(--ae-border)", background: "rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Revenue 24h */}
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--ae-border)" }}>
          <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 8 }}>Revenue 24h</div>
          <div style={{ height: 60, border: "1px solid var(--ae-border)", padding: 4, background: "rgba(0,0,0,0.3)", position: "relative" }}>
            <svg width="100%" height="100%" viewBox="0 0 192 52" preserveAspectRatio="none">
              <polyline
                points={rev24h.map((v, i) => `${(i / (rev24h.length - 1)) * 192},${52 - (v / 750) * 52}`).join(" ")}
                fill="none" stroke="var(--ae-cyan)" strokeWidth="1.5" />
              <polyline
                points={`0,52 ${rev24h.map((v, i) => `${(i / (rev24h.length - 1)) * 192},${52 - (v / 750) * 52}`).join(" ")} 192,52`}
                fill="rgba(77,240,216,0.08)" stroke="none" />
              {rev24h.map((v, i) => (
                <circle key={i} cx={(i / (rev24h.length - 1)) * 192} cy={52 - (v / 750) * 52} r={i === rev24h.length - 1 ? 2.5 : 1.5}
                  fill={i === rev24h.length - 1 ? "var(--ae-cyan)" : "var(--ae-blue)"} />
              ))}
            </svg>
          </div>
        </div>

        {/* Agent Activity heatmap */}
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--ae-border)" }}>
          <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 8 }}>Agent Activity</div>
          <div style={{ border: "1px solid var(--ae-border)", padding: 4, background: "rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {heatGrid.map((row, ri) => (
                <div key={ri} style={{ display: "flex", gap: 1 }}>
                  {row.slice(0, 16).map((v, ci) => (
                    <div key={ci} style={{ flex: 1, height: 7, background: heatColors[v], transition: "background 0.3s" }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Events per hour */}
        <div style={{ padding: "12px 14px", flex: 1 }}>
          <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 8 }}>Events per hour</div>
          <div style={{ height: 70, border: "1px solid var(--ae-border)", padding: "4px 4px 0", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "flex-end", gap: 1 }}>
            {eventsPerHour.slice(-16).map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                <div style={{
                  width: "100%",
                  height: `${(v / maxEvents) * 100}%`,
                  background: i === 15 ? "var(--ae-cyan)" : i % 2 === 0 ? "var(--ae-blue)" : "var(--ae-violet)",
                  boxShadow: i === 15 ? "0 0 4px var(--ae-cyan)" : "none",
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
