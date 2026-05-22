import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  BookOpen, Cpu, Database, Globe, Zap, Users, Target, Clock,
  Store, MessageSquare, Settings, ChevronRight, ArrowRight, Shield
} from "lucide-react";

const px = { fontFamily: "'Press Start 2P', monospace" };
const mono = { fontFamily: "'Space Mono', monospace" };

const C = {
  bg: "#0a0b0f", surface: "#0f1118", surface2: "#131620",
  border: "#1e2130", bright: "#2a3050",
  cyan: "#4df0d8", violet: "#9b6dff", blue: "#4d7fff",
  amber: "#ffb84d", green: "#4dff9b", red: "#ff4d6d",
  muted: "#4a5580", dim: "#2a3050", text: "#c0c8e0",
};

const ROLE_COLORS: Record<string, string> = {
  research: C.cyan, strategy: C.violet, builder: C.blue,
  content: C.amber, growth: C.green, analytics: C.red,
};

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 64, scrollMarginTop: 80 }}>
      {children}
    </section>
  );
}

function SectionTitle({ icon: Icon, color, children }: { icon: typeof Zap; color: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
      <Icon size={16} style={{ color, flexShrink: 0 }} />
      <span style={{ ...px, fontSize: 10, color, letterSpacing: "0.08em" }}>{children}</span>
    </div>
  );
}

function Card({ children, color = C.border }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ border: `1px solid ${color}`, background: C.surface, padding: "16px 20px", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
      {children}
    </div>
  );
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      ...mono, fontSize: 7, color, letterSpacing: "0.1em",
      padding: "3px 8px", border: `1px solid ${color}44`, background: `${color}0a`,
      display: "inline-block",
    }}>{children}</span>
  );
}

function ApiEndpoint({ method, path, desc }: { method: string; path: string; desc: string }) {
  const methodColor = method === "GET" ? C.green : method === "POST" ? C.blue : method === "PATCH" ? C.amber : C.red;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ ...px, fontSize: 6, color: methodColor, minWidth: 44, flexShrink: 0, marginTop: 2 }}>{method}</span>
      <span style={{ ...mono, fontSize: 8, color: C.cyan, flex: 1, wordBreak: "break-all" }}>{path}</span>
      <span style={{ ...mono, fontSize: 7, color: C.muted, textAlign: "right", minWidth: 160 }}>{desc}</span>
    </div>
  );
}

