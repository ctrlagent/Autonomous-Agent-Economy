import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GitBranch, MessageSquare, CheckSquare, User, ChevronRight,
  X, Filter, Plus, MoreHorizontal, ArrowRight, Zap, Target,
  TrendingUp, Users, Clock, Star, Flag, ChevronDown,
} from "lucide-react";

type KanbanMission = {
  id: number;
  title: string;
  description: string;
  columnStatus: string;
  priority: string;
  labels: string[];
  commentsCount: number;
  branchName: string | null;
  progress: number;
  checklist: { id: string; text: string; done: boolean }[];
  rewardAmount: number;
  rewardToken: string;
  rewardXp: number;
  assigneeId: number | null;
  assignee: { id: number; name: string; role: string } | null;
  status: string;
  color: string;
  iconName: string;
};

const COLUMNS = [
  { id: "backlog",     label: "BACKLOG",     color: "#8090b0", accent: "rgba(128,144,176,0.15)" },
  { id: "in_progress", label: "IN PROGRESS", color: "#ffb84d", accent: "rgba(255,184,77,0.12)" },
  { id: "in_review",   label: "IN REVIEW",   color: "#9b6dff", accent: "rgba(155,109,255,0.12)" },
  { id: "done",        label: "DONE",        color: "#4dff9b", accent: "rgba(77,255,155,0.10)" },
] as const;

const PRIORITY_META: Record<string, { color: string; label: string }> = {
  critical: { color: "#ff4d6d", label: "CRITICAL" },
  high:     { color: "#ffb84d", label: "HIGH" },
  medium:   { color: "#5b8fff", label: "MEDIUM" },
  low:      { color: "#8090b0", label: "LOW" },
};

const ROLE_COLORS: Record<string, string> = {
  research: "#4df0d8",
  strategy: "#9b6dff",
  builder:  "#4d7fff",
  content:  "#ffb84d",
  growth:   "#4dff9b",
  analytics:"#ff4d6d",
};

function getIcon(name: string) {
  const map: Record<string, typeof Zap> = {
    TrendingUp, Users, Target, Zap, Clock, Star,
  };
  return map[name] ?? Target;
}

async function fetchMissions(): Promise<KanbanMission[]> {
  const res = await fetch("/api/missions");
  if (!res.ok) throw new Error("Failed to fetch missions");
  return res.json();
}

async function moveMission(id: number, column: string) {
  const res = await fetch(`/api/missions/${id}/move`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ column }),
  });
  return res.json();
}

/* ─── Priority Flag ─────────────────────────────────────────────────── */
function PriorityFlag({ priority }: { priority: string }) {
  const meta = PRIORITY_META[priority] ?? PRIORITY_META.medium;
  return (
    <span style={{
      fontFamily: "'Space Mono', monospace",
      fontSize: 7,
      color: meta.color,
      border: `1px solid ${meta.color}55`,
      background: `${meta.color}14`,
      padding: "1px 5px",
      letterSpacing: "0.06em",
    }}>
      {meta.label}
    </span>
  );
}

