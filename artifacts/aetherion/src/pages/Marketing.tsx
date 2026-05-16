import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { StationCanvas } from "@/components/StationCanvas";
import { AgentAvatar } from "@/components/PixelSprite";
import {
  useGetDashboardSummary,
  useGetRecentActivity,
  useListTemplates,
  useListAgents,
} from "@workspace/api-client-react";
import type { StationScene } from "@/lib/stationScene";
import {
  Zap,
  Radio,
  Target,
  Store,
  Clock,
  Terminal,
  Cpu,
  Database,
  Globe,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

/* ─── Design Tokens ────────────────────────────────────────────────────────── */
const px = { fontFamily: "'Press Start 2P', monospace" };
const mono = { fontFamily: "'Space Mono', monospace" };
const C = {
  bg: "#0a0b0f",
  surface: "#0f1118",
  border: "#1e2130",
  muted: "#4a5580",
  cyan: "#4df0d8",
  violet: "#9b6dff",
  blue: "#4d7fff",
  amber: "#ffb84d",
  green: "#4dff9b",
  red: "#ff4d6d",
};
const ROLE_HEX: Record<string, string> = {
  research: C.cyan,
  strategy: C.violet,
  builder: C.blue,
  content: C.amber,
  growth: C.green,
  analytics: C.red,
  design: "#ff4d9b",
};
const roleHex = (r: string) => ROLE_HEX[r?.toLowerCase()] ?? C.blue;

/* ─── 3D Tilt Hook ──────────────────────────────────────────────────────────── */
function use3DTilt(strength = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateZ(4px)`;
    el.style.transition = "transform 0.05s ease";
  }, [strength]);
  const handleMouseLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
      ref.current.style.transition = "transform 0.4s ease";
    }
  }, []);
  return { ref, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}

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
        setLines((prev) => [...prev, BOOT_LINES[i++]]);
        setTimeout(tick, i === BOOT_LINES.length ? 500 : 160);
      } else {
        setTimeout(() => setDone(true), 350);
        setTimeout(onDone, 950);
      }
    };
    setTimeout(tick, 180);
  }, [onDone]);
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
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
          }}
        >
          <div style={{
            position: "absolute",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center, ${C.cyan}18 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative", textAlign: "center", marginBottom: 48 }}>
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              style={{ ...mono, fontSize: 10, color: C.cyan, letterSpacing: "0.28em", marginBottom: 16 }}
            >
              ◈ ◈ ◈ AUTONOMOUS AGENT OS ◈ ◈ ◈
            </motion.div>
            <div style={{ ...px, fontSize: 22, color: C.cyan, letterSpacing: "0.18em", textShadow: `0 0 40px ${C.cyan}, 0 0 80px ${C.cyan}44` }}>
              CTRL
            </div>
          </div>
          <div style={{ width: "min(560px,90vw)", border: `1px solid ${C.cyan}44`, background: `${C.surface}cc`, position: "relative" }}>
            {(([["top","left"],["top","right"],["bottom","left"],["bottom","right"]] as const)).map(([v,h]) => (
              <div key={`${v}${h}`} style={{ position: "absolute", [v]: -1, [h]: -1, width: 14, height: 14, borderTop: v === "top" ? `2px solid ${C.cyan}` : "none", borderBottom: v === "bottom" ? `2px solid ${C.cyan}` : "none", borderLeft: h === "left" ? `2px solid ${C.cyan}` : "none", borderRight: h === "right" ? `2px solid ${C.cyan}` : "none" }} />
            ))}
            <div style={{ padding: "8px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8, background: `${C.bg}88` }}>
              <span style={{ ...mono, fontSize: 8, color: "#5a7a6a", letterSpacing: "0.12em" }}>CTRL://SYSTEM/BOOT_LOG</span>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}`, marginLeft: "auto" }} />
            </div>
            <div style={{ padding: "16px 20px 12px" }}>
              {lines.map((l, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} style={{ ...mono, fontSize: 11, color: i === lines.length - 1 ? C.amber : "#5a7a6a", lineHeight: 2.2, letterSpacing: "0.05em", borderLeft: i === lines.length - 1 ? `2px solid ${C.amber}` : "2px solid transparent", paddingLeft: 8 }}>
                  {l}
                </motion.div>
              ))}
              <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.55 }} style={{ ...mono, fontSize: 11, color: C.cyan, paddingLeft: 10 }}>█</motion.span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Ambient Floating Data Background ─────────────────────────────────────── */
const AMBIENT_DATA = [
  "0x4DF0D8", "SYS.READY", "0xFF4D6D", "A3:B7:2F:91", "NODE_OK",
  "0x9B6DFF", "PKT: 4921", "SYNC ✓", "0x4D7FFF", "ERR: NULL",
  "AGENT.RDY", "0xFFB84D", "TX: 0x8A3", "ONLINE", "0x4DFF9B",
  "CPU: 12%", "MEM: 43%", "NET: ↑↓", "▶ TASK", "[ IDLE ]",
];