const NAV_SECTIONS = [
  { id: "intro",     label: "Introduction" },
  { id: "overview",  label: "Platform Overview" },
  { id: "arch",      label: "Architecture" },
  { id: "stack",     label: "Tech Stack" },
  { id: "pages",     label: "Pages & Routes" },
  { id: "agents",    label: "Agent Roles" },
  { id: "api",       label: "API Reference" },
  { id: "token",     label: "Wallet & Token" },
  { id: "tutorial",  label: "Tutorial" },
  { id: "glossary",  label: "Glossary" },
  { id: "roadmap",   label: "Roadmap" },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState("intro");

  return (
    <div style={{ minHeight: "100dvh", background: C.bg, color: C.text, position: "relative", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Mono:wght@400;700&display=swap');
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${C.bg}; } ::-webkit-scrollbar-thumb { background: ${C.bright}; }
        @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:.85} 96%{opacity:1} }
      `}</style>

      {/* CRT scanlines */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)", animation: "flicker 8s ease-in-out infinite" }} />

      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: `${C.bg}ee`, borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: 0 }}>
        <div style={{ padding: "0 24px", borderRight: `1px solid ${C.border}`, height: 44, display: "flex", alignItems: "center", gap: 10 }}>
          <Zap size={12} color={C.cyan} />
          <span style={{ ...px, fontSize: 8, color: C.cyan, letterSpacing: "0.1em" }}>CTRL</span>
          <span style={{ ...mono, fontSize: 7, color: C.muted, marginLeft: 4 }}>/ DOCS</span>
        </div>
        <div style={{ flex: 1, overflowX: "auto", display: "flex", alignItems: "center", gap: 0, padding: "0 12px" }}>
          {NAV_SECTIONS.map(s => (
            <a key={s.id} href={`#${s.id}`} onClick={() => setActiveSection(s.id)}
              style={{
                ...mono, fontSize: 7, color: activeSection === s.id ? C.cyan : C.muted,
                textDecoration: "none", padding: "0 12px", height: 44, display: "flex", alignItems: "center",
                borderBottom: activeSection === s.id ? `2px solid ${C.cyan}` : "2px solid transparent",
                transition: "color 0.15s", whiteSpace: "nowrap",
              }}
            >{s.label}</a>
          ))}
        </div>
        <Link href="/" style={{ padding: "0 20px", height: 44, display: "flex", alignItems: "center", borderLeft: `1px solid ${C.border}`, textDecoration: "none" }}>
          <span style={{ ...mono, fontSize: 7, color: C.muted }}>← HOME</span>
        </Link>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: "center", marginBottom: 64 }}>
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 3 }}
            style={{ ...mono, fontSize: 8, color: C.cyan, letterSpacing: "0.3em", marginBottom: 20 }}>
            ◈ ◈ ◈ DOCUMENTATION ◈ ◈ ◈
          </motion.div>
          <div style={{ ...px, fontSize: "clamp(22px, 5vw, 38px)", color: C.cyan, letterSpacing: "0.1em", textShadow: `0 0 40px ${C.cyan}66`, marginBottom: 16 }}>CTRL OS</div>
          <div style={{ ...mono, fontSize: 10, color: C.text, marginBottom: 8 }}>Autonomous Agent Economy Operating System</div>
          <div style={{ ...mono, fontSize: 8, color: C.muted, maxWidth: 560, margin: "0 auto" }}>
            Complete reference for building, running, and scaling businesses with AI agent networks on Base chain.
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            {[["v1.0", C.cyan], ["Base Chain", "#1652f0"], ["React + Vite", C.violet], ["PostgreSQL", C.green]].map(([label, color]) => (
              <Tag key={label} color={color}>{label}</Tag>
            ))}
          </div>
        </motion.div>

        {/* ── INTRODUCTION ──────────────────────────────── */}
        <Section id="intro">
          <SectionTitle icon={BookOpen} color={C.cyan}>01 — Introduction</SectionTitle>
          <Card color={`${C.cyan}44`}>
            <div style={{ ...mono, fontSize: 9, color: C.cyan, marginBottom: 12 }}>What is CTRL?</div>
            <p style={{ ...mono, fontSize: 8, color: C.text, lineHeight: 2, marginBottom: 16 }}>
              CTRL is an <span style={{ color: C.cyan }}>Autonomous Agent Economy OS</span> — a dashboard for building, running, and scaling businesses using networks of AI agents. It provides a pixel-art, sci-fi interface that makes the complexity of multi-agent AI management feel like commanding a space station crew.
            </p>
            <p style={{ ...mono, fontSize: 8, color: C.muted, lineHeight: 2, marginBottom: 16 }}>
              Users become <span style={{ color: C.violet }}>Commanders</span> who own <span style={{ color: C.amber }}>Space Stations</span> (businesses) staffed by specialized AI <span style={{ color: C.green }}>Crew agents</span>. Each agent has a role, tracks tasks, earns XP, and contributes to station revenue — all visualized in a 2D pixel dungeon rendered with Phaser 3.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 20 }}>
              {[
                { icon: "🏴", title: "Commander", desc: "You — the business operator directing AI agents" },
                { icon: "🛸", title: "Space Station", desc: "Your business hub with rooms for each team" },
                { icon: "🤖", title: "Crew Agents", desc: "Specialized AI workers completing tasks 24/7" },
                { icon: "💎", title: "$CTRL Token", desc: "Native token on Base chain for platform access" },
              ].map(item => (
                <div key={item.title} style={{ padding: "12px", background: C.surface2, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ ...px, fontSize: 7, color: C.text, marginBottom: 6 }}>{item.title}</div>
                  <div style={{ ...mono, fontSize: 7, color: C.muted, lineHeight: 1.8 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* ── OVERVIEW ──────────────────────────────────── */}
        <Section id="overview">
          <SectionTitle icon={Globe} color={C.violet}>02 — Platform Overview</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { title: "STATION DASHBOARD", color: C.cyan, icon: "🗺️", desc: "Phaser 3 animated 2D pixel dungeon showing your live agent crew in their assigned rooms. Click agents to inspect details, click rooms to see assignments." },
              { title: "CREW MANAGEMENT", color: C.violet, icon: "👥", desc: "Full agent roster with role filters, XP bars, status indicators, task counts, and one-click level upgrades. Each agent is tracked individually in the database." },
              { title: "MISSION BOARD", color: C.amber, icon: "🎯", desc: "Database-backed mission log with progress tracking. Missions auto-update from platform activity. Complete goals to earn XP and station upgrades." },
              { title: "TIMELINE", color: C.green, icon: "📡", desc: "Chronological feed of all agent activity. Charts show events per hour, revenue 24h curve, and activity heatmap — all derived from real database records." },
              { title: "MARKET", color: C.blue, icon: "🏪", desc: "Station template marketplace. Browse business templates by category (SaaS, E-commerce, Agency, etc.) and deploy them to your station with a single action." },
              { title: "SHIP COMMS", color: C.red, icon: "💬", desc: "AI-powered terminal chat powered by your own OpenAI / Anthropic / Gemini API key. Agents respond in character with context from the current station." },
            ].map(item => (
              <Card key={item.title} color={`${item.color}44`}>
                <div style={{ fontSize: 22, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ ...px, fontSize: 7, color: item.color, letterSpacing: "0.08em", marginBottom: 8 }}>{item.title}</div>
                <div style={{ ...mono, fontSize: 7, color: C.muted, lineHeight: 1.9 }}>{item.desc}</div>
              </Card>
            ))}
          </div>
        </Section>

        {/* ── ARCHITECTURE DIAGRAM ──────────────────────── */}
        <Section id="arch">
          <SectionTitle icon={Cpu} color={C.amber}>03 — System Architecture</SectionTitle>

          {/* Flow diagram */}
          <Card color={`${C.amber}44`}>
            <div style={{ ...mono, fontSize: 8, color: C.amber, marginBottom: 20 }}>Data & Control Flow</div>
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 600, position: "relative" }}>

                {/* Layer: User */}
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 24px", border: `1px solid ${C.cyan}`, background: `${C.cyan}0a` }}>
                    <span style={{ fontSize: 14 }}>🏴</span>
                    <span style={{ ...px, fontSize: 7, color: C.cyan }}>COMMANDER (User)</span>
                  </div>
                </div>
                <div style={{ textAlign: "center", ...mono, fontSize: 10, color: C.dim, marginBottom: 8 }}>↓ &nbsp; Beta Access / $CTRL Token Gate</div>

                {/* Layer: Frontend */}
                <div style={{ border: `1px solid ${C.violet}55`, padding: "14px", background: `${C.violet}06`, marginBottom: 8 }}>
                  <div style={{ ...px, fontSize: 6, color: C.violet, marginBottom: 10, letterSpacing: "0.1em" }}>REACT + VITE FRONTEND (Port 5000)</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                    {["STATION", "CREW", "MISSIONS", "TIMELINE", "MARKET", "SHIP COMMS", "SETTINGS", "DOCS"].map(p => (
                      <div key={p} style={{ padding: "5px 10px", border: `1px solid ${C.border}`, ...px, fontSize: 5, color: C.muted }}>{p}</div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 8 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ ...mono, fontSize: 9, color: C.dim }}>↓ REST API calls /api/*</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ ...mono, fontSize: 9, color: C.dim }}>↓ wagmi hooks</div>
                  </div>
                </div>

                {/* Layer: Backend + Blockchain side by side */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
                  <div style={{ border: `1px solid ${C.green}55`, padding: "12px", background: `${C.green}06` }}>
                    <div style={{ ...px, fontSize: 6, color: C.green, marginBottom: 8 }}>EXPRESS 5 API (Port 3001)</div>
                    {["/api/stations", "/api/agents", "/api/missions", "/api/activity", "/api/ai/chat"].map(r => (
                      <div key={r} style={{ ...mono, fontSize: 7, color: C.muted, marginBottom: 3 }}>→ {r}</div>
                    ))}
                  </div>
                  <div style={{ border: `1px solid #1652f055`, padding: "12px", background: "#1652f006" }}>
                    <div style={{ ...px, fontSize: 6, color: "#1652f0", marginBottom: 8 }}>BASE CHAIN (EVM)</div>
                    {["Chain ID: 8453", "wagmi v2 + viem", "MetaMask / Coinbase", "$CTRL Token Gate", "Token Balance Check"].map(r => (
                      <div key={r} style={{ ...mono, fontSize: 7, color: C.muted, marginBottom: 3 }}>→ {r}</div>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "center", ...mono, fontSize: 9, color: C.dim, marginBottom: 8 }}>↓ Drizzle ORM queries</div>

                {/* Layer: Database */}
                <div style={{ border: `1px solid ${C.cyan}33`, padding: "12px", background: `${C.cyan}04` }}>
                  <div style={{ ...px, fontSize: 6, color: C.cyan, marginBottom: 8 }}>POSTGRESQL DATABASE</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["stations", "rooms", "agents", "tasks", "missions", "activity", "templates"].map(t => (
                      <div key={t} style={{ ...mono, fontSize: 7, color: C.muted, padding: "3px 8px", border: `1px solid ${C.border}` }}>{t}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div style={{ marginTop: 16 }}>
            <Card color={`${C.blue}44`}>
              <div style={{ ...mono, fontSize: 8, color: C.blue, marginBottom: 12 }}>Monorepo Structure</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                {[
                  { name: "artifacts/aetherion", desc: "React + Vite frontend", color: C.violet },
                  { name: "artifacts/api-server", desc: "Express 5 REST API", color: C.green },
                  { name: "lib/db", desc: "Drizzle ORM + schema", color: C.cyan },
                  { name: "lib/api-spec", desc: "OpenAPI spec + codegen", color: C.amber },
                  { name: "lib/api-client-react", desc: "Generated React hooks", color: C.blue },
                  { name: "lib/api-zod", desc: "Generated Zod schemas", color: C.red },
                ].map(pkg => (
                  <div key={pkg.name} style={{ padding: "8px 12px", border: `1px solid ${C.border}`, background: C.surface2 }}>
                    <div style={{ ...mono, fontSize: 7, color: pkg.color, marginBottom: 4 }}>{pkg.name}</div>
                    <div style={{ ...mono, fontSize: 7, color: C.muted }}>{pkg.desc}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Section>

        {/* ── TECH STACK ──────────────────────────────── */}
        <Section id="stack">
          <SectionTitle icon={Database} color={C.green}>04 — Tech Stack</SectionTitle>
          <div style={{ border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {[
              { layer: "Frontend Framework", tech: "React 18 + Vite 7", detail: "TypeScript, HMR, pnpm workspaces", color: C.violet },
              { layer: "Styling", tech: "Tailwind CSS v4", detail: "@theme block, CSS variables, CRT effects", color: C.cyan },
              { layer: "Animation", tech: "Framer Motion + Phaser 3", detail: "UI transitions + 2D pixel dungeon engine", color: C.amber },
              { layer: "State / Data", tech: "TanStack React Query", detail: "Server state, cache, auto-refetch", color: C.green },
              { layer: "Routing", tech: "Wouter", detail: "Lightweight client-side router (href prop)", color: C.blue },
              { layer: "Fonts", tech: "Press Start 2P + Space Mono", detail: "Pixel headings + monospace body", color: C.muted },
              { layer: "Backend", tech: "Express 5 + esbuild", detail: "REST API, CJS bundle, pino logging", color: C.violet },
              { layer: "Database", tech: "PostgreSQL + Drizzle ORM", detail: "Managed by Replit, drizzle-zod validation", color: C.cyan },
              { layer: "Blockchain", tech: "Base (EVM) — Chain 8453", detail: "wagmi v2 + viem, http() transport", color: "#1652f0" },
              { layer: "Wallets", tech: "MetaMask + Coinbase Wallet", detail: "injected() + coinbaseWallet() connectors", color: "#e2761b" },
              { layer: "AI Engine", tech: "OpenAI / Anthropic / Gemini", detail: "User's own API key, GPT-4o Mini / Claude / Flash", color: C.green },
              { layer: "API Codegen", tech: "Orval + OpenAPI 3.0", detail: "Auto-generates React hooks + Zod schemas", color: C.amber },
            ].map((row, i) => (
              <div key={row.layer} style={{
                display: "grid", gridTemplateColumns: "200px 1fr 1fr",
                borderBottom: `1px solid ${C.border}`,
                background: i % 2 === 0 ? C.surface : C.surface2,
              }}>
                <div style={{ padding: "10px 14px", borderRight: `1px solid ${C.border}` }}>
                  <span style={{ ...mono, fontSize: 7, color: C.muted }}>{row.layer}</span>
                </div>
                <div style={{ padding: "10px 14px", borderRight: `1px solid ${C.border}` }}>
                  <span style={{ ...mono, fontSize: 8, color: row.color, fontWeight: 700 }}>{row.tech}</span>
                </div>
                <div style={{ padding: "10px 14px" }}>
                  <span style={{ ...mono, fontSize: 7, color: C.dim }}>{row.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── PAGES & ROUTES ────────────────────────────── */}
        <Section id="pages">
          <SectionTitle icon={Globe} color={C.blue}>05 — Pages & Routes</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { route: "/", icon: "🌐", label: "MARKETING", color: C.muted, desc: "Public landing page. Full-screen hero, feature highlights, $CTRL tokenomics preview, CTA to enter the app. No auth required." },
              { route: "/docs", icon: "📖", label: "DOCS", color: C.cyan, desc: "This documentation page. Full reference for the platform. No auth required — publicly accessible." },
              { route: "/app ↦ TOKEN GATE", icon: "🔒", label: "TOKEN GATE", color: C.violet, desc: "Portal page. Beta Access button bypasses gate pre-TGE. After TGE: wallet must hold 100,000 $CTRL on Base to enter." },
              { route: "/app", icon: "🏴", label: "STATION", color: C.cyan, desc: "Main dashboard. Phaser 3 pixel dungeon + activity log + detail panel. Select station from dropdown, click agents/rooms for detail." },
              { route: "/app/crew", icon: "👥", label: "CREW", color: C.violet, desc: "Agent roster with role filter tabs. Cards show XP, level, status, task count. Upgrade button PATCHes level+1 to the database." },
              { route: "/app/missions", icon: "🎯", label: "MISSIONS", color: C.amber, desc: "Mission tracker pulling from /api/missions. Progress bars auto-sync with platform activity. Earn XP on completion." },
              { route: "/app/timeline", icon: "📡", label: "TIMELINE", color: C.green, desc: "Activity feed from /api/dashboard/activity. Filter by ALL / AGENTS / REVENUE / ERRORS. Charts: hourly events, revenue 24h, heatmap." },
              { route: "/app/templates", icon: "🏪", label: "MARKET", color: C.blue, desc: "Template marketplace from /api/templates. Filter by category. Deploy modal with 4-step progress animation." },
              { route: "/app/ship-comms", icon: "💬", label: "SHIP COMMS", color: C.red, desc: "AI chat terminal. Reads API key from localStorage, calls /api/ai/chat. Graceful fallback to pre-written responses without a key." },
              { route: "/app/settings", icon: "⚙️", label: "SETTINGS", color: C.muted, desc: "AI Engine config (provider selector, API key, test connection) + Base Network section (wallet status, ETH balance, $CTRL contract address)." },
            ].map(page => (
              <div key={page.route} style={{ display: "flex", gap: 0, border: `1px solid ${C.border}`, background: C.surface }}>
                <div style={{ padding: "12px 14px", borderRight: `1px solid ${C.border}`, minWidth: 200, flexShrink: 0 }}>
                  <div style={{ ...mono, fontSize: 7, color: C.dim, marginBottom: 4 }}>{page.route}</div>
                  <div style={{ ...px, fontSize: 7, color: page.color }}>{page.icon} {page.label}</div>
                </div>
                <div style={{ padding: "12px 16px", ...mono, fontSize: 7, color: C.muted, lineHeight: 1.9 }}>{page.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── AGENT ROLES ──────────────────────────────── */}
        <Section id="agents">
          <SectionTitle icon={Users} color={C.violet}>06 — Agent Roles</SectionTitle>
          <p style={{ ...mono, fontSize: 8, color: C.muted, lineHeight: 2, marginBottom: 20 }}>
            Each agent belongs to one of six specialized roles. Role determines the agent's color in the dungeon, their comm-line color, and the type of tasks they complete.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
            {[
              { role: "RESEARCH",  color: C.cyan,   emoji: "🔬", cssVar: "--ae-cyan",   desc: "Analyzes markets, competitors, and trends. Produces intelligence reports that feed strategy decisions.", tasks: "Market analysis, competitor research, trend reports" },
              { role: "STRATEGY",  color: C.violet, emoji: "♟️", cssVar: "--ae-violet", desc: "Synthesizes research into actionable plans. Sets OKRs, defines roadmaps, and allocates resources.", tasks: "OKR setting, roadmap planning, resource allocation" },
              { role: "BUILDER",   color: C.blue,   emoji: "⚙️", cssVar: "--ae-blue",   desc: "Executes technical work — coding, infrastructure, integrations. The engineering arm of your station.", tasks: "Feature development, API integrations, deployments" },
              { role: "CONTENT",   color: C.amber,  emoji: "✍️", cssVar: "--ae-amber",  desc: "Creates all written and media content. Blog posts, social, ad copy, email sequences, video scripts.", tasks: "Blog posts, ad copy, email sequences, social media" },
              { role: "GROWTH",    color: C.green,  emoji: "📈", cssVar: "--ae-green",  desc: "Drives acquisition and retention. Runs experiments, manages funnels, optimizes conversion metrics.", tasks: "A/B tests, funnel optimization, user acquisition" },
              { role: "ANALYTICS", color: C.red,    emoji: "📊", cssVar: "--ae-red",    desc: "Tracks KPIs, builds dashboards, and surfaces insights. Closes the loop between action and outcome.", tasks: "KPI tracking, dashboard builds, insight reports" },
            ].map(a => (
              <div key={a.role} style={{ border: `1px solid ${a.color}44`, background: C.surface, padding: "16px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: a.color }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{a.emoji}</span>
                  <span style={{ ...px, fontSize: 8, color: a.color }}>{a.role}</span>
                  <span style={{ ...mono, fontSize: 6, color: a.color, marginLeft: "auto", padding: "2px 6px", border: `1px solid ${a.color}44` }}>{a.cssVar}</span>
                </div>
                <p style={{ ...mono, fontSize: 7, color: C.muted, lineHeight: 1.9, marginBottom: 10 }}>{a.desc}</p>
                <div style={{ ...mono, fontSize: 6, color: a.color, lineHeight: 1.8 }}>Tasks: {a.tasks}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── API REFERENCE ────────────────────────────── */}
        <Section id="api">
          <SectionTitle icon={Cpu} color={C.green}>07 — API Reference</SectionTitle>
          <Card color={`${C.green}44`}>
            <div style={{ ...mono, fontSize: 8, color: C.green, marginBottom: 4 }}>Base URL: /api</div>
            <div style={{ ...mono, fontSize: 7, color: C.muted, marginBottom: 16 }}>All endpoints return JSON. Authentication: none (future: JWT). Rate limiting: none (future: per-wallet).</div>

            {[
              { group: "DASHBOARD", color: C.cyan },
              { method: "GET", path: "/api/dashboard/summary", desc: "Platform-wide stats" },
              { method: "GET", path: "/api/dashboard/activity?limit=N", desc: "Recent activity feed" },
              { method: "GET", path: "/api/dashboard/agent-performance", desc: "Agent XP & progress" },
              { group: "STATIONS", color: C.violet },
              { method: "GET", path: "/api/stations", desc: "List all stations" },
              { method: "POST", path: "/api/stations", desc: "Create a station" },
              { method: "PATCH", path: "/api/stations/:id", desc: "Update revenue / name" },
              { method: "GET", path: "/api/stations/:id/rooms", desc: "Rooms in station" },
              { method: "GET", path: "/api/stations/:id/agents", desc: "Agents in station" },
              { group: "AGENTS", color: C.amber },
              { method: "GET", path: "/api/agents/:id", desc: "Agent detail" },
              { method: "PATCH", path: "/api/agents/:id", desc: "Update level / XP / task" },
              { method: "GET", path: "/api/agents/:id/tasks", desc: "Agent task list" },
              { group: "MISSIONS", color: C.green },
              { method: "GET", path: "/api/missions", desc: "All missions" },
              { method: "PATCH", path: "/api/missions/:id", desc: "Update progress / status" },
              { group: "MARKET", color: C.blue },
              { method: "GET", path: "/api/templates", desc: "Business templates" },
              { group: "AI", color: C.red },
              { method: "POST", path: "/api/ai/chat", desc: "Chat with AI agent" },
            ].map((item, i) => {
              if ("group" in item) {
                return (
                  <div key={i} style={{ ...px, fontSize: 6, color: item.color, letterSpacing: "0.12em", padding: "12px 0 6px", marginTop: 8, borderTop: `1px solid ${C.bright}` }}>
                    {item.group}
                  </div>
                );
              }
              return <ApiEndpoint key={i} method={item.method!} path={item.path!} desc={item.desc!} />;
            })}

            <div style={{ marginTop: 20, padding: "12px 14px", background: C.surface2, border: `1px solid ${C.border}` }}>
              <div style={{ ...mono, fontSize: 7, color: C.amber, marginBottom: 6 }}>POST /api/ai/chat — Request Body</div>
              <pre style={{ ...mono, fontSize: 7, color: C.muted, margin: 0, lineHeight: 1.8 }}>{`{
  "message": "string",
  "agentName": "string",
  "agentRole": "research|strategy|builder|content|growth|analytics",
  "apiKey": "string",           // User's own API key
  "provider": "openai|anthropic|gemini"
}`}</pre>
            </div>
          </Card>
        </Section>

        {/* ── WALLET & TOKEN ───────────────────────────── */}
        <Section id="token">
          <SectionTitle icon={Shield} color="#1652f0">08 — Wallet & Token ($CTRL)</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <Card color="#1652f044">
              <div style={{ ...mono, fontSize: 8, color: "#1652f0", marginBottom: 12 }}>Base Network</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["Chain", "Base Mainnet"],
                  ["Chain ID", "8453"],
                  ["Currency", "ETH"],
                  ["Library", "wagmi v2 + viem"],
                  ["Wallets", "MetaMask, Coinbase Wallet"],
                  ["Explorer", "basescan.org"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, paddingBottom: 6 }}>
                    <span style={{ ...mono, fontSize: 7, color: C.muted }}>{k}</span>
                    <span style={{ ...mono, fontSize: 7, color: C.text }}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card color={`${C.violet}44`}>
              <div style={{ ...mono, fontSize: 8, color: C.violet, marginBottom: 12 }}>$CTRL Token</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["Ticker", "$CTRL"],
                  ["Network", "Base (EVM)"],
                  ["Gate Threshold", "100,000 $CTRL"],
                  ["Phase", "Pre-listing / Beta"],
                  ["TGE", "Coming Soon"],
                  ["Contract", "Set in Settings after deploy"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, paddingBottom: 6 }}>
                    <span style={{ ...mono, fontSize: 7, color: C.muted }}>{k}</span>
                    <span style={{ ...mono, fontSize: 7, color: C.violet }}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div style={{ marginTop: 16 }}>
            <Card>
              <div style={{ ...mono, fontSize: 8, color: C.amber, marginBottom: 12 }}>How Token Gating Works</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { n: "01", title: "Pre-listing (now)", desc: "Beta Access button on portal bypasses the gate. Free entry for early users while $CTRL is not yet listed.", color: C.cyan },
                  { n: "02", title: "At TGE", desc: "Token contract deployed on Base. Contract address saved in Settings. Balance check becomes active.", color: C.amber },
                  { n: "03", title: "Post-TGE", desc: "Connect MetaMask or Coinbase Wallet. System reads $CTRL balance on Base. Minimum 100,000 $CTRL required for entry.", color: C.violet },
                  { n: "04", title: "Future: Tiers", desc: "Different holding levels unlock different features: Basic (100K), Pro (500K), Commander (1M+).", color: C.green },
                ].map(step => (
                  <div key={step.n} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <span style={{ ...px, fontSize: 8, color: step.color, flexShrink: 0, marginTop: 2 }}>{step.n}</span>
                    <div>
                      <div style={{ ...px, fontSize: 7, color: step.color, marginBottom: 4 }}>{step.title}</div>
                      <div style={{ ...mono, fontSize: 7, color: C.muted, lineHeight: 1.9 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Section>

        {/* ── TUTORIAL ─────────────────────────────────── */}
        <Section id="tutorial">
          <SectionTitle icon={Target} color={C.amber}>09 — Getting Started Tutorial</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              {
                step: "01", title: "Enter the Portal",
                color: C.cyan,
                items: [
                  'Navigate to the app — you\'ll see the TOKEN GATE portal',
                  'Click "BETA ACCESS" to enter during pre-listing phase',
                  'Optional: expand "CONNECT WALLET" and connect MetaMask or Coinbase Wallet to check your future $CTRL balance',
                ],
              },
              {
                step: "02", title: "Explore Your Station",
                color: C.violet,
                items: [
                  'You land on the STATION dashboard with a live Phaser 3 pixel dungeon',
                  'Click any agent sprite to open the Agent Detail panel on the right',
                  'Click any room to see which agents are assigned and their current tasks',
                  'Switch stations using the dropdown in the top status bar',
                ],
              },
              {
                step: "03", title: "Manage Your Crew",
                color: C.amber,
                items: [
                  'Go to CREW tab — see all 18 agents with their roles, XP, and status',
                  'Filter by role using the tab buttons (RESEARCH / STRATEGY / BUILDER etc.)',
                  'Click UPGRADE on any agent to level them up — this PATCHes the database',
                  'Agent levels and XP are tracked persistently in PostgreSQL',
                ],
              },
              {
                step: "04", title: "Track Missions",
                color: C.green,
                items: [
                  'Open MISSIONS tab — 5 default missions are pre-seeded in the database',
                  'Progress auto-syncs from live platform activity every render',
                  'Mission status updates are written back to the DB on progress change',
                  'Complete all missions to unlock higher station levels (coming soon)',
                ],
              },
              {
                step: "05", title: "Configure AI (Ship Comms)",
                color: C.red,
                items: [
                  'Go to SETTINGS → AI ENGINE section',
                  'Choose provider: OpenAI (GPT-4o Mini), Anthropic (Claude Haiku), or Gemini (Flash)',
                  'Paste your API key and click SAVE KEY',
                  'Click TEST CONNECTION to verify — then open SHIP COMMS to chat with your agents',
                  'Your key is stored in browser localStorage only — never on any server',
                ],
              },
              {
                step: "06", title: "Set Up Base Network",
                color: "#1652f0",
                items: [
                  'Go to SETTINGS → BASE NETWORK section',
                  'Connect your wallet from the portal (MetaMask or Coinbase Wallet)',
                  'See your ETH balance on Base and wallet address live',
                  'After TGE: paste your $CTRL contract address to enable the BaseScan link',
                  'The contract address is saved locally and persists across sessions',
                ],
              },
            ].map(section => (
              <Card key={section.step} color={`${section.color}44`}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ ...px, fontSize: 14, color: section.color, flexShrink: 0, lineHeight: 1 }}>{section.step}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...px, fontSize: 8, color: section.color, marginBottom: 12 }}>{section.title}</div>
                    <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                      {section.items.map((item, i) => (
                        <li key={i} style={{ ...mono, fontSize: 7, color: C.muted, lineHeight: 1.9 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* ── GLOSSARY ─────────────────────────────────── */}
        <Section id="glossary">
          <SectionTitle icon={BookOpen} color={C.cyan}>10 — Glossary</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
            {[
              { term: "Commander", color: C.violet, def: "The user — the business owner directing AI agent operations from the dashboard." },
              { term: "Space Station", color: C.cyan, def: "A business entity within CTRL. Contains rooms and is staffed by crew agents." },
              { term: "Crew Agent", color: C.amber, def: "An AI worker assigned to a station room. Has a role, level, XP, and task queue." },
              { term: "Room", color: C.green, def: "A department within a station (e.g., Research Lab, War Room, Build Bay). Houses multiple agents." },
              { term: "Mission", color: C.amber, def: "A platform-level goal with a progress bar and XP reward. Tracked in the database." },
              { term: "Tick", color: C.muted, def: "The live session uptime counter shown in the bottom status bar (HH:MM:SS format)." },
              { term: "Token Gate", color: C.violet, def: "The portal page requiring $CTRL token balance on Base to enter the app post-TGE." },
              { term: "Beta Access", color: C.cyan, def: "Pre-TGE bypass that lets anyone enter the app for free. Stored in sessionStorage." },
              { term: "TGE", color: C.amber, def: "Token Generation Event — the moment $CTRL is deployed and listed on Base chain." },
              { term: "Ship Comms", color: C.red, def: "The AI chat terminal within the app. Requires user's own API key." },
              { term: "XP", color: C.green, def: "Experience Points. Agents earn XP by completing tasks. Used to level up agents." },
              { term: "Activity Feed", color: C.cyan, def: "The log of all agent actions stored in the `activity` database table." },
              { term: "Market", color: C.blue, def: "The template marketplace for buying/deploying pre-built station configurations." },
              { term: "Dungeon", color: C.violet, def: "The Phaser 3 rendered 2D pixel map of a station — 30×22 tile grid with 6 rooms." },
              { term: "CTRL (token)", color: C.cyan, def: "The native token of the platform, deployed on Base chain. Grants access and future governance." },
            ].map(g => (
              <div key={g.term} style={{ padding: "10px 14px", border: `1px solid ${C.border}`, background: C.surface }}>
                <div style={{ ...px, fontSize: 7, color: g.color, marginBottom: 6 }}>{g.term}</div>
                <div style={{ ...mono, fontSize: 7, color: C.muted, lineHeight: 1.8 }}>{g.def}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── ROADMAP ──────────────────────────────────── */}
        <Section id="roadmap">
          <SectionTitle icon={Clock} color={C.violet}>11 — Roadmap</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { phase: "PHASE 0", label: "Beta", status: "LIVE", color: C.green, items: ["Dashboard, Crew, Missions, Timeline, Market, Ship Comms", "PostgreSQL + Drizzle ORM database", "Phaser 3 pixel dungeon station view", "AI chat (OpenAI / Anthropic / Gemini)", "Base chain wallet integration (wagmi v2)"] },
              { phase: "PHASE 1", label: "TGE", status: "UPCOMING", color: C.amber, items: ["$CTRL token deployment on Base (ERC-20)", "Token gate activation with real balance check", "BaseScan integration for token tracking", "WalletConnect v2 support", "Real-time $CTRL price ticker on dashboard"] },
              { phase: "PHASE 2", label: "Expansion", status: "PLANNED", color: C.violet, items: ["On-chain mission completion rewards (XP NFTs)", "Multi-station management for enterprise Commanders", "Agent NFT marketplace — mint and trade crew members", "Agent-to-agent communication protocol", "Staking mechanics: stake $CTRL → unlock agent slots"] },
              { phase: "PHASE 3", label: "Economy", status: "VISION", color: C.muted, items: ["Autonomous revenue generation — agents execute real business tasks", "DAO governance for platform decisions using $CTRL", "Cross-station agent lending market", "Agent performance leaderboards with prize pools", "Mobile app (Expo) for on-the-go Commander access"] },
            ].map(phase => (
              <div key={phase.phase} style={{ border: `1px solid ${phase.color}44`, background: C.surface, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: phase.color }} />
                <div style={{ padding: "14px 18px 14px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ ...px, fontSize: 7, color: phase.color }}>{phase.phase}</span>
                    <span style={{ ...mono, fontSize: 8, color: C.text }}>{phase.label}</span>
                    <span style={{ ...mono, fontSize: 6, color: phase.color, marginLeft: "auto", padding: "2px 8px", border: `1px solid ${phase.color}44`, background: `${phase.color}0a` }}>{phase.status}</span>
                  </div>
                  <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
                    {phase.items.map((item, i) => (
                      <li key={i} style={{ ...mono, fontSize: 7, color: C.muted, lineHeight: 1.8 }}>
                        <span style={{ color: phase.color }}>→</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ ...px, fontSize: 8, color: C.cyan, marginBottom: 6 }}>CTRL OS</div>
            <div style={{ ...mono, fontSize: 7, color: C.muted }}>Autonomous Agent Economy Operating System</div>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link href="/" style={{ ...mono, fontSize: 7, color: C.muted, textDecoration: "none" }}>← Home</Link>
            <a href="#intro" style={{ ...mono, fontSize: 7, color: C.muted, textDecoration: "none" }}>↑ Top</a>
            <a href="https://basescan.org" target="_blank" rel="noopener noreferrer" style={{ ...mono, fontSize: 7, color: "#1652f0", textDecoration: "none" }}>BaseScan ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}
