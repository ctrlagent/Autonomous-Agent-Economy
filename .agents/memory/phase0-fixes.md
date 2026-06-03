---
name: Phase 0 fixes
description: Bug fixes done in Phase 0 — revenue sync, pending task execution, activeAgents counter, persistent AI config
---

## Revenue display (AppShell)
- **Before:** `tasksCompleted × $27` (hardcoded estimate, disconnected from DB)
- **After:** Sum `station.revenue` from `useListStations()` data — real accumulated DB value
- File: `artifacts/aetherion/src/components/layout/AppShell.tsx` lines ~295-302
- Also added `totalRevenue` to `/api/dashboard/summary` response

## Pending task execution (taskEngine)
- **Before:** Commander-assigned tasks sat in DB as `pending` forever — engine only processed `in_progress`
- **After:** Both idle and working agents check for `pending` tasks first (immediate start, no random chance)
- **Why:** `POST /api/agents/:id/tasks` creates tasks as `pending`. Engine must promote them.
- File: `artifacts/api-server/src/taskEngine.ts` — `syncActiveAgents()` helper + idle branch

## ActiveAgents counter (taskEngine)
- **Before:** `stationsTable.activeAgents` only incremented never decremented → always drifted high
- **After:** `syncActiveAgents(stationId)` recalculates from real agent status count after every state change
- **How to apply:** Call `syncActiveAgents()` after any agent status change, not increment/decrement manually

## Persistent AI config
- **Before:** `aiConfig.ts` was pure in-memory → lost on every server restart
- **After:** `server_config` DB table (key-value) stores AI config; loaded on startup via `loadAiConfigFromDb()`
- **DB schema:** `lib/db/src/schema/serverConfig.ts` — `server_config` table, text PK `key`, text `value`
- **Files:** `aiConfig.ts` uses `onConflictDoUpdate` upsert; `index.ts` calls `loadAiConfigFromDb()` before starting server
- **Why:** In-memory config dies with process. Users shouldn't re-enter API key after every server restart.
