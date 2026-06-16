---
name: Week 8 Agent Marketplace
description: marketplace_listings table, rarityEnum, seeder, API routes, and frontend AGENTS tab in Market.tsx
---

# Week 8 — Agent Marketplace

## Rule
All new API server files (routes, lib) must import db and schema tables from `@workspace/db` directly — never use relative paths like `"../db"`. esbuild will fail to resolve relative db imports that resolve outside the src directory.

**Why:** The db module is a separate workspace package. The build uses module aliasing that maps `@workspace/db` correctly; relative paths break the resolver.

**How to apply:** Every new file in `artifacts/api-server/src/` that needs the DB client uses `import { db, someTable } from "@workspace/db"`.

## Architecture
- `lib/db/src/schema/marketplace.ts` — `marketplaceListingsTable`, `rarityEnum` (common/rare/elite/legendary), uses `agentRoleEnum` from agents
- `artifacts/api-server/src/lib/seedMarketplace.ts` — seeds 19 catalog agents (6 common, 6 rare, 4 elite, 3 legendary); idempotent (skips if table non-empty)
- `artifacts/api-server/src/routes/marketplace.ts` — GET /api/marketplace/agents, GET /api/marketplace/agents/:id, POST /api/marketplace/hire/:id
- Hire flow: finds room in target station matching agent role → inserts agent → marks listing as "hired"
- `artifacts/aetherion/src/pages/Market.tsx` — two-tab layout (TEMPLATES | AGENTS); `PixelAvatar` component for deterministic pixel art from avatarSeed; `usePrInfo` pattern reused

## Rarity system
| Rarity | Color | Level range | Price range |
|--------|-------|-------------|-------------|
| common | #8899aa | 1 | 500–650 |
| rare | #4d7fff | 4–5 | 1800–2500 |
| elite | #9b6dff | 8–9 | 7000–9000 |
| legendary | #ffb84d | 15 | 22000–28000 |
