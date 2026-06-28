---
name: Week 13 Kanban Wall
description: Kanban board replacing the Missions page — implementation details and gotchas
---

## What was built
- `artifacts/aetherion/src/pages/Kanban.tsx` — 4-column drag-drop board (Backlog | In Progress | In Review | Done)
- `lib/db/src/schema/missions.ts` — extended with: `columnStatus`, `assigneeId`, `priority`, `labels` (jsonb), `commentsCount`, `branchName`, `progress`, `checklist` (jsonb)
- `artifacts/api-server/src/routes/missions.ts` — new endpoints: PATCH /:id/move, PATCH /:id/assign, POST /:id/comment, PATCH /:id/checklist
- Route `/app/missions` now loads Kanban (alias `/app/kanban`); old page at `/app/missions-legacy`
- Nav label updated from MISSIONS → KANBAN in AppShell

## Packages added
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` to `@workspace/aetherion`

## Gotcha: API server rebuild required
After changing `lib/db/src/schema/missions.ts`, the `artifacts/api-server: API Server` workflow must be restarted to pick up the new schema columns. The esbuild bundle includes the schema at compile time — the new columns won't appear in API responses until the server rebuilds.

**Why:** The artifact-based API Server workflow builds once on startup (`pnpm run build` → esbuild bundle). Schema changes to `@workspace/db` are only included after a fresh build.

**How to apply:** Restart the `artifacts/api-server: API Server` workflow after any `lib/db/src/schema/*.ts` change.

## Seed data
Existing 5 missions updated in-place via direct SQL (psql) since the DB was already seeded. Seeds in `autoSeed.ts` also updated with kanban fields for future fresh installs.
