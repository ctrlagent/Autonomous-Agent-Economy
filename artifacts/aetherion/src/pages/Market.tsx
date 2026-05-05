import { useState } from "react";
import { useListTemplates, useCreateStation } from "@workspace/api-client-react";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const CATEGORIES = ["All", "Crypto", "E-Commerce", "Content", "SaaS"];

const CAT_COLORS: Record<string, string> = {
  CRYPTO: "#ffb84d", ECOMMERCE: "#4dff9b", CONTENT: "#4df0d8", SAAS: "#9b6dff", DEFAULT: "#4d7fff",
};
function getCatColor(cat: string) { return CAT_COLORS[cat?.toUpperCase()] ?? CAT_COLORS.DEFAULT; }

function StarRating({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span style={{ color: "#ffb84d", fontFamily: "'Space Mono',monospace", fontSize: 10 }}>
      {"★".repeat(full)}{"☆".repeat(5 - full)}
      <span style={{ color: "var(--ae-muted)", marginLeft: 5, fontSize: 8 }}>{rating.toFixed(1)}</span>
    </span>
  );
}

const TEMPLATE_ICONS: Record<string, string> = {
  CRYPTO: "₿", ECOMMERCE: "🛒", CONTENT: "📱", SAAS: "💻", DEFAULT: "⚙️",
};

