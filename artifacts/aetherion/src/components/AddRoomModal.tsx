import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Beaker, Code2, Palette, Megaphone, Settings, BarChart3 } from "lucide-react";
import { useCreateRoom } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const px = { fontFamily: "'Press Start 2P', monospace" };
const mono = { fontFamily: "'Space Mono', monospace" };

const ROOM_TYPES = [
  { value: "research",    label: "RESEARCH",    icon: Beaker,    color: "#5b8fff", desc: "Data gathering & analysis" },
  { value: "development", label: "DEVELOPMENT", icon: Code2,     color: "#4d7fff", desc: "Build & deploy systems" },
  { value: "design",      label: "DESIGN",      icon: Palette,   color: "#9b6dff", desc: "Visual & UX creation" },
  { value: "marketing",   label: "MARKETING",   icon: Megaphone, color: "#ffb84d", desc: "Growth & outreach" },
  { value: "operations",  label: "OPERATIONS",  icon: Settings,  color: "#4dff9b", desc: "Systems & logistics" },
  { value: "analytics",   label: "ANALYTICS",   icon: BarChart3, color: "#ff4d6d", desc: "Metrics & insights" },
] as const;

type RoomType = typeof ROOM_TYPES[number]["value"];

interface Props {
  stationId: number;
  onClose: () => void;
}

export function AddRoomModal({ stationId, onClose }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<RoomType>("research");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { mutateAsync: createRoom, isPending } = useCreateRoom();

  const selectedType = ROOM_TYPES.find(r => r.value === type)!;

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Room name is required"); return; }
    setError("");
    try {
      await createRoom({ id: stationId, data: { name: name.trim(), type } });
      await queryClient.invalidateQueries({ queryKey: ["/api/stations"] });
      onClose();
    } catch {
      setError("Failed to create room. Please try again.");
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
          border: `2px solid ${selectedType.color}44`,
          boxShadow: `0 0 40px ${selectedType.color}18`,
          position: "relative",
        }}
      >
        {/* Corner accents */}
        <div style={{ position: "absolute", top: -2, left: -2, width: 16, height: 16, borderTop: `2px solid ${selectedType.color}`, borderLeft: `2px solid ${selectedType.color}` }} />
        <div style={{ position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderBottom: `2px solid ${selectedType.color}`, borderRight: `2px solid ${selectedType.color}` }} />

        {/* Header */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--ae-border)", display: "flex", alignItems: "center", gap: 10 }}>
          <Plus size={12} color={selectedType.color} />
          <span style={{ ...px, fontSize: 8, color: "#c0c8e0", letterSpacing: "0.1em" }}>ADD ROOM</span>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", padding: 2, display: "flex" }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: "18px 18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Room name input */}
          <div>
            <label style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", display: "block", marginBottom: 7 }}>ROOM NAME</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
              placeholder="e.g. Research Lab Alpha..."
              maxLength={40}
              autoFocus
              style={{
                width: "100%", padding: "9px 12px", boxSizing: "border-box",
                background: "rgba(0,0,0,0.4)",
                border: `1px solid ${error ? "#ff4d6d" : "var(--ae-border)"}`,
                color: "var(--ae-text)", outline: "none",
                ...mono, fontSize: 10, letterSpacing: "0.04em",
                transition: "border-color 0.15s",
              }}
              onFocus={e => (e.target.style.borderColor = selectedType.color)}
              onBlur={e => (e.target.style.borderColor = error ? "#ff4d6d" : "var(--ae-border)")}
            />
            {error && <div style={{ ...mono, fontSize: 7, color: "#ff4d6d", marginTop: 5, letterSpacing: "0.06em" }}>{error}</div>}
          </div>

          {/* Room type selector */}
          <div>
            <label style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", display: "block", marginBottom: 7 }}>ROOM TYPE</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {ROOM_TYPES.map(rt => {
                const isSelected = type === rt.value;
                const Icon = rt.icon;
                return (
                  <button
                    key={rt.value}
                    onClick={() => setType(rt.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "9px 11px",
                      border: `1px solid ${isSelected ? rt.color : "var(--ae-border)"}`,
                      background: isSelected ? `${rt.color}12` : "transparent",
                      cursor: "pointer", transition: "all 0.15s",
                      boxShadow: isSelected ? `0 0 12px ${rt.color}22` : "none",
                      textAlign: "left",
                    }}
                  >
                    <Icon size={12} color={isSelected ? rt.color : "var(--ae-muted)"} style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ ...px, fontSize: 6, color: isSelected ? rt.color : "#8090b0", letterSpacing: "0.06em", marginBottom: 2 }}>{rt.label}</div>
                      <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)" }}>{rt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={onClose} className="pixel-btn" style={{ flex: 1, fontSize: 7 }}>CANCEL</button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !name.trim()}
              className="pixel-btn primary"
              style={{ flex: 2, fontSize: 7, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: isPending || !name.trim() ? 0.6 : 1 }}
            >
              {isPending ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ width: 10, height: 10, border: "2px solid #5b8fff44", borderTop: "2px solid #5b8fff", borderRadius: "50%" }} />
                  CREATING...
                </>
              ) : (
                <><Plus size={10} /> DEPLOY ROOM</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
