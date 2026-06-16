import { ReactNode, useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { PixelSprite } from "@/components/PixelSprite";
import { Settings, Zap, Users, Target, Store, Clock, Home, Wallet, LogOut, Copy, Check, Radio, User, Shield, ChevronUp } from "lucide-react";
import { useGetDashboardSummary, useListStations } from "@workspace/api-client-react";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { base } from "viem/chains";
import { formatUnits } from "viem";
import { useTier } from "@/components/TierProvider";

const NAV_ITEMS = [
  { href: "/app",             label: "STATION",  Icon: Zap },
  { href: "/app/crew",        label: "CREW",     Icon: Users },
  { href: "/app/missions",    label: "MISSIONS", Icon: Target },
  { href: "/app/timeline",    label: "TIMELINE", Icon: Clock },
  { href: "/app/templates",   label: "MARKET",   Icon: Store },
  { href: "/app/airlock",     label: "AIRLOCK",  Icon: Shield },
  { href: "/app/profile",     label: "PROFILE",  Icon: User },
  { href: "/app/settings",    label: "SETTINGS", Icon: Settings },
];

function useAirlockPending() {
  const [pending, setPending] = useState(0);
  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch("/api/airlock/stats");
        const data = await res.json() as { pending: number; changes_requested: number };
        setPending((data.pending ?? 0) + (data.changes_requested ?? 0));
      } catch {}
    }
    poll();
    const id = setInterval(poll, 15000);
    return () => clearInterval(id);
  }, []);
  return pending;
}

// Sync stored API key to server on app mount (server loses in-memory config on restart)
function useAiKeySync() {
  useEffect(() => {
    const key = localStorage.getItem("ctrl_ai_key");
    const provider = localStorage.getItem("ctrl_ai_provider") ?? "openai";
    if (key) {
      fetch("/api/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key, provider }),
      }).catch(() => {});
    }
  }, []);
}

