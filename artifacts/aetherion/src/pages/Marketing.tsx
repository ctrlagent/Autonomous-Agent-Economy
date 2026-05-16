import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { StationCanvas } from "@/components/StationCanvas";
import { AgentAvatar } from "@/components/PixelSprite";
import { useGetDashboardSummary, useGetRecentActivity, useListTemplates, useListAgents } from "@workspace/api-client-react";
import type { StationScene } from "@/lib/stationScene";
import { Zap, Radio, Target, Store, Clock, Terminal, Cpu, Database, Globe, ArrowRight, ChevronRight } from "lucide-react";

/* ─── Design Tokens ────────────────────────────────────────────────────────── */
const px  = { fontFamily: "'Press Start 2P', monospace" };
const mono = { fontFamily: "'Space Mono', monospace" };
const C = {
  bg: "#0a0b0f", surface: "#0f1118", border: "#1e2130", muted: "#4a5580",
  cyan: "#4df0d8", violet: "#9b6dff", blue: "#4d7fff",
  amber: "#ffb84d", green: "#4dff9b", red: "#ff4d6d",
};
const ROLE_HEX: Record<string, string> = {
  research: C.cyan, strategy: C.violet, builder: C.blue,
  content: C.amber, growth: C.green, analytics: C.red, design: "#ff4d9b",
};
const roleHex = (r: string) => ROLE_HEX[r?.toLowerCase()] ?? C.blue;

/* ─── Boot Sequence ─────────────────────────────────────────────────────────── */
const BOOT_LINES = [
  "CTRL OS v1.0 — INITIALIZING...",
  "Loading autonomous agent engine........... OK",
  "Connecting to station network.............. OK",
  "Mounting mission control modules.......... OK",
  "Agent runtime: 23 units active............. ONLINE",
  "Signal lock acquired....................... STABLE",
  "SYSTEM ONLINE — ENTERING COMMAND CENTER",
];

function BootSequence({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const tick = () => {
      if (i < BOOT_LINES.length) {
        setLines(prev => [...prev, BOOT_LINES[i++]]);
        setTimeout(tick, i === BOOT_LINES.length ? 500 : 180);
      } else {
        setTimeout(() => setDone(true), 400);
        setTimeout(onDone, 1100);
      }
    };
    setTimeout(tick, 200);
  }, [onDone]);
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: C.bg, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: 40,
          }}
        >
          <div style={{ ...px, fontSize: 11, color: C.cyan, marginBottom: 32, letterSpacing: "0.08em", textShadow: `0 0 20px ${C.cyan}` }}>
            CTRL — CONTROL AGENT
          </div>
          <div style={{ width: "min(500px,90vw)", borderLeft: `2px solid ${C.cyan}`, paddingLeft: 16 }}>
            {lines.map((l, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                style={{ ...mono, fontSize: 9, color: i === lines.length - 1 ? C.amber : "#6a8a7a", lineHeight: 2, letterSpacing: "0.06em" }}>
                {l}
              </motion.div>
            ))}
            <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.6 }}
              style={{ ...mono, fontSize: 9, color: C.cyan }}>█</motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Animated Grid Background ─────────────────────────────────────────────── */
function GridBg({ opacity = 0.08 }: { opacity?: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <svg width="100%" height="100%" style={{ opacity }}>
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
        background: `radial-gradient(ellipse at center, transparent 30%, ${C.bg} 80%)`,
      }} />
    </div>
  );
}

/* ─── Section Wrapper ───────────────────────────────────────────────────────── */
function Section({ children, id, style }: { children: React.ReactNode; id?: string; style?: React.CSSProperties }) {
  return (
    <section id={id} style={{ position: "relative", overflow: "hidden", ...style }}>
      {children}
    </section>
  );
}

/* ─── Section Header ────────────────────────────────────────────────────────── */
function SectionHeader({ label, title, sub }: { label: string; title: string; sub: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      style={{ textAlign: "center", marginBottom: 56 }}>
      <div style={{ ...mono, fontSize: 9, color: C.cyan, letterSpacing: "0.2em", marginBottom: 16, textTransform: "uppercase" }}>
        ◈ {label} ◈
      </div>
      <h2 style={{ ...px, fontSize: "clamp(12px,2.5vw,20px)", color: "#fff", letterSpacing: "0.04em", lineHeight: 1.8,
        textShadow: `0 0 30px ${C.cyan}44`, marginBottom: 16 }}>
        {title}
      </h2>
      <p style={{ ...mono, fontSize: 11, color: C.muted, maxWidth: 480, margin: "0 auto", lineHeight: 1.8, letterSpacing: "0.06em" }}>
        {sub}
      </p>
    </motion.div>
  );
}

/* ─── Stat Card ─────────────────────────────────────────────────────────────── */
function StatCard({ label, value, color = C.cyan }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      border: `1px solid ${color}44`, background: `${color}08`, padding: "14px 20px",
      position: "relative",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
      <div style={{ ...px, fontSize: 18, color, textShadow: `0 0 20px ${color}`, marginBottom: 6 }}>{value}</div>
      <div style={{ ...mono, fontSize: 8, color: C.muted, letterSpacing: "0.1em" }}>{label}</div>
    </div>
  );
}

