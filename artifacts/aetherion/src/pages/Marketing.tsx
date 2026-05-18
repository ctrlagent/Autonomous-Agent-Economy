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
  ArrowRight,
  ChevronRight,
  X,
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

  const handleSkip = useCallback(() => {
    setDone(true);
    sessionStorage.setItem("ctrl_booted", "1");
    setTimeout(onDone, 300);
  }, [onDone]);

  useEffect(() => {
    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (i < BOOT_LINES.length) {
        setLines((prev) => [...prev, BOOT_LINES[i++]]);
        setTimeout(tick, i === BOOT_LINES.length ? 400 : 130);
      } else {
        setTimeout(() => { if (!cancelled) setDone(true); }, 300);
        setTimeout(() => {
          if (!cancelled) {
            sessionStorage.setItem("ctrl_booted", "1");
            onDone();
          }
        }, 800);
      }
    };
    setTimeout(tick, 150);
    return () => { cancelled = true; };
  }, [onDone]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
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
          {/* Skip button */}
          <button
            onClick={handleSkip}
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              ...mono,
              fontSize: 9,
              color: C.muted,
              background: "transparent",
              border: `1px solid ${C.border}`,
              padding: "7px 14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              letterSpacing: "0.1em",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = C.cyan;
              (e.currentTarget as HTMLButtonElement).style.borderColor = C.cyan;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = C.muted;
              (e.currentTarget as HTMLButtonElement).style.borderColor = C.border;
            }}
          >
            <X size={10} /> SKIP
          </button>

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
  "$CTRL", "AGENT", "ECONOMY", "CONTROL", "SOLANA",
  "STATION", "MISSION", "COMMANDER", "CREW", "REVENUE",
  "STRATEGY", "BUILDER", "RESEARCH", "GROWTH", "ANALYTICS",
  "DEPLOY", "RUNTIME", "SIGNAL", "PROTOCOL", "NETWORK",
  "ALPHA", "EXECUTE", "STACK", "PIPELINE", "NODE",
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
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(circle, ${color}22 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        opacity: 0.4,
      }} />
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
        {(([["top","left"],["top","right"],["bottom","left"],["bottom","right"]] as const)).map(([v,h]) => (
          <div key={`${v}${h}`} style={{ position: "absolute", [v]: -1, [h]: -1, width: 20, height: 20, borderTop: v === "top" ? `2px solid ${color}` : "none", borderBottom: v === "bottom" ? `2px solid ${color}` : "none", borderLeft: h === "left" ? `2px solid ${color}` : "none", borderRight: h === "right" ? `2px solid ${color}` : "none", zIndex: 2 }} />
        ))}
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
    <motion.div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", y }}>
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
    <section id={id} style={{ position: "relative", overflow: "hidden", scrollMarginTop: 60, ...style }}>
      {children}
    </section>
  );
}

/* ─── Section Header ────────────────────────────────────────────────────────── */
function SectionHeader({ label, title, sub }: { label: string; title: string; sub: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className="section-header" initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ textAlign: "center", marginBottom: 48 }}>
      <div style={{ ...mono, fontSize: 8, color: C.cyan, letterSpacing: "0.24em", marginBottom: 14, textTransform: "uppercase" }}>◈ {label} ◈</div>
      <h2 style={{ ...px, fontSize: "clamp(13px,2.2vw,20px)", color: "#fff", letterSpacing: "0.06em", lineHeight: 1.9, textShadow: `0 0 40px ${C.cyan}55`, marginBottom: 16 }}>{title}</h2>
      <p style={{ ...mono, fontSize: 11, color: "#6a7a9a", maxWidth: 480, margin: "0 auto", lineHeight: 2, letterSpacing: "0.04em" }}>{sub}</p>
    </motion.div>
  );
}

/* ─── Tilt Wrapper ──────────────────────────────────────────────────────────── */
function TiltCard({ children, strength = 8, style }: { children: React.ReactNode; strength?: number; style?: React.CSSProperties }) {
  const tilt = use3DTilt(strength);
  return <div ref={tilt.ref} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} style={style}>{children}</div>;
}

/* ─── Stat Card ─────────────────────────────────────────────────────────────── */
function StatCard({ label, value, color = C.cyan, desc, trend }: { label: string; value: string; color?: string; desc?: string; trend?: string }) {
  const tilt = use3DTilt(6);
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={{ border: `1px solid ${color}55`, background: `${color}0d`, padding: "14px 16px", position: "relative", boxShadow: `0 0 24px ${color}10`, cursor: "default" }}>
      {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
        <div key={`${v}${h}`} style={{ position: "absolute", [v]: -1, [h]: -1, width: 10, height: 10, borderTop: v === "top" ? `2px solid ${color}` : "none", borderBottom: v === "bottom" ? `2px solid ${color}` : "none", borderLeft: h === "left" ? `2px solid ${color}` : "none", borderRight: h === "right" ? `2px solid ${color}` : "none" }} />
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div style={{ ...px, fontSize: 15, color, textShadow: `0 0 24px ${color}` }}>{value}</div>
        {trend && <div style={{ ...mono, fontSize: 7, color: C.green, padding: "2px 6px", background: `${C.green}15`, border: `1px solid ${C.green}33` }}>{trend}</div>}
      </div>
      <div style={{ ...mono, fontSize: 8, color: "#6a7a9a", letterSpacing: "0.12em", marginBottom: desc ? 5 : 0 }}>{label}</div>
      {desc && <div style={{ ...mono, fontSize: 7, color: "#4a5a6a", lineHeight: 1.6, borderTop: `1px solid ${color}22`, paddingTop: 5, marginTop: 2 }}>{desc}</div>}
    </div>
  );
}

