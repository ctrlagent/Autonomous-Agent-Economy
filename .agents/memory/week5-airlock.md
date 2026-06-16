---
name: Week 5 Airlock
description: Security Gate implementation — airlock review queue, routes, taskEngine integration, and Airlock page.
---

## Design decision
Airlock is an additive layer, NOT a blocking gate. Agents still get base XP/revenue immediately on task complete (keeps the simulation lively). The airlock holds a bonus reward (bonusXp=20, bonusRevenue=25% of task rev) that is only granted on Commander approval. This avoids freezing the dashboard stats while still having a meaningful review gate.

**Why:** Making the airlock fully block all rewards caused the dashboard stats to freeze — no XP/revenue ticked up until Commander approved. That would feel broken for the live simulation. The additive bonus approach keeps agents running while still surfacing all outputs for review.

## Key files
- Schema: `lib/db/src/schema/airlock.ts` — airlockStatusEnum, airlockTable
- Routes: `artifacts/api-server/src/routes/airlock.ts` — GET /, GET /stats, GET /:id, POST /:id/approve|reject|changes
- TaskEngine: inserts airlockTable entry after each task completes (after output generation)
- Page: `artifacts/aetherion/src/pages/Airlock.tsx` — uses plain fetch (no api-client-react)
- Nav: AIRLOCK added to NAV_ITEMS in AppShell.tsx using Shield icon
- Route: /app/airlock registered in App.tsx

## Approval flow
approve → applyApprovalReward() → agent gets bonusXp, station gets bonusRevenue, activity logged, task_complete event emitted
reject → activity logged "AIRLOCK REJECTED", no reward
changes_requested → activity logged, can be re-submitted for approve

## How to apply
Any future changes to reward amounts: bonusXp hardcoded to 20, bonusRevenue = Math.floor(rev * 0.25) in taskEngine.ts.
