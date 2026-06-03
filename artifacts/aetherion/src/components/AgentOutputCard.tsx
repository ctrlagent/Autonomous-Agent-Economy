import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_HEX: Record<string, string> = {
  research: "#4df0d8",
  strategy: "#9b6dff",
  builder:  "#4d7fff",
  content:  "#ffb84d",
  growth:   "#4dff9b",
  analytics:"#ff4d6d",
};

const TYPE_LABELS: Record<string, string> = {
  content:    "CONTENT_PKG",
  research:   "RESEARCH_RPT",
  strategy:   "STRATEGY_DOC",
  deployment: "DEPLOY_LOG",
  growth:     "EXPERIMENT",
  analytics:  "ANALYTICS_RPT",
  ai_report:  "AI_OUTPUT",
};

const TYPE_COLORS: Record<string, string> = {
  content:    "#ffb84d",
  research:   "#4df0d8",
  strategy:   "#9b6dff",
  deployment: "#4d7fff",
  growth:     "#4dff9b",
  analytics:  "#ff4d6d",
  ai_report:  "#c084fc",
};

const mono: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };

function formatTime(ts: string) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

// ─── Type-specific renderers ──────────────────────────────────────────────────

function ContentOutputView({ data }: { data: {
  platforms: { name: string; post: string; estLikes?: number; estImpressions?: string }[];
  hashtags: string[];
  schedule: string[];
  tone: string;
  estimatedReach: string;
  engagementScore: number;
}}) {
  const [activePlatform, setActivePlatform] = useState(0);
  const platformIcons: Record<string, React.ReactNode> = {
    "Twitter / X": <span style={{ fontSize: 9, fontWeight: "bold" }}>𝕏</span>,
    "LinkedIn":    <span style={{ fontSize: 9, fontWeight: "bold" }}>in</span>,
    "Instagram":   <span style={{ fontSize: 9 }}>◉</span>,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Platform tabs */}
      <div style={{ display: "flex", gap: 4 }}>
        {data.platforms.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActivePlatform(i)}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "3px 8px", cursor: "pointer", border: "1px solid",
              background: activePlatform === i ? "rgba(255,184,77,0.12)" : "transparent",
              borderColor: activePlatform === i ? "#ffb84d60" : "var(--ae-border)",
              color: activePlatform === i ? "#ffb84d" : "var(--ae-muted)",
              ...mono, fontSize: 7, letterSpacing: "0.08em",
            }}
          >
            {platformIcons[p.name]} {p.name.toUpperCase().replace(" / X","").replace("TWITTER","TWITTER/X")}
          </button>
        ))}
      </div>

      {/* Post content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePlatform}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            background: "rgba(0,0,0,0.35)",
            border: "1px solid var(--ae-border)",
            padding: "10px 12px",
          }}
        >
          <p style={{ ...mono, fontSize: 8, color: "var(--ae-text)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
            {data.platforms[activePlatform].post}
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--ae-border)" }}>
            {data.platforms[activePlatform].estLikes !== undefined && (
              <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)" }}>
                ♡ {data.platforms[activePlatform].estLikes?.toLocaleString()} EST. LIKES
              </span>
            )}
            {data.platforms[activePlatform].estImpressions && (
              <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)" }}>
                ↑ {data.platforms[activePlatform].estImpressions} IMPRESSIONS
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Hashtags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {data.hashtags.map(h => (
          <span key={h} style={{ ...mono, fontSize: 7, color: "#ffb84d", background: "rgba(255,184,77,0.08)", border: "1px solid rgba(255,184,77,0.2)", padding: "1px 6px" }}>
            {h}
          </span>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 14 }}>
        {[
          { label: "EST. REACH", value: data.estimatedReach },
          { label: "ENGAGEMENT", value: `${data.engagementScore}/100` },
          { label: "TONE", value: data.tone },
        ].map(s => (
          <div key={s.label}>
            <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>{s.label}</div>
            <div style={{ ...mono, fontSize: 8, color: "#ffb84d", marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResearchOutputView({ data }: { data: {
  summary: string;
  keyFindings: string[];
  dataPoints: number;
  sources: number;
  confidence: number;
  recommendation: string;
}}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ ...mono, fontSize: 8, color: "var(--ae-dim)", lineHeight: 1.65, margin: 0 }}>{data.summary}</p>
      <div>
        <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>KEY_FINDINGS://</div>
        {data.keyFindings.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", ...mono, fontSize: 8, color: "var(--ae-text)", lineHeight: 1.6, marginBottom: 4 }}>
            <span style={{ color: "#4df0d8", flexShrink: 0 }}>▶</span>
            <span>{f}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, paddingTop: 8, borderTop: "1px solid var(--ae-border)" }}>
        {[
          { label: "DATA_PTS", value: data.dataPoints.toLocaleString() },
          { label: "SOURCES", value: data.sources },
          { label: "CONFIDENCE", value: `${data.confidence}%` },
        ].map(s => (
          <div key={s.label}>
            <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>{s.label}</div>
            <div style={{ ...mono, fontSize: 9, color: "#4df0d8", marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(77,240,216,0.06)", border: "1px solid rgba(77,240,216,0.2)", padding: "8px 10px" }}>
        <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginBottom: 3 }}>RECOMMENDATION</div>
        <div style={{ ...mono, fontSize: 8, color: "var(--ae-text)" }}>{data.recommendation}</div>
      </div>
    </div>
  );
}

function StrategyOutputView({ data }: { data: {
  objective: string;
  tactics: string[];
  kpis: { metric: string; target: string; current: string }[];
  timeline: string;
  riskLevel: string;
}}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ background: "rgba(155,109,255,0.07)", border: "1px solid rgba(155,109,255,0.25)", padding: "8px 10px" }}>
        <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginBottom: 3 }}>OBJECTIVE</div>
        <div style={{ ...mono, fontSize: 8, color: "var(--ae-text)", lineHeight: 1.6 }}>{data.objective}</div>
      </div>
      <div>
        <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>TACTICS://</div>
        {data.tactics.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", ...mono, fontSize: 8, color: "var(--ae-text)", lineHeight: 1.6, marginBottom: 4 }}>
            <span style={{ color: "#9b6dff", flexShrink: 0 }}>◆</span>
            <span>{t}</span>
          </div>
        ))}
      </div>
      <div>
        <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>KPI_TARGETS://</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {data.kpis.map(k => (
            <div key={k.metric} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", background: "var(--ae-surface)", border: "1px solid var(--ae-border)" }}>
              <span style={{ ...mono, fontSize: 8, color: "var(--ae-dim)" }}>{k.metric}</span>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)" }}>NOW: {k.current}</span>
                <span style={{ ...mono, fontSize: 7, color: "#9b6dff" }}>TARGET: {k.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        <div>
          <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>TIMELINE</div>
          <div style={{ ...mono, fontSize: 9, color: "#9b6dff", marginTop: 2 }}>{data.timeline}</div>
        </div>
        <div>
          <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>RISK</div>
          <div style={{ ...mono, fontSize: 9, color: "#9b6dff", marginTop: 2 }}>{data.riskLevel}</div>
        </div>
      </div>
    </div>
  );
}

function DeploymentOutputView({ data }: { data: {
  module: string;
  version: string;
  buildTime: string;
  bundleSize: string;
  testCoverage: string;
  uptime: string;
  endpoints: number;
  imageUrl: string;
}}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ overflow: "hidden", border: "1px solid var(--ae-border)", position: "relative" }}>
        <img
          src={data.imageUrl}
          alt="deployment visual"
          style={{ width: "100%", height: 160, objectFit: "cover", display: "block", filter: "saturate(0.7) brightness(0.85)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 50%, rgba(10,10,18,0.9))" }} />
        <div style={{ position: "absolute", bottom: 8, left: 10 }}>
          <span style={{ ...mono, fontSize: 8, color: "#4d7fff" }}>MODULE: {data.module.toUpperCase()}</span>
          <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginLeft: 8 }}>v{data.version}</span>
        </div>
        <div style={{ position: "absolute", top: 8, right: 10, background: "rgba(77,255,155,0.15)", border: "1px solid rgba(77,255,155,0.4)", padding: "2px 6px" }}>
          <span style={{ ...mono, fontSize: 7, color: "#4dff9b" }}>● DEPLOYED</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {[
          { label: "BUILD TIME", value: data.buildTime },
          { label: "BUNDLE SIZE", value: data.bundleSize },
          { label: "TEST COV.", value: data.testCoverage },
          { label: "UPTIME", value: data.uptime },
          { label: "ENDPOINTS", value: data.endpoints },
          { label: "STATUS", value: "LIVE" },
        ].map(m => (
          <div key={m.label} style={{ background: "var(--ae-surface)", border: "1px solid var(--ae-border)", padding: "6px 8px" }}>
            <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", letterSpacing: "0.08em" }}>{m.label}</div>
            <div style={{ ...mono, fontSize: 9, color: "#4d7fff", marginTop: 2 }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GrowthOutputView({ data }: { data: {
  experimentName: string;
  hypothesis: string;
  control: { label: string; rate: string };
  variant: { label: string; rate: string };
  uplift: string;
  significance: string;
  recommendation: string;
}}) {
  const controlNum = parseFloat(data.control.rate);
  const variantNum = parseFloat(data.variant.rate);
  const maxRate = Math.max(controlNum, variantNum) || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ background: "rgba(77,255,155,0.06)", border: "1px solid rgba(77,255,155,0.2)", padding: "8px 10px" }}>
        <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginBottom: 3 }}>HYPOTHESIS</div>
        <div style={{ ...mono, fontSize: 8, color: "var(--ae-text)", lineHeight: 1.6 }}>{data.hypothesis}</div>
      </div>
      <div>
        <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 8 }}>RESULTS://</div>
        {[data.control, data.variant].map((v, i) => (
          <div key={v.label} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ ...mono, fontSize: 7, color: i === 1 ? "#4dff9b" : "var(--ae-muted)" }}>{v.label.toUpperCase()}</span>
              <span style={{ ...mono, fontSize: 8, color: i === 1 ? "#4dff9b" : "var(--ae-dim)" }}>{v.rate}</span>
            </div>
            <div style={{ height: 8, background: "var(--ae-bg)", border: "1px solid var(--ae-border)" }}>
              <div style={{
                height: "100%",
                width: `${(parseFloat(v.rate) / maxRate) * 100}%`,
                background: i === 1 ? "#4dff9b" : "var(--ae-dim)",
                boxShadow: i === 1 ? "0 0 8px #4dff9b80" : "none",
                transition: "width 1s ease",
              }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, paddingTop: 8, borderTop: "1px solid var(--ae-border)" }}>
        {[
          { label: "UPLIFT", value: data.uplift, color: "#4dff9b" },
          { label: "CONFIDENCE", value: data.significance, color: "#4dff9b" },
        ].map(s => (
          <div key={s.label}>
            <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>{s.label}</div>
            <div style={{ ...mono, fontSize: 11, color: s.color, marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ ...mono, fontSize: 8, color: "var(--ae-text)", background: "rgba(77,255,155,0.08)", border: "1px solid rgba(77,255,155,0.2)", padding: "6px 10px" }}>
        → {data.recommendation}
      </div>
    </div>
  );
}

function AnalyticsOutputView({ data }: { data: {
  reportTitle: string;
  period: string;
  metrics: { name: string; value: string; change: string; positive: boolean }[];
  insight: string;
}}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>PERIOD: {data.period}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {data.metrics.map(m => (
          <div key={m.name} style={{ background: "var(--ae-surface)", border: "1px solid var(--ae-border)", padding: "8px 10px" }}>
            <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", letterSpacing: "0.08em", marginBottom: 3 }}>{m.name.toUpperCase()}</div>
            <div style={{ ...mono, fontSize: 11, color: "var(--ae-text)", marginBottom: 2 }}>{m.value}</div>
            <div style={{ ...mono, fontSize: 7, color: m.positive ? "#4dff9b" : "#ff4d6d" }}>{m.change} vs prior</div>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.2)", padding: "8px 10px" }}>
        <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginBottom: 3 }}>KEY_INSIGHT</div>
        <div style={{ ...mono, fontSize: 8, color: "var(--ae-text)", lineHeight: 1.6 }}>{data.insight}</div>
      </div>
    </div>
  );
}

// ─── AI Report renderer (real AI output) ──────────────────────────────────────

function AiReportView({ data }: { data: { markdown: string; provider: string; model: string } }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(data.markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }

  // Simple markdown renderer: ##, ###, **, -, numbered lists, ``` blocks
  function renderMarkdown(text: string): React.ReactNode[] {
    const lines = text.split("\n");
    const nodes: React.ReactNode[] = [];
    let inCode = false;
    let codeLines: string[] = [];
    let keyIdx = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const k = keyIdx++;

      if (line.startsWith("```")) {
        if (inCode) {
          nodes.push(
            <pre key={k} style={{
              background: "rgba(0,0,0,0.5)", border: "1px solid var(--ae-border)",
              padding: "10px 12px", overflowX: "auto", margin: "8px 0",
            }}>
              <code style={{ ...mono, fontSize: 7, color: "#c084fc", lineHeight: 1.7 }}>
                {codeLines.join("\n")}
              </code>
            </pre>
          );
          codeLines = [];
          inCode = false;
        } else {
          inCode = true;
        }
        continue;
      }

      if (inCode) { codeLines.push(line); continue; }

      if (!line.trim()) {
        nodes.push(<div key={k} style={{ height: 6 }} />);
        continue;
      }

      if (line.startsWith("## ")) {
        nodes.push(
          <div key={k} style={{ ...mono, fontSize: 8, color: "#c084fc", letterSpacing: "0.08em", fontWeight: 700, marginTop: 14, marginBottom: 6, borderBottom: "1px solid rgba(192,132,252,0.2)", paddingBottom: 4 }}>
            {line.slice(3)}
          </div>
        );
        continue;
      }

      if (line.startsWith("### ")) {
        nodes.push(
          <div key={k} style={{ ...mono, fontSize: 7, color: "var(--ae-cyan)", letterSpacing: "0.08em", fontWeight: 700, marginTop: 10, marginBottom: 4 }}>
            {line.slice(4)}
          </div>
        );
        continue;
      }

      if (line.startsWith("| ")) {
        const cells = line.split("|").filter(c => c.trim()).map(c => c.trim());
        const isSep = cells.every(c => /^[-: ]+$/.test(c));
        if (isSep) continue;
        nodes.push(
          <div key={k} style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--ae-border)" }}>
            {cells.map((cell, ci) => (
              <div key={ci} style={{ flex: 1, padding: "3px 8px", ...mono, fontSize: 7, color: ci === 0 ? "var(--ae-text)" : "var(--ae-muted)", borderRight: ci < cells.length - 1 ? "1px solid var(--ae-border)" : "none" }}>
                {cell}
              </div>
            ))}
          </div>
        );
        continue;
      }

      // Bold inline: **text**
      const inlineParsed = line.replace(/\*\*(.+?)\*\*/g, "⟦$1⟧");
      const parts = inlineParsed.split(/(⟦.+?⟧)/);
      const rendered = parts.map((part, pi) => {
        if (part.startsWith("⟦") && part.endsWith("⟧")) {
          return <strong key={pi} style={{ color: "var(--ae-text)", fontWeight: 700 }}>{part.slice(1, -1)}</strong>;
        }
        return part;
      });

      if (line.match(/^[-*] /)) {
        nodes.push(
          <div key={k} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 3 }}>
            <span style={{ color: "#c084fc", flexShrink: 0, marginTop: 1 }}>▸</span>
            <span style={{ ...mono, fontSize: 8, color: "var(--ae-dim)", lineHeight: 1.65 }}>{rendered}</span>
          </div>
        );
        continue;
      }

      if (line.match(/^\d+\. /)) {
        const num = line.match(/^(\d+)\. /)?.[1];
        nodes.push(
          <div key={k} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 3 }}>
            <span style={{ color: "#c084fc", flexShrink: 0, ...mono, fontSize: 7 }}>{num}.</span>
            <span style={{ ...mono, fontSize: 8, color: "var(--ae-dim)", lineHeight: 1.65 }}>{rendered}</span>
          </div>
        );
        continue;
      }

      nodes.push(
        <p key={k} style={{ ...mono, fontSize: 8, color: "var(--ae-dim)", lineHeight: 1.7, margin: "0 0 4px 0" }}>
          {rendered}
        </p>
      );
    }

    return nodes;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* AI badge + copy */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Cpu size={10} style={{ color: "#c084fc" }} />
          <span style={{ ...mono, fontSize: 6, color: "#c084fc", letterSpacing: "0.1em" }}>REAL AI OUTPUT · {data.model?.toUpperCase()}</span>
        </div>
        <button
          onClick={handleCopy}
          style={{ background: "none", border: "1px solid var(--ae-border)", cursor: "pointer", padding: "2px 8px", color: copied ? "#4dff9b" : "var(--ae-muted)", display: "flex", alignItems: "center", gap: 4, transition: "color 0.15s" }}
        >
          {copied ? <Check size={9} /> : <Copy size={9} />}
          <span style={{ ...mono, fontSize: 6 }}>{copied ? "COPIED" : "COPY"}</span>
        </button>
      </div>

      {/* Rendered markdown */}
      <div style={{ background: "rgba(192,132,252,0.04)", border: "1px solid rgba(192,132,252,0.15)", padding: "12px 14px" }}>
        {renderMarkdown(data.markdown)}
      </div>
    </div>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────

