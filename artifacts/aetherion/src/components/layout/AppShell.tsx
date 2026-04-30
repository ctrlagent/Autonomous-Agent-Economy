import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Users, Target, Clock, Store, Settings } from "lucide-react";
import { useGetDashboardSummary } from "@workspace/api-client-react";

const NAV_ITEMS = [
  { href: "/",          label: "STATION",  Icon: Home },
  { href: "/crew",      label: "CREW",     Icon: Users },
  { href: "/missions",  label: "MISSIONS", Icon: Target },
  { href: "/timeline",  label: "TIMELINE", Icon: Clock },
  { href: "/templates", label: "MARKET",   Icon: Store },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: summary } = useGetDashboardSummary();

  const stats = [
    { label: "REVENUE",  value: "$0",                                               color: "var(--ae-green)" },
    { label: "TASKS",    value: String(summary?.tasksCompletedToday ?? 0),          color: "var(--ae-blue)"  },
    { label: "AGENTS",   value: `${summary?.activeAgents ?? 0}/${summary?.totalAgents ?? 0}`, color: "var(--ae-cyan)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "var(--ae-bg)", overflow: "hidden" }}>
      <div className="scanline" />

      {/* TOP BAR */}
      <header style={{
        height: 48,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        background: "var(--ae-surface)",
        borderBottom: "1px solid var(--ae-border)",
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 11,
              color: "#fff",
              letterSpacing: "0.06em",
              lineHeight: 1,
            }}>
              AETHERION
            </div>
            <div style={{
              height: 2,
              width: 84,
              marginTop: 4,
              background: "linear-gradient(to right, var(--ae-cyan), var(--ae-blue), transparent)",
            }} />
          </div>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 8,
            color: "var(--ae-green)",
            border: "1px solid var(--ae-green)",
            padding: "1px 5px",
            letterSpacing: "0.12em",
          }}>
            ONLINE
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 28 }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 8,
                color: "var(--ae-muted)",
                letterSpacing: "0.12em",
                lineHeight: 1.2,
              }}>
                {s.label}
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 14,
                fontWeight: 700,
                color: s.color,
                lineHeight: 1.2,
                marginTop: 1,
              }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <button
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", padding: 4 }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--ae-text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--ae-muted)")}
        >
          <Settings size={16} />
        </button>
      </header>

      {/* MAIN */}
      <main style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </main>

      {/* BOTTOM NAV */}
      <nav style={{
        height: 52,
        flexShrink: 0,
        display: "flex",
        alignItems: "stretch",
        background: "var(--ae-bg)",
        borderTop: "1px solid var(--ae-border)",
        zIndex: 100,
      }}>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`bottom-nav-item${isActive ? " active" : ""}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
