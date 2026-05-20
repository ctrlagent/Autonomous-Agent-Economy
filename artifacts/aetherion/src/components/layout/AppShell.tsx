import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Settings, Zap, Users, Target, Store, Clock, Home } from "lucide-react";
import { useGetDashboardSummary, useListStations } from "@workspace/api-client-react";

const NAV_ITEMS = [
  { href: "/",          label: "STATION",  Icon: Zap },
  { href: "/crew",      label: "CREW",     Icon: Users },
  { href: "/missions",  label: "MISSIONS", Icon: Target },
  { href: "/timeline",  label: "TIMELINE", Icon: Clock },
  { href: "/templates", label: "MARKET",   Icon: Store },
];

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

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: summary } = useGetDashboardSummary();
  const { data: stations } = useListStations();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const tick = useTick();
  const isMobile = useIsMobile();

  const totalTasksCompleted = (stations ?? []).reduce((sum, s) => sum + (s.tasksCompleted ?? 0), 0);
  const totalTasksTotal = (stations ?? []).reduce((sum, s) => sum + (s.tasksTotal ?? 1), 0);
  const xpPct = Math.round((totalTasksCompleted / Math.max(1, totalTasksTotal)) * 100);
  const revenueEstimate = `$${(totalTasksCompleted * 27).toLocaleString()}`;

  // Count active (in-progress, not locked) missions — mirrors Missions.tsx logic
  const activeMissionsCount = [
    (totalTasksCompleted * 27) < 5000,              // Reach $5K revenue
    true,                                            // Launch 10 products (7/10)
    true,                                            // Get 1K users (342/1000)
    (summary?.totalAgents ?? 0) >= 2,               // Deploy 3 contracts (unlocked)
    (summary?.tasksCompletedToday ?? 0) >= 5,       // 90% agent perf (unlocked)
  ].filter(Boolean).length;

  const stats = [
    { label: "REVENUE",  value: revenueEstimate,                                                color: "#4dff9b" },
    { label: "TASKS",    value: String(summary?.tasksCompletedToday ?? 0),                      color: "#4d7fff" },
    { label: "AGENTS",   value: `${summary?.activeAgents ?? 0}/${summary?.totalAgents ?? 0}`,   color: "#4df0d8" },
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
          padding: "0 18px",
          borderRight: "1px solid var(--ae-border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" style={{ imageRendering: "pixelated", flexShrink: 0 }}>
            <polygon points="11,1 21,6 21,16 11,21 1,16 1,6" fill="none" stroke="#4df0d8" strokeWidth="1.5" />
            <polygon points="11,5 17,8.5 17,13.5 11,17 5,13.5 5,8.5" fill="none" stroke="#4df0d8" strokeWidth="0.5" opacity="0.35" />
            <text x="11" y="15.5" textAnchor="middle" fill="#ffb84d" fontSize="9" fontFamily="'Press Start 2P',monospace">C</text>
          </svg>
          <span style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 10,
            color: "#fff",
            letterSpacing: "0.06em",
            lineHeight: 1,
            textShadow: "0 0 12px rgba(77,240,216,0.5)",
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

        {/* Mobile: compact stats in top bar */}
        {isMobile && (
          <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 12, padding: "0 12px", overflow: "hidden" }}>
            {stats.map(s => (
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
              const isActive = href === "/" ? location === "/" : location.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                    boxShadow: isActive ? "0 0 16px rgba(77,240,216,0.5)" : "none",
                  }}
                >{label}</Link>
              );
            })}
            <a
              href="/marketing"
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

        {/* Mobile: settings button in top-right */}
        {isMobile && (
          <button
            onClick={() => setSettingsOpen(v => !v)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 46, height: "100%", background: "none", border: "none",
              borderLeft: "1px solid var(--ae-border)", cursor: "pointer", flexShrink: 0,
              color: settingsOpen ? "var(--ae-cyan)" : "var(--ae-muted)", transition: "color 0.15s",
            }}
          ><Settings size={14} /></button>
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
          height: 26, flexShrink: 0,
          background: "rgba(0,0,0,0.6)", borderTop: "1px solid var(--ae-border)",
          display: "flex", alignItems: "center", padding: "0 14px", gap: 20, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4dff9b", boxShadow: "0 0 6px #4dff9b", animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em" }}>AUTONOMOUS · RUNNING</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "var(--ae-muted)" }}>AGENTS</span>
            <div style={{ width: 80, height: 3, background: "var(--ae-border)" }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, ((summary?.activeAgents ?? 0) / Math.max(1, summary?.totalAgents ?? 1)) * 100)}%`,
                background: "#4dff9b", boxShadow: "0 0 4px #4dff9b", transition: "width 1s",
              }} />
            </div>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "var(--ae-dim)" }}>{summary?.activeAgents ?? 0}/{summary?.totalAgents ?? 0}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "var(--ae-muted)" }}>XP</span>
            <div style={{ width: 80, height: 3, background: "var(--ae-border)" }}>
              <div style={{ height: "100%", width: `${xpPct}%`, background: "linear-gradient(to right, #4d7fff, #9b6dff)", boxShadow: "0 0 4px #4d7fff", transition: "width 1s" }} />
            </div>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "var(--ae-dim)" }}>{totalTasksCompleted}/{totalTasksTotal}</span>
          </div>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "var(--ae-dim)", marginLeft: "auto" }}>
            v1.0 · TICK {tick}
          </span>
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
            const isActive = href === "/" ? location === "/" : location.startsWith(href);
            const isMissions = href === "/missions";
            const showBadge = isMissions && activeMissionsCount > 0 && !isActive;
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
                  background: isActive ? "rgba(77,240,216,0.07)" : "transparent",
                  borderRight: "1px solid var(--ae-border)",
                  position: "relative",
                  transition: "color 0.15s, background 0.15s",
                }}
              >
                {/* Active indicator line */}
                {isActive && (
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: 2,
                    background: "var(--ae-cyan)",
                    boxShadow: "0 0 8px var(--ae-cyan)",
                  }} />
                )}

                {/* Icon + badge wrapper */}
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
                      background: "#ff4d6d",
                      boxShadow: "0 0 8px #ff4d6d88",
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
                        color: "#fff",
                        lineHeight: 1,
                      }}>{activeMissionsCount}</span>
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
            href="/marketing"
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
