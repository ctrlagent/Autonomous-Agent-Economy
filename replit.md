# AETHERION

## Overview

AETHERION is an Autonomous Agent Economy platform — an agentic AI operating system for building, running, and scaling businesses using AI agent networks. Users are "Commanders" managing "Space Stations" (businesses) staffed by specialized AI "crew" agents.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + shadcn/ui (at `/`)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Architecture

### Frontend Pages (artifacts/aetherion)
- `/` — Command Center (Dashboard): Summary stats, live activity feed, agent performance
- `/stations` — Mission Control: List all stations, create new stations from templates
- `/stations/:id` — Station Detail: Rooms grid, agents roster, tasks per station
- `/templates` — Marketplace: Browse/filter business templates (Crypto, E-commerce, Content, SaaS)
- `/agents` — Agent Roster: All agents, filterable by role and status

### API Routes (artifacts/api-server)
- `GET/POST /api/templates` — Business templates CRUD
- `GET /api/templates/:id`
- `GET/POST /api/stations` — Stations (businesses) CRUD
- `GET/PATCH/DELETE /api/stations/:id`
- `GET /api/stations/:id/rooms` — Rooms in a station
- `GET /api/stations/:id/agents` — Agents in a station
- `GET/PATCH /api/agents/:id` — Agent management
- `GET/POST /api/agents/:id/tasks` — Task management per agent
- `PATCH /api/tasks/:id` — Update task status/progress
- `GET /api/dashboard/summary` — Platform-wide stats
- `GET /api/dashboard/activity` — Recent agent activity feed
- `GET /api/dashboard/agent-performance` — Performance breakdown by role

### Database Schema (lib/db)
- `templates` — Business templates marketplace
- `stations` — User's business stations
- `rooms` — Rooms within stations (research, development, design, marketing, operations, analytics)
- `agents` — AI agents with roles (research, strategy, builder, content, growth, analytics)
- `tasks` — Tasks assigned to agents with progress tracking
- `activity` — Agent activity feed log

## Visual Identity
- Dark cosmic command center aesthetic
- Deep space blacks (`hsl(230 40% 4%)`) with neon cyan primary (`hsl(190 90% 50%)`)
- Role colors: research=cyan, strategy=violet, builder=blue, content=amber, growth=emerald, analytics=rose
- Grid background pattern, glow effects, framer-motion animations

## Notes
- When codegen regenerates `lib/api-zod/src/index.ts`, restore it to `export * from "./generated/api"` only (not `./generated/types`) to avoid duplicate export errors