/* ─── Pixel Button ──────────────────────────────────────────────────────────── */
function PixelBtn({ children, primary, href, onClick, large }: { children: React.ReactNode; primary?: boolean; href?: string; onClick?: () => void; large?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const basePad = large ? "18px 36px" : "14px 28px";
  const baseFontSize = large ? 10 : 9;
  const style: React.CSSProperties = primary
    ? { ...px, fontSize: baseFontSize, padding: basePad, letterSpacing: "0.08em", border: `2px solid ${C.cyan}`, background: hovered ? C.cyan : `${C.cyan}22`, color: hovered ? C.bg : C.cyan, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", transition: "all 0.18s ease", position: "relative", boxShadow: hovered ? `0 0 40px ${C.cyan}66, 0 0 80px ${C.cyan}22` : `0 0 24px ${C.cyan}33` }
    : { ...px, fontSize: baseFontSize, padding: basePad, letterSpacing: "0.08em", border: `2px solid ${hovered ? "#fff" : C.border}`, background: hovered ? `${C.border}55` : "transparent", color: hovered ? "#fff" : "#6a7a9a", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", transition: "all 0.18s ease", position: "relative" };
  if (href) return <Link href={href} style={style} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>{children}</Link>;
  return <button style={style} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onClick}>{children}</button>;
}

/* ─── Floating Event Popup ──────────────────────────────────────────────────── */
interface FloatingEvent { id: number; text: string; color: string; }
function FloatingEvents() {
  const [events, setEvents] = useState<FloatingEvent[]>([]);
  const counterRef = useRef(0);
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
    const tick = () => {
      const ev = EVENTS[counterRef.current % EVENTS.length];
      counterRef.current++;
      setEvents((prev) => [...prev.slice(-3), { id: counterRef.current, text: ev.text, color: ev.color }]);
    };
    tick();
    const id = setInterval(tick, 3200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="floating-events" style={{ position: "absolute", bottom: 16, right: 16, zIndex: 20, display: "flex", flexDirection: "column", gap: 7, pointerEvents: "none", maxWidth: 260 }}>
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

/* ─── Scanlines ─────────────────────────────────────────────────────────────── */
function Scanlines() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)" }} />
  );
}

/* ─── Sticky Navbar ─────────────────────────────────────────────────────────── */
const NAV_SECTIONS = [
  { label: "STATION", id: "hero" },
  { label: "CREW", id: "crew" },
  { label: "MISSIONS", id: "missions" },
  { label: "MARKET", id: "marketplace" },
  { label: "HOW IT WORKS", id: "arch" },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (v) => setScrolled(v > 40));
  }, [scrollY]);

  return (
    <motion.nav
      animate={{ background: scrolled ? `${C.surface}f0` : `${C.surface}dd`, boxShadow: scrolled ? `0 2px 24px rgba(0,0,0,0.5)` : "none" }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(16px,4vw,40px)",
        height: 56,
        borderBottom: `1px solid ${scrolled ? C.border : "transparent"}`,
        backdropFilter: "blur(12px)",
        transition: "border-color 0.2s",
      }}
    >
      {/* Logo */}
      <button onClick={() => scrollTo("hero")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
        <svg width="22" height="22" viewBox="0 0 28 28">
          <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke={C.cyan} strokeWidth="1.8" />
          <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="none" stroke={C.cyan} strokeWidth="0.6" opacity="0.4" />
          <text x="14" y="19" textAnchor="middle" fill={C.amber} fontSize="10" fontFamily="'Press Start 2P',monospace">C</text>
        </svg>
        <span style={{ ...px, fontSize: 10, color: "#fff", letterSpacing: "0.08em", textShadow: `0 0 16px ${C.cyan}66` }}>CTRL</span>
        <span style={{ ...mono, fontSize: 7, color: C.cyan, padding: "2px 7px", border: `1px solid ${C.cyan}55`, background: `${C.cyan}10`, display: "flex", alignItems: "center", gap: 4 }}>
          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
          ONLINE
        </span>
      </button>

      {/* Desktop nav links */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="nav-desktop">
        {NAV_SECTIONS.map(({ label, id }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            style={{ ...mono, fontSize: 8, color: "#5a6a8a", background: "none", border: "none", cursor: "pointer", padding: "6px 12px", letterSpacing: "0.1em", transition: "color 0.15s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = C.cyan)}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#5a6a8a")}
          >{label}</button>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link
          href="/"
          style={{ ...px, fontSize: 8, color: C.bg, textDecoration: "none", padding: "9px 18px", border: `2px solid ${C.cyan}`, background: C.cyan, letterSpacing: "0.06em", boxShadow: `0 0 20px ${C.cyan}44`, transition: "all 0.18s", whiteSpace: "nowrap" }}
        >
          ENTER APP →
        </Link>
        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          style={{ display: "none", background: "none", border: `1px solid ${C.border}`, color: C.muted, padding: "6px 10px", cursor: "pointer" }}
          className="nav-hamburger"
        >
          ☰
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ position: "absolute", top: 56, left: 0, right: 0, background: `${C.surface}f8`, borderBottom: `1px solid ${C.border}`, padding: "12px 0", zIndex: 200 }}
          >
            {NAV_SECTIONS.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => { scrollTo(id); setMenuOpen(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", ...mono, fontSize: 9, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: "12px 24px", letterSpacing: "0.1em" }}
              >{label}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
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
    <Section id="hero" style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", paddingTop: 56 }}>
      <motion.div style={{ position: "absolute", inset: 0, y: bgY, pointerEvents: "none" }}>
        <GridBg opacity={0.1} />
        <FloatingDataBg color={C.cyan} />
      </motion.div>
      <Scanlines />

      {/* Hero content */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1.1fr", alignItems: "center", padding: "40px clamp(20px,5vw,56px)", gap: "clamp(24px,4vw,56px)", position: "relative", zIndex: 10, maxWidth: 1400, margin: "0 auto", width: "100%" }} className="hero-grid">
        {/* Left copy */}
        <motion.div className="hero-copy" initial={{ opacity: 0, x: -36 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
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
            <PixelBtn primary href="/" large>ENTER STATION <ArrowRight size={13} /></PixelBtn>
            <PixelBtn onClick={() => scrollTo("arch")}>HOW IT WORKS</PixelBtn>
          </div>
          {/* Live stats — flex on desktop, bento grid on mobile */}
          <div className="hero-stats" style={{ display: "flex", gap: 0, borderTop: `1px solid ${C.border}`, paddingTop: 20, flexWrap: "wrap" }}>
            {[
              { label: "AGENTS ACTIVE", value: `${summary?.activeAgents ?? 19}/${summary?.totalAgents ?? 23}`, color: C.cyan },
              { label: "STATIONS", value: String(summary?.activeStations ?? 3), color: C.green },
              { label: "UPTIME", value: `${hh}:${mm}:${ss}`, color: C.amber },
            ].map((s, i) => (
              <div key={s.label} style={{ paddingRight: 24, marginRight: 24, borderRight: i < 2 ? `1px solid ${C.border}` : "none", marginBottom: 8 }}>
                <div style={{ ...px, fontSize: 13, color: s.color, textShadow: `0 0 16px ${s.color}`, marginBottom: 5 }}>{s.value}</div>
                <div style={{ ...mono, fontSize: 7, color: "#5a6a8a", letterSpacing: "0.12em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Live Phaser station */}
        <motion.div initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ position: "relative" }} className="hero-canvas">
          <div style={{ position: "absolute", inset: -40, borderRadius: 4, background: `radial-gradient(ellipse, ${C.cyan}12 0%, transparent 70%)`, filter: "blur(30px)", pointerEvents: "none", zIndex: 0 }} />
          <PresentationFrame color={C.cyan} title="ALPHA-7 DEFI OPS — LIVE FEED" float style={{ position: "relative", zIndex: 1 }}>
            <div className="hero-canvas-inner" style={{ height: 440, overflow: "hidden" }}>
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
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          style={{ ...mono, fontSize: 8, color: "#4a5a70", letterSpacing: "0.16em", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer" }}
          onClick={() => scrollTo("station-preview")}
        >
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
    <Section id="station-preview" style={{ background: C.surface, padding: "90px clamp(20px,5vw,60px) 48px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.05} />
      <FloatingDataBg color={C.violet} />
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="LIVE PREVIEW" title="Your Station at a Glance" sub="Every station is a living economy — six specialized rooms, each running autonomous agents around the clock." />
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 32, alignItems: "start" }} className="preview-grid">
          <PresentationFrame color={C.cyan} title="STATION_ALPHA-7 // ROOM OVERVIEW" float={false}>
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }} className="rooms-grid">
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
            <div style={{ borderTop: `1px solid ${C.border}`, margin: "0 16px", padding: "14px 0 4px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
                {[
                  { label: "TOTAL AGENTS", value: String(ROOMS.reduce((s, r) => s + r.agents, 0)), color: C.cyan },
                  { label: "TOTAL TASKS", value: String(ROOMS.reduce((s, r) => s + r.tasks, 0)), color: C.amber },
                  { label: "AVG PROGRESS", value: `${Math.round(ROOMS.reduce((s, r) => s + r.progress, 0) / ROOMS.length)}%`, color: C.green },
                  { label: "ROOMS ONLINE", value: `${ROOMS.length}/6`, color: C.violet },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ border: `1px solid ${color}33`, background: `${color}08`, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ ...px, fontSize: 9, color, textShadow: `0 0 12px ${color}`, marginBottom: 3 }}>{value}</div>
                    <div style={{ ...mono, fontSize: 5, color: C.muted, letterSpacing: "0.08em", lineHeight: 1.6 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </PresentationFrame>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }} className="preview-stats">
            <StatCard label="PLATFORM AGENTS" value={`${summary?.activeAgents ?? 19}/${summary?.totalAgents ?? 23}`} color={C.cyan} desc="Active agents processing tasks across all stations" trend="↑ LIVE" />
            <StatCard label="ACTIVE STATIONS" value={String(summary?.activeStations ?? 3)} color={C.green} desc="Stations online running autonomous operations" trend="+1 TODAY" />
            <StatCard label="TASKS TODAY" value={String(summary?.tasksCompletedToday ?? 47)} color={C.amber} desc="Completed tasks executed by your crew in 24h" />
            <StatCard label="OVERALL PROGRESS" value={`${Math.round((summary as any)?.overallProgress ?? 55)}%`} color={C.violet} desc="Aggregate mission completion rate" />
            <div style={{ border: `1px solid ${C.border}`, padding: "12px 14px", background: `${C.surface}88` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.1em" }}>REVENUE 24H</div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 40 }}>
                {[40,55,48,72,88,76,92,84,96,88,100,94,108,116,102,120,112,128,118,136,124,142,132,148].map((v, i) => (
                  <motion.div key={i} initial={{ height: 0 }} animate={inView ? { height: `${(v / 150) * 40}px` } : {}} transition={{ delay: i * 0.02, duration: 0.5 }} style={{ flex: 1, background: `${C.green}${Math.round((v / 150) * 99 + 30).toString(16)}`, minWidth: 2 }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
                <span style={{ ...mono, fontSize: 6, color: C.muted }}>Autonomous earnings</span>
                <span style={{ ...mono, fontSize: 8, color: C.green }}>$3,840 TODAY</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 }} style={{ textAlign: "center", marginTop: 48 }}>
          <PixelBtn primary href="/" large>LAUNCH YOUR STATION <ArrowRight size={13} /></PixelBtn>
        </motion.div>
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
    <Section id="crew" style={{ background: C.bg, padding: "48px 0 90px", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.07} />
      <FloatingDataBg color={C.cyan} />
      <div ref={ref} style={{ position: "relative", zIndex: 10 }}>
        <div style={{ padding: "0 clamp(20px,5vw,60px)" }}>
          <SectionHeader label="CREW SYSTEM" title="Your Autonomous Agent Army" sub="Specialized AI agents, each with defined roles, unique skills, and persistent memory — working 24/7 inside your stations." />
        </div>

        <div style={{ padding: "0 clamp(20px,5vw,60px)", marginBottom: 40 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 32, alignItems: "center", maxWidth: 900, margin: "0 auto" }} className="crew-grid">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }} className="crew-roles">
              {Object.entries(ROLE_HEX).map(([role, color]) => (
                <div key={role} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", border: `1px solid ${color}22`, background: `${color}08` }}>
                  <div style={{ width: 6, height: 6, background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
                  <div>
                    <div style={{ ...mono, fontSize: 6, color, letterSpacing: "0.1em" }}>{role.toUpperCase()}</div>
                    <div style={{ ...mono, fontSize: 6, color: C.muted, lineHeight: 1.5 }}>Autonomous specialist</div>
                  </div>
                </div>
              ))}
            </div>
            <motion.div className="crew-center" animate={{ scale: [1, 1.02, 1], opacity: [0.85, 1, 0.85] }} transition={{ repeat: Infinity, duration: 3 }} style={{ textAlign: "center", padding: "20px 32px", border: `1px solid ${C.cyan}44`, background: `${C.cyan}08` }}>
              <div style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.2em", marginBottom: 8 }}>ACTIVE WORKFORCE</div>
              <div style={{ ...px, fontSize: "clamp(20px,3.5vw,36px)", color: C.cyan, textShadow: `0 0 60px ${C.cyan}, 0 0 120px ${C.cyan}44` }}>
                {displayAgents.filter((a) => a.status === "working").length || "19"}
              </div>
              <div style={{ ...mono, fontSize: 7, color: C.cyan, letterSpacing: "0.1em", marginTop: 4 }}>AGENTS ONLINE</div>
            </motion.div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }} className="crew-features">
              {[
                { label: "Persistent Memory", desc: "Agents retain context across sessions" },
                { label: "Role Specialization", desc: "Each agent trained for one domain" },
                { label: "24/7 Operations", desc: "Runs continuously without intervention" },
                { label: "Inter-Agent Comms", desc: "Crew coordinates via shared channels" },
                { label: "XP & Leveling", desc: "Agents improve with every task" },
                { label: "Mission Execution", desc: "Agents self-assign from mission queue" },
              ].map(({ label, desc }) => (
                <div key={label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: C.cyan, fontSize: 9, marginTop: 1, flexShrink: 0 }}>◈</span>
                  <div>
                    <div style={{ ...mono, fontSize: 7, color: "#c8d0e8", letterSpacing: "0.06em" }}>{label}</div>
                    <div style={{ ...mono, fontSize: 6, color: C.muted }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scrolling crew wall */}
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

        <div style={{ textAlign: "center", marginTop: 40, padding: "0 20px" }}>
          <PixelBtn primary href="/crew" large>MEET YOUR CREW <ChevronRight size={13} /></PixelBtn>
        </div>
      </div>
    </Section>
  );
}

/* ─── 4. MISSION ECONOMY ─────────────────────────────────────────────────────── */
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
    <Section id="missions" style={{ background: C.bg, padding: "90px clamp(20px,5vw,60px)", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.07} />
      <FloatingDataBg color={C.green} />
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="MISSION ECONOMY" title="Progress. Reward. Scale." sub="Missions are the engine of your station economy. Complete objectives to unlock higher-tier capabilities and reward your crew." />
        {/* Mobile-only bento stats */}
        <div className="mission-bento" style={{ display: "none" }}>
          {[["TOTAL XP POOL","2,050 XP",C.cyan],["COMPLETION","60.4%",C.green],["ACTIVE","3/5",C.amber],["TIER","CMD",C.violet]].map(([k,v,c])=>(
            <div key={String(k)} style={{ border:`1px solid ${String(c)}44`, background:`${String(c)}08`, padding:"10px 12px", textAlign:"center" }}>
              <div style={{ ...px, fontSize:10, color:String(c), textShadow:`0 0 12px ${String(c)}`, marginBottom:4 }}>{v}</div>
              <div style={{ ...mono, fontSize:6, color:C.muted, letterSpacing:"0.08em" }}>{k}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 28, alignItems: "start" }} className="mission-grid">
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
                  <div style={{ flex: 1, minWidth: 0 }}>
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

          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} style={{ display: "flex", flexDirection: "column", gap: 10 }} className="mission-aside">
            <div style={{ border: `1px solid ${C.cyan}44`, padding: "16px 14px", background: `${C.cyan}08`, position: "relative" }}>
              <div style={{ ...mono, fontSize: 7, color: C.cyan, letterSpacing: "0.1em", marginBottom: 12 }}>◈ ECONOMY STATUS</div>
              {[["TOTAL XP POOL", "2,050 XP", C.cyan], ["COMPLETION", "60.4%", C.green], ["ACTIVE MISSIONS", "3/5", C.amber], ["TIER", "COMMANDER", C.violet]].map(([k, v, c]) => (
                <div key={String(k)} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ ...mono, fontSize: 6, color: C.muted }}>{k}</span>
                  <span style={{ ...mono, fontSize: 6, color: String(c) }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ border: `1px solid ${C.violet}33`, padding: "14px", background: `${C.violet}08` }}>
              <div style={{ ...mono, fontSize: 6, color: C.violet, marginBottom: 8 }}>NEXT UNLOCK</div>
              <div style={{ ...px, fontSize: 7, color: "#fff", lineHeight: 1.8 }}>Deploy 3 Contracts</div>
              <div style={{ ...mono, fontSize: 6, color: C.muted, marginTop: 4 }}>Requires: LV 5 Builder</div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 }} style={{ textAlign: "center", marginTop: 48 }}>
          <PixelBtn primary href="/missions" large>VIEW ALL MISSIONS <ArrowRight size={13} /></PixelBtn>
        </motion.div>
      </div>
    </Section>
  );
}

/* ─── 5. TEMPLATE MARKETPLACE ────────────────────────────────────────────────── */
function MarketplaceSection() {
  const { data: templates } = useListTemplates();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const ICONS: Record<string, string> = { crypto: "₿", ecommerce: "🛒", content: "📱", saas: "💻" };
  const CAT_COLORS: Record<string, string> = { crypto: C.amber, ecommerce: C.green, content: C.cyan, saas: C.violet };

  return (
    <Section id="marketplace" style={{ background: C.surface, padding: "90px clamp(20px,5vw,60px)", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.05} />
      <FloatingDataBg color={C.amber} />
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="MARKETPLACE" title="Deploy a Station in Seconds" sub="Pre-built station blueprints for every business model. Choose a template, name your station, and watch your AI crew get to work." />
        <div className="carousel-track" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
          {(templates ?? []).map((t, i) => {
            const color = CAT_COLORS[t.category] ?? C.blue;
            const icon = ICONS[t.category] ?? "⚙️";
            return (
              <TiltCard key={t.id} strength={9} style={undefined}>
                <motion.div
                  className="carousel-item"
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

        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }} style={{ textAlign: "center", marginTop: 48 }}>
          <PixelBtn primary href="/templates" large>BROWSE FULL MARKETPLACE <Store size={13} /></PixelBtn>
        </motion.div>
      </div>
    </Section>
  );
}

/* ─── 6. ARCHITECTURE / HOW IT WORKS ────────────────────────────────────────── */
const PIPELINE_NODES = [
  { id: "CMD",   label: "COMMANDER", sub: "You",            color: C.amber  },
  { id: "CTRL",  label: "CTRL OS",   sub: "Orchestrator",   color: C.cyan   },
  { id: "DISP",  label: "DISPATCHER",sub: "Task Router",    color: C.violet },
  { id: "AGENT", label: "AGENT CREW",sub: "AI Workers",     color: C.green  },
  { id: "MISS",  label: "MISSIONS",  sub: "Goal Tracker",   color: C.blue   },
  { id: "OUT",   label: "REVENUE",   sub: "Output Layer",   color: C.amber  },
];

const AGENT_MODELS = [
  { role: "RESEARCH",  color: C.cyan,   model: "GPT-4o",            provider: "OpenAI",    task: "Web search, data gathering, on-chain analysis",        cost: "~$0.012/task" },
  { role: "STRATEGY",  color: C.violet, model: "Claude 3.5 Sonnet", provider: "Anthropic", task: "Planning, risk modeling, market positioning",           cost: "~$0.018/task" },
  { role: "BUILDER",   color: C.blue,   model: "Claude 3.5 Sonnet", provider: "Anthropic", task: "Code generation, deployment, API integration",          cost: "~$0.022/task" },
  { role: "CONTENT",   color: C.amber,  model: "GPT-4o",            provider: "OpenAI",    task: "Writing, threads, newsletters, SEO copy",               cost: "~$0.009/task" },
  { role: "GROWTH",    color: C.green,  model: "Gemini 1.5 Pro",    provider: "Google",    task: "A/B testing, campaign analysis, funnel optimization",   cost: "~$0.007/task" },
  { role: "ANALYTICS", color: C.red,    model: "GPT-4o mini",       provider: "OpenAI",    task: "Data pipelines, metrics, reporting, anomaly detection", cost: "~$0.003/task" },
];

function ArchSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPulse(p => (p + 1) % PIPELINE_NODES.length), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <Section id="arch" style={{ background: C.surface, padding: "90px clamp(20px,5vw,60px)", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.05} />
      <FloatingDataBg color={C.cyan} />
      <div ref={ref} style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <SectionHeader label="HOW IT WORKS" title="Agent Pipeline" sub="From your command to autonomous execution — every agent knows its role, its model, and its mission." />

        {/* Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 48, border: `1px solid ${C.border}`, background: C.bg, padding: "32px clamp(12px,3vw,24px)", overflowX: "auto" }}
        >
          <div style={{ ...px, fontSize: 6, color: C.muted, letterSpacing: "0.14em", marginBottom: 28, textAlign: "center" }}>▸ EXECUTION PIPELINE ▸</div>
          <div className="pipeline-inner" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "nowrap", minWidth: "max-content", margin: "0 auto" }}>
            {PIPELINE_NODES.map((node, i) => {
              const isActive = pulse === i;
              const isHover = activeNode === node.id;
              return (
                <div key={node.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <motion.div
                    className="pipeline-node"
                    onMouseEnter={() => setActiveNode(node.id)}
                    onMouseLeave={() => setActiveNode(null)}
                    animate={isActive ? { boxShadow: [`0 0 0px ${node.color}00`, `0 0 22px ${node.color}88`, `0 0 0px ${node.color}00`] } : {}}
                    transition={{ duration: 0.9 }}
                    style={{ border: `2px solid ${isActive || isHover ? node.color : node.color + "44"}`, background: isActive || isHover ? `${node.color}18` : `${node.color}07`, padding: "16px 12px", textAlign: "center", cursor: "default", minWidth: 110, position: "relative", transition: "all 0.2s" }}
                  >
                    <div style={{ position: "absolute", top: -2, left: "20%", width: "60%", height: 2, background: node.color, boxShadow: `0 0 8px ${node.color}` }} />
                    <div style={{ position: "absolute", top: 6, right: 8, ...px, fontSize: 5, color: `${node.color}88` }}>{String(i + 1).padStart(2, "0")}</div>
                    <div style={{ ...px, fontSize: 6, color: isActive || isHover ? node.color : "#c0c8e0", letterSpacing: "0.04em", marginBottom: 5, lineHeight: 1.6 }}>{node.label}</div>
                    <div style={{ ...mono, fontSize: 6, color: node.color + "99", letterSpacing: "0.08em" }}>{node.sub}</div>
                    {isActive && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 0] }} transition={{ duration: 0.9 }} style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, borderRadius: "50%", background: node.color, boxShadow: `0 0 8px ${node.color}` }} />
                    )}
                  </motion.div>
                  {i < PIPELINE_NODES.length - 1 && (
                    <div className="pipeline-arrow" style={{ display: "flex", alignItems: "center", width: 36, flexShrink: 0 }}>
                      <motion.div animate={pulse === i ? { opacity: [0.3, 1, 0.3], scaleX: [0.7, 1, 0.7] } : { opacity: 0.3 }} transition={{ duration: 0.9 }} style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${PIPELINE_NODES[i].color}88, ${PIPELINE_NODES[i + 1].color}88)` }} />
                      <div style={{ ...px, fontSize: 7, color: C.muted, marginLeft: -2 }}>▶</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Agent model cards */}
        <div style={{ ...px, fontSize: 6, color: C.muted, letterSpacing: "0.14em", marginBottom: 20, textAlign: "center" }}>◈ AI MODEL STACK — PER AGENT ROLE ◈</div>
        <div className="carousel-track" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
          {AGENT_MODELS.map((agent, i) => (
            <TiltCard key={agent.role} strength={8} style={undefined}>
              <motion.div
                className="carousel-item-sm"
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                style={{ border: `1px solid ${agent.color}44`, background: `${agent.color}07`, padding: "18px 16px", position: "relative", cursor: "default" }}
              >
                <div style={{ position: "absolute", top: -1, left: 0, right: 0, height: 2, background: `linear-gradient(to right, transparent, ${agent.color}, transparent)`, boxShadow: `0 0 10px ${agent.color}88` }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ ...px, fontSize: 7, color: agent.color, letterSpacing: "0.06em" }}>[{agent.role}]</div>
                  <div style={{ ...mono, fontSize: 6, color: agent.color + "88", border: `1px solid ${agent.color}33`, padding: "2px 6px", background: `${agent.color}10` }}>AGENT</div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ ...mono, fontSize: 6, color: C.muted, letterSpacing: "0.1em", marginBottom: 4 }}>MODEL</div>
                  <div style={{ ...px, fontSize: 8, color: "#e0e8ff", letterSpacing: "0.02em", lineHeight: 1.7 }}>{agent.model}</div>
                  <div style={{ ...mono, fontSize: 6, color: agent.color, marginTop: 2 }}>via {agent.provider}</div>
                </div>
                <div style={{ height: 1, background: `${agent.color}22`, margin: "10px 0" }} />
                <div style={{ marginBottom: 10 }}>
                  <div style={{ ...mono, fontSize: 6, color: C.muted, letterSpacing: "0.1em", marginBottom: 4 }}>HANDLES</div>
                  <div style={{ ...mono, fontSize: 7, color: "#a0a8c0", lineHeight: 1.7 }}>{agent.task}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ ...mono, fontSize: 6, color: agent.color + "bb", border: `1px solid ${agent.color}22`, padding: "3px 8px", background: `${agent.color}08` }}>{agent.cost}</div>
                </div>
              </motion.div>
            </TiltCard>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.7 }} style={{ textAlign: "center", marginTop: 48 }}>
          <PixelBtn primary href="/" large>START COMMANDING <Zap size={13} /></PixelBtn>
        </motion.div>
      </div>
    </Section>
  );
}

/* ─── 7. FINAL CTA ───────────────────────────────────────────────────────────── */
function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <Section id="cta" style={{ background: C.bg, padding: "120px clamp(20px,5vw,60px)", borderTop: `1px solid ${C.border}` }}>
      <GridBg opacity={0.1} />
      <FloatingDataBg color={C.cyan} />
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: "min(700px,90vw)", height: 400, borderRadius: "50%", background: `radial-gradient(ellipse, ${C.cyan}10 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div ref={ref} style={{ maxWidth: 680, margin: "0 auto", position: "relative", zIndex: 10, textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <div style={{ ...mono, fontSize: 8, color: C.cyan, letterSpacing: "0.24em", marginBottom: 20 }}>◈ GET STARTED ◈</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}>
          <h2 style={{ ...px, fontSize: "clamp(14px,2.8vw,26px)", color: "#fff", lineHeight: 1.9, letterSpacing: "0.04em", textShadow: `0 0 40px ${C.cyan}44`, marginBottom: 14 }}>
            Command Your Agents.
          </h2>
          <h2 style={{ ...px, fontSize: "clamp(14px,2.8vw,26px)", color: C.cyan, lineHeight: 1.9, letterSpacing: "0.04em", textShadow: `0 0 40px ${C.cyan}88`, marginBottom: 24 }}>
            Control Your Economy.
          </h2>
          <p style={{ ...mono, fontSize: 11, color: "#6a7a9a", lineHeight: 2, maxWidth: 480, margin: "0 auto 48px" }}>
            Deploy your first AI station in seconds. Pick a template, assign your crew, and let CTRL run your business autonomously — 24/7.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.4, type: "spring", stiffness: 200 }} className="cta-buttons" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <PixelBtn primary href="/" large>LAUNCH CTRL <Zap size={14} /></PixelBtn>
          <PixelBtn href="/templates" large>BROWSE TEMPLATES <ChevronRight size={14} /></PixelBtn>
        </motion.div>

        {/* Trust strip */}
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.7 }} className="cta-trust" style={{ marginTop: 64, display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", borderTop: `1px solid ${C.border}`, paddingTop: 32 }}>
          {[
            { v: "23", l: "AGENTS ACTIVE" },
            { v: "3", l: "STATIONS LIVE" },
            { v: "298", l: "TASKS COMPLETED" },
            { v: "$3,840", l: "REVENUE TODAY" },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ ...px, fontSize: 14, color: C.cyan, textShadow: `0 0 20px ${C.cyan}88`, marginBottom: 6 }}>{v}</div>
              <div style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.12em" }}>{l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
        CTRL v1.0 — CONTROL AGENT ECONOMY OS — ALL SYSTEMS NOMINAL
      </div>
    </Section>
  );
}

/* ─── MAIN EXPORT ────────────────────────────────────────────────────────────── */
export default function Marketing() {
  const alreadyBooted = typeof sessionStorage !== "undefined" && sessionStorage.getItem("ctrl_booted") === "1";
  const [booted, setBooted] = useState(alreadyBooted);
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
        * { box-sizing: border-box; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          /* Nav */
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }

          /* Section padding compact */
          section { padding-top: 56px !important; padding-bottom: 56px !important; }

          /* Hero */
          .hero-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .hero-canvas { display: block !important; overflow: hidden !important; }
          .hero-canvas-inner { height: auto !important; aspect-ratio: 16/9 !important; }
          .hero-canvas-inner > * { width: 100% !important; height: 100% !important; }
          .floating-events { display: none !important; }
          .hero-copy h1 { font-size: 18px !important; }
          .hero-stats { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; border-top: none !important; padding-top: 0 !important; margin-top: 16px !important; }
          .hero-stats > div { padding-right: 0 !important; margin-right: 0 !important; border-right: none !important; margin-bottom: 0 !important; padding: 10px 12px !important; border: 1px solid rgba(255,255,255,0.06) !important; background: rgba(255,255,255,0.02) !important; }

          /* Bento stats grid */
          .bento-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .bento-wide { grid-column: span 2 !important; }

          /* Carousel */
          .carousel-track { display: flex !important; overflow-x: auto !important; scroll-snap-type: x mandatory !important; gap: 10px !important; padding-bottom: 8px !important; -webkit-overflow-scrolling: touch !important; scrollbar-width: none !important; }
          .carousel-track::-webkit-scrollbar { display: none !important; }
          .carousel-item { flex: 0 0 75vw !important; scroll-snap-align: start !important; }
          .carousel-item-sm { flex: 0 0 68vw !important; scroll-snap-align: start !important; }

          /* Station preview */
          .preview-grid { grid-template-columns: 1fr !important; }
          .preview-stats { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; flex-direction: unset !important; }
          .rooms-grid { grid-template-columns: repeat(2,1fr) !important; }

          /* Crew */
          .crew-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .crew-center { display: none !important; }
          .crew-roles { grid-template-columns: repeat(3,1fr) !important; gap: 6px !important; }
          .crew-features { display: none !important; }

          /* Missions */
          .mission-grid { grid-template-columns: 1fr !important; }
          .mission-aside { display: none !important; }
          .mission-bento { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 7px !important; margin-bottom: 16px !important; }

          /* Section headers */
          .section-header { margin-bottom: 28px !important; }
          .section-header p { font-size: 10px !important; }

          /* Pipeline */
          .pipeline-inner { flex-direction: column !important; align-items: stretch !important; min-width: unset !important; gap: 0 !important; }
          .pipeline-node { min-width: unset !important; width: 100% !important; }
          .pipeline-arrow { transform: rotate(90deg) !important; width: 24px !important; height: 24px !important; margin: 0 auto !important; display: flex !important; align-items: center !important; justify-content: center !important; }

          /* CTA */
          .cta-buttons { flex-direction: column !important; align-items: stretch !important; }
          .cta-buttons a, .cta-buttons button { text-align: center !important; justify-content: center !important; width: 100% !important; }
          .cta-trust { gap: 16px !important; }
        }
        @media (max-width: 540px) {
          .rooms-grid { grid-template-columns: 1fr !important; }
          .crew-roles { grid-template-columns: repeat(2,1fr) !important; }
          .bento-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-copy h1 { font-size: 15px !important; }
          .carousel-item { flex: 0 0 88vw !important; }
          .carousel-item-sm { flex: 0 0 82vw !important; }
        }
      `}</style>

      {!alreadyBooted && <BootSequence onDone={handleDone} />}
      <StickyNav />

      <AnimatePresence>
        {booted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <HeroSection />
            <StationPreviewSection />
            <AgentCrewSection />
            <MissionSection />
            <MarketplaceSection />
            <ArchSection />
            <CTASection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