/* ─── Pixel Button ──────────────────────────────────────────────────────────── */
function PixelBtn({ children, primary, href, onClick }: { children: React.ReactNode; primary?: boolean; href?: string; onClick?: () => void }) {
  const style: React.CSSProperties = {
    ...px, fontSize: 9, padding: "14px 28px", letterSpacing: "0.06em",
    border: `2px solid ${primary ? C.cyan : C.border}`,
    background: primary ? `${C.cyan}18` : "transparent",
    color: primary ? C.cyan : C.muted,
    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
    textDecoration: "none", transition: "all 0.15s", position: "relative",
    boxShadow: primary ? `0 0 20px ${C.cyan}33` : "none",
  };
  const [hovered, setHovered] = useState(false);
  const hoverStyle: React.CSSProperties = hovered ? {
    background: primary ? `${C.cyan}30` : `${C.border}33`,
    boxShadow: `0 0 28px ${primary ? C.cyan : C.muted}44`,
    color: primary ? C.cyan : "#fff",
    borderColor: primary ? C.cyan : "#fff",
  } : {};
  if (href) return (
    <Link href={href}>
      <a style={{ ...style, ...hoverStyle }}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        {children}
      </a>
    </Link>
  );
  return (
    <button style={{ ...style, ...hoverStyle }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={onClick}>{children}</button>
  );
}

/* ─── Floating Event Popup ──────────────────────────────────────────────────── */
interface FloatingEvent { id: number; text: string; color: string; }
function FloatingEvents() {
  const [events, setEvents] = useState<FloatingEvent[]>([]);
  const EVENTS = [
    { text: "NEXUS-1 completed task +340 XP", color: C.violet },
    { text: "Revenue spike +$240 detected", color: C.green },
    { text: "FORGE-3 deployed to Arbitrum", color: C.blue },
    { text: "VECTOR-9 leveled up → LV.8", color: C.amber },
    { text: "Mission 'Get 1,000 Users' 78% →", color: C.cyan },
    { text: "ECHO-1 published DeFi thread", color: C.amber },
    { text: "Growth coefficient: 1.34 ↑", color: C.green },
  ];
  useEffect(() => {
    let counter = 0;
    const tick = () => {
      const ev = EVENTS[counter % EVENTS.length];
      counter++;
      setEvents(prev => [...prev.slice(-3), { id: Date.now(), text: ev.text, color: ev.color }]);
    };
    tick();
    const id = setInterval(tick, 3200);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ position: "absolute", bottom: 80, right: 24, zIndex: 20, display: "flex", flexDirection: "column", gap: 6, pointerEvents: "none" }}>
      <AnimatePresence>
        {events.map(ev => (
          <motion.div key={ev.id}
            initial={{ opacity: 0, x: 40, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.35 }}
            style={{ ...mono, fontSize: 8, padding: "6px 12px", background: `${ev.color}15`,
              border: `1px solid ${ev.color}44`, color: ev.color, letterSpacing: "0.06em",
              boxShadow: `0 0 12px ${ev.color}22`, whiteSpace: "nowrap" }}>
            ▶ {ev.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Scanline overlay ──────────────────────────────────────────────────────── */
function Scanlines() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)" }} />
  );
}

/* ─── 1. HERO SECTION ───────────────────────────────────────────────────────── */
function HeroSection() {
  const triggerRef = useRef<((id: string) => number) | null>(null);
  const sceneRef = useRef<StationScene | null>(null);
  const { data: summary } = useGetDashboardSummary();
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(id); }, []);
  const hh = String(Math.floor(tick / 3600)).padStart(2, "0");
  const mm = String(Math.floor((tick % 3600) / 60)).padStart(2, "0");
  const ss = String(tick % 60).padStart(2, "0");

  return (
    <Section style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <GridBg opacity={0.1} />
      <Scanlines />

      {/* Top nav */}
      <nav style={{ position: "relative", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 40px", borderBottom: `1px solid ${C.border}`, background: `${C.surface}cc` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 22 22">
            <polygon points="11,1 21,6 21,16 11,21 1,16 1,6" fill="none" stroke={C.cyan} strokeWidth="1.5" />
            <polygon points="11,5 17,8.5 17,13.5 11,17 5,13.5 5,8.5" fill="none" stroke={C.cyan} strokeWidth="0.5" opacity="0.35" />
            <text x="11" y="15.5" textAnchor="middle" fill={C.amber} fontSize="9" fontFamily="'Press Start 2P',monospace">C</text>
          </svg>
          <span style={{ ...px, fontSize: 10, color: "#fff", letterSpacing: "0.06em", textShadow: `0 0 12px ${C.cyan}55` }}>CTRL</span>
          <span style={{ ...mono, fontSize: 7, color: C.cyan, padding: "2px 6px", border: `1px solid ${C.cyan}44`, marginLeft: 8 }}>ONLINE</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["STATION", "CREW", "MISSIONS", "MARKET"].map(item => (
            <span key={item} style={{ ...mono, fontSize: 8, color: C.muted, letterSpacing: "0.1em", cursor: "pointer" }}>{item}</span>
          ))}
        </div>
        <Link href="/"><a style={{ ...px, fontSize: 8, color: C.cyan, textDecoration: "none", padding: "8px 16px",
          border: `1px solid ${C.cyan}`, background: `${C.cyan}15`, letterSpacing: "0.06em" }}>ENTER APP →</a></Link>
      </nav>

      {/* Hero content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "40px", gap: 48, position: "relative", zIndex: 10 }}>
        {/* Left copy */}
        <div style={{ flexShrink: 0, width: "min(480px,42%)" }}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div style={{ ...mono, fontSize: 8, color: C.cyan, letterSpacing: "0.2em", marginBottom: 20 }}>◈ AUTONOMOUS AGENT OS ◈</div>
            <h1 style={{ ...px, fontSize: "clamp(20px,4vw,42px)", color: "#fff", lineHeight: 1.6, letterSpacing: "0.04em",
              textShadow: `0 0 40px ${C.cyan}44`, marginBottom: 20 }}>
              CTRL<br />
              <span style={{ color: C.cyan }}>Command</span><br />
              AI Economies.
            </h1>
            <p style={{ ...mono, fontSize: 10, color: C.muted, lineHeight: 1.9, letterSpacing: "0.04em", marginBottom: 36, maxWidth: 380 }}>
              Build, deploy, and scale entire businesses with autonomous AI crews operating inside living digital stations.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
              <PixelBtn primary href="/">ENTER STATION <ArrowRight size={12} /></PixelBtn>
              <PixelBtn>VIEW LIVE SYSTEM</PixelBtn>
            </div>
            {/* Live stats strip */}
            <div style={{ display: "flex", gap: 24 }}>
              {[
                { label: "AGENTS ACTIVE", value: `${summary?.activeAgents ?? 19}/${summary?.totalAgents ?? 23}`, color: C.cyan },
                { label: "STATIONS", value: String(summary?.activeStations ?? 3), color: C.green },
                { label: "UPTIME", value: `${hh}:${mm}:${ss}`, color: C.amber },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ ...px, fontSize: 14, color: s.color, textShadow: `0 0 12px ${s.color}` }}>{s.value}</div>
                  <div style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.1em", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: Live Phaser station */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.5 }}
          style={{ flex: 1, minHeight: 480, position: "relative" }}>
          {/* Monitor frame */}
          <div style={{
            border: `2px solid ${C.cyan}44`, position: "relative",
            boxShadow: `0 0 60px ${C.cyan}20, inset 0 0 40px rgba(0,0,0,0.5)`,
            background: "rgba(0,0,0,0.6)",
          }}>
            {/* Corner accents */}
            {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
              <div key={`${v}${h}`} style={{
                position: "absolute", [v]: -2, [h]: -2, width: 16, height: 16,
                borderTop: v === "top" ? `3px solid ${C.cyan}` : "none",
                borderBottom: v === "bottom" ? `3px solid ${C.cyan}` : "none",
                borderLeft: h === "left" ? `3px solid ${C.cyan}` : "none",
                borderRight: h === "right" ? `3px solid ${C.cyan}` : "none",
              }} />
            ))}
            {/* Status bar */}
            <div style={{ padding: "6px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8, background: `${C.surface}cc` }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
              <span style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.1em" }}>ALPHA-7 DEFI OPS — LIVE FEED</span>
              <span style={{ ...mono, fontSize: 7, color: C.cyan, marginLeft: "auto" }}>SIGNAL: STABLE</span>
            </div>
            <div style={{ height: 400 }}>
              <StationCanvas
                onAgentSelect={() => {}}
                onRoomSelect={() => {}}
                triggerRef={triggerRef}
                sceneRef={sceneRef}
              />
            </div>
            <div style={{ padding: "6px 12px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 16, background: `${C.surface}cc` }}>
              {["RESEARCH LAB", "DEV LAB", "DESIGN STUDIO", "MARKETING HUB", "OPS CENTER", "ANALYTICS"].map((r, i) => {
                const colors = [C.cyan, C.blue, C.violet, C.green, C.amber, C.red];
                return <span key={r} style={{ ...mono, fontSize: 6, color: colors[i], letterSpacing: "0.06em" }}>■ {r}</span>;
              })}
            </div>
          </div>
          <FloatingEvents />
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div style={{ textAlign: "center", padding: "20px 0", position: "relative", zIndex: 10 }}>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          style={{ ...mono, fontSize: 8, color: C.muted, letterSpacing: "0.1em" }}>▼ SCROLL TO EXPLORE ▼</motion.div>
      </div>
    </Section>
  );
}

/* ─── 2. LIVE STATION PREVIEW ───────────────────────────────────────────────── */
function StationPreviewSection() {
  const { data: summary } = useGetDashboardSummary();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const ROOMS = [
    { name: "Research Lab", role: "research", agents: 2, tasks: 34, progress: 78 },
    { name: "Dev Lab", role: "builder", agents: 3, tasks: 58, progress: 91 },
    { name: "Design Studio", role: "design", agents: 2, tasks: 31, progress: 55 },
    { name: "Marketing Hub", role: "growth", agents: 2, tasks: 41, progress: 67 },
    { name: "Ops Center", role: "strategy", agents: 3, tasks: 19, progress: 34 },
    { name: "Analytics", role: "analytics", agents: 1, tasks: 29, progress: 82 },
  ];
  return (
    <Section style={{ background: C.surface, padding: "100px 60px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.05} />
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="LIVE PREVIEW" title="Your Station at a Glance" sub="Every station is a living economy — six specialized rooms, each running autonomous agents around the clock." />
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "start" }}>
          {/* Room grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {ROOMS.map((room, i) => {
              const color = roleHex(room.role);
              return (
                <motion.div key={room.name} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  style={{ border: `1px solid ${color}44`, background: `${color}08`, padding: "16px", position: "relative", cursor: "pointer" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: `linear-gradient(to right, ${color}, ${color}44)` }} />
                  <div style={{ ...mono, fontSize: 7, color, letterSpacing: "0.1em", marginBottom: 10 }}>■ {room.role.toUpperCase()}</div>
                  <div style={{ ...px, fontSize: 8, color: "#fff", marginBottom: 12, lineHeight: 1.8 }}>{room.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ ...mono, fontSize: 7, color: C.muted }}>AGENTS: <span style={{ color }}>{room.agents}</span></span>
                    <span style={{ ...mono, fontSize: 7, color: C.muted }}>TASKS: <span style={{ color }}>{room.tasks}</span></span>
                  </div>
                  <div style={{ height: 3, background: C.border }}>
                    <motion.div initial={{ width: 0 }} animate={inView ? { width: `${room.progress}%` } : {}}
                      transition={{ delay: i * 0.1 + 0.5, duration: 0.8 }}
                      style={{ height: "100%", background: color, boxShadow: `0 0 6px ${color}` }} />
                  </div>
                  <div style={{ ...mono, fontSize: 6, color, marginTop: 4, textAlign: "right" }}>{room.progress}%</div>
                </motion.div>
              );
            })}
          </div>
          {/* Stats panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <StatCard label="PLATFORM AGENTS" value={`${summary?.activeAgents ?? 19}/${summary?.totalAgents ?? 23}`} color={C.cyan} />
            <StatCard label="ACTIVE STATIONS" value={String(summary?.activeStations ?? 3)} color={C.green} />
            <StatCard label="TASKS TODAY" value={String(summary?.tasksCompletedToday ?? 6)} color={C.amber} />
            <StatCard label="OVERALL PROGRESS" value={`${Math.round(summary?.overallProgress ?? 55.4)}%`} color={C.violet} />
            {/* Revenue chart sparkline */}
            <div style={{ border: `1px solid ${C.border}`, padding: 16, background: `${C.surface}88` }}>
              <div style={{ ...mono, fontSize: 7, color: C.muted, marginBottom: 10, letterSpacing: "0.1em" }}>REVENUE 24H</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 48 }}>
                {[40,55,48,72,88,76,92,84,96,88,100,94,108,116,102,120,112,128,118,136,124,142,132,148].map((v, i) => (
                  <motion.div key={i} initial={{ height: 0 }} animate={inView ? { height: `${(v / 150) * 48}px` } : {}}
                    transition={{ delay: i * 0.02, duration: 0.5 }}
                    style={{ flex: 1, background: `${C.green}${Math.round((v / 150) * 99 + 30).toString(16)}`, minWidth: 2 }} />
                ))}
              </div>
              <div style={{ ...mono, fontSize: 8, color: C.green, marginTop: 8, textAlign: "right" }}>$3,840 TODAY</div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── 3. AGENT CREW SECTION ─────────────────────────────────────────────────── */
function AgentCrewSection() {
  const { data: agents } = useListAgents();
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let frame: number;
    let pos = 0;
    const tick = () => {
      pos += 0.5;
      if (pos >= el.scrollWidth / 2) pos = 0;
      el.scrollLeft = pos;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [agents]);

  const displayAgents = agents ?? [];
  const doubled = [...displayAgents, ...displayAgents];

  return (
    <Section style={{ background: C.bg, padding: "100px 0", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.07} />
      <div style={{ position: "relative", zIndex: 10 }}>
        <div style={{ padding: "0 60px" }}>
          <SectionHeader label="CREW SYSTEM" title="Your Autonomous Agent Army" sub="Specialized AI agents, each with defined roles, unique skills, and persistent memory — working 24/7 inside your stations." />
        </div>
        {/* Central hologram stat */}
        <motion.div animate={{ scale: [1, 1.04, 1], opacity: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 3 }}
          style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ ...mono, fontSize: 9, color: C.muted, letterSpacing: "0.2em", marginBottom: 8 }}>ACTIVE WORKFORCE</div>
          <div style={{ ...px, fontSize: "clamp(32px,6vw,72px)", color: C.cyan, textShadow: `0 0 60px ${C.cyan}, 0 0 120px ${C.cyan}44` }}>
            {displayAgents.length > 0 ? `${displayAgents.filter(a => a.status === "working").length} AGENTS` : "19 AGENTS"}
          </div>
          <div style={{ ...mono, fontSize: 8, color: C.muted, letterSpacing: "0.2em", marginTop: 4 }}>ONLINE — ALL SYSTEMS NOMINAL</div>
        </motion.div>
        {/* Scrolling crew wall */}
        <div ref={scrollRef} style={{ display: "flex", gap: 12, overflowX: "hidden", padding: "0 40px 12px", cursor: "default" }}>
          {doubled.map((agent, i) => {
            const color = roleHex(agent.role);
            return (
              <div key={i} style={{
                flexShrink: 0, width: 160, border: `1px solid ${color}33`, background: `${color}08`,
                padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                position: "relative",
              }}>
                <div style={{ position: "absolute", top: 0, width: "100%", height: 2, background: `linear-gradient(to right, ${color}, ${color}44)` }} />
                <AgentAvatar role={agent.role} size={64} />
                <div style={{ ...px, fontSize: 7, color: "#fff", letterSpacing: "0.04em", textAlign: "center" }}>{agent.name}</div>
                <div style={{ ...mono, fontSize: 7, color, padding: "2px 8px", border: `1px solid ${color}44` }}>{agent.role.toUpperCase()}</div>
                <div style={{ ...mono, fontSize: 6, color: C.muted }}>LV.{agent.level} • {agent.experience % 100}% XP</div>
                <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
                  style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
              </div>
            );
          })}
        </div>
        {/* Role legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 32, padding: "0 40px", flexWrap: "wrap" }}>
          {Object.entries(ROLE_HEX).map(([role, color]) => (
            <div key={role} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, background: color, boxShadow: `0 0 6px ${color}` }} />
              <span style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.1em" }}>{role.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── 4. SHIP COMMS SECTION ──────────────────────────────────────────────────── */
interface Msg { id: number; from: string; role: string; text: string; }
const COMMS_MESSAGES = [
  { from: "NEXUS-1", role: "strategy", text: "Commander, deep scan of sector 4 complete. No threats detected." },
  { from: "FORGE-3", role: "builder", text: "Build pipeline deployed. 3 new endpoints live and passing all tests." },
  { from: "GROW-4", role: "growth", text: "Viral loop coefficient at 1.34. Revenue trajectory optimal." },
  { from: "VECTOR-9", role: "research", text: "Alpha signal detected — large wallet accumulating PENDLE." },
  { from: "ECHO-1", role: "content", text: "22-tweet thread on restaking mechanics live — 4.2K impressions." },
  { from: "LENS-9", role: "analytics", text: "Q1 report complete. KPIs all within green thresholds." },
];

function ShipCommsSection() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const addNext = () => {
      if (i >= COMMS_MESSAGES.length) i = 0;
      const msg = COMMS_MESSAGES[i++];
      setTyping(msg.from);
      setTimeout(() => {
        setTyping(null);
        setMessages(prev => [...prev.slice(-8), { ...msg, id: Date.now() }]);
        setTimeout(addNext, 2800);
      }, 1200);
    };
    setTimeout(addNext, 600);
  }, [inView]);
  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [messages]);

  const ROLE_BARS = [
    { role: "research", pct: 87 }, { role: "strategy", pct: 72 }, { role: "builder", pct: 95 },
    { role: "content", pct: 60 }, { role: "growth", pct: 81 }, { role: "analytics", pct: 44 },
  ];

  return (
    <Section style={{ background: C.surface, padding: "100px 60px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.05} />
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="SHIP COMMS" title="AI Crew Communications" sub="Every agent reports directly to Command. Watch your autonomous crew coordinate in real time across all channels." />
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 240px", gap: 2, border: `1px solid ${C.border}`, background: C.bg }}>
          {/* Channels sidebar */}
          <div style={{ borderRight: `1px solid ${C.border}`, padding: "16px 0" }}>
            <div style={{ ...mono, fontSize: 7, color: C.muted, padding: "0 14px 12px", letterSpacing: "0.1em" }}>CREW CHANNELS</div>
            {[{ label: "#all-crew", active: true }, { label: "#research", active: false }, { label: "#builders", active: false }, { label: "#alerts", active: false }].map(ch => (
              <div key={ch.label} style={{
                ...mono, fontSize: 8, padding: "8px 14px", color: ch.active ? C.cyan : C.muted,
                background: ch.active ? `${C.cyan}12` : "transparent",
                borderLeft: ch.active ? `2px solid ${C.cyan}` : "2px solid transparent",
                cursor: "pointer", letterSpacing: "0.06em",
              }}>{ch.label}</div>
            ))}
            <div style={{ marginTop: 20, padding: "0 14px" }}>
              <div style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.1em", marginBottom: 8 }}>ONLINE AGENTS</div>
              {["NEXUS-1","FORGE-3","VECTOR-9","ECHO-1"].map(n => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, boxShadow: `0 0 4px ${C.green}` }} />
                  <span style={{ ...mono, fontSize: 7, color: C.muted }}>{n}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Message feed */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <Radio size={12} color={C.cyan} />
              <span style={{ ...mono, fontSize: 8, color: C.cyan, letterSpacing: "0.1em" }}>#ALL-CREW</span>
              <span style={{ ...mono, fontSize: 7, color: C.muted, marginLeft: "auto" }}>{messages.length} MESSAGES</span>
            </div>
            <div ref={feedRef} style={{ flex: 1, overflowY: "auto", padding: "16px", minHeight: 280, maxHeight: 280 }}>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  <AgentAvatar role={msg.role} size={28} />
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                      <span style={{ ...px, fontSize: 7, color: roleHex(msg.role) }}>{msg.from}</span>
                      <span style={{ ...mono, fontSize: 6, color: C.muted }}>{new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false})}</span>
                    </div>
                    <div style={{ ...mono, fontSize: 9, color: "#c8d0e8", lineHeight: 1.6 }}>{msg.text}</div>
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ ...mono, fontSize: 7, color: C.muted }}>{typing} is typing</span>
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{ ...mono, color: C.muted }}>...</motion.span>
                </div>
              )}
            </div>
            {/* Input */}
            <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
              <div style={{ flex: 1, ...mono, fontSize: 8, color: C.muted, padding: "8px 12px", background: `${C.surface}88`, border: `1px solid ${C.border}` }}>
                Enter command or message...
              </div>
              <button style={{ ...mono, fontSize: 8, padding: "8px 14px", background: `${C.cyan}18`, border: `1px solid ${C.cyan}44`, color: C.cyan, cursor: "pointer" }}>SEND</button>
            </div>
          </div>
          {/* Right panel */}
          <div style={{ borderLeft: `1px solid ${C.border}`, padding: "16px" }}>
            <div style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.1em", marginBottom: 12 }}>ROLE ACTIVITY</div>
            {ROLE_BARS.map(r => (
              <div key={r.role} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ ...mono, fontSize: 6, color: roleHex(r.role), letterSpacing: "0.08em" }}>{r.role.toUpperCase()}</span>
                  <span style={{ ...mono, fontSize: 6, color: C.muted }}>{r.pct}%</span>
                </div>
                <div style={{ height: 3, background: C.border }}>
                  <motion.div animate={{ width: [`${r.pct - 8}%`, `${r.pct + 8}%`, `${r.pct - 8}%`] }}
                    transition={{ repeat: Infinity, duration: 3 + r.pct / 30 }}
                    style={{ height: "100%", background: roleHex(r.role), boxShadow: `0 0 6px ${roleHex(r.role)}` }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 20 }}>
              <div style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.1em", marginBottom: 8 }}>FREQ SPECTRUM</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 40 }}>
                {Array.from({ length: 32 }, (_, i) => {
                  const h = Math.random() * 100;
                  return (
                    <motion.div key={i} animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.6}%`] }}
                      transition={{ repeat: Infinity, duration: 0.5 + Math.random(), delay: Math.random() }}
                      style={{ flex: 1, background: `${C.cyan}88`, minHeight: 2 }} />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── 5. MISSION ECONOMY ─────────────────────────────────────────────────────── */
const MISSIONS = [
  { title: "Reach $5,000 Revenue", desc: "Drive autonomous revenue to the next tier", progress: 77, target: "$5,000", current: "$3,840", xp: 500, color: C.green, locked: false },
  { title: "Launch 10 Products", desc: "Ship products across all builder nodes", progress: 70, target: "10", current: "7", xp: 300, color: C.blue, locked: false },
  { title: "Get 1,000 Users", desc: "Expand your user base through growth loops", progress: 34, target: "1000", current: "342", xp: 400, color: C.cyan, locked: false },
  { title: "Deploy 3 Contracts", desc: "Deploy smart contracts to production", progress: 0, target: "3", current: "0", xp: 250, color: C.violet, locked: true },
  { title: "Reach 90% Agent Perf.", desc: "Optimize crew for peak performance", progress: 0, target: "90%", current: "—", xp: 600, color: C.amber, locked: true },
];
function MissionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <Section style={{ background: C.bg, padding: "100px 60px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.07} />
      <div ref={ref} style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="MISSION ECONOMY" title="Progress. Reward. Scale." sub="Missions are the engine of your station economy. Complete objectives to unlock higher-tier capabilities and reward your crew." />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MISSIONS.map((m, i) => (
            <motion.div key={m.title} initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              style={{
                display: "flex", alignItems: "center", gap: 20, padding: "20px 24px",
                border: `1px solid ${m.locked ? C.border : m.color + "44"}`,
                background: m.locked ? "rgba(255,255,255,0.02)" : `${m.color}08`,
                opacity: m.locked ? 0.5 : 1, position: "relative",
              }}>
              {!m.locked && <div style={{ position: "absolute", top: 0, left: 0, width: `${m.progress}%`, height: 2, background: m.color, boxShadow: `0 0 8px ${m.color}` }} />}
              <div style={{
                width: 44, height: 44, border: `2px solid ${m.color}44`, background: `${m.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {m.locked ? <span style={{ fontSize: 16 }}>🔒</span> : <Target size={18} color={m.color} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...px, fontSize: 9, color: m.locked ? C.muted : "#fff", marginBottom: 6, letterSpacing: "0.04em" }}>{m.title}</div>
                <div style={{ ...mono, fontSize: 8, color: C.muted, marginBottom: 8 }}>{m.desc}</div>
                {!m.locked && (
                  <>
                    <div style={{ height: 4, background: C.border, marginBottom: 4 }}>
                      <motion.div initial={{ width: 0 }} animate={inView ? { width: `${m.progress}%` } : {}}
                        transition={{ delay: i * 0.1 + 0.5, duration: 1 }}
                        style={{ height: "100%", background: `linear-gradient(to right, ${m.color}88, ${m.color})`, boxShadow: `0 0 8px ${m.color}` }} />
                    </div>
                    <div style={{ ...mono, fontSize: 7, color: C.muted }}>{m.current} / {m.target} — {m.progress}%</div>
                  </>
                )}
              </div>
              <div style={{ border: `1px solid ${m.color}44`, padding: "8px 14px", background: `${m.color}10`, flexShrink: 0 }}>
                <div style={{ ...px, fontSize: 9, color: m.color }}>+{m.xp}</div>
                <div style={{ ...mono, fontSize: 6, color: C.muted }}>XP</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── 6. TEMPLATE MARKETPLACE ────────────────────────────────────────────────── */
function MarketplaceSection() {
  const { data: templates } = useListTemplates();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const ICONS: Record<string, string> = { crypto: "₿", ecommerce: "🛒", content: "📱", saas: "💻" };
  const CAT_COLORS: Record<string, string> = { crypto: C.amber, ecommerce: C.green, content: C.cyan, saas: C.violet };
  return (
    <Section style={{ background: C.surface, padding: "100px 60px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.05} />
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="MARKETPLACE" title="Deploy a Station in Seconds" sub="Pre-built station blueprints for every business model. Choose a template, name your station, and watch your AI crew get to work." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
          {(templates ?? []).map((t, i) => {
            const color = CAT_COLORS[t.category] ?? C.blue;
            const icon = ICONS[t.category] ?? "⚙️";
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -4, boxShadow: `0 8px 40px ${color}33` }}
                style={{ border: `1px solid ${color}33`, background: C.bg, padding: "24px 20px", position: "relative", cursor: "pointer" }}>
                <div style={{ position: "absolute", top: 0, width: "100%", left: 0, height: 2, background: `linear-gradient(to right, ${color}, ${color}44)` }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ fontSize: 24 }}>{icon}</div>
                  <div style={{ ...mono, fontSize: 7, color, padding: "3px 8px", border: `1px solid ${color}44`, background: `${color}15` }}>
                    {t.category.toUpperCase()}
                  </div>
                </div>
                <div style={{ ...px, fontSize: 9, color: "#fff", marginBottom: 8, lineHeight: 1.8, letterSpacing: "0.04em" }}>{t.name}</div>
                <div style={{ ...mono, fontSize: 8, color: C.muted, lineHeight: 1.7, marginBottom: 14 }}>{t.description}</div>
                <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                  <span style={{ ...mono, fontSize: 7, color: C.muted }}>👥 {t.agentCount} Agents</span>
                  <span style={{ ...mono, fontSize: 7, color: C.muted }}>🏢 {t.roomCount} Rooms</span>
                  <span style={{ ...mono, fontSize: 7, color: C.amber }}>★ {t.rating}</span>
                </div>
                <div style={{ height: 1, background: C.border, marginBottom: 14 }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ ...mono, fontSize: 7, color: C.muted }}>{t.usageCount?.toLocaleString()} deployed</span>
                  <motion.button whileHover={{ scale: 1.05 }}
                    style={{ ...mono, fontSize: 7, color, padding: "5px 12px", border: `1px solid ${color}44`, background: `${color}10`, cursor: "pointer" }}>
                    DEPLOY →
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ─── 7. TIMELINE / ACTIVITY ─────────────────────────────────────────────────── */
function TimelineSection() {
  const { data: activity } = useGetRecentActivity({ limit: 20 });
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <Section style={{ background: C.bg, padding: "100px 60px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.07} />
      <div ref={ref} style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="LIVE ACTIVITY" title="Your Station, Live" sub="Every agent action, mission update, and revenue event — recorded in real time across your entire agent economy." />
        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: 16, top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom, ${C.cyan}44, transparent)` }} />
          {(activity ?? []).slice(0, 12).map((item, i) => {
            const color = roleHex(item.agentRole ?? "");
            return (
              <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                style={{ display: "flex", gap: 20, marginBottom: 20, paddingLeft: 44, position: "relative" }}>
                {/* Dot */}
                <div style={{
                  position: "absolute", left: 9, top: 4, width: 14, height: 14,
                  border: `2px solid ${color}`, background: `${color}33`,
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
                </div>
                <div style={{ flex: 1, border: `1px solid ${color}22`, background: `${color}05`, padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ ...px, fontSize: 7, color }}>{item.agentName}</span>
                    <span style={{ ...mono, fontSize: 7, color: C.muted }}>{new Date(item.timestamp ?? "").toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false})}</span>
                  </div>
                  <div style={{ ...mono, fontSize: 9, color: "#d0d8f0", marginBottom: 4 }}>{item.action}</div>
                  {item.details && <div style={{ ...mono, fontSize: 8, color: C.muted, lineHeight: 1.6 }}>{item.details}</div>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ─── 8. ARCHITECTURE SECTION ────────────────────────────────────────────────── */
const ARCH = [
  { label: "React 19", icon: <Globe size={16} />, color: C.cyan, sub: "UI Layer", x: 0 },
  { label: "Vite 7", icon: <Zap size={16} />, color: C.amber, sub: "Build", x: 1 },
  { label: "Tailwind v4", icon: <Terminal size={16} />, color: C.violet, sub: "Styling", x: 2 },
  { label: "Phaser 3", icon: <Target size={16} />, color: C.green, sub: "Station Engine", x: 3 },
  { label: "Express 5", icon: <Radio size={16} />, color: C.blue, sub: "API Layer", x: 0 },
  { label: "Drizzle ORM", icon: <Database size={16} />, color: C.cyan, sub: "Data Layer", x: 1 },
  { label: "PostgreSQL", icon: <Database size={16} />, color: C.violet, sub: "Database", x: 2 },
  { label: "Framer Motion", icon: <Cpu size={16} />, color: C.amber, sub: "Animation", x: 3 },
];
function ArchSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <Section style={{ background: C.surface, padding: "100px 60px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.05} />
      <div ref={ref} style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="ARCHITECTURE" title="Built for Scale" sub="A full-stack autonomous agent platform — from pixel dungeon simulation to live API infrastructure." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {ARCH.map((node, i) => (
            <motion.div key={node.label} initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              style={{
                border: `1px solid ${node.color}44`, background: `${node.color}08`, padding: "24px 16px",
                textAlign: "center", position: "relative",
              }}>
              <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", width: "60%", height: 2, background: node.color, boxShadow: `0 0 8px ${node.color}` }} />
              <div style={{ color: node.color, marginBottom: 12, display: "flex", justifyContent: "center" }}>{node.icon}</div>
              <div style={{ ...px, fontSize: 8, color: "#fff", letterSpacing: "0.04em", marginBottom: 6 }}>{node.label}</div>
              <div style={{ ...mono, fontSize: 7, color: node.color, letterSpacing: "0.1em" }}>{node.sub}</div>
            </motion.div>
          ))}
        </div>
        {/* System flow */}
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.8 }}
          style={{ marginTop: 48, border: `1px solid ${C.border}`, padding: "32px", background: C.bg }}>
          <div style={{ ...mono, fontSize: 8, color: C.muted, letterSpacing: "0.1em", marginBottom: 24, textAlign: "center" }}>SYSTEM DATA FLOW</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {["Commander Input", "→", "CTRL OS", "→", "Agent Runtime", "→", "Mission Engine", "→", "Revenue Output"].map((item, i) => (
              <span key={i} style={{
                ...mono, fontSize: 8,
                color: item === "→" ? C.muted : C.cyan,
                padding: item === "→" ? "0" : "8px 14px",
                border: item === "→" ? "none" : `1px solid ${C.cyan}33`,
                background: item === "→" ? "transparent" : `${C.cyan}08`,
                letterSpacing: "0.06em",
              }}>{item}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ─── 9. FINAL CTA ───────────────────────────────────────────────────────────── */
function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <Section style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.12} />
      {/* Pulsing orb */}
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 4 }}
        style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: `radial-gradient(ellipse, ${C.cyan}15 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div ref={ref} style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 700 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          {/* Rotating hex logo */}
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            style={{ display: "inline-block", marginBottom: 40 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <polygon points="40,4 72,22 72,58 40,76 8,58 8,22" fill="none" stroke={C.cyan} strokeWidth="2" />
              <polygon points="40,18 60,29 60,51 40,62 20,51 20,29" fill="none" stroke={C.cyan} strokeWidth="0.8" opacity="0.4" />
              <text x="40" y="50" textAnchor="middle" fill={C.amber} fontSize="22" fontFamily="'Press Start 2P',monospace">C</text>
            </svg>
          </motion.div>
          <motion.h2 initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}
            style={{ ...px, fontSize: "clamp(16px,3.5vw,36px)", color: "#fff", lineHeight: 1.8, letterSpacing: "0.04em",
              textShadow: `0 0 60px ${C.cyan}55`, marginBottom: 20 }}>
            Command Your Agents.<br />
            <span style={{ color: C.cyan }}>Control Your Economy.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
            style={{ ...mono, fontSize: 11, color: C.muted, lineHeight: 1.9, marginBottom: 48, letterSpacing: "0.04em" }}>
            The operating system for autonomous AI civilizations.<br />
            Your crew is ready. Your station is waiting.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.7 }}
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 60 }}>
            <PixelBtn primary href="/">LAUNCH CTRL <Zap size={12} /></PixelBtn>
            <PixelBtn href="/">ENTER COMMAND CENTER <ChevronRight size={12} /></PixelBtn>
          </motion.div>
          {/* Footer stats */}
          <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap" }}>
            {[["23", "AGENTS"], ["3", "STATIONS"], ["6", "ROOM TYPES"], ["9", "MISSION TIERS"]].map(([v, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ ...px, fontSize: 20, color: C.cyan, textShadow: `0 0 20px ${C.cyan}` }}>{v}</div>
                <div style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.12em", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      {/* Footer */}
      <div style={{ position: "absolute", bottom: 24, ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.1em" }}>
        CTRL v1.0 — CONTROL AGENT ECONOMY OS — ALL SYSTEMS NOMINAL
      </div>
    </Section>
  );
}

/* ─── MAIN EXPORT ────────────────────────────────────────────────────────────── */
export default function Marketing() {
  const [booted, setBooted] = useState(false);
  const handleDone = useCallback(() => setBooted(true), []);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", overflowX: "hidden" }}>
      {/* Global font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0b0f; }
        ::-webkit-scrollbar-thumb { background: #1e2130; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(0.8)} }
      `}</style>

      <BootSequence onDone={handleDone} />

      <AnimatePresence>
        {booted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <HeroSection />
            <StationPreviewSection />
            <AgentCrewSection />
            <ShipCommsSection />
            <MissionSection />
            <MarketplaceSection />
            <TimelineSection />
            <ArchSection />
            <CTASection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
