import { useParams, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Activity, ChevronRight, Package } from "lucide-react";
import { PixelSprite } from "@/components/PixelSprite";
import { motion } from "framer-motion";
import { AgentOutputCard, type AgentOutputData } from "@/components/AgentOutputCard";

const ROLE_HEX: Record<string, string> = {
  research: "#4df0d8",
  strategy: "#9b6dff",
  builder:  "#4d7fff",
  content:  "#ffb84d",
  growth:   "#4dff9b",
  analytics:"#ff4d6d",
};

const ACTION_COLOR: Record<string, string> = {
  "TASK COMPLETE": "#4dff9b",
  "TASK_COMPLETE": "#4dff9b",
  "LEVEL UP":      "#ffb84d",
  "LEVEL_UP":      "#ffb84d",
  "TASK START":    "#4df0d8",
  "TASK_START":    "#4df0d8",
};

function formatTime(ts: string) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}

type Room     = { id: number; name: string; type: string; status: string; agentCount: number; tasksCompleted: number; stationId: number };
type Agent    = { id: number; name: string; role: string; status: string; level: number; experience: number; tasksCompleted: number; currentTask: string | null };
type Task     = { id: number; agentId: number; title: string; progress: number; status: string };
type Activity = { id: number; agentName: string; agentRole: string; action: string; details: string; timestamp: string };

const mono: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const pixel: React.CSSProperties = { fontFamily: "'Press Start 2P', monospace" };

type TabId = "activity" | "outputs";

