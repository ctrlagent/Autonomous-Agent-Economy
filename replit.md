# AETHERION

## Overview

AETHERION is an Autonomous Agent Economy OS dashboard — an agentic AI operating system for building, running, and scaling businesses using AI agent networks. Users are "Commanders" managing "Space Stations" (businesses) staffed by specialized AI "crew" agents.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS v4 + Framer Motion + Phaser 3 (at `/`)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Routing**: Wouter (Link uses `href` prop, not `to`)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Architecture

### Frontend Pages (artifacts/aetherion)

| Route | Page | Description |
|-------|------|-------------|
| `/` | STATION | Dashboard: Phaser 3 animated station canvas + activity log + detail panel |
| `/crew` | CREW | Agent roster grid with role filters, status, task count |
| `/missions` | MISSIONS | Mission log with progress bars, rewards, locked/completed states |
| `/timeline` | TIMELINE | Chronological event feed with role-colored timeline dots |
| `/templates` | MARKET | Station template marketplace with category filter + deploy modal |

### Navigation
- Bottom nav bar: STATION / CREW / MISSIONS / TIMELINE / MARKET
- Top bar: AETHERION logo + ONLINE badge + Revenue / Tasks / Agents stats + settings icon

### Phaser Station Canvas — 2D Pixel Dungeon
- `src/lib/dungeonLayout.ts` — DUNGEON_ROOMS (6 rooms in 3×2 grid), DUNGEON_CORRIDORS (7 corridors), ROLE_COLORS map
- `src/lib/stationScene.ts` — StationScene class (factory pattern, `createPhaserScene()` method)
- `src/components/StationCanvas.tsx` — React wrapper with dynamic import in useEffect
- Phaser must be imported ONLY via `await import('phaser')` inside useEffect; handle both ESM and CJS:
  ```ts
  const Phaser = ((PhaserMod as any).default ?? PhaserMod) as typeof import('phaser');
  ```
- **Tileset**: Kenney roguelike-indoors (`attached_assets/pixel-pack/roguelikeIndoor_transparent.png`) — 16×16 tiles, 1px spacing, 26×17 grid; loaded via `new URL('../../../../attached_assets/...', import.meta.url).href` (Vite `fs.allow` must include workspace root `['../..']`)
- **Dungeon grid**: 30 cols × 22 rows; tile pixel size computed dynamically from canvas size
- **Rendering layers** (by depth): dungeonGfx(0) → tiled floor images(1) → overlayGfx(2) → agentGfx(5) → nameTexts(8) → fxGfx(9)
- **Room rendering**: dark fill + role-color glow + stone wall header + thick corner accents + door indicator + colored label bar
- **Agents**: 8 pixel-art characters (head/body/legs) with walk animation (4-frame), role colors, comm lines between same-room agents, selection ring
- **Interactions**: click agent → agent detail panel; click room → room detail panel; click void → deselect
- **Effects**: level-up burst (rings + rays + particles + flash), CRT scanline sweep
- **Live tick counter** in AppShell status bar (`useTick` hook, HH:MM:SS format)

### API Routes (artifacts/api-server)
- `GET /api/templates` — Business templates marketplace
- `GET/POST /api/stations` — Stations CRUD
- `GET /api/stations/:id/rooms` — Rooms in a station
- `GET /api/stations/:id/agents` — Agents in a station
- `GET /api/agents/:id` — Agent detail
- `GET /api/agents/:id/tasks` — Tasks per agent
- `GET /api/dashboard/summary` — Platform-wide stats (activeAgents, totalAgents, activeStations, totalStations, tasksCompletedToday)
- `GET /api/dashboard/activity` — Recent agent activity feed (limit query param)

### Database Schema (lib/db)
- `templates` — Business templates marketplace
- `stations` — User's business stations
- `rooms` — Rooms within stations (research, development, design, marketing, operations, analytics)
- `agents` — AI agents with roles (research, strategy, builder, content, growth, analytics)
- `tasks` — Tasks assigned to agents with progress tracking
- `activity` — Agent activity feed log

## Visual Identity — Pixel / Retro Aesthetic

### Fonts
- **Press Start 2P** — pixel font for all headings/labels (Google Fonts)
- **Space Mono** — monospace for body text, stats, tags

### CSS Design System (`src/index.css`)
- Tailwind CSS v4: `@import "tailwindcss"` + `@theme` block at top — **never remove these**
- `--ae-*` CSS variables: `--ae-bg`, `--ae-surface`, `--ae-surface-2`, `--ae-border`, `--ae-border-bright`, `--ae-text`, `--ae-muted`, `--ae-dim`, `--ae-cyan`, `--ae-cyan-dim`, `--ae-violet`, `--ae-blue`, `--ae-amber`, `--ae-green`, `--ae-red`
- CRT scanlines overlay via `::after` pseudo-element on `#root`
- `.pixel-border` — pixel corner accent corners using `::before`/`::after`
- `.pixel-btn` / `.pixel-btn.primary` — sharp square buttons with neon hover glow
- `.pixel-progress` — pixel-style progress bars
- `.status-dot` — neon glowing status indicator

### Role Colors
| Role | Hex | CSS Var |
|------|-----|---------|
| research | `#4df0d8` | `--ae-cyan` |
| strategy | `#9b6dff` | `--ae-violet` |
| builder | `#4d7fff` | `--ae-blue` |
| content | `#ffb84d` | `--ae-amber` |
| growth | `#4dff9b` | `--ae-green` |
| analytics | `#ff4d6d` | `--ae-red` |

## Important Notes
- `lib/api-zod/src/index.ts` must ONLY export `export * from "./generated/api"` — codegen regenerates it; adding extra exports causes TS2308 duplicate errors
- Dashboard uses `useListStationAgents` (not `useListAgents`) for station-specific agents
- All API hooks come from `@workspace/api-client-react`
- Seed data: 3 stations, 18 rooms, 18 agents, 12 tasks, 10 activity entries
