import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Zap, Shield, ChevronRight, Lock, Coins, AlertTriangle } from "lucide-react";

const px = { fontFamily: "'Press Start 2P', monospace" };
const mono = { fontFamily: "'Space Mono', monospace" };

const C = {
  bg: "#0a0b0f",
  surface: "#0f1118",
  surface2: "#131620",
  border: "#1e2130",
  muted: "#4a5580",
  cyan: "#4df0d8",
  violet: "#9b6dff",
  amber: "#ffb84d",
  green: "#4dff9b",
  red: "#ff4d6d",
};

const REQUIRED_TOKENS = 100_000;

const WALLETS = [
  { id: "phantom",  name: "Phantom",  icon: "👻", color: C.violet, desc: "Most popular Solana wallet" },
  { id: "solflare", name: "Solflare", icon: "🔥", color: C.amber,  desc: "Native Solana wallet" },
  { id: "coinbase", name: "Coinbase", icon: "🔵", color: "#4d7fff", desc: "Coinbase Wallet" },
  { id: "nightly",  name: "Nightly",  icon: "🌙", color: C.cyan,   desc: "Multi-chain wallet" },
];

function CornerAccents({ color }: { color: string }) {
  return (
    <>
      {([ ["top","left"], ["top","right"], ["bottom","left"], ["bottom","right"] ] as const).map(([v, h]) => (
        <div key={`${v}${h}`} style={{
          position: "absolute", [v]: -1, [h]: -1, width: 14, height: 14,
          borderTop:    v === "top"    ? `2px solid ${color}` : "none",
          borderBottom: v === "bottom" ? `2px solid ${color}` : "none",
          borderLeft:   h === "left"   ? `2px solid ${color}` : "none",
          borderRight:  h === "right"  ? `2px solid ${color}` : "none",
        }} />
      ))}
    </>
  );
}

function AnimatedCounter({ target, duration = 1800 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(pct * target));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return <>{val.toLocaleString()}</>;
}

interface TokenGateProps {
  onBetaAccess: () => void;
}

