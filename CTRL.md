# CTRL — Control Agent

> **The Autonomous Agent Economy OS**
> Build, run, and scale your business with networks of AI agents — all from a single command center.

---

## Introduction

**CTRL** (Control Agent) is an agentic AI operating system dashboard that puts you in command of a fully autonomous business workforce. Instead of managing people or juggling dozens of tools, you direct specialized AI agents — each with a defined role, skill set, and mission — that work continuously on your behalf across research, development, design, marketing, operations, and analytics.

The interface draws from the aesthetics of retro pixel dungeon games: your business is a **Space Station**, your AI workforce is your **Crew**, and your objectives are **Missions**. CTRL makes the invisible mechanics of AI-driven business feel tangible, visual, and alive.

---

## Overview

| Aspect | Detail |
|---|---|
| **Type** | Autonomous Agent Economy OS Dashboard |
| **User Role** | Commander |
| **Business Unit** | Space Station |
| **AI Workforce** | Crew (specialized agents) |
| **Objectives** | Missions |
| **Aesthetic** | Retro pixel / CRT dungeon |

---

## Core Concepts

### Space Station
Your Space Station is your business. It is divided into **Rooms** — dedicated departments where agents live and operate. Each room has a role, a status, and a live view of its agent crew working in real time on the Phaser 3 dungeon canvas.

| Room | Role | Color |
|---|---|---|
| Research Lab | Research | Cyan |
| Dev Lab | Builder | Blue |
| Design Studio | Design | Violet |
| Marketing Hub | Growth | Green |
| Ops Center | Strategy | Amber |
| Analytics | Analytics | Red |

### Crew (AI Agents)
Each agent is a specialized AI worker with a defined role, personality, and skill set. Agents roam their assigned rooms, complete tasks, communicate with each other, and level up as they deliver results. You can inspect any agent's current task, performance score, and activity history by clicking them on the station canvas.

**Agent Roles:**
- **Research** — Information gathering, market analysis, competitor intelligence
- **Strategy** — Planning, prioritization, goal alignment
- **Builder** — Software development, automation, system architecture
- **Content** — Copywriting, creative output, brand voice
- **Growth** — Marketing campaigns, audience acquisition, conversion
- **Analytics** — Data analysis, reporting, performance insights

### Missions
Missions are the structured objectives your station runs. Each mission has a progress tracker, reward tier, and completion state. Completed missions unlock new capabilities and station upgrades.

### Timeline
A chronological feed of every significant event across all agents and rooms — level-ups, task completions, new deployments, anomalies — displayed with role-colored indicators for instant scanning.

### Market (Templates)
Pre-built station templates for common business archetypes (SaaS, e-commerce, content studio, etc.). Deploy a template to instantly scaffold a new station with a pre-configured crew and mission set.

---

## Dashboard Pages

| Route | Page | Description |
|---|---|---|
| `/` | **STATION** | Live Phaser 3 dungeon canvas with agent animations, room panels, and activity log |
| `/crew` | **CREW** | Full agent roster with role filters, status badges, and task counts |
| `/missions` | **MISSIONS** | Mission log with progress bars, reward tiers, and locked/completed states |
| `/timeline` | **TIMELINE** | Chronological event feed with role-colored timeline dots |
| `/templates` | **MARKET** | Station template marketplace with category filters and one-click deploy |

---

## Technical Architecture

### Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v4 + Framer Motion |
| Station Canvas | Phaser 3 (2D pixel dungeon, live agent simulation) |
| Routing | Wouter |
| Data Fetching | TanStack Query (React Query) |
| API | Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod + drizzle-zod |
| API Codegen | Orval (from OpenAPI spec) |
| Monorepo | pnpm workspaces |
| Language | TypeScript 5.9 |

### Monorepo Structure

```
ctrl/
├── artifacts/
│   ├── aetherion/          # Frontend — React + Vite
│   └── api-server/         # Backend — Express 5 API
├── lib/
│   ├── db/                 # Shared DB layer — PostgreSQL + Drizzle ORM
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   └── api-zod/            # Generated Zod schemas
└── scripts/
    └── src/seed.ts         # Database seed script
```

### API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/templates` | Business template marketplace |
| GET/POST | `/api/stations` | Station CRUD |
| GET | `/api/stations/:id/rooms` | Rooms within a station |
| GET | `/api/stations/:id/agents` | Agents within a station |
| GET | `/api/agents/:id` | Single agent detail |
| GET | `/api/agents/:id/tasks` | Tasks assigned to an agent |
| GET | `/api/dashboard/summary` | Platform-wide stats (agents, stations, tasks) |
| GET | `/api/dashboard/activity` | Recent agent activity feed |

### Database Schema

| Table | Purpose |
|---|---|
| `stations` | User business stations |
| `rooms` | Departments within each station |
| `agents` | AI agents with roles and statuses |
| `tasks` | Tasks assigned to agents with progress |
| `activity` | Agent activity event log |
| `templates` | Pre-built station blueprints |

---

## Visual Identity

CTRL uses a **pixel / CRT retro aesthetic** — every element feels like a terminal from a sci-fi command center.

### Fonts
- **Press Start 2P** — pixel font for all headings, labels, and the logo
- **Space Mono** — monospace for body text, stats, and data readouts

### Color System

