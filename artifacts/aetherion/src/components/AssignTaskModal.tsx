import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ChevronRight } from "lucide-react";

const mono = { fontFamily: "'Space Mono', monospace" };

const ROLE_HEX: Record<string, string> = {
  research: "#5b8fff", strategy: "#9b6dff", builder: "#4d7fff",
  content: "#ffb84d", growth: "#4dff9b", analytics: "#ff4d6d", design: "#ff4d9b",
};

const TASKS_BY_ROLE: Record<string, string[]> = {
  research: [
    "Run competitive market analysis",
    "Deep scan protocol: sector 4",
    "Hypothesis validation: growth loop",
    "Research AI model accuracy benchmarks",
    "Analyze user behavior patterns",
    "Document experiment results",
  ],
  strategy: [
    "Develop Q3 tactical roadmap",
    "Reallocate resource priorities",
    "Threat assessment: rival stations",
    "Build 90-day expansion plan",
    "Review OKR alignment",
    "Coordinate cross-team objectives",
  ],
  builder: [
    "Deploy authentication service",
    "Optimize API response times",
    "Build CI/CD pipeline stage 2",
    "Refactor core data layer",
    "Set up monitoring dashboards",
    "Patch critical security vulnerability",
  ],
  content: [
    "Write product launch announcement",
    "Generate 20 social media posts",
    "Draft email newsletter campaign",
    "Create SEO blog content batch",
    "Script video ad creative",
    "Update knowledge base articles",
  ],
  growth: [
    "Launch referral program v2",
    "A/B test landing page variants",
    "Optimize paid acquisition funnel",
    "Activate viral loop campaign",
    "Retargeting campaign: lapsed users",
    "Analyze conversion drop-off points",
  ],
  analytics: [
    "Build revenue attribution model",
    "Generate weekly KPI report",
    "Audit data pipeline integrity",
    "Forecast next 30-day trajectory",
    "Set up real-time anomaly alerts",
    "Segment user cohort analysis",
  ],
};

const PRIORITIES = [
  { label: "CRITICAL", color: "#ff4d6d" },
  { label: "HIGH",     color: "#ffb84d" },
  { label: "NORMAL",   color: "#5b8fff" },
  { label: "LOW",      color: "#9b6dff" },
];

interface Props {
  agentName: string;
  agentRole: string;
  currentTask?: string | null;
  onAssign: (task: string, priority: string, context?: string) => void;
  onClose: () => void;
}

