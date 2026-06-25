---
name: Week 12 Commander Profile
description: Performance history chart, strategic directives sliders, commander_directives DB table
---

## New DB Table
- `commander_directives`: id, role (unique), weight (0-100, default 50), updatedAt
- File: `lib/db/src/schema/commanderDirectives.ts`
- Exported from `lib/db/src/schema/index.ts`

## API Routes (/api/commander/*)
- `GET /api/commander/directives` — returns all 7 roles with weights (fills defaults if not in DB)
- `PATCH /api/commander/directives` — upserts weights; calls `setDirectiveCache()` on taskEngine to hot-reload without restart
- `GET /api/commander/history` — 7-day task completion by date (GROUP BY DATE(completedAt)) + all-time role breakdown
- File: `artifacts/api-server/src/routes/commander.ts`

## Task Engine Directive Integration
- `setDirectiveCache(weights)` — exported from taskEngine.ts; stores in-memory map
- `directiveMultiplier(role)` — returns weight/50 (0→0×, 50→1×, 100→2×)
- Applied at `Math.random() < IDLE_START_CHANCE * directiveMultiplier(role)` for idle agent start
- `loadDirectivesFromDb()` — called on startTaskEngine(); silently skips if table not yet seeded

## Profile.tsx Additions
- Performance History section: SVG sparkline (7-day), daily avg/peak stats, role breakdown bars
- Strategic Directives section: clickable bar sliders + up/down stepper buttons per role, SAVE button (dirty-state aware), PATCH call on save
- Both sections use `useQuery` with direct fetch (no codegen needed)

**Why:** Directive weights are cached in-memory (not re-queried per tick) for performance. setDirectiveCache() is called immediately after PATCH so changes take effect on the next tick without server restart.
