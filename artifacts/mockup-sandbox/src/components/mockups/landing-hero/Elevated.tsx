import { useState, useEffect } from "react";
import "./_group.css";

const C = {
  bg: "#04050d",
  surface: "#080a18",
  surface2: "#0c0f20",
  border: "#141826",
  borderBright: "#1e2540",
  muted: "#2e3a5e",
  dim: "#4a5a82",
  cyan: "#00f5d4",
  violet: "#a855f7",
  blue: "#3b82f6",
  amber: "#f59e0b",
  green: "#22c55e",
  red: "#ef4444",
};

const px = { fontFamily: "'Press Start 2P', monospace" };
const mono = { fontFamily: "'Space Mono', monospace" };

const ROLES = [
  { role: "RESEARCH", color: C.cyan, agents: 3, progress: 78 },
  { role: "STRATEGY", color: C.violet, agents: 2, progress: 65 },
  { role: "BUILDER", color: C.blue, agents: 4, progress: 82 },
  { role: "CONTENT", color: C.amber, agents: 2, progress: 55 },
  { role: "GROWTH", color: C.green, agents: 3, progress: 70 },
  { role: "ANALYTICS", color: C.red, agents: 2, progress: 90 },
];

function CornerAccent({ color }: { color: string }) {
  return (
    <>
      {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
        <div key={`${v}${h}`} style={{
          position: "absolute",
          [v]: -1, [h]: -1,
          width: 16, height: 16,
          borderTop: v === "top" ? `2px solid ${color}` : "none",
          borderBottom: v === "bottom" ? `2px solid ${color}` : "none",
          borderLeft: h === "left" ? `2px solid ${color}` : "none",
          borderRight: h === "right" ? `2px solid ${color}` : "none",
        }} />
      ))}
    </>
  );
}

