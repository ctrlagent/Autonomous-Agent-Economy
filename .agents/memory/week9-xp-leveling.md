---
name: Week 9 XP & Leveling
description: Agent skills unlock system, rank titles, and XP milestone UI in Crew.tsx; Phaser level-up burst already wired.
---

# Week 9 — Agent XP & Leveling

## Architecture overview
- XP constants: `XP_PER_TASK = 30`, `XP_PER_LEVEL = 100` (in taskEngine.ts)
- `agent.experience` stored as remainder after level-up (`newXp % XP_PER_LEVEL`) — always 0–99
- `agent_level_up` WS event emitted by taskEngine when `levelsGained > 0`
- Phaser burst: `StationScene.triggerLevelUpByName(name)` called in Dashboard.tsx via `subscribeAgentEvents`; `StationScene.triggerLevelUp(id)` exposed via `triggerRef.current`

## Skills & Ranks (frontend only — no DB)
- `artifacts/aetherion/src/lib/agentSkills.ts` — static config: `ROLE_SKILLS` (7 skills per role, unlock at levels 1/3/5/8/12/15/20), `RANK_TIERS` (RECRUIT→LEGEND at levels 1/3/5/8/12/15/20), `getRank()`, `getNextRank()`
- Skills visible in Crew.tsx agent detail panel: unlocked show description+icon, locked show as dimmed with lock icon
- Rank badge shown in both grid card and detail panel with tier color glow

## Important: Do NOT add a DB table for skills/ranks
Skills are purely derived from `agent.level` + the static config. No migration needed.
