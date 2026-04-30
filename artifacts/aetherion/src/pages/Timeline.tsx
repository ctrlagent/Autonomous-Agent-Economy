import { useState } from "react";
import { useGetRecentActivity } from "@workspace/api-client-react";
import { motion } from "framer-motion";

const FILTERS = ["ALL", "AGENTS", "TASKS", "STATION"];

const ROLE_HEX: Record<string, string> = {
  research:  "#4df0d8",
  strategy:  "#9b6dff",
  builder:   "#4d7fff",
  design:    "#9b6dff",
  growth:    "#4dff9b",
  analytics: "#ff4d6d",
  content:   "#ffb84d",
};

function getRoleHex(role: string): string {
  return ROLE_HEX[role?.toLowerCase()] ?? "#636b8a";
}

function formatTime(ts: string): string {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts.substring(0, 8);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return ts.substring(0, 5);
  }
}

export default function Timeline() {
  const [filter, setFilter] = useState("ALL");
  const { data: activity } = useGetRecentActivity({ limit: 50 });

  const filtered = (activity ?? []).filter(item => {
    if (filter === "ALL") return true;
    if (filter === "AGENTS") return item.agentName?.toLowerCase() !== "system";
    if (filter === "TASKS") return item.action.toLowerCase().includes("task") || item.action.toLowerCase().includes("complet");
    if (filter === "STATION") return item.action.toLowerCase().includes("station") || item.action.toLowerCase().includes("room");
    return true;
  });

  const mono = { fontFamily: "'Space Mono', monospace" };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        flexShrink: 0,
        padding: "16px 28px 12px",
        borderBottom: "1px solid var(--ae-border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 16,
      }}>
        <div>
          <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: "var(--ae-text)", letterSpacing: "0.04em", lineHeight: 1.8 }}>
            EVENT TIMELINE
          </h1>
          <p style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", marginTop: 4 }}>
            Chronological log of all system events.
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...mono,
                fontSize: 9,
                padding: "4px 12px",
                border: `1px solid ${filter === f ? "var(--ae-cyan)" : "var(--ae-border)"}`,
                background: filter === f ? "var(--ae-cyan-dim)" : "transparent",
                color: filter === f ? "var(--ae-cyan)" : "var(--ae-muted)",
                cursor: "pointer",
                letterSpacing: "0.08em",
                transition: "all 0.15s",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Events */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 28px" }}>
        <div style={{ position: "relative" }}>
          {/* Vertical timeline line */}
          <div style={{
            position: "absolute",
            left: 86,
            top: 0, bottom: 0,
            width: 1,
            background: "var(--ae-border)",
          }} />

          {filtered.map((item, i) => {
            const color = getRoleHex(item.agentRole);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.8) }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 0,
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                {/* Timestamp */}
                <div style={{
                  width: 72,
                  flexShrink: 0,
                  textAlign: "right",
                  paddingRight: 14,
                  paddingTop: 2,
                  ...mono, fontSize: 9, color: "var(--ae-dim)",
                }}>
                  {formatTime(item.timestamp)}
                </div>

                {/* Dot on line */}
                <div style={{ width: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 4 }}>
                  <div style={{
                    width: 8, height: 8,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                    border: "1px solid var(--ae-bg)",
                    position: "relative",
                    zIndex: 1,
                  }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, paddingLeft: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ ...mono, fontWeight: 700, fontSize: 11, color: "var(--ae-text)" }}>{item.agentName}</span>
                    <span style={{
                      ...mono, fontSize: 8,
                      padding: "1px 7px",
                      border: `1px solid ${color}44`,
                      background: `${color}15`,
                      color: color,
                      letterSpacing: "0.1em",
                    }}>
                      {item.agentRole?.toUpperCase()}
                    </span>
                    <span style={{ ...mono, fontSize: 10, color: "var(--ae-text)", opacity: 0.85 }}>{item.action}</span>
                  </div>
                  {item.details && (
                    <div style={{
                      ...mono, fontSize: 9,
                      color: "var(--ae-muted)",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid var(--ae-border)",
                      padding: "5px 10px",
                      marginTop: 4,
                      lineHeight: 1.5,
                    }}>
                      {item.details}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", padding: "40px 0", textAlign: "center" }}>
              NO EVENTS FOUND FOR FILTER: {filter}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
