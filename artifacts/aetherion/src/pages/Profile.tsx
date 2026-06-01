import { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useBalance, useDisconnect, useChainId } from "wagmi";
import { base } from "viem/chains";
import { formatUnits } from "viem";
import { Copy, Check, LogOut, Wallet, Zap, Users, Star, Trophy, TrendingUp, Shield } from "lucide-react";
import { useListStations, useGetDashboardSummary } from "@workspace/api-client-react";

const mono = { fontFamily: "'Space Mono', monospace" };
const pixel = { fontFamily: "'Press Start 2P', monospace" };

function getRank(totalRevenue: number): { label: string; color: string; next: string; nextThreshold: number } {
  if (totalRevenue >= 5_000_000) return { label: "WARLORD",    color: "#ffd700", next: "MAX",        nextThreshold: 5_000_000 };
  if (totalRevenue >= 1_000_000) return { label: "ADMIRAL",    color: "#ff4d6d", next: "WARLORD",    nextThreshold: 5_000_000 };
  if (totalRevenue >= 500_000)   return { label: "COMMANDER",  color: "#9b6dff", next: "ADMIRAL",    nextThreshold: 1_000_000 };
  if (totalRevenue >= 100_000)   return { label: "OPERATIVE",  color: "#4d7fff", next: "COMMANDER",  nextThreshold: 500_000 };
  if (totalRevenue >= 10_000)    return { label: "AGENT",      color: "#4dff9b", next: "OPERATIVE",  nextThreshold: 100_000 };
  return                                { label: "ROOKIE",     color: "#4df0d8", next: "AGENT",      nextThreshold: 10_000 };
}

type StationData = { id: number; name: string; revenue?: number; activeAgents?: number; agentCount?: number; status?: string };

