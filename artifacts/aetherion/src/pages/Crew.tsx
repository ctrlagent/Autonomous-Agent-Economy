import { useState } from "react";
import { useListAgents, useListAgentTasks } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, TrendingUp, CheckCircle } from "lucide-react";
import { AgentAvatar, RoleBadge, LevelBadge } from "@/components/PixelSprite";
import { AssignTaskModal } from "@/components/AssignTaskModal";

const FILTERS = ["ALL", "RESEARCH", "STRATEGY", "BUILDER", "CONTENT", "GROWTH", "ANALYTICS"];

const ROLE_HEX: Record<string, string> = {
  research:  "#4df0d8", strategy:  "#9b6dff", builder:   "#4d7fff",
  design:    "#ff4d9b", growth:    "#4dff9b", analytics: "#ff4d6d", content:   "#ffb84d",
};
function getRoleHex(role: string) { return ROLE_HEX[role?.toLowerCase()] ?? "#4d7fff"; }

const ROLE_LABEL: Record<string, string> = {
  research: "⬡ RESEARCH", strategy: "◈ STRATEGY", builder: "⬢ BUILDER",
  content: "◉ CONTENT", growth: "⬟ GROWTH", analytics: "⬠ ANALYTICS",
};

export default function Crew() {
  const { data: agents } = useListAgents();
  const [filter, setFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState<Record<number, { task: string; priority: string }>>({});

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
        {/* Header */}
        <div style={{
          flexShrink: 0, padding: "12px 20px 10px",
          borderBottom: "1px solid var(--ae-border)",
          background: "rgba(0,0,0,0.25)",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <h1 style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 12, color: "var(--ae-cyan)", letterSpacing: "0.04em", lineHeight: 1.5, textShadow: "0 0 18px rgba(77,240,216,0.7), 0 0 40px rgba(77,240,216,0.25)" }}>
              CREW
            </h1>
            <div style={{
              ...mono, fontSize: 8, padding: "3px 10px",
              border: "1px solid var(--ae-cyan)",
              background: "rgba(77,240,216,0.07)",
              color: "var(--ae-cyan)", letterSpacing: "0.1em",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ae-cyan)", display: "inline-block", boxShadow: "0 0 6px var(--ae-cyan)", animation: "pulse-dot 2s ease-in-out infinite" }} />
              {filteredAgents.length} ACTIVE
            </div>
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {FILTERS.map(f => {
              const roleColor = ROLE_HEX[f.toLowerCase()] ?? "var(--ae-cyan)";
              const active = filter === f;
              return (
                <button key={f} onClick={() => setFilter(f)} style={{
                  ...mono, fontSize: 7, padding: "4px 10px",
                  border: `1px solid ${active ? (f === "ALL" ? "var(--ae-cyan)" : roleColor) : "var(--ae-border)"}`,
                  background: active ? `${f === "ALL" ? "rgba(77,240,216,0.1)" : roleColor + "18"}` : "transparent",
                  color: active ? (f === "ALL" ? "var(--ae-cyan)" : roleColor) : "var(--ae-muted)",
                  cursor: "pointer", letterSpacing: "0.08em", transition: "all 0.15s",
                  boxShadow: active ? `0 0 8px ${f === "ALL" ? "rgba(77,240,216,0.3)" : roleColor + "44"}` : "none",
                }}>{f}</button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }} className="ae-grid-bg">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))", gap: 10 }}>
            {filteredAgents.map((agent, i) => {
              const roleColor = getRoleHex(agent.role);
              const isSelected = selectedId === agent.id;
              const xpPct = agent.experience % 100;
              const assigned = assignedTasks[agent.id];
              return (
                <motion.button
                  key={agent.id}
                  onClick={() => setSelectedId(isSelected ? null : agent.id)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 320, damping: 28 }}
                  className="crew-card-hover"
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "0 10px 12px",
                    background: isSelected
                      ? `linear-gradient(160deg, ${roleColor}1a 0%, rgba(0,0,0,0.6) 100%)`
                      : "linear-gradient(160deg, rgba(20,23,32,0.95) 0%, rgba(10,11,15,0.98) 100%)",
                    border: `1px solid ${isSelected ? roleColor : "var(--ae-border)"}`,
                    cursor: "pointer", position: "relative",
                    transition: "all 0.18s",
                    boxShadow: isSelected
                      ? `0 0 24px ${roleColor}55, inset 0 0 30px ${roleColor}08`
                      : "0 2px 8px rgba(0,0,0,0.5)",
                    gap: 0,
                  }}
                  onMouseEnter={e => { if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.borderColor = `${roleColor}55`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 14px ${roleColor}22`;
                  }}}
                  onMouseLeave={e => { if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--ae-border)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.5)";
                  }}}
                >
                  {/* Top color stripe */}
                  <div style={{ width: "100%", height: 3, background: `linear-gradient(to right, ${roleColor}, ${roleColor}44)`, marginBottom: 12, boxShadow: `0 0 8px ${roleColor}66` }} />

                  {/* Corner accents */}
                  <div style={{ position: "absolute", top: 3, left: 0, width: 10, height: 10, borderTop: `2px solid ${roleColor}`, borderLeft: `2px solid ${roleColor}` }} />
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderBottom: `2px solid ${roleColor}`, borderRight: `2px solid ${roleColor}` }} />

                  {/* Level badge */}
                  <div style={{ position: "absolute", top: 10, right: 6 }}><LevelBadge level={agent.level} /></div>

                  {/* Avatar with status ring */}
                  <div style={{ marginBottom: 8, position: "relative" }}>
                    <div style={{
                      position: "absolute", inset: -4,
                      borderRadius: "50%",
                      border: isSelected ? `2px solid ${roleColor}88` : "2px solid transparent",
                      boxShadow: isSelected ? `0 0 12px ${roleColor}66` : "none",
                      transition: "all 0.18s",
                    }} />
                    <AgentAvatar role={agent.role} size={72} />
                    <div style={{
                      position: "absolute", bottom: 2, right: 2,
                      width: 9, height: 9, borderRadius: "50%",
                      background: roleColor, boxShadow: `0 0 7px ${roleColor}`,
                      border: "1.5px solid var(--ae-bg)",
                      animation: "pulse-dot 2s ease-in-out infinite",
                    }} />
                  </div>

                  {/* Name */}
                  <div style={{
                    fontFamily: "'Press Start 2P',monospace", fontSize: 7,
                    color: isSelected ? "var(--ae-text)" : "var(--ae-text)",
                    letterSpacing: "0.04em", lineHeight: 1.6, textAlign: "center",
                    marginBottom: 5, wordBreak: "break-word", width: "100%",
                    textShadow: isSelected ? `0 0 8px ${roleColor}` : "none",
                  }}>
                    {agent.name.toUpperCase()}
                  </div>

                  {/* Role badge */}
                  <div style={{
                    ...mono, fontSize: 7, letterSpacing: "0.08em",
                    color: roleColor, padding: "2px 7px",
                    border: `1px solid ${roleColor}44`,
                    background: `${roleColor}10`,
                    marginBottom: 8,
                    boxShadow: isSelected ? `0 0 6px ${roleColor}44` : "none",
                  }}>
                    {ROLE_LABEL[agent.role.toLowerCase()] ?? agent.role.toUpperCase()}
                  </div>

                  {/* Current task indicator */}
                  {(assigned?.task ?? agent.currentTask) && (
                    <div style={{ width: "100%", marginBottom: 6, padding: "3px 6px", background: "rgba(0,0,0,0.4)", border: `1px solid ${roleColor}22` }}>
                      <div style={{ ...mono, fontSize: 6, color: roleColor, letterSpacing: "0.06em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        ▶ {(assigned?.task ?? agent.currentTask ?? "").slice(0, 22)}{(assigned?.task ?? agent.currentTask ?? "").length > 22 ? "…" : ""}
                      </div>
                    </div>
                  )}

                  {/* XP bar */}
                  <div style={{ width: "100%", marginTop: 2 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ ...mono, fontSize: 6, color: "var(--ae-dim)" }}>XP</span>
                      <span style={{ ...mono, fontSize: 6, color: roleColor }}>{xpPct}%</span>
                    </div>
                    <div className="progress-shimmer" style={{ height: 4, background: "var(--ae-border)" }}>
                      <div style={{
                        height: "100%", width: `${xpPct}%`,
                        background: `linear-gradient(to right, ${roleColor}88, ${roleColor})`,
                        boxShadow: `0 0 6px ${roleColor}`,
                        transition: "width 1s",
                        position: "relative",
                      }}>
                        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.6)" }} />
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: SELECTED AGENT PANEL */}
      <div style={{
        width: 264, flexShrink: 0,
        borderLeft: "1px solid var(--ae-border)",
        background: "rgba(0,0,0,0.3)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{
          padding: "10px 14px", borderBottom: "1px solid var(--ae-border)",
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(0,0,0,0.2)",
        }}>
          <div style={{ width: 6, height: 6, background: "var(--ae-cyan-dim)", border: "1px solid var(--ae-cyan)", flexShrink: 0 }} />
          <span style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.12em" }}>SELECTED AGENT</span>
        </div>

        <AnimatePresence mode="wait">
          {selectedAgent ? (
            <motion.div
              key={selectedAgent.id}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 14 }}
              style={{ flex: 1, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", position: "relative" }}
            >
              <button onClick={() => setSelectedId(null)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", padding: 4, display: "flex" }}><X size={12} /></button>

              {/* Avatar + holo bg */}
              <div style={{ display: "flex", justifyContent: "center", position: "relative", padding: "8px 0" }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: `radial-gradient(ellipse at center, ${getRoleHex(selectedAgent.role)}18 0%, transparent 70%)`,
                }} />
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", inset: -6,
                    borderRadius: "50%",
                    border: `1px solid ${getRoleHex(selectedAgent.role)}44`,
                    boxShadow: `0 0 20px ${getRoleHex(selectedAgent.role)}33`,
                  }} />
                  <AgentAvatar role={selectedAgent.role} size={104} />
                </div>
              </div>

              {/* Name + role */}
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "'Press Start 2P',monospace", fontSize: 9,
                  color: "var(--ae-text)", letterSpacing: "0.04em", lineHeight: 1.6, marginBottom: 6,
                  textShadow: `0 0 12px ${getRoleHex(selectedAgent.role)}66`,
                }}>
                  {selectedAgent.name.toUpperCase()}
                </div>
                <RoleBadge role={selectedAgent.role} size="sm" />
              </div>

              {/* Current / Assigned task */}
              {(assignedTasks[selectedAgent.id]?.task ?? selectedAgent.currentTask) && (
                <div style={{
                  border: `1px solid ${getRoleHex(selectedAgent.role)}44`,
                  padding: "8px 10px",
                  background: `${getRoleHex(selectedAgent.role)}08`,
                  position: "relative",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: 5, borderTop: `2px solid ${getRoleHex(selectedAgent.role)}`, borderLeft: `2px solid ${getRoleHex(selectedAgent.role)}` }} />
                  <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 4 }}>
                    {assignedTasks[selectedAgent.id] ? (
                      <span style={{ color: { CRITICAL: "#ff4d6d", HIGH: "#ffb84d", NORMAL: "var(--ae-cyan)", LOW: "#9b6dff" }[assignedTasks[selectedAgent.id].priority] ?? "var(--ae-cyan)" }}>
                        ▶ {assignedTasks[selectedAgent.id].priority} PRIORITY
                      </span>
                    ) : "CURRENT TASK"}
                  </div>
                  <div style={{ ...mono, fontSize: 9, color: "var(--ae-text)", lineHeight: 1.5 }}>
                    {assignedTasks[selectedAgent.id]?.task ?? selectedAgent.currentTask}
                  </div>
                </div>
              )}

              {/* XP */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 7, color: "var(--ae-muted)", marginBottom: 5 }}>
                  <span>XP PROGRESS</span>
                  <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: "#ffd700", textShadow: "0 0 8px #ffd70066" }} className="xp-badge">LV.{selectedAgent.level}★</span>
                </div>
                <div className="progress-shimmer" style={{ height: 8, background: "var(--ae-border)", position: "relative" }}>
                  <div style={{
                    height: "100%", width: `${selectedAgent.experience % 100}%`,
                    background: `linear-gradient(to right, ${getRoleHex(selectedAgent.role)}88, ${getRoleHex(selectedAgent.role)})`,
                    boxShadow: `0 0 10px ${getRoleHex(selectedAgent.role)}80`,
                    transition: "width 1s",
                    position: "relative",
                  }}>
                    <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.5)" }} />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                  <span style={{ ...mono, fontSize: 6, color: "var(--ae-dim)" }}>{selectedAgent.experience % 100} / 100 XP</span>
                  <span style={{ ...mono, fontSize: 6, color: getRoleHex(selectedAgent.role) }}>+{Math.round(selectedAgent.tasksCompleted * 4.2)} TOTAL</span>
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
                {[
                  { label: "Tasks",   value: String(selectedAgent.tasksCompleted), Icon: CheckCircle, color: "var(--ae-green)" },
                  { label: "Success", value: "94%",                                Icon: TrendingUp,  color: "var(--ae-cyan)" },
                  { label: "Uptime",  value: "99.2%",                             Icon: Zap,         color: "var(--ae-blue)" },
                ].map(s => (
                  <div key={s.label} style={{
                    border: `1px solid ${s.color}33`,
                    padding: "7px 5px", textAlign: "center",
                    background: `${s.color}08`,
                    position: "relative",
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: 4, borderTop: `1px solid ${s.color}`, borderLeft: `1px solid ${s.color}` }} />
                    <s.Icon size={9} style={{ color: s.color, marginBottom: 3 }} />
                    <div style={{ ...mono, fontSize: 11, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", marginTop: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 5 }}>
                <button className="pixel-btn primary" style={{ flex: 1, fontSize: 7, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <Zap size={9} /> UPGRADE
                </button>
                <button className="pixel-btn warning" style={{ flex: 1, fontSize: 7 }} onClick={() => setShowAssignModal(true)}>ASSIGN</button>
                <button className="pixel-btn danger" style={{ flex: 1, fontSize: 7 }}>REMOVE</button>
              </div>

              {/* Task history */}
              {tasks && tasks.length > 0 && (
                <div>
                  <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>TASK HISTORY</div>
                  {tasks.slice(0, 5).map(t => (
                    <div key={t.id} style={{
                      ...mono, fontSize: 8, padding: "6px 8px",
                      borderBottom: "1px solid var(--ae-border)",
                      color: "var(--ae-muted)",
                      display: "flex", justifyContent: "space-between", gap: 8,
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                      <span style={{
                        color: t.status === "completed" ? "var(--ae-green)" : "var(--ae-cyan)",
                        flexShrink: 0, fontSize: 10,
                      }}>
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
              <div style={{
                width: 56, height: 56,
                border: "2px dashed var(--ae-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <div style={{ position: "absolute", top: -1, left: -1, width: 8, height: 8, borderTop: "2px solid var(--ae-cyan)", borderLeft: "2px solid var(--ae-cyan)" }} />
                <div style={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderBottom: "2px solid var(--ae-cyan)", borderRight: "2px solid var(--ae-cyan)" }} />
                <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 18, color: "var(--ae-dim)" }}>?</span>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--ae-dim)", textAlign: "center", letterSpacing: "0.08em", lineHeight: 1.8 }}>
                SELECT AN AGENT<br />TO VIEW DETAILS
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Assign Task Modal */}
      {showAssignModal && selectedAgent && (
        <AssignTaskModal
          agentName={selectedAgent.name}
          agentRole={selectedAgent.role}
          currentTask={assignedTasks[selectedAgent.id]?.task ?? selectedAgent.currentTask}
          onAssign={(task, priority) => {
            setAssignedTasks(prev => ({ ...prev, [selectedAgent.id]: { task, priority } }));
          }}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </div>
  );
}
