---
name: Role colors & shared lib refactor
description: Single source of truth for role hex colors; beta access persistence fix; dead code removed
---

## Canonical role colors
All role hex colors now live in `artifacts/aetherion/src/lib/roleColors.ts`.
Import pattern: `import { getRoleColor, ROLE_HEX, ROLE_LABEL } from "@/lib/roleColors"`.

Canonical hex values (matches replit.md spec):
- research: #4df0d8 (cyan)
- strategy: #9b6dff (violet)
- builder:  #4d7fff (blue)
- content:  #ffb84d (amber)
- growth:   #4dff9b (green)
- analytics:#ff4d6d (red)
- design:   #c084fc (purple)

Files updated: Dashboard, Crew, Timeline, Airlock, Kanban, BriefingRoom, ShipComms.

**Why:** Five files previously had different values for the same role (e.g. `research` was #5b8fff in some, #4df0d8 in others — causing visual inconsistency across pages).

**How to apply:** Any new page/component using role colors must import from `@/lib/roleColors`, never define locally.

## Beta access persistence
`WalletGate.tsx` now uses `localStorage` (was `sessionStorage`) for the `ctrl_beta_access` key.

**Why:** sessionStorage is cleared when the tab closes, forcing devs to click "BETA ACCESS" every single session refresh. localStorage persists across sessions.

## Dead code removed
Deleted files (not referenced by any route or import):
- `src/pages/Home.tsx`
- `src/pages/StationDetail.tsx`
- `src/pages/Templates.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/Sidebar.tsx`

Active layout: `AppShell.tsx` only. `AppLayout`/`Sidebar` were never wired into App.tsx routes.

## Import placement gotcha
When editing files that have `const` declarations before the import block, always insert the new `import` BEFORE the first non-import statement. Babel's `vite:react-babel` plugin throws `Duplicate declaration` errors if an `import` appears after any `const`/`function` in the module scope.
