import { useState } from "react";
import { useListAgents, useListAgentTasks } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { AgentAvatar, RoleBadge, LevelBadge } from "@/components/PixelSprite";

const FILTERS = ["ALL", "RESEARCH", "STRATEGY", "BUILDER", "CONTENT", "GROWTH", "ANALYTICS"];

const ROLE_HEX: Record<string, string> = {
  research:  "#4df0d8", strategy:  "#9b6dff", builder:   "#4d7fff",
  design:    "#ff4d9b", growth:    "#4dff9b", analytics: "#ff4d6d", content:   "#ffb84d",
};
function getRoleHex(role: string) { return ROLE_HEX[role?.toLowerCase()] ?? "#4d7fff"; }

export default function Crew() {
  const { data: agents } = useListAgents();
  const [filter, setFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredAgents = agents?.filter(
    a => filter === "ALL" || a.role.toUpperCase() === filter
  ) ?? [];
  const selectedAgent = agents?.find(a => a.id === selectedId);
  const { data: tasks } = useListAgentTasks(selectedId ?? 0, { query: { enabled: !!selectedId } });

  const mono = { fontFamily: "'Space Mono', monospace" };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* LEFT: AGENT GRID */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{
          flexShrink: 0, padding: "12px 20px 10px",
          borderBottom: "1px solid var(--ae-border)",
          background: "rgba(0,0,0,0.2)",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <h1 style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 12, color: "var(--ae-cyan)", letterSpacing: "0.04em", lineHeight: 1.5, textShadow: "0 0 12px rgba(77,240,216,0.6)" }}>
              CREW
            </h1>
            <span style={{
              ...mono, fontSize: 8, padding: "2px 8px",
              border: "1px solid var(--ae-cyan)", color: "var(--ae-cyan)", letterSpacing: "0.1em",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ae-cyan)", display: "inline-block", boxShadow: "0 0 5px var(--ae-cyan)", animation: "pulse-dot 2s ease-in-out infinite" }} />
              {filteredAgents.length} ACTIVE
            </span>
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                ...mono, fontSize: 8, padding: "3px 9px",
                border: `1px solid ${filter === f ? "var(--ae-cyan)" : "var(--ae-border)"}`,
                background: filter === f ? "var(--ae-cyan-dim)" : "transparent",
                color: filter === f ? "var(--ae-cyan)" : "var(--ae-muted)",
                cursor: "pointer", letterSpacing: "0.08em", transition: "all 0.15s",
              }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }} className="ae-grid-bg">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 10 }}>
            {filteredAgents.map((agent, i) => {
              const roleColor = getRoleHex(agent.role);
              const isSelected = selectedId === agent.id;
              const xpPct = agent.experience % 100;
              return (
                <motion.button
                  key={agent.id}
                  onClick={() => setSelectedId(isSelected ? null : agent.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "14px 10px 10px",
                    background: isSelected ? `${roleColor}18` : "var(--ae-surface)",
                    border: `1px solid ${isSelected ? roleColor : "var(--ae-border)"}`,
                    cursor: "pointer", position: "relative",
                    transition: "all 0.15s",
                    boxShadow: isSelected ? `0 0 18px ${roleColor}44` : "none",
                    gap: 6,
                  }}
                  onMouseEnter={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.borderColor = `${roleColor}66`; } }}
                  onMouseLeave={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.borderColor = "var(--ae-border)"; } }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `2px solid ${roleColor}`, borderLeft: `2px solid ${roleColor}` }} />
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderBottom: `2px solid ${roleColor}`, borderRight: `2px solid ${roleColor}` }} />
                  <div style={{ position: "absolute", top: 6, right: 6 }}><LevelBadge level={agent.level} /></div>

                  <div style={{ marginBottom: 4, position: "relative" }}>
                    <AgentAvatar role={agent.role} size={68} />
                    <div style={{
                      position: "absolute", bottom: 2, right: 2,
                      width: 8, height: 8, borderRadius: "50%",
                      background: roleColor, boxShadow: `0 0 6px ${roleColor}`,
                      border: "1px solid var(--ae-bg)",
                    }} />
                  </div>

                  <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: "var(--ae-text)", letterSpacing: "0.04em", lineHeight: 1.5, textAlign: "center" }}>
                    {agent.name.toUpperCase()}
                  </div>
                  <RoleBadge role={agent.role} size="xs" />

                  {agent.currentTask && (
                    <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", textAlign: "center", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                      <span style={{ color: roleColor }}>●</span> {agent.currentTask.length > 16 ? agent.currentTask.slice(0, 16) + "…" : agent.currentTask}
                    </div>
                  )}

                  <div style={{ width: "100%", marginTop: 2 }}>
                    <div style={{ height: 3, background: "var(--ae-border)", width: "100%", position: "relative" }}>
                      <div style={{ height: "100%", width: `${xpPct}%`, background: roleColor, boxShadow: `0 0 4px ${roleColor}`, transition: "width 1s" }} />
                    </div>
                    <div style={{ ...mono, fontSize: 6, color: "var(--ae-dim)", marginTop: 2, textAlign: "right" }}>{xpPct}%</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: SELECTED AGENT PANEL */}
      <div style={{
        width: 255, flexShrink: 0,
        borderLeft: "1px solid var(--ae-border)",
        background: "rgba(0,0,0,0.25)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--ae-border)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.12em" }}>SELECTED AGENT</span>
        </div>

        <AnimatePresence mode="wait">
          {selectedAgent ? (
            <motion.div
              key={selectedAgent.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              style={{ flex: 1, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", position: "relative" }}
            >
              <button onClick={() => setSelectedId(null)} style={{ position: "absolute", top: 0, right: 0, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", padding: 4 }}><X size={12} /></button>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <AgentAvatar role={selectedAgent.role} size={96} />
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: "var(--ae-text)", letterSpacing: "0.04em", lineHeight: 1.6, marginBottom: 6 }}>
                  {selectedAgent.name.toUpperCase()}
                </div>
                <RoleBadge role={selectedAgent.role} size="sm" />
              </div>

              {selectedAgent.currentTask && (
                <div style={{ border: "1px solid var(--ae-border)", padding: "8px 10px", background: "rgba(0,0,0,0.3)" }}>
                  <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 4 }}>CURRENT TASK</div>
                  <div style={{ ...mono, fontSize: 9, color: "var(--ae-text)", lineHeight: 1.5 }}>{selectedAgent.currentTask}</div>
                </div>
              )}

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 7, color: "var(--ae-muted)", marginBottom: 5 }}>
                  <span>XP PROGRESS</span>
                  <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: "#ffd700" }}>LV.{selectedAgent.level}★</span>
                </div>
                <div style={{ height: 8, background: "var(--ae-border)", position: "relative" }}>
                  <div style={{
                    height: "100%", width: `${selectedAgent.experience % 100}%`,
                    background: `linear-gradient(to right, ${getRoleHex(selectedAgent.role)}, ${getRoleHex(selectedAgent.role)}aa)`,
                    boxShadow: `0 0 8px ${getRoleHex(selectedAgent.role)}80`,
                    transition: "width 1s",
                  }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
                {[
                  { label: "Tasks", value: String(selectedAgent.tasksCompleted) },
                  { label: "Success", value: "94%" },
                  { label: "Uptime", value: "99.2%" },
                ].map(s => (
                  <div key={s.label} style={{ border: "1px solid var(--ae-border)", padding: "6px 4px", textAlign: "center", background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ ...mono, fontSize: 11, fontWeight: 700, color: "var(--ae-text)" }}>{s.value}</div>
                    <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 5 }}>
                <button className="pixel-btn primary" style={{ flex: 1, fontSize: 7 }}>UPGRADE ↑</button>
                <button className="pixel-btn warning" style={{ flex: 1, fontSize: 7 }}>ASSIGN</button>
                <button className="pixel-btn danger" style={{ flex: 1, fontSize: 7 }}>REMOVE</button>
              </div>

              {tasks && tasks.length > 0 && (
                <div>
                  <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>TASK HISTORY</div>
                  {tasks.slice(0, 4).map(t => (
                    <div key={t.id} style={{
                      ...mono, fontSize: 8, padding: "5px 8px",
                      borderBottom: "1px solid var(--ae-border)",
                      color: "var(--ae-muted)",
                      display: "flex", justifyContent: "space-between", gap: 8,
                    }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                      <span style={{ color: t.status === "completed" ? "var(--ae-green)" : "var(--ae-cyan)", flexShrink: 0 }}>
                        {t.status === "completed" ? "✓" : "⟳"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24 }}
            >
              <div style={{ width: 52, height: 52, border: "2px dashed var(--ae-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 18, color: "var(--ae-dim)" }}>?</span>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--ae-dim)", textAlign: "center", letterSpacing: "0.08em", lineHeight: 1.8 }}>
                SELECT AN AGENT<br />TO VIEW DETAILS
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
