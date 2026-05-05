import { useGetDashboardSummary, useGetAgentPerformance } from "@workspace/api-client-react";
import { motion } from "framer-motion";

export default function Missions() {
  const { data: summary } = useGetDashboardSummary();
  const { data: performance } = useGetAgentPerformance();

  const avgPerf = performance && performance.length > 0
    ? Math.round(performance.reduce((acc, p) => acc + p.avgProgress, 0) / performance.length)
    : 0;

  const missions = [
    { id: 1, icon: "◉", title: "Reach $5,000 Revenue", current: 3840, target: 5000, unit: "$", color: "#4dff9b", xp: 500, rewards: ["AGENT UNLOCK: ORACLE", "COMMANDER BADGE", "+200 XP"] },
    { id: 2, icon: "🚀", title: "Launch 10 Products", current: 7, target: 10, unit: "", color: "#4d7fff", xp: 300, rewards: ["BUILDER UNLOCK"] },
    { id: 3, icon: "👥", title: "Get 1,000 Users", current: 342, target: 1000, unit: "", color: "#4df0d8", xp: 400, rewards: ["GROWTH BADGE"] },
    { id: 4, icon: "</>", title: "Deploy 3 Contracts", current: summary?.totalStations ?? 1, target: 3, unit: "", color: "#ffb84d", xp: 250, rewards: ["DEV BADGE"], locked: (summary?.totalAgents ?? 0) < 2 },
    { id: 5, icon: "★", title: "Reach 90% Agent Perf.", current: avgPerf, target: 90, unit: "%", color: "#9b6dff", xp: 1000, rewards: ["ELITE BADGE"], locked: (summary?.tasksCompletedToday ?? 0) < 5 },
  ];

  const revenueHistory = [2100, 2400, 2850, 3100, 3400, 3600, 3840];
  const maxRev = 5000;

  const mono = { fontFamily: "'Space Mono', monospace" };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* MAIN MISSIONS */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 18 }}>🏆</span>
          <div style={{
            flex: 1,
            background: "var(--ae-surface)",
            border: "2px solid #ffb84d",
            padding: "10px 18px",
            boxShadow: "0 0 20px rgba(255,184,77,0.3)",
            position: "relative",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 10, height: 10, borderTop: "2px solid #ffd700", borderLeft: "2px solid #ffd700" }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderBottom: "2px solid #ffd700", borderRight: "2px solid #ffd700" }} />
            <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 11, color: "#ffb84d", letterSpacing: "0.04em", textShadow: "0 0 12px rgba(255,184,77,0.6)" }}>
              ACTIVE MISSIONS
            </span>
            <span style={{ ...mono, fontSize: 9, color: "var(--ae-muted)", marginLeft: 12 }}>⏳ {missions.filter(m => !m.locked && m.current < m.target).length} in progress</span>
          </div>
          <button style={{
            background: "var(--ae-surface)", border: "1px solid var(--ae-border)", padding: 4,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--ae-muted)", lineHeight: 1,
          }}>
            <span style={{ ...mono, fontSize: 10 }}>✕</span>
          </button>
        </div>

        {/* Mission list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {missions.map((m, i) => {
            const isComplete = m.current >= m.target;
            const isLocked = m.locked;
            const progress = Math.min(100, Math.round((m.current / m.target) * 100));
            const displayVal = m.unit === "$" ? `$${m.current.toLocaleString()}` : `${m.current}${m.unit}`;
            const displayTarget = m.unit === "$" ? `$${m.target.toLocaleString()}` : `${m.target}${m.unit}`;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  background: isComplete ? `${m.color}14` : "var(--ae-surface)",
                  border: `1px solid ${isComplete ? m.color + "55" : isLocked ? "var(--ae-border)" : "var(--ae-border)"}`,
                  padding: "14px 16px",
                  opacity: isLocked ? 0.4 : 1,
                  position: "relative",
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `2px solid ${m.color}`, borderLeft: `2px solid ${m.color}` }} />
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderBottom: `2px solid ${m.color}`, borderRight: `2px solid ${m.color}` }} />

                {/* Icon */}
                <div style={{
                  width: 36, height: 36, flexShrink: 0,
                  background: `${m.color}18`,
                  border: `1px solid ${m.color}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  ...mono, fontSize: 14, color: m.color,
                }}>{m.icon}</div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...mono, fontWeight: 700, fontSize: 12, color: isComplete ? m.color : "var(--ae-text)", marginBottom: 6 }}>
                    {isComplete && <span style={{ color: m.color }}>✓ </span>}
                    {m.title}
                    <span style={{ ...mono, fontSize: 9, color: "var(--ae-muted)", marginLeft: 10, fontWeight: 400 }}>{progress}%</span>
                  </div>
                  {!isLocked ? (
                    <>
                      <div style={{ height: 12, background: "var(--ae-border)", position: "relative", marginBottom: 4, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${progress}%`,
                          background: isComplete ? m.color : `linear-gradient(to right, ${m.color}aa, ${m.color})`,
                          boxShadow: `0 0 8px ${m.color}60`,
                          transition: "width 1s",
                          position: "relative",
                        }}>
                          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.5)" }} />
                        </div>
                      </div>
                      <div style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", textAlign: "center" }}>
                        <span style={{ color: m.color }}>{displayVal}</span> / {displayTarget}
                      </div>
                    </>
                  ) : (
                    <div style={{ ...mono, fontSize: 8, color: "var(--ae-dim)", letterSpacing: "0.08em" }}>[ LOCKED — COMPLETE PREVIOUS MISSION ]</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Rewards footer */}
        <div style={{ marginTop: 16, padding: "14px 16px", background: "var(--ae-surface)", border: "1px solid var(--ae-border)" }}>
          <div style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.12em", marginBottom: 10 }}>REWARDS</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 22 }}>⭐</span>
              <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: "#ffd700", textShadow: "0 0 10px rgba(255,215,0,0.7)" }}>+500 XP</span>
            </div>
            {["🤖 AGENT UNLOCK: ORACLE", "🛡️ COMMANDER BADGE", "⭐ +200 XP"].map(r => (
              <div key={r} style={{
                ...mono, fontSize: 8, padding: "4px 10px",
                border: "1px solid var(--ae-border)",
                color: "var(--ae-muted)",
                background: "rgba(0,0,0,0.3)",
              }}>{r}</div>
            ))}
          </div>
        </div>

        {/* Bottom XP bar */}
        <div style={{ height: 8, background: "var(--ae-border)", marginTop: 16, position: "relative" }}>
          <div style={{
            height: "100%",
            width: "76%",
            background: "linear-gradient(to right, var(--ae-cyan), var(--ae-violet))",
            boxShadow: "0 0 8px rgba(77,240,216,0.5)",
            transition: "width 1s",
          }} />
        </div>
      </div>

      {/* RIGHT: STATION STATS */}
      <div style={{ width: 220, flexShrink: 0, borderLeft: "1px solid var(--ae-border)", background: "rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--ae-border)" }}>
          <span style={{ ...mono, fontSize: 8, color: "var(--ae-cyan)", letterSpacing: "0.12em" }}>STATION STATS</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Revenue bar chart */}
          <div>
            <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 8 }}>TOTAL REVENUE (7 Days)</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 70, border: "1px solid var(--ae-border)", padding: 6, background: "rgba(0,0,0,0.2)" }}>
              {revenueHistory.map((v, i) => {
                const pct = (v / maxRev) * 100;
                const isLast = i === revenueHistory.length - 1;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                    <div style={{
                      width: "100%",
                      height: `${pct}%`,
                      background: isLast ? "var(--ae-green)" : i % 2 === 0 ? "var(--ae-cyan)" : "var(--ae-violet)",
                      boxShadow: isLast ? "0 0 6px var(--ae-green)" : "none",
                      transition: "height 0.8s",
                    }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent efficiency radar (simplified) */}
          <div>
            <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 8 }}>AGENT EFFICIENCY</div>
            <div style={{ border: "1px solid var(--ae-border)", padding: 8, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="90" height="90" viewBox="0 0 100 100">
                <polygon points="50,10 90,35 90,65 50,90 10,65 10,35" fill="none" stroke="var(--ae-border)" strokeWidth="1" />
                <polygon points="50,25 75,37.5 75,62.5 50,75 25,62.5 25,37.5" fill="none" stroke="var(--ae-border)" strokeWidth="0.5" />
                <polygon points="50,40 62.5,46.25 62.5,53.75 50,60 37.5,53.75 37.5,46.25" fill="none" stroke="var(--ae-border)" strokeWidth="0.5" />
                <polygon
                  points="50,18 82,38 78,68 50,82 22,68 28,38"
                  fill="rgba(77,240,216,0.15)"
                  stroke="var(--ae-cyan)"
                  strokeWidth="1.5"
                />
                <line x1="50" y1="10" x2="50" y2="90" stroke="var(--ae-border)" strokeWidth="0.5" />
                <line x1="10" y1="35" x2="90" y2="65" stroke="var(--ae-border)" strokeWidth="0.5" />
                <line x1="10" y1="65" x2="90" y2="35" stroke="var(--ae-border)" strokeWidth="0.5" />
              </svg>
            </div>
          </div>

          {/* Products launched */}
          <div style={{ border: "1px solid var(--ae-border)", padding: "10px 12px", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎆</span>
            <div>
              <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>PRODUCTS LAUNCHED</div>
              <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 12, color: "var(--ae-green)", textShadow: "0 0 8px rgba(77,255,155,0.6)", marginTop: 4 }}>45</div>
            </div>
          </div>

          {/* Summary stats */}
          {[
            { label: "ACTIVE STATIONS",  value: summary?.activeStations ?? 0,       color: "var(--ae-text)" },
            { label: "AGENTS ACTIVE",    value: summary?.activeAgents ?? 0,          color: "var(--ae-cyan)" },
            { label: "TASKS TODAY",      value: summary?.tasksCompletedToday ?? 0,   color: "var(--ae-blue)" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--ae-border)", paddingBottom: 6 }}>
              <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.08em" }}>{s.label}</span>
              <span style={{ ...mono, fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
