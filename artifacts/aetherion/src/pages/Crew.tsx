import { useState, useEffect } from "react";
import { useListAgents, useListAgentTasks, useListStations, useListRooms, useDeleteAgent } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, TrendingUp, CheckCircle, Plus, Trash2, ChevronDown } from "lucide-react";
import { AgentAvatar, RoleBadge, LevelBadge } from "@/components/PixelSprite";
import { AssignTaskModal } from "@/components/AssignTaskModal";
import { AddAgentModal } from "@/components/AddAgentModal";
import { CreateTaskModal } from "@/components/CreateTaskModal";

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

const FILTERS = ["ALL", "RESEARCH", "STRATEGY", "BUILDER", "CONTENT", "GROWTH", "ANALYTICS"];

const ROLE_HEX: Record<string, string> = {
  research:  "#5b8fff", strategy:  "#9b6dff", builder:   "#4d7fff",
  design:    "#ff4d9b", growth:    "#4dff9b", analytics: "#ff4d6d", content:   "#ffb84d",
};
function getRoleHex(role: string) { return ROLE_HEX[role?.toLowerCase()] ?? "#4d7fff"; }

const ROLE_LABEL: Record<string, string> = {
  research: "⬡ RESEARCH", strategy: "◈ STRATEGY", builder: "⬢ BUILDER",
  content: "◉ CONTENT", growth: "⬟ GROWTH", analytics: "⬠ ANALYTICS",
};

type Agent = { id: number; name: string; role: string; level: number; experience: number; tasksCompleted: number; currentTask?: string | null; status?: string };
type Task = { id: number; title: string; status: string };