/* ─── Agent Avatar ─────────────────────────────────────────────────── */
function AgentAvatar({ agent }: { agent: { name: string; role: string } | null }) {
  if (!agent) return (
    <div style={{
      width: 20, height: 20,
      border: "1px dashed var(--ae-border)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <User size={9} color="var(--ae-muted)" />
    </div>
  );
  const color = ROLE_COLORS[agent.role] ?? "#5b8fff";
  const initials = agent.name.slice(0, 2).toUpperCase();
  return (
    <div title={agent.name} style={{
      width: 20, height: 20, background: `${color}22`,
      border: `1px solid ${color}66`, display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5, color, lineHeight: 1 }}>
        {initials}
      </span>
    </div>
  );
}

/* ─── Kanban Card ───────────────────────────────────────────────────── */
function KanbanCard({
  mission,
  onClick,
  isDragging = false,
}: {
  mission: KanbanMission;
  onClick: () => void;
  isDragging?: boolean;
}) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging,
  } = useSortable({ id: mission.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  };

  const checkedCount = mission.checklist.filter(i => i.done).length;
  const totalChecklist = mission.checklist.length;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        whileHover={{ scale: isDragging ? 1 : 1.005 }}
        onClick={onClick}
        style={{
          background: "var(--ae-surface)",
          border: "1px solid var(--ae-border)",
          padding: "10px 12px",
          cursor: "grab",
          position: "relative",
          overflow: "hidden",
          boxShadow: isDragging ? "0 8px 32px rgba(0,0,0,0.6)" : "none",
          marginBottom: 6,
        }}
      >
        {/* Left accent bar */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
          background: mission.color || "#5b8fff",
          boxShadow: `0 0 8px ${mission.color || "#5b8fff"}55`,
        }} />

        <div style={{ paddingLeft: 4 }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 7,
              color: "var(--ae-dim)",
              letterSpacing: "0.06em",
              flexShrink: 0,
              marginTop: 1,
            }}>
              #{mission.id}
            </span>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              color: "var(--ae-text)",
              lineHeight: 1.5,
              flex: 1,
              wordBreak: "break-word",
            }}>
              {mission.title}
            </span>
          </div>

          {/* Labels */}
          {mission.labels && (mission.labels as string[]).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 6 }}>
              {(mission.labels as string[]).map(l => (
                <span key={l} style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 6,
                  color: "#5b8fff",
                  background: "rgba(91,143,255,0.12)",
                  border: "1px solid rgba(91,143,255,0.3)",
                  padding: "1px 5px",
                  letterSpacing: "0.04em",
                }}>
                  {l}
                </span>
              ))}
            </div>
          )}

          {/* Progress bar */}
          {mission.progress > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ height: 3, background: "var(--ae-border)", overflow: "hidden", marginBottom: 3 }}>
                <div style={{
                  height: "100%",
                  width: `${mission.progress}%`,
                  background: mission.color || "#5b8fff",
                  boxShadow: `0 0 6px ${mission.color || "#5b8fff"}88`,
                  transition: "width 0.4s ease",
                }} />
              </div>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 6, color: "var(--ae-muted)" }}>
                {mission.progress}%
              </span>
            </div>
          )}

          {/* Footer row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            <PriorityFlag priority={mission.priority} />

            <div style={{ flex: 1 }} />

            {/* Branch */}
            {mission.branchName && (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <GitBranch size={8} color="var(--ae-muted)" />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-dim)", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {mission.branchName}
                </span>
              </div>
            )}

            {/* Checklist */}
            {totalChecklist > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <CheckSquare size={8} color={checkedCount === totalChecklist ? "#4dff9b" : "var(--ae-muted)"} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)" }}>
                  {checkedCount}/{totalChecklist}
                </span>
              </div>
            )}

            {/* Comments */}
            {mission.commentsCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <MessageSquare size={8} color="var(--ae-muted)" />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)" }}>
                  {mission.commentsCount}
                </span>
              </div>
            )}

            {/* Reward */}
            {mission.rewardAmount > 0 && (
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 7,
                color: "#4dff9b",
                background: "rgba(77,255,155,0.10)",
                border: "1px solid rgba(77,255,155,0.25)",
                padding: "1px 5px",
              }}>
                ${mission.rewardAmount}
              </span>
            )}

            {/* Assignee */}
            <AgentAvatar agent={mission.assignee} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Column ─────────────────────────────────────────────────────────── */