function FloatingDataBg({ color = C.cyan }: { color?: string }) {
  const positions = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      left: `${(i * 17 + 5) % 95}%`,
      top: `${(i * 13 + 8) % 88}%`,
      delay: i * 0.4,
      text: AMBIENT_DATA[i % AMBIENT_DATA.length],
      opacity: 0.04 + (i % 4) * 0.015,
    }))
  ).current;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* Dot grid */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(circle, ${color}22 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        opacity: 0.4,
      }} />
      {/* Floating text data */}
      {positions.map((p, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [p.opacity, p.opacity * 2.5, p.opacity], y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4 + i * 0.3, delay: p.delay, ease: "easeInOut" }}
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            ...mono,
            fontSize: 7,
            color,
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
          }}
        >
          {p.text}
        </motion.div>
      ))}
      {/* Scanning horizontal line */}
      <motion.div
        animate={{ top: ["-2%", "102%"] }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(to right, transparent, ${color}20, transparent)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/* ─── Presentation Frame ────────────────────────────────────────────────────── */
function PresentationFrame({
  children,
  color = C.cyan,
  title,
  float = true,
  scale = 1,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  title?: string;
  float?: boolean;
  scale?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      animate={float ? { y: [0, -10, 0] } : {}}
      transition={float ? { repeat: Infinity, duration: 5, ease: "easeInOut" } : {}}
      style={{ transformOrigin: "top center", ...style }}
    >
      <motion.div
        animate={{ boxShadow: [`0 0 30px ${color}22, 0 0 60px ${color}0a`, `0 0 50px ${color}44, 0 0 100px ${color}18`, `0 0 30px ${color}22, 0 0 60px ${color}0a`] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        style={{
          border: `1px solid ${color}55`,
          background: "rgba(10,11,15,0.92)",
          position: "relative",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        {/* Corner accents */}
        {(([["top","left"],["top","right"],["bottom","left"],["bottom","right"]] as const)).map(([v,h]) => (
          <div key={`${v}${h}`} style={{ position: "absolute", [v]: -1, [h]: -1, width: 20, height: 20, borderTop: v === "top" ? `2px solid ${color}` : "none", borderBottom: v === "bottom" ? `2px solid ${color}` : "none", borderLeft: h === "left" ? `2px solid ${color}` : "none", borderRight: h === "right" ? `2px solid ${color}` : "none", zIndex: 2 }} />
        ))}
        {/* Title bar */}
        <div style={{ padding: "7px 14px", borderBottom: `1px solid ${color}22`, display: "flex", alignItems: "center", gap: 8, background: `${C.surface}dd` }}>
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
          {title && <span style={{ ...mono, fontSize: 8, color, letterSpacing: "0.1em" }}>{title}</span>}
          <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
            {[C.red, C.amber, C.green].map((c, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: c, opacity: 0.6 }} />)}
          </div>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─── Animated Grid Background ─────────────────────────────────────────────── */
let _gridId = 0;
function GridBg({ opacity = 0.08 }: { opacity?: number }) {
  const id = useRef(`g${++_gridId}`).current;
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 3000], [0, -180]);
  return (
    <motion.div
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", y }}
    >
      <svg width="100%" height="100%" style={{ opacity }}>
        <defs>
          <pattern id={`${id}-sm`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={C.cyan} strokeWidth="0.5" />
          </pattern>
          <pattern id={`${id}-lg`} width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke={C.cyan} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id}-sm)`} />
        <rect width="100%" height="100%" fill={`url(#${id}-lg)`} />
      </svg>
      <div style={{ position: "absolute", top: "10%", left: "15%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(ellipse, ${C.cyan}0d 0%, transparent 65%)`, filter: "blur(32px)" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "10%", width: 480, height: 480, borderRadius: "50%", background: `radial-gradient(ellipse, ${C.violet}0b 0%, transparent 65%)`, filter: "blur(32px)" }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, transparent 20%, ${C.bg} 75%)` }} />
    </motion.div>
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
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ textAlign: "center", marginBottom: 48 }}>
      <div style={{ ...mono, fontSize: 8, color: C.cyan, letterSpacing: "0.24em", marginBottom: 14, textTransform: "uppercase" }}>◈ {label} ◈</div>
      <h2 style={{ ...px, fontSize: "clamp(13px,2.2vw,20px)", color: "#fff", letterSpacing: "0.06em", lineHeight: 1.9, textShadow: `0 0 40px ${C.cyan}55`, marginBottom: 16 }}>{title}</h2>
      <p style={{ ...mono, fontSize: 11, color: "#6a7a9a", maxWidth: 480, margin: "0 auto", lineHeight: 2, letterSpacing: "0.04em" }}>{sub}</p>
    </motion.div>
  );
}

/* ─── Tilt Wrapper — safe single component wrapper for tilt hook ────────────── */
function TiltCard({ children, strength = 8, style }: { children: React.ReactNode; strength?: number; style?: React.CSSProperties }) {
  const tilt = use3DTilt(strength);
  return <div ref={tilt.ref} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} style={style}>{children}</div>;
}

/* ─── Stat Card ─────────────────────────────────────────────────────────────── */
function StatCard({ label, value, color = C.cyan }: { label: string; value: string; color?: string }) {
  const tilt = use3DTilt(6);
  return (
    <div ref={tilt.ref} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} style={{ border: `1px solid ${color}55`, background: `${color}0d`, padding: "16px 20px", position: "relative", boxShadow: `0 0 24px ${color}10`, cursor: "default" }}>
      {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
        <div key={`${v}${h}`} style={{ position: "absolute", [v]: -1, [h]: -1, width: 10, height: 10, borderTop: v === "top" ? `2px solid ${color}` : "none", borderBottom: v === "bottom" ? `2px solid ${color}` : "none", borderLeft: h === "left" ? `2px solid ${color}` : "none", borderRight: h === "right" ? `2px solid ${color}` : "none" }} />
      ))}
      <div style={{ ...px, fontSize: 17, color, textShadow: `0 0 24px ${color}`, marginBottom: 6 }}>{value}</div>
      <div style={{ ...mono, fontSize: 8, color: "#6a7a9a", letterSpacing: "0.12em" }}>{label}</div>
    </div>
  );
}

/* ─── Pixel Button ──────────────────────────────────────────────────────────── */
function PixelBtn({ children, primary, href, onClick }: { children: React.ReactNode; primary?: boolean; href?: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const style: React.CSSProperties = primary
    ? { ...px, fontSize: 9, padding: "14px 28px", letterSpacing: "0.08em", border: `2px solid ${C.cyan}`, background: hovered ? C.cyan : `${C.cyan}22`, color: hovered ? C.bg : C.cyan, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", transition: "all 0.18s ease", position: "relative", boxShadow: hovered ? `0 0 40px ${C.cyan}66, 0 0 80px ${C.cyan}22` : `0 0 24px ${C.cyan}33` }
    : { ...px, fontSize: 9, padding: "14px 28px", letterSpacing: "0.08em", border: `2px solid ${hovered ? "#fff" : C.border}`, background: hovered ? `${C.border}55` : "transparent", color: hovered ? "#fff" : "#6a7a9a", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", transition: "all 0.18s ease", position: "relative" };
  if (href) return <Link href={href} style={style} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>{children}</Link>;
  return <button style={style} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onClick}>{children}</button>;
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
      setEvents((prev) => [...prev.slice(-3), { id: Date.now(), text: ev.text, color: ev.color }]);
    };
    tick();
    const id = setInterval(tick, 3200);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ position: "absolute", bottom: 16, right: 16, zIndex: 20, display: "flex", flexDirection: "column", gap: 7, pointerEvents: "none", maxWidth: 260 }}>
      <AnimatePresence>
        {events.map((ev) => (
          <motion.div key={ev.id} initial={{ opacity: 0, x: 50, scale: 0.88 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.9 }} transition={{ duration: 0.32, type: "spring", stiffness: 260, damping: 22 }} style={{ ...mono, fontSize: 9, padding: "7px 12px", background: `${ev.color}18`, border: `1px solid ${ev.color}55`, color: ev.color, letterSpacing: "0.04em", boxShadow: `0 0 16px ${ev.color}25`, whiteSpace: "nowrap" }}>
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
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)" }} />
  );
}