function AgentDetailContent({
  agent, tasks, assignedTask, onClose, onAssign, onCreateTask, onDelete, mono, isMobile,
}: {
  agent: Agent;
  tasks: Task[];
  assignedTask?: { task: string; priority: string };
  onClose: () => void;
  onAssign: () => void;
  onCreateTask: () => void;
  onDelete: () => void;
  mono: React.CSSProperties;
  isMobile: boolean;
}) {
  const roleColor = getRoleHex(agent.role);

  return (
    <motion.div
      key={agent.id}
      initial={{ opacity: 0, y: isMobile ? 20 : 0, x: isMobile ? 0 : 14 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: isMobile ? 20 : 0, x: isMobile ? 0 : 14 }}
      style={{ flex: 1, padding: isMobile ? "12px 16px" : "16px 14px", display: "flex", flexDirection: "column", gap: isMobile ? 10 : 12, overflowY: "auto", position: "relative" }}
    >
      {!isMobile && (
        <button onClick={onClose} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", padding: 4, display: "flex" }}>
          <X size={12} />
        </button>
      )}

      {/* Avatar row — horizontal on mobile, vertical on desktop */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "row" : "column",
        alignItems: "center",
        gap: isMobile ? 14 : 0,
        position: "relative",
        padding: isMobile ? "4px 0" : "8px 0",
      }}>
        {!isMobile && (
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, ${roleColor}18 0%, transparent 70%)` }} />
        )}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            position: "absolute", inset: -6, borderRadius: "50%",
            border: `1px solid ${roleColor}44`,
            boxShadow: `0 0 20px ${roleColor}33`,
          }} />
          <AgentAvatar role={agent.role} size={isMobile ? 72 : 104} />
        </div>
        {/* Name + role beside avatar on mobile */}
        <div style={{ textAlign: isMobile ? "left" : "center", flex: isMobile ? 1 : undefined }}>
          <div style={{
            fontFamily: "'Press Start 2P',monospace", fontSize: isMobile ? 8 : 9,
            color: "var(--ae-text)", letterSpacing: "0.04em", lineHeight: 1.6, marginBottom: 6,
            textShadow: `0 0 12px ${roleColor}66`,
          }}>
            {agent.name.toUpperCase()}
          </div>
          <RoleBadge role={agent.role} size="sm" />
          {isMobile && (
            <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
              <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: "#ffd700", textShadow: "0 0 8px #ffd70066" }}>LV.{agent.level}★</span>
              <span style={{ ...mono, fontSize: 6, color: "var(--ae-dim)" }}>XP {agent.experience % 100}/100</span>
            </div>
          )}
        </div>
      </div>

      {/* XP bar — desktop only (mobile shows inline above) */}
      {!isMobile && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 7, color: "var(--ae-muted)", marginBottom: 5 }}>
            <span>XP PROGRESS</span>
            <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: "#ffd700", textShadow: "0 0 8px #ffd70066" }} className="xp-badge">LV.{agent.level}★</span>
          </div>
          <div className="progress-shimmer" style={{ height: 8, background: "var(--ae-border)", position: "relative" }}>
            <div style={{ height: "100%", width: `${agent.experience % 100}%`, background: `linear-gradient(to right, ${roleColor}88, ${roleColor})`, boxShadow: `0 0 10px ${roleColor}80`, transition: "width 1s", position: "relative" }}>
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.5)" }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span style={{ ...mono, fontSize: 6, color: "var(--ae-dim)" }}>{agent.experience % 100} / 100 XP</span>
            <span style={{ ...mono, fontSize: 6, color: roleColor }}>+{Math.round(agent.tasksCompleted * 4.2)} TOTAL</span>
          </div>
        </div>
      )}

      {/* XP bar — mobile compact */}
      {isMobile && (
        <div className="progress-shimmer" style={{ height: 4, background: "var(--ae-border)" }}>
          <div style={{ height: "100%", width: `${agent.experience % 100}%`, background: `linear-gradient(to right, ${roleColor}88, ${roleColor})`, boxShadow: `0 0 6px ${roleColor}`, transition: "width 1s" }} />
        </div>
      )}

      {/* Current / Assigned task */}
      {(assignedTask?.task ?? agent.currentTask) && (
        <div style={{ border: `1px solid ${roleColor}44`, padding: "8px 10px", background: `${roleColor}08`, position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: 5, borderTop: `2px solid ${roleColor}`, borderLeft: `2px solid ${roleColor}` }} />
          <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 4 }}>
            {assignedTask ? (
              <span style={{ color: ({ CRITICAL: "#ff4d6d", HIGH: "#ffb84d", NORMAL: "var(--ae-cyan)", LOW: "#9b6dff" } as Record<string,string>)[assignedTask.priority] ?? "var(--ae-cyan)" }}>
                ▶ {assignedTask.priority} PRIORITY
              </span>
            ) : "CURRENT TASK"}
          </div>
          <div style={{ ...mono, fontSize: 9, color: "var(--ae-text)", lineHeight: 1.5 }}>
            {assignedTask?.task ?? agent.currentTask}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
        {[
          { label: "Tasks",   value: String(agent.tasksCompleted), Icon: CheckCircle, color: "var(--ae-green)" },
          { label: "Success", value: "94%",                         Icon: TrendingUp,  color: "var(--ae-cyan)" },
          { label: "Uptime",  value: "99.2%",                      Icon: Zap,         color: "var(--ae-blue)" },
        ].map(s => (
          <div key={s.label} style={{ border: `1px solid ${s.color}33`, padding: "7px 5px", textAlign: "center", background: `${s.color}08`, position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: 4, borderTop: `1px solid ${s.color}`, borderLeft: `1px solid ${s.color}` }} />
            <s.Icon size={9} style={{ color: s.color, marginBottom: 3 }} />
            <div style={{ ...mono, fontSize: 11, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 5 }}>
        <button
          className="pixel-btn primary"
          style={{ flex: 1, fontSize: 7, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
          onClick={async () => {
            try {
              await fetch(`/api/agents/${agent.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ level: agent.level + 1, experience: 0 }),
              });
              // Trigger a re-render by dispatching a custom event
              window.dispatchEvent(new CustomEvent("agent-upgraded", { detail: { id: agent.id } }));
            } catch { /* ignore */ }
          }}
        >
          <Zap size={9} /> UPGRADE
        </button>
        <button className="pixel-btn warning" style={{ flex: 1, fontSize: 7, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }} onClick={onCreateTask}>
          <Plus size={9} /> TASK
        </button>
        <button className="pixel-btn danger" style={{ flex: 1, fontSize: 7, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }} onClick={onDelete}>
          <Trash2 size={9} /> DEL
        </button>
      </div>

      {/* Task history */}
      {tasks.length > 0 && (
        <div>
          <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>TASK HISTORY</div>
          {tasks.slice(0, isMobile ? 3 : 5).map(t => (
            <div key={t.id} style={{ ...mono, fontSize: 8, padding: "6px 8px", borderBottom: "1px solid var(--ae-border)", color: "var(--ae-muted)", display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
              <span style={{ color: t.status === "completed" ? "var(--ae-green)" : "var(--ae-cyan)", flexShrink: 0, fontSize: 10 }}>
                {t.status === "completed" ? "✓" : "⟳"}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function Crew() {
  const { data: agents } = useListAgents();
  const { data: stations } = useListStations();
  const firstStationId = stations?.[0]?.id ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stationRooms } = useListRooms(firstStationId ?? 0, { query: { enabled: !!firstStationId } as any });
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState<Record<number, { task: string; priority: string }>>({});
  const isMobile = useIsMobile();

  const { mutateAsync: deleteAgent } = useDeleteAgent();

  // Refresh agents list when an upgrade event fires
  useEffect(() => {
    const handler = () => queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
    window.addEventListener("agent-upgraded", handler);
    return () => window.removeEventListener("agent-upgraded", handler);
  }, [queryClient]);

  const filteredAgents = agents?.filter(
    a => filter === "ALL" || a.role.toUpperCase() === filter
  ) ?? [];
  const selectedAgent = agents?.find(a => a.id === selectedId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tasks } = useListAgentTasks(selectedId ?? 0, { query: { enabled: !!selectedId } as any });

  const handleDeleteAgent = async (agentId: number) => {
    if (!window.confirm("Remove this agent from the station?")) return;
    try {
      await deleteAgent({ id: agentId });
      await queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      setSelectedId(null);
    } catch {
      // silent fail — agent may already be gone
    }
  };

  const mono = { fontFamily: "'Space Mono', monospace" };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", flexDirection: isMobile ? "column" : "row" }}>
      {/* AGENT GRID COLUMN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Header */}
        <div style={{
          flexShrink: 0,
          padding: isMobile ? "10px 12px 8px" : "12px 20px 10px",
          borderBottom: "1px solid var(--ae-border)",
          background: "rgba(0,0,0,0.25)",
        }}>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <h1 style={{ fontFamily: "'Press Start 2P',monospace", fontSize: isMobile ? 10 : 12, color: "var(--ae-cyan)", letterSpacing: "0.04em", lineHeight: 1.5, textShadow: "0 0 18px rgba(91,143,255,0.7), 0 0 40px rgba(91,143,255,0.25)" }}>
              CREW
            </h1>
            <div style={{
              ...mono, fontSize: 7, padding: "3px 8px",
              border: "1px solid var(--ae-cyan)",
              background: "rgba(91,143,255,0.07)",
              color: "var(--ae-cyan)", letterSpacing: "0.1em",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ae-cyan)", display: "inline-block", boxShadow: "0 0 6px var(--ae-cyan)", animation: "pulse-dot 2s ease-in-out infinite" }} />
              {filteredAgents.length} ACTIVE
            </div>
            <button
              className="pixel-btn primary"
              style={{ marginLeft: "auto", fontSize: 7, display: "flex", alignItems: "center", gap: 5, padding: "5px 10px" }}
              onClick={() => setShowAddAgent(true)}
            >
              <Plus size={9} /> DEPLOY AGENT
            </button>
          </div>
          {/* Filter tabs — horizontal scroll on mobile */}
          <div style={{
            display: "flex", gap: 5,
            overflowX: isMobile ? "auto" : "unset",
            flexWrap: isMobile ? "nowrap" : "wrap",
            paddingBottom: isMobile ? 2 : 0,
            scrollbarWidth: "none",
          }}>
            {FILTERS.map(f => {
              const roleColor = ROLE_HEX[f.toLowerCase()] ?? "var(--ae-cyan)";
              const active = filter === f;
              return (
                <button key={f} onClick={() => setFilter(f)} style={{
                  ...mono, fontSize: 7, padding: "4px 10px", flexShrink: 0,
                  border: `1px solid ${active ? (f === "ALL" ? "var(--ae-cyan)" : roleColor) : "var(--ae-border)"}`,
                  background: active ? `${f === "ALL" ? "rgba(91,143,255,0.1)" : roleColor + "18"}` : "transparent",
                  color: active ? (f === "ALL" ? "var(--ae-cyan)" : roleColor) : "var(--ae-muted)",
                  cursor: "pointer", letterSpacing: "0.08em", transition: "all 0.15s",
                  boxShadow: active ? `0 0 8px ${f === "ALL" ? "rgba(91,143,255,0.3)" : roleColor + "44"}` : "none",
                  whiteSpace: "nowrap",
                }}>{f}</button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "10px 10px" : "16px 20px" }} className="ae-grid-bg">
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, 1fr)"
              : "repeat(auto-fill, minmax(168px, 1fr))",
            gap: isMobile ? 8 : 10,
          }}>
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

      {/* DESKTOP SIDE PANEL — hidden on mobile */}
      {!isMobile && (
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
              <AgentDetailContent
                key={selectedAgent.id}
                agent={selectedAgent}
                tasks={tasks ?? []}
                assignedTask={assignedTasks[selectedAgent.id]}
                onClose={() => setSelectedId(null)}
                onAssign={() => setShowAssignModal(true)}
                onCreateTask={() => setShowCreateTask(true)}
                onDelete={() => handleDeleteAgent(selectedAgent.id)}
                mono={mono}
                isMobile={false}
              />
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24 }}
              >
                <div style={{ width: 56, height: 56, border: "2px dashed var(--ae-border)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
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
      )}

      {/* MOBILE BOTTOM SHEET — shown only on mobile when agent selected */}
      {isMobile && (
        <AnimatePresence>
          {selectedAgent && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedId(null)}
                style={{
                  position: "fixed", inset: 0,
                  background: "rgba(0,0,0,0.65)",
                  zIndex: 90,
                  backdropFilter: "blur(2px)",
                }}
              />
              {/* Sheet */}
              <motion.div
                key="sheet"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
                style={{
                  position: "fixed",
                  bottom: 56,
                  left: 0, right: 0,
                  height: "72vh",
                  background: "var(--ae-surface)",
                  borderTop: `2px solid ${getRoleHex(selectedAgent.role)}`,
                  borderLeft: `1px solid var(--ae-border)`,
                  borderRight: `1px solid var(--ae-border)`,
                  zIndex: 91,
                  display: "flex", flexDirection: "column",
                  boxShadow: `0 -8px 40px ${getRoleHex(selectedAgent.role)}33`,
                  overflow: "hidden",
                }}
              >
                {/* Sheet header */}
                <div style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--ae-border)",
                  background: "rgba(0,0,0,0.3)",
                  display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
                }}>
                  {/* Drag handle */}
                  <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", width: 32, height: 3, borderRadius: 2, background: "var(--ae-border)" }} />
                  <div style={{ width: 6, height: 6, background: getRoleHex(selectedAgent.role), border: `1px solid ${getRoleHex(selectedAgent.role)}`, flexShrink: 0, boxShadow: `0 0 6px ${getRoleHex(selectedAgent.role)}` }} />
                  <span style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.12em", flex: 1 }}>SELECTED AGENT</span>
                  <button
                    onClick={() => setSelectedId(null)}
                    style={{ background: "none", border: "1px solid var(--ae-border)", cursor: "pointer", color: "var(--ae-muted)", padding: "3px 6px", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <ChevronDown size={12} />
                    <span style={{ ...mono, fontSize: 6, letterSpacing: "0.08em" }}>CLOSE</span>
                  </button>
                </div>
                {/* Sheet content */}
                <AgentDetailContent
                  agent={selectedAgent}
                  tasks={tasks ?? []}
                  assignedTask={assignedTasks[selectedAgent.id]}
                  onClose={() => setSelectedId(null)}
                  onAssign={() => setShowAssignModal(true)}
                  onCreateTask={() => setShowCreateTask(true)}
                  onDelete={() => handleDeleteAgent(selectedAgent.id)}
                  mono={mono}
                  isMobile={true}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Assign Task Modal (local state) */}
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

      {/* Add Agent Modal */}
      {showAddAgent && firstStationId && (
        <AddAgentModal
          stationId={firstStationId}
          rooms={(stationRooms as Array<{ id: number; name: string; type: string }>) ?? []}
          onClose={() => setShowAddAgent(false)}
        />
      )}

      {/* Create Task Modal */}
      {showCreateTask && selectedAgent && (
        <CreateTaskModal
          agentId={selectedAgent.id}
          agentName={selectedAgent.name}
          agentRole={selectedAgent.role}
          onClose={() => setShowCreateTask(false)}
        />
      )}
    </div>
  );
}