export default function Market() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { data: templates } = useListTemplates();
  const createStation = useCreateStation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [creatingTemplateId, setCreatingTemplateId] = useState<number | null>(null);
  const [stationName, setStationName] = useState("");

  const filteredTemplates = (templates ?? []).filter(t => {
    const matchCat = filter === "All" || t.category.toLowerCase() === filter.toLowerCase();
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCreate = () => {
    if (!creatingTemplateId || !stationName.trim()) return;
    createStation.mutate(
      { data: { name: stationName, templateId: creatingTemplateId } },
      {
        onSuccess: () => {
          toast({ title: "Station Launched", description: "Your new station is now operational." });
          setCreatingTemplateId(null);
          setStationName("");
          setLocation("/");
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to launch station.", variant: "destructive" });
        },
      }
    );
  };

  const mono = { fontFamily: "'Space Mono', monospace" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>
      {/* PIXEL ART MARKETPLACE HEADER BANNER */}
      <div style={{
        flexShrink: 0, height: 90,
        background: "var(--ae-surface-2)",
        borderBottom: "2px solid var(--ae-cyan)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 20,
      }}>
        {/* Starfield bg */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(77,127,255,0.4) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          opacity: 0.15,
        }} />
        {/* Market stalls pixel art (SVG) */}
        <svg width="300" height="80" viewBox="0 0 300 80" style={{ position: "absolute", right: 0, bottom: 0, imageRendering: "pixelated", opacity: 0.35 }}>
          {/* Stall 1 - amber */}
          <rect x="0" y="30" width="90" height="50" fill="#2e1f0d" />
          <rect x="0" y="20" width="95" height="15" fill="#ffb84d" />
          <rect x="5" y="25" width="85" height="5" fill="#cc8a2b" />
          <rect x="10" y="35" width="30" height="20" fill="#1e2130" />
          <rect x="50" y="35" width="30" height="40" fill="#1e2130" />
          {/* Stall 2 - cyan */}
          <rect x="105" y="25" width="90" height="55" fill="#0d2e2b" />
          <rect x="100" y="15" width="100" height="15" fill="#4df0d8" />
          <rect x="105" y="20" width="90" height="5" fill="#2bb8a4" />
          <rect x="115" y="30" width="25" height="25" fill="#141720" />
          <rect x="155" y="30" width="30" height="45" fill="#141720" />
          {/* Stall 3 - violet */}
          <rect x="210" y="35" width="90" height="45" fill="#1e0d3d" />
          <rect x="205" y="22" width="95" height="16" fill="#9b6dff" />
          <rect x="210" y="28" width="90" height="6" fill="#7a4fd4" />
          <rect x="220" y="38" width="30" height="40" fill="#141720" />
          <rect x="260" y="38" width="30" height="30" fill="#141720" />
          {/* People pixels */}
          <rect x="82" y="50" width="6" height="10" fill="#4df0d8" /><rect x="83" y="44" width="4" height="6" fill="#ffcba4" />
          <rect x="195" y="45" width="6" height="10" fill="#9b6dff" /><rect x="196" y="39" width="4" height="6" fill="#ffcba4" />
          <rect x="300" y="48" width="6" height="10" fill="#ffb84d" /><rect x="301" y="42" width="4" height="6" fill="#ffcba4" />
        </svg>

        {/* Logo + title */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" style={{ imageRendering: "pixelated", verticalAlign: "middle", marginRight: 10 }}>
            <polygon points="11,1 21,6 21,16 11,21 1,16 1,6" fill="none" stroke="#4df0d8" strokeWidth="1.5" />
            <text x="11" y="15.5" textAnchor="middle" fill="#ffb84d" fontSize="9" fontFamily="'Press Start 2P',monospace">A</text>
          </svg>
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 13, color: "var(--ae-text)", letterSpacing: "0.05em", textShadow: "0 0 16px rgba(77,240,216,0.5)" }}>
            TEMPLATE MARKETPLACE
          </span>
        </div>
        <div style={{ position: "relative", zIndex: 1, marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ ...mono, fontSize: 8, padding: "3px 10px", border: "1px solid var(--ae-cyan)", color: "var(--ae-cyan)", letterSpacing: "0.1em" }}>
            {filteredTemplates.length} templates available
          </span>
        </div>
      </div>

      {/* Search + Category filters */}
      <div style={{
        flexShrink: 0, padding: "10px 24px",
        borderBottom: "1px solid var(--ae-border)",
        background: "rgba(0,0,0,0.2)",
        display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ae-muted)", fontSize: 12 }}>🔍</span>
          <input
            type="text" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", background: "var(--ae-surface", border: "1px solid var(--ae-border)",
              padding: "6px 10px 6px 28px", ...mono, fontSize: 11, color: "var(--ae-text)", outline: "none", transition: "border-color 0.15s",
            }}
            onFocus={e => (e.target.style.borderColor = "var(--ae-cyan)")}
            onBlur={e => (e.target.style.borderColor = "var(--ae-border)")}
          />
        </div>
        {/* Category pills */}
        <div style={{ display: "flex", gap: 0, border: "1px solid var(--ae-border)" }}>
          {CATEGORIES.map((c, i) => (
            <button key={c} onClick={() => setFilter(c)} style={{
              ...mono, fontSize: 9, padding: "5px 14px",
              borderRight: i < CATEGORIES.length - 1 ? "1px solid var(--ae-border)" : "none",
              background: filter === c ? "var(--ae-cyan)" : "transparent",
              color: filter === c ? "#0a0b0f" : "var(--ae-muted)",
              cursor: "pointer", letterSpacing: "0.06em", transition: "all 0.15s", fontWeight: filter === c ? 700 : 400,
              boxShadow: filter === c ? "0 0 10px rgba(77,240,216,0.3)" : "none",
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {filteredTemplates.map((t, i) => {
            const catColor = getCatColor(t.category);
            const icon = TEMPLATE_ICONS[t.category?.toUpperCase()] ?? TEMPLATE_ICONS.DEFAULT;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  background: "var(--ae-surface)",
                  border: `1px solid ${catColor}44`,
                  display: "flex", flexDirection: "column",
                  position: "relative",
                  cursor: "default",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = catColor; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 14px ${catColor}30`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${catColor}44`; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `2px solid ${catColor}`, borderLeft: `2px solid ${catColor}` }} />
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderBottom: `2px solid ${catColor}`, borderRight: `2px solid ${catColor}` }} />

                {/* Icon area */}
                <div style={{
                  height: 80,
                  background: `${catColor}10`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderBottom: `1px solid ${catColor}30`,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }} />
                  <div style={{
                    width: 52, height: 52,
                    background: `${catColor}20`,
                    border: `1px solid ${catColor}66`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24,
                    boxShadow: `0 0 16px ${catColor}40`,
                    position: "relative",
                    zIndex: 1,
                  }}>
                    {icon}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...mono, fontSize: 7, padding: "1px 6px", background: `${catColor}18`, border: `1px solid ${catColor}50`, color: catColor, letterSpacing: "0.1em", display: "inline-block", width: "fit-content" }}>
                    {t.category?.toUpperCase()}
                  </span>
                  <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: catColor, letterSpacing: "0.04em", lineHeight: 1.6, textShadow: `0 0 8px ${catColor}60` }}>
                    {t.name.toUpperCase()}
                  </div>
                  <div style={{ ...mono, fontSize: 9, color: "var(--ae-muted)", lineHeight: 1.5 }}>{t.description}</div>

                  <div style={{ display: "flex", gap: 14, ...mono, fontSize: 9, color: "var(--ae-muted)", marginTop: 4 }}>
                    <span>👥 ×{t.agentCount} agents</span>
                    <span>🏠 {t.roomCount} rooms</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StarRating rating={t.rating ?? 4.5} />
                    <span style={{ ...mono, fontSize: 8, color: "var(--ae-muted)" }}>{(t.usageCount ?? 0).toLocaleString()} users</span>
                  </div>
                </div>

                <div style={{ padding: "8px 14px 12px" }}>
                  <button
                    className="pixel-btn primary"
                    onClick={() => setCreatingTemplateId(t.id)}
                    style={{ width: "100%", fontSize: 9, padding: "7px", letterSpacing: "0.06em", background: `${catColor}18`, borderColor: catColor, color: catColor }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${catColor}35`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${catColor}18`; }}
                  >
                    [USE TEMPLATE]
                  </button>
                </div>
              </motion.div>
            );
          })}

          {/* Create & Sell CTA card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: filteredTemplates.length * 0.06 }}
            style={{ border: "1px dashed var(--ae-border-bright)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, minHeight: 180, cursor: "pointer", background: "rgba(0,0,0,0.1)", transition: "all 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ae-cyan)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ae-border-bright)"; }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.04em", lineHeight: 1.8 }}>
                ✦ Create &amp; Sell<br />Your Template
              </div>
            </div>
          </motion.div>

          {filteredTemplates.length === 0 && (
            <div style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", padding: "40px 0", textAlign: "center", gridColumn: "1/-1" }}>
              NO TEMPLATES FOUND
            </div>
          )}
        </div>
      </div>

      {/* Deploy Modal */}
      {creatingTemplateId && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,11,15,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}>
          <div style={{ background: "var(--ae-surface-2)", border: "1px solid var(--ae-border-bright)", padding: "28px 32px", maxWidth: 420, width: "100%", position: "relative" }} className="pixel-border">
            <button onClick={() => { setCreatingTemplateId(null); setStationName(""); }} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)" }}>
              <X size={14} />
            </button>
            <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: "var(--ae-text)", letterSpacing: "0.04em", lineHeight: 1.8, marginBottom: 8 }}>DEPLOY STATION</div>
            <p style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", marginBottom: 20 }}>Enter a designation for your new station.</p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>STATION DESIGNATION</label>
              <input
                type="text" value={stationName} onChange={e => setStationName(e.target.value)} autoFocus placeholder="e.g. ALPHA PRIME"
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                style={{ width: "100%", background: "var(--ae-bg)", border: "1px solid var(--ae-border)", padding: "9px 12px", ...mono, fontSize: 12, color: "var(--ae-text)", outline: "none", letterSpacing: "0.06em", transition: "border-color 0.15s" }}
                onFocus={e => (e.target.style.borderColor = "var(--ae-cyan)")}
                onBlur={e => (e.target.style.borderColor = "var(--ae-border)")}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="pixel-btn" onClick={() => { setCreatingTemplateId(null); setStationName(""); }} style={{ flex: 1 }}>CANCEL</button>
              <button className="pixel-btn primary" onClick={handleCreate} disabled={!stationName.trim() || createStation.isPending} style={{ flex: 1, opacity: (!stationName.trim() || createStation.isPending) ? 0.5 : 1 }}>
                {createStation.isPending ? "DEPLOYING..." : "DEPLOY"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