function AnimatedOrb({ x, y, color, size }: { x: string; y: string; color: string; size: number }) {
  return (
    <div style={{
      position: "absolute",
      left: x, top: y,
      width: size, height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle at 40% 40%, ${color}40, ${color}08 60%, transparent 80%)`,
      filter: `blur(${size / 3}px)`,
      animation: "pulse-ring 4s ease-in-out infinite",
    }} />
  );
}

function BootScreen({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [fade, setFade] = useState(false);
  const LINES = [
    "CTRL OS v1.0 — INITIALIZING...",
    "Autonomous engine............ ONLINE",
    "Station network.............. LOCKED",
    "Mission modules.............. LOADED",
    "ENTERING COMMAND CENTER ///",
  ];
  useEffect(() => {
    let i = 0;
    const tick = () => {
      if (i < LINES.length) {
        setLines(p => [...p, LINES[i++]]);
        setTimeout(tick, 170);
      } else {
        setTimeout(() => { setFade(true); setTimeout(onDone, 700); }, 400);
      }
    };
    setTimeout(tick, 200);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity: fade ? 0 : 1, transition: "opacity 0.7s ease",
    }}>
      <AnimatedOrb x="calc(50% - 200px)" y="calc(50% - 200px)" color={C.cyan} size={400} />

      <div style={{ position: "relative", zIndex: 2, textAlign: "center", marginBottom: 56 }}>
        <div style={{ ...mono, fontSize: 8, color: C.dim, letterSpacing: "0.3em", marginBottom: 16 }}>
          ◈ ◈ ◈ AUTONOMOUS AGENT OS ◈ ◈ ◈
        </div>
        <div style={{
          ...px, fontSize: 28, letterSpacing: "0.2em",
          background: `linear-gradient(135deg, ${C.cyan}, #fff, ${C.violet})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textShadow: "none",
          filter: "drop-shadow(0 0 30px rgba(0,245,212,0.5))",
        }}>
          CTRL
        </div>
      </div>

      <div style={{
        position: "relative", zIndex: 2,
        width: "min(500px, 90vw)",
        border: `1px solid ${C.borderBright}`,
        background: `${C.surface}dd`,
        padding: "24px 28px",
      }}>
        <CornerAccent color={C.cyan} />
        <div style={{ ...mono, fontSize: 7, color: C.dim, letterSpacing: "0.15em", marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
          // SYSTEM_BOOT_LOG
        </div>
        {lines.map((l, i) => (
          <div key={i} style={{
            ...mono, fontSize: 9,
            color: i === lines.length - 1 ? "#fff" : C.dim,
            lineHeight: 2.4, letterSpacing: "0.05em",
            paddingLeft: 12,
            borderLeft: `2px solid ${i === lines.length - 1 ? C.cyan : "transparent"}`,
          }}>
            <span style={{ color: C.dim, marginRight: 8 }}>{">"}</span>
            {l}
          </div>
        ))}
        <div style={{ ...mono, fontSize: 9, color: C.cyan, paddingLeft: 12, animation: "blink 0.8s step-end infinite" }}>_</div>
      </div>
    </div>
  );
}

export function Elevated() {
  const [booted, setBooted] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(Math.floor(tick / 3600)).padStart(2, "0");
  const mm = String(Math.floor((tick % 3600) / 60)).padStart(2, "0");
  const ss = String(tick % 60).padStart(2, "0");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden" }}>
      {!booted && <BootScreen onDone={() => setBooted(true)} />}

      {/* Atmospheric orbs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
        <AnimatedOrb x="-10%" y="-10%" color={C.cyan} size={500} />
        <AnimatedOrb x="60%" y="30%" color={C.violet} size={400} />
        <AnimatedOrb x="30%" y="70%" color={C.blue} size={300} />
      </div>

      {/* Fine grid */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}>
        <svg width="100%" height="100%" style={{ opacity: 0.04 }}>
          <defs>
            <pattern id="egrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke={C.cyan} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#egrid)" />
        </svg>
      </div>

      {/* Scanlines */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.025) 3px, rgba(0,0,0,0.025) 4px)",
      }} />

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Navbar */}
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 52px", height: 68,
          borderBottom: `1px solid ${C.borderBright}`,
          background: `${C.surface}cc`,
          backdropFilter: "blur(20px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 36, height: 36,
              border: `1px solid ${C.cyan}66`,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `${C.cyan}10`,
              boxShadow: `0 0 20px ${C.cyan}22`,
              position: "relative",
            }}>
              <div style={{
                position: "absolute", inset: 4,
                border: `1px solid ${C.cyan}33`,
              }} />
              <span style={{ ...px, fontSize: 12, color: C.amber }}>C</span>
            </div>
            <div>
              <div style={{ ...px, fontSize: 11, color: "#fff", letterSpacing: "0.1em" }}>CTRL</div>
              <div style={{ ...mono, fontSize: 6, color: C.dim, letterSpacing: "0.15em", marginTop: 2 }}>CONTROL AGENT v1.0</div>
            </div>
            <div style={{
              ...mono, fontSize: 7, color: C.green,
              border: `1px solid ${C.green}44`, background: `${C.green}0a`,
              padding: "3px 10px", marginLeft: 8, letterSpacing: "0.1em",
              boxShadow: `0 0 12px ${C.green}22`,
            }}>◉ ONLINE</div>
          </div>

          <div style={{ display: "flex", gap: 36 }}>
            {["STATION","CREW","MISSIONS","MARKET"].map(n => (
              <span key={n} style={{ ...mono, fontSize: 8, color: C.muted, letterSpacing: "0.15em", cursor: "pointer" }}>{n}</span>
            ))}
          </div>

          <div style={{
            ...px, fontSize: 8, color: C.bg,
            background: `linear-gradient(135deg, ${C.cyan}, ${C.blue})`,
            padding: "10px 22px", cursor: "pointer",
            boxShadow: `0 0 30px ${C.cyan}44`,
          }}>
            ENTER APP →
          </div>
        </nav>

        {/* Hero */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          padding: "64px 52px", gap: 64,
        }}>
          {/* Left */}
          <div style={{ flex: "0 0 460px" }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              border: `1px solid ${C.cyan}33`,
              background: `${C.cyan}08`,
              padding: "6px 16px", marginBottom: 28,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 8px ${C.cyan}`, animation: "pulse-ring 2s ease-in-out infinite" }} />
              <span style={{ ...mono, fontSize: 7, color: C.cyan, letterSpacing: "0.2em" }}>AUTONOMOUS AGENT OS</span>
            </div>

            {/* Headline */}
            <h1 style={{ margin: "0 0 24px", lineHeight: 1.7 }}>
              <div style={{ ...px, fontSize: "clamp(18px, 2.8vw, 32px)", color: "#fff", letterSpacing: "0.08em", marginBottom: 6 }}>CTRL</div>
              <div style={{
                ...px, fontSize: "clamp(18px, 2.8vw, 32px)",
                background: `linear-gradient(90deg, ${C.cyan}, ${C.blue})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "0.08em", marginBottom: 6,
                filter: `drop-shadow(0 0 20px ${C.cyan}66)`,
              }}>Command</div>
              <div style={{ ...px, fontSize: "clamp(18px, 2.8vw, 32px)", color: "#fff", letterSpacing: "0.08em" }}>AI Economies.</div>
            </h1>

            <p style={{
              ...mono, fontSize: 10, color: C.dim,
              lineHeight: 2.1, letterSpacing: "0.04em",
              maxWidth: 400, marginBottom: 40,
            }}>
              Build, deploy, and scale entire businesses with
              autonomous AI crews operating inside living digital stations.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 16, marginBottom: 48 }}>
              <button style={{
                ...px, fontSize: 9,
                background: `linear-gradient(135deg, ${C.cyan}dd, ${C.blue}dd)`,
                color: "#000",
                border: "none",
                padding: "15px 32px",
                letterSpacing: "0.08em",
                cursor: "pointer",
                boxShadow: `0 0 40px ${C.cyan}44, 0 4px 20px rgba(0,0,0,0.4)`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                ENTER STATION →
              </button>
              <button style={{
                ...px, fontSize: 9,
                background: "transparent",
                color: C.dim,
                border: `1px solid ${C.borderBright}`,
                padding: "15px 28px",
                letterSpacing: "0.08em",
                cursor: "pointer",
              }}>
                WATCH DEMO
              </button>
            </div>

            {/* Stats */}
            <div style={{
              display: "flex", gap: 0,
              borderTop: `1px solid ${C.borderBright}`,
              paddingTop: 24,
            }}>
              {[
                { label: "AGENTS ACTIVE", value: "19/23", color: C.cyan },
                { label: "STATIONS LIVE", value: "3", color: C.green },
                { label: "UPTIME", value: `${hh}:${mm}:${ss}`, color: C.amber },
              ].map((s, i) => (
                <div key={s.label} style={{
                  flex: 1,
                  paddingRight: i < 2 ? 24 : 0,
                  borderRight: i < 2 ? `1px solid ${C.border}` : "none",
                  paddingLeft: i > 0 ? 24 : 0,
                }}>
                  <div style={{
                    ...px, fontSize: 15, color: s.color,
                    textShadow: `0 0 20px ${s.color}88`,
                    marginBottom: 6,
                  }}>{s.value}</div>
                  <div style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.12em" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Station panel */}
          <div style={{ flex: 1, position: "relative" }}>
            {/* Glow halo */}
            <div style={{
              position: "absolute",
              inset: -40,
              background: `radial-gradient(ellipse at 50% 50%, ${C.cyan}12 0%, ${C.violet}08 40%, transparent 70%)`,
              filter: "blur(30px)",
            }} />

            {/* Main panel */}
            <div style={{
              position: "relative",
              border: `1px solid ${C.borderBright}`,
              background: C.surface,
              boxShadow: `0 0 80px ${C.cyan}14, 0 0 160px ${C.violet}08, inset 0 1px 0 ${C.borderBright}`,
            }}>
              <CornerAccent color={C.cyan} />

              {/* Title bar */}
              <div style={{
                padding: "12px 20px",
                borderBottom: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: `${C.bg}88`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, background: C.green, borderRadius: "50%", boxShadow: `0 0 8px ${C.green}` }} />
                  <span style={{ ...mono, fontSize: 7, color: C.dim, letterSpacing: "0.12em" }}>
                    ◈ ALPHA-7 DEFI OPS // LIVE FEED
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[C.red, C.amber, C.green].map((c, i) => (
                    <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, boxShadow: `0 0 8px ${c}88` }} />
                  ))}
                </div>
              </div>

              {/* Station rooms grid */}
              <div style={{ padding: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {ROLES.map((room) => (
                    <div key={room.role} style={{
                      border: `1px solid ${room.color}22`,
                      background: `linear-gradient(135deg, ${room.color}08, transparent)`,
                      padding: "10px 12px",
                      position: "relative",
                      overflow: "hidden",
                    }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, ${room.color}88, transparent)` }} />
                      <div style={{ ...mono, fontSize: 6, color: room.color, letterSpacing: "0.1em", marginBottom: 8 }}>■ {room.role}</div>

                      {/* Mini agent dots */}
                      <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
                        {Array.from({ length: room.agents }).map((_, i) => (
                          <div key={i} style={{
                            width: 12, height: 12,
                            border: `1px solid ${room.color}44`,
                            background: `${room.color}15`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <div style={{ width: 5, height: 5, background: room.color }} />
                          </div>
                        ))}
                      </div>

                      {/* Progress bar */}
                      <div style={{ height: 2, background: C.border, borderRadius: 1 }}>
                        <div style={{
                          height: "100%", width: `${room.progress}%`,
                          background: `linear-gradient(to right, ${room.color}, ${room.color}88)`,
                          boxShadow: `0 0 6px ${room.color}`,
                        }} />
                      </div>
                      <div style={{ ...mono, fontSize: 6, color: `${room.color}aa`, marginTop: 4, textAlign: "right" }}>{room.progress}%</div>
                    </div>
                  ))}
                </div>

                {/* Status footer */}
                <div style={{
                  padding: "10px 14px",
                  border: `1px solid ${C.border}`,
                  background: `${C.bg}cc`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}`, animation: "pulse-ring 2s ease-in-out infinite" }} />
                    <span style={{ ...mono, fontSize: 7, color: C.green, letterSpacing: "0.08em" }}>AUTONOMOUS · RUNNING</span>
                  </div>
                  <span style={{ ...mono, fontSize: 7, color: C.muted }}>16 / 23 AGENTS</span>
                  <span style={{ ...mono, fontSize: 7, color: C.cyan, letterSpacing: "0.08em" }}>{hh}:{mm}:{ss}</span>
                </div>
              </div>
            </div>

            {/* Side notifications */}
            <div style={{
              position: "absolute", top: 20, right: -168,
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              {[
                { text: "NEXUS-1 +340 XP", color: C.violet },
                { text: "Revenue +$240", color: C.green },
                { text: "FORGE-3 deployed", color: C.blue },
                { text: "Growth: 1.34×", color: C.cyan },
              ].map((ev, i) => (
                <div key={i} style={{
                  ...mono, fontSize: 7,
                  padding: "7px 14px",
                  background: `${ev.color}10`,
                  border: `1px solid ${ev.color}33`,
                  color: ev.color,
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                  boxShadow: `0 0 16px ${ev.color}15`,
                }}>
                  ▶ {ev.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