export function AssignTaskModal({ agentName, agentRole, currentTask, onAssign, onClose }: Props) {
  const role = agentRole?.toLowerCase() ?? "research";
  const color = ROLE_HEX[role] ?? "#4d7fff";
  const tasks = TASKS_BY_ROLE[role] ?? TASKS_BY_ROLE.research;

  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [context, setContext] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [confirmed, setConfirmed] = useState(false);

  const taskToAssign = custom.trim() || selected;

  function handleAssign() {
    if (!taskToAssign) return;
    setConfirmed(true);
    setTimeout(() => {
      onAssign(taskToAssign, priority, context.trim() || undefined);
      onClose();
    }, 900);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(5,6,10,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(2px)",
        }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: confirmed ? 0 : 1, y: confirmed ? -16 : 0, scale: confirmed ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          style={{
            width: 420, maxHeight: "80vh",
            background: "var(--ae-surface)",
            border: `2px solid ${color}`,
            boxShadow: `0 0 40px ${color}33, 0 8px 48px rgba(0,0,0,0.9)`,
            display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "10px 14px",
            background: `${color}12`,
            borderBottom: `1px solid ${color}44`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 8, height: 8, background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: "var(--ae-text)", letterSpacing: "0.04em" }}>
                ASSIGN TASK
              </div>
              <div style={{ ...mono, fontSize: 7, color, marginTop: 3, letterSpacing: "0.08em" }}>
                {agentName} · {role.toUpperCase()}
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", padding: 4, display: "flex" }}>
              <X size={13} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 0" }}>
            {/* Current task */}
            {currentTask && (
              <div style={{ marginBottom: 12, padding: "7px 10px", background: "rgba(0,0,0,0.35)", border: "1px solid var(--ae-border)" }}>
                <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 3 }}>CURRENT TASK</div>
                <div style={{ ...mono, fontSize: 9, color: "var(--ae-dim)" }}>→ {currentTask}</div>
              </div>
            )}

            {/* Task list */}
            <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 7 }}>SELECT TASK</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              {tasks.map(task => {
                const isSelected = selected === task && !custom.trim();
                return (
                  <button key={task}
                    onClick={() => { setSelected(task); setCustom(""); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", textAlign: "left",
                      background: isSelected ? `${color}18` : "rgba(0,0,0,0.25)",
                      border: `1px solid ${isSelected ? color : "var(--ae-border)"}`,
                      cursor: "pointer", transition: "all 0.12s",
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = `${color}55`; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = "var(--ae-border)"; }}
                  >
                    <div style={{
                      width: 14, height: 14, flexShrink: 0,
                      border: `1px solid ${isSelected ? color : "var(--ae-border)"}`,
                      background: isSelected ? color : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isSelected && <Check size={9} style={{ color: "#000" }} />}
                    </div>
                    <ChevronRight size={10} style={{ color: isSelected ? color : "var(--ae-border)", flexShrink: 0 }} />
                    <span style={{ ...mono, fontSize: 9, color: isSelected ? "var(--ae-text)" : "var(--ae-muted)" }}>{task}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom task input */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 5 }}>OR ENTER CUSTOM TASK</div>
              <input
                value={custom}
                onChange={e => { setCustom(e.target.value); if (e.target.value) setSelected(null); }}
                placeholder="Type a custom task for this agent..."
                style={{
                  width: "100%", padding: "8px 10px",
                  background: "rgba(0,0,0,0.4)",
                  border: `1px solid ${custom.trim() ? color : "var(--ae-border)"}`,
                  ...mono, fontSize: 9, color: "var(--ae-text)", outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={e => (e.target.style.borderColor = color)}
                onBlur={e => (e.target.style.borderColor = custom.trim() ? color : "var(--ae-border)")}
              />
            </div>

            {/* AI Context field */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>GOAL / CONTEXT</div>
                <span style={{ ...mono, fontSize: 6, color: color, background: `${color}18`, border: `1px solid ${color}44`, padding: "1px 5px", letterSpacing: "0.08em" }}>AI POWERED</span>
              </div>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="Describe what you want the agent to produce... (optional — if provided, AI will generate a real output based on this)"
                rows={3}
                style={{
                  width: "100%", padding: "8px 10px", resize: "vertical",
                  background: "rgba(0,0,0,0.4)",
                  border: `1px solid ${context.trim() ? color : "var(--ae-border)"}`,
                  ...mono, fontSize: 8, color: "var(--ae-text)", outline: "none",
                  boxSizing: "border-box", lineHeight: 1.6,
                }}
                onFocus={e => (e.target.style.borderColor = color)}
                onBlur={e => (e.target.style.borderColor = context.trim() ? color : "var(--ae-border)")}
              />
              <div style={{ ...mono, fontSize: 6, color: "var(--ae-dim)", marginTop: 4 }}>
                ⚡ Context makes the AI output specific and useful. Requires API key in Settings.
              </div>
            </div>

            {/* Priority */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 7 }}>PRIORITY</div>
              <div style={{ display: "flex", gap: 6 }}>
                {PRIORITIES.map(p => {
                  const isActive = priority === p.label;
                  return (
                    <button key={p.label} onClick={() => setPriority(p.label)}
                      style={{
                        flex: 1, padding: "5px 4px",
                        ...mono, fontSize: 7, letterSpacing: "0.06em",
                        border: `1px solid ${isActive ? p.color : "var(--ae-border)"}`,
                        background: isActive ? `${p.color}18` : "transparent",
                        color: isActive ? p.color : "var(--ae-muted)",
                        cursor: "pointer", transition: "all 0.12s",
                      }}
                    >{p.label}</button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--ae-border)", display: "flex", gap: 8 }}>
            <button onClick={onClose} className="pixel-btn" style={{ flex: 1, fontSize: 8 }}>CANCEL</button>
            <button
              onClick={handleAssign}
              disabled={!taskToAssign}
              className="pixel-btn primary"
              style={{ flex: 2, fontSize: 8, opacity: taskToAssign ? 1 : 0.4, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              {confirmed ? (
                <><Check size={11} /> ASSIGNED</>
              ) : (
                <>ASSIGN TO {agentName}</>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
