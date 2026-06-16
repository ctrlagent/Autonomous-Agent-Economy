import { useState, useEffect } from "react";
import { useGetDashboardSummary, useGetAgentPerformance } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Star, Trophy, Zap, CheckCircle, TrendingUp, Users, Code, ChevronDown, BarChart2, RefreshCw, DollarSign, Shield, X } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp, Zap, Users, Code, Star,
};

interface Mission {
  id: number;
  title: string;
  description: string;
  iconName: string;
  color: string;
  target: number;
  current: number;
  unit: string;
  rewardXp: number;
  rewardAmount: number;
  rewardToken: string;
  status: "active" | "completed" | "locked";
  sortOrder: number;
}

interface EscrowInfo {
  missionId: number;
  status: "none" | "pending" | "deposited" | "proof_submitted" | "approved" | "refunded";
  amount: number;
  token: string;
  depositorAddress: string | null;
  agentAddress: string | null;
  proofHash: string | null;
  txHashDeposit: string | null;
  txHashRelease: string | null;
  simulated: boolean;
}

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
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [escrowMap, setEscrowMap] = useState<Record<number, EscrowInfo>>({});
  const [fundingMission, setFundingMission] = useState<Mission | null>(null);
  const [fundAmount, setFundAmount] = useState("100");
  const [fundLoading, setFundLoading] = useState(false);

  const avgPerf = performance && performance.length > 0
    ? Math.round(performance.reduce((acc: number, p: { avgProgress: number }) => acc + p.avgProgress, 0) / performance.length)
    : 0;

  async function fetchMissions() {
    try {
      const resp = await fetch("/api/missions");
      const data = await resp.json() as Mission[];
      setMissions(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function fetchEscrows() {
    try {
      const resp = await fetch("/api/escrow");
      const data = await resp.json() as EscrowInfo[];
      const map: Record<number, EscrowInfo> = {};
      data.forEach(e => { map[e.missionId] = e; });
      setEscrowMap(map);
    } catch { /* ignore */ }
  }

  async function fundBounty() {
    if (!fundingMission) return;
    const amount = parseInt(fundAmount);
    if (!amount || amount <= 0) return;
    setFundLoading(true);
    try {
      const resp = await fetch("/api/escrow/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId: fundingMission.id, amount }),
      });
      const data = await resp.json() as EscrowInfo;
      setEscrowMap(prev => ({ ...prev, [fundingMission.id]: data }));
      setFundingMission(null);
      setFundAmount("100");
    } catch { /* ignore */ }
    finally { setFundLoading(false); }
  }

  async function approveEscrow(missionId: number) {
    try {
      const resp = await fetch(`/api/escrow/approve/${missionId}`, { method: "POST" });
      const data = await resp.json() as EscrowInfo;
      setEscrowMap(prev => ({ ...prev, [missionId]: data }));
    } catch { /* ignore */ }
  }

  useEffect(() => { fetchMissions(); fetchEscrows(); }, []);

  // Auto-complete missions based on live data
  useEffect(() => {
    if (!missions.length || !summary) return;
    missions.forEach(m => {
      let liveValue = m.current;
      if (m.title.toLowerCase().includes("station") || m.title.toLowerCase().includes("contract")) {
        liveValue = summary.totalStations ?? m.current;
      } else if (m.title.toLowerCase().includes("agent")) {
        liveValue = summary.totalAgents ?? m.current;
      } else if (m.title.toLowerCase().includes("perf")) {
        liveValue = avgPerf;
      }
      if (liveValue !== m.current && Math.abs(liveValue - m.current) > 0.5) {
        updateMission(m.id, { current: liveValue });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary, avgPerf]);

  async function updateMission(id: number, patch: { current?: number; status?: string }) {
    try {
      const resp = await fetch(`/api/missions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const updated = await resp.json() as Mission;
      setMissions(prev => prev.map(m => m.id === updated.id ? updated : m));
    } catch { /* ignore */ }
  }

  const mono = { fontFamily: "'Space Mono', monospace" };

  const revMission = missions.find(m => m.unit === "$");
  const revenueHistory = revMission
    ? [
        Math.round(revMission.current * 0.55),
        Math.round(revMission.current * 0.62),
        Math.round(revMission.current * 0.71),
        Math.round(revMission.current * 0.80),
        Math.round(revMission.current * 0.88),
        Math.round(revMission.current * 0.94),
        Math.round(revMission.current),
      ]
    : [2100, 2400, 2850, 3100, 3400, 3600, 3840];
  const maxRev = revMission?.target ?? 5000;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", flexDirection: isMobile ? "column" : "row", position: "relative" }}>
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
                {missions.filter(m => m.status === "active" && m.current < m.target).length} IN PROGRESS · {missions.filter(m => m.status === "completed" || m.current >= m.target).length} COMPLETED
              </div>
            </div>
            <button onClick={() => { fetchMissions(); fetchEscrows(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", display: "flex", padding: 4 }}>
              <RefreshCw size={11} style={{ color: "var(--ae-muted)" }} />
            </button>
            {isMobile && (
              <button
                onClick={() => setStatsOpen(v => !v)}
                style={{
                  background: statsOpen ? "rgba(91,143,255,0.12)" : "transparent",
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
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, gap: 8 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ae-cyan)", animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {missions.map((m, i) => {
              const Icon = ICON_MAP[m.iconName] ?? TrendingUp;
              const isComplete = m.status === "completed" || m.current >= m.target;
              const isLocked = m.status === "locked";
              const progress = Math.min(100, Math.round((m.current / Math.max(1, m.target)) * 100));
              const displayVal = m.unit === "$" ? `$${Math.round(m.current).toLocaleString()}` : `${Math.round(m.current)}${m.unit}`;
              const displayTarget = m.unit === "$" ? `$${m.target.toLocaleString()}` : `${m.target}${m.unit}`;
              const escrowInfo = escrowMap[m.id];
              const escrowActive = escrowInfo && escrowInfo.status !== "none" && escrowInfo.status !== "refunded";
              const escrowAmount = escrowActive ? escrowInfo.amount : (m.rewardAmount ?? 0);

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 28 }}
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
                  <div style={{ position: "absolute", top: 0, left: 0, width: 10, height: 10, borderTop: `2px solid ${m.color}`, borderLeft: `2px solid ${m.color}` }} />
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderBottom: `2px solid ${m.color}`, borderRight: `2px solid ${m.color}` }} />

                  <div style={{
                    width: 44, height: 44, flexShrink: 0,
                    background: `${m.color}15`, border: `1px solid ${m.color}55`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: isComplete ? `0 0 12px ${m.color}44` : "none",
                  }}>
                    {isLocked
                      ? <Lock size={18} style={{ color: "var(--ae-dim)" }} />
                      : isComplete
                      ? <CheckCircle size={18} style={{ color: m.color, filter: `drop-shadow(0 0 6px ${m.color})` }} />
                      : <Icon size={18} style={{ color: m.color, filter: `drop-shadow(0 0 4px ${m.color}88)` }} />
                    }
                  </div>

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
                      {escrowInfo?.status === "deposited" && (
                        <span style={{ ...mono, fontSize: 6, padding: "1px 6px", background: "rgba(77,255,155,0.1)", border: "1px solid var(--ae-green)", color: "var(--ae-green)", letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <Shield size={8} /> ESCROW ACTIVE
                        </span>
                      )}
                      {escrowInfo?.status === "proof_submitted" && (
                        <span style={{ ...mono, fontSize: 6, padding: "1px 6px", background: "rgba(255,184,77,0.1)", border: "1px solid var(--ae-amber)", color: "var(--ae-amber)", letterSpacing: "0.06em" }}>
                          ◈ PROOF PENDING
                        </span>
                      )}
                      {escrowInfo?.status === "approved" && (
                        <span style={{ ...mono, fontSize: 6, padding: "1px 6px", background: "rgba(77,255,155,0.12)", border: "1px solid var(--ae-green)", color: "var(--ae-green)", letterSpacing: "0.06em" }}>
                          ✓ PAID OUT
                        </span>
                      )}
                    </div>
                    {m.description && (
                      <div style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", marginBottom: 8, letterSpacing: "0.04em" }}>{m.description}</div>
                    )}
                    {!isLocked ? (
                      <>
                        <div className={!isComplete ? "progress-shimmer" : ""} style={{ height: 12, background: "var(--ae-border)", position: "relative", marginBottom: 5, overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.2, delay: i * 0.07 + 0.3, ease: "easeOut" }}
                            style={{
                              height: "100%",
                              background: isComplete ? m.color : `linear-gradient(to right, ${m.color}77, ${m.color})`,
                              boxShadow: `0 0 10px ${m.color}66`,
                            }}
                          >
                            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.55)" }} />
                          </motion.div>
                          {[25, 50, 75].map(tick => (
                            <div key={tick} style={{ position: "absolute", top: 0, bottom: 0, left: `${tick}%`, width: 1, background: "rgba(0,0,0,0.4)", zIndex: 2 }} />
                          ))}
                        </div>
                        <div style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", display: "flex", justifyContent: "space-between" }}>
                          <span><span style={{ color: m.color, fontWeight: 700 }}>{displayVal}</span> / {displayTarget}</span>
                          <span style={{ color: "#ffd700", fontSize: 7 }}>+{m.rewardXp} XP</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ ...mono, fontSize: 8, color: "var(--ae-dim)", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 6 }}>
                        <Lock size={10} style={{ color: "var(--ae-dim)" }} />
                        LOCKED — COMPLETE PREVIOUS MISSION
                      </div>
                    )}
                  </div>

                  {!isLocked && (
                    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 56 }}>
                      <div style={{
                        fontFamily: "'Press Start 2P',monospace", fontSize: 8,
                        color: "#ffd700", textShadow: "0 0 8px rgba(255,215,0,0.5)",
                        padding: "4px 6px", border: "1px solid rgba(255,215,0,0.3)",
                        background: "rgba(255,215,0,0.06)", textAlign: "center",
                      }} className="xp-badge">
                        +{m.rewardXp}<br />
                        <span style={{ fontSize: 6, color: "rgba(255,215,0,0.7)" }}>XP</span>
                      </div>
                      {escrowAmount > 0 && (
                        <div style={{
                          fontFamily: "'Press Start 2P',monospace", fontSize: 7,
                          color: "#4dff9b", textShadow: "0 0 8px rgba(77,255,155,0.5)",
                          padding: "3px 5px", border: "1px solid rgba(77,255,155,0.35)",
                          background: "rgba(77,255,155,0.06)", textAlign: "center",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                        }}>
                          <DollarSign size={8} style={{ color: "#4dff9b" }} />
                          <span>{escrowAmount}</span>
                          <span style={{ fontSize: 5, color: "rgba(77,255,155,0.65)" }}>USDC</span>
                        </div>
                      )}
                      {!isComplete && !isLocked && (!escrowActive || escrowInfo?.status === "proof_submitted") && (
                        <button
                          onClick={() => {
                            if (escrowInfo?.status === "proof_submitted") {
                              approveEscrow(m.id);
                            } else {
                              setFundingMission(m);
                            }
                          }}
                          style={{
                            fontFamily: "'Press Start 2P',monospace", fontSize: 6,
                            background: escrowInfo?.status === "proof_submitted"
                              ? "rgba(77,255,155,0.12)"
                              : "rgba(91,143,255,0.08)",
                            border: `1px solid ${escrowInfo?.status === "proof_submitted" ? "var(--ae-green)" : "var(--ae-blue)"}`,
                            color: escrowInfo?.status === "proof_submitted" ? "var(--ae-green)" : "var(--ae-blue)",
                            cursor: "pointer", padding: "3px 5px", letterSpacing: "0.04em",
                            textAlign: "center", lineHeight: 1.4, width: "100%",
                            whiteSpace: "pre",
                          }}
                        >
                          {escrowInfo?.status === "proof_submitted" ? "APPROVE" : "FUND\nBOUNTY"}
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Rewards section */}
        <div style={{ marginTop: 14, padding: "14px 16px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--ae-border)", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 10, height: 10, borderTop: "2px solid #ffd700", borderLeft: "2px solid #ffd700" }} />
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderBottom: "2px solid #ffd700", borderRight: "2px solid #ffd700" }} />
          <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", marginBottom: 10 }}>REWARD POOL</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Star size={18} style={{ color: "#ffd700", filter: "drop-shadow(0 0 8px #ffd70088)" }} />
              <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: "#ffd700", textShadow: "0 0 12px rgba(255,215,0,0.6)" }}>
                +{missions.reduce((acc, m) => acc + m.rewardXp, 0)} XP
              </span>
            </div>
            {Object.values(escrowMap).filter(e => e.status !== "none" && e.status !== "refunded").length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <DollarSign size={16} style={{ color: "#4dff9b" }} />
                <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: "#4dff9b", textShadow: "0 0 12px rgba(77,255,155,0.6)" }}>
                  {Object.values(escrowMap).filter(e => e.status !== "none" && e.status !== "refunded").reduce((a, e) => a + e.amount, 0)} USDC
                </span>
              </div>
            )}
            {["🤖 ORACLE AGENT", "🛡️ COMMANDER BADGE", "⭐ ELITE RANK"].map(r => (
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
            <span style={{ color: "var(--ae-cyan)" }}>{missions.filter(m => m.status === "completed" || m.current >= m.target).length * 1000} / {missions.length * 1000}</span>
          </div>
          <div className="progress-shimmer" style={{ height: 8, background: "var(--ae-border)", position: "relative" }}>
            <div style={{
              height: "100%",
              width: `${missions.length ? (missions.filter(m => m.status === "completed" || m.current >= m.target).length / missions.length) * 100 : 0}%`,
              background: "linear-gradient(to right, var(--ae-cyan), var(--ae-violet))",
              boxShadow: "0 0 10px rgba(91,143,255,0.4)",
              position: "relative", transition: "width 1s",
            }}>
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.5)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: STATION STATS */}
      <AnimatePresence>
      {(!isMobile || statsOpen) && (
      <motion.div
        initial={isMobile ? { height: 0, opacity: 0 } : false}
        animate={isMobile ? { height: "auto", opacity: 1 } : {}}
        exit={isMobile ? { height: 0, opacity: 0 } : {}}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        style={{
          width: isMobile ? "100%" : 224, flexShrink: 0,
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
              <div style={{ position: "absolute", bottom: 6, left: 6, right: 6, top: 6, background: "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(91,143,255,0.04) 19px, rgba(91,143,255,0.04) 20px)" }} />
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
                      alignSelf: "flex-end", position: "relative", zIndex: 1,
                    }}
                  >
                    {isLast && <div style={{ position: "absolute", top: -4, left: 0, right: 0, height: 2, background: "var(--ae-green)", boxShadow: "0 0 8px var(--ae-green)" }} />}
                  </motion.div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ ...mono, fontSize: 6, color: "var(--ae-dim)" }}>7D AGO</span>
              <span style={{ ...mono, fontSize: 6, color: "var(--ae-green)" }}>${revenueHistory[revenueHistory.length - 1]?.toLocaleString()}</span>
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
                  points={`50,${15 + (100 - avgPerf) * 0.25} ${85 - avgPerf * 0.1},${37 - avgPerf * 0.05} ${80 + avgPerf * 0.05},${68 + avgPerf * 0.05} 50,${85 - avgPerf * 0.1} ${20 + avgPerf * 0.05},${68 + avgPerf * 0.05} ${25 - avgPerf * 0.1},${37 - avgPerf * 0.05}`}
                  fill="rgba(91,143,255,0.12)"
                  stroke="var(--ae-cyan)"
                  strokeWidth="1.5"
                />
                <line x1="50" y1="10" x2="50" y2="90" stroke="var(--ae-border)" strokeWidth="0.5" />
                <line x1="10" y1="35" x2="90" y2="65" stroke="var(--ae-border)" strokeWidth="0.5" />
                <line x1="10" y1="65" x2="90" y2="35" stroke="var(--ae-border)" strokeWidth="0.5" />
              </svg>
            </div>
            <div style={{ ...mono, fontSize: 7, color: "var(--ae-cyan)", textAlign: "center", marginTop: 4 }}>AVG PERF: {avgPerf}%</div>
          </div>

          {/* Summary stats */}
          {[
            { label: "ACTIVE STATIONS", value: summary?.activeStations ?? 0, color: "var(--ae-text)" },
            { label: "AGENTS ACTIVE", value: summary?.activeAgents ?? 0, color: "var(--ae-cyan)" },
            { label: "TASKS TODAY", value: summary?.tasksCompletedToday ?? 0, color: "var(--ae-blue)" },
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

      {/* FUND BOUNTY MODAL */}
      <AnimatePresence>
        {fundingMission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0, zIndex: 999,
              background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={() => setFundingMission(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: "var(--ae-surface)",
                border: "1px solid var(--ae-cyan)",
                padding: "24px 28px",
                width: 320, position: "relative",
                boxShadow: "0 0 40px rgba(77,240,216,0.2)",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, borderTop: "2px solid var(--ae-cyan)", borderLeft: "2px solid var(--ae-cyan)" }} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderBottom: "2px solid var(--ae-cyan)", borderRight: "2px solid var(--ae-cyan)" }} />
              <button
                onClick={() => setFundingMission(null)}
                style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)" }}
              >
                <X size={14} />
              </button>
              <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: "var(--ae-cyan)", marginBottom: 6, textShadow: "0 0 12px rgba(77,240,216,0.5)" }}>
                FUND BOUNTY
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--ae-muted)", marginBottom: 18 }}>
                {fundingMission.title}
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "var(--ae-muted)", marginBottom: 6, letterSpacing: "0.08em" }}>
                USDC AMOUNT
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                {[50, 100, 250, 500].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setFundAmount(String(amt))}
                    style={{
                      flex: 1, fontFamily: "'Press Start 2P',monospace", fontSize: 7,
                      background: fundAmount === String(amt) ? "rgba(77,240,216,0.15)" : "transparent",
                      border: `1px solid ${fundAmount === String(amt) ? "var(--ae-cyan)" : "var(--ae-border)"}`,
                      color: fundAmount === String(amt) ? "var(--ae-cyan)" : "var(--ae-muted)",
                      cursor: "pointer", padding: "5px 4px",
                    }}
                  >
                    {amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={fundAmount}
                onChange={e => setFundAmount(e.target.value)}
                placeholder="Custom amount"
                style={{
                  width: "100%", fontFamily: "'Space Mono',monospace", fontSize: 11,
                  background: "var(--ae-bg)", border: "1px solid var(--ae-border)",
                  color: "var(--ae-text)", padding: "8px 10px", outline: "none",
                  boxSizing: "border-box", marginBottom: 16,
                }}
              />
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "var(--ae-dim)", marginBottom: 16, letterSpacing: "0.04em", lineHeight: 1.6 }}>
                Funds locked in escrow · Released when mission approved · 2.5% protocol fee on release
                <span style={{ color: "var(--ae-amber)", display: "block", marginTop: 4 }}>
                  ⚠ SIMULATED MODE — no real USDC transferred
                </span>
              </div>
              <button
                onClick={fundBounty}
                disabled={fundLoading || !parseInt(fundAmount)}
                style={{
                  width: "100%", fontFamily: "'Press Start 2P',monospace", fontSize: 8,
                  background: fundLoading ? "rgba(77,127,255,0.1)" : "rgba(77,127,255,0.15)",
                  border: "1px solid var(--ae-blue)",
                  color: fundLoading ? "var(--ae-muted)" : "var(--ae-blue)",
                  cursor: fundLoading ? "not-allowed" : "pointer",
                  padding: "10px 16px", letterSpacing: "0.08em",
                }}
              >
                {fundLoading ? "PROCESSING..." : `DEPOSIT ${fundAmount || "0"} USDC`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