export default function TokenGate({ onBetaAccess }: TokenGateProps) {
  const { wallets, select, connecting, wallet } = useWallet();
  const [showWallets, setShowWallets] = useState(false);
  const [hoveredWallet, setHoveredWallet] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [betaHovered, setBetaHovered] = useState(false);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Animate progress bar "scanning" pulse
  useEffect(() => {
    intervalRef.current = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleConnect = (walletId: string) => {
    const adapterName = wallets.find(w => w.adapter.name.toLowerCase().includes(walletId))?.adapter.name;
    if (adapterName) { setConnectingId(walletId); select(adapterName); }
  };

  // Token holding: 0 since not listed yet
  const holding = 0;
  const pct = (holding / REQUIRED_TOKENS) * 100;

  return (
    <div style={{
      minHeight: "100dvh",
      background: C.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Mono:wght@400;700&display=swap');
        @keyframes scan { 0%{top:0%} 100%{top:100%} }
        @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:0.85} 96%{opacity:1} }
      `}</style>

      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, ${C.cyan}18 1px, transparent 1px)`,
        backgroundSize: "32px 32px", opacity: 0.3, pointerEvents: "none",
      }} />

      {/* Glow orb */}
      <div style={{
        position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 400, borderRadius: "50%",
        background: `radial-gradient(ellipse, ${C.violet}10 0%, ${C.cyan}06 40%, transparent 70%)`,
        filter: "blur(48px)", pointerEvents: "none",
      }} />

      {/* Scanlines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
        animation: "flicker 6s ease-in-out infinite",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 18 }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            style={{ ...mono, fontSize: 8, color: C.cyan, letterSpacing: "0.28em", marginBottom: 14 }}
          >
            ◈ ◈ ◈ SOLANA NETWORK ◈ ◈ ◈
          </motion.div>
          <div style={{
            ...px, fontSize: "clamp(18px, 4vw, 26px)", color: C.cyan,
            letterSpacing: "0.12em", textShadow: `0 0 40px ${C.cyan}, 0 0 80px ${C.cyan}44`, marginBottom: 8,
          }}>
            CTRL
          </div>
          <div style={{ ...mono, fontSize: 9, color: C.muted, letterSpacing: "0.14em" }}>
            COMMAND CENTER ACCESS
          </div>
        </div>

        {/* ─── TOKEN GATE CARD ─────────────────────────────────────────── */}
        <div style={{ border: `1px solid ${C.violet}44`, background: C.surface, position: "relative" }}>
          <CornerAccents color={C.violet} />

          {/* Card header */}
          <div style={{
            padding: "11px 18px", borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Lock size={12} color={C.violet} />
            <span style={{ ...px, fontSize: 7, color: "#c0c8e0", letterSpacing: "0.1em" }}>
              TOKEN GATE
            </span>
            {/* PRE-LISTING badge */}
            <div style={{
              marginLeft: "auto",
              padding: "3px 8px",
              border: `1px solid ${C.amber}55`,
              background: `${C.amber}10`,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.amber, boxShadow: `0 0 6px ${C.amber}`, animation: "pulse-dot 2s ease-in-out infinite" }} />
              <span style={{ ...mono, fontSize: 6, color: C.amber, letterSpacing: "0.14em" }}>PRE-LISTING</span>
            </div>
          </div>

          {/* Token requirement */}
          <div style={{ padding: "20px 20px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Coins size={16} color={C.violet} />
              <div>
                <div style={{ ...px, fontSize: 7, color: "#c0c8e0", letterSpacing: "0.08em", marginBottom: 5 }}>
                  MINIMUM REQUIRED
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{
                    ...px, fontSize: "clamp(14px, 3vw, 20px)", color: C.violet,
                    textShadow: `0 0 20px ${C.violet}88`,
                  }}>
                    100,000
                  </span>
                  <span style={{ ...px, fontSize: 8, color: C.cyan }}>$CTRL</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <span style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.1em" }}>YOUR BALANCE</span>
                <span style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.06em" }}>
                  <span style={{ color: holding > 0 ? C.violet : C.red }}>
                    <AnimatedCounter target={holding} />
                  </span>
                  {" "}/{" "}
                  <span style={{ color: "#c0c8e0" }}>100,000</span>
                  {" "}
                  <span style={{ color: C.violet }}>$CTRL</span>
                </span>
              </div>
              {/* Bar track */}
              <div style={{ width: "100%", height: 8, background: "#0d0f18", border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
                {/* Filled portion */}
                <div style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: `linear-gradient(to right, ${C.violet}, ${C.cyan})`,
                  boxShadow: pct > 0 ? `0 0 8px ${C.violet}` : "none",
                  transition: "width 1s",
                }} />
                {/* Scan line */}
                <motion.div
                  animate={{ x: ["0%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}
                  style={{
                    position: "absolute", top: 0, width: "12%", height: "100%",
                    background: `linear-gradient(to right, transparent, ${C.violet}30, transparent)`,
                    pointerEvents: "none",
                  }}
                />
              </div>
              {/* Tick marks */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {[0, 25, 50, 75, 100].map(v => (
                  <span key={v} style={{ ...mono, fontSize: 6, color: "#2a3050", letterSpacing: 0 }}>{v}%</span>
                ))}
              </div>
            </div>

            {/* Status message */}
            <div style={{
              padding: "10px 14px",
              border: `1px solid ${C.amber}33`,
              background: `${C.amber}08`,
              display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 4,
            }}>
              <AlertTriangle size={12} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ ...mono, fontSize: 7, color: C.amber, letterSpacing: "0.08em", marginBottom: 4 }}>
                  TOKEN NOT YET LISTED
                </div>
                <div style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.05em", lineHeight: 1.7 }}>
                  $CTRL token is currently in pre-listing phase. Token-gated access will be enforced upon TGE. Beta access is available in the meantime.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── BETA ACCESS BUTTON ──────────────────────────────────────── */}
        <motion.button
          onClick={onBetaAccess}
          onMouseEnter={() => setBetaHovered(true)}
          onMouseLeave={() => setBetaHovered(false)}
          whileTap={{ scale: 0.98 }}
          style={{
            width: "100%",
            padding: "16px 20px",
            border: `2px solid ${betaHovered ? C.cyan : C.cyan + "66"}`,
            background: betaHovered ? `${C.cyan}14` : `${C.cyan}08`,
            cursor: "pointer",
            transition: "all 0.15s",
            boxShadow: betaHovered ? `0 0 28px ${C.cyan}28, inset 0 0 16px ${C.cyan}08` : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {betaHovered && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              style={{
                position: "absolute", top: 0, left: 0, width: "40%", height: "100%",
                background: `linear-gradient(to right, transparent, ${C.cyan}18, transparent)`,
                pointerEvents: "none",
              }}
            />
          )}
          <Zap size={14} color={C.cyan} />
          <div style={{ textAlign: "left" }}>
            <div style={{ ...px, fontSize: 9, color: C.cyan, letterSpacing: "0.1em", marginBottom: 4 }}>
              BETA ACCESS
            </div>
            <div style={{ ...mono, fontSize: 7, color: betaHovered ? "#8090b0" : C.muted, letterSpacing: "0.08em" }}>
              Enter during pre-listing phase — free until TGE
            </div>
          </div>
          <ChevronRight size={14} color={betaHovered ? C.cyan : C.muted} style={{ marginLeft: "auto", flexShrink: 0 }} />
        </motion.button>

        {/* ─── WALLET CONNECT (COLLAPSIBLE) ───────────────────────────── */}
        <div style={{ border: `1px solid ${C.border}`, background: C.surface, position: "relative" }}>
          <CornerAccents color={C.muted} />

          <button
            onClick={() => setShowWallets(v => !v)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "12px 18px", background: "none", border: "none", cursor: "pointer",
              borderBottom: showWallets ? `1px solid ${C.border}` : "none",
              transition: "border-color 0.2s",
            }}
          >
            <Wallet size={11} color={C.muted} />
            <span style={{ ...px, fontSize: 7, color: "#8090b0", letterSpacing: "0.1em" }}>
              CONNECT WALLET
            </span>
            <span style={{ ...mono, fontSize: 7, color: C.muted, marginLeft: 6 }}>
              (check $CTRL balance)
            </span>
            <motion.div
              animate={{ rotate: showWallets ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ marginLeft: "auto" }}
            >
              <ChevronRight size={12} color={C.muted} />
            </motion.div>
          </button>

          <AnimatePresence>
            {showWallets && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  {WALLETS.map(w => {
                    const isHovered = hoveredWallet === w.id;
                    const isConnecting = (connecting || connectingId === w.id) && wallet?.adapter.name.toLowerCase().includes(w.id);
                    return (
                      <motion.button
                        key={w.id}
                        onClick={() => handleConnect(w.id)}
                        onMouseEnter={() => setHoveredWallet(w.id)}
                        onMouseLeave={() => setHoveredWallet(null)}
                        whileTap={{ scale: 0.98 }}
                        disabled={connecting}
                        style={{
                          display: "flex", alignItems: "center", gap: 14, padding: "10px 14px",
                          border: `1px solid ${isHovered ? w.color : C.border}`,
                          background: isHovered ? `${w.color}0e` : "transparent",
                          cursor: connecting ? "not-allowed" : "pointer",
                          transition: "all 0.15s",
                          boxShadow: isHovered ? `0 0 14px ${w.color}22` : "none",
                          opacity: connecting && !isConnecting ? 0.5 : 1,
                          position: "relative", overflow: "hidden",
                        }}
                      >
                        {isHovered && (
                          <motion.div
                            initial={{ x: "-100%" }} animate={{ x: "200%" }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            style={{
                              position: "absolute", top: 0, left: 0, width: "40%", height: "100%",
                              background: `linear-gradient(to right, transparent, ${w.color}14, transparent)`,
                              pointerEvents: "none",
                            }}
                          />
                        )}
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{w.icon}</span>
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <div style={{ ...px, fontSize: 8, color: isHovered ? w.color : "#c0c8e0", letterSpacing: "0.06em", marginBottom: 3, transition: "color 0.15s" }}>{w.name}</div>
                          <div style={{ ...mono, fontSize: 7, color: C.muted }}>{w.desc}</div>
                        </div>
                        {isConnecting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            style={{ width: 12, height: 12, border: `2px solid ${w.color}44`, borderTop: `2px solid ${w.color}`, borderRadius: "50%", flexShrink: 0 }}
                          />
                        ) : (
                          <ChevronRight size={12} color={isHovered ? w.color : C.muted} style={{ flexShrink: 0, transition: "color 0.15s" }} />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                <div style={{
                  padding: "8px 18px 12px", display: "flex", alignItems: "center", gap: 8,
                  borderTop: `1px solid ${C.border}`,
                }}>
                  <Shield size={9} color={C.muted} />
                  <span style={{ ...mono, fontSize: 7, color: C.muted, letterSpacing: "0.06em", lineHeight: 1.6 }}>
                    Wallet connection is read-only. Private keys are never accessed.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom stats */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 24, padding: "10px 0",
          borderTop: `1px solid ${C.border}`,
        }}>
          {[
            { v: "100K", l: "$CTRL REQ", color: C.violet },
            { v: "TGE",  l: "COMING SOON", color: C.amber },
            { v: "SOL",  l: "NETWORK", color: C.cyan },
          ].map(({ v, l, color }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ ...px, fontSize: 10, color, textShadow: `0 0 16px ${color}88`, marginBottom: 4 }}>{v}</div>
              <div style={{ ...mono, fontSize: 6, color: C.muted, letterSpacing: "0.14em" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Back to home */}
        <div style={{ textAlign: "center" }}>
          <a
            href="/"
            style={{ ...mono, fontSize: 8, color: C.muted, textDecoration: "none", letterSpacing: "0.1em", display: "inline-flex", alignItems: "center", gap: 6, transition: "color 0.15s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = C.cyan)}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = C.muted)}
          >
            <Zap size={9} /> ← BACK TO HOME
          </a>
        </div>
      </motion.div>
    </div>
  );
}