| Name | Hex | Used For |
|---|---|---|
| Background | `#0a0b0f` | App background |
| Surface | `#0f1118` | Cards, panels |
| Cyan | `#4df0d8` | Research / primary accent |
| Violet | `#9b6dff` | Strategy |
| Blue | `#4d7fff` | Builder |
| Amber | `#ffb84d` | Content / logo accent |
| Green | `#4dff9b` | Growth |
| Red | `#ff4d6d` | Analytics / danger |

### Signature Effects
- **CRT Scanline Sweep** — animated scanline overlay across the entire UI
- **Neon Glow** — buttons, status dots, and borders emit role-colored light
- **Pixel Corner Accents** — `.pixel-border` class adds angular corner decoration
- **Level-Up Burst** — particle ring + flash animation on agent promotion
- **Agent Walk Animation** — 4-frame pixel walk cycle for all station crew

---

## Getting Started

### Prerequisites
- Node.js 24+
- pnpm
- PostgreSQL (or use Replit's managed database)

### Install & Run

```bash
# Install all dependencies
pnpm install

# Push the database schema
pnpm --filter @workspace/db run push

# Seed with sample data
pnpm --filter @workspace/scripts exec tsx ./src/seed.ts

# Start the API server (port 3001)
PORT=3001 pnpm --filter @workspace/api-server run dev

# Start the frontend (port 5000)
BASE_PATH=/ PORT=5000 pnpm --filter @workspace/aetherion dev
```

### Key Commands

```bash
# Full typecheck
pnpm run typecheck

# Build all packages
pnpm run build

# Regenerate API hooks from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes (dev only)
pnpm --filter @workspace/db run push
```

---

## Roadmap

- [ ] Real AI agent task execution via LLM integration
- [ ] Commander authentication and multi-user support
- [ ] Station-to-station communication network (Ship Comms)
- [ ] Agent marketplace — hire, customize, and upgrade crew
- [ ] Mission builder — define and deploy custom objectives
- [ ] Revenue tracking with real business metric integrations
- [ ] Mobile command view — manage your station on the go
- [ ] Agent memory and context persistence across sessions

---

## v2.1 — Real AI Task Engine (Week 1)

**Released**: 16 June 2026

### Task 1.1 — AI Task Executor Upgrade (`artifacts/api-server/src/lib/aiTaskExecutor.ts`)
- Added 7th role: `design` — output is a design system spec (color tokens, component structure, typography, spacing scale)
- Upgraded all 7 role system prompts to be action-oriented with structured sections, specific numbers, and ready-to-use output:
  - **research** → Executive Summary + 3 Key Findings + Data Points + Recommendations
  - **strategy** → Objective + 3 Tactical Steps + KPI table + Risk Mitigation + Next Actions
  - **builder** → Technical Approach + TypeScript code snippet + Commit Message + Testing + Deployment Notes
  - **content** → Content Brief + Twitter/X Thread (5 tweets) + LinkedIn Version + Key Messages
  - **growth** → Hypothesis + A/B Experiment Design table + Expected Uplift + Implementation Steps + Metrics + Rollout Plan
  - **analytics** → Summary + KPI Dashboard table + Trend Analysis + Anomalies + Action Items
  - **design** → Design System Overview + Color Tokens (CSS vars) + Component Structure table + Typography + Spacing Scale
- Extended `AiTaskResult` interface: added `provider`, `model`, `tokensUsed`, `costUsd`
- Provider functions now return `inputTokens` + `outputTokens` from API responses (OpenAI `usage`, Anthropic `usage`, Gemini `usageMetadata`)
- Added cost calculation from pricing table (OpenAI $0.15/$0.60 per M, Anthropic $0.25/$1.25, Gemini $0.075/$0.30)
- Added `withRetry()` helper: 1x retry with exponential backoff (1s, 2s) on network errors; falls back to template on final failure

### Task 1.2 — Task Engine Tick Upgrade (`artifacts/api-server/src/taskEngine.ts`)
- Added per-tick structured logging every 8s: `{ tick, workingAgents, idleAgents, pendingTasks }`
- Added in-memory average task duration tracker (`agentDurationMap`, exported `getAvgTaskDuration(agentId)`)
- Improved `task_complete` / `agent_level_up` event payload: now includes `agentRole`, `taskId`, `outputId`, `reward: { xp, revenue }`, `durationMs`
- Output inserts now use `.returning({ id })` to capture `outputId` for the event payload
- Added mission progress update on every task completion: increments `missions.current` for all active missions; auto-completes missions reaching target and unlocks next in sort order
- Added `design` role to `TASK_TEMPLATES` and `COMPLETE_VERBS`

### Task 1.3 — AgentOutputCard UI Upgrade (`artifacts/aetherion/src/components/AgentOutputCard.tsx`)
- AI-generated outputs (`type: "ai_report"`) continue to render via the custom pixel-art markdown renderer (headings, lists, tables, code blocks, bold inline)
- Added **View Raw / Formatted toggle** — switches between the rendered markdown view and a raw `<pre>` block
- Added **Copy button** — copies markdown text; shows "COPIED" feedback for 1.8s
- Added **Token usage footer** — displays `🔋 N,NNN tokens · $0.0000 · PROVIDER` when `tokensUsed > 0`
- Added `design` role to `ROLE_HEX` (`#f472b6`), `TYPE_LABELS` (`DESIGN_SPEC`), and `TYPE_COLORS`

### Schema
- Added `design` to `agentRoleEnum` in `lib/db/src/schema/agents.ts`
- Pushed schema change to PostgreSQL via `drizzle-kit push`

---

*CTRL v1.0 — Command your agents. Control your business.*
