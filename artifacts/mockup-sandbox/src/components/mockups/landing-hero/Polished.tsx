import { useState, useEffect, useRef } from "react";
import "./_group.css";

const C = {
  bg: "#070810",
  surface: "#0d0f1a",
  border: "#1a1f35",
  borderBright: "#2a3055",
  muted: "#3d4a6e",
  dim: "#5a6890",
  cyan: "#4df0d8",
  violet: "#9b6dff",
  blue: "#4d7fff",
  amber: "#ffb84d",
  green: "#4dff9b",
  red: "#ff4d6d",
};

const px = { fontFamily: "'Press Start 2P', monospace" };
const mono = { fontFamily: "'Space Mono', monospace" };

const BOOT_LINES = [
  "CTRL OS v1.0 — INITIALIZING...",
  "Loading autonomous agent engine........... OK",
  "Connecting to station network.............. OK",
  "Mounting mission control modules.......... OK",
  "SYSTEM ONLINE — ENTERING COMMAND CENTER",
];

function BootSequence({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const tick = () => {
      if (i < BOOT_LINES.length) {
        setLines((prev) => [...prev, BOOT_LINES[i++]]);
        setTimeout(tick, i === BOOT_LINES.length ? 300 : 160);
      } else {
        setTimeout(() => setDone(true), 300);
        setTimeout(onDone, 900);
      }
    };
    setTimeout(tick, 150);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        opacity: done ? 0 : 1,
        transition: "opacity 0.5s ease",
      }}
    >
      {/* Logo glow */}
      <div style={{ position: "relative", marginBottom: 48, textAlign: "center" }}>
        <div
          style={{
            position: "absolute",
            inset: "-40px",
            background: `radial-gradient(ellipse at center, ${C.cyan}22 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />
        <div style={{ ...px, fontSize: 9, color: C.muted, letterSpacing: "0.25em", marginBottom: 12 }}>
          ◈ AUTONOMOUS AGENT OS ◈
        </div>
        <div
          style={{
            ...px,
            fontSize: 18,
            color: C.cyan,
            letterSpacing: "0.15em",
            textShadow: `0 0 30px ${C.cyan}, 0 0 60px ${C.cyan}55`,
          }}
        >
          CTRL
        </div>
      </div>

      {/* Terminal */}
      <div
        style={{
          width: "min(520px, 90vw)",
          border: `1px solid ${C.cyan}33`,
          background: `${C.surface}cc`,
          padding: "20px 24px",
          position: "relative",
        }}
      >
        {/* Corner accents */}
        {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
          <div key={`${v}${h}`} style={{
            position: "absolute",
            [v]: -1, [h]: -1,
            width: 12, height: 12,
            borderTop: v === "top" ? `2px solid ${C.cyan}` : "none",
            borderBottom: v === "bottom" ? `2px solid ${C.cyan}` : "none",
            borderLeft: h === "left" ? `2px solid ${C.cyan}` : "none",
            borderRight: h === "right" ? `2px solid ${C.cyan}` : "none",
          }} />
        ))}
        <div style={{ ...mono, fontSize: 7, color: C.dim, letterSpacing: "0.1em", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
          CTRL://SYSTEM/INIT
        </div>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              ...mono,
              fontSize: 9,
              color: i === lines.length - 1 ? C.amber : C.dim,
              lineHeight: 2.2,
              letterSpacing: "0.04em",
              borderLeft: i === lines.length - 1 ? `2px solid ${C.amber}` : "2px solid transparent",
              paddingLeft: 8,
              transition: "all 0.2s",
            }}
          >
            {l}
          </div>
        ))}
        <span
          style={{
            ...mono,
            fontSize: 9,
            color: C.cyan,
            animation: "blink 0.7s step-end infinite",
            paddingLeft: 8,
          }}
        >
          █
        </span>
      </div>
    </div>
  );
}

function NavBar() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        height: 64,
        borderBottom: `1px solid ${C.border}`,
        background: `${C.surface}ee`,
        backdropFilter: "blur(12px)",
        position: "relative",
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <svg width="28" height="28" viewBox="0 0 28 28">
          <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke={C.cyan} strokeWidth="1.5" />
          <polygon points="14,6 22,10 22,18 14,22 6,18 6,10" fill="none" stroke={C.cyan} strokeWidth="0.5" opacity="0.4" />
          <text x="14" y="18" textAnchor="middle" fill={C.amber} fontSize="10" fontFamily="'Press Start 2P',monospace">C</text>
        </svg>
        <div>
          <div style={{ ...px, fontSize: 11, color: "#fff", letterSpacing: "0.08em", textShadow: `0 0 16px ${C.cyan}44` }}>CTRL</div>
          <div style={{ ...mono, fontSize: 7, color: C.dim, letterSpacing: "0.12em" }}>CONTROL AGENT</div>
        </div>
        <div style={{
          ...mono, fontSize: 7, color: C.green,
          padding: "3px 8px",
          border: `1px solid ${C.green}55`,
          background: `${C.green}10`,
          marginLeft: 4,
          letterSpacing: "0.1em",
          boxShadow: `0 0 8px ${C.green}22`,
        }}>
          ● ONLINE
        </div>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {["STATION", "CREW", "MISSIONS", "MARKET"].map((item) => (
          <span key={item} style={{ ...mono, fontSize: 8, color: C.muted, letterSpacing: "0.12em", cursor: "pointer" }}>
            {item}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        ...px, fontSize: 8,
        color: C.bg,
        background: C.cyan,
        padding: "10px 20px",
        letterSpacing: "0.06em",
        cursor: "pointer",
        boxShadow: `0 0 24px ${C.cyan}55`,
      }}>
        ENTER APP →
      </div>
    </nav>
  );
}

function HeroSection() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(Math.floor(tick / 3600)).padStart(2, "0");
  const mm = String(Math.floor((tick % 3600) / 60)).padStart(2, "0");
  const ss = String(tick % 60).padStart(2, "0");

  return (
    <div style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      padding: "60px 48px",
      gap: 60,
      position: "relative",
      zIndex: 10,
    }}>
      {/* Left copy */}
      <div style={{ flex: "0 0 440px" }}>
        <div style={{
          ...mono, fontSize: 8, color: C.cyan,
          letterSpacing: "0.25em",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span style={{ width: 24, height: 1, background: C.cyan, display: "inline-block" }} />
          AUTONOMOUS AGENT OS
          <span style={{ width: 24, height: 1, background: C.cyan, display: "inline-block" }} />
        </div>

        <h1 style={{
          ...px,
          fontSize: "clamp(22px, 3.5vw, 38px)",
          lineHeight: 1.8,
          letterSpacing: "0.06em",
          marginBottom: 24,
          color: "#fff",
          textShadow: `0 0 50px ${C.cyan}33`,
        }}>
          CTRL<br />
          <span style={{ color: C.cyan, textShadow: `0 0 30px ${C.cyan}88` }}>Command</span><br />
          AI Economies.
        </h1>

        <p style={{
          ...mono, fontSize: 10,
          color: C.dim,
          lineHeight: 2,
          letterSpacing: "0.04em",
          marginBottom: 40,
          maxWidth: 380,
        }}>
          Build, deploy, and scale entire businesses with
          autonomous AI crews operating inside living
          digital stations.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 16, marginBottom: 48 }}>
          <div style={{
            ...px, fontSize: 9,
            color: C.bg,
            background: C.cyan,
            padding: "14px 28px",
            letterSpacing: "0.06em",
            cursor: "pointer",
            boxShadow: `0 0 32px ${C.cyan}55, 0 4px 24px ${C.cyan}33`,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            ENTER STATION →
          </div>
          <div style={{
            ...px, fontSize: 9,
            color: C.cyan,
            border: `1px solid ${C.cyan}55`,
            background: `${C.cyan}08`,
            padding: "14px 28px",
            letterSpacing: "0.06em",
            cursor: "pointer",
          }}>
            WATCH DEMO
          </div>
        </div>

        {/* Live stats */}
        <div style={{ display: "flex", gap: 32, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
          {[
            { label: "AGENTS ACTIVE", value: "19/23", color: C.cyan },
            { label: "STATIONS", value: "3", color: C.green },
            { label: "UPTIME", value: `${hh}:${mm}:${ss}`, color: C.amber },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ ...px, fontSize: 16, color: s.color, textShadow: `0 0 16px ${s.color}88`, marginBottom: 6 }}>
                {s.value}
              </div>
              <div style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.12em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Station visualization mockup */}
      <div style={{ flex: 1, minHeight: 440, position: "relative" }}>
        {/* Outer glow */}
        <div style={{
          position: "absolute",
          inset: -30,
          background: `radial-gradient(ellipse at center, ${C.cyan}15 0%, transparent 70%)`,
          filter: "blur(20px)",
          zIndex: 0,
        }} />

        {/* Monitor frame */}
        <div style={{
          position: "relative",
          zIndex: 1,
          border: `1px solid ${C.cyan}44`,
          background: `${C.surface}`,
          boxShadow: `0 0 60px ${C.cyan}18, 0 0 120px ${C.cyan}08, inset 0 0 40px rgba(0,0,0,0.6)`,
        }}>
          {/* Corner accents */}
          {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
            <div key={`${v}${h}`} style={{
              position: "absolute",
              [v]: -1, [h]: -1,
              width: 20, height: 20,
              borderTop: v === "top" ? `2px solid ${C.cyan}` : "none",
              borderBottom: v === "bottom" ? `2px solid ${C.cyan}` : "none",
              borderLeft: h === "left" ? `2px solid ${C.cyan}` : "none",
              borderRight: h === "right" ? `2px solid ${C.cyan}` : "none",
            }} />
          ))}

          {/* Top bar */}
          <div style={{
            borderBottom: `1px solid ${C.border}`,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: `${C.bg}88`,
          }}>
            <span style={{ ...mono, fontSize: 7, color: C.dim, letterSpacing: "0.1em" }}>
              ◈ ALPHA-7 STATION // LIVE VIEW
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {[C.red, C.amber, C.green].map((c, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` }} />
              ))}
            </div>
          </div>

          {/* Station grid visualization */}
          <div style={{ padding: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { role: "RESEARCH", color: C.cyan, agents: 3, progress: 78 },
                { role: "STRATEGY", color: C.violet, agents: 2, progress: 65 },
                { role: "BUILDER", color: C.blue, agents: 4, progress: 82 },
                { role: "CONTENT", color: C.amber, agents: 2, progress: 55 },
                { role: "GROWTH", color: C.green, agents: 3, progress: 70 },
                { role: "ANALYTICS", color: C.red, agents: 2, progress: 90 },
              ].map((room) => (
                <div key={room.role} style={{
                  border: `1px solid ${room.color}33`,
                  background: `${room.color}08`,
                  padding: "12px 10px",
                  position: "relative",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right, ${room.color}, ${room.color}44)` }} />
                  <div style={{ ...mono, fontSize: 6, color: room.color, letterSpacing: "0.1em", marginBottom: 6 }}>
                    ■ {room.role}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                    {Array.from({ length: room.agents }).map((_, i) => (
                      <div key={i} style={{
                        width: 14, height: 14,
                        border: `1px solid ${room.color}55`,
                        background: `${room.color}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <div style={{ width: 6, height: 6, background: room.color, opacity: 0.8 }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ height: 2, background: C.border }}>
                    <div style={{ height: "100%", width: `${room.progress}%`, background: room.color, boxShadow: `0 0 4px ${room.color}` }} />
                  </div>
                  <div style={{ ...mono, fontSize: 6, color: room.color, marginTop: 3, textAlign: "right" }}>{room.progress}%</div>
                </div>
              ))}
            </div>

            {/* Bottom status bar */}
            <div style={{
              marginTop: 12,
              padding: "8px 12px",
              border: `1px solid ${C.border}`,
              background: `${C.bg}88`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ ...mono, fontSize: 7, color: C.green, letterSpacing: "0.08em" }}>● AUTONOMOUS · RUNNING</span>
              <span style={{ ...mono, fontSize: 7, color: C.muted }}>16 AGENTS ACTIVE</span>
              <span style={{ ...mono, fontSize: 7, color: C.cyan }}>{hh}:{mm}:{ss}</span>
            </div>
          </div>
        </div>

        {/* Floating event notifications */}
        <div style={{ position: "absolute", top: 60, right: -140, display: "flex", flexDirection: "column", gap: 6, zIndex: 20 }}>
          {[
            { text: "NEXUS-1 +340 XP", color: C.violet },
            { text: "Revenue +$240", color: C.green },
            { text: "FORGE-3 deployed", color: C.blue },
          ].map((ev, i) => (
            <div key={i} style={{
              ...mono, fontSize: 7,
              padding: "6px 12px",
              background: `${ev.color}15`,
              border: `1px solid ${ev.color}44`,
              color: ev.color,
              letterSpacing: "0.06em",
              boxShadow: `0 0 12px ${ev.color}22`,
              whiteSpace: "nowrap",
            }}>
              ▶ {ev.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Polished() {
  const [booted, setBooted] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden" }}>
      {/* Grid background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <svg width="100%" height="100%" style={{ opacity: 0.06 }}>
          <defs>
            <pattern id="grid-sm" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={C.cyan} strokeWidth="0.5" />
            </pattern>
            <pattern id="grid-lg" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke={C.cyan} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-sm)" />
          <rect width="100%" height="100%" fill="url(#grid-lg)" />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 30% 50%, ${C.cyan}08 0%, transparent 60%)`,
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 80% 30%, ${C.violet}06 0%, transparent 50%)`,
        }} />
      </div>

      {/* CRT scanlines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
      }} />

      {!booted && <BootSequence onDone={() => setBooted(true)} />}

      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative", zIndex: 10 }}>
        <NavBar />
        <HeroSection />
      </div>
    </div>
  );
}
