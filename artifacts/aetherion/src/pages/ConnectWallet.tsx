import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Zap, Shield, ChevronRight } from "lucide-react";

const px = { fontFamily: "'Press Start 2P', monospace" };
const mono = { fontFamily: "'Space Mono', monospace" };

const C = {
  bg: "#0a0b0f",
  surface: "#0f1118",
  border: "#1e2130",
  muted: "#4a5580",
  cyan: "#4df0d8",
  violet: "#9b6dff",
  amber: "#ffb84d",
  green: "#4dff9b",
  red: "#ff4d6d",
};

const WALLETS = [
  {
    id: "phantom",
    name: "Phantom",
    icon: "👻",
    color: C.violet,
    desc: "Most popular Solana wallet",
  },
  {
    id: "solflare",
    name: "Solflare",
    icon: "🔥",
    color: C.amber,
    desc: "Native Solana wallet",
  },
  {
    id: "coinbase",
    name: "Coinbase",
    icon: "🔵",
    color: "#4d7fff",
    desc: "Coinbase Wallet",
  },
  {
    id: "nightly",
    name: "Nightly",
    icon: "🌙",
    color: C.cyan,
    desc: "Multi-chain wallet",
  },
];

const SCAN_LINES = [
  "CTRL OS v1.0 — AUTH GATE",
  "Wallet authentication required...",
  "Connect your Solana wallet to proceed",
  "Supported: Phantom · Solflare · Backpack",
];

function CornerAccents({ color }: { color: string }) {
  return (
    <>
      {(
        [
          ["top", "left"],
          ["top", "right"],
          ["bottom", "left"],
          ["bottom", "right"],
        ] as const
      ).map(([v, h]) => (
        <div
          key={`${v}${h}`}
          style={{
            position: "absolute",
            [v]: -1,
            [h]: -1,
            width: 14,
            height: 14,
            borderTop: v === "top" ? `2px solid ${color}` : "none",
            borderBottom: v === "bottom" ? `2px solid ${color}` : "none",
            borderLeft: h === "left" ? `2px solid ${color}` : "none",
            borderRight: h === "right" ? `2px solid ${color}` : "none",
          }}
        />
      ))}
    </>
  );
}

