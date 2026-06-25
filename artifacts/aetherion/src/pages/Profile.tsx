import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount, useBalance, useDisconnect, useChainId } from "wagmi";
import { base } from "viem/chains";
import { formatUnits } from "viem";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, LogOut, Wallet, Zap, Users, Star, Trophy, TrendingUp, Shield, Target, ChevronUp, ChevronDown, Save, BarChart2 } from "lucide-react";
import { useListStations, useGetDashboardSummary } from "@workspace/api-client-react";

const mono  = { fontFamily: "'Space Mono', monospace" };
const pixel = { fontFamily: "'Press Start 2P', monospace" };

const ROLE_COLORS: Record<string, string> = {
  research:  "#4df0d8",
  strategy:  "#9b6dff",
  builder:   "#4d7fff",
  content:   "#ffb84d",
  growth:    "#4dff9b",
  analytics: "#ff4d6d",
  design:    "#ff9bde",
};

const ALL_ROLES = ["research", "strategy", "builder", "content", "growth", "analytics", "design"];

function getRank(totalRevenue: number): { label: string; color: string; next: string; nextThreshold: number } {
  if (totalRevenue >= 5_000_000) return { label: "WARLORD",   color: "#ffd700", next: "MAX",       nextThreshold: 5_000_000 };
  if (totalRevenue >= 1_000_000) return { label: "ADMIRAL",   color: "#ff4d6d", next: "WARLORD",   nextThreshold: 5_000_000 };
  if (totalRevenue >= 500_000)   return { label: "COMMANDER", color: "#9b6dff", next: "ADMIRAL",   nextThreshold: 1_000_000 };
  if (totalRevenue >= 100_000)   return { label: "OPERATIVE", color: "#4d7fff", next: "COMMANDER", nextThreshold: 500_000 };
  if (totalRevenue >= 10_000)    return { label: "AGENT",     color: "#4dff9b", next: "OPERATIVE", nextThreshold: 100_000 };
  return                                { label: "ROOKIE",    color: "#4df0d8", next: "AGENT",     nextThreshold: 10_000 };
}

type StationData = { id: number; name: string; revenue?: number; activeAgents?: number; agentCount?: number; status?: string };