function KanbanColumn({
  column,
  missions,
  onCardClick,
}: {
  column: typeof COLUMNS[number];
  missions: KanbanMission[];
  onCardClick: (m: KanbanMission) => void;
}) {
  return (
    <div style={{
      flex: "1 1 0",
      minWidth: 220,
      display: "flex",
      flexDirection: "column",
      background: column.accent,
      border: `1px solid ${column.color}33`,
    }}>
      {/* Column header */}
      <div style={{
        padding: "10px 12px",
        borderBottom: `1px solid ${column.color}33`,
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        background: `${column.color}10`,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: column.color,
          boxShadow: `0 0 8px ${column.color}`,
        }} />
        <span style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 7,
          color: column.color,
          letterSpacing: "0.08em",
          flex: 1,
        }}>
          {column.label}
        </span>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 7,
          color: column.color,
          background: `${column.color}22`,
          border: `1px solid ${column.color}44`,
          padding: "1px 6px",
        }}>
          {missions.length}
        </span>
      </div>

      {/* Cards */}
      <div style={{ padding: "8px 8px 8px", flex: 1, overflowY: "auto", minHeight: 80 }}>
        <SortableContext
          items={missions.map(m => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            {missions.map(mission => (
              <KanbanCard
                key={mission.id}
                mission={mission}
                onClick={() => onCardClick(mission)}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
        {missions.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "24px 8px",
            fontFamily: "'Space Mono', monospace",
            fontSize: 7,
            color: "var(--ae-dim)",
            letterSpacing: "0.08em",
            borderTop: `1px dashed ${column.color}22`,
          }}>
            EMPTY
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Detail Panel ───────────────────────────────────────────────────── */
function DetailPanel({
  mission,
  onClose,
  onMove,
}: {
  mission: KanbanMission;
  onClose: () => void;
  onMove: (col: string) => void;
}) {
  const col = COLUMNS.find(c => c.id === mission.columnStatus) ?? COLUMNS[0];
  const checkedCount = mission.checklist.filter(i => i.done).length;
  const IconComp = getIcon(mission.iconName);

  return (
    <motion.div
      initial={{ x: 380, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 380, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 260 }}
      style={{
        position: "fixed",
        right: 0, top: 46, bottom: 0,
        width: 360,
        background: "var(--ae-surface)",
        borderLeft: "2px solid var(--ae-border)",
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px solid var(--ae-border)",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28,
          background: `${mission.color}22`,
          border: `1px solid ${mission.color}55`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <IconComp size={12} color={mission.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-dim)", marginBottom: 4 }}>
            MISSION #{mission.id}
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--ae-text)", lineHeight: 1.6 }}>
            {mission.title}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--ae-muted)", padding: 4, flexShrink: 0,
        }}>
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Status + Priority */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{
            flex: 1,
            background: `${col.color}12`,
            border: `1px solid ${col.color}44`,
            padding: "6px 10px",
          }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 6, color: "var(--ae-muted)", marginBottom: 4 }}>COLUMN</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: col.color }}>{col.label}</div>
          </div>
          <div style={{
            flex: 1,
            background: `${PRIORITY_META[mission.priority]?.color ?? "#5b8fff"}12`,
            border: `1px solid ${PRIORITY_META[mission.priority]?.color ?? "#5b8fff"}44`,
            padding: "6px 10px",
          }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 6, color: "var(--ae-muted)", marginBottom: 4 }}>PRIORITY</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: PRIORITY_META[mission.priority]?.color ?? "#5b8fff" }}>
              {PRIORITY_META[mission.priority]?.label ?? "MEDIUM"}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)", marginBottom: 6, letterSpacing: "0.1em" }}>
            DESCRIPTION
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 8,
            color: "var(--ae-text)",
            lineHeight: 1.8,
            background: "var(--ae-surface-2)",
            border: "1px solid var(--ae-border)",
            padding: "10px 12px",
          }}>
            {mission.description}
          </div>
        </div>

        {/* Reward */}
        <div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)", marginBottom: 6, letterSpacing: "0.1em" }}>
            BOUNTY
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{
              flex: 1, background: "rgba(77,255,155,0.08)", border: "1px solid rgba(77,255,155,0.25)",
              padding: "8px 12px",
            }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 6, color: "var(--ae-muted)", marginBottom: 3 }}>USDC</div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: "#4dff9b" }}>
                ${mission.rewardAmount}
              </div>
            </div>
            <div style={{
              flex: 1, background: "rgba(91,143,255,0.08)", border: "1px solid rgba(91,143,255,0.25)",
              padding: "8px 12px",
            }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 6, color: "var(--ae-muted)", marginBottom: 3 }}>XP REWARD</div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: "#5b8fff" }}>
                {mission.rewardXp}
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>PROGRESS</span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: mission.color || "#5b8fff" }}>{mission.progress}%</span>
          </div>
          <div style={{ height: 6, background: "var(--ae-border)", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${mission.progress}%`,
              background: mission.color || "#5b8fff",
              boxShadow: `0 0 8px ${mission.color || "#5b8fff"}88`,
              transition: "width 0.6s ease",
            }} />
          </div>
        </div>

        {/* Assignee */}
        <div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)", marginBottom: 6, letterSpacing: "0.1em" }}>
            ASSIGNED TO
          </div>
          {mission.assignee ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--ae-surface-2)", border: "1px solid var(--ae-border)" }}>
              <AgentAvatar agent={mission.assignee} />
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "var(--ae-text)" }}>{mission.assignee.name}</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 6, color: ROLE_COLORS[mission.assignee.role] ?? "var(--ae-muted)", marginTop: 2 }}>
                  {mission.assignee.role.toUpperCase()}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-dim)", padding: "8px 10px", border: "1px dashed var(--ae-border)", textAlign: "center" }}>
              UNASSIGNED
            </div>
          )}
        </div>

        {/* Branch */}
        {mission.branchName && (
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)", marginBottom: 6, letterSpacing: "0.1em" }}>
              BRANCH
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "var(--ae-surface-2)", border: "1px solid var(--ae-border)" }}>
              <GitBranch size={10} color="#9b6dff" />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "#9b6dff" }}>{mission.branchName}</span>
            </div>
          </div>
        )}

        {/* Checklist */}
        {mission.checklist.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>CHECKLIST</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)" }}>{checkedCount}/{mission.checklist.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {(mission.checklist as { id: string; text: string; done: boolean }[]).map(item => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 10px",
                  background: item.done ? "rgba(77,255,155,0.06)" : "var(--ae-surface-2)",
                  border: `1px solid ${item.done ? "rgba(77,255,155,0.25)" : "var(--ae-border)"}`,
                }}>
                  <div style={{
                    width: 10, height: 10, border: `1px solid ${item.done ? "#4dff9b" : "var(--ae-border)"}`,
                    background: item.done ? "#4dff9b" : "transparent", flexShrink: 0, display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    {item.done && <span style={{ fontSize: 7, color: "#0a0b0f", lineHeight: 1 }}>✓</span>}
                  </div>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 8,
                    color: item.done ? "var(--ae-muted)" : "var(--ae-text)",
                    textDecoration: item.done ? "line-through" : "none",
                    lineHeight: 1.5,
                  }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Move to column */}
        <div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)", marginBottom: 8, letterSpacing: "0.1em" }}>
            MOVE TO
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {COLUMNS.filter(c => c.id !== mission.columnStatus).map(c => (
              <button
                key={c.id}
                onClick={() => onMove(c.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
                  background: `${c.color}10`, border: `1px solid ${c.color}44`,
                  cursor: "pointer", transition: "all 0.15s", color: c.color,
                  fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: "0.06em",
                  textAlign: "left",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${c.color}20`;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${c.color}88`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${c.color}10`;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${c.color}44`;
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
                {c.label}
                <ArrowRight size={10} style={{ marginLeft: "auto" }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Filter Bar ─────────────────────────────────────────────────────── */
function FilterBar({
  filterPriority,
  setFilterPriority,
  filterRole,
  setFilterRole,
}: {
  filterPriority: string;
  setFilterPriority: (v: string) => void;
  filterRole: string;
  setFilterRole: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Filter size={11} color="var(--ae-muted)" />
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)" }}>FILTER:</span>

      {["all", "critical", "high", "medium", "low"].map(p => (
        <button
          key={p}
          onClick={() => setFilterPriority(p)}
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 7,
            color: filterPriority === p ? "#0a0b0f" : (PRIORITY_META[p]?.color ?? "var(--ae-muted)"),
            background: filterPriority === p ? (PRIORITY_META[p]?.color ?? "var(--ae-cyan)") : "transparent",
            border: `1px solid ${PRIORITY_META[p]?.color ?? "var(--ae-border)"}`,
            padding: "2px 8px",
            cursor: "pointer",
            transition: "all 0.15s",
            letterSpacing: "0.06em",
          }}
        >
          {p.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ─── Main Kanban Page ───────────────────────────────────────────────── */
export default function Kanban() {
  const qc = useQueryClient();
  const [activeMission, setActiveMission] = useState<KanbanMission | null>(null);
  const [selectedCard, setSelectedCard] = useState<KanbanMission | null>(null);
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ["kanban-missions"],
    queryFn: fetchMissions,
    refetchInterval: 30000,
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, column }: { id: number; column: string }) => moveMission(id, column),
    onMutate: async ({ id, column }) => {
      await qc.cancelQueries({ queryKey: ["kanban-missions"] });
      const prev = qc.getQueryData<KanbanMission[]>(["kanban-missions"]);
      qc.setQueryData<KanbanMission[]>(["kanban-missions"], old =>
        old?.map(m => m.id === id ? { ...m, columnStatus: column } : m) ?? []
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["kanban-missions"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["kanban-missions"] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const m = missions.find(x => x.id === event.active.id);
    setActiveMission(m ?? null);
  }, [missions]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveMission(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeM = missions.find(m => m.id === active.id);
    if (!activeM) return;

    const overM = missions.find(m => m.id === over.id);
    const targetCol = overM?.columnStatus ?? over.id as string;

    if (activeM.columnStatus !== targetCol) {
      moveMutation.mutate({ id: activeM.id, column: targetCol });
      if (selectedCard?.id === activeM.id) {
        setSelectedCard(prev => prev ? { ...prev, columnStatus: targetCol } : null);
      }
    }
  }, [missions, moveMutation, selectedCard]);

  const handleMove = useCallback((column: string) => {
    if (!selectedCard) return;
    moveMutation.mutate({ id: selectedCard.id, column });
    setSelectedCard(prev => prev ? { ...prev, columnStatus: column } : null);
  }, [selectedCard, moveMutation]);

  const filteredMissions = missions.filter(m => {
    if (filterPriority !== "all" && m.priority !== filterPriority) return false;
    if (filterRole !== "all" && m.assignee?.role !== filterRole) return false;
    return true;
  });

  const getColumnMissions = (colId: string) =>
    filteredMissions.filter(m => m.columnStatus === colId);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "var(--ae-bg)",
      overflow: "hidden",
    }}>
      {/* Page header */}
      <div style={{
        padding: "12px 18px",
        borderBottom: "2px solid var(--ae-border)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
        background: "var(--ae-surface)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Target size={14} color="var(--ae-cyan)" />
          <span style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 9,
            color: "var(--ae-cyan)",
            letterSpacing: "0.08em",
            textShadow: "0 0 12px rgba(91,143,255,0.5)",
          }}>
            KANBAN WALL
          </span>
        </div>

        <div style={{ width: 1, height: 16, background: "var(--ae-border)" }} />

        <FilterBar
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          filterRole={filterRole}
          setFilterRole={setFilterRole}
        />

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", gap: 16 }}>
          {COLUMNS.map(c => {
            const count = getColumnMissions(c.id).length;
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: c.color }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)" }}>
                  {c.label}: <span style={{ color: c.color }}>{count}</span>
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ width: 1, height: 16, background: "var(--ae-border)" }} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "var(--ae-muted)" }}>
          {filteredMissions.length} MISSIONS
        </span>
      </div>

      {/* Board */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {isLoading ? (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "var(--ae-muted)",
            letterSpacing: "0.1em",
          }}>
            LOADING MISSIONS...
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div style={{
              display: "flex",
              flex: 1,
              gap: 0,
              overflowX: "auto",
              overflowY: "hidden",
              padding: 0,
            }}>
              {COLUMNS.map(col => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  missions={getColumnMissions(col.id)}
                  onCardClick={m => setSelectedCard(m)}
                />
              ))}
            </div>

            <DragOverlay>
              {activeMission && (
                <div style={{ transform: "rotate(1.5deg)", opacity: 0.95 }}>
                  <KanbanCard
                    mission={activeMission}
                    onClick={() => {}}
                    isDragging
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedCard && (
          <DetailPanel
            key={selectedCard.id}
            mission={selectedCard}
            onClose={() => setSelectedCard(null)}
            onMove={handleMove}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