/* ─── 1. HERO SECTION ───────────────────────────────────────────────────────── */
function HeroSection() {
  const triggerRef = useRef<((id: string) => number) | null>(null);
  const sceneRef = useRef<StationScene | null>(null);
  const { data: summary } = useGetDashboardSummary();
  const [tick, setTick] = useState(0);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 80]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(Math.floor(tick / 3600)).padStart(2, "0");
  const mm = String(Math.floor((tick % 3600) / 60)).padStart(2, "0");
  const ss = String(tick % 60).padStart(2, "0");

  return (
    <Section style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <motion.div style={{ position: "absolute", inset: 0, y: bgY, pointerEvents: "none" }}>
        <GridBg opacity={0.1} />
        <FloatingDataBg color={C.cyan} />
      </motion.div>
      <Scanlines />

      {/* Top nav */}
      <nav style={{ position: "relative", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 40px", borderBottom: `1px solid ${C.border}`, background: `${C.surface}dd`, backdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="26" height="26" viewBox="0 0 28 28">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke={C.cyan} strokeWidth="1.8" />
            <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="none" stroke={C.cyan} strokeWidth="0.6" opacity="0.4" />
            <text x="14" y="19" textAnchor="middle" fill={C.amber} fontSize="10" fontFamily="'Press Start 2P',monospace">C</text>
          </svg>
          <span style={{ ...px, fontSize: 11, color: "#fff", letterSpacing: "0.08em", textShadow: `0 0 16px ${C.cyan}66` }}>CTRL</span>
          <span style={{ ...mono, fontSize: 7, color: C.cyan, padding: "3px 8px", border: `1px solid ${C.cyan}55`, background: `${C.cyan}10`, marginLeft: 6, display: "flex", alignItems: "center", gap: 5 }}>
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
            ONLINE
          </span>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {["STATION", "CREW", "MISSIONS", "MARKET"].map((item) => (
            <span key={item} style={{ ...mono, fontSize: 8, color: "#5a6a8a", letterSpacing: "0.12em", cursor: "pointer", transition: "color 0.15s" }} onMouseEnter={e => (e.currentTarget.style.color = C.cyan)} onMouseLeave={e => (e.currentTarget.style.color = "#5a6a8a")}>{item}</span>
          ))}
        </div>
        <Link href="/app" style={{ ...px, fontSize: 8, color: C.bg, textDecoration: "none", padding: "9px 18px", border: `2px solid ${C.cyan}`, background: C.cyan, letterSpacing: "0.08em", boxShadow: `0 0 20px ${C.cyan}44`, transition: "all 0.18s" }}>
          ENTER APP →
        </Link>
      </nav>

      {/* Hero content — editorial two-column */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1.1fr", alignItems: "center", padding: "40px 56px", gap: 56, position: "relative", zIndex: 10, maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        {/* Left copy */}
        <motion.div initial={{ opacity: 0, x: -36 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }} style={{ ...mono, fontSize: 8, color: C.cyan, letterSpacing: "0.24em", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}>◈</motion.span>
            AUTONOMOUS AGENT OS
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.8, delay: 0.9 }}>◈</motion.span>
          </motion.div>
          <h1 style={{ ...px, fontSize: "clamp(20px,3.6vw,42px)", color: "#fff", lineHeight: 1.65, letterSpacing: "0.04em", textShadow: `0 0 60px ${C.cyan}44`, marginBottom: 20 }}>
            CTRL<br />
            <span style={{ color: C.cyan, textShadow: `0 0 40px ${C.cyan}88, 0 0 80px ${C.cyan}33` }}>Command</span><br />
            AI Economies.
          </h1>
          <p style={{ ...mono, fontSize: 11, color: "#8a9ab8", lineHeight: 2, letterSpacing: "0.04em", marginBottom: 36, maxWidth: 380 }}>
            Build, deploy, and scale entire businesses with autonomous AI crews operating inside living digital stations.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
            <PixelBtn primary href="/app">ENTER STATION <ArrowRight size={13} /></PixelBtn>
            <PixelBtn>VIEW LIVE SYSTEM</PixelBtn>
          </div>
          {/* Live stats strip */}
          <div style={{ display: "flex", gap: 0, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
            {[
              { label: "AGENTS ACTIVE", value: `${summary?.activeAgents ?? 19}/${summary?.totalAgents ?? 23}`, color: C.cyan },
              { label: "STATIONS", value: String(summary?.activeStations ?? 3), color: C.green },
              { label: "UPTIME", value: `${hh}:${mm}:${ss}`, color: C.amber },
            ].map((s, i) => (
              <div key={s.label} style={{ paddingRight: 24, marginRight: 24, borderRight: i < 2 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ ...px, fontSize: 13, color: s.color, textShadow: `0 0 16px ${s.color}`, marginBottom: 5 }}>{s.value}</div>
                <div style={{ ...mono, fontSize: 7, color: "#5a6a8a", letterSpacing: "0.12em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Live Phaser station in presentation frame */}
        <motion.div initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ position: "relative" }}>
          {/* Atmospheric glow */}
          <div style={{ position: "absolute", inset: -40, borderRadius: 4, background: `radial-gradient(ellipse, ${C.cyan}12 0%, transparent 70%)`, filter: "blur(30px)", pointerEvents: "none", zIndex: 0 }} />
          <PresentationFrame color={C.cyan} title="ALPHA-7 DEFI OPS — LIVE FEED" float style={{ position: "relative", zIndex: 1 }}>
            <div style={{ height: 440, overflow: "hidden" }}>
              <StationCanvas onAgentSelect={() => {}} onRoomSelect={() => {}} triggerRef={triggerRef} sceneRef={sceneRef} />
            </div>
            <div style={{ padding: "7px 14px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 12, flexWrap: "wrap", background: `${C.surface}dd` }}>
              {["RESEARCH", "DEV", "DESIGN", "MARKETING", "OPS", "ANALYTICS"].map((r, i) => {
                const colors = [C.cyan, C.blue, C.violet, C.green, C.amber, C.red];
                return <span key={r} style={{ ...mono, fontSize: 7, color: colors[i], letterSpacing: "0.06em" }}>■ {r}</span>;
              })}
            </div>
          </PresentationFrame>
          <FloatingEvents />
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div style={{ textAlign: "center", padding: "20px 0", position: "relative", zIndex: 10 }}>
        <motion.div animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }} style={{ ...mono, fontSize: 8, color: "#4a5a70", letterSpacing: "0.16em", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <span style={{ width: 40, height: 1, background: `linear-gradient(to left, ${C.border}, transparent)`, display: "inline-block" }} />
          SCROLL TO EXPLORE
          <span style={{ width: 40, height: 1, background: `linear-gradient(to right, ${C.border}, transparent)`, display: "inline-block" }} />
        </motion.div>
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
    <Section style={{ background: C.surface, padding: "90px 60px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.05} />
      <FloatingDataBg color={C.violet} />
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="LIVE PREVIEW" title="Your Station at a Glance" sub="Every station is a living economy — six specialized rooms, each running autonomous agents around the clock." />
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 32, alignItems: "start" }}>
          {/* Room grid in presentation frame */}
          <PresentationFrame color={C.cyan} title="STATION_ALPHA-7 // ROOM OVERVIEW" float={false}>
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {ROOMS.map((room, i) => {
                const color = roleHex(room.role);
                return (
                  <TiltCard key={room.name} strength={8} style={{ position: "relative" }}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      style={{ border: `1px solid ${color}44`, background: `${color}08`, padding: "14px 12px", position: "relative", cursor: "pointer", height: "100%" }}
                    >
                      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: `linear-gradient(to right, ${color}, ${color}44)` }} />
                      <div style={{ ...mono, fontSize: 6, color, letterSpacing: "0.1em", marginBottom: 8 }}>■ {room.role.toUpperCase()}</div>
                      <div style={{ ...px, fontSize: 7, color: "#fff", marginBottom: 10, lineHeight: 1.8 }}>{room.name}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                        <span style={{ ...mono, fontSize: 6, color: C.muted }}>AGT: <span style={{ color }}>{room.agents}</span></span>
                        <span style={{ ...mono, fontSize: 6, color: C.muted }}>TSK: <span style={{ color }}>{room.tasks}</span></span>
                      </div>
                      <div style={{ height: 3, background: C.border }}>
                        <motion.div initial={{ width: 0 }} animate={inView ? { width: `${room.progress}%` } : {}} transition={{ delay: i * 0.1 + 0.5, duration: 0.8 }} style={{ height: "100%", background: color, boxShadow: `0 0 6px ${color}` }} />
                      </div>
                      <div style={{ ...mono, fontSize: 6, color, marginTop: 3, textAlign: "right" }}>{room.progress}%</div>
                    </motion.div>
                  </TiltCard>
                );
              })}
            </div>
          </PresentationFrame>

          {/* Stats panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <StatCard label="PLATFORM AGENTS" value={`${summary?.activeAgents ?? 19}/${summary?.totalAgents ?? 23}`} color={C.cyan} />
            <StatCard label="ACTIVE STATIONS" value={String(summary?.activeStations ?? 3)} color={C.green} />
            <StatCard label="TASKS TODAY" value={String(summary?.tasksCompletedToday ?? 6)} color={C.amber} />
            <StatCard label="OVERALL PROGRESS" value={`${Math.round(summary?.overallProgress ?? 55.4)}%`} color={C.violet} />
            {/* Revenue sparkline */}
            <div style={{ border: `1px solid ${C.border}`, padding: 14, background: `${C.surface}88` }}>
              <div style={{ ...mono, fontSize: 7, color: C.muted, marginBottom: 8, letterSpacing: "0.1em" }}>REVENUE 24H</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 44 }}>
                {[40,55,48,72,88,76,92,84,96,88,100,94,108,116,102,120,112,128,118,136,124,142,132,148].map((v, i) => (
                  <motion.div key={i} initial={{ height: 0 }} animate={inView ? { height: `${(v / 150) * 44}px` } : {}} transition={{ delay: i * 0.02, duration: 0.5 }} style={{ flex: 1, background: `${C.green}${Math.round((v / 150) * 99 + 30).toString(16)}`, minWidth: 2 }} />
                ))}
              </div>
              <div style={{ ...mono, fontSize: 8, color: C.green, marginTop: 6, textAlign: "right" }}>$3,840 TODAY</div>
            </div>
            {/* Decorative ambient stats */}
            <div style={{ border: `1px solid ${C.border}`, padding: "12px 14px", background: `${C.surface}44` }}>
              {[["NET I/O", "↑ 2.4 MB/s", C.blue], ["LATENCY", "12ms", C.green], ["PKT LOSS", "0.0%", C.cyan]].map(([k, v, c]) => (
                <div key={String(k)} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.08em" }}>{k}</span>
                  <span style={{ ...mono, fontSize: 7, color: String(c) }}>{v}</span>
                </div>
              ))}
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
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

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
    <Section style={{ background: C.bg, padding: "90px 0", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.07} />
      <FloatingDataBg color={C.cyan} />
      <div ref={ref} style={{ position: "relative", zIndex: 10 }}>
        <div style={{ padding: "0 60px" }}>
          <SectionHeader label="CREW SYSTEM" title="Your Autonomous Agent Army" sub="Specialized AI agents, each with defined roles, unique skills, and persistent memory — working 24/7 inside your stations." />
        </div>

        {/* Central stat — reduced font size */}
        <motion.div animate={{ scale: [1, 1.02, 1], opacity: [0.85, 1, 0.85] }} transition={{ repeat: Infinity, duration: 3 }} style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ ...mono, fontSize: 8, color: C.muted, letterSpacing: "0.2em", marginBottom: 6 }}>ACTIVE WORKFORCE</div>
          <div style={{ ...px, fontSize: "clamp(22px,4vw,44px)", color: C.cyan, textShadow: `0 0 60px ${C.cyan}, 0 0 120px ${C.cyan}44` }}>
            {displayAgents.length > 0 ? `${displayAgents.filter((a) => a.status === "working").length} AGENTS` : "19 AGENTS"}
          </div>
          <div style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.2em", marginTop: 4 }}>ONLINE — ALL SYSTEMS NOMINAL</div>
        </motion.div>

        {/* Scrolling crew wall with fade edges */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(to right, ${C.bg}, transparent)`, zIndex: 10, pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(to left, ${C.bg}, transparent)`, zIndex: 10, pointerEvents: "none" }} />
          <div ref={scrollRef} style={{ display: "flex", gap: 10, overflowX: "hidden", padding: "0 80px 12px", cursor: "default" }}>
            {doubled.map((agent, i) => {
              const color = roleHex(agent.role);
              return (
                <TiltCard key={i} strength={7} style={{ flexShrink: 0, width: 148 }}>
                  <div style={{ border: `1px solid ${color}33`, background: `${color}08`, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, position: "relative", cursor: "pointer" }}>
                    <div style={{ position: "absolute", top: 0, width: "100%", height: 2, background: `linear-gradient(to right, ${color}, ${color}44)` }} />
                    <AgentAvatar role={agent.role} size={56} />
                    <div style={{ ...px, fontSize: 6, color: "#fff", letterSpacing: "0.04em", textAlign: "center" }}>{agent.name}</div>
                    <div style={{ ...mono, fontSize: 6, color, padding: "2px 8px", border: `1px solid ${color}44` }}>{agent.role.toUpperCase()}</div>
                    <div style={{ ...mono, fontSize: 6, color: C.muted }}>LV.{agent.level} • {agent.experience % 100}% XP</div>
                    <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }} style={{ width: 5, height: 5, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>

        {/* Role legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 28, padding: "0 40px", flexWrap: "wrap" }}>
          {Object.entries(ROLE_HEX).map(([role, color]) => (
            <div key={role} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, background: color, boxShadow: `0 0 5px ${color}` }} />
              <span style={{ ...mono, fontSize: 6, color: C.muted, letterSpacing: "0.1em" }}>{role.toUpperCase()}</span>
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

const ROLE_BARS = [
  { role: "research", pct: 87 },
  { role: "strategy", pct: 72 },
  { role: "builder", pct: 95 },
  { role: "content", pct: 60 },
  { role: "growth", pct: 81 },
  { role: "analytics", pct: 44 },
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
        setMessages((prev) => [...prev.slice(-8), { ...msg, id: Date.now() }]);
        setTimeout(addNext, 2800);
      }, 1200);
    };
    setTimeout(addNext, 600);
  }, [inView]);
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages]);

  return (
    <Section style={{ background: C.surface, padding: "90px 60px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.05} />
      <FloatingDataBg color={C.blue} />
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="SHIP COMMS" title="AI Crew Communications" sub="Every agent reports directly to Command. Watch your autonomous crew coordinate in real time across all channels." />

        <PresentationFrame color={C.cyan} title="CTRL://CREW/COMMS — #ALL-CREW" float={false}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 220px", gap: 0 }}>
            {/* Channels sidebar */}
            <div style={{ borderRight: `1px solid ${C.border}`, padding: "14px 0" }}>
              <div style={{ ...mono, fontSize: 6, color: C.muted, padding: "0 12px 10px", letterSpacing: "0.1em" }}>CREW CHANNELS</div>
              {[{ label: "#all-crew", active: true }, { label: "#research", active: false }, { label: "#builders", active: false }, { label: "#alerts", active: false }].map((ch) => (
                <div key={ch.label} style={{ ...mono, fontSize: 7, padding: "7px 12px", color: ch.active ? C.cyan : C.muted, background: ch.active ? `${C.cyan}12` : "transparent", borderLeft: ch.active ? `2px solid ${C.cyan}` : "2px solid transparent", cursor: "pointer", letterSpacing: "0.06em" }}>{ch.label}</div>
              ))}
              <div style={{ marginTop: 16, padding: "0 12px" }}>
                <div style={{ ...mono, fontSize: 6, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>ONLINE AGENTS</div>
                {["NEXUS-1", "FORGE-3", "VECTOR-9", "ECHO-1"].map((n) => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, boxShadow: `0 0 4px ${C.green}` }} />
                    <span style={{ ...mono, fontSize: 6, color: C.muted }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Message feed */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 7 }}>
                <Radio size={11} color={C.cyan} />
                <span style={{ ...mono, fontSize: 7, color: C.cyan, letterSpacing: "0.1em" }}>#ALL-CREW</span>
                <span style={{ ...mono, fontSize: 6, color: C.muted, marginLeft: "auto" }}>{messages.length} MESSAGES</span>
              </div>
              <div ref={feedRef} style={{ flex: 1, overflowY: "auto", padding: "14px", minHeight: 260, maxHeight: 260 }}>
                {messages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 9, marginBottom: 12 }}>
                    <AgentAvatar role={msg.role} size={24} />
                    <div>
                      <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 2 }}>
                        <span style={{ ...px, fontSize: 6, color: roleHex(msg.role) }}>{msg.from}</span>
                        <span style={{ ...mono, fontSize: 6, color: C.muted }}>{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                      </div>
                      <div style={{ ...mono, fontSize: 8, color: "#c8d0e8", lineHeight: 1.6 }}>{msg.text}</div>
                    </div>
                  </motion.div>
                ))}
                {typing && (
                  <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                    <span style={{ ...mono, fontSize: 6, color: C.muted }}>{typing} is typing</span>
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ ...mono, color: C.muted }}>...</motion.span>
                  </div>
                )}
              </div>
              <div style={{ padding: "9px 10px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 7 }}>
                <div style={{ flex: 1, ...mono, fontSize: 7, color: C.muted, padding: "7px 10px", background: `${C.surface}88`, border: `1px solid ${C.border}` }}>Enter command or message...</div>
                <button style={{ ...mono, fontSize: 7, padding: "7px 12px", background: `${C.cyan}18`, border: `1px solid ${C.cyan}44`, color: C.cyan, cursor: "pointer" }}>SEND</button>
              </div>
            </div>
            {/* Right panel */}
            <div style={{ borderLeft: `1px solid ${C.border}`, padding: "14px" }}>
              <div style={{ ...mono, fontSize: 6, color: C.muted, letterSpacing: "0.1em", marginBottom: 10 }}>ROLE ACTIVITY</div>
              {ROLE_BARS.map((r) => (
                <div key={r.role} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ ...mono, fontSize: 6, color: roleHex(r.role), letterSpacing: "0.08em" }}>{r.role.toUpperCase()}</span>
                    <span style={{ ...mono, fontSize: 6, color: C.muted }}>{r.pct}%</span>
                  </div>
                  <div style={{ height: 3, background: C.border }}>
                    <motion.div animate={{ width: [`${r.pct - 8}%`, `${r.pct + 8}%`, `${r.pct - 8}%`] }} transition={{ repeat: Infinity, duration: 3 + r.pct / 30 }} style={{ height: "100%", background: roleHex(r.role), boxShadow: `0 0 6px ${roleHex(r.role)}` }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <div style={{ ...mono, fontSize: 6, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>FREQ SPECTRUM</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 36 }}>
                  {Array.from({ length: 28 }, (_, i) => {
                    const h = Math.random() * 100;
                    return (
                      <motion.div key={i} animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.6}%`] }} transition={{ repeat: Infinity, duration: 0.5 + Math.random(), delay: Math.random() }} style={{ flex: 1, background: `${C.cyan}88`, minHeight: 2 }} />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </PresentationFrame>
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
    <Section style={{ background: C.bg, padding: "90px 60px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.07} />
      <FloatingDataBg color={C.green} />
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="MISSION ECONOMY" title="Progress. Reward. Scale." sub="Missions are the engine of your station economy. Complete objectives to unlock higher-tier capabilities and reward your crew." />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 28, alignItems: "start" }}>
          {/* Mission list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {MISSIONS.map((m, i) => (
              <TiltCard key={m.title} strength={4}>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 20px", border: `1px solid ${m.locked ? C.border : m.color + "44"}`, background: m.locked ? "rgba(255,255,255,0.02)" : `${m.color}08`, opacity: m.locked ? 0.5 : 1, position: "relative", cursor: "pointer" }}
                >
                  {!m.locked && <div style={{ position: "absolute", top: 0, left: 0, width: `${m.progress}%`, height: 2, background: m.color, boxShadow: `0 0 8px ${m.color}` }} />}
                  <div style={{ width: 40, height: 40, border: `2px solid ${m.color}44`, background: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {m.locked ? <span style={{ fontSize: 14 }}>🔒</span> : <Target size={16} color={m.color} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...px, fontSize: 8, color: m.locked ? C.muted : "#fff", marginBottom: 5, letterSpacing: "0.04em" }}>{m.title}</div>
                    <div style={{ ...mono, fontSize: 7, color: C.muted, marginBottom: 7 }}>{m.desc}</div>
                    {!m.locked && (
                      <>
                        <div style={{ height: 3, background: C.border, marginBottom: 3 }}>
                          <motion.div initial={{ width: 0 }} animate={inView ? { width: `${m.progress}%` } : {}} transition={{ delay: i * 0.1 + 0.5, duration: 1 }} style={{ height: "100%", background: `linear-gradient(to right, ${m.color}88, ${m.color})`, boxShadow: `0 0 8px ${m.color}` }} />
                        </div>
                        <div style={{ ...mono, fontSize: 6, color: C.muted }}>{m.current} / {m.target} — {m.progress}%</div>
                      </>
                    )}
                  </div>
                  <div style={{ border: `1px solid ${m.color}44`, padding: "7px 12px", background: `${m.color}10`, flexShrink: 0 }}>
                    <div style={{ ...px, fontSize: 8, color: m.color }}>+{m.xp}</div>
                    <div style={{ ...mono, fontSize: 6, color: C.muted }}>XP</div>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </div>

          {/* Floating side stats panel */}
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ border: `1px solid ${C.cyan}44`, padding: "16px 14px", background: `${C.cyan}08`, position: "relative" }}>
              <div style={{ ...mono, fontSize: 7, color: C.cyan, letterSpacing: "0.1em", marginBottom: 12 }}>◈ ECONOMY STATUS</div>
              {[["TOTAL XP POOL", "2,050 XP", C.cyan], ["COMPLETION", "60.4%", C.green], ["ACTIVE MISSIONS", "3/5", C.amber], ["TIER", "COMMANDER", C.violet]].map(([k, v, c]) => (
                <div key={String(k)} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ ...mono, fontSize: 6, color: C.muted }}>{k}</span>
                  <span style={{ ...mono, fontSize: 6, color: String(c) }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ border: `1px solid ${C.border}`, padding: "14px", background: `${C.surface}88` }}>
              <div style={{ ...mono, fontSize: 6, color: C.muted, letterSpacing: "0.1em", marginBottom: 8 }}>MISSION LOG</div>
              {["[17:12] Revenue +$48", "[16:55] Task batch done", "[16:40] Agent LV UP", "[16:22] Mission 78%"].map((l, i) => (
                <div key={i} style={{ ...mono, fontSize: 6, color: i === 0 ? C.green : "#4a5a70", marginBottom: 5, borderLeft: i === 0 ? `2px solid ${C.green}` : "2px solid transparent", paddingLeft: 6 }}>{l}</div>
              ))}
            </div>
            <div style={{ border: `1px solid ${C.violet}33`, padding: "14px", background: `${C.violet}08` }}>
              <div style={{ ...mono, fontSize: 6, color: C.violet, marginBottom: 8 }}>NEXT UNLOCK</div>
              <div style={{ ...px, fontSize: 7, color: "#fff", lineHeight: 1.8 }}>Deploy 3 Contracts</div>
              <div style={{ ...mono, fontSize: 6, color: C.muted, marginTop: 4 }}>Requires: LV 5 Builder</div>
            </div>
          </motion.div>
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
    <Section style={{ background: C.surface, padding: "90px 60px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.05} />
      <FloatingDataBg color={C.amber} />
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="MARKETPLACE" title="Deploy a Station in Seconds" sub="Pre-built station blueprints for every business model. Choose a template, name your station, and watch your AI crew get to work." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 14 }}>
          {(templates ?? []).map((t, i) => {
            const color = CAT_COLORS[t.category] ?? C.blue;
            const icon = ICONS[t.category] ?? "⚙️";
            return (
              <TiltCard key={t.id} strength={9}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  style={{ border: `1px solid ${color}33`, background: C.bg, padding: "22px 18px", position: "relative", cursor: "pointer", height: "100%" }}
                >
                  <div style={{ position: "absolute", top: 0, width: "100%", left: 0, height: 2, background: `linear-gradient(to right, ${color}, ${color}44)` }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ fontSize: 22 }}>{icon}</div>
                    <div style={{ ...mono, fontSize: 6, color, padding: "3px 7px", border: `1px solid ${color}44`, background: `${color}15` }}>{t.category.toUpperCase()}</div>
                  </div>
                  <div style={{ ...px, fontSize: 8, color: "#fff", marginBottom: 7, lineHeight: 1.8, letterSpacing: "0.04em" }}>{t.name}</div>
                  <div style={{ ...mono, fontSize: 7, color: C.muted, lineHeight: 1.7, marginBottom: 12 }}>{t.description}</div>
                  <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
                    <span style={{ ...mono, fontSize: 6, color: C.muted }}>👥 {t.agentCount} Agents</span>
                    <span style={{ ...mono, fontSize: 6, color: C.muted }}>🏢 {t.roomCount} Rooms</span>
                    <span style={{ ...mono, fontSize: 6, color: C.amber }}>★ {t.rating}</span>
                  </div>
                  <div style={{ height: 1, background: C.border, marginBottom: 12 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ ...mono, fontSize: 6, color: C.muted }}>{t.usageCount?.toLocaleString()} deployed</span>
                    <motion.button whileHover={{ scale: 1.05 }} style={{ ...mono, fontSize: 6, color, padding: "5px 11px", border: `1px solid ${color}44`, background: `${color}10`, cursor: "pointer" }}>DEPLOY →</motion.button>
                  </div>
                </motion.div>
              </TiltCard>
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
    <Section style={{ background: C.bg, padding: "90px 60px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.07} />
      <FloatingDataBg color={C.violet} />
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="LIVE ACTIVITY" title="Your Station, Live" sub="Every agent action, mission update, and revenue event — recorded in real time across your entire agent economy." />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 28, alignItems: "start" }}>
          {/* Timeline */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 16, top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom, ${C.cyan}44, transparent)` }} />
            {(activity ?? []).slice(0, 10).map((item, i) => {
              const color = roleHex(item.agentRole ?? "");
              return (
                <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: i * 0.06, duration: 0.4 }} style={{ display: "flex", gap: 18, marginBottom: 16, paddingLeft: 42, position: "relative" }}>
                  <div style={{ position: "absolute", left: 9, top: 4, width: 14, height: 14, border: `2px solid ${color}`, background: `${color}33`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
                  </div>
                  <div style={{ flex: 1, border: `1px solid ${color}22`, background: `${color}05`, padding: "11px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ ...px, fontSize: 6, color }}>{item.agentName}</span>
                      <span style={{ ...mono, fontSize: 6, color: C.muted }}>{new Date(item.timestamp ?? "").toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                    </div>
                    <div style={{ ...mono, fontSize: 8, color: "#d0d8f0", marginBottom: 3 }}>{item.action}</div>
                    {item.details && <div style={{ ...mono, fontSize: 7, color: C.muted, lineHeight: 1.6 }}>{item.details}</div>}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Floating side stats */}
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ border: `1px solid ${C.cyan}44`, padding: "14px 12px", background: `${C.cyan}08` }}>
              <div style={{ ...mono, fontSize: 6, color: C.cyan, marginBottom: 10, letterSpacing: "0.1em" }}>◈ LIVE METRICS</div>
              {[["EVENTS/MIN", "12.4", C.green], ["AGENTS BUSY", "19/23", C.cyan], ["MSG VOLUME", "↑ 34%", C.amber], ["ERR RATE", "0.0%", C.green]].map(([k, v, c]) => (
                <div key={String(k)} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ ...mono, fontSize: 6, color: C.muted }}>{k}</span>
                  <span style={{ ...mono, fontSize: 6, color: String(c) }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ border: `1px solid ${C.border}`, padding: "12px", background: `${C.surface}88` }}>
              <div style={{ ...mono, fontSize: 6, color: C.muted, marginBottom: 8 }}>ROLE DISTRIBUTION</div>
              {Object.entries(ROLE_HEX).slice(0, 6).map(([role, color]) => (
                <div key={role} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ ...mono, fontSize: 6, color }}>{role.toUpperCase()}</span>
                    <span style={{ ...mono, fontSize: 6, color: C.muted }}>{Math.floor(Math.random() * 30 + 50)}%</span>
                  </div>
                  <div style={{ height: 2, background: C.border }}>
                    <motion.div animate={{ width: ["55%", "75%", "55%"] }} transition={{ repeat: Infinity, duration: 4, delay: Math.random() * 2 }} style={{ height: "100%", background: color }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ border: `1px solid ${C.green}33`, padding: "12px", background: `${C.green}08` }}>
              <div style={{ ...mono, fontSize: 6, color: C.green, marginBottom: 6 }}>SYS STATUS</div>
              {["[ ONLINE ] Station Alpha-7", "[ OK ] Agent runtime", "[ STABLE ] Signal lock", "[ ACTIVE ] Mission engine"].map((l, i) => (
                <div key={i} style={{ ...mono, fontSize: 6, color: "#4a6a5a", marginBottom: 4, lineHeight: 1.6 }}>{l}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

/* ─── 8. ARCHITECTURE SECTION ────────────────────────────────────────────────── */
const ARCH = [
  { label: "React 19", icon: <Globe size={14} />, color: C.cyan, sub: "UI Layer", x: 0 },
  { label: "Vite 7", icon: <Zap size={14} />, color: C.amber, sub: "Build", x: 1 },
  { label: "Tailwind v4", icon: <Terminal size={14} />, color: C.violet, sub: "Styling", x: 2 },
  { label: "Phaser 3", icon: <Target size={14} />, color: C.green, sub: "Station Engine", x: 3 },
  { label: "Express 5", icon: <Radio size={14} />, color: C.blue, sub: "API Layer", x: 0 },
  { label: "Drizzle ORM", icon: <Database size={14} />, color: C.cyan, sub: "Data Layer", x: 1 },
  { label: "PostgreSQL", icon: <Database size={14} />, color: C.violet, sub: "Database", x: 2 },
  { label: "Framer Motion", icon: <Cpu size={14} />, color: C.amber, sub: "Animation", x: 3 },
];

function ArchSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <Section style={{ background: C.surface, padding: "90px 60px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.05} />
      <FloatingDataBg color={C.cyan} />
      <div ref={ref} style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="ARCHITECTURE" title="Built for Scale" sub="A full-stack autonomous agent platform — from pixel dungeon simulation to live API infrastructure." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {ARCH.map((node, i) => (
            <TiltCard key={node.label} strength={10}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                style={{ border: `1px solid ${node.color}44`, background: `${node.color}08`, padding: "22px 14px", textAlign: "center", position: "relative", cursor: "default" }}
              >
                <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", width: "60%", height: 2, background: node.color, boxShadow: `0 0 8px ${node.color}` }} />
                <div style={{ color: node.color, marginBottom: 10, display: "flex", justifyContent: "center" }}>{node.icon}</div>
                <div style={{ ...px, fontSize: 7, color: "#fff", letterSpacing: "0.04em", marginBottom: 5 }}>{node.label}</div>
                <div style={{ ...mono, fontSize: 6, color: node.color, letterSpacing: "0.1em" }}>{node.sub}</div>
              </motion.div>
            </TiltCard>
          ))}
        </div>
        {/* System flow */}
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.8 }} style={{ marginTop: 40, border: `1px solid ${C.border}`, padding: "28px", background: C.bg }}>
          <div style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.1em", marginBottom: 20, textAlign: "center" }}>SYSTEM DATA FLOW</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, flexWrap: "wrap" }}>
            {["Commander Input", "→", "CTRL OS", "→", "Agent Runtime", "→", "Mission Engine", "→", "Revenue Output"].map((item, i) => (
              <span key={i} style={{ ...mono, fontSize: 7, color: item === "→" ? C.muted : C.cyan, padding: item === "→" ? "0" : "7px 12px", border: item === "→" ? "none" : `1px solid ${C.cyan}33`, background: item === "→" ? "transparent" : `${C.cyan}08`, letterSpacing: "0.06em" }}>{item}</span>
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
  const { scrollY } = useScroll();
  const orbY = useTransform(scrollY, [0, 5000], [0, -120]);
  return (
    <Section style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.12} />
      <FloatingDataBg color={C.cyan} />
      <motion.div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(ellipse, ${C.cyan}15 0%, transparent 70%)`, pointerEvents: "none", y: orbY }} animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 4 }} />
      <div ref={ref} style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 700 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }} style={{ display: "inline-block", marginBottom: 36 }}>
            <svg width="72" height="72" viewBox="0 0 80 80">
              <polygon points="40,4 72,22 72,58 40,76 8,58 8,22" fill="none" stroke={C.cyan} strokeWidth="2" />
              <polygon points="40,18 60,29 60,51 40,62 20,51 20,29" fill="none" stroke={C.cyan} strokeWidth="0.8" opacity="0.4" />
              <text x="40" y="50" textAnchor="middle" fill={C.amber} fontSize="22" fontFamily="'Press Start 2P',monospace">C</text>
            </svg>
          </motion.div>
          <motion.h2 initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.3 }} style={{ ...px, fontSize: "clamp(14px,3vw,30px)", color: "#fff", lineHeight: 1.8, letterSpacing: "0.04em", textShadow: `0 0 60px ${C.cyan}55`, marginBottom: 18 }}>
            Command Your Agents.<br />
            <span style={{ color: C.cyan }}>Control Your Economy.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }} style={{ ...mono, fontSize: 11, color: C.muted, lineHeight: 1.9, marginBottom: 44, letterSpacing: "0.04em" }}>
            The operating system for autonomous AI civilizations.<br />
            Your crew is ready. Your station is waiting.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.7 }} style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
            <PixelBtn primary href="/app">LAUNCH CTRL <Zap size={12} /></PixelBtn>
            <PixelBtn href="/app">ENTER COMMAND CENTER <ChevronRight size={12} /></PixelBtn>
          </motion.div>
          <div style={{ display: "flex", gap: 36, justifyContent: "center", flexWrap: "wrap" }}>
            {[["23", "AGENTS"], ["3", "STATIONS"], ["6", "ROOM TYPES"], ["9", "MISSION TIERS"]].map(([v, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ ...px, fontSize: 18, color: C.cyan, textShadow: `0 0 20px ${C.cyan}` }}>{v}</div>
                <div style={{ ...mono, fontSize: 6, color: C.muted, letterSpacing: "0.12em", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0b0f; }
        ::-webkit-scrollbar-thumb { background: #2a3050; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #4df0d844; }
        @keyframes neon-pulse {
          0%,100% { text-shadow: 0 0 20px #4df0d844; }
          50% { text-shadow: 0 0 40px #4df0d8aa, 0 0 80px #4df0d833; }
        }
        @keyframes border-pulse {
          0%,100% { box-shadow: 0 0 20px #4df0d822; }
          50% { box-shadow: 0 0 50px #4df0d844, 0 0 100px #4df0d812; }
        }
        * { box-sizing: border-box; }
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
