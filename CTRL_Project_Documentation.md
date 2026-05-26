# CTRL — Autonomous Agent Economy OS
### Project Documentation & Technical Overview · v1.0 · May 2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Vision & Problem Statement](#2-vision--problem-statement)
3. [Product Overview](#3-product-overview)
4. [The Station Canvas — Phaser 3 Dungeon Engine](#4-the-station-canvas--phaser-3-dungeon-engine)
5. [Agent System & Role Framework](#5-agent-system--role-framework)
6. [Mission & Objectives Framework](#6-mission--objectives-framework)
7. [Station Templates Marketplace](#7-station-templates-marketplace)
8. [Ship Comms — AI Integration Layer](#8-ship-comms--ai-integration-layer)
9. [Token Economics & Access Model](#9-token-economics--access-model)
10. [Technical Architecture](#10-technical-architecture)
11. [API Reference](#11-api-reference)
12. [Database Schema](#12-database-schema)
13. [Visual Design System](#13-visual-design-system)
14. [Use Cases](#14-use-cases)
15. [Roadmap](#15-roadmap)
16. [Developer Guide](#16-developer-guide)

---

## 1. Introduction

**CTRL** (Control Agent) is an **Autonomous Agent Economy OS** — a fully integrated command-and-control dashboard that lets users (called **Commanders**) build, deploy, manage, and scale AI agent workforces inside virtual businesses called **Space Stations**.

Every concept in CTRL maps directly to real business operations:

| CTRL Concept | Real-World Equivalent |
|---|---|
| **Commander** | Business owner / operator |
| **Space Station** | A business or product |
| **Room** | A department (R&D, Marketing, Engineering, etc.) |
| **Crew / Agent** | An AI worker with a specific role and skillset |
| **Mission** | A business objective with measurable targets |
| **Task** | A discrete unit of work assigned to an agent |
| **Timeline** | An activity log / audit trail |
| **Market** | A business template store |

The platform runs on **Base network** (Ethereum Layer 2) and is gated by **100,000 $CTRL tokens** post-TGE. During the current pre-listing **Beta phase**, full access is available for free via a single click.

### What Makes CTRL Different

Most AI tools offer single-model chat. CTRL is an **operating system** for running multiple specialized AI agents simultaneously, with:

- A **live 2D dungeon canvas** that makes autonomous operations viscerally visible
- **Persistent agent identities** — names, roles, levels, XP, and task history
- **Real-time database-backed state** across all stations and agents
- **Multi-provider AI** (OpenAI, Anthropic, Gemini) with no vendor lock-in
- **Gamified progression** that mirrors the actual mechanics of growing a business
- **Blockchain-native access control** via $CTRL token balance on Base

---

## 2. Vision & Problem Statement

### The Problem

Running a real AI-powered business in 2025–2026 requires orchestrating multiple specialized agents simultaneously. A DeFi operation needs researchers scanning on-chain signals, strategists modeling yield, builders deploying contracts, and analytics agents monitoring performance — all at the same time, with coordination.

Current tools fail in three key ways:

1. **Fragmentation** — Each agent or tool lives in isolation. There is no single pane of glass for orchestrating a multi-agent workforce.
2. **Opacity** — AI agents work invisibly in the background. There is no real-time observability of what agents are doing, what they've completed, or where bottlenecks exist.
3. **No incentive alignment** — There is no economic layer connecting AI productivity to operator outcomes. Agents are cost centers, not strategic assets.

### The Solution

CTRL solves all three problems with one integrated platform:

- **Single command layer** — one dashboard for all stations, all agents, all tasks
- **Living visualization** — the Phaser 3 dungeon canvas makes agent activity observable and tangible in real time
- **Token-aligned access** — $CTRL token creates a network of serious operators and aligns incentives for the platform's long-term development

### The Core Insight

> *The most effective way to make people care about AI agents is to make them feel real.*

CTRL achieves this through the Space Station metaphor combined with pixel-art agent characters, persistent XP/leveling, named agents with personalities, and a dungeon canvas that shows agents physically moving, collaborating, and completing work. The gamification isn't decoration — it mirrors the actual feedback loops of skill-building, resource allocation, and business growth.

---

## 3. Product Overview

CTRL consists of **five core views** accessible via the bottom navigation bar, plus ancillary pages (Settings, Ship Comms, Stations list, Docs).

### 3.1 STATION — The Dashboard

**Route:** `/app`  
**Role:** Mission control hub

The Station page is the heart of CTRL. It combines a live Phaser 3 pixel dungeon canvas (showing animated agents in their rooms) with a contextual detail panel on the right, a station activity feed at the bottom, and a top bar showing live platform stats.

**Key Features:**
- **Station switcher** — Dropdown to switch between multiple stations with live progress indicators
- **Live Phaser canvas** — Animated 2D dungeon showing agent positions, comm lines between collaborating agents, room states, and real-time activity
- **Room detail panel** — Click a room → see all agents assigned, room type, task counts, status
- **Agent detail panel** — Click an agent → see name, role, level, XP bar, current task, full task history, XP to next level
- **Revenue tracker** — Editable revenue counter per station, persisted to the database with debounced auto-save
- **Activity feed** — Real-time log of the last N agent actions from `GET /api/dashboard/activity`
- **Add Room modal** — Create a new room in the current station with type and name
- **Add Agent modal** — Deploy a new agent by selecting role, name, and room assignment
- **Assign Task modal** — Create and assign a task to a selected agent with priority selection
- **Create Task modal** — Standalone task creation flow
- **Station-level stats** — Active agents, total agents, rooms, tasks completed, overall progress bar

### 3.2 CREW — Agent Roster

**Route:** `/app/crew`  
**Role:** Full workforce management

The Crew page shows every agent across the current station in a grid layout with rich role-based filtering and individual agent management.

**Key Features:**
- **Role filter bar** — ALL / RESEARCH / STRATEGY / BUILDER / CONTENT / GROWTH / ANALYTICS
- **Agent cards** — Each card shows: pixel-art sprite (AgentAvatar component), agent name, role badge, level badge (LV.X), XP progress bar, tasks completed count, current task text, status dot (working / idle / offline)
- **Agent detail panel** — Slides in from the right with full task history, XP breakdown, role color theming, and action buttons
- **Actions:** Assign Task, Create Task, Delete Agent (with confirmation)
- **Responsive** — Mobile-optimized layout with collapsible detail panel
- **Live data** — All agent data pulled from `GET /api/agents` with TanStack Query caching and real-time refetch

### 3.3 MISSIONS — Objectives & Progression

**Route:** `/app/missions`  
**Role:** Goal tracking and progression system

Missions are persistent, database-backed objectives that create a progression loop for the platform. They automatically complete when live API data meets their targets.

**Key Features:**
- **Mission cards** — Each shows: icon, title, description, color-coded progress bar, current/target count, reward XP, status badge (ACTIVE / LOCKED / COMPLETED)
- **Auto-completion** — The page polls `GET /api/dashboard/summary` and `GET /api/dashboard/agent-performance` every 30 seconds. When a mission's live metric meets its target, `PATCH /api/missions/:id` is called to mark it complete and unlock the next
- **Sequential unlocking** — Locked missions unlock as predecessors complete, creating a progression chain
- **Stats panel** — Collapsible section showing average agent performance, tasks completed today, active agents
- **Mission categories:** Task completion, agent deployment, revenue targets, performance benchmarks

**Mission Status States:**
| State | Description |
|---|---|
| `active` | In progress, progress bar filling |
| `completed` | Target met, shows trophy icon and reward |
| `locked` | Prerequisites not met, greyed out with lock icon |

### 3.4 TIMELINE — Activity Feed & Analytics

**Route:** `/app/timeline`  
**Role:** Audit log and operational intelligence

The Timeline is a chronological record of every agent action across all stations, with filtering, visualization, and time-based analytics.

**Key Features:**
- **Filter bar** — ALL / REVENUE / AGENTS / ERRORS
  - AGENTS: filters to non-system actors
  - REVENUE: shows entries containing revenue/sale/$-sign keywords
  - ERRORS: shows entries with error/fail keywords
- **Timeline entries** — Each entry: role-colored dot, timestamp (HH:MM format), agent name, role badge, station name, action summary, details text
- **Events per hour heatmap** — Computed from real activity data, showing busiest hours of operation
- **Collapsible charts panel** — Expandable analytics section with activity density visualization
- **Live data** — `GET /api/dashboard/activity?limit=50` with automatic refetch

### 3.5 MARKET — Templates Marketplace

**Route:** `/app/templates`  
**Role:** Pre-configured station deployment

The Market is a catalog of battle-tested station blueprints organized by business type. Commanders browse, filter, and deploy templates to create new stations instantly.

**Key Features:**
- **Category filter** — All / Crypto / E-Commerce / Content / SaaS
- **Search bar** — Full-text search across template name and description
- **Template cards** — Name, icon, description, category badge, star rating (★★★★★), agent count, room count, usage count
- **Deploy modal** — Name your station → click Deploy → station created in DB → redirect to new Station dashboard
- **One-click deployment** — `POST /api/stations` with `{ name, templateId }` creates the station and redirects

---

## 4. The Station Canvas — Phaser 3 Dungeon Engine

The Station Canvas is CTRL's most distinctive technical feature: a **real-time interactive 2D pixel dungeon** rendered inside a React component using Phaser 3.

### 4.1 Architecture

The canvas uses a **factory pattern** with dynamic import to avoid SSR and bundle issues:

```ts
// StationCanvas.tsx (React wrapper)
useEffect(() => {
  const initPhaser = async () => {
    const PhaserMod = await import('phaser');
    const Phaser = ((PhaserMod as any).default ?? PhaserMod) as typeof import('phaser');
    const { createPhaserScene } = await import('@/lib/stationScene');
    // ... initialize game
  };
  initPhaser();
}, []);
```

Data flows from React → Phaser via props. When agents or rooms change, the scene updates in-place without a full restart.

### 4.2 Dungeon Grid

The dungeon is a **30×22 tile grid**. Each tile's pixel size is computed dynamically from the canvas container dimensions to ensure responsive scaling.

- **Tile source:** Kenney Roguelike Indoors tileset (CC0 licensed)
- **Tile spec:** 16×16 pixels per tile, 1px spacing, 26×17 tile atlas
- **Asset loading:** `new URL('../../../../attached_assets/...', import.meta.url).href` via Vite

### 4.3 Room Layout

Six rooms arranged in a **3×2 grid**, connected by **7 corridor segments**:

```
┌─────────────┬─────────────┬─────────────┐
│  Research   │   Dev Lab   │   Design    │
│     Lab     │  (Builder)  │   Studio    │
│  (Research) │             │  (Design)   │
├─────────────┼─────────────┼─────────────┤
│   [corridors — vertical connections]    │
├─────────────┼─────────────┼─────────────┤
│  Marketing  │  Ops Center │  Analytics  │
│     Hub     │ (Strategy)  │ (Analytics) │
│  (Growth)   │             │             │
└─────────────┴─────────────┴─────────────┘
```

| Room | Role | Grid Position | Accent Color |
|---|---|---|---|
| Research Lab | `research` | Col 1–8, Row 1–6 | `#5b8fff` |
| Dev Lab | `builder` | Col 11–18, Row 1–6 | `#4d7fff` |
| Design Studio | `design` | Col 21–28, Row 1–6 | `#9b6dff` |
| Marketing Hub | `growth` | Col 1–8, Row 15–20 | `#4dff9b` |
| Ops Center | `strategy` | Col 11–18, Row 15–20 | `#c0a020` |
| Analytics | `analytics` | Col 21–28, Row 15–20 | `#ff4d6d` |

### 4.4 Rendering Layers (Depth Order)

| Depth | Layer | Contents |
|---|---|---|
| 0 | `dungeonGfx` | Floor fill, room backgrounds, corridor fill |
| 1 | `tiled floor images` | Kenney tileset rendered on floor areas |
| 2 | `overlayGfx` | Room borders, wall headers, door indicators, corner accents, label bars |
| 5 | `agentGfx` | Agent pixel-art bodies, comm lines between same-room agents, selection rings |
| 8 | `nameTexts` | Agent name labels above sprites |
| 9 | `fxGfx` | Level-up burst effects (rings, rays, particles, flash) |

### 4.5 Agent Sprites & Animation

Each agent is rendered as a **hand-crafted pixel-art character** using programmatic drawing (not image assets):

- **Structure:** Head (4 rows) → Face (3 rows) → Body/Torso (5 rows) → Legs (3 rows)
- **Dimensions:** 8 pixels wide × 17 pixels tall (scaled dynamically)
- **Colors:** Each role has a distinct color palette (helmet, body armor, accents)
- **Walk animation:** 4-frame cycle at ~200ms per frame — legs alternate between positions
- **Comm lines:** Semi-transparent lines drawn between agents in the same room (collaboration indicator)
- **Selection ring:** Pulsing circle drawn around the selected agent
- **Level-up burst:** Expanding rings + radiating rays + particle shower + full-screen flash on level promotion

### 4.6 Interactions

| User Action | Canvas Response | React Response |
|---|---|---|
| Click agent | Selection ring appears | Agent detail panel opens in right sidebar |
| Click room | Room highlighted | Room detail panel opens in right sidebar |
| Click empty space | All selections cleared | Detail panel closes |
| Agent moves | Walk animation plays, sprite translates between rooms | None (internal) |

### 4.7 Environmental Effects

- **Day/Night cycle:** 300-second cycle. Ambient lighting shifts, status bar shows "PEAK HOURS" (day) or "NIGHT OPS" (night)
- **CRT scanline sweep:** Periodic bright horizontal bar sweeps downward across the dungeon at full width, every ~8 seconds
- **Room glow:** Each room has a subtle radial color gradient matching its role accent
- **Neon border:** Each room rendered with thick accent-colored corner accents and a colored label bar at the bottom

---

## 5. Agent System & Role Framework

### 5.1 The Seven Roles

Every agent has a **role** that defines their specialty, pixel-art appearance, room assignment preference, and color across all UI surfaces.

| Role | Color | Hex | Specialty |
|---|---|---|---|
| `research` | Electric Blue | `#5b8fff` | Market scanning, on-chain intelligence, competitive analysis, data gathering |
| `builder` | Royal Blue | `#4d7fff` | Smart contract deployment, CI/CD pipelines, infrastructure, API development |
| `strategy` | Gold | `#c0a020` | Yield modeling, backtesting, GTM planning, risk analysis, position sizing |
| `content` | Amber | `#ffb84d` | Copywriting, newsletters, SEO, social threads, campaign assets |
| `growth` | Neon Green | `#4dff9b` | A/B testing, conversion optimization, viral campaigns, funnel analysis |
| `analytics` | Red | `#ff4d6d` | Performance metrics, Sharpe ratios, portfolio monitoring, reporting |
| `design` | Violet | `#9b6dff` | UI/UX, brand systems, thumbnail generation, design kits |

### 5.2 Agent Data Model

```typescript
type Agent = {
  id: number;
  stationId: number;
  roomId: number | null;
  name: string;               // e.g. "VECTOR-9", "NEXUS-1", "CORE-1"
  role: AgentRole;
  status: 'working' | 'idle' | 'offline';
  level: number;              // 1–10+
  experience: number;         // XP points
  tasksCompleted: number;
  currentTask: string | null;
};
```

### 5.3 Pixel-Art Sprite System

Agent sprites are defined as **8×17 color grids** in `PixelSprite.tsx`. Each cell is either `'none'` (transparent) or a hex color string. The grid is rendered as an SVG with individual `<rect>` elements — no image files, pure code.

**Example — Builder sprite (excerpt):**
```
Row 0:  [T, T, '#363d56', '#4d7fff', '#4d7fff', '#363d56', T, T]  ← helmet top
Row 1:  [T, '#1a3d8a', '#4d7fff', '#9ab8ff', '#9ab8ff', '#4d7fff', '#1a3d8a', T]  ← helmet
Row 5:  [T, T, '#a0a8b8', '#e0e8f8', '#e0e8f8', '#a0a8b8', T, T]  ← face
Row 8:  [T, '#0d1a3d', '#1a3d8a', '#4d7fff', '#4d7fff', '#1a3d8a', '#0d1a3d', T]  ← torso top
Row 14: [T, '#1a3d8a', '#4d7fff', '#4d7fff', '#4d7fff', '#4d7fff', '#1a3d8a', T]  ← legs
```

Sprites are used in:
1. **Phaser canvas** — re-drawn each frame using Phaser Graphics API
2. **AgentAvatar component** — in detail panels and Crew cards (with colored border box and corner accents)
3. **Header logo** — the builder character with bob + glow-pulse CSS animation

### 5.4 XP & Level System

- Agents gain XP as tasks are completed
- XP thresholds unlock new levels (1–10+)
- Level up triggers the particle burst animation in the Phaser canvas
- Level badge (LV.X) displayed in gold monospace font (`Press Start 2P`) across all agent surfaces

### 5.5 Active Seed Roster

The platform ships with **18 pre-seeded agents** across 3 stations for immediate demo value:

**ALPHA-7 DEFI OPS (Station 1)**
| Agent | Role | Level | Current Task |
|---|---|---|---|
| VECTOR-9 | research | 7 | Scanning on-chain alpha signals for ETH/BTC pair |
| SCOUT-4 | research | 5 | Analyzing whale wallet movements |
| NEXUS-1 | strategy | 9 | Generating yield strategy for AAVE v3 |
| CIPHER-7 | strategy | 8 | Backtesting momentum strategy on GMX |
| PRISM-2 | analytics | 6 | Computing Sharpe ratio for portfolio rebalance |
| FORGE-3 | builder | 7 | Deploying smart contract to Arbitrum testnet |
| PIXEL-8 | builder | 4 | — (idle) |
| SIGMA-5 | analytics | 6 | Monitoring liquidity pools for arbitrage ops |

**CONTENT-3 NEXUS (Station 2)**
| Agent | Role | Level | Current Task |
|---|---|---|---|
| ECHO-1 | content | 5 | Writing weekly DeFi market analysis thread |
| LYRIC-3 | content | 4 | Drafting email newsletter for subscriber list |
| NOVA-6 | content | 6 | Creating thumbnail batch for YouTube content |
| FLUX-2 | content | 3 | — (idle) |
| LENS-9 | analytics | 5 | Tracking content performance metrics |

**SAAS-1 LAUNCH PAD (Station 3)**
| Agent | Role | Level | Current Task |
|---|---|---|---|
| CORE-1 | builder | 8 | Building user authentication flow for SaaS MVP |
| ARCH-5 | builder | 7 | Setting up CI/CD pipeline with GitHub Actions |
| STACK-3 | builder | 6 | Implementing Stripe payment integration |
| MEMO-2 | research | 5 | Competitive analysis: top 10 SaaS tools in niche |
| GROW-4 | growth | 6 | Running A/B test on landing page headlines |
| VIRAL-8 | growth | 5 | Crafting product hunt launch campaign |
| STYLE-6 | content | 5 | Designing UI kit for SaaS dashboard |
| OPS-9 | strategy | 4 | — (idle) |
| TACT-3 | strategy | 6 | Drafting go-to-market strategy for beta launch |

---

## 6. Mission & Objectives Framework

### 6.1 Overview

Missions are **persistent, database-backed objectives** stored in the `missions` table. They create a progression loop by giving Commanders tangible targets connected to real platform metrics.

### 6.2 Mission Data Model

```typescript
type Mission = {
  id: number;
  title: string;
  description: string;
  iconName: string;       // Lucide icon key (e.g. "TrendingUp", "Zap", "Users")
  color: string;          // Hex accent color
  target: number;         // Target value
  current: number;        // Current progress value
  unit: string;           // "tasks" | "agents" | "%" | "$"
  rewardXp: number;
  status: 'active' | 'completed' | 'locked';
  sortOrder: number;
};
```

### 6.3 Auto-Completion Logic

The Missions page runs a background polling loop:

```
Every 30 seconds:
  1. Fetch GET /api/dashboard/summary  →  tasksCompletedToday, activeAgents, overallProgress
  2. Fetch GET /api/dashboard/agent-performance  →  avgProgress per role
  3. For each active mission:
     - Compute current value from live data
     - If current >= target AND status === 'active':
       → PATCH /api/missions/:id  { status: 'completed' }
       → Find next 'locked' mission → PATCH { status: 'active' }
```

### 6.4 Mission Categories

| Category | Metric Source | Example Target |
|---|---|---|
| Task Completion | `tasksCompletedToday` | Complete 10 tasks |
| Agent Deployment | `activeAgents` | Have 5 active agents |
| Revenue | Station `revenue` field | Generate $10,000 |
| Performance | `avgProgress` across roles | Reach 75% avg task progress |
| Station Expansion | `totalStations` | Deploy 3 stations |

---

## 7. Station Templates Marketplace

### 7.1 Template Catalog

Templates are pre-configured station blueprints stored in the `templates` table. Each template defines the business archetype, recommended agent composition, and room layout.

| Template | Category | Agents | Rooms | Rating | Deployed |
|---|---|---|---|---|---|
| **DeFi Alpha Hunter** | Crypto | 8 | 4 | ⭐ 4.8 | 1,247× |
| **E-Commerce Empire** | E-Commerce | 6 | 3 | ⭐ 4.6 | 892× |
| **Content Machine** | Content | 5 | 3 | ⭐ 4.7 | 2,134× |
| **SaaS Accelerator** | SaaS | 10 | 5 | ⭐ 4.9 | 678× |
| **NFT Studio OS** | Crypto | 7 | 4 | ⭐ 4.5 | 543× |
| **Newsletter Empire** | Content | 4 | 2 | ⭐ 4.4 | 1,089× |

### 7.2 Template Descriptions

**DeFi Alpha Hunter** — Autonomous crypto research and trading strategy OS. Combines research agents for on-chain scanning with strategy agents for yield modeling and builder agents for smart contract deployment.

**E-Commerce Empire** — Full-stack e-commerce automation with growth agents. Content agents generate product descriptions and campaigns, growth agents optimize conversion funnels, analytics agents track performance.

**Content Machine** — AI-powered content creation and distribution network. Specialized content agents write, design, and publish across multiple channels with analytics tracking reach and engagement.

**SaaS Accelerator** — End-to-end SaaS product development and growth. The most comprehensive template: builder agents ship code, research agents analyze the market, growth agents run experiments, strategy agents plan GTM.

**NFT Studio OS** — Complete NFT collection creation and launch system. Content and design agents create artwork and metadata, strategy agents model mint pricing, builder agents handle contract deployment.

**Newsletter Empire** — Automated newsletter research, writing, and growth. Lean 4-agent setup for research + content + growth + analytics focused entirely on newsletter business metrics.

### 7.3 Deployment Flow

```
1. Commander browses Market → selects template
2. Modal opens → Commander enters station name
3. POST /api/stations { name, templateId }
4. Server creates station record in DB
5. Client redirects to /app → new station selected
6. Commander begins adding rooms and agents
```

---

## 8. Ship Comms — AI Integration Layer

### 8.1 Overview

The Ship Comms page (`/app/ship-comms`) is a **direct communication channel** between the Commander and any agent in their station. Messages are routed through `POST /api/ai/chat` to a real LLM provider, with the agent's role defining the system prompt persona.

### 8.2 Supported Providers

| Provider | Model | Key Format | Free Tier |
|---|---|---|---|
| **OpenAI** | GPT-4o Mini | `sk-...` | Limited |
| **Anthropic** | Claude Haiku (`claude-haiku-20240307`) | `sk-ant-...` | No |
| **Google Gemini** | Gemini 1.5 Flash | `AIza...` | Yes (generous) |

### 8.3 Agent System Prompt

Each agent receives a role-specific persona:

```
You are {agentName}, an elite AI agent specializing in {agentRole} operations 
aboard a space station. You are terse, professional, and mission-focused. 
Respond in 1-3 sentences maximum. Use brief technical language. 
Reference your role where relevant. Address the Commander directly.
```

This creates a distinct voice per role:
- **Research agents** → data-driven, cite metrics, flag anomalies
- **Strategy agents** → probability-focused, reference tactical parameters
- **Builder agents** → pipeline-focused, cite technical specs, report ETAs
- **Content agents** → engagement-metric-driven, reference copy performance
- **Growth agents** → conversion-focused, reference A/B results
- **Analytics agents** → precision-focused, cite specific numbers and ratios

### 8.4 Fallback Mode (No API Key)

Without an API key, agents respond with **pre-written role-specific scripts** that maintain immersion. Each role has 5+ scripted responses selected at random, ensuring Ship Comms is functional from first launch.

**Example fallbacks:**
```
builder: "Build pipeline initiated. ETA: 2.4 minutes."
strategy: "Strategic recalculation in progress. Stand by."
growth: "Growth loop activated. Viral coefficient rising."
```

### 8.5 API Key Security

- Keys are stored **only in `localStorage`** in the browser — never sent to the server at rest
- Keys are transmitted only in the request body at call time, over HTTPS
- The server forwards the key directly to the LLM provider and returns the response — no key logging

### 8.6 Settings Page

The Settings page (`/app/settings`) provides:
- AI provider selection (OpenAI / Anthropic / Gemini) with color-coded cards
- API key input with show/hide toggle
- **Test connection** button — sends a test message and reports success/failure
- Wallet information panel — connected address, chain ID, Base network $CTRL balance
- Contract address configuration — store the $CTRL token contract address for balance checks
- Clipboard copy for wallet address

---

## 9. Token Economics & Access Model

### 9.1 $CTRL Token

- **Network:** Base (Ethereum Layer 2)
- **Purpose:** Access credential, governance token, staking asset (post-TGE)
- **Required for full access:** 100,000 $CTRL
- **Status:** Pre-listing — token not yet deployed

### 9.2 Access Tiers

| Tier | Requirement | Access Level | Status |
|---|---|---|---|
| **Beta Commander** | Click "Beta Access" button | Full platform — unlimited | **ACTIVE NOW** |
| **Token Holder** | ≥ 100,000 $CTRL on Base wallet | Full platform access | Live at TGE |
| **Wallet Connected** | Connected wallet, < 100K $CTRL | Token gate screen only | Live at TGE |
| **Unconnected** | No wallet connected | Marketing landing page only | Always |

### 9.3 Wallet Support

CTRL supports the three most popular wallet connector types via **wagmi v2**:

| Wallet | Connector ID | Description |
|---|---|---|
| MetaMask | `injected` | Browser extension and mobile app |
| Coinbase Wallet | `coinbaseWallet` | Official Base network wallet |
| WalletConnect | `walletConnect` | Protocol connecting 300+ wallets |

### 9.4 Token Verification Flow

```
1. User connects wallet (wagmi useConnect hook)
2. useBalance({ address, chainId: base.id }) → fetches $CTRL balance from Base RPC
3. If balance >= 100,000 → WalletGate renders <AppShell> children
4. If balance < 100,000 → WalletGate renders <TokenGate> screen
5. Beta bypass: sessionStorage.getItem('ctrl_beta_access') === '1' → skip gate
```

### 9.5 Beta Access Implementation

```typescript
const BETA_KEY = "ctrl_beta_access";
// Stored in sessionStorage (not localStorage — clears on tab close)
// Set by clicking "BETA ACCESS" button on TokenGate page
sessionStorage.setItem(BETA_KEY, "1");
```

### 9.6 Post-TGE Roadmap

- **Tier system:** Different $CTRL thresholds unlock Commander / Admiral / Fleet Admiral roles with increasing agent slots and station limits
- **Staking:** Stake $CTRL to accelerate agent XP gain and unlock exclusive templates
- **Governance:** $CTRL holders vote on new templates, feature prioritization, token parameters
- **On-chain proofs:** Completed missions generate verifiable attestations on Base

---

## 10. Technical Architecture

### 10.1 Monorepo Structure

```
/
├── artifacts/
│   ├── aetherion/          → React + Vite frontend (port 3000)
│   └── api-server/         → Express 5 API server (port 3001)
├── lib/
│   ├── db/                 → Drizzle ORM schema + PostgreSQL client
│   ├── api-spec/           → OpenAPI 3.0 specification (source of truth)
│   ├── api-client-react/   → Orval-generated TanStack Query hooks
│   └── api-zod/            → Orval-generated Zod validation schemas
├── scripts/
│   ├── src/seed.ts         → Database seed script
│   └── post-merge.sh       → Post-merge setup (install + push schema)
└── replit.md               → Project configuration and preferences
```

**Tooling:**
- Package manager: `pnpm` with workspaces
- Node.js version: 24
- TypeScript: 5.9 (strict mode)
- Monorepo: pnpm workspaces

### 10.2 Frontend Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI component tree and state management |
| Vite | 7 | Dev server, HMR, asset pipeline |
| Tailwind CSS | v4 | Utility classes via `@import "tailwindcss"` + `@theme` block |
| Framer Motion | latest | All page transitions, panel animations, modal slides |
| Phaser | 3/4 | Pixel dungeon canvas (dynamic import in useEffect) |
| Wouter | latest | Client-side routing (`Link` uses `href` prop) |
| wagmi + viem | v2 | Wallet connections, Base network balance checks |
| TanStack Query | v5 | Server state, caching, mutations |
| Lucide React | latest | Icon library throughout the UI |

### 10.3 Backend Stack

| Technology | Version | Purpose |
|---|---|---|
| Express | 5 | REST API framework with async/await route handlers |
| Drizzle ORM | latest | Type-safe PostgreSQL queries and schema definition |
| Zod | latest | Request body validation on all routes |
| `drizzle-zod` | latest | Auto-generate Zod schemas from Drizzle table definitions |
| pino | latest | Structured JSON request logging |
| esbuild | latest | CJS bundle compilation for production |
| pg (node-postgres) | latest | PostgreSQL connection driver |

### 10.4 Code Generation Pipeline

```
OpenAPI spec (lib/api-spec/openapi.yaml)
       ↓  pnpm --filter @workspace/api-spec run codegen
       ↓  Orval
       ├── lib/api-client-react/src/generated/  → TanStack Query hooks
       └── lib/api-zod/src/generated/            → Zod schemas
```

**Rule:** `lib/api-zod/src/index.ts` must **only** contain `export * from "./generated/api"` — codegen regenerates it; adding extra exports causes TS2308 duplicate identifier errors.

### 10.5 Data Flow

```
Browser
  │  calls hook: useListStationAgents(stationId)
  │
TanStack Query (api-client-react)
  │  fetches: GET /api/stations/:id/agents
  │
Vite dev proxy → /api/* → localhost:3001
  │
Express route handler (api-server)
  │  validates: Zod schema
  │  queries: Drizzle ORM
  │
PostgreSQL (DATABASE_URL env var)
  │
  ↓ returns: Agent[]
  │
TanStack Query cache → React component re-render
  │
React passes agents[] as props → Phaser scene
  │
Phaser scene updates sprite positions without full scene restart
```

### 10.6 Port Configuration

| Port | Service | Description |
|---|---|---|
| **5000** | Artifact Router (external) | HTTPS termination, routes `/api` → 3001, `/` → 3000 |
| **3000** | Vite frontend dev server | HMR enabled, `server.allowedHosts: true` |
| **3001** | Express API server | Internal only, accessed via `/api` proxy prefix |

**Note:** Do NOT run the artifact router as a separate workflow — it conflicts with the running frontend/API workflows. Routing is handled automatically.

### 10.7 Vite Configuration

Critical Vite settings for the Phaser tileset to load correctly:

```typescript
// vite.config.ts
server: {
  fs: {
    allow: ['../..']  // must include workspace root for attached_assets
  }
},
resolve: {
  alias: {
    '@': path.resolve('./src'),
    '@assets': path.resolve('../../attached_assets'),
  }
}
```

### 10.8 TypeScript Configuration

- `"types": ["node", "vite/client"]` — provides PNG/asset import type declarations
- `"moduleResolution": "bundler"` — supports `.ts` extension imports
- `"allowImportingTsExtensions": true` — required for the bundler resolution mode
- `"noEmit": true` — typecheck only, esbuild handles compilation

---

## 11. API Reference

All routes are prefixed with `/api`. The full specification lives in `lib/api-spec/openapi.yaml`.

### 11.1 Templates

```
GET /api/templates
  → Template[]
  Response: [{ id, name, slug, description, category, agentCount, roomCount, rating, usageCount, isPublished }]
```

### 11.2 Stations

```
GET /api/stations
  → Station[]

POST /api/stations
  Body: { name: string, templateId: number }
  → Station

PATCH /api/stations/:id
  Body: Partial<{ name, status, progress, revenue, agentCount, activeAgents, roomCount, tasksCompleted, tasksTotal }>
  → Station

GET /api/stations/:id/rooms
  → Room[]

GET /api/stations/:id/agents
  → Agent[]
```

### 11.3 Agents

```
GET /api/agents
  → Agent[]  (all agents across all stations)

POST /api/stations/:id/agents
  Body: { name: string, role: string, roomId?: number }
  → Agent

GET /api/agents/:id
  → Agent

PATCH /api/agents/:id
  Body: Partial<{ name, role, status, level, experience, tasksCompleted, currentTask, roomId }>
  → Agent

DELETE /api/agents/:id
  → { success: true }
```

### 11.4 Tasks

```
GET /api/agents/:id/tasks
  → Task[]

POST /api/agents/:id/tasks
  Body: { title: string, description?: string, priority: 'low'|'medium'|'high'|'critical' }
  → Task

PATCH /api/tasks/:id
  Body: Partial<{ status, progress, completedAt }>
  → Task
```

### 11.5 Dashboard

```
GET /api/dashboard/summary
  → { totalStations, activeStations, totalAgents, activeAgents, tasksCompletedToday, totalTemplates, overallProgress }

GET /api/dashboard/activity?limit=N
  → ActivityItem[]  (ordered by timestamp DESC)
  ActivityItem: { id, agentName, agentRole, stationName, action, details, timestamp }

GET /api/dashboard/agent-performance
  → PerformanceItem[]
  PerformanceItem: { role, tasksCompleted, avgProgress, agentCount }
```

### 11.6 Missions

```
GET /api/missions
  → Mission[]  (ordered by sortOrder)

PATCH /api/missions/:id
  Body: { current?: number, status?: 'active'|'completed'|'locked' }
  → Mission
```

### 11.7 AI

```
POST /api/ai/chat
  Body: {
    message: string,
    agentName: string,
    agentRole: string,
    apiKey: string,
    provider: 'openai' | 'anthropic' | 'gemini'
  }
  → string  (agent response text)
```

---

## 12. Database Schema

PostgreSQL managed database accessed via `DATABASE_URL`. Schema defined with Drizzle ORM. Apply changes with `pnpm --filter db push`.

### 12.1 `templates`

```sql
CREATE TABLE templates (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE,
  description     TEXT,
  category        TEXT,          -- 'crypto' | 'ecommerce' | 'content' | 'saas'
  agent_count     INTEGER,
  room_count      INTEGER,
  rating          REAL,
  usage_count     INTEGER DEFAULT 0,
  is_published    BOOLEAN DEFAULT true
);
```

### 12.2 `stations`

```sql
CREATE TABLE stations (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  template_id     INTEGER REFERENCES templates(id),
  template_name   TEXT,
  status          TEXT DEFAULT 'idle',  -- 'running' | 'paused' | 'idle'
  progress        REAL DEFAULT 0,       -- 0–100
  agent_count     INTEGER DEFAULT 0,
  active_agents   INTEGER DEFAULT 0,
  room_count      INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_total     INTEGER DEFAULT 0,
  revenue         INTEGER DEFAULT 0
);
```

### 12.3 `rooms`

```sql
CREATE TABLE rooms (
  id              SERIAL PRIMARY KEY,
  station_id      INTEGER REFERENCES stations(id),
  name            TEXT NOT NULL,
  type            TEXT,   -- 'research' | 'operations' | 'development' | 'marketing' | 'analytics'
  status          TEXT DEFAULT 'idle',  -- 'active' | 'busy' | 'idle'
  agent_count     INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0
);
```

### 12.4 `agents`

```sql
CREATE TABLE agents (
  id              SERIAL PRIMARY KEY,
  station_id      INTEGER REFERENCES stations(id),
  room_id         INTEGER REFERENCES rooms(id),  -- nullable
  name            TEXT NOT NULL,
  role            TEXT NOT NULL,   -- 'research'|'strategy'|'builder'|'content'|'growth'|'analytics'|'design'
  status          TEXT DEFAULT 'idle',  -- 'working' | 'idle' | 'offline'
  level           INTEGER DEFAULT 1,
  experience      INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  current_task    TEXT               -- nullable
);
```

### 12.5 `tasks`

```sql
CREATE TABLE tasks (
  id              SERIAL PRIMARY KEY,
  agent_id        INTEGER REFERENCES agents(id),
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT DEFAULT 'pending',  -- 'pending' | 'in_progress' | 'completed'
  progress        INTEGER DEFAULT 0,       -- 0–100
  priority        TEXT DEFAULT 'medium',   -- 'low' | 'medium' | 'high' | 'critical'
  completed_at    TIMESTAMP               -- nullable
);
```

### 12.6 `activity`

```sql
CREATE TABLE activity (
  id          SERIAL PRIMARY KEY,
  agent_name  TEXT,
  agent_role  TEXT,
  station_name TEXT,
  action      TEXT,   -- short summary (shown in timeline and activity feed)
  details     TEXT,   -- full details (nullable)
  timestamp   TIMESTAMP DEFAULT NOW()
);
```

### 12.7 `missions`

```sql
CREATE TABLE missions (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  icon_name   TEXT,             -- Lucide icon key
  color       TEXT,             -- hex color
  target      INTEGER,
  current     INTEGER DEFAULT 0,
  unit        TEXT,             -- 'tasks' | 'agents' | '%' | '$'
  reward_xp   INTEGER DEFAULT 0,
  status      TEXT DEFAULT 'locked',  -- 'active' | 'completed' | 'locked'
  sort_order  INTEGER DEFAULT 0
);
```

### 12.8 Entity Relationships

```
templates ──< stations ──< rooms
                      └──< agents ──< tasks
                                 └──→ activity (loose reference by name)
missions (standalone, auto-completed by polling dashboard data)
```

---

## 13. Visual Design System

### 13.1 Design Philosophy

CTRL's visual identity is a **neon-on-dark pixel aesthetic** inspired by:
- 8-bit dungeon RPGs (Rogue, NetHack, Pixel Dungeon)
- Retro terminal interfaces and CRT monitors
- Military command center / war room aesthetics
- Cyberpunk UI design (neon glows, dark backgrounds, scan lines)

Every design decision reinforces the "you are commanding an AI army from a space station" narrative.

### 13.2 Typography

| Font | Role | Source |
|---|---|---|
| **Press Start 2P** | Headings, labels, CTRL logo, level badges, mission titles | Google Fonts |
| **Space Mono** | Body text, stats, data values, tags, timestamps | Google Fonts |
| System Monospace | Code blocks, terminal output | System fallback |

### 13.3 Color System

Defined as CSS custom properties in `src/index.css` with a Tailwind v4 `@theme` block:

```css
@theme {
  --color-ae-cyan:    #5b8fff;   /* Primary accent — research, links, glows */
  --color-ae-violet:  #9b6dff;   /* Strategy role, secondary accent */
  --color-ae-blue:    #4d7fff;   /* Builder role, tertiary accent */
  --color-ae-amber:   #ffb84d;   /* Content role, warnings, gold highlights */
  --color-ae-green:   #4dff9b;   /* Growth role, success states */
  --color-ae-red:     #ff4d6d;   /* Analytics role, error states */
}

:root {
  --ae-bg:           #07091a;   /* Deepest page background */
  --ae-surface:      #090c1e;   /* Card/panel backgrounds */
  --ae-surface-2:    #0e1228;   /* Elevated surfaces, hover */
  --ae-border:       #1a2040;   /* Default borders */
  --ae-border-bright:#2a3060;   /* Active/focus borders */
  --ae-text:         #e0e8ff;   /* Primary text */
  --ae-muted:        #6070a0;   /* Secondary/placeholder text */
  --ae-dim:          #3a4460;   /* Dimmed text, disabled states */
}
```

### 13.4 Component Library

**`.pixel-border`**
Sharp square corner accents using `::before`/`::after` pseudo-elements. Creates a "pixel art frame" effect on cards and panels.

**`.pixel-btn` / `.pixel-btn.primary`**
Sharp, square buttons (no border-radius) with:
- Default: subtle border, muted text
- Hover: neon glow in the relevant role color
- Primary variant: filled with `--ae-cyan` background

**`.pixel-progress`**
Segmented progress bars that look like 8-bit health/XP bars. Built with repeating gradients at 2px intervals.

**`.status-dot`**
Circular neon indicator with color-coded state:
```css
.status-dot.running  { background: var(--ae-green); box-shadow: 0 0 6px var(--ae-green); }
.status-dot.idle     { background: var(--ae-amber); }
.status-dot.error    { background: var(--ae-red);   box-shadow: 0 0 6px var(--ae-red); }
```

**`.logo-idle`**
Applied to the header character wrapper. Runs two synchronized CSS animations:
- `logo-bob` — 3.2s ease-in-out vertical float (0 → -3px → -1px → 0)
- `logo-glow-pulse` — 3.2s blue neon glow breathing (soft → bright → soft)

**`.danger-blink`**
Pulsing opacity animation for critical alert states.

### 13.5 CRT Overlay Effects

**Scanline grid (persistent):**
```css
#root::after {
  background: repeating-linear-gradient(
    0deg,
    transparent 0px, transparent 3px,
    rgba(91,143,255,0.012) 3px, rgba(91,143,255,0.012) 4px
  );
  pointer-events: none;
  z-index: 9999;
}
```

**Scanline sweep (periodic):**
A bright horizontal bar animates from top to bottom over 8 seconds, every 12 seconds — mimicking a CRT electron gun scan.

### 13.6 Animation Library

| Animation | Duration | Purpose |
|---|---|---|
| `scan` | 8s | CRT scanline sweep across full page |
| `pulse-dot` | 1.5s | Status indicator glow pulse |
| `pulse-border-cyan/amber/blue` | 2s | Card border neon pulse |
| `floatUp` | 0.3s | Items entering viewport from below |
| `pulse-glow` | 2s | Neon element ambient glow |
| `shimmer` | 1.5s | Loading skeleton shimmer |
| `mission-glow-pulse` | 2s | Mission card border animation |
| `stat-flash` | 0.5s | Stats updating flash effect |
| `card-scan` | 3s | Horizontal light sweep across cards |
| `badge-glow` | 2s | Level badge glow |
| `danger-blink` | 1s | Critical alert pulsing |
| `logo-bob` | 3.2s | Header sprite vertical bob |
| `logo-glow-pulse` | 3.2s | Header sprite blue neon breathing |

---

## 14. Use Cases

### 14.1 DeFi Operations Command Center

**Profile:** On-chain DeFi operator managing multiple yield strategies

**How CTRL is used:**
1. Deploy a **DeFi Alpha Hunter** station
2. Assign VECTOR-9 (research) to monitor whale wallets and scan for alpha
3. Assign NEXUS-1 (strategy) to model optimal AAVE v3 yield allocation
4. Assign FORGE-3 (builder) to deploy vault contracts to Arbitrum
5. Monitor the dungeon canvas to see all three agents working simultaneously
6. Check Timeline for SIGMA-5's arbitrage opportunity alerts
7. Use Ship Comms to ask CIPHER-7: "What's the Sharpe on the GMX momentum strategy?"

**Value:** Instead of managing 4 separate AI tools, the Commander sees the entire DeFi operation on one canvas — researchers scanning, strategists modeling, builders deploying, all in real time.

### 14.2 Content Business Automation

**Profile:** Solo creator running a newsletter + YouTube + Twitter operation

**How CTRL is used:**
1. Deploy a **Content Machine** station
2. ECHO-1 (content) writes weekly DeFi analysis threads
3. LYRIC-3 (content) drafts email newsletters
4. NOVA-6 (content) generates YouTube thumbnail batches
5. LENS-9 (analytics) tracks CTR, open rates, and impressions across channels
6. Check Missions: "Publish 10 pieces of content" → auto-completes as tasks finish

**Value:** CTRL makes it visible that a content operation is a multi-agent system, not a single "write for me" prompt. Each agent has a clear role, and progress is tracked against business targets.

### 14.3 SaaS Company Build Sprint

**Profile:** Technical founder building a SaaS MVP with AI assistance

**How CTRL is used:**
1. Deploy a **SaaS Accelerator** station
2. CORE-1 + ARCH-5 + STACK-3 (builders) build auth, CI/CD, and payments
3. MEMO-2 (research) runs competitive analysis
4. GROW-4 + VIRAL-8 (growth) plan A/B tests and Product Hunt launch
5. TACT-3 (strategy) drafts the go-to-market strategy
6. Revenue mission unlocks as the Commander logs first $1,000 MRR

**Value:** The full MVP → launch pipeline is visible in one dungeon canvas. The Commander can see at a glance which agents are blocked, which are busy, and which need a new task.

### 14.4 NFT Collection Launch

**Profile:** NFT artist and crypto operator launching a PFP collection

**How CTRL is used:**
1. Deploy **NFT Studio OS** template
2. Design agents create artwork variations and metadata schemas
3. Content agents write mint page copy and Twitter campaigns
4. Builder agents deploy and verify the ERC-721 contract
5. Strategy agents model mint price and whitelist allocation
6. Ship Comms: ask CIPHER-7 for "optimal mint price given comparable collection floor prices"

### 14.5 Investor / Portfolio Monitor

**Profile:** Crypto fund manager overseeing multiple on-chain strategies

**How CTRL is used:**
1. One station per strategy (ALPHA-7 for ETH/BTC, another for altcoin plays)
2. Research agents constantly scan on-chain signals across multiple chains
3. Analytics agents compute portfolio metrics (Sharpe, VaR, exposure)
4. Timeline filters to REVENUE events to see P&L activity
5. Missions track quarterly performance targets

---

## 15. Roadmap

### Phase 0 — Beta (NOW — Active)

- ✅ Full Station Canvas with Phaser 3 dungeon + 18-agent seed roster
- ✅ Crew management with role filtering, XP/leveling, task assignment
- ✅ Mission tracking with auto-completion logic
- ✅ Timeline feed with activity visualization
- ✅ Templates marketplace with one-click station deployment
- ✅ Multi-provider AI chat via Ship Comms (OpenAI / Anthropic / Gemini)
- ✅ Base wallet integration (MetaMask, Coinbase Wallet, WalletConnect)
- ✅ Revenue tracking per station, persistent PostgreSQL state
- ✅ Electric blue pixel art theme with CRT overlay and logo animation
- ✅ Marketing landing page with boot sequence and live platform stats

### Phase 1 — TGE & Token Gate

- [ ] $CTRL token launch on Base network
- [ ] Enforce 100,000 $CTRL token balance check for dashboard access
- [ ] Multi-tier access: Commander (100K) / Admiral (500K) / Fleet Admiral (1M+)
- [ ] Staking: Stake $CTRL to multiply agent XP gain rate
- [ ] Governance: $CTRL snapshot voting for new templates and feature prioritization
- [ ] Token-gated exclusive templates for holders

### Phase 2 — Real Agent Autonomy

- [ ] Live webhook integrations: agents can actually post tweets, trigger GitHub Actions, execute trades
- [ ] Scheduled tasks: cron-style autonomous agent task scheduling
- [ ] Agent-to-agent communication: strategy agents can brief and direct content agents
- [ ] Real revenue streams: affiliate commissions, trading signal subscriptions, newsletter revenue
- [ ] On-chain task proofs: completed missions generate verifiable Base attestations (EAS)
- [ ] Webhooks incoming: external systems can trigger agent tasks (Zapier, Make, n8n)

### Phase 3 — Ecosystem Expansion

- [ ] **Station Marketplace:** Commanders can publish, share, and monetize their successful station configurations
- [ ] **Agent NFTs:** Mint high-level, named agents as tradeable on-chain assets on Base
- [ ] **Multi-chain:** Expand wallet and balance checks to Arbitrum, Optimism, Solana
- [ ] **Mobile:** CTRL companion app on iOS/Android via Expo with station overview
- [ ] **CTRL SDK:** External developers build custom agent roles, rooms, and templates
- [ ] **Commander Reputation:** On-chain track record of station performance, mission completions, revenue generated

---

## 16. Developer Guide

### 16.1 Key Commands

```bash
# Install all dependencies
pnpm install

# Run full typecheck across all packages
pnpm run typecheck

# Build all packages
pnpm run build

# Push DB schema changes (dev only)
pnpm --filter @workspace/db run push

# Seed the database
pnpm --filter @workspace/scripts run seed

# Regenerate API hooks and Zod schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Run frontend dev server (port 3000)
PORT=3000 pnpm --filter @workspace/aetherion dev

# Run API server (port 3001)
PORT=3001 pnpm --filter @workspace/api-server run dev
```

### 16.2 Adding a New API Route

1. Add the route definition to `lib/api-spec/openapi.yaml`
2. Run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks
3. Implement the handler in `artifacts/api-server/src/routes/`
4. Register it in `artifacts/api-server/src/routes/index.ts`
5. Import and use the generated hook from `@workspace/api-client-react`

### 16.3 Adding a New Agent Role

1. Add pixel art grid to `SPRITES` in `artifacts/aetherion/src/components/PixelSprite.tsx`
2. Add the role to `ROLE_SPRITE_MAP` in the same file
3. Add color to `ROLE_COLORS` in `artifacts/aetherion/src/lib/dungeonLayout.ts`
4. Add hex value to `ROLE_HEX` maps in page components (Dashboard, Crew, Timeline)
5. Add fallback responses to `FALLBACK_RESPONSES` in `ShipComms.tsx`
6. Add role to Phaser drawing logic in `stationScene.ts`

### 16.4 Important Rules

- **Phaser import:** Must use `await import('phaser')` inside `useEffect` only — never static import
- **Phaser ESM/CJS fix:** `const Phaser = ((PhaserMod as any).default ?? PhaserMod) as typeof import('phaser')`
- **Wouter routing:** `Link` uses `href` prop, not `to`
- **API client:** Always use hooks from `@workspace/api-client-react`, never raw fetch in components
- **api-zod index:** Only ever `export * from "./generated/api"` — nothing else
- **Dashboard agents:** Use `useListStationAgents(stationId)` not `useListAgents()` for station-specific data
- **Assets path:** Use `new URL('../../../../attached_assets/...', import.meta.url).href` for Phaser assets
- **Tailwind v4:** Never remove `@import "tailwindcss"` or the `@theme` block from `index.css`

### 16.5 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Replit-managed) |
| `PORT` | Yes | Server port (3001 for API, 3000 for frontend) |
| `BASE_PATH` | Frontend only | Set to `/` for the Vite dev server |

AI provider API keys are stored in **browser localStorage only** — no server-side env vars needed for AI functionality.

---

## Appendix: Live Activity Log Sample

The following are real entries from the seeded activity log, showing the kind of operations a live CTRL station produces:

| Timestamp | Agent | Role | Action | Details |
|---|---|---|---|---|
| -2 min | NEXUS-1 | strategy | Completed yield strategy modeling | AAVE v3 optimal allocation identified: 40% ETH, 35% USDC, 25% wBTC |
| -8 min | VECTOR-9 | research | Alpha signal detected | Large wallet accumulating PENDLE — 847K tokens in last 2h |
| -15 min | CORE-1 | builder | Auth flow deployed to staging | JWT + OAuth2 with Google/GitHub login functional on staging |
| -23 min | ECHO-1 | content | Published DeFi analysis thread | 22-tweet thread on Eigenlayer restaking mechanics — 4.2K impressions |
| -34 min | CIPHER-7 | strategy | Backtest completed | GMX momentum strategy: 67% win rate, 2.4 Sharpe over 18 months |
| -41 min | GROW-4 | growth | A/B test results in | Variant B headline +34% conversion rate — updating landing page |
| -58 min | NOVA-6 | design | Thumbnail batch complete | 12 YouTube thumbnails rendered for Q2 content calendar |
| -67 min | STACK-3 | builder | Stripe integration live | Subscription billing with Stripe Checkout fully functional |
| -74 min | SCOUT-4 | research | Whale alert triggered | Wallet 0x7f2a moving 12M USDC to Hyperliquid perp exchange |
| -89 min | LYRIC-3 | content | Newsletter draft complete | 2,400 word weekly roundup ready for review — 89% open rate predicted |
| -103 min | PRISM-2 | analytics | Portfolio rebalance computed | Sharpe-optimized rebalance: reduce ETH 8%, increase ARB 12% |
| -118 min | ARCH-5 | builder | CI/CD pipeline configured | GitHub Actions → Docker → Fly.io deploy pipeline live |
| -132 min | FORGE-3 | builder | Contract deployed to testnet | Vault contract verified on Arbiscan — ready for audit |
| -145 min | TACT-3 | strategy | GTM strategy drafted | Phase 1: Product Hunt + HN launch + 5 newsletter placements |
| -156 min | MEMO-2 | research | Competitive analysis done | Identified 3 underserved niches vs Notion/Linear — full report attached |
| -178 min | SIGMA-5 | analytics | Arbitrage opportunity found | WBTC/ETH spread on Curve vs Uniswap: +0.23% — executing |
| -192 min | VIRAL-8 | growth | PH campaign assets ready | Launch kit: 6 screenshots, 3 GIFs, maker story, 50 hunter contacts list |

---

*CTRL — Autonomous Agent Economy OS · Technical Documentation v1.0 · May 2026*  
*Network: Base (EVM) · Stack: React + Vite + Express + PostgreSQL + Phaser 3*  
*Status: Pre-TGE Beta — Full access available free until $CTRL token launch*
