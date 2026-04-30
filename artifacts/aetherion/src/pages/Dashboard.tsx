import { useState, useRef } from "react";
import {
  useListStations,
  useListRooms,
  useListStationAgents,
  useGetDashboardSummary,
  useGetRecentActivity,
  useListAgentTasks,
} from "@workspace/api-client-react";
import { ROLE_COLORS, AGENT_STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Pause, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StationCanvas } from "@/components/StationCanvas";
import type { AgentData as PhaserAgent } from "@/lib/stationScene";

const ROLE_HEX: Record<string, string> = {
  research: "#4df0d8",
  strategy: "#9b6dff",
  builder:  "#4d7fff",
  design:   "#9b6dff",
  growth:   "#4dff9b",
  analytics: "#ff4d6d",
  content:  "#ffb84d",
};

function getRoleHex(role: string): string {
  return ROLE_HEX[role?.toLowerCase()] ?? "#4d7fff";
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function Dashboard() {
  const { data: stations } = useListStations();
  const [activeStationId, setActiveStationId] = useState<number | null>(null);
  const currentStationId = activeStationId ?? (stations?.[0]?.id ?? null);
  const currentStation = stations?.find(s => s.id === currentStationId);

  const { data: rooms } = useListRooms(currentStationId ?? 0, { query: { enabled: !!currentStationId } });
  const { data: agents } = useListStationAgents(currentStationId ?? 0, { query: { enabled: !!currentStationId } });
  const { data: activity } = useGetRecentActivity({ limit: 20 });
  const { data: summary } = useGetDashboardSummary();

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [showStationDropdown, setShowStationDropdown] = useState(false);

  const { data: agentTasks } = useListAgentTasks(selectedAgentId ?? 0, { query: { enabled: !!selectedAgentId } });

  const selectedRoom = rooms?.find(r => r.id === selectedRoomId);
  const selectedAgent = agents?.find(a => a.id === selectedAgentId);
  const roomAgents = agents?.filter(a => a.roomId === selectedRoomId);

  const triggerRef = useRef<((id: string) => number) | null>(null);
  const [, setPhaserAgent] = useState<PhaserAgent | null>(null);

  const handlePhaserAgentSelect = (agent: PhaserAgent | null) => {
    setPhaserAgent(agent);
  };

  const surfaceStyle = {
    background: "var(--ae-surface)",
    border: "1px solid var(--ae-border)",
  };

  const monoStyle = { fontFamily: "'Space Mono', monospace" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Station Selector Strip */}
      <div style={{
        height: 36,
        flexShrink: 0,
        borderBottom: "1px solid var(--ae-border)",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 12,
        position: "relative",
      }}>
        <span className="status-dot running" />
        <span style={{ ...monoStyle, fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.06em" }}>
          {currentStation?.name ?? "NO ACTIVE STATION"}
        </span>
        {stations && stations.length > 1 && (
          <button
            onClick={() => setShowStationDropdown(v => !v)}
            style={{ ...monoStyle, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", display: "flex", alignItems: "center", gap: 4, fontSize: 10 }}
          >
            <ChevronDown size={12} /> SWITCH
          </button>
        )}
        {showStationDropdown && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 16,
            zIndex: 50,
            background: "var(--ae-surface-2)",
            border: "1px solid var(--ae-border-bright)",
            minWidth: 180,
          }}>
            {stations?.map(s => (
              <button
                key={s.id}
                onClick={() => { setActiveStationId(s.id); setShowStationDropdown(false); }}
                style={{
                  ...monoStyle,
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  background: s.id === currentStationId ? "var(--ae-cyan-dim)" : "none",
                  border: "none",
                  borderBottom: "1px solid var(--ae-border)",
                  color: s.id === currentStationId ? "var(--ae-cyan)" : "var(--ae-text)",
                  cursor: "pointer",
                  fontSize: 11,
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3-Column Body */}
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>

        {/* LEFT: ACTIVITY LOG */}
        <div style={{ width: 210, flexShrink: 0, borderRight: "1px solid var(--ae-border)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.15)" }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--ae-border)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ae-red)", boxShadow: "0 0 6px var(--ae-red)", animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span style={{ ...monoStyle, fontSize: 9, color: "var(--ae-muted)", letterSpacing: "0.14em" }}>ACTIVITY LOG</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
            {activity?.map(item => (
              <div key={item.id} style={{
                display: "flex",
                gap: 8,
                padding: "6px 8px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{
                  width: 6, height: 6,
                  borderRadius: "50%",
                  background: getRoleHex(item.agentRole),
                  boxShadow: `0 0 5px ${getRoleHex(item.agentRole)}`,
                  flexShrink: 0,
                  marginTop: 4,
                }} />
                <div>
                  <div style={{ ...monoStyle, fontSize: 10, fontWeight: 700, color: "var(--ae-text)" }}>{item.agentName}</div>
                  <div style={{ ...monoStyle, fontSize: 9, color: "var(--ae-muted)", lineHeight: 1.4, marginTop: 1 }}>{item.action}</div>
                  <div style={{ ...monoStyle, fontSize: 8, color: "var(--ae-dim)", marginTop: 2 }}>{timeAgo(item.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: PHASER STATION */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--ae-border)", display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.06em" }}>SPACE STATION</span>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "var(--ae-cyan)", letterSpacing: "0.06em" }}>{currentStation?.name ?? ""}</span>
          </div>
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <StationCanvas onAgentSelect={handlePhaserAgentSelect} triggerRef={triggerRef} />
          </div>
        </div>

        {/* RIGHT: DETAIL PANEL */}
        <div style={{ width: 270, flexShrink: 0, borderLeft: "1px solid var(--ae-border)", background: "rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" }}>
          <AnimatePresence mode="wait">
            {selectedAgent ? (
              <motion.div
                key="agent"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}
              >
                <button
                  onClick={() => setSelectedAgentId(null)}
                  style={{ ...monoStyle, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", fontSize: 9, textAlign: "left", letterSpacing: "0.08em" }}
                >
                  ← BACK
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: getRoleHex(selectedAgent.role) + "22",
                    border: `1.5px solid ${getRoleHex(selectedAgent.role)}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 14,
                    color: getRoleHex(selectedAgent.role),
                  }}>
                    {selectedAgent.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ ...monoStyle, fontWeight: 700, fontSize: 13, color: "var(--ae-text)" }}>{selectedAgent.name}</div>
                    <div style={{ ...monoStyle, fontSize: 9, color: "var(--ae-muted)", marginTop: 2, letterSpacing: "0.08em" }}>
                      {selectedAgent.role?.toUpperCase()} · LVL {selectedAgent.level}
                    </div>
                  </div>
                </div>
                <div style={{
                  display: "inline-block",
                  padding: "3px 8px",
                  border: `1px solid ${getRoleHex(selectedAgent.role)}55`,
                  background: getRoleHex(selectedAgent.role) + "18",
                  ...monoStyle, fontSize: 9, color: getRoleHex(selectedAgent.role), letterSpacing: "0.08em",
                }}>
                  {selectedAgent.status?.toUpperCase()}
                </div>
                <div>
                  <div style={{ ...monoStyle, fontSize: 8, color: "var(--ae-muted)", marginBottom: 4, letterSpacing: "0.1em" }}>EXPERIENCE</div>
                  <div className="pixel-progress">
                    <div className="pixel-progress-fill" style={{ width: `${selectedAgent.experience % 100}%`, background: "var(--ae-green)" }} />
                  </div>
                </div>
                {selectedAgent.currentTask && (
                  <div>
                    <div style={{ ...monoStyle, fontSize: 8, color: "var(--ae-muted)", marginBottom: 6, letterSpacing: "0.1em" }}>CURRENT TASK</div>
                    <div style={{
                      ...monoStyle, fontSize: 10, color: "var(--ae-text)",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid var(--ae-border)",
                      padding: "8px 10px", lineHeight: 1.5,
                    }}>
                      {selectedAgent.currentTask}
                    </div>
                  </div>
                )}
                {agentTasks && agentTasks.length > 0 && (
                  <div>
                    <div style={{ ...monoStyle, fontSize: 8, color: "var(--ae-muted)", marginBottom: 6, letterSpacing: "0.1em" }}>TASKS ({agentTasks.length})</div>
                    {agentTasks.slice(0, 3).map(t => (
                      <div key={t.id} style={{ ...monoStyle, fontSize: 9, color: "var(--ae-muted)", padding: "4px 0", borderBottom: "1px solid var(--ae-border)" }}>
                        {t.title}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                  <button
                    className="pixel-btn primary"
                    style={{ flex: 1 }}
                    onClick={() => triggerRef.current?.(`a${selectedAgent.id}`)}
                  >
                    UPGRADE
                  </button>
                  <button className="pixel-btn" style={{ flex: 1 }}>ASSIGN</button>
                </div>
              </motion.div>
            ) : selectedRoom ? (
              <motion.div
                key="room"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}
              >
                <button
                  onClick={() => setSelectedRoomId(null)}
                  style={{ ...monoStyle, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", fontSize: 9, textAlign: "left", letterSpacing: "0.08em" }}
                >
                  ← CLOSE
                </button>
                <div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "var(--ae-text)", letterSpacing: "0.04em", lineHeight: 1.6 }}>
                    {selectedRoom.name?.toUpperCase()}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <span style={{ ...monoStyle, fontSize: 9, padding: "2px 8px", border: "1px solid var(--ae-border)", color: "var(--ae-muted)", letterSpacing: "0.08em" }}>
                      {selectedRoom.type?.toUpperCase()}
                    </span>
                    <span style={{ ...monoStyle, fontSize: 9, padding: "2px 8px", border: `1px solid ${selectedRoom.status === "active" ? "var(--ae-cyan)" : "var(--ae-border)"}55`, color: selectedRoom.status === "active" ? "var(--ae-cyan)" : "var(--ae-muted)", letterSpacing: "0.08em" }}>
                      {selectedRoom.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ ...monoStyle, fontSize: 8, color: "var(--ae-muted)", marginBottom: 8, letterSpacing: "0.1em" }}>CREW ({roomAgents?.length ?? 0})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {roomAgents?.map(a => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAgentId(a.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 10px", background: "rgba(0,0,0,0.3)",
                          border: "1px solid var(--ae-border)",
                          cursor: "pointer", textAlign: "left", transition: "border-color 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--ae-border-bright)")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--ae-border)")}
                      >
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: getRoleHex(a.role),
                          boxShadow: `0 0 5px ${getRoleHex(a.role)}`,
                          flexShrink: 0,
                        }} />
                        <div>
                          <div style={{ ...monoStyle, fontWeight: 700, fontSize: 11, color: "var(--ae-text)" }}>{a.name}</div>
                          <div style={{ ...monoStyle, fontSize: 9, color: "var(--ae-muted)", letterSpacing: "0.06em" }}>{a.role?.toUpperCase()}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: "auto" }}>
                  <button className="pixel-btn warning" style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
                    <Pause size={10} /> PAUSE ROOM
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "var(--ae-text)", letterSpacing: "0.04em", lineHeight: 1.6 }}>
                    STATION OVERVIEW
                  </div>
                  <div style={{ ...monoStyle, fontSize: 9, color: "var(--ae-muted)", marginTop: 4, letterSpacing: "0.08em" }}>
                    SELECT A ROOM FOR DETAILS
                  </div>
                </div>
                {currentStation && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { label: "STATUS", value: currentStation.status?.toUpperCase(), color: currentStation.status === "running" ? "var(--ae-green)" : "var(--ae-amber)" },
                      { label: "AGENTS", value: `${currentStation.activeAgents} / ${currentStation.agentCount}`, color: "var(--ae-cyan)" },
                      { label: "TASKS",  value: String(currentStation.tasksCompleted), color: "var(--ae-blue)" },
                      { label: "ROOMS",  value: String(currentStation.roomCount), color: "var(--ae-text)" },
                    ].map(stat => (
                      <div key={stat.label} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--ae-border)", padding: "10px 12px" }}>
                        <div style={{ ...monoStyle, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>{stat.label}</div>
                        <div style={{ ...monoStyle, fontSize: 13, fontWeight: 700, color: stat.color, marginTop: 4 }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                )}
                {currentStation && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", ...monoStyle, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>
                      <span>STATION PROGRESS</span>
                      <span style={{ color: "var(--ae-cyan)" }}>{currentStation.progress}%</span>
                    </div>
                    <div className="pixel-progress">
                      <div className="pixel-progress-fill" style={{ width: `${currentStation.progress}%`, background: "var(--ae-cyan)" }} />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BOTTOM: SHIP COMMS + STATS */}
      <div style={{ height: 155, flexShrink: 0, borderTop: "1px solid var(--ae-border)", background: "rgba(0,0,0,0.4)", display: "flex" }}>
        {/* Ship Comms */}
        <div style={{ flex: 2, borderRight: "1px solid var(--ae-border)", padding: "10px 12px", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ae-red)", boxShadow: "0 0 6px var(--ae-red)", animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span style={{ ...monoStyle, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.14em" }}>SHIP COMMS [BROADCAST ONLY]</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {activity?.slice(0, 6).map(item => (
              <div key={item.id} className="comms-message">
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: getRoleHex(item.agentRole),
                  flexShrink: 0, marginTop: 3,
                }} />
                <span style={{ ...monoStyle, fontSize: 10, color: "var(--ae-cyan)", flexShrink: 0, minWidth: 70 }}>[{item.agentName}]</span>
                <span style={{ ...monoStyle, fontSize: 10, color: "var(--ae-text)", opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.action}: {item.details}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Stats */}
        <div style={{ flex: 1, padding: "12px 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
          {[
            { label: "STATIONS RUNNING", value: summary?.activeStations ?? 0, color: "var(--ae-text)" },
            { label: "AGENTS ACTIVE",    value: summary?.activeAgents ?? 0,    color: "var(--ae-cyan)" },
            { label: "TASKS TODAY",      value: summary?.tasksCompletedToday ?? 0, color: "var(--ae-blue)" },
          ].map(stat => (
            <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid var(--ae-border)", paddingBottom: 6 }}>
              <span style={{ ...monoStyle, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>{stat.label}</span>
              <span style={{ ...monoStyle, fontSize: 16, fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
