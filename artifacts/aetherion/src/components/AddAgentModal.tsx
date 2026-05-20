import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Bot } from "lucide-react";
import { useCreateAgent } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const px = { fontFamily: "'Press Start 2P', monospace" };
const mono = { fontFamily: "'Space Mono', monospace" };

const ROLES = [
  { value: "research",  label: "RESEARCH",  color: "#4df0d8", symbol: "⬡", desc: "Analysis & data ops" },
  { value: "strategy",  label: "STRATEGY",  color: "#9b6dff", symbol: "◈", desc: "Planning & decisions" },
  { value: "builder",   label: "BUILDER",   color: "#4d7fff", symbol: "⬢", desc: "Build & engineering" },
  { value: "content",   label: "CONTENT",   color: "#ffb84d", symbol: "◉", desc: "Write & create" },
  { value: "growth",    label: "GROWTH",    color: "#4dff9b", symbol: "⬟", desc: "Scale & acquire" },
  { value: "analytics", label: "ANALYTICS", color: "#ff4d6d", symbol: "⬠", desc: "Metrics & insights" },
] as const;

type Role = typeof ROLES[number]["value"];

interface Room { id: number; name: string; type: string; }

interface Props {
  stationId: number;
  rooms: Room[];
  onClose: () => void;
}

const AGENT_NAMES: Record<Role, string[]> = {
  research:  ["ARIA", "NOVA", "ECHO", "SCOUT", "DELTA"],
  strategy:  ["STRAT", "APEX", "VEGA", "ORACLE", "SIGMA"],
  builder:   ["FORGE", "CONSTRUCT", "BOLT", "NEXUS", "CRAFT"],
  content:   ["MUSE", "QUILL", "VECTOR", "LYRA", "SCRIPT"],
  growth:    ["FLUX", "SURGE", "EXPAND", "BOOST", "SCALE"],
  analytics: ["LENS", "PULSE", "TRACE", "METRIC", "CIPHER"],
};