export default function ConnectWallet() {
  const { wallets, select, connecting, connected, wallet } = useWallet();
  const [scanLine, setScanLine] = useState(0);
  const [hoveredWallet, setHoveredWallet] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setScanLine((p) => (p + 1) % SCAN_LINES.length);
    }, 2200);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleConnect = (walletId: string) => {
    const adapterName = wallets.find((w) =>
      w.adapter.name.toLowerCase().includes(walletId)
    )?.adapter.name;
    if (adapterName) {
      setConnectingId(walletId);
      select(adapterName);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Mono:wght@400;700&display=swap');
      `}</style>

      {/* Grid bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, ${C.cyan}18 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          opacity: 0.35,
          pointerEvents: "none",
        }}
      />

      {/* Glow orb */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${C.cyan}12 0%, transparent 65%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Scanlines overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            style={{
              ...mono,
              fontSize: 8,
              color: C.cyan,
              letterSpacing: "0.28em",
              marginBottom: 14,
            }}
          >
            ◈ ◈ ◈ SOLANA NETWORK ◈ ◈ ◈
          </motion.div>
          <div
            style={{
              ...px,
              fontSize: "clamp(16px, 4vw, 22px)",
              color: C.cyan,
              letterSpacing: "0.12em",
              textShadow: `0 0 40px ${C.cyan}, 0 0 80px ${C.cyan}44`,
              marginBottom: 8,
            }}
          >
            CTRL
          </div>
          <div
            style={{
              ...mono,
              fontSize: 9,
              color: C.muted,
              letterSpacing: "0.14em",
            }}
          >
            COMMAND CENTER ACCESS
          </div>
        </div>

        {/* Terminal log */}
        <div
          style={{
            border: `1px solid ${C.cyan}33`,
            background: `${C.surface}cc`,
            position: "relative",
            padding: "10px 16px",
          }}
        >
          <CornerAccents color={C.cyan} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C.green,
                boxShadow: `0 0 6px ${C.green}`,
              }}
            />
            <span
              style={{
                ...mono,
                fontSize: 7,
                color: "#4a6a5a",
                letterSpacing: "0.12em",
              }}
            >
              CTRL://AUTH/WALLET_GATE
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={scanLine}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                ...mono,
                fontSize: 9,
                color: C.amber,
                letterSpacing: "0.06em",
                borderLeft: `2px solid ${C.amber}`,
                paddingLeft: 10,
                lineHeight: 1.8,
              }}
            >
              {SCAN_LINES[scanLine]}
            </motion.div>
          </AnimatePresence>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.55 }}
            style={{ ...mono, fontSize: 9, color: C.cyan, paddingLeft: 12 }}
          >
            █
          </motion.span>
        </div>

        {/* Auth gate panel */}
        <div
          style={{
            border: `1px solid ${C.border}`,
            background: C.surface,
            position: "relative",
          }}
        >
          <CornerAccents color={C.muted} />

          {/* Panel header */}
          <div
            style={{
              padding: "12px 18px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Shield size={12} color={C.cyan} />
            <span
              style={{
                ...px,
                fontSize: 7,
                color: "#c0c8e0",
                letterSpacing: "0.1em",
              }}
            >
              SELECT WALLET
            </span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
              {[C.red, C.amber, C.green].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: c,
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Wallet list */}
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {WALLETS.map((w) => {
              const isHovered = hoveredWallet === w.id;
              const isConnecting =
                (connecting || connectingId === w.id) &&
                wallet?.adapter.name.toLowerCase().includes(w.id);
              return (
                <motion.button
                  key={w.id}
                  onClick={() => handleConnect(w.id)}
                  onMouseEnter={() => setHoveredWallet(w.id)}
                  onMouseLeave={() => setHoveredWallet(null)}
                  whileTap={{ scale: 0.98 }}
                  disabled={connecting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 16px",
                    border: `1px solid ${isHovered ? w.color : C.border}`,
                    background: isHovered ? `${w.color}0e` : "transparent",
                    cursor: connecting ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                    boxShadow: isHovered
                      ? `0 0 18px ${w.color}22`
                      : "none",
                    opacity: connecting && !isConnecting ? 0.5 : 1,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Shine on hover */}
                  {isHovered && (
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "40%",
                        height: "100%",
                        background: `linear-gradient(to right, transparent, ${w.color}14, transparent)`,
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  <span style={{ fontSize: 20, flexShrink: 0 }}>{w.icon}</span>

                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div
                      style={{
                        ...px,
                        fontSize: 8,
                        color: isHovered ? w.color : "#c0c8e0",
                        letterSpacing: "0.06em",
                        marginBottom: 4,
                        transition: "color 0.15s",
                      }}
                    >
                      {w.name}
                    </div>
                    <div
                      style={{
                        ...mono,
                        fontSize: 7,
                        color: C.muted,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {w.desc}
                    </div>
                  </div>

                  {isConnecting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      style={{
                        width: 12,
                        height: 12,
                        border: `2px solid ${w.color}44`,
                        borderTop: `2px solid ${w.color}`,
                        borderRadius: "50%",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <ChevronRight
                      size={12}
                      color={isHovered ? w.color : C.muted}
                      style={{ flexShrink: 0, transition: "color 0.15s" }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Footer note */}
          <div
            style={{
              padding: "10px 18px",
              borderTop: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Wallet size={10} color={C.muted} />
            <span
              style={{
                ...mono,
                fontSize: 7,
                color: C.muted,
                letterSpacing: "0.06em",
                lineHeight: 1.6,
              }}
            >
              Your wallet is never stored. Connection is local only.
            </span>
          </div>
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            padding: "10px 0",
            borderTop: `1px solid ${C.border}`,
          }}
        >
          {[
            { v: "23", l: "AGENTS", color: C.cyan },
            { v: "3", l: "STATIONS", color: C.violet },
            { v: "SOL", l: "NETWORK", color: C.amber },
          ].map(({ v, l, color }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div
                style={{
                  ...px,
                  fontSize: 10,
                  color,
                  textShadow: `0 0 16px ${color}88`,
                  marginBottom: 4,
                }}
              >
                {v}
              </div>
              <div
                style={{
                  ...mono,
                  fontSize: 6,
                  color: C.muted,
                  letterSpacing: "0.14em",
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>

        {/* Back to home */}
        <div style={{ textAlign: "center" }}>
          <a
            href="/"
            style={{
              ...mono,
              fontSize: 8,
              color: C.muted,
              textDecoration: "none",
              letterSpacing: "0.1em",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = C.cyan)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = C.muted)
            }
          >
            <Zap size={9} /> ← BACK TO HOME
          </a>
        </div>
      </motion.div>
    </div>
  );
}
