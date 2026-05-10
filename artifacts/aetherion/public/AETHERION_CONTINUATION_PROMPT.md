# AETHERION — Continuation Prompt

Salin seluruh isi prompt ini dan tempel ke sesi AI baru untuk melanjutkan pengembangan project AETHERION.

---

## PROMPT

```
Kamu melanjutkan pengembangan project AETHERION — sebuah Autonomous Agent Economy OS Dashboard.
Ini adalah pnpm monorepo yang sudah fully running. Berikut konteks lengkapnya:

---

## STACK & STRUKTUR

Monorepo dengan pnpm workspaces:
- artifacts/aetherion/       → Frontend: React 18 + Vite 7 + Tailwind CSS v4 + Phaser 3 + Framer Motion + Wouter
- artifacts/api-server/      → Backend: Express 5 REST API
- lib/db/                    → PostgreSQL schema + Drizzle ORM
- lib/api-spec/              → OpenAPI spec (source of truth untuk codegen)
- lib/api-client-react/      → React Query hooks (di-generate Orval dari OpenAPI)
- lib/api-zod/               → Zod schemas (di-generate Orval, hanya boleh export * from "./generated/api")
- scripts/                   → Seed data dan helpers

TypeScript 5.9. Node.js 24. Package manager: pnpm.

---

## CARA MENJALANKAN

Workflow yang harus aktif:
1. Frontend: `BASE_PATH=/ PORT=5000 pnpm --filter @workspace/aetherion dev`
2. API: `PORT=3001 pnpm --filter @workspace/api-server run dev`

Port konfigurasi:
- Port 5000 → Vite dev server (frontend)
- Port 3001 → Express API server
- artifact.toml di artifacts/aetherion/.replit-artifact/artifact.toml → localPort = 5000

Key commands:
- `pnpm run typecheck` → typecheck seluruh monorepo
- `pnpm --filter @workspace/api-spec run codegen` → regenerate API hooks & Zod schemas
- `pnpm --filter @workspace/db run push` → push DB schema changes

---

## DATABASE SCHEMA (PostgreSQL + Drizzle)

Tabel yang ada:
- templates    → Template marketplace bisnis
- stations     → Space Station (bisnis) milik user
- rooms        → Ruangan dalam station (6 tipe: research, development, design, marketing, operations, analytics)
- agents       → AI agent dengan role: research, strategy, builder, content, growth, analytics
- tasks        → Task yang dikerjakan agent (dengan progress %)
- activity     → Feed log aktivitas agent

Seed data: 3 stations, 18 rooms, 18 agents, 12 tasks, 10 activity entries.
Seed script: `pnpm --filter @workspace/scripts exec tsx ./src/seed.ts`

---

## HALAMAN FRONTEND

| Route        | Halaman   | Deskripsi |
|--------------|-----------|-----------|
| /            | STATION   | Dashboard utama: Phaser 3 dungeon canvas + activity log + detail panel |
| /crew        | CREW      | Roster grid semua agent dengan filter role |
| /missions    | MISSIONS  | Mission log dengan progress bar dan rewards |
| /timeline    | TIMELINE  | Kronologi event dengan role-colored dots |
| /templates   | MARKET    | Marketplace template station |
| /ship-comms  | SHIP COMMS| Komunikasi internal |

Routing menggunakan Wouter. Link pakai prop `href`, bukan `to`.

---

## PHASER 3 DUNGEON CANVAS (file kunci)

File utama:
- src/lib/stationScene.ts    → StationScene class (1660 baris) — logika utama dungeon
- src/lib/dungeonLayout.ts   → DUNGEON_ROOMS (6 room, grid 3×2), DUNGEON_CORRIDORS (7), ROLE_COLORS
- src/components/StationCanvas.tsx → React wrapper dengan dynamic import Phaser

PENTING — cara import Phaser (WAJIB lazy):
```ts
const PhaserMod = await import('phaser');
const Phaser = ((PhaserMod as any).default ?? PhaserMod) as typeof import('phaser');
```

Tileset: Kenney roguelike-indoors (attached_assets/pixel-pack/roguelikeIndoor_transparent.png)
- 16×16 tiles, 1px spacing, grid 26×17
- Di-load via: `new URL('../../../../attached_assets/...', import.meta.url).href`
- Vite fs.allow harus include workspace root: `['../..']`

Dungeon grid: 30 cols × 22 rows
Rendering layers (depth): dungeonGfx(0) → floorImages(1) → overlayGfx(2) → agentGfx(5) → nameTexts(8) → fxGfx(9)

Fitur dungeon yang sudah ada:
- 8 pixel-art agent characters dengan 4-frame walk animation
- Siklus hari/malam otomatis (300 detik: Night Ops → Dawn → Peak Hours → Dusk)
- Ambient particles per room (sparkles, binary rain, radar sweep, gold coins, dll.)
- Comm lines antar agent dalam ruangan yang sama
- Transit orbs saat agent pindah ruangan
- Level-up burst effect (rings + rays + particles + flash)
- Economy flyovers saat task selesai (+$Revenue muncul)
- CRT scanline sweep
- Incident alerts dengan countdown bar (auto-trigger tiap 90–120 detik)
- Room Mission system (5 task selesai = mission complete + reward)
- Minimap di pojok kanan atas
- Click agent → detail panel, click room → room detail, click void → deselect

BUG YANG SUDAH DIPERBAIKI:
- Progress bar infinite loop: ag.pct dan ag.prevPct sekarang di-reset ke 0 bersama dalam if/else block saat task complete (bukan dua baris terpisah yang saling override)

---

## API ENDPOINTS

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/dashboard/summary | Stats platform (activeAgents, totalAgents, dll.) |
| GET | /api/dashboard/activity | Feed aktivitas terbaru (query: limit) |
| GET/POST | /api/stations | List dan create stations |
| GET | /api/stations/:id/rooms | Rooms dalam station |
| GET | /api/stations/:id/agents | Agents dalam station |
| GET | /api/agents/:id | Detail satu agent |
| GET | /api/agents/:id/tasks | Tasks milik agent |
| GET | /api/templates | Template marketplace |

Hook: useListStationAgents (bukan useListAgents) untuk agent dalam station.
Semua API hooks dari @workspace/api-client-react.

---

## DESAIN SISTEM

Font:
- Press Start 2P → pixel font untuk heading/label
- Space Mono → monospace untuk body text

CSS custom properties (--ae-*):
--ae-bg, --ae-surface, --ae-surface-2, --ae-border, --ae-border-bright,
--ae-text, --ae-muted, --ae-dim, --ae-cyan, --ae-cyan-dim, --ae-violet,
--ae-blue, --ae-amber, --ae-green, --ae-red

Tailwind CSS v4: pakai @import "tailwindcss" + @theme block di index.css — JANGAN dihapus.

Role colors:
- research  → #4df0d8 (cyan)
- strategy  → #9b6dff (violet)
- builder   → #4d7fff (blue)
- content   → #ffb84d (amber)
- growth    → #4dff9b (green)
- analytics → #ff4d6d (red)

---

## CATATAN PENTING

- lib/api-zod/src/index.ts HANYA boleh: export * from "./generated/api"
  Jangan tambah export lain → menyebabkan TS2308 duplicate error
- Jangan jalankan artifact router ($REPLIT_ARTIFACT_ROUTER) sebagai workflow terpisah
- Agent role "design" TIDAK valid di DB — gunakan "content" sebagai gantinya
- Room type "design" VALID, tapi agent_role "design" TIDAK ada di enum

---

## IDE FITUR LANJUTAN (BELUM DIIMPLEMENTASI)

Berikut fitur-fitur yang bisa dikerjakan selanjutnya:

### HIGH PRIORITY
1. **Real-time Agent Task Assignment** — klik agent → pilih task baru dari dropdown → assign langsung dari dashboard
2. **Incident Alert System** — klik "!" di room → modal untuk assign agent menyelesaikan insiden
3. **Agent Leveling System** — agent naik level otomatis saat XP cukup, dengan animasi level-up yang tersinkron ke DB
4. **Station Switching** — tombol SWITCH di top bar sudah ada tapi belum berfungsi untuk ganti station aktif

### MEDIUM PRIORITY
5. **Ship Comms Page** — halaman /ship-comms belum ada konten; buat sistem pesan antara Commander dan agents
6. **Mission Rewards** — klik misi yang complete → claim reward → update revenue di DB
7. **Agent Detail Modal** — panel detail agent lebih lengkap: history task, stats, assign task baru
8. **Room Upgrades** — sistem upgrade ruangan untuk boost agent productivity

### LOW PRIORITY / POLISH
9. **Export Station Report** — tombol download laporan station sebagai PDF
10. **Dark/Light Mode Toggle** — toggle tema visual
11. **Sound Effects** — SFX pixel untuk level-up, task complete, incident
12. **Keyboard Shortcuts** — hotkeys untuk navigasi cepat antar halaman

---

Lanjutkan pengembangan sesuai prioritas di atas, atau implementasikan fitur spesifik yang diminta user.
Selalu jalankan typecheck setelah perubahan besar: `pnpm run typecheck`
```
