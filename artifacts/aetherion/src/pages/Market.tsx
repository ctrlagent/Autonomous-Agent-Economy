import { useState } from "react";
import { useListTemplates, useCreateStation } from "@workspace/api-client-react";
import { Search, Users, LayoutGrid, Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const CATEGORIES = ["ALL", "CRYPTO", "ECOMMERCE", "CONTENT", "SAAS"];

const CATEGORY_COLORS: Record<string, string> = {
  CRYPTO:    "var(--ae-amber)",
  ECOMMERCE: "var(--ae-green)",
  CONTENT:   "var(--ae-cyan)",
  SAAS:      "var(--ae-violet)",
  DEFAULT:   "var(--ae-blue)",
};

function getCategoryColor(cat: string): string {
  return CATEGORY_COLORS[cat?.toUpperCase()] ?? CATEGORY_COLORS.DEFAULT;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span style={{ color: "var(--ae-amber)", fontFamily: "'Space Mono', monospace", fontSize: 11 }}>
      {"★".repeat(full)}{"☆".repeat(5 - full)}
      <span style={{ color: "var(--ae-muted)", marginLeft: 5, fontSize: 9 }}>{rating.toFixed(1)}</span>
    </span>
  );
}

export default function Market() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const { data: templates } = useListTemplates();
  const createStation = useCreateStation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [creatingTemplateId, setCreatingTemplateId] = useState<number | null>(null);
  const [stationName, setStationName] = useState("");

  const filteredTemplates = (templates ?? []).filter(t => {
    const matchesCategory = filter === "ALL" || t.category.toUpperCase() === filter;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
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
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: "16px 28px 12px", borderBottom: "1px solid var(--ae-border)" }}>
        <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: "var(--ae-text)", letterSpacing: "0.04em", lineHeight: 1.8 }}>
          STATION MARKET
        </h1>
        <p style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", marginTop: 4 }}>
          Deploy pre-configured organizational structures.
        </p>
      </div>

      {/* Search + Filters */}
      <div style={{ flexShrink: 0, padding: "12px 28px", borderBottom: "1px solid var(--ae-border)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ae-muted)" }} />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "var(--ae-surface)",
              border: "1px solid var(--ae-border)",
              padding: "6px 10px 6px 30px",
              ...mono, fontSize: 11, color: "var(--ae-text)",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={e => (e.target.style.borderColor = "var(--ae-cyan)")}
            onBlur={e => (e.target.style.borderColor = "var(--ae-border)")}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{
                ...mono, fontSize: 9,
                padding: "4px 12px",
                border: `1px solid ${filter === c ? "var(--ae-cyan)" : "var(--ae-border)"}`,
                background: filter === c ? "var(--ae-cyan-dim)" : "transparent",
                color: filter === c ? "var(--ae-cyan)" : "var(--ae-muted)",
                cursor: "pointer",
                letterSpacing: "0.08em",
                transition: "all 0.15s",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Template Cards */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredTemplates.map((template, i) => {
          const catColor = getCategoryColor(template.category);
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                background: "var(--ae-surface)",
                border: "1px solid var(--ae-border)",
                padding: "18px 20px",
                display: "flex",
                gap: 20,
                alignItems: "center",
                transition: "border-color 0.15s, transform 0.12s",
                cursor: "default",
                position: "relative",
              }}
              whileHover={{ borderColor: "var(--ae-border-bright)" } as object}
            >
              {/* Corner accents */}
              <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `2px solid ${catColor}`, borderLeft: `2px solid ${catColor}` }} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderBottom: `2px solid ${catColor}`, borderRight: `2px solid ${catColor}` }} />

              {/* Left: Name + desc */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{
                    ...mono, fontSize: 8,
                    padding: "2px 8px",
                    border: `1px solid ${catColor}55`,
                    background: `${catColor}18`,
                    color: catColor,
                    letterSpacing: "0.1em",
                  }}>
                    {template.category?.toUpperCase()}
                  </span>
                  <StarRating rating={template.rating ?? 4.5} />
                </div>
                <div style={{ ...mono, fontWeight: 700, fontSize: 13, color: "var(--ae-text)", marginBottom: 5 }}>{template.name}</div>
                <div style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", lineHeight: 1.5 }}>{template.description}</div>
              </div>

              {/* Center: Stats */}
              <div style={{
                flexShrink: 0,
                display: "flex",
                gap: 20,
                borderLeft: "1px solid var(--ae-border)",
                borderRight: "1px solid var(--ae-border)",
                padding: "0 20px",
              }}>
                {[
                  { Icon: Users,      value: template.agentCount, label: "AGENTS", color: "var(--ae-cyan)"   },
                  { Icon: LayoutGrid, value: template.roomCount,  label: "ROOMS",  color: "var(--ae-violet)" },
                  { Icon: Download,   value: template.usageCount, label: "USED",   color: "var(--ae-green)"  },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 60 }}>
                    <s.Icon size={16} color={s.color} />
                    <span style={{ ...mono, fontSize: 11, fontWeight: 700, color: "var(--ae-text)" }}>{s.value}</span>
                    <span style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.08em" }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Right: CTA */}
              <div style={{ flexShrink: 0 }}>
                <button
                  className="pixel-btn primary"
                  onClick={() => setCreatingTemplateId(template.id)}
                  style={{ fontSize: 10, padding: "7px 16px", letterSpacing: "0.05em" }}
                >
                  USE TEMPLATE
                </button>
              </div>
            </motion.div>
          );
        })}
        {filteredTemplates.length === 0 && (
          <div style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", padding: "40px 0", textAlign: "center" }}>
            NO TEMPLATES FOUND
          </div>
        )}
      </div>

      {/* Deploy Modal */}
      {creatingTemplateId && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10,11,15,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          padding: 24,
        }}>
          <div style={{
            background: "var(--ae-surface-2)",
            border: "1px solid var(--ae-border-bright)",
            padding: "28px 32px",
            maxWidth: 420,
            width: "100%",
            position: "relative",
          }} className="pixel-border">
            <button
              onClick={() => { setCreatingTemplateId(null); setStationName(""); }}
              style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)" }}
            >
              <X size={14} />
            </button>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "var(--ae-text)", letterSpacing: "0.04em", lineHeight: 1.8, marginBottom: 8 }}>
              DEPLOY STATION
            </div>
            <p style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", marginBottom: 20 }}>
              Enter a designation for your new station.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>
                STATION DESIGNATION
              </label>
              <input
                type="text"
                value={stationName}
                onChange={e => setStationName(e.target.value)}
                autoFocus
                placeholder="e.g. ALPHA PRIME"
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                style={{
                  width: "100%",
                  background: "var(--ae-bg)",
                  border: "1px solid var(--ae-border)",
                  padding: "9px 12px",
                  ...mono, fontSize: 12,
                  color: "var(--ae-text)",
                  outline: "none",
                  letterSpacing: "0.06em",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.target.style.borderColor = "var(--ae-cyan)")}
                onBlur={e => (e.target.style.borderColor = "var(--ae-border)")}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="pixel-btn"
                onClick={() => { setCreatingTemplateId(null); setStationName(""); }}
                style={{ flex: 1 }}
              >
                CANCEL
              </button>
              <button
                className="pixel-btn primary"
                onClick={handleCreate}
                disabled={!stationName.trim() || createStation.isPending}
                style={{ flex: 1, opacity: (!stationName.trim() || createStation.isPending) ? 0.5 : 1 }}
              >
                {createStation.isPending ? "DEPLOYING..." : "DEPLOY"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