export function AddAgentModal({ stationId, rooms, onClose }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("research");
  const [roomId, setRoomId] = useState<number | null>(rooms[0]?.id ?? null);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { mutateAsync: createAgent, isPending } = useCreateAgent();

  const selectedRole = ROLES.find(r => r.value === role)!;

  const suggestName = () => {
    const names = AGENT_NAMES[role];
    setName(names[Math.floor(Math.random() * names.length)]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Agent name is required"); return; }
    if (!roomId) { setError("Select a room for this agent"); return; }
    setError("");
    try {
      await createAgent({ id: stationId, data: { name: name.trim().toUpperCase(), role, roomId } });
      await queryClient.invalidateQueries({ queryKey: ["/api/stations"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      onClose();
    } catch {
      setError("Failed to deploy agent. Please try again.");
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
          width: "100%", maxWidth: 480,
          background: "var(--ae-surface)",
          border: `2px solid ${selectedRole.color}44`,
          boxShadow: `0 0 40px ${selectedRole.color}18`,
          position: "relative",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        <div style={{ position: "absolute", top: -2, left: -2, width: 16, height: 16, borderTop: `2px solid ${selectedRole.color}`, borderLeft: `2px solid ${selectedRole.color}` }} />
        <div style={{ position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderBottom: `2px solid ${selectedRole.color}`, borderRight: `2px solid ${selectedRole.color}` }} />

        {/* Header */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--ae-border)", display: "flex", alignItems: "center", gap: 10 }}>
          <Bot size={12} color={selectedRole.color} />
          <span style={{ ...px, fontSize: 8, color: "#c0c8e0", letterSpacing: "0.1em" }}>DEPLOY AGENT</span>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", padding: 2, display: "flex" }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: "18px 18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Agent name */}
          <div>
            <label style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", display: "block", marginBottom: 7 }}>AGENT DESIGNATION</label>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                value={name}
                onChange={e => setName(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
                placeholder="e.g. ARIA..."
                maxLength={20}
                autoFocus
                style={{
                  flex: 1, padding: "9px 12px", boxSizing: "border-box",
                  background: "rgba(0,0,0,0.4)",
                  border: `1px solid ${error.includes("name") ? "#ff4d6d" : "var(--ae-border)"}`,
                  color: "var(--ae-text)", outline: "none",
                  ...mono, fontSize: 10, letterSpacing: "0.06em",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.target.style.borderColor = selectedRole.color)}
                onBlur={e => (e.target.style.borderColor = "var(--ae-border)")}
              />
              <button
                onClick={suggestName}
                title="Random name"
                style={{
                  padding: "0 12px", border: "1px solid var(--ae-border)", background: "rgba(0,0,0,0.4)",
                  cursor: "pointer", color: "var(--ae-muted)", ...mono, fontSize: 7, letterSpacing: "0.06em",
                  transition: "all 0.15s", flexShrink: 0,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = selectedRole.color; (e.currentTarget as HTMLButtonElement).style.color = selectedRole.color; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ae-border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--ae-muted)"; }}
              >
                RAND
              </button>
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", display: "block", marginBottom: 7 }}>AGENT ROLE</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {ROLES.map(r => {
                const isSelected = role === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      padding: "10px 6px",
                      border: `1px solid ${isSelected ? r.color : "var(--ae-border)"}`,
                      background: isSelected ? `${r.color}12` : "transparent",
                      cursor: "pointer", transition: "all 0.15s",
                      boxShadow: isSelected ? `0 0 10px ${r.color}22` : "none",
                    }}
                  >
                    <span style={{ fontSize: 14, color: isSelected ? r.color : "var(--ae-muted)", lineHeight: 1 }}>{r.symbol}</span>
                    <div style={{ ...px, fontSize: 5, color: isSelected ? r.color : "#6070a0", letterSpacing: "0.04em" }}>{r.label}</div>
                    <div style={{ ...mono, fontSize: 5, color: "var(--ae-muted)", textAlign: "center" }}>{r.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room assignment */}
          <div>
            <label style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", display: "block", marginBottom: 7 }}>ASSIGN TO ROOM</label>
            {rooms.length === 0 ? (
              <div style={{ ...mono, fontSize: 8, color: "#ff4d6d", padding: "10px", border: "1px solid #ff4d6d44", background: "#ff4d6d08" }}>
                No rooms available. Add a room first.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {rooms.map(room => {
                  const isSelected = roomId === room.id;
                  const roleColor = {
                    research: "#4df0d8", development: "#4d7fff", design: "#9b6dff",
                    marketing: "#ffb84d", operations: "#4dff9b", analytics: "#ff4d6d",
                  }[room.type] ?? "#4df0d8";
                  return (
                    <button
                      key={room.id}
                      onClick={() => setRoomId(room.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                        border: `1px solid ${isSelected ? roleColor : "var(--ae-border)"}`,
                        background: isSelected ? `${roleColor}10` : "transparent",
                        cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                      }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: isSelected ? roleColor : "var(--ae-muted)", boxShadow: isSelected ? `0 0 6px ${roleColor}` : "none", flexShrink: 0 }} />
                      <span style={{ ...mono, fontSize: 9, color: isSelected ? roleColor : "#8090b0", flex: 1 }}>{room.name}</span>
                      <span style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", textTransform: "uppercase" }}>{room.type}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && <div style={{ ...mono, fontSize: 7, color: "#ff4d6d", letterSpacing: "0.06em" }}>{error}</div>}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={onClose} className="pixel-btn" style={{ flex: 1, fontSize: 7 }}>CANCEL</button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !name.trim() || !roomId || rooms.length === 0}
              className="pixel-btn primary"
              style={{ flex: 2, fontSize: 7, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: isPending || !name.trim() || !roomId ? 0.6 : 1 }}
            >
              {isPending ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ width: 10, height: 10, border: "2px solid #4df0d844", borderTop: "2px solid #4df0d8", borderRadius: "50%" }} />
                  DEPLOYING...
                </>
              ) : (
                <><Plus size={10} /> DEPLOY AGENT</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
