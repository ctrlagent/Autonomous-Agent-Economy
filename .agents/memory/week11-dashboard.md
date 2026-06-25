---
name: Week 11 Dashboard Upgrade
description: On-chain revenue sync endpoint, TelemetryOverlay component, Phaser bounty/airlock visual effects
---

## Revenue Endpoint
- `GET /api/dashboard/revenue` reads `agent_wallet_tx` WHERE type='earned', returns `{ totalUsdc, txCount, hourlyUsdc }`
- Dashboard no longer holds manual revenue state — `useQuery(["/api/dashboard/revenue"])` with refetchInterval:30000
- The old `revenue` useState + `saveRevenue()` + `handleRevenueChange()` + `onRevenueChange` prop are removed

## TelemetryOverlay
- `artifacts/aetherion/src/components/TelemetryOverlay.tsx`
- Absolute positioned (bottom-left) inside the Phaser canvas div, pointerEvents:none
- Shows: CREW ONLINE, SESSION TASKS (session-counted via subscribeAgentEvents), USDC DIST (from /revenue), USDC/HR, XP/MIN (60s rolling window)
- Recent events log (last 4): task_complete=green, agent_level_up=gold, airlock_rejected=red, airlock_approved=blue

## Phaser Effects in stationScene.ts
- `BountyEffect` interface: rings + BurstParticle[], timer — green ripple rings + particles on task_complete
- `AirlockRejectEffect` interface: rings, flashAlpha, shakeOffsetX, shakeDir, timer — red screen flash + shake rings on airlock_rejected
- Private arrays: `bountyEffects` and `airlockRejectEffects` (after existing `levelUpEffects`)
- Render loop: bounty renders in fxGfx graphics pass (same as levelUpEffects); airlock reject flash uses fillRect(0,0,W,H)
- New methods: `triggerBountyPulse(id)`, `triggerBountyPulseByName(name)`, `triggerAirlockReject(id)`, `triggerAirlockRejectByName(name)`

## Event Wiring in Dashboard.tsx
- task_complete → `triggerBountyPulseByName` (was wrongly also triggering levelUp before)
- agent_level_up → `triggerLevelUpByName` (now only fires for actual level ups)
- airlock_rejected → `triggerAirlockRejectByName` (new)

**Why:** Revenue should be authoritative from DB (agent_wallet_tx), not manually tracked in component state that could drift. Visual effects needed separation to avoid confusing bounty vs level-up.