export default function Profile() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { data: ethBalance } = useBalance({ address, chainId: base.id });
  const { data: stations } = useListStations();
  const { data: summary } = useGetDashboardSummary();

  const [copiedAddr, setCopiedAddr] = useState(false);

  const typedStations = (stations ?? []) as StationData[];
  const totalRevenue = typedStations.reduce((sum, s) => sum + (s.revenue ?? 0), 0);
  const rank = getRank(totalRevenue);
  const rankProgress = rank.label === "WARLORD"
    ? 100
    : Math.min(100, Math.round((totalRevenue / rank.nextThreshold) * 100));

  const isBase = chainId === base.id;

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    }).catch(() => {});
  }

  function shortAddr(addr: string) {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  const summ = summary as { totalAgents?: number; activeAgents?: number; tasksCompletedToday?: number; totalStations?: number } | undefined;

  const ACHIEVEMENTS = [
    { id: "first_station",  label: "FIRST STATION",  desc: "Deploy your first Space Station", icon: Zap,       color: "#4df0d8", unlocked: (summ?.totalStations ?? 0) >= 1 },
    { id: "ten_agents",     label: "10 AGENTS",       desc: "Hire 10 AI crew members",         icon: Users,     color: "#4dff9b", unlocked: (summ?.totalAgents ?? 0) >= 10 },
    { id: "hundred_tasks",  label: "CENTURY TASKS",   desc: "Complete 100 tasks in a day",     icon: Star,      color: "#ffb84d", unlocked: (summ?.tasksCompletedToday ?? 0) >= 100 },
    { id: "three_stations", label: "FLEET COMMAND",   desc: "Run 3 stations simultaneously",   icon: Shield,    color: "#9b6dff", unlocked: (summ?.totalStations ?? 0) >= 3 },
    { id: "100k_revenue",   label: "$100K CLUB",      desc: "Earn $100,000 total revenue",     icon: TrendingUp, color: "#4d7fff", unlocked: totalRevenue >= 100_000 },
    { id: "1m_revenue",     label: "MILLIONAIRE",     desc: "Earn $1,000,000 total revenue",   icon: Trophy,    color: "#ffd700", unlocked: totalRevenue >= 1_000_000 },
  ];

  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px 48px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28,
          padding: "14px 18px", background: "linear-gradient(90deg,rgba(155,109,255,0.08),rgba(0,0,0,0))",
          border: "1px solid var(--ae-border)", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, borderTop: "2px solid var(--ae-violet)", borderLeft: "2px solid var(--ae-violet)" }} />
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderBottom: "2px solid var(--ae-violet)", borderRight: "2px solid var(--ae-violet)" }} />
          <Wallet size={18} style={{ color: "var(--ae-violet)", filter: "drop-shadow(0 0 6px var(--ae-violet))" }} />
          <div>
            <div style={{ ...pixel, fontSize: 10, color: "var(--ae-violet)", letterSpacing: "0.04em" }}>COMMANDER PROFILE</div>
            <div style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", marginTop: 4 }}>Wallet status, revenue tracking, and achievements.</div>
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
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { label: "REVENUE",  value: `$${(totalRevenue).toLocaleString()}`, color: "#4dff9b" },
                { label: "AGENTS",   value: String(summ?.totalAgents ?? 0),          color: "var(--ae-cyan)" },
                { label: "STATIONS", value: String(summ?.totalStations ?? 0),        color: "var(--ae-violet)" },
                { label: "TASKS/DAY",value: String(summ?.tasksCompletedToday ?? 0),  color: "var(--ae-amber)" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ ...mono, fontSize: 12, color: s.color, fontWeight: 700 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rank progress */}
          {rank.label !== "WARLORD" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ ...mono, fontSize: 6, color: "var(--ae-muted)" }}>{rank.label}</span>
                <span style={{ ...mono, fontSize: 6, color: rank.color }}>{rankProgress}% → {rank.next}</span>
              </div>
              <div style={{ height: 4, background: "var(--ae-bg)", border: `1px solid ${rank.color}33` }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rankProgress}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{ height: "100%", background: rank.color, boxShadow: `0 0 8px ${rank.color}80` }}
                />
              </div>
              <div style={{ ...mono, fontSize: 6, color: "var(--ae-dim)", marginTop: 4 }}>
                ${(rank.nextThreshold - totalRevenue).toLocaleString()} revenue until next rank
              </div>
            </div>
          )}
          {rank.label === "WARLORD" && (
            <div style={{ ...mono, fontSize: 7, color: rank.color, textShadow: `0 0 10px ${rank.color}` }}>
              ★ MAX RANK ACHIEVED ★
            </div>
          )}
        </div>

        {/* Wallet Section */}
        <div style={{ marginBottom: 20, border: "1px solid var(--ae-border)", padding: "16px 18px" }}>
          <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Wallet size={11} /> WALLET
          </div>

          {isConnected && address ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid var(--ae-cyan)44" }}>
                <div style={{ flex: 1, padding: "10px 14px", ...mono, fontSize: 10, color: "var(--ae-text)", letterSpacing: "0.04em" }}>
                  {shortAddr(address)}
                </div>
                <button onClick={copyAddress} style={{
                  padding: "0 14px", background: "rgba(0,0,0,0.3)", border: "none",
                  borderLeft: "1px solid var(--ae-border)", cursor: "pointer",
                  color: copiedAddr ? "var(--ae-green)" : "var(--ae-muted)",
                  height: 40, display: "flex", alignItems: "center", gap: 5,
                  ...mono, fontSize: 7, letterSpacing: "0.06em", transition: "color 0.15s",
                }}>
                  {copiedAddr ? <><Check size={11} /> COPIED</> : <><Copy size={11} /> COPY</>}
                </button>
                <button onClick={() => disconnect()} style={{
                  padding: "0 14px", background: "rgba(255,34,68,0.06)", border: "none",
                  borderLeft: "1px solid var(--ae-border)", cursor: "pointer",
                  color: "var(--ae-red)", height: 40, display: "flex", alignItems: "center", gap: 5,
                  ...mono, fontSize: 7, letterSpacing: "0.06em", transition: "all 0.15s",
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
                const pct = totalRevenue > 0 ? Math.round(((s.revenue ?? 0) / totalRevenue) * 100) : 0;
                const colors = ["var(--ae-cyan)", "var(--ae-violet)", "var(--ae-amber)", "var(--ae-green)", "var(--ae-red)"];
                const c = colors[idx % colors.length];
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
                {a.unlocked && (
                  <div style={{ ...mono, fontSize: 6, color: a.color, marginTop: 6 }}>✓ UNLOCKED</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