export interface AgentOutputData {
  id: number;
  agentId: number;
  stationId: number;
  type: string;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  createdAt: string;
  agentName?: string;
  agentRole?: string;
}

export function AgentOutputCard({ output }: { output: AgentOutputData }) {
  const [expanded, setExpanded] = useState(false);
  const typeColor = TYPE_COLORS[output.type] ?? "#fff";
  const roleColor = ROLE_HEX[output.agentRole ?? ""] ?? "#fff";

  let parsed: unknown;
  try { parsed = JSON.parse(output.content); } catch { parsed = null; }

  function renderBody() {
    if (!parsed) return <div style={{ ...mono, fontSize: 8, color: "var(--ae-dim)" }}>NO OUTPUT DATA</div>;
    switch (output.type) {
      case "content":    return <ContentOutputView data={parsed as Parameters<typeof ContentOutputView>[0]["data"]} />;
      case "research":   return <ResearchOutputView data={parsed as Parameters<typeof ResearchOutputView>[0]["data"]} />;
      case "strategy":   return <StrategyOutputView data={parsed as Parameters<typeof StrategyOutputView>[0]["data"]} />;
      case "deployment": return <DeploymentOutputView data={parsed as Parameters<typeof DeploymentOutputView>[0]["data"]} />;
      case "growth":     return <GrowthOutputView data={parsed as Parameters<typeof GrowthOutputView>[0]["data"]} />;
      case "analytics":  return <AnalyticsOutputView data={parsed as Parameters<typeof AnalyticsOutputView>[0]["data"]} />;
      case "ai_report":  return <AiReportView data={parsed as Parameters<typeof AiReportView>[0]["data"]} />;
      default:           return <div style={{ ...mono, fontSize: 8, color: "var(--ae-dim)" }}>UNKNOWN OUTPUT TYPE</div>;
    }
  }

  return (
    <div style={{
      background: "var(--ae-surface)",
      border: `1px solid ${expanded ? typeColor + "40" : "var(--ae-border)"}`,
      transition: "border-color 0.2s",
    }}>
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, textAlign: "left",
        }}
      >
        {/* Type badge */}
        <span style={{
          ...mono, fontSize: 6, letterSpacing: "0.1em", padding: "2px 6px", flexShrink: 0,
          color: typeColor, background: `${typeColor}12`, border: `1px solid ${typeColor}40`,
        }}>
          {TYPE_LABELS[output.type] ?? output.type.toUpperCase()}
        </span>

        {/* Title */}
        <span style={{ ...mono, fontSize: 8, color: "var(--ae-text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {output.title}
        </span>

        {/* Agent name + time */}
        <span style={{ ...mono, fontSize: 7, color: roleColor, flexShrink: 0 }}>{output.agentName}</span>
        <span style={{ ...mono, fontSize: 7, color: "var(--ae-dim)", flexShrink: 0 }}>{formatTime(output.createdAt)}</span>
        {expanded ? <ChevronUp size={10} color="var(--ae-muted)" /> : <ChevronDown size={10} color="var(--ae-muted)" />}
      </button>

      {/* Expanded body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 12px 12px 12px", borderTop: `1px solid ${typeColor}25` }}>
              {renderBody()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