function useTick() {
  const [tick, setTick] = useState(0);
  const startRef = useRef(Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      setTick(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(Math.floor(tick / 3600)).padStart(2, '0');
  const mm = String(Math.floor((tick % 3600) / 60)).padStart(2, '0');
  const ss = String(tick % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

function useWalletBalance() {
  const { address } = useAccount();
  const { data } = useBalance({ address, chainId: base.id });
  if (!address || !data) return null;
  return parseFloat(formatUnits(data.value, data.decimals));
}

function abbrev(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

/* ─── Wallet Chip ─────────────────────────────────────────────────────────── */
function WalletChip({ compact = false }: { compact?: boolean }) {
  const { address: rawAddress, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const balance = useWalletBalance();
  const { tier, tierName, tierColor, features, upgradeUrl } = useTier();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const address = rawAddress ?? "";

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }, [address]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setMenuOpen(false);
  }, [disconnect]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!rawAddress) return null;

  const ethDisplay = balance !== null ? `${balance.toFixed(4)} ETH` : "— ETH";

  return (
    <div ref={menuRef} style={{ position: "relative", display: "flex", alignItems: "center", height: "100%" }}>
      <button
        onClick={() => setMenuOpen(v => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 6 : 8,
          height: "100%",
          padding: compact ? "0 10px" : "0 14px",
          background: menuOpen ? "rgba(91,143,255,0.08)" : "transparent",
          border: "none",
          borderLeft: "1px solid var(--ae-border)",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => { if (!menuOpen) (e.currentTarget as HTMLButtonElement).style.background = "rgba(91,143,255,0.05)"; }}
        onMouseLeave={e => { if (!menuOpen) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      >
        {/* Status dot */}
        <div style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#4dff9b",
          boxShadow: "0 0 6px #4dff9b",
          flexShrink: 0,
          animation: "pulse-dot 2s ease-in-out infinite",
        }} />

        {!compact && (
          <>
            {/* ETH balance */}
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              fontWeight: 700,
              color: "#5b8fff",
              textShadow: "0 0 8px rgba(91,143,255,0.5)",
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
            }}>
              {ethDisplay}
            </span>

            {/* Divider */}
            <div style={{ width: 1, height: 14, background: "var(--ae-border)", flexShrink: 0 }} />
          </>
        )}

        {/* Wallet icon + address */}
        <Wallet size={compact ? 10 : 11} color="var(--ae-muted)" style={{ flexShrink: 0 }} />
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: compact ? 7 : 8,
          color: "var(--ae-muted)",
          letterSpacing: "0.06em",
          whiteSpace: "nowrap",
        }}>
          {abbrev(address)}
        </span>

        {/* Tier badge */}
        {!compact && (
          <>
            <div style={{ width: 1, height: 14, background: "var(--ae-border)", flexShrink: 0 }} />
            <span style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 6,
              color: tierColor,
              textShadow: `0 0 8px ${tierColor}99`,
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
              border: `1px solid ${tierColor}44`,
              padding: "2px 5px",
              background: `${tierColor}12`,
              flexShrink: 0,
            }}>
              {tierName.toUpperCase()}
            </span>
          </>
        )}
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 2px)",
          right: 0,
          minWidth: 220,
          background: "var(--ae-surface)",
          border: "1px solid var(--ae-border)",
          zIndex: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}>
          {/* Header */}
          <div style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--ae-border)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4dff9b", boxShadow: "0 0 6px #4dff9b", flexShrink: 0 }} />
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#c0c8e0", letterSpacing: "0.08em" }}>
              {connector?.name?.toUpperCase() ?? "WALLET"}
            </span>
          </div>

          {/* ETH balance on Base */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--ae-border)" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 4 }}>BASE BALANCE</div>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 14,
              color: "#5b8fff",
              textShadow: "0 0 16px rgba(91,143,255,0.6)",
              letterSpacing: "0.04em",
            }}>
              {ethDisplay}
            </div>
          </div>

          {/* Full address + copy */}
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--ae-border)" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>ADDRESS</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 8,
                color: "#8090b0",
                letterSpacing: "0.04em",
                wordBreak: "break-all",
                flex: 1,
                lineHeight: 1.8,
              }}>
                {address}
              </span>
              <button
                onClick={handleCopy}
                title="Copy address"
                style={{
                  background: "none",
                  border: "1px solid var(--ae-border)",
                  cursor: "pointer",
                  padding: "4px 6px",
                  color: copied ? "#4dff9b" : "var(--ae-muted)",
                  transition: "color 0.15s, border-color 0.15s",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#5b8fff"; (e.currentTarget as HTMLButtonElement).style.color = "#5b8fff"; }}
                onMouseLeave={e => { if (!copied) { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ae-border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--ae-muted)"; } }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
              </button>
            </div>
          </div>

          {/* Tier section */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--ae-border)" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 8 }}>RANK / TIER</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 9,
                color: tierColor,
                textShadow: `0 0 12px ${tierColor}bb`,
                letterSpacing: "0.08em",
              }}>
                {tierName.toUpperCase()}
              </span>
              <div style={{
                flex: 1,
                height: 3,
                background: "var(--ae-border)",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${[0, 33, 66, 100][tier]}%`,
                  background: tierColor,
                  boxShadow: `0 0 6px ${tierColor}88`,
                  transition: "width 0.6s",
                }} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 4, height: 4, background: `${tierColor}88`, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.06em" }}>{f}</span>
                </div>
              ))}
            </div>
            {tier < 3 && (
              <a
                href={upgradeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 10,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 7,
                  color: tierColor,
                  letterSpacing: "0.08em",
                  textDecoration: "none",
                  opacity: 0.8,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.8"; }}
              >
                <ChevronUp size={9} />
                GET MORE $CTRL TO UPGRADE
              </a>
            )}
          </div>

          {/* Disconnect */}
          <button
            onClick={handleDisconnect}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#ff4d6d",
              fontFamily: "'Space Mono', monospace",
              fontSize: 8,
              letterSpacing: "0.1em",
              transition: "background 0.15s",
              textAlign: "left",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,77,109,0.08)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
          >
            <LogOut size={12} />
            DISCONNECT
          </button>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: summary } = useGetDashboardSummary();
  const { data: stations } = useListStations();
  const { isConnected } = useAccount();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const tick = useTick();
  const isMobile = useIsMobile();
  const airlockPending = useAirlockPending();
  useRealtimeEvents();
  useAiKeySync();

  type StationSummary = { tasksCompleted?: number | null; tasksTotal?: number | null; revenue?: number | null };
  const stationList = (stations ?? []) as StationSummary[];
  const totalTasksCompleted = stationList.reduce((sum, s) => sum + (s.tasksCompleted ?? 0), 0);
  const totalTasksTotal = stationList.reduce((sum, s) => sum + (s.tasksTotal ?? 1), 0);
  const xpPct = Math.round((totalTasksCompleted / Math.max(1, totalTasksTotal)) * 100);
  const totalRevenue = stationList.reduce((sum, s) => sum + (s.revenue ?? 0), 0);
  const revenueEstimate = `$${Math.floor(totalRevenue).toLocaleString()}`;

  const activeMissionsCount = [
    totalRevenue < 5000,
    true,
    true,
    (summary?.totalAgents ?? 0) >= 2,
    (summary?.tasksCompletedToday ?? 0) >= 5,
  ].filter(Boolean).length;

  const stats = [
    { label: "REVENUE",  value: revenueEstimate,                                                color: "#4dff9b" },
    { label: "TASKS",    value: String(summary?.tasksCompletedToday ?? 0),                      color: "#4d7fff" },
    { label: "AGENTS",   value: `${summary?.activeAgents ?? 0}/${summary?.totalAgents ?? 0}`,   color: "#5b8fff" },
  ];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100dvh",
      background: "var(--ae-bg)",
      overflow: "hidden",
      position: "relative",
    }}>
      <div className="scanline" />

      {/* TOP BAR */}
      <header style={{
        height: 46,
        flexShrink: 0,
        display: "flex",
        alignItems: "stretch",
        background: "var(--ae-surface)",
        borderBottom: "2px solid var(--ae-border)",
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{
          padding: "0 14px 0 10px",
          borderRight: "1px solid var(--ae-border)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}>
          <div className="logo-idle" style={{ position: "relative", flexShrink: 0, display: "flex", alignItems: "center" }}>
            <PixelSprite role="builder" size={2} />
          </div>
          <span style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 10,
            color: "#fff",
            letterSpacing: "0.06em",
            lineHeight: 1,
            textShadow: "0 0 12px rgba(91,143,255,0.6)",
          }}>CTRL</span>
        </div>

        {/* Stats strip — hidden on mobile */}
        {!isMobile && (
          <div style={{ display: "flex", height: "100%", borderRight: "1px solid var(--ae-border)" }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 16px",
                borderRight: i < stats.length - 1 ? "1px solid var(--ae-border)" : "none",
                height: "100%",
              }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>
                  {s.label}:
                </span>
                <span style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  color: s.color,
                  textShadow: `0 0 8px ${s.color}80`,
                }}>{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Mobile: compact stats + wallet */}
        {isMobile && (
          <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 10, padding: "0 10px", overflow: "hidden" }}>
            {stats.slice(0, 2).map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.06em" }}>{s.label}:</span>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Nav tabs — desktop only */}
        {!isMobile && (
          <div style={{ display: "flex", flex: 1, height: "100%", justifyContent: "flex-end" }}>
            {NAV_ITEMS.map(({ href, label }) => {
              const isActive = href === "/app" ? location === "/app" : location.startsWith(href);
              const isAirlock = href === "/app/airlock";
              const showAirlockBadge = isAirlock && airlockPending > 0 && !isActive;
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    padding: "0 14px",
                    height: "100%",
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    color: isActive ? "#0a0b0f" : "var(--ae-muted)",
                    background: isActive ? "var(--ae-cyan)" : "transparent",
                    borderLeft: "1px solid var(--ae-border)",
                    cursor: "pointer",
                    textDecoration: "none",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                    fontWeight: isActive ? 700 : 400,
                    boxShadow: isActive ? "0 0 16px rgba(91,143,255,0.5)" : "none",
                    position: "relative",
                  }}
                >
                  {label}
                  {showAirlockBadge && (
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 7,
                      fontWeight: 700,
                      color: "#0a0b0f",
                      background: "#ffb84d",
                      boxShadow: "0 0 8px rgba(255,184,77,0.7)",
                      padding: "1px 4px",
                      minWidth: 14,
                      textAlign: "center",
                      lineHeight: 1.4,
                      animation: "pulse-dot 2s ease-in-out infinite",
                    }}>
                      {airlockPending > 99 ? "99+" : airlockPending}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Wallet chip */}
            <WalletChip />

            <a
              href="/"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 10px", height: "100%", color: "var(--ae-muted)",
                textDecoration: "none", borderLeft: "1px solid var(--ae-border)",
                fontFamily: "'Space Mono', monospace", fontSize: 7,
                letterSpacing: "0.08em", transition: "color 0.15s", whiteSpace: "nowrap", gap: 4,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--ae-cyan)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--ae-muted)"; }}
            >← HOME</a>
            <button
              onClick={() => setSettingsOpen(v => !v)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 46, height: "100%", background: "none", border: "none",
                borderLeft: "1px solid var(--ae-border)", cursor: "pointer",
                color: settingsOpen ? "var(--ae-cyan)" : "var(--ae-muted)", transition: "color 0.15s",
              }}
            ><Settings size={14} /></button>
          </div>
        )}

        {/* Mobile: wallet chip (compact) + settings */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "stretch", flexShrink: 0 }}>
            <WalletChip compact />
            <button
              onClick={() => setSettingsOpen(v => !v)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 46, height: "100%", background: "none", border: "none",
                borderLeft: "1px solid var(--ae-border)", cursor: "pointer", flexShrink: 0,
                color: settingsOpen ? "var(--ae-cyan)" : "var(--ae-muted)", transition: "color 0.15s",
              }}
            ><Settings size={14} /></button>
          </div>
        )}
      </header>

      {/* MAIN */}
      <main style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        paddingBottom: isMobile ? 56 : 0,
      }}>
        {children}
      </main>

      {/* BOTTOM STATUS BAR — desktop only */}
      {!isMobile && (
        <div style={{
          height: 38, flexShrink: 0,
          background: "rgba(0,0,0,0.7)", borderTop: "1px solid var(--ae-border)",
          display: "flex", alignItems: "center", padding: "0 18px", gap: 24, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4dff9b", boxShadow: "0 0 8px #4dff9b", animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--ae-muted)", letterSpacing: "0.12em" }}>AUTONOMOUS · RUNNING</span>
          </div>

          <div style={{ width: 1, height: 18, background: "var(--ae-border)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>AGENTS</span>
            <div style={{ width: 110, height: 5, background: "var(--ae-border)" }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, ((summary?.activeAgents ?? 0) / Math.max(1, summary?.totalAgents ?? 1)) * 100)}%`,
                background: "#4dff9b", boxShadow: "0 0 6px #4dff9b55", transition: "width 1s",
              }} />
            </div>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700, color: "#4dff9b" }}>{summary?.activeAgents ?? 0}<span style={{ color: "var(--ae-dim)", fontWeight: 400 }}>/{summary?.totalAgents ?? 0}</span></span>
          </div>

          <div style={{ width: 1, height: 18, background: "var(--ae-border)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>XP</span>
            <div style={{ width: 110, height: 5, background: "var(--ae-border)" }}>
              <div style={{ height: "100%", width: `${xpPct}%`, background: "linear-gradient(to right, #4d7fff, #9b6dff)", boxShadow: "0 0 6px #4d7fff55", transition: "width 1s" }} />
            </div>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700, color: "#9b6dff" }}>{totalTasksCompleted}<span style={{ color: "var(--ae-dim)", fontWeight: 400 }}>/{totalTasksTotal}</span></span>
          </div>

          {/* Wallet address in status bar */}
          {isConnected && (
            <>
              <div style={{ width: 1, height: 18, background: "var(--ae-border)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Wallet size={11} color="var(--ae-muted)" />
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--ae-muted)", letterSpacing: "0.08em" }}>
                  BASE
                </span>
              </div>
            </>
          )}

        </div>
      )}

      {/* MOBILE BOTTOM NAV BAR */}
      {isMobile && (
        <nav style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 56,
          background: "rgba(8,9,14,0.97)",
          borderTop: "2px solid var(--ae-border)",
          display: "flex",
          alignItems: "stretch",
          zIndex: 200,
          backdropFilter: "blur(12px)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.6)",
        }}>
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = href === "/app" ? location === "/app" : location.startsWith(href);
            const isMissions = href === "/app/missions";
            const isAirlock  = href === "/app/airlock";
            const showMissionsBadge = isMissions && activeMissionsCount > 0 && !isActive;
            const showAirlockBadge  = isAirlock && airlockPending > 0 && !isActive;
            const showBadge = showMissionsBadge || showAirlockBadge;
            const badgeCount = showAirlockBadge ? airlockPending : activeMissionsCount;
            const badgeColor = showAirlockBadge ? "#ffb84d" : "#ff4d6d";
            const badgeShadow = showAirlockBadge ? "0 0 8px rgba(255,184,77,0.8)" : "0 0 8px #ff4d6d88";
            return (
              <Link
                key={href}
                href={href}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  textDecoration: "none",
                  color: isActive ? "var(--ae-cyan)" : "var(--ae-muted)",
                  background: isActive ? "rgba(91,143,255,0.07)" : "transparent",
                  borderRight: "1px solid var(--ae-border)",
                  position: "relative",
                  transition: "color 0.15s, background 0.15s",
                }}
              >
                {isActive && (
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: 2,
                    background: "var(--ae-cyan)",
                    boxShadow: "0 0 8px var(--ae-cyan)",
                  }} />
                )}

                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 1.5} />
                  {showBadge && (
                    <div style={{
                      position: "absolute",
                      top: -5,
                      right: -8,
                      minWidth: 14,
                      height: 14,
                      borderRadius: 7,
                      background: badgeColor,
                      boxShadow: badgeShadow,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 3px",
                      animation: "pulse-dot 2s ease-in-out infinite",
                    }}>
                      <span style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 7,
                        fontWeight: 700,
                        color: "#0a0b0f",
                        lineHeight: 1,
                      }}>{badgeCount > 99 ? "99+" : badgeCount}</span>
                    </div>
                  )}
                </div>

                <span style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 6,
                  letterSpacing: "0.06em",
                  fontWeight: isActive ? 700 : 400,
                  lineHeight: 1,
                }}>{label}</span>
              </Link>
            );
          })}
          {/* HOME button */}
          <a
            href="/"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              textDecoration: "none",
              color: "var(--ae-muted)",
              background: "transparent",
              transition: "color 0.15s",
            }}
          >
            <Home size={16} strokeWidth={1.5} />
            <span style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 6,
              letterSpacing: "0.06em",
              lineHeight: 1,
            }}>HOME</span>
          </a>
        </nav>
      )}
    </div>
  );
}
