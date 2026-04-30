import { useState } from "react";
import { useListAgents, useListAgentTasks } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const FILTERS = ["ALL", "RESEARCH", "STRATEGY", "BUILDER", "CONTENT", "GROWTH", "ANALYTICS"];

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
  return ROLE_HEX[role?.toLowerCase()] ?? "#4d7fff";
}

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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: "16px 24px 12px", borderBottom: "1px solid var(--ae-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: "var(--ae-text)", letterSpacing: "0.04em", lineHeight: 1.8 }}>CREW ROSTER</h1>
            <p style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", marginTop: 4 }}>Manage and assign autonomous agents</p>
          </div>
          {/* Filters */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...mono,
                  fontSize: 9,
                  padding: "3px 10px",
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
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", paddingBottom: selectedId ? 310 : 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {filteredAgents.map(agent => {
            const roleColor = getRoleHex(agent.role);
            const isSelected = selectedId === agent.id;
            const isWorking = agent.status?.toLowerCase() === "working";

            return (
              <motion.button
                key={agent.id}
                onClick={() => setSelectedId(isSelected ? null : agent.id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: 14,
                  background: isSelected ? `${roleColor}10` : "var(--ae-surface)",
                  border: `1px solid ${isSelected ? roleColor : isWorking ? roleColor + "55" : "var(--ae-border)"}`,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                  boxShadow: isWorking ? `0 0 12px ${roleColor}22` : "none",
                  position: "relative",
                }}
              >
                {/* Role corner accents */}
                <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `2px solid ${roleColor}`, borderLeft: `2px solid ${roleColor}` }} />
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderBottom: `2px solid ${roleColor}`, borderRight: `2px solid ${roleColor}` }} />

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{
                    width: 40, height: 40,
                    borderRadius: "50%",
                    background: `${roleColor}20`,
                    border: `1.5px solid ${roleColor}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700, fontSize: 14,
                    color: roleColor,
                    flexShrink: 0,
                  }}>
                    {agent.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ ...mono, fontWeight: 700, fontSize: 13, color: "var(--ae-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {agent.name}
                      </span>
                      <span style={{
                        ...mono, fontSize: 8,
                        padding: "1px 5px",
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid var(--ae-border)",
                        color: "var(--ae-muted)",
                        flexShrink: 0,
                        marginLeft: 6,
                      }}>
                        LVL {agent.level}
                      </span>
                    </div>
                    <div style={{ ...mono, fontSize: 9, color: "var(--ae-muted)", letterSpacing: "0.08em", marginTop: 2 }}>
                      {agent.role?.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={`status-dot ${agent.status?.toLowerCase()}`} />
                  <span style={{ ...mono, fontSize: 9, color: "var(--ae-muted)", letterSpacing: "0.06em" }}>{agent.status?.toUpperCase()}</span>
                  <span style={{ ...mono, fontSize: 9, color: "var(--ae-dim)", marginLeft: "auto" }}>{agent.tasksCompleted} TASKS</span>
                </div>

                {agent.currentTask && (
                  <div style={{
                    marginTop: 8,
                    ...mono, fontSize: 9,
                    color: "var(--ae-muted)",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--ae-border)",
                    padding: "5px 8px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    &gt; {agent.currentTask}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.2 }}
            style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              height: 280,
              background: "var(--ae-surface)",
              borderTop: "1px solid var(--ae-border-bright)",
              padding: "16px 24px",
              zIndex: 30,
              display: "flex",
              gap: 24,
            }}
          >
            <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: `${getRoleHex(selectedAgent.role)}20`,
                  border: `1.5px solid ${getRoleHex(selectedAgent.role)}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Space Mono', monospace",
                  fontWeight: 700, fontSize: 18,
                  color: getRoleHex(selectedAgent.role),
                }}>
                  {selectedAgent.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "var(--ae-text)", lineHeight: 1.6, letterSpacing: "0.04em" }}>{selectedAgent.name}</div>
                  <div style={{ ...mono, fontSize: 9, color: "var(--ae-muted)", marginTop: 4, letterSpacing: "0.08em" }}>{selectedAgent.role?.toUpperCase()} · LEVEL {selectedAgent.level}</div>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 5 }}>
                  <span>EXPERIENCE</span>
                  <span style={{ color: "var(--ae-text)" }}>{selectedAgent.experience} XP</span>
                </div>
                <div className="pixel-progress">
                  <div className="pixel-progress-fill" style={{ width: `${selectedAgent.experience % 100}%`, background: "var(--ae-green)" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                <button className="pixel-btn primary" style={{ flex: 1 }}>UPGRADE</button>
                <button className="pixel-btn" style={{ flex: 1 }}>ASSIGN</button>
                <button className="pixel-btn warning" style={{ flex: 1 }}>PAUSE</button>
              </div>
            </div>

            <div style={{ flex: 1, borderLeft: "1px solid var(--ae-border)", paddingLeft: 24, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
              <div style={{ ...mono, fontSize: 9, color: "var(--ae-muted)", letterSpacing: "0.12em", marginBottom: 10 }}>RECENT TASKS</div>
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                {tasks?.length ? tasks.map(task => (
                  <div key={task.id} style={{
                    padding: "8px 12px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--ae-border)",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                  }}>
                    <span style={{ ...mono, fontSize: 10, color: "var(--ae-text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</span>
                    <span style={{
                      ...mono, fontSize: 8, padding: "2px 7px",
                      border: `1px solid ${task.status === "completed" ? "var(--ae-green)" : task.status === "in_progress" ? "var(--ae-cyan)" : "var(--ae-border)"}55`,
                      color: task.status === "completed" ? "var(--ae-green)" : task.status === "in_progress" ? "var(--ae-cyan)" : "var(--ae-muted)",
                      flexShrink: 0, letterSpacing: "0.06em",
                    }}>
                      {task.status?.toUpperCase().replace("_", " ")}
                    </span>
                  </div>
                )) : (
                  <div style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", fontStyle: "italic" }}>No recent tasks.</div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedId(null)}
              style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)" }}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
