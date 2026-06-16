import { useState, useEffect } from "react";
import { useListTemplates, useCreateStation, useListStations } from "@workspace/api-client-react";
import { X, Zap, Star, Users, Shield, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

// ─── shared style helpers ──────────────────────────────────────────────────────
const mono = { fontFamily: "'Space Mono', monospace" } as const;
const pixel = { fontFamily: "'Press Start 2P', monospace" } as const;

// ─── Templates tab ─────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Crypto", "E-Commerce", "Content", "SaaS"];
const CAT_COLORS: Record<string, string> = {
  CRYPTO: "#ffb84d", ECOMMERCE: "#4dff9b", CONTENT: "#5b8fff", SAAS: "#9b6dff", DEFAULT: "#4d7fff",
};
function getCatColor(cat: string) { return CAT_COLORS[cat?.toUpperCase()] ?? CAT_COLORS.DEFAULT; }
function StarRating({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span style={{ color: "#ffb84d", ...mono, fontSize: 10 }}>
      {"★".repeat(full)}{"☆".repeat(5 - full)}
      <span style={{ color: "var(--ae-muted)", marginLeft: 5, fontSize: 8 }}>{rating.toFixed(1)}</span>
    </span>
  );
}
const TEMPLATE_ICONS: Record<string, string> = {
  CRYPTO: "₿", ECOMMERCE: "🛒", CONTENT: "📱", SAAS: "💻", DEFAULT: "⚙️",
};

// ─── Agent Marketplace types & helpers ────────────────────────────────────────
interface MarketplaceListing {
  id: number;
  agentName: string;
  role: string;
  rarity: "common" | "rare" | "elite" | "legendary";
  level: number;
  skills: string[];
  price: number;
  description: string;
  avatarSeed: number;
  status: string;
}

const ROLE_COLORS: Record<string, string> = {
  research: "#4df0d8", strategy: "#9b6dff", builder: "#4d7fff",
  content: "#ffb84d", growth: "#4dff9b", analytics: "#ff4d6d", design: "#ff77cc",
};
const RARITY_COLORS: Record<string, string> = {
  common: "#8899aa", rare: "#4d7fff", elite: "#9b6dff", legendary: "#ffb84d",
};
const RARITY_GLOW: Record<string, string> = {
  common: "none",
  rare:    "0 0 18px #4d7fff55",
  elite:   "0 0 22px #9b6dff66",
  legendary: "0 0 32px #ffb84d88",
};
const RARITY_LABEL: Record<string, string> = {
  common: "COMMON", rare: "RARE", elite: "ELITE", legendary: "LEGENDARY",
};

// Pixel-art avatar made from deterministic SVG rects based on seed
function PixelAvatar({ seed, role, size = 48 }: { seed: number; role: string; size?: number }) {
  const color = ROLE_COLORS[role] ?? "#4d7fff";
  const s = seed % 256;
  const grid = Array.from({ length: 25 }, (_, i) => Boolean((s * (i + 7) * 31) & (1 << (i % 8))));
  const px = size / 7;
  return (
    <svg width={size} height={size} viewBox="0 0 7 7" style={{ imageRendering: "pixelated", display: "block" }}>
      <rect width="7" height="7" fill={`${color}18`} />
      {grid.map((on, i) => on ? (
        <rect key={i} x={i % 5} y={Math.floor(i / 5)} width={1} height={1} fill={color} opacity={0.75 + (i % 4) * 0.06} />
      ) : null)}
      <rect x="1" y="1" width="5" height="5" fill="none" stroke={`${color}66`} strokeWidth="0.2" />
    </svg>
  );
}

const ROLE_FILTER_LIST = ["All", "research", "strategy", "builder", "content", "growth", "analytics"];
const RARITY_FILTER_LIST = ["All", "common", "rare", "elite", "legendary"];

// ─── Main component ───────────────────────────────────────────────────────────
export default function Market() {
  const [tab, setTab] = useState<"templates" | "agents">("templates");

  // ── Templates state ──
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { data: templates } = useListTemplates();
  const createStation = useCreateStation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [creatingTemplateId, setCreatingTemplateId] = useState<number | null>(null);
  const [stationName, setStationName] = useState("");

  // ── Agent Marketplace state ──
  const [agents, setAgents] = useState<MarketplaceListing[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("All");
  const [rarityFilter, setRarityFilter] = useState("All");
  const [agentSearch, setAgentSearch] = useState("");
  const [hireTarget, setHireTarget] = useState<MarketplaceListing | null>(null);
  const [hireStationId, setHireStationId] = useState<number | null>(null);
  const [hiring, setHiring] = useState(false);
  const { data: stations } = useListStations();

  // Load marketplace agents
  useEffect(() => {
    if (tab !== "agents") return;
    setAgentLoading(true);
    fetch("/api/marketplace/agents?status=available")
      .then(r => r.json() as Promise<MarketplaceListing[]>)
      .then(data => setAgents(data))
      .catch(() => toast({ title: "Error", description: "Failed to load agent marketplace", variant: "destructive" }))
      .finally(() => setAgentLoading(false));
  }, [tab]);

  // ── Templates handlers ──
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
        onError: () => toast({ title: "Error", description: "Failed to launch station.", variant: "destructive" }),
      }
    );
  };

  // ── Agent hire handler ──
  const handleHire = async () => {
    if (!hireTarget || !hireStationId) return;
    setHiring(true);
    try {
      const res = await fetch(`/api/marketplace/hire/${hireTarget.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId: hireStationId }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Hire failed");
      }
      toast({ title: "Agent Hired!", description: `${hireTarget.agentName} has joined your station.` });
      setAgents(prev => prev.filter(a => a.id !== hireTarget.id));
      setHireTarget(null);
      setHireStationId(null);
    } catch (e: unknown) {
      toast({ title: "Hire Failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setHiring(false);
    }
  };

  const filteredAgents = agents.filter(a => {
    const matchRole = roleFilter === "All" || a.role === roleFilter;
    const matchRarity = rarityFilter === "All" || a.rarity === rarityFilter;
    const matchSearch = a.agentName.toLowerCase().includes(agentSearch.toLowerCase()) || a.description.toLowerCase().includes(agentSearch.toLowerCase());
    return matchRole && matchRarity && matchSearch;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>

      {/* ── Header Banner ── */}
      <div style={{
        flexShrink: 0, height: 90,
        background: "var(--ae-surface-2)",
        borderBottom: "2px solid var(--ae-cyan)",
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", padding: "0 24px", gap: 20,
      }}>
        {/* Grid bg */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(77,127,255,0.4) 1px, transparent 1px)",
          backgroundSize: "30px 30px", opacity: 0.15,
        }} />
        {/* Pixel market stalls */}
        <svg width="300" height="80" viewBox="0 0 300 80" style={{ position: "absolute", right: 0, bottom: 0, imageRendering: "pixelated", opacity: 0.35 }}>
          <rect x="0" y="30" width="90" height="50" fill="#2e1f0d" />
          <rect x="0" y="20" width="95" height="15" fill="#ffb84d" />
          <rect x="5" y="25" width="85" height="5" fill="#cc8a2b" />
          <rect x="10" y="35" width="30" height="20" fill="#1e2130" />
          <rect x="50" y="35" width="30" height="40" fill="#1e2130" />
          <rect x="105" y="25" width="90" height="55" fill="#0d2e2b" />
          <rect x="100" y="15" width="100" height="15" fill="#5b8fff" />
          <rect x="105" y="20" width="90" height="5" fill="#3d6bff" />
          <rect x="115" y="30" width="25" height="25" fill="#141720" />
          <rect x="155" y="30" width="30" height="45" fill="#141720" />
          <rect x="210" y="35" width="90" height="45" fill="#1e0d3d" />
          <rect x="205" y="22" width="95" height="16" fill="#9b6dff" />
          <rect x="210" y="28" width="90" height="6" fill="#7a4fd4" />
          <rect x="220" y="38" width="30" height="40" fill="#141720" />
          <rect x="260" y="38" width="30" height="30" fill="#141720" />
          <rect x="82" y="50" width="6" height="10" fill="#5b8fff" /><rect x="83" y="44" width="4" height="6" fill="#ffcba4" />
          <rect x="195" y="45" width="6" height="10" fill="#9b6dff" /><rect x="196" y="39" width="4" height="6" fill="#ffcba4" />
        </svg>

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" style={{ imageRendering: "pixelated", verticalAlign: "middle", marginRight: 10 }}>
            <polygon points="11,1 21,6 21,16 11,21 1,16 1,6" fill="none" stroke="#5b8fff" strokeWidth="1.5" />
            <text x="11" y="15.5" textAnchor="middle" fill="#ffb84d" fontSize="9" fontFamily="'Press Start 2P',monospace">A</text>
          </svg>
          <span style={{ ...pixel, fontSize: 13, color: "var(--ae-text)", letterSpacing: "0.05em", textShadow: "0 0 16px rgba(91,143,255,0.5)" }}>
            {tab === "templates" ? "TEMPLATE MARKET" : "AGENT MARKET"}
          </span>
        </div>

        {/* Tab switcher */}
        <div style={{ position: "relative", zIndex: 1, marginLeft: "auto", display: "flex", border: "1px solid var(--ae-border)" }}>
          {(["templates", "agents"] as const).map((t, i) => (
            <button key={t} onClick={() => setTab(t)} style={{
              ...mono, fontSize: 8, padding: "6px 14px", cursor: "pointer",
              borderRight: i === 0 ? "1px solid var(--ae-border)" : "none",
              background: tab === t ? "var(--ae-cyan)" : "transparent",
              color: tab === t ? "#0a0b0f" : "var(--ae-muted)",
              letterSpacing: "0.06em", transition: "all 0.15s",
            }}>
              {t === "templates" ? "TEMPLATES" : "⚡ AGENTS"}
            </button>
          ))}
        </div>

        {/* Count badge */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{ ...mono, fontSize: 8, padding: "3px 10px", border: "1px solid var(--ae-cyan)", color: "var(--ae-cyan)", letterSpacing: "0.1em" }}>
            {tab === "templates" ? `${filteredTemplates.length} templates` : `${filteredAgents.length} agents`}
          </span>
        </div>
      </div>

      {/* ── Content area ── */}
      {tab === "templates" ? (
        <TemplatesTab
          filter={filter} setFilter={setFilter}
          search={search} setSearch={setSearch}
          filteredTemplates={filteredTemplates}
          setCreatingTemplateId={setCreatingTemplateId}
        />
      ) : (
        <AgentsTab
          roleFilter={roleFilter} setRoleFilter={setRoleFilter}
          rarityFilter={rarityFilter} setRarityFilter={setRarityFilter}
          agentSearch={agentSearch} setAgentSearch={setAgentSearch}
          filteredAgents={filteredAgents}
          loading={agentLoading}
          setHireTarget={setHireTarget}
        />
      )}

      {/* ── Deploy Template Modal ── */}
      {creatingTemplateId && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,11,15,0.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}>
          <div style={{ background: "var(--ae-surface-2)", border: "1px solid var(--ae-border-bright)", padding: "28px 32px", maxWidth: 420, width: "100%", position: "relative" }} className="pixel-border">
            <button onClick={() => { setCreatingTemplateId(null); setStationName(""); }} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)" }}>
              <X size={14} />
            </button>
            <div style={{ ...pixel, fontSize: 9, color: "var(--ae-text)", letterSpacing: "0.04em", lineHeight: 1.8, marginBottom: 8 }}>DEPLOY STATION</div>
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

      {/* ── Hire Agent Modal ── */}
      <AnimatePresence>
        {hireTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "absolute", inset: 0, background: "rgba(10,11,15,0.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              style={{
                background: "var(--ae-surface-2)",
                border: `1px solid ${RARITY_COLORS[hireTarget.rarity]}66`,
                boxShadow: RARITY_GLOW[hireTarget.rarity],
                padding: "28px 32px", maxWidth: 460, width: "100%", position: "relative",
              }}
            >
              <button onClick={() => { setHireTarget(null); setHireStationId(null); }} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)" }}>
                <X size={14} />
              </button>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 56, height: 56,
                  border: `2px solid ${RARITY_COLORS[hireTarget.rarity]}66`,
                  background: `${ROLE_COLORS[hireTarget.role] ?? "#4d7fff"}12`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <PixelAvatar seed={hireTarget.avatarSeed} role={hireTarget.role} size={44} />
                </div>
                <div>
                  <div style={{ ...pixel, fontSize: 10, color: ROLE_COLORS[hireTarget.role] ?? "#fff", letterSpacing: "0.04em" }}>{hireTarget.agentName}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
                    <span style={{ ...mono, fontSize: 7, color: RARITY_COLORS[hireTarget.rarity], border: `1px solid ${RARITY_COLORS[hireTarget.rarity]}55`, padding: "1px 6px" }}>
                      {RARITY_LABEL[hireTarget.rarity]}
                    </span>
                    <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", border: "1px solid var(--ae-border)", padding: "1px 6px" }}>
                      {hireTarget.role.toUpperCase()} · LVL {hireTarget.level}
                    </span>
                  </div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{ ...pixel, fontSize: 9, color: "#ffb84d" }}>{hireTarget.price.toLocaleString()}</div>
                  <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)" }}>$CTRL</div>
                </div>
              </div>

              <p style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", marginBottom: 14, lineHeight: 1.6 }}>{hireTarget.description}</p>

              {/* Skills */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 18 }}>
                {hireTarget.skills.map(s => (
                  <span key={s} style={{ ...mono, fontSize: 7, padding: "2px 7px", border: `1px solid ${ROLE_COLORS[hireTarget.role] ?? "#4d7fff"}44`, color: ROLE_COLORS[hireTarget.role] ?? "#4d7fff", background: `${ROLE_COLORS[hireTarget.role] ?? "#4d7fff"}10` }}>
                    {s}
                  </span>
                ))}
              </div>

              {/* Station select */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>ASSIGN TO STATION</label>
                <select
                  value={hireStationId ?? ""}
                  onChange={e => setHireStationId(Number(e.target.value))}
                  style={{ width: "100%", background: "var(--ae-bg)", border: "1px solid var(--ae-border)", padding: "8px 10px", ...mono, fontSize: 11, color: "var(--ae-text)", outline: "none", cursor: "pointer" }}
                >
                  <option value="">— select station —</option>
                  {(stations ?? []).map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              {/* Beta note */}
              <div style={{ ...mono, fontSize: 8, color: "var(--ae-dim)", padding: "6px 10px", border: "1px solid var(--ae-border)", background: "rgba(255,184,77,0.05)", marginBottom: 16 }}>
                ⚡ BETA: Hire is free during pre-listing. $CTRL deduction activates at TGE.
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="pixel-btn" onClick={() => { setHireTarget(null); setHireStationId(null); }} style={{ flex: 1 }}>CANCEL</button>
                <button
                  className="pixel-btn primary"
                  onClick={handleHire}
                  disabled={!hireStationId || hiring}
                  style={{
                    flex: 2, opacity: (!hireStationId || hiring) ? 0.5 : 1,
                    borderColor: RARITY_COLORS[hireTarget.rarity],
                    color: RARITY_COLORS[hireTarget.rarity],
                    background: `${RARITY_COLORS[hireTarget.rarity]}15`,
                  }}
                >
                  {hiring ? "HIRING..." : `[HIRE ${hireTarget.agentName}]`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Templates Tab ────────────────────────────────────────────────────────────
function TemplatesTab({
  filter, setFilter, search, setSearch,
  filteredTemplates, setCreatingTemplateId,
}: {
  filter: string; setFilter: (f: string) => void;
  search: string; setSearch: (s: string) => void;
  filteredTemplates: ReturnType<typeof useListTemplates>["data"] extends (infer T)[] | undefined ? T[] : never[];
  setCreatingTemplateId: (id: number) => void;
}) {
  return (
    <>
      {/* Filters */}
      <div style={{ flexShrink: 0, padding: "10px 24px", borderBottom: "1px solid var(--ae-border)", background: "rgba(0,0,0,0.2)", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ae-muted)", fontSize: 12 }}>🔍</span>
          <input type="text" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", background: "var(--ae-surface", border: "1px solid var(--ae-border)", padding: "6px 10px 6px 28px", ...mono, fontSize: 11, color: "var(--ae-text)", outline: "none", transition: "border-color 0.15s" }}
            onFocus={e => (e.target.style.borderColor = "var(--ae-cyan)")}
            onBlur={e => (e.target.style.borderColor = "var(--ae-border)")}
          />
        </div>
        <div style={{ display: "flex", gap: 0, border: "1px solid var(--ae-border)" }}>
          {CATEGORIES.map((c, i) => (
            <button key={c} onClick={() => setFilter(c)} style={{
              ...mono, fontSize: 9, padding: "5px 14px",
              borderRight: i < CATEGORIES.length - 1 ? "1px solid var(--ae-border)" : "none",
              background: filter === c ? "var(--ae-cyan)" : "transparent",
              color: filter === c ? "#0a0b0f" : "var(--ae-muted)",
              cursor: "pointer", letterSpacing: "0.06em", transition: "all 0.15s",
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {(filteredTemplates ?? []).map((t, i) => {
            const catColor = getCatColor(t.category);
            const icon = TEMPLATE_ICONS[t.category?.toUpperCase()] ?? TEMPLATE_ICONS.DEFAULT;
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                style={{ background: "var(--ae-surface)", border: `1px solid ${catColor}44`, display: "flex", flexDirection: "column", position: "relative", cursor: "default", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = catColor; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 14px ${catColor}30`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${catColor}44`; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `2px solid ${catColor}`, borderLeft: `2px solid ${catColor}` }} />
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderBottom: `2px solid ${catColor}`, borderRight: `2px solid ${catColor}` }} />
                <div style={{ height: 80, background: `${catColor}10`, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${catColor}30`, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  <div style={{ width: 52, height: 52, background: `${catColor}20`, border: `1px solid ${catColor}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: `0 0 16px ${catColor}40`, position: "relative", zIndex: 1 }}>
                    {icon}
                  </div>
                </div>
                <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...mono, fontSize: 7, padding: "1px 6px", background: `${catColor}18`, border: `1px solid ${catColor}50`, color: catColor, letterSpacing: "0.1em", display: "inline-block", width: "fit-content" }}>{t.category?.toUpperCase()}</span>
                  <div style={{ ...pixel, fontSize: 7, color: catColor, letterSpacing: "0.04em", lineHeight: 1.6, textShadow: `0 0 8px ${catColor}60` }}>{t.name.toUpperCase()}</div>
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
                  <button className="pixel-btn primary" onClick={() => setCreatingTemplateId(t.id)}
                    style={{ width: "100%", fontSize: 9, padding: "7px", letterSpacing: "0.06em", background: `${catColor}18`, borderColor: catColor, color: catColor }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${catColor}35`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${catColor}18`; }}
                  >[USE TEMPLATE]</button>
                </div>
              </motion.div>
            );
          })}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (filteredTemplates ?? []).length * 0.06 }}
            style={{ border: "1px dashed var(--ae-border-bright)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, minHeight: 180, cursor: "pointer", background: "rgba(0,0,0,0.1)", transition: "all 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ae-cyan)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ae-border-bright)"; }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ ...pixel, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.04em", lineHeight: 1.8 }}>✦ Create &amp; Sell<br />Your Template</div>
            </div>
          </motion.div>
          {(filteredTemplates ?? []).length === 0 && (
            <div style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", padding: "40px 0", textAlign: "center", gridColumn: "1/-1" }}>NO TEMPLATES FOUND</div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Agents Tab ───────────────────────────────────────────────────────────────
function AgentsTab({
  roleFilter, setRoleFilter, rarityFilter, setRarityFilter,
  agentSearch, setAgentSearch, filteredAgents, loading, setHireTarget,
}: {
  roleFilter: string; setRoleFilter: (r: string) => void;
  rarityFilter: string; setRarityFilter: (r: string) => void;
  agentSearch: string; setAgentSearch: (s: string) => void;
  filteredAgents: MarketplaceListing[];
  loading: boolean;
  setHireTarget: (a: MarketplaceListing) => void;
}) {
  return (
    <>
      {/* Filters */}
      <div style={{ flexShrink: 0, padding: "10px 24px", borderBottom: "1px solid var(--ae-border)", background: "rgba(0,0,0,0.2)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", minWidth: 160 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ae-muted)", fontSize: 12 }}>🔍</span>
          <input type="text" placeholder="Search agents..." value={agentSearch} onChange={e => setAgentSearch(e.target.value)}
            style={{ width: "100%", background: "var(--ae-surface)", border: "1px solid var(--ae-border)", padding: "6px 10px 6px 28px", ...mono, fontSize: 11, color: "var(--ae-text)", outline: "none", transition: "border-color 0.15s" }}
            onFocus={e => (e.target.style.borderColor = "var(--ae-cyan)")}
            onBlur={e => (e.target.style.borderColor = "var(--ae-border)")}
          />
        </div>

        {/* Role filter */}
        <div style={{ display: "flex", gap: 0, border: "1px solid var(--ae-border)" }}>
          {ROLE_FILTER_LIST.map((r, i) => (
            <button key={r} onClick={() => setRoleFilter(r)} style={{
              ...mono, fontSize: 8, padding: "5px 10px", cursor: "pointer",
              borderRight: i < ROLE_FILTER_LIST.length - 1 ? "1px solid var(--ae-border)" : "none",
              background: roleFilter === r ? (ROLE_COLORS[r] ?? "var(--ae-cyan)") : "transparent",
              color: roleFilter === r ? "#0a0b0f" : (r === "All" ? "var(--ae-muted)" : (ROLE_COLORS[r] ?? "var(--ae-muted)")),
              letterSpacing: "0.04em", transition: "all 0.15s",
            }}>{r === "All" ? "ALL" : r.toUpperCase().slice(0, 4)}</button>
          ))}
        </div>

        {/* Rarity filter */}
        <div style={{ display: "flex", gap: 0, border: "1px solid var(--ae-border)" }}>
          {RARITY_FILTER_LIST.map((r, i) => (
            <button key={r} onClick={() => setRarityFilter(r)} style={{
              ...mono, fontSize: 8, padding: "5px 10px", cursor: "pointer",
              borderRight: i < RARITY_FILTER_LIST.length - 1 ? "1px solid var(--ae-border)" : "none",
              background: rarityFilter === r ? (RARITY_COLORS[r] ?? "var(--ae-cyan)") : "transparent",
              color: rarityFilter === r ? "#0a0b0f" : (r === "All" ? "var(--ae-muted)" : (RARITY_COLORS[r] ?? "var(--ae-muted)")),
              letterSpacing: "0.04em", transition: "all 0.15s",
            }}>{r === "All" ? "ALL" : RARITY_LABEL[r] ?? r.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Agent Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
            <span style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>LOADING AGENTS...</span>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 }}>
            {filteredAgents.map((agent, i) => {
              const roleColor = ROLE_COLORS[agent.role] ?? "#4d7fff";
              const rarityColor = RARITY_COLORS[agent.rarity];
              const isLegendary = agent.rarity === "legendary";
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    background: "var(--ae-surface)",
                    border: `1px solid ${rarityColor}44`,
                    display: "flex", flexDirection: "column",
                    position: "relative", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = rarityColor;
                    (e.currentTarget as HTMLElement).style.boxShadow = RARITY_GLOW[agent.rarity];
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${rarityColor}44`;
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  {/* Corner accents */}
                  <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `2px solid ${rarityColor}`, borderLeft: `2px solid ${rarityColor}` }} />
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderBottom: `2px solid ${rarityColor}`, borderRight: `2px solid ${rarityColor}` }} />

                  {/* Avatar area */}
                  <div style={{
                    height: 90, background: `${roleColor}08`,
                    borderBottom: `1px solid ${rarityColor}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative", overflow: "hidden",
                    flexDirection: "column", gap: 8,
                  }}>
                    {/* Legendary shimmer */}
                    {isLegendary && (
                      <div style={{
                        position: "absolute", inset: 0,
                        backgroundImage: "linear-gradient(45deg, transparent 30%, rgba(255,184,77,0.07) 50%, transparent 70%)",
                        animation: "shimmer 2s infinite",
                      }} />
                    )}
                    <div style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "16px 16px", position: "absolute", inset: 0 }} />
                    <div style={{
                      width: 52, height: 52, border: `2px solid ${rarityColor}66`,
                      background: `${roleColor}12`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: RARITY_GLOW[agent.rarity] !== "none" ? RARITY_GLOW[agent.rarity] : undefined,
                      position: "relative", zIndex: 1,
                    }}>
                      <PixelAvatar seed={agent.avatarSeed} role={agent.role} size={44} />
                    </div>
                    {/* Rarity badge */}
                    <span style={{
                      ...mono, fontSize: 7, color: rarityColor, padding: "1px 8px",
                      border: `1px solid ${rarityColor}55`, background: `${rarityColor}10`,
                      letterSpacing: "0.1em", position: "relative", zIndex: 1,
                    }}>
                      {isLegendary ? "★ " : ""}{RARITY_LABEL[agent.rarity]}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "space-between" }}>
                      <span style={{ ...pixel, fontSize: 7, color: roleColor, letterSpacing: "0.04em", textShadow: `0 0 8px ${roleColor}60` }}>{agent.agentName}</span>
                      <span style={{ ...mono, fontSize: 7, color: "var(--ae-dim)" }}>LVL {agent.level}</span>
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      <span style={{ ...mono, fontSize: 7, color: roleColor, padding: "1px 6px", border: `1px solid ${roleColor}44`, background: `${roleColor}10` }}>{agent.role.toUpperCase()}</span>
                    </div>
                    <div style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", lineHeight: 1.5, marginTop: 2 }}>{agent.description}</div>

                    {/* Skills */}
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                      {agent.skills.slice(0, 3).map(s => (
                        <span key={s} style={{ ...mono, fontSize: 6, padding: "1px 5px", border: `1px solid ${roleColor}30`, color: "var(--ae-muted)", background: `${roleColor}08` }}>{s}</span>
                      ))}
                      {agent.skills.length > 3 && (
                        <span style={{ ...mono, fontSize: 6, color: "var(--ae-dim)", padding: "1px 4px" }}>+{agent.skills.length - 3}</span>
                      )}
                    </div>

                    {/* Stats row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, ...mono, fontSize: 7, color: "var(--ae-dim)" }}>
                        <Star size={7} /> {agent.level * 12}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, ...mono, fontSize: 7, color: "var(--ae-dim)" }}>
                        <Shield size={7} /> {agent.rarity}
                      </span>
                    </div>
                  </div>

                  {/* Price + Hire button */}
                  <div style={{ padding: "8px 12px 12px", borderTop: `1px solid ${rarityColor}20`, display: "flex", alignItems: "center", gap: 8 }}>
                    <div>
                      <div style={{ ...pixel, fontSize: 8, color: "#ffb84d", letterSpacing: "0.04em" }}>{agent.price.toLocaleString()}</div>
                      <div style={{ ...mono, fontSize: 7, color: "var(--ae-dim)" }}>$CTRL</div>
                    </div>
                    <button
                      className="pixel-btn primary"
                      onClick={() => setHireTarget(agent)}
                      style={{
                        flex: 1, fontSize: 8, padding: "7px 6px", letterSpacing: "0.04em",
                        borderColor: rarityColor, color: rarityColor, background: `${rarityColor}15`,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${rarityColor}30`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${rarityColor}15`; }}
                    >
                      [HIRE]
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {filteredAgents.length === 0 && !loading && (
              <div style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", padding: "60px 0", textAlign: "center", gridColumn: "1/-1" }}>
                NO AGENTS AVAILABLE
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
