import { useState, useEffect } from "react";
import { useGetDashboardSummary, useGetAgentPerformance } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Star, Trophy, Zap, CheckCircle, TrendingUp, Users, Code, ChevronDown, BarChart2 } from "lucide-react";

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

export default function Missions() {
  const { data: summary } = useGetDashboardSummary();
  const { data: performance } = useGetAgentPerformance();
  const isMobile = useIsMobile();
  const [statsOpen, setStatsOpen] = useState(false);

  const avgPerf = performance && performance.length > 0
    ? Math.round(performance.reduce((acc, p) => acc + p.avgProgress, 0) / performance.length)
    : 0;

  const missions = [
    {
      id: 1, Icon: TrendingUp,
      title: "Reach $5,000 Revenue", current: 3840, target: 5000, unit: "$",
      color: "#4dff9b", xp: 500,
      rewards: ["AGENT UNLOCK: ORACLE", "COMMANDER BADGE", "+200 XP"],
      description: "Drive autonomous revenue to the next tier",
    },
    {
      id: 2, Icon: Zap,
      title: "Launch 10 Products", current: 7, target: 10, unit: "",
      color: "#4d7fff", xp: 300,
      rewards: ["BUILDER UNLOCK"],
      description: "Ship products across all builder nodes",
    },
    {
      id: 3, Icon: Users,
      title: "Get 1,000 Users", current: 342, target: 1000, unit: "",
      color: "#4df0d8", xp: 400,
      rewards: ["GROWTH BADGE"],
      description: "Expand your user base through growth loops",
    },
    {
      id: 4, Icon: Code,
      title: "Deploy 3 Contracts", current: summary?.totalStations ?? 1, target: 3, unit: "",
      color: "#ffb84d", xp: 250,
      rewards: ["DEV BADGE"],
      locked: (summary?.totalAgents ?? 0) < 2,
      description: "Deploy smart contracts to production",
    },
    {
      id: 5, Icon: Star,
      title: "Reach 90% Agent Perf.", current: avgPerf, target: 90, unit: "%",
      color: "#9b6dff", xp: 1000,
      rewards: ["ELITE BADGE"],
      locked: (summary?.tasksCompletedToday ?? 0) < 5,
      description: "Optimize crew for peak performance",
    },
  ];

  const revenueHistory = [2100, 2400, 2850, 3100, 3400, 3600, 3840];
  const maxRev = 5000;

  const mono = { fontFamily: "'Space Mono', monospace" };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", flexDirection: isMobile ? "column" : "row" }}>
      {/* MAIN MISSIONS */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "12px 14px" : "20px 24px", display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isMobile ? 12 : 20 }}>
          <div style={{
            flex: 1,
            background: "linear-gradient(90deg, rgba(255,184,77,0.1) 0%, rgba(255,215,0,0.06) 50%, rgba(0,0,0,0) 100%)",
            border: "1px solid #ffb84d",
            padding: isMobile ? "8px 12px" : "11px 18px",
            boxShadow: "0 0 24px rgba(255,184,77,0.25), inset 0 0 40px rgba(255,184,77,0.04)",
            position: "relative",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, borderTop: "2px solid #ffd700", borderLeft: "2px solid #ffd700" }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderBottom: "2px solid #ffd700", borderRight: "2px solid #ffd700" }} />
            <Trophy size={isMobile ? 14 : 18} style={{ color: "#ffd700", filter: "drop-shadow(0 0 6px #ffd70099)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: isMobile ? 8 : 10, color: "#ffb84d", letterSpacing: "0.04em", textShadow: "0 0 14px rgba(255,184,77,0.7)" }}>
                ACTIVE MISSIONS
              </span>
              <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginTop: 3, letterSpacing: "0.08em" }}>
                {missions.filter(m => !m.locked && m.current < m.target).length} IN PROGRESS · {missions.filter(m => m.current >= m.target).length} COMPLETED
              </div>
            </div>
            {/* Stats toggle — mobile only */}
            {isMobile && (
              <button
                onClick={() => setStatsOpen(v => !v)}
                style={{
                  background: statsOpen ? "rgba(77,240,216,0.12)" : "transparent",
                  border: `1px solid ${statsOpen ? "var(--ae-cyan)" : "var(--ae-border)"}`,
                  color: statsOpen ? "var(--ae-cyan)" : "var(--ae-muted)",
                  cursor: "pointer", padding: "4px 8px", display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
                }}
              >
                <BarChart2 size={11} />
                <span style={{ ...mono, fontSize: 6, letterSpacing: "0.08em" }}>STATS</span>
                <ChevronDown size={9} style={{ transform: statsOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>
            )}
          </div>
        </div>

        {/* Mission list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {missions.map((m, i) => {
            const isComplete = m.current >= m.target;
            const isLocked = m.locked;
            const progress = Math.min(100, Math.round((m.current / m.target) * 100));
            const displayVal = m.unit === "$" ? `$${m.current.toLocaleString()}` : `${m.current}${m.unit}`;
            const displayTarget = m.unit === "$" ? `$${m.target.toLocaleString()}` : `${m.target}${m.unit}`;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 28 }}
                className={!isLocked && !isComplete ? "mission-active" : ""}
                style={{
                  background: isComplete
                    ? `linear-gradient(135deg, ${m.color}14 0%, rgba(0,0,0,0.5) 100%)`
                    : "linear-gradient(135deg, rgba(15,17,24,0.95) 0%, rgba(10,11,15,0.98) 100%)",
                  border: `1px solid ${isComplete ? m.color + "66" : isLocked ? "var(--ae-border)" : m.color + "33"}`,
                  padding: "14px 16px",
                  opacity: isLocked ? 0.45 : 1,
                  position: "relative",
                  display: "flex", gap: 14, alignItems: "flex-start",
                  boxShadow: isComplete ? `0 0 20px ${m.color}22` : "none",
                }}
              >
                {/* Corner accents */}
                <div style={{ position: "absolute", top: 0, left: 0, width: 10, height: 10, borderTop: `2px solid ${m.color}`, borderLeft: `2px solid ${m.color}` }} />
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderBottom: `2px solid ${m.color}`, borderRight: `2px solid ${m.color}` }} />

                {/* Icon */}
                <div style={{
                  width: 44, height: 44, flexShrink: 0,
                  background: `${m.color}15`,
                  border: `1px solid ${m.color}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                  boxShadow: isComplete ? `0 0 12px ${m.color}44` : "none",
                }}>
                  {isLocked
                    ? <Lock size={18} style={{ color: "var(--ae-dim)" }} />
                    : isComplete
                    ? <CheckCircle size={18} style={{ color: m.color, filter: `drop-shadow(0 0 6px ${m.color})` }} />
                    : <m.Icon size={18} style={{ color: m.color, filter: `drop-shadow(0 0 4px ${m.color}88)` }} />
                  }
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ ...mono, fontWeight: 700, fontSize: 12, color: isComplete ? m.color : "var(--ae-text)" }}>
                      {m.title}
                    </span>
                    <span style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", fontWeight: 400 }}>{progress}%</span>
                    {isComplete && (
                      <span style={{ ...mono, fontSize: 7, padding: "1px 7px", background: `${m.color}22`, border: `1px solid ${m.color}`, color: m.color, letterSpacing: "0.08em" }}>
                        ✓ COMPLETE
                      </span>
                    )}
                  </div>

                  {m.description && (
                    <div style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", marginBottom: 8, letterSpacing: "0.04em" }}>{m.description}</div>
                  )}

                  {!isLocked ? (
                    <>
                      {/* Progress bar */}
                      <div className={!isComplete ? "progress-shimmer" : ""} style={{ height: 12, background: "var(--ae-border)", position: "relative", marginBottom: 5, overflow: "hidden" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.2, delay: i * 0.07 + 0.3, ease: "easeOut" }}
                          style={{
                            height: "100%",
                            background: isComplete ? m.color : `linear-gradient(to right, ${m.color}77, ${m.color})`,
                            boxShadow: `0 0 10px ${m.color}66`,
                            position: "relative",
                          }}
                        >
                          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.55)" }} />
                        </motion.div>
                        {/* Tick marks */}
                        {[25, 50, 75].map(tick => (
                          <div key={tick} style={{ position: "absolute", top: 0, bottom: 0, left: `${tick}%`, width: 1, background: "rgba(0,0,0,0.4)", zIndex: 2 }} />
                        ))}
                      </div>
                      <div style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", display: "flex", justifyContent: "space-between" }}>
                        <span><span style={{ color: m.color, fontWeight: 700 }}>{displayVal}</span> / {displayTarget}</span>
                        <span style={{ color: "#ffd700", fontSize: 7 }}>+{m.xp} XP</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ ...mono, fontSize: 8, color: "var(--ae-dim)", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 6 }}>
                      <Lock size={10} style={{ color: "var(--ae-dim)" }} />
                      LOCKED — COMPLETE PREVIOUS MISSION
                    </div>
                  )}
                </div>

                {/* XP badge */}
                {!isLocked && (
                  <div style={{
                    flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                    minWidth: 48,
                  }}>
                    <div style={{
                      fontFamily: "'Press Start 2P',monospace", fontSize: 8,
                      color: "#ffd700", textShadow: "0 0 8px rgba(255,215,0,0.5)",
                      padding: "4px 6px", border: "1px solid rgba(255,215,0,0.3)",
                      background: "rgba(255,215,0,0.06)", textAlign: "center",
                    }} className="xp-badge">
                      +{m.xp}<br />
                      <span style={{ fontSize: 6, color: "rgba(255,215,0,0.7)" }}>XP</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Rewards section */}
        <div style={{ marginTop: 14, padding: "14px 16px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--ae-border)", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 10, height: 10, borderTop: "2px solid #ffd700", borderLeft: "2px solid #ffd700" }} />
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderBottom: "2px solid #ffd700", borderRight: "2px solid #ffd700" }} />
          <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", marginBottom: 10 }}>REWARD POOL</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Star size={18} style={{ color: "#ffd700", filter: "drop-shadow(0 0 8px #ffd70088)" }} />
              <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: "#ffd700", textShadow: "0 0 12px rgba(255,215,0,0.6)" }}>+500 XP</span>
            </div>
            {["🤖 ORACLE AGENT", "🛡️ COMMANDER BADGE", "⭐ +200 XP"].map(r => (
              <div key={r} style={{
                ...mono, fontSize: 7, padding: "4px 12px",
                border: "1px solid var(--ae-border)",
                color: "var(--ae-muted)",
                background: "rgba(0,0,0,0.3)",
                letterSpacing: "0.06em",
              }}>{r}</div>
            ))}
          </div>
        </div>

        {/* Commander XP bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 7, color: "var(--ae-muted)", marginBottom: 5 }}>
            <span>COMMANDER XP</span>
            <span style={{ color: "var(--ae-cyan)" }}>7,600 / 10,000</span>
          </div>
          <div className="progress-shimmer" style={{ height: 8, background: "var(--ae-border)", position: "relative" }}>
            <div style={{
              height: "100%", width: "76%",
              background: "linear-gradient(to right, var(--ae-cyan), var(--ae-violet))",
              boxShadow: "0 0 10px rgba(77,240,216,0.4)",
              position: "relative",
            }}>
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.5)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: STATION STATS — side panel on desktop, collapsible on mobile */}
      <AnimatePresence>
      {(!isMobile || statsOpen) && (
      <motion.div
        initial={isMobile ? { height: 0, opacity: 0 } : false}
        animate={isMobile ? { height: "auto", opacity: 1 } : {}}
        exit={isMobile ? { height: 0, opacity: 0 } : {}}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        style={{
          width: isMobile ? "100%" : 224,
          flexShrink: 0,
          borderLeft: isMobile ? "none" : "1px solid var(--ae-border)",
          borderTop: isMobile ? "1px solid var(--ae-border)" : "none",
          background: "rgba(0,0,0,0.2)",
          display: "flex", flexDirection: "column",
          overflow: isMobile ? "visible" : "hidden",
        }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--ae-border)", display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 6, height: 6, background: "var(--ae-cyan)", boxShadow: "0 0 6px var(--ae-cyan)" }} />
          <span style={{ ...mono, fontSize: 8, color: "var(--ae-cyan)", letterSpacing: "0.12em" }}>STATION STATS</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Revenue bar chart */}
          <div>
            <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 8 }}>REVENUE 7-DAY</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 72, border: "1px solid var(--ae-border)", padding: 6, background: "rgba(0,0,0,0.2)", position: "relative" }}>
              <div style={{ position: "absolute", bottom: 6, left: 6, right: 6, top: 6, background: "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(77,240,216,0.04) 19px, rgba(77,240,216,0.04) 20px)" }} />
              {revenueHistory.map((v, i) => {
                const pct = (v / maxRev) * 100;
                const isLast = i === revenueHistory.length - 1;
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.9, delay: i * 0.08 + 0.2, ease: "easeOut" }}
                    style={{
                      flex: 1,
                      background: isLast ? "var(--ae-green)" : i % 2 === 0 ? "var(--ae-cyan)" : "var(--ae-violet)",
                      boxShadow: isLast ? "0 0 8px var(--ae-green)" : "none",
                      alignSelf: "flex-end",
                      position: "relative", zIndex: 1,
                    }}
                  >
                    {isLast && <div style={{ position: "absolute", top: -4, left: 0, right: 0, height: 2, background: "var(--ae-green)", boxShadow: "0 0 8px var(--ae-green)" }} />}
                  </motion.div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ ...mono, fontSize: 6, color: "var(--ae-dim)" }}>7D AGO</span>
              <span style={{ ...mono, fontSize: 6, color: "var(--ae-green)" }}>$3,840</span>
            </div>
          </div>

          {/* Agent efficiency radar */}
          <div>
            <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 8 }}>AGENT EFFICIENCY</div>
            <div style={{ border: "1px solid var(--ae-border)", padding: 8, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="96" height="96" viewBox="0 0 100 100">
                <polygon points="50,10 90,35 90,65 50,90 10,65 10,35" fill="none" stroke="var(--ae-border)" strokeWidth="1" />
                <polygon points="50,25 75,37.5 75,62.5 50,75 25,62.5 25,37.5" fill="none" stroke="var(--ae-border)" strokeWidth="0.5" />
                <polygon points="50,40 62.5,46.25 62.5,53.75 50,60 37.5,53.75 37.5,46.25" fill="none" stroke="var(--ae-border)" strokeWidth="0.5" />
                <polygon
                  points="50,15 85,37 80,68 50,85 20,68 25,37"
                  fill="rgba(77,240,216,0.12)"
                  stroke="var(--ae-cyan)"
                  strokeWidth="1.5"
                />
                <line x1="50" y1="10" x2="50" y2="90" stroke="var(--ae-border)" strokeWidth="0.5" />
                <line x1="10" y1="35" x2="90" y2="65" stroke="var(--ae-border)" strokeWidth="0.5" />
                <line x1="10" y1="65" x2="90" y2="35" stroke="var(--ae-border)" strokeWidth="0.5" />
                <circle cx="50" cy="15" r="2.5" fill="var(--ae-cyan)" />
                <circle cx="85" cy="37" r="2.5" fill="var(--ae-cyan)" />
                <circle cx="80" cy="68" r="2.5" fill="var(--ae-cyan)" />
                <circle cx="50" cy="85" r="2.5" fill="var(--ae-cyan)" />
                <circle cx="20" cy="68" r="2.5" fill="var(--ae-cyan)" />
                <circle cx="25" cy="37" r="2.5" fill="var(--ae-cyan)" />
              </svg>
            </div>
          </div>

          {/* Products launched */}
          <div style={{
            border: "1px solid var(--ae-border)", padding: "10px 12px",
            background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 10,
            position: "relative",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 6, height: 6, borderTop: "2px solid var(--ae-green)", borderLeft: "2px solid var(--ae-green)" }} />
            <Zap size={18} style={{ color: "var(--ae-amber)", filter: "drop-shadow(0 0 6px rgba(255,184,77,0.6))" }} />
            <div>
              <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>PRODUCTS LAUNCHED</div>
              <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14, color: "var(--ae-green)", textShadow: "0 0 10px rgba(77,255,155,0.6)", marginTop: 4 }}>45</div>
            </div>
          </div>

          {/* Summary stats */}
          {[
            { label: "ACTIVE STATIONS",  value: summary?.activeStations ?? 0,      color: "var(--ae-text)" },
            { label: "AGENTS ACTIVE",    value: summary?.activeAgents ?? 0,         color: "var(--ae-cyan)" },
            { label: "TASKS TODAY",      value: summary?.tasksCompletedToday ?? 0,  color: "var(--ae-blue)" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--ae-border)", paddingBottom: 7 }}>
              <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.08em" }}>{s.label}</span>
              <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 13, fontWeight: 700, color: s.color, textShadow: `0 0 8px ${s.color}66` }}>{s.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