export default function RoomDetail() {
  const { id: idStr } = useParams<{ id: string }>();
  const roomId = Number(idStr);
  const [, setLocation] = useLocation();
  const logRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<TabId>("activity");

  const refetchOpts = { enabled: !!roomId, refetchInterval: 8000 };

  const { data: room } = useQuery<Room>({
    queryKey: ["/api/rooms", roomId],
    queryFn: () => fetch(`/api/rooms/${roomId}`).then(r => r.json()),
    ...refetchOpts,
  });

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/rooms", roomId, "agents"],
    queryFn: () => fetch(`/api/rooms/${roomId}/agents`).then(r => r.json()),
    ...refetchOpts,
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/rooms", roomId, "tasks"],
    queryFn: () => fetch(`/api/rooms/${roomId}/tasks`).then(r => r.json()),
    ...refetchOpts,
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/rooms", roomId, "activity"],
    queryFn: () => fetch(`/api/rooms/${roomId}/activity`).then(r => r.json()),
    ...refetchOpts,
  });

  const { data: outputs = [] } = useQuery<AgentOutputData[]>({
    queryKey: ["/api/rooms", roomId, "outputs"],
    queryFn: () => fetch(`/api/rooms/${roomId}/outputs`).then(r => r.json()),
    ...refetchOpts,
  });

  useEffect(() => {
    if (tab === "activity" && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [activities.length, tab]);

  if (!room) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", ...mono, fontSize: 10, color: "var(--ae-muted)", letterSpacing: "0.12em" }}>
        LOADING ROOM DATA...
      </div>
    );
  }

  const isActive = room.status === "active" || room.status === "busy";
  const statusColor = isActive ? "var(--ae-green)" : "var(--ae-muted)";
  const workingCount = agents.filter(a => a.status === "working").length;

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14, background: "var(--ae-bg)" }}>

      {/* ── HEADER ── */}
      <div>
        <button
          onClick={() => setLocation("/app")}
          style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", ...mono, fontSize: 8, letterSpacing: "0.1em", padding: 0, marginBottom: 10 }}
        >
          <ArrowLeft size={9} /> BACK TO STATION
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ ...pixel, fontSize: 10, color: "#fff", letterSpacing: "0.04em" }}>{room.name.toUpperCase()}</span>
            <span style={{ ...mono, fontSize: 7, color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}40`, padding: "2px 7px", letterSpacing: "0.1em" }}>
              {isActive ? "● ACTIVE" : room.status.toUpperCase()}
            </span>
          </div>
          <span style={{ ...mono, fontSize: 7, color: "var(--ae-dim)" }}>ROOM_ID:{String(room.id).padStart(4, "0")}</span>
        </div>

        <div style={{ display: "flex", gap: 20, borderTop: "1px solid var(--ae-border)", marginTop: 10, paddingTop: 10 }}>
          {[
            { label: "CREW",       value: agents.length },
            { label: "WORKING",    value: workingCount },
            { label: "TASKS_DONE", value: room.tasksCompleted },
            { label: "OUTPUTS",    value: outputs.length },
            { label: "TYPE",       value: room.type.toUpperCase() },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>{s.label}</span>
              <span style={{ ...mono, fontSize: 12, color: "var(--ae-text)", fontWeight: 700 }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CREW CARDS ── */}
      <div>
        <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", borderBottom: "1px solid var(--ae-border)", paddingBottom: 6, marginBottom: 10 }}>
          ACTIVE_CREW://
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {agents.map(agent => {
            const activeTask = tasks.find(t => t.agentId === agent.id);
            const rc = ROLE_HEX[agent.role] ?? "#fff";
            const xpPct = agent.experience % 100;
            const isWorking = agent.status === "working";

            return (
              <div key={agent.id} style={{
                background: "var(--ae-surface)",
                border: `1px solid ${isWorking ? rc + "50" : "var(--ae-border)"}`,
                padding: "10px 12px",
                display: "flex", flexDirection: "column", gap: 8,
                boxShadow: isWorking ? `0 0 16px ${rc}14` : "none",
                transition: "box-shadow 0.5s ease",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <PixelSprite role={agent.role as "research" | "strategy" | "builder" | "content" | "growth" | "analytics"} size={1} />
                    <div>
                      <div style={{ ...pixel, fontSize: 7, color: rc, letterSpacing: "0.06em" }}>{agent.name}</div>
                      <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", letterSpacing: "0.1em", marginTop: 3 }}>
                        {agent.role.toUpperCase()} — LVL {agent.level} — {agent.tasksCompleted} TASKS
                      </div>
                    </div>
                  </div>
                  <div style={{
                    ...mono, fontSize: 7, letterSpacing: "0.1em", padding: "2px 7px", flexShrink: 0,
                    color: isWorking ? "var(--ae-green)" : "var(--ae-muted)",
                    background: isWorking ? "rgba(77,255,155,0.08)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isWorking ? "rgba(77,255,155,0.3)" : "var(--ae-border)"}`,
                  }}>
                    {isWorking ? "● WORKING" : agent.status.toUpperCase()}
                  </div>
                </div>

                {activeTask ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <ChevronRight size={8} color={rc} style={{ flexShrink: 0 }} />
                      <span style={{ ...mono, fontSize: 8, color: "var(--ae-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeTask.title}</span>
                    </div>
                    <div style={{ height: 5, background: "var(--ae-bg)", border: "1px solid var(--ae-border)", overflow: "hidden" }}>
                      <motion.div
                        style={{ height: "100%", background: rc, boxShadow: `0 0 6px ${rc}80` }}
                        animate={{ width: `${activeTask.progress}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <span style={{ ...mono, fontSize: 7, color: rc }}>{activeTask.progress}%</span>
                    </div>
                  </div>
                ) : isWorking ? (
                  <div style={{ ...mono, fontSize: 8, color: "var(--ae-dim)" }}>▶ INITIALIZING TASK...</div>
                ) : (
                  <div style={{ ...mono, fontSize: 8, color: "var(--ae-dim)" }}>— AWAITING ASSIGNMENT —</div>
                )}

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>XP</span>
                    <span style={{ ...mono, fontSize: 6, color: "var(--ae-muted)" }}>{xpPct} / 100</span>
                  </div>
                  <div style={{ height: 3, background: "var(--ae-bg)", border: "1px solid var(--ae-border)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${xpPct}%`, background: "var(--ae-violet)", boxShadow: "0 0 4px var(--ae-violet)", transition: "width 1.2s ease" }} />
                  </div>
                </div>
              </div>
            );
          })}

          {agents.length === 0 && (
            <div style={{ ...mono, fontSize: 8, color: "var(--ae-dim)", padding: "14px", textAlign: "center", border: "1px dashed var(--ae-border)" }}>
              NO CREW ASSIGNED TO THIS ROOM
            </div>
          )}
        </div>
      </div>

      {/* ── LOG / OUTPUTS TAB SWITCHER ── */}
      <div style={{ display: "flex", flexDirection: "column", border: "1px solid var(--ae-border)", flex: 1, minHeight: 200 }}>
        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--ae-border)" }}>
          {([
            { id: "activity" as TabId, label: "ACTIVITY_LOG", icon: <Activity size={9} />, color: "var(--ae-cyan)" },
            { id: "outputs"  as TabId, label: `OUTPUTS (${outputs.length})`, icon: <Package size={9} />, color: "#ffb84d" },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "7px 10px", cursor: "pointer", border: "none",
                background: tab === t.id ? "rgba(255,255,255,0.03)" : "transparent",
                borderBottom: tab === t.id ? `2px solid ${t.color}` : "2px solid transparent",
                color: tab === t.id ? t.color : "var(--ae-muted)",
                ...mono, fontSize: 7, letterSpacing: "0.1em",
                transition: "all 0.15s",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ACTIVITY tab */}
        {tab === "activity" && (
          <div
            ref={logRef}
            style={{ flex: 1, overflowY: "auto", padding: "8px 12px", background: "rgba(0,0,0,0.45)", maxHeight: 300 }}
          >
            {activities.length === 0 ? (
              <div style={{ ...mono, fontSize: 8, color: "var(--ae-dim)", padding: "6px 0", letterSpacing: "0.06em" }}>
                &gt; AWAITING ACTIVITY...
              </div>
            ) : (
              [...activities].reverse().map(entry => {
                const ac = ACTION_COLOR[entry.action] ?? "var(--ae-text)";
                const agentColor = ROLE_HEX[entry.agentRole] ?? "#fff";
                return (
                  <div key={entry.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", ...mono, fontSize: 8, lineHeight: 1.65, marginBottom: 2 }}>
                    <span style={{ color: "var(--ae-dim)", flexShrink: 0 }}>{formatTime(entry.timestamp)}</span>
                    <span style={{ color: ac, flexShrink: 0 }}>[{entry.action}]</span>
                    <span style={{ color: agentColor, flexShrink: 0 }}>{entry.agentName}:</span>
                    <span style={{ color: "var(--ae-muted)", wordBreak: "break-word" }}>{entry.details}</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* OUTPUTS tab */}
        {tab === "outputs" && (
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 300 }}>
            {outputs.length === 0 ? (
              <div style={{ ...mono, fontSize: 8, color: "var(--ae-dim)", padding: "20px", textAlign: "center", letterSpacing: "0.08em" }}>
                &gt; NO OUTPUTS YET — AGENTS ARE WORKING...<br />
                <span style={{ fontSize: 7, marginTop: 8, display: "block", color: "var(--ae-dim)" }}>
                  Outputs are generated when tasks complete.
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {outputs.map(o => (
                  <AgentOutputCard key={o.id} output={o} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