// ─── 7-day sparkline SVG ─────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const W = 220, H = 36, pad = 4;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - (v / max) * (H - pad * 2);
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${pad},${H} ${polyline} ${W - pad},${H}`}
        fill="url(#sg)"
      />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (W - pad * 2);
        const y = H - pad - (v / max) * (H - pad * 2);
        return <circle key={i} cx={x} cy={y} r={2.5} fill={color} />;
      })}
    </svg>
  );
}

export default function Profile() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { data: ethBalance } = useBalance({ address, chainId: base.id });
  const { data: stations } = useListStations();
  const { data: summary } = useGetDashboardSummary();

  const [copiedAddr, setCopiedAddr] = useState(false);

  // ─── History + directives data ───────────────────────────────────────────
  const { data: historyData } = useQuery<{
    history: Array<{ date: string; count: number }>;
    roleBreakdown: Record<string, number>;
  }>({
    queryKey: ["/api/commander/history"],
    queryFn: () => fetch("/api/commander/history").then(r => r.json()),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const { data: directivesData } = useQuery<Array<{ role: string; weight: number }>>({
    queryKey: ["/api/commander/directives"],
    queryFn: () => fetch("/api/commander/directives").then(r => r.json()),
    staleTime: 30_000,
  });

  // Local directive state for editing
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [savingDir, setSavingDir] = useState(false);
  const [savedDir, setSavedDir] = useState(false);

  useEffect(() => {
    if (directivesData) {
      const w: Record<string, number> = {};
      for (const d of directivesData) w[d.role] = d.weight;
      setWeights(w);
    }
  }, [directivesData]);

  async function saveDirectives() {
    setSavingDir(true);
    try {
      await fetch("/api/commander/directives", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directives: ALL_ROLES.map(r => ({ role: r, weight: weights[r] ?? 50 })) }),
      });
      setSavedDir(true);
      setTimeout(() => setSavedDir(false), 2000);
    } finally {
      setSavingDir(false);
    }
  }

  // ─── Rank computation ─────────────────────────────────────────────────────
  const typedStations = (stations ?? []) as StationData[];
  const totalRevenue  = typedStations.reduce((sum, s) => sum + (s.revenue ?? 0), 0);
  const rank          = getRank(totalRevenue);
  const rankProgress  = rank.label === "WARLORD"
    ? 100
    : Math.min(100, Math.round((totalRevenue / rank.nextThreshold) * 100));

  const isBase = chainId === base.id;
  const summ   = summary as { totalAgents?: number; activeAgents?: number; tasksCompletedToday?: number; totalStations?: number } | undefined;

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    }).catch(() => {});
  }

  function shortAddr(addr: string) { return addr.slice(0, 6) + "..." + addr.slice(-4); }

  const ACHIEVEMENTS = [
    { id: "first_station",  label: "FIRST STATION",  desc: "Deploy your first Space Station", icon: Zap,        color: "#4df0d8", unlocked: (summ?.totalStations ?? 0) >= 1 },
    { id: "ten_agents",     label: "10 AGENTS",       desc: "Hire 10 AI crew members",         icon: Users,      color: "#4dff9b", unlocked: (summ?.totalAgents ?? 0) >= 10 },
    { id: "hundred_tasks",  label: "CENTURY TASKS",   desc: "Complete 100 tasks in a day",     icon: Star,       color: "#ffb84d", unlocked: (summ?.tasksCompletedToday ?? 0) >= 100 },
    { id: "three_stations", label: "FLEET COMMAND",   desc: "Run 3 stations simultaneously",   icon: Shield,     color: "#9b6dff", unlocked: (summ?.totalStations ?? 0) >= 3 },
    { id: "100k_revenue",   label: "$100K CLUB",      desc: "Earn $100,000 total revenue",     icon: TrendingUp, color: "#4d7fff", unlocked: totalRevenue >= 100_000 },
    { id: "1m_revenue",     label: "MILLIONAIRE",     desc: "Earn $1,000,000 total revenue",   icon: Trophy,     color: "#ffd700", unlocked: totalRevenue >= 1_000_000 },
  ];

  const historyValues   = (historyData?.history ?? []).map(d => d.count);
  const historyDates    = (historyData?.history ?? []).map(d => d.date.slice(5)); // MM-DD
  const roleBreakdown   = historyData?.roleBreakdown ?? {};
  const maxRoleCount    = Math.max(...Object.values(roleBreakdown), 1);

  const dirWeightsDirty = directivesData
    ? directivesData.some(d => weights[d.role] !== d.weight)
    : false;

  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 48px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28,
          padding: "14px 18px", background: "linear-gradient(90deg,rgba(155,109,255,0.08),rgba(0,0,0,0))",
          border: "1px solid var(--ae-border)", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, borderTop: "2px solid var(--ae-violet)", borderLeft: "2px solid var(--ae-violet)" }} />
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderBottom: "2px solid var(--ae-violet)", borderRight: "2px solid var(--ae-violet)" }} />
          <Wallet size={18} style={{ color: "var(--ae-violet)", filter: "drop-shadow(0 0 6px var(--ae-violet))" }} />
          <div>
            <div style={{ ...pixel, fontSize: 10, color: "var(--ae-violet)", letterSpacing: "0.04em" }}>COMMANDER PROFILE</div>
            <div style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", marginTop: 4 }}>Wallet status, performance history, and strategic directives.</div>
          </div>
        </div>

        {/* Commander Card */}
        <div style={{ marginBottom: 20, border: `1px solid ${rank.color}44`, background: `${rank.color}08`, padding: "18px 20px", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 10, height: 10, borderTop: `2px solid ${rank.color}`, borderLeft: `2px solid ${rank.color}` }} />
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderBottom: `2px solid ${rank.color}`, borderRight: `2px solid ${rank.color}` }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", marginBottom: 6 }}>COMMANDER RANK</div>
              <div style={{ ...pixel, fontSize: 16, color: rank.color, letterSpacing: "0.04em", textShadow: `0 0 18px ${rank.color}66` }}>
                {rank.label}
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { label: "REVENUE",   value: `$${totalRevenue.toLocaleString()}`, color: "#4dff9b" },
                { label: "AGENTS",    value: String(summ?.totalAgents ?? 0),      color: "var(--ae-cyan)" },
                { label: "STATIONS",  value: String(summ?.totalStations ?? 0),    color: "var(--ae-violet)" },
                { label: "TASKS/DAY", value: String(summ?.tasksCompletedToday ?? 0), color: "var(--ae-amber)" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ ...mono, fontSize: 12, color: s.color, fontWeight: 700 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
          {rank.label !== "WARLORD" ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ ...mono, fontSize: 6, color: "var(--ae-muted)" }}>{rank.label}</span>
                <span style={{ ...mono, fontSize: 6, color: rank.color }}>{rankProgress}% → {rank.next}</span>
              </div>
              <div style={{ height: 4, background: "var(--ae-bg)", border: `1px solid ${rank.color}33` }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${rankProgress}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{ height: "100%", background: rank.color, boxShadow: `0 0 8px ${rank.color}80` }} />
              </div>
              <div style={{ ...mono, fontSize: 6, color: "var(--ae-dim)", marginTop: 4 }}>
                ${(rank.nextThreshold - totalRevenue).toLocaleString()} revenue until next rank
              </div>
            </div>
          ) : (
            <div style={{ ...mono, fontSize: 7, color: rank.color, textShadow: `0 0 10px ${rank.color}` }}>★ MAX RANK ACHIEVED ★</div>
          )}
        </div>

        {/* ─── Performance History ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 20, border: "1px solid var(--ae-border)", padding: "16px 18px" }}>
          <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <BarChart2 size={11} /> PERFORMANCE HISTORY
          </div>

          {/* 7-day sparkline */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ ...mono, fontSize: 6, color: "var(--ae-dim)", letterSpacing: "0.08em", marginBottom: 8 }}>TASKS COMPLETED — LAST 7 DAYS</div>
            <div style={{ position: "relative" }}>
              <Sparkline data={historyValues} color="#4dff9b" />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {historyDates.map((d, i) => (
                  <span key={i} style={{ ...mono, fontSize: 6, color: "var(--ae-dim)" }}>{d}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
              <div>
                <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", marginBottom: 2 }}>7-DAY TOTAL</div>
                <div style={{ ...mono, fontSize: 13, color: "#4dff9b", fontWeight: 700 }}>
                  {historyValues.reduce((a, b) => a + b, 0)}
                </div>
              </div>
              <div>
                <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", marginBottom: 2 }}>DAILY AVG</div>
                <div style={{ ...mono, fontSize: 13, color: "var(--ae-cyan)", fontWeight: 700 }}>
                  {historyValues.length ? Math.round(historyValues.reduce((a, b) => a + b, 0) / historyValues.length) : 0}
                </div>
              </div>
              <div>
                <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", marginBottom: 2 }}>PEAK DAY</div>
                <div style={{ ...mono, fontSize: 13, color: "var(--ae-violet)", fontWeight: 700 }}>
                  {Math.max(...historyValues, 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Role breakdown bars */}
          <div>
            <div style={{ ...mono, fontSize: 6, color: "var(--ae-dim)", letterSpacing: "0.08em", marginBottom: 8 }}>TASKS BY ROLE — ALL TIME</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ALL_ROLES.filter(r => r !== "design" || (roleBreakdown["design"] ?? 0) > 0).map(role => {
                const count = roleBreakdown[role] ?? 0;
                const pct   = maxRoleCount > 0 ? Math.round((count / maxRoleCount) * 100) : 0;
                const c     = ROLE_COLORS[role] ?? "#fff";
                return (
                  <div key={role}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ ...mono, fontSize: 7, color: c }}>{role.toUpperCase()}</span>
                      <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)" }}>{count}</span>
                    </div>
                    <div style={{ height: 4, background: "var(--ae-bg)", border: `1px solid ${c}22` }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ height: "100%", background: c, boxShadow: `0 0 5px ${c}60` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Strategic Directives ────────────────────────────────────────── */}
        <div style={{ marginBottom: 20, border: "1px solid var(--ae-border)", padding: "16px 18px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: 6 }}>
              <Target size={11} /> STRATEGIC DIRECTIVES
            </div>
            <button
              onClick={saveDirectives}
              disabled={savingDir || !dirWeightsDirty}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 12px",
                background: savedDir ? "#4dff9b1a" : "transparent",
                border: `1px solid ${savedDir ? "#4dff9b" : dirWeightsDirty ? "var(--ae-violet)" : "var(--ae-border)"}`,
                color: savedDir ? "#4dff9b" : dirWeightsDirty ? "var(--ae-violet)" : "var(--ae-muted)",
                cursor: dirWeightsDirty ? "pointer" : "default",
                ...mono, fontSize: 7, letterSpacing: "0.06em",
                transition: "all 0.2s",
                opacity: dirWeightsDirty || savedDir ? 1 : 0.4,
              }}
            >
              <Save size={9} />
              {savingDir ? "SAVING..." : savedDir ? "SAVED ✓" : "SAVE"}
            </button>
          </div>
          <div style={{ ...mono, fontSize: 7, color: "var(--ae-dim)", marginBottom: 14, lineHeight: 1.7 }}>
            Set task priority weights for each agent role. Higher weight = agents start tasks more frequently (0 = paused, 50 = normal, 100 = 2× rate).
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ALL_ROLES.map(role => {
              const w   = weights[role] ?? 50;
              const c   = ROLE_COLORS[role] ?? "#fff";
              const pct = w;
              const label = w === 0 ? "PAUSED" : w < 30 ? "LOW" : w < 70 ? "NORMAL" : w < 90 ? "HIGH" : "MAX";
              return (
                <div key={role}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 7, height: 7, background: c, boxShadow: `0 0 5px ${c}` }} />
                      <span style={{ ...mono, fontSize: 8, color: c, letterSpacing: "0.06em" }}>{role.toUpperCase()}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ ...mono, fontSize: 6, color: w === 0 ? "var(--ae-red)" : w >= 90 ? "var(--ae-amber)" : "var(--ae-muted)", letterSpacing: "0.08em" }}>
                        {label}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <button onClick={() => setWeights(p => ({ ...p, [role]: Math.min(100, (p[role] ?? 50) + 5) }))}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", padding: "1px 4px", lineHeight: 1 }}>
                          <ChevronUp size={8} />
                        </button>
                        <button onClick={() => setWeights(p => ({ ...p, [role]: Math.max(0, (p[role] ?? 50) - 5) }))}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", padding: "1px 4px", lineHeight: 1 }}>
                          <ChevronDown size={8} />
                        </button>
                      </div>
                      <span style={{ ...mono, fontSize: 10, color: c, fontWeight: 700, minWidth: 28, textAlign: "right" }}>{w}</span>
                    </div>
                  </div>
                  <div style={{ position: "relative", height: 6, background: "var(--ae-bg)", border: `1px solid ${c}22`, cursor: "ew-resize" }}
                    onClick={(e) => {
                      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                      const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      setWeights(p => ({ ...p, [role]: Math.round(pct * 100) }));
                    }}
                  >
                    <motion.div
                      animate={{ width: `${pct}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ height: "100%", background: c, boxShadow: `0 0 6px ${c}70`, pointerEvents: "none" }}
                    />
                    <div style={{
                      position: "absolute", top: "50%", left: `${pct}%`,
                      transform: "translate(-50%, -50%)",
                      width: 8, height: 8, background: c, border: "2px solid var(--ae-bg)",
                      boxShadow: `0 0 8px ${c}`,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wallet Section */}
        <div style={{ marginBottom: 20, border: "1px solid var(--ae-border)", padding: "16px 18px" }}>
          <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Wallet size={11} /> WALLET
          </div>
          {isConnected && address ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--ae-cyan)44" }}>
                <div style={{ flex: 1, padding: "10px 14px", ...mono, fontSize: 10, color: "var(--ae-text)", letterSpacing: "0.04em" }}>
                  {shortAddr(address)}
                </div>
                <button onClick={copyAddress} style={{
                  padding: "0 14px", background: "rgba(0,0,0,0.3)", border: "none",
                  borderLeft: "1px solid var(--ae-border)", cursor: "pointer",
                  color: copiedAddr ? "var(--ae-green)" : "var(--ae-muted)", height: 40,
                  display: "flex", alignItems: "center", gap: 5, ...mono, fontSize: 7, letterSpacing: "0.06em", transition: "color 0.15s",
                }}>
                  {copiedAddr ? <><Check size={11} /> COPIED</> : <><Copy size={11} /> COPY</>}
                </button>
                <button onClick={() => disconnect()} style={{
                  padding: "0 14px", background: "rgba(255,34,68,0.06)", border: "none",
                  borderLeft: "1px solid var(--ae-border)", cursor: "pointer", color: "var(--ae-red)",
                  height: 40, display: "flex", alignItems: "center", gap: 5, ...mono, fontSize: 7, letterSpacing: "0.06em",
                }}>
                  <LogOut size={11} /> DISCONNECT
                </button>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div>
                  <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 3 }}>ETH BALANCE</div>
                  <div style={{ ...mono, fontSize: 11, color: "var(--ae-text)", fontWeight: 700 }}>
                    {ethBalance ? parseFloat(formatUnits(ethBalance.value, ethBalance.decimals)).toFixed(4) : "0.0000"} ETH
                  </div>
                </div>
                <div>
                  <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 3 }}>NETWORK</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: isBase ? "var(--ae-green)" : "var(--ae-amber)", boxShadow: isBase ? "0 0 6px var(--ae-green)" : "0 0 6px var(--ae-amber)" }} />
                    <span style={{ ...mono, fontSize: 10, color: isBase ? "var(--ae-green)" : "var(--ae-amber)" }}>{isBase ? "BASE MAINNET" : "WRONG NETWORK"}</span>
                  </div>
                </div>
                <div>
                  <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 3 }}>$CTRL TOKEN</div>
                  <div style={{ ...mono, fontSize: 9, color: "var(--ae-dim)" }}>COMING ON TGE</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: "12px 0" }}>
              <div style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", marginBottom: 10 }}>No wallet connected.</div>
              <div style={{ ...mono, fontSize: 7, color: "var(--ae-dim)" }}>Connect your wallet from the top bar to link your identity on Base chain.</div>
            </div>
          )}
        </div>

        {/* Station Revenue Breakdown */}
        {typedStations.length > 0 && (
          <div style={{ marginBottom: 20, border: "1px solid var(--ae-border)", padding: "16px 18px" }}>
            <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={11} /> STATION REVENUE
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {typedStations.map((s, idx) => {
                const pct    = totalRevenue > 0 ? Math.round(((s.revenue ?? 0) / totalRevenue) * 100) : 0;
                const colors = ["var(--ae-cyan)", "var(--ae-violet)", "var(--ae-amber)", "var(--ae-green)", "var(--ae-red)"];
                const c      = colors[idx % colors.length];
                return (
                  <div key={s.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 6, height: 6, background: c, boxShadow: `0 0 5px ${c}` }} />
                        <span style={{ ...mono, fontSize: 9, color: "var(--ae-text)", fontWeight: 700 }}>{s.name}</span>
                        <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", padding: "1px 5px", border: "1px solid var(--ae-border)" }}>
                          {s.activeAgents ?? 0}/{s.agentCount ?? 0} AGENTS
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)" }}>{pct}%</span>
                        <span style={{ ...mono, fontSize: 11, color: c, fontWeight: 700 }}>${(s.revenue ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ height: 5, background: "var(--ae-bg)", border: "1px solid var(--ae-border)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.0, delay: idx * 0.15, ease: "easeOut" }}
                        style={{ height: "100%", background: c, boxShadow: `0 0 6px ${c}80` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--ae-border)", paddingTop: 8, marginTop: 4 }}>
                <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)" }}>TOTAL REVENUE</span>
                <span style={{ ...mono, fontSize: 13, color: "#4dff9b", fontWeight: 700, textShadow: "0 0 10px #4dff9b55" }}>${totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        <div style={{ border: "1px solid var(--ae-border)", padding: "16px 18px" }}>
          <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Trophy size={11} /> ACHIEVEMENTS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {ACHIEVEMENTS.map(a => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  padding: "12px 14px",
                  border: `1px solid ${a.unlocked ? a.color + "55" : "var(--ae-border)"}`,
                  background: a.unlocked ? `${a.color}0c` : "transparent",
                  opacity: a.unlocked ? 1 : 0.4,
                  position: "relative",
                }}
              >
                {a.unlocked && (
                  <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `2px solid ${a.color}`, borderLeft: `2px solid ${a.color}` }} />
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <a.icon size={12} style={{ color: a.unlocked ? a.color : "var(--ae-dim)", flexShrink: 0 }} />
                  <span style={{ ...pixel, fontSize: 6, color: a.unlocked ? a.color : "var(--ae-dim)", letterSpacing: "0.04em", lineHeight: 1.5 }}>{a.label}</span>
                </div>
                <div style={{ ...mono, fontSize: 7, color: "var(--ae-dim)", lineHeight: 1.6 }}>{a.desc}</div>
                {a.unlocked && <div style={{ ...mono, fontSize: 6, color: a.color, marginTop: 6 }}>✓ UNLOCKED</div>}
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
