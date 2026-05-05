import { useState, useRef, useEffect } from "react";
import {
  useListStations, useListRooms, useListStationAgents,
  useGetDashboardSummary, useGetRecentActivity, useListAgentTasks,
} from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { ChevronDown, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StationCanvas } from "@/components/StationCanvas";
import { AgentAvatar, RoleBadge, LevelBadge } from "@/components/PixelSprite";
import type { AgentData as PhaserAgent } from "@/lib/stationScene";

const ROLE_HEX: Record<string, string> = {
  research: "#4df0d8", strategy: "#9b6dff", builder: "#4d7fff",
  design: "#ff4d9b", growth: "#4dff9b", analytics: "#ff4d6d", content: "#ffb84d",
};
function getRoleHex(role: string) { return ROLE_HEX[role?.toLowerCase()] ?? "#4d7fff"; }

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function formatTime(ts: string): string {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return "--:--";
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch { return "--:--"; }
}

export default function Dashboard() {
  const { data: stations } = useListStations();
  const [activeStationId, setActiveStationId] = useState<number | null>(null);
  const currentStationId = activeStationId ?? (stations?.[0]?.id ?? null);
  const currentStation = stations?.find(s => s.id === currentStationId);

  const { data: rooms } = useListRooms(currentStationId ?? 0, { query: { enabled: !!currentStationId } });
  const { data: agents } = useListStationAgents(currentStationId ?? 0, { query: { enabled: !!currentStationId } });
  const { data: activity } = useGetRecentActivity({ limit: 24 });
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

  const mono = { fontFamily: "'Space Mono', monospace" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Station Selector Strip */}
      <div style={{
        height: 34, flexShrink: 0,
        borderBottom: "1px solid var(--ae-border)",
        background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", padding: "0 16px", gap: 12, position: "relative",
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ae-green)", boxShadow: "0 0 6px var(--ae-green)", animation: "pulse-dot 2s ease-in-out infinite", flexShrink: 0 }} />
        <span style={{ ...mono, fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.06em" }}>
          {currentStation?.name ?? "NO ACTIVE STATION"}
        </span>
        {stations && stations.length > 1 && (
          <button onClick={() => setShowStationDropdown(v => !v)} style={{ ...mono, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", display: "flex", alignItems: "center", gap: 4, fontSize: 9 }}>
            <ChevronDown size={11} /> SWITCH
          </button>
        )}
        {/* Station type badge */}
        {currentStation && (
          <span style={{ ...mono, fontSize: 7, padding: "1px 6px", border: "1px solid var(--ae-cyan)55", color: "var(--ae-cyan)", letterSpacing: "0.1em", marginLeft: 4 }}>
            ONLINE
          </span>
        )}
        {showStationDropdown && (
          <div style={{ position: "absolute", top: "100%", left: 16, zIndex: 50, background: "var(--ae-surface-2)", border: "1px solid var(--ae-border-bright)", minWidth: 200 }}>
            {stations?.map(s => (
              <button key={s.id} onClick={() => { setActiveStationId(s.id); setShowStationDropdown(false); }}
                style={{
                  ...mono, display: "block", width: "100%", textAlign: "left", padding: "7px 12px",
                  background: s.id === currentStationId ? "var(--ae-cyan-dim)" : "none",
                  border: "none", borderBottom: "1px solid var(--ae-border)",
                  color: s.id === currentStationId ? "var(--ae-cyan)" : "var(--ae-text)",
                  cursor: "pointer", fontSize: 11,
                }}
              >{s.name}</button>
            ))}
          </div>
        )}
      </div>

      {/* 3-Column Body */}
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        {/* LEFT: ACTIVITY LOG */}
        <div style={{ width: 205, flexShrink: 0, borderRight: "1px solid var(--ae-border)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.15)" }}>
          <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--ae-border)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ae-red)", boxShadow: "0 0 6px var(--ae-red)", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
            <span style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.14em" }}>ACTIVITY LOG</span>
            <span style={{ ...mono, fontSize: 7, color: "var(--ae-red)", marginLeft: "auto", letterSpacing: "0.1em" }}>● LIVE</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {activity?.map(item => (
              <div key={item.id} style={{
                display: "flex", gap: 8, padding: "6px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(77,240,216,0.03)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: getRoleHex(item.agentRole),
                  boxShadow: `0 0 5px ${getRoleHex(item.agentRole)}`,
                  flexShrink: 0, marginTop: 4,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
                    <span style={{ ...mono, fontSize: 9, fontWeight: 700, color: getRoleHex(item.agentRole) }}>{item.agentName}</span>
                    <span style={{ ...mono, fontSize: 7, color: "var(--ae-dim)", flexShrink: 0 }}>{formatTime(item.timestamp)}</span>
                  </div>
                  <div style={{ ...mono, fontSize: 9, color: "var(--ae-muted)", lineHeight: 1.4, marginTop: 1 }}>{item.action}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Message input at bottom */}
          <div style={{ padding: "8px 10px", borderTop: "1px solid var(--ae-border)", display: "flex", gap: 6 }}>
            <input
              placeholder="Message of comm..."
              style={{
                flex: 1, background: "var(--ae-bg)", border: "1px solid var(--ae-border)",
                padding: "4px 8px", ...mono, fontSize: 9, color: "var(--ae-text)", outline: "none",
              }}
              onFocus={e => (e.target.style.borderColor = "var(--ae-cyan)")}
              onBlur={e => (e.target.style.borderColor = "var(--ae-border)")}
            />
            <button className="pixel-btn primary" style={{ fontSize: 8, padding: "3px 8px" }}>↑</button>
          </div>
        </div>

        {/* CENTER: PHASER STATION */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", position: "relative" }}>
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <StationCanvas onAgentSelect={handlePhaserAgentSelect} triggerRef={triggerRef} />
          </div>
        </div>

        {/* RIGHT: DETAIL PANEL */}
        <div style={{ width: 265, flexShrink: 0, borderLeft: "1px solid var(--ae-border)", background: "rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" }}>
          <AnimatePresence mode="wait">
            {selectedAgent ? (
              <motion.div key="agent" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                style={{ flex: 1, padding: 14, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}
              >
                <button onClick={() => setSelectedAgentId(null)} style={{ ...mono, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", fontSize: 8, textAlign: "left", letterSpacing: "0.08em" }}>
                  ← BACK
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <AgentAvatar role={selectedAgent.role} size={52} />
                  <div>
                    <div style={{ ...mono, fontWeight: 700, fontSize: 12, color: "var(--ae-text)" }}>{selectedAgent.name}</div>
                    <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
                      <RoleBadge role={selectedAgent.role} size="xs" />
                      <LevelBadge level={selectedAgent.level} />
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginBottom: 5, letterSpacing: "0.1em" }}>EXPERIENCE</div>
                  <div style={{ height: 6, background: "var(--ae-border)" }}>
                    <div style={{ height: "100%", width: `${selectedAgent.experience % 100}%`, background: "var(--ae-green)", boxShadow: "0 0 6px var(--ae-green)", transition: "width 1s" }} />
                  </div>
                </div>
                {selectedAgent.currentTask && (
                  <div>
                    <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginBottom: 6, letterSpacing: "0.1em" }}>CURRENT TASK</div>
                    <div style={{ ...mono, fontSize: 10, color: "var(--ae-text)", background: "rgba(0,0,0,0.3)", border: "1px solid var(--ae-border)", padding: "7px 10px", lineHeight: 1.5 }}>
                      {selectedAgent.currentTask}
                    </div>
                  </div>
                )}
                {agentTasks && agentTasks.length > 0 && (
                  <div>
                    <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginBottom: 6, letterSpacing: "0.1em" }}>TASKS ({agentTasks.length})</div>
                    {agentTasks.slice(0, 3).map(t => (
                      <div key={t.id} style={{ ...mono, fontSize: 9, color: "var(--ae-muted)", padding: "4px 0", borderBottom: "1px solid var(--ae-border)" }}>
                        → {t.title}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                  <button className="pixel-btn primary" style={{ flex: 1, fontSize: 8 }} onClick={() => triggerRef.current?.(`a${selectedAgent.id}`)}>UPGRADE</button>
                  <button className="pixel-btn" style={{ flex: 1, fontSize: 8 }}>ASSIGN</button>
                </div>
              </motion.div>
            ) : selectedRoom ? (
              <motion.div key="room" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                style={{ flex: 1, padding: 14, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}
              >
                <button onClick={() => setSelectedRoomId(null)} style={{ ...mono, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", fontSize: 8, textAlign: "left" }}>← CLOSE</button>
                <div>
                  <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: "var(--ae-text)", letterSpacing: "0.04em", lineHeight: 1.6 }}>
                    {selectedRoom.name?.toUpperCase()}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <span style={{ ...mono, fontSize: 8, padding: "2px 7px", border: "1px solid var(--ae-border)", color: "var(--ae-muted)", letterSpacing: "0.08em" }}>{selectedRoom.type?.toUpperCase()}</span>
                    <span style={{ ...mono, fontSize: 8, padding: "2px 7px", border: `1px solid ${selectedRoom.status === "active" ? "var(--ae-cyan)55" : "var(--ae-border)"}`, color: selectedRoom.status === "active" ? "var(--ae-cyan)" : "var(--ae-muted)", letterSpacing: "0.08em" }}>{selectedRoom.status?.toUpperCase()}</span>
                  </div>
                </div>
                <div>
                  <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginBottom: 8, letterSpacing: "0.1em" }}>CREW ({roomAgents?.length ?? 0})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {roomAgents?.map(a => (
                      <button key={a.id} onClick={() => setSelectedAgentId(a.id)} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                        background: "rgba(0,0,0,0.3)", border: "1px solid var(--ae-border)",
                        cursor: "pointer", textAlign: "left", transition: "border-color 0.15s",
                      }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--ae-border-bright)")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--ae-border)")}
                      >
                        <AgentAvatar role={a.role} size={32} />
                        <div>
                          <div style={{ ...mono, fontWeight: 700, fontSize: 10, color: "var(--ae-text)" }}>{a.name}</div>
                          <div style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.06em" }}>{a.role?.toUpperCase()}</div>
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
              <motion.div key="overview" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                style={{ flex: 1, padding: 14, display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div>
                  <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: "var(--ae-text)", letterSpacing: "0.04em", lineHeight: 1.6 }}>STATION OVERVIEW</div>
                  <div style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", marginTop: 4, letterSpacing: "0.08em" }}>SELECT A ROOM OR AGENT</div>
                </div>
                {currentStation && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { label: "STATUS",  value: currentStation.status?.toUpperCase(),            color: currentStation.status === "running" ? "var(--ae-green)" : "var(--ae-amber)" },
                      { label: "AGENTS",  value: `${currentStation.activeAgents}/${currentStation.agentCount}`, color: "var(--ae-cyan)" },
                      { label: "TASKS",   value: String(currentStation.tasksCompleted),           color: "var(--ae-blue)" },
                      { label: "ROOMS",   value: String(currentStation.roomCount),                color: "var(--ae-text)" },
                    ].map(stat => (
                      <div key={stat.label} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--ae-border)", padding: "9px 11px" }}>
                        <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>{stat.label}</div>
                        <div style={{ ...mono, fontSize: 13, fontWeight: 700, color: stat.color, marginTop: 4 }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                )}
                {currentStation && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 5 }}>
                      <span>STATION PROGRESS</span>
                      <span style={{ color: "var(--ae-cyan)" }}>{currentStation.progress}%</span>
                    </div>
                    <div style={{ height: 8, background: "var(--ae-border)" }}>
                      <div style={{ height: "100%", width: `${currentStation.progress}%`, background: "var(--ae-cyan)", boxShadow: "0 0 6px rgba(77,240,216,0.5)", transition: "width 1s" }} />
                    </div>
                  </div>
                )}

                {/* Agents quick list */}
                {agents && agents.length > 0 && (
                  <div>
                    <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 8 }}>CREW STATUS</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {agents.slice(0, 6).map(a => (
                        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: getRoleHex(a.role), boxShadow: `0 0 5px ${getRoleHex(a.role)}`, flexShrink: 0 }} />
                          <span style={{ ...mono, fontSize: 9, color: "var(--ae-text)", flex: 1 }}>{a.name}</span>
                          <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)" }}>{a.status?.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "auto", display: "grid", gap: 6 }}>
                  {[
                    { label: "PLATFORM AGENTS",   value: `${summary?.activeAgents ?? 0}/${summary?.totalAgents ?? 0}`,  color: "var(--ae-cyan)" },
                    { label: "TASKS TODAY",        value: String(summary?.tasksCompletedToday ?? 0),                     color: "var(--ae-blue)" },
                    { label: "ACTIVE STATIONS",    value: String(summary?.activeStations ?? 0),                         color: "var(--ae-green)" },
                  ].map(s => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--ae-border)", paddingBottom: 5 }}>
                      <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.08em" }}>{s.label}</span>
                      <span style={{ ...mono, fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
