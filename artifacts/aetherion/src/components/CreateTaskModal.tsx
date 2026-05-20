import { useState } from "react";
import { motion } from "framer-motion";
import { X, ClipboardList } from "lucide-react";
import { useCreateTask } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const px = { fontFamily: "'Press Start 2P', monospace" };
const mono = { fontFamily: "'Space Mono', monospace" };

const PRIORITIES = [
  { value: "critical", label: "CRITICAL", color: "#ff4d6d" },
  { value: "high",     label: "HIGH",     color: "#ffb84d" },
  { value: "medium",   label: "MEDIUM",   color: "#4d7fff" },
  { value: "low",      label: "LOW",      color: "#4a5580" },
] as const;

type Priority = typeof PRIORITIES[number]["value"];

const TASK_SUGGESTIONS: Record<string, string[]> = {
  research:  ["Analyze competitor landscape", "Research market trends", "Gather user feedback", "Document findings"],
  strategy:  ["Define Q2 roadmap", "Identify growth opportunities", "Optimize resource allocation", "Create action plan"],
  builder:   ["Build API integration", "Deploy infrastructure", "Optimize performance", "Fix critical bugs"],
  content:   ["Write blog post series", "Create social media content", "Draft product documentation", "Design email campaign"],
  growth:    ["Launch referral program", "A/B test landing page", "Expand to new market", "Optimize funnel"],
  analytics: ["Build performance dashboard", "Analyze retention metrics", "Generate weekly report", "Identify drop-off points"],
};

interface Props {
  agentId: number;
  agentName: string;
  agentRole: string;
  onClose: () => void;
}

export function CreateTaskModal({ agentId, agentName, agentRole, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { mutateAsync: createTask, isPending } = useCreateTask();

  const selectedPriority = PRIORITIES.find(p => p.value === priority)!;
  const suggestions = TASK_SUGGESTIONS[agentRole.toLowerCase()] ?? TASK_SUGGESTIONS.research;

  const roleColor: Record<string, string> = {
    research: "#4df0d8", strategy: "#9b6dff", builder: "#4d7fff",
    content: "#ffb84d", growth: "#4dff9b", analytics: "#ff4d6d",
  };
  const color = roleColor[agentRole.toLowerCase()] ?? "#4df0d8";

  const handleSubmit = async () => {
    if (!title.trim()) { setError("Task title is required"); return; }
    if (!description.trim()) { setError("Task description is required"); return; }
    setError("");
    try {
      await createTask({ id: agentId, data: { title: title.trim(), description: description.trim(), priority } });
      await queryClient.invalidateQueries({ queryKey: [`/api/agents/${agentId}/tasks`] });
      onClose();
    } catch {
      setError("Failed to create task. Please try again.");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(3px)",
      padding: "16px",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        style={{
          width: "100%", maxWidth: 500,
          background: "var(--ae-surface)",
          border: `2px solid ${color}44`,
          boxShadow: `0 0 40px ${color}18`,
          position: "relative",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        <div style={{ position: "absolute", top: -2, left: -2, width: 16, height: 16, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
        <div style={{ position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />

        {/* Header */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--ae-border)", display: "flex", alignItems: "center", gap: 10 }}>
          <ClipboardList size={12} color={color} />
          <span style={{ ...px, fontSize: 8, color: "#c0c8e0", letterSpacing: "0.1em" }}>NEW TASK</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ ...mono, fontSize: 7, color, letterSpacing: "0.06em" }}>{agentName}</div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", padding: 2, display: "flex" }}>
              <X size={14} />
            </button>
          </div>
        </div>

        <div style={{ padding: "18px 18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Task title */}
          <div>
            <label style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", display: "block", marginBottom: 7 }}>TASK TITLE</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Analyze market trends..."
              maxLength={80}
              autoFocus
              style={{
                width: "100%", padding: "9px 12px", boxSizing: "border-box",
                background: "rgba(0,0,0,0.4)",
                border: `1px solid ${error.includes("title") ? "#ff4d6d" : "var(--ae-border)"}`,
                color: "var(--ae-text)", outline: "none",
                ...mono, fontSize: 10, letterSpacing: "0.03em",
                transition: "border-color 0.15s",
              }}
              onFocus={e => (e.target.style.borderColor = color)}
              onBlur={e => (e.target.style.borderColor = "var(--ae-border)")}
            />
          </div>

          {/* Suggestions */}
          <div>
            <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>QUICK SELECT</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => setTitle(s)}
                  style={{
                    ...mono, fontSize: 7, padding: "4px 9px",
                    border: `1px solid ${title === s ? color : "var(--ae-border)"}`,
                    background: title === s ? `${color}14` : "rgba(0,0,0,0.3)",
                    color: title === s ? color : "var(--ae-muted)",
                    cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.04em",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", display: "block", marginBottom: 7 }}>DESCRIPTION</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What should the agent do specifically..."
              rows={3}
              maxLength={300}
              style={{
                width: "100%", padding: "9px 12px", boxSizing: "border-box",
                background: "rgba(0,0,0,0.4)",
                border: `1px solid ${error.includes("description") ? "#ff4d6d" : "var(--ae-border)"}`,
                color: "var(--ae-text)", outline: "none", resize: "vertical",
                ...mono, fontSize: 9, letterSpacing: "0.03em", lineHeight: 1.6,
                transition: "border-color 0.15s",
              }}
              onFocus={e => (e.target.style.borderColor = color)}
              onBlur={e => (e.target.style.borderColor = "var(--ae-border)")}
            />
          </div>

          {/* Priority */}
          <div>
            <label style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", display: "block", marginBottom: 7 }}>PRIORITY</label>
            <div style={{ display: "flex", gap: 6 }}>
              {PRIORITIES.map(p => {
                const isSelected = priority === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    style={{
                      flex: 1, padding: "8px 4px",
                      border: `1px solid ${isSelected ? p.color : "var(--ae-border)"}`,
                      background: isSelected ? `${p.color}14` : "transparent",
                      cursor: "pointer", transition: "all 0.15s",
                      boxShadow: isSelected ? `0 0 8px ${p.color}33` : "none",
                    }}
                  >
                    <div style={{ ...px, fontSize: 6, color: isSelected ? p.color : "#5060a0", letterSpacing: "0.04em" }}>{p.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <div style={{ ...mono, fontSize: 7, color: "#ff4d6d", letterSpacing: "0.06em" }}>{error}</div>}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={onClose} className="pixel-btn" style={{ flex: 1, fontSize: 7 }}>CANCEL</button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !title.trim() || !description.trim()}
              className="pixel-btn primary"
              style={{ flex: 2, fontSize: 7, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: isPending || !title.trim() || !description.trim() ? 0.6 : 1 }}
            >
              {isPending ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ width: 10, height: 10, border: "2px solid #4df0d844", borderTop: "2px solid #4df0d8", borderRadius: "50%" }} />
                  SAVING...
                </>
              ) : (
                <><ClipboardList size={10} /> ASSIGN TASK</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
