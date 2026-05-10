# AETHERION — CONTINUATION PROMPT
### Gunakan prompt ini di Replit Agent untuk melanjutkan pengembangan project AETHERION

---

## KONTEKS PROJECT

AETHERION adalah **Autonomous Agent Economy OS Dashboard** — sebuah OS berbasis AI agent untuk membangun, menjalankan, dan menskalakan bisnis. User berperan sebagai "Commander" yang mengelola "Space Stations" (bisnis) dengan "crew" AI agent yang bekerja otomatis.

**Stack:**
- Monorepo: pnpm workspaces
- Frontend: React + Vite + Tailwind CSS v4 + Framer Motion + **Phaser 3** (pixel dungeon)
- API: Express 5 + PostgreSQL + Drizzle ORM
- Font: Press Start 2P (pixel) + Space Mono (mono)
- Routing: Wouter (`href` prop, bukan `to`)

**Port:**
- Frontend: `artifacts/aetherion: web` → port 5000
- API: `API Server` → port 3001

**Workflows yang berjalan:**
- `artifacts/aetherion: web` — Vite dev server
- `API Server` — Express API

---

## CURRENT STATE (Sudah Diimplementasi)

### Pages:
| Route | Page | Status |
|-------|------|--------|
| `/` | STATION | ✅ Full — Phaser dungeon, agent detail, room detail, revenue, incidents |
| `/crew` | CREW | ✅ Full — Grid agent cards dengan color stripe + shimmer XP bar |
| `/missions` | MISSIONS | ✅ Full — Animated progress bar + XP badge + mission glow |
| `/ship-comms` | SHIP COMMS | ✅ Full — Live messaging, quick commands, freq spectrum |
| `/timeline` | TIMELINE | ✅ Full — Activity feed + charts |
| `/templates` | MARKET | ✅ Full — Template marketplace |

### Components:
- `AssignTaskModal` — Modal assign task per role dengan priority selector
- `StationCanvas` — Phaser 3 wrapper dengan level-up labels
- `AgentAvatar`, `RoleBadge`, `LevelBadge` — Pixel sprite components
- `AppShell` — Top nav (STATION/CREW/MISSIONS/SHIP COMMS/TIMELINE/MARKET) + status bar

### Phaser Dungeon (stationScene.ts ~1662 lines):
- 6 rooms dalam grid 3×2 (Research, Builder, Design, Growth, Strategy, Analytics)
- 8 pixel-art agents dengan walk animation 4-frame
- Pathfinding antar room via waypoints
- Level-up burst effects, CRT scanline sweep
- Day/Night cycle, Incident system (room hazards)
- Room mission complete effects + economy flyovers
- Minimap di pojok kanan atas

### CSS Design System:
```css
--ae-bg, --ae-surface, --ae-surface-2
--ae-border, --ae-border-bright
--ae-cyan (#4df0d8), --ae-blue (#4d7fff), --ae-violet (#9b6dff)
--ae-amber (#ffb84d), --ae-green (#4dff9b), --ae-red (#ff4d6d)
--ae-text, --ae-muted, --ae-dim
```

### Animasi CSS yang sudah ada:
- `@keyframes shimmer` — sweep highlight di progress bar
- `@keyframes scan` — CRT scanline sweep
- `@keyframes pulse-dot` — neon dot pulse
- `@keyframes floatUp` — XP label float animation
- `@keyframes card-scan` — holographic scan di crew cards
- `@keyframes mission-glow-pulse` — glow pulse di mission cards
- `@keyframes badge-glow` — XP badge pulse
- `@keyframes danger-blink` — critical alert blink

---

## PLAN BESAR: UI REVOLUTION + NEW FEATURES

Implementasikan semua item berikut secara berurutan atau paralel. Ini adalah roadmap lengkap transformasi AETHERION.

---

### 🎯 PRIORITY 1: STATION ZOOM IN / ZOOM OUT

**File:** `artifacts/aetherion/src/lib/stationScene.ts` + `artifacts/aetherion/src/components/StationCanvas.tsx`

Tambahkan zoom camera ke Phaser dungeon:

1. **Di `StationScene` class** — tambahkan method `setZoom(level: number)` dan `getZoom(): number`:
```typescript
private cameraZoom = 1.0;
private readonly MIN_ZOOM = 0.5;
private readonly MAX_ZOOM = 2.5;

setZoom(z: number) {
  this.cameraZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, z));
  this.scene?.cameras.main.setZoom(this.cameraZoom);
}
getZoom(): number { return this.cameraZoom; }
zoomIn()  { this.setZoom(this.cameraZoom + 0.15); }
zoomOut() { this.setZoom(this.cameraZoom - 0.15); }
zoomReset() { this.setZoom(1.0); }
```

2. **Tambahkan mouse wheel handler** di `createPhaserScene()` dalam method `create`:
```typescript
scene.input.on('wheel', (_ptr: unknown, _objs: unknown, _dx: unknown, dy: number) => {
  this.setZoom(this.cameraZoom - dy * 0.001);
});
```

3. **Di `StationCanvas.tsx`** — tambahkan zoom controls overlay:
```tsx
const [zoom, setZoom] = useState(1.0);
// Expose sceneRef ke parent (sudah ada), panggil sceneRef.current?.zoomIn() dll
```

4. **Tambahkan Zoom HUD** di `StationCanvas.tsx` — tiga tombol (`−`, `⟳`, `+`) di sudut kiri bawah canvas dengan styling pixel:
```tsx
<div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 4, zIndex: 10 }}>
  <button onClick={() => { sceneRef?.current?.zoomOut(); setZoom(v => Math.max(0.5, v - 0.15)); }}>−</button>
  <button onClick={() => { sceneRef?.current?.zoomReset(); setZoom(1.0); }}>⟳</button>
  <button onClick={() => { sceneRef?.current?.zoomIn();  setZoom(v => Math.min(2.5, v + 0.15)); }}>+</button>
  <span>{Math.round(zoom * 100)}%</span>
</div>
```
Style tombol: `Space Mono` font, border `1px solid var(--ae-border)`, hover glow cyan.

5. **Keyboard shortcuts**: `+`/`=` untuk zoom in, `-` untuk zoom out, `0` untuk reset — tambahkan listener di `useEffect` di `StationCanvas.tsx`.

---

### 🎨 PRIORITY 2: GLOBAL UI OVERHAUL — "HOLOGRAPHIC COCKPIT"

**Konsep:** Ubah tampilan dari "retro pixel" menjadi **"Sci-Fi Holographic Command Bridge"** — tetap dark dengan pixel font, tapi dengan:
- Lebih banyak glow effect berlapis
- Animated border corners
- Glass morphism panel subtle
- Data visualization lebih kaya

#### 2A. AppShell Top Bar Upgrade
- Ubah stat angka (`$3,840`, `19/23`) ke font `Press Start 2P` ukuran lebih besar
- Tambahkan animated accent di bawah angka (underline neon yang berkedip)
- Tambahkan **live revenue ticker** — angka revenue increment otomatis setiap beberapa detik dengan flash animation
- AETHERION logo hexagon lebih besar dan berputar perlahan (CSS animation `rotate`)

#### 2B. Animated Pixel Corner Accents (Global)
Di CSS, perbaiki `.pixel-border` dengan corner yang lebih dramatis:
```css
.pixel-border-animated::before {
  animation: corner-pulse-tl 3s ease-in-out infinite;
}
@keyframes corner-pulse-tl {
  0%,100% { width: 10px; height: 10px; opacity: 1; }
  50%      { width: 14px; height: 14px; opacity: 0.7; }
}
```

#### 2C. Dashboard Side Panel Redesign
- Tambahkan **holographic agent portrait** — avatar besar dengan radial gradient glow + diagonal stripe pattern di background
- Stat bars agent (Tasks, Success, Uptime) menjadi vertical bar chart yang animated
- Tambahkan **"NEURAL LINK"** indicator — animated line yang menghubungkan agent ke stat bars
- Tambahkan countdown timer untuk current task (berapa menit tersisa)

#### 2D. Crew Page Enhancement
- Tambahkan **"SORT BY"** dropdown: Level, Tasks, XP, Role
- Kartu yang sedang dipilih mendapat **holographic shimmer** — rainbow gradient yang bergerak diagonal
- Panel kanan: tambahkan **radar chart** mini untuk visualisasi agent capability (Speed/Quality/Efficiency/Innovation/Stability)
- Tambahkan **Agent Bio** field — deskripsi singkat per agent

#### 2E. Ship Comms Enhancement
- Tambahkan **voice waveform animation** saat agent sedang "typing" — bar chart yang berdenyut
- Pesan agent dibedakan dengan **colored left border** sesuai role color
- Tambahkan **timestamp relative** ("2s ago", "5m ago") selain absolute time
- Quick Command buttons punya **cooldown animation** setelah diklik — shake + disabled state 3 detik
- Tambahkan **Commander reply suggestions** — 3 predefined reply saat agent mengirim pesan

#### 2F. Missions Page Enhancement  
- Tambahkan **mission path visualization** — koneksi garis antara mission yang saling terkait (locked karena previous)
- Completed mission mendapat **golden stamp** di pojok: ✓ COMPLETE dengan animasi scale in
- Tambahkan **leaderboard mini** di sidebar — top 3 agent berdasarkan tasks completed
- Tambahkan **DAILY CHALLENGE** section — 3 daily task kecil dengan reward XP kecil

---

### 🏗️ PRIORITY 3: NEW PAGES & FEATURES

#### 3A. Commander Profile Page (`/profile`)
Route baru dengan:
- **Commander stats:** Total Revenue, Stations Owned, Agents Managed, Missions Completed
- **Achievement badges grid** — pixel art badges yang unlocked/locked
- **Commander XP progress** ke rank berikutnya (ROOKIE → AGENT → COMMANDER → ADMIRAL → SOVEREIGN)
- **Activity graph** 30 hari terakhir (heatmap style seperti GitHub)
- Tombol "EXPORT REPORT" — generate summary text

#### 3B. Agent Workshop (`/workshop`)
Route baru untuk upgrade agent:
- **Upgrade tree** — visual tree dengan node yang unlockable (Research: Deep Scan → Quantum Analysis → Predictive Modeling)
- **Merge Agents** — gabungkan 2 agent level rendah menjadi 1 agent level tinggi
- **Agent Traits** — badge trait yang bisa di-equip (SPEED BOOST, NIGHT OWL, CRITIC, OPTIMIZER)
- Animasi upgrade yang dramatis — particle burst + level number flying up

#### 3C. Economic Intelligence (`/economics`)
Route baru:
- **Revenue breakdown** — pie chart per room/agent/period
- **Projection model** — line chart proyeksi 30 hari ke depan
- **Cost vs Revenue** flow diagram
- **Agent ROI table** — revenue per agent dibanding "cost" operasional

---

### ⚡ PRIORITY 4: PHASER DUNGEON UPGRADES

#### 4A. Camera Pan (Drag to Pan)
Setelah zoom ditambahkan, tambahkan drag-to-pan:
```typescript
// Di create():
scene.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
  if (ptr.isDown && !this.isDraggingAgent) {
    scene.cameras.main.scrollX -= ptr.velocity.x / scene.cameras.main.zoom;
    scene.cameras.main.scrollY -= ptr.velocity.y / scene.cameras.main.zoom;
  }
});
```

#### 4B. Agent Tooltip on Hover
Saat mouse hover atas agent di dungeon, tampilkan tooltip kecil:
- Agent name + role
- Current task (text pendek)
- Progress bar kecil

#### 4C. Room Highlight on Hover
Saat mouse hover atas room (bukan agent), room mendapat:
- Border glow lebih terang
- Cursor berubah menjadi pointer
- Mini info overlay: Room name + jumlah agents + activity level

#### 4D. Day/Night Visual Dimming
Saat malam (NIGHT OPS phase), seluruh dungeon mendapat overlay gelap semi-transparent dengan warna biru gelap. Saat DAWN, overlay fade out. Implementasi: graphics rectangle di depth paling atas dengan alpha 0–0.35.

#### 4E. Weather Particles
Tambahkan ambient particles yang berubah berdasarkan day/night phase:
- DAWN: Partikel kecil oranye/kuning melayang ke atas (seperti ember)
- DAY: Partikel cyan kecil bergerak lambat (dust motes)
- DUSK: Partikel ungu melayang turun
- NIGHT: Partikel biru gelap + occasional "shooting star" efek

---

### 🔔 PRIORITY 5: NOTIFICATION SYSTEM

#### 5A. Toast Notification Component
Buat `ToastNotification.tsx` di `artifacts/aetherion/src/components/`:
- Stack vertikal di pojok kanan bawah (di atas status bar)
- Max 4 toast sekaligus, auto-dismiss setelah 4 detik
- Types: SUCCESS (green), WARNING (amber), ERROR (red), INFO (cyan), REVENUE (gold)
- Animasi: slide in dari kanan + progress bar timeout
- Contoh: "NEXUS-1 completed task +50 XP", "INCIDENT in Research Lab!", "Revenue +$340"

#### 5B. Notification Bell di AppShell
- Bell icon di top bar dengan badge counter
- Click → dropdown panel dengan 20 notifikasi terakhir
- Mark as read, clear all

#### 5C. Event Triggers
Wire semua event ke notification system:
- Agent level up → toast SUCCESS
- Incident created → toast ERROR dengan blink
- Incident dismissed → toast SUCCESS
- Room mission complete → toast REVENUE
- Task completed (dari assign modal) → toast INFO

---

### 🌐 PRIORITY 6: REAL DATA INTEGRATION

#### 6A. Station Switching yang Proper
Saat user switch station (tombol SWITCH di dashboard), **Phaser dungeon harus reload** dengan agents dari station baru. Saat ini dungeon pakai `AGENTS_DEF` hardcoded.

Cara: Tambahkan method `StationScene.updateAgents(agents: AgentData[])` yang:
1. Reset semua agent state
2. Distribusikan agents ke rooms berdasarkan role
3. Re-render dungeon

Di Dashboard.tsx, saat `activeStationId` berubah dan `agents` dari API sudah load, panggil `sceneRef.current?.updateAgents(agents)`.

#### 6B. Real-Time Activity Feed
Buat WebSocket atau polling endpoint yang push activity baru setiap 5 detik ke frontend, sehingga activity log di dashboard dan timeline page selalu live.

#### 6C. Task Progress Real-Time
Agent di dungeon saat ini punya `pct` yang random. Wire `pct` ke actual task progress dari database (`tasks.progress` column). Poll setiap 10 detik.

---

## CATATAN TEKNIS PENTING

```
1. Wouter routing: Link menggunakan prop `href`, BUKAN `to`
2. Phaser WAJIB di-import dengan: const PhaserMod = await import('phaser')
   const Phaser = ((PhaserMod as any).default ?? PhaserMod) as typeof import('phaser')
3. lib/api-zod/src/index.ts: HANYA boleh `export * from "./generated/api"` — jangan tambah export lain
4. Agent roles yang valid: research, strategy, builder, content, growth, analytics (TIDAK ada "design")
5. Tileset: roguelikeIndoor_transparent.png — 16×16 tiles, 26×17 grid, 1px spacing
6. Vite fs.allow harus include workspace root ['../..'] untuk load tileset
7. pnpm run typecheck — selalu run ini setelah edit TypeScript untuk catch errors
8. CSS Tailwind v4: @import "tailwindcss" + @theme block — JANGAN dihapus dari index.css
9. Station Switching: gunakan useListStationAgents (bukan useListAgents) untuk agents per station
10. API hooks semua dari @workspace/api-client-react
```

---

## CARA MULAI

1. Buka project AETHERION di Replit
2. Pastikan workflow `artifacts/aetherion: web` dan `API Server` running
3. Copy prompt di atas dan paste ke Replit Agent
4. Minta Agent untuk implementasi mulai dari **PRIORITY 1 (Zoom)** terlebih dahulu karena paling konkret
5. Setelah zoom berjalan, lanjut ke **PRIORITY 2 (UI Overhaul)**
6. Gunakan `pnpm run typecheck` untuk verifikasi setiap selesai satu fitur

---

## SAMPLE AGENT PROMPT

```
Saya punya project AETHERION — Autonomous Agent Economy OS Dashboard. 
Stack: React + Vite + Phaser 3 + Express 5 + PostgreSQL + Drizzle ORM.

Tugas pertama: Implementasi zoom in/out untuk Phaser station canvas.

File utama:
- artifacts/aetherion/src/lib/stationScene.ts (class StationScene, ~1662 lines)
- artifacts/aetherion/src/components/StationCanvas.tsx (React Phaser wrapper)
- artifacts/aetherion/src/pages/Dashboard.tsx (parent yang menggunakan StationCanvas)

Yang perlu dibuat:
1. Tambahkan method setZoom/zoomIn/zoomOut/zoomReset di class StationScene
   - setZoom menggunakan this.scene.cameras.main.setZoom(level)
   - Range zoom: MIN 0.5x, MAX 2.5x
   - Mouse wheel: scene.input.on('wheel', ...) di dalam create()
2. Di StationCanvas.tsx:
   - Tambahkan zoom state (useState)
   - Tambahkan 3 tombol overlay (−, ⟳, +) di sudut kiri bawah canvas
   - Tambahkan keyboard listeners: + untuk zoom in, - untuk zoom out, 0 untuk reset
   - Tampilkan persentase zoom saat ini
3. Style tombol zoom: Space Mono font, border solid var(--ae-border), hover glow cyan

Catatan: Phaser import harus pakai dynamic import di useEffect. 
sceneRef sudah di-pass sebagai prop dari Dashboard ke StationCanvas.
```

---

*AETHERION v1.0 — Continuation Prompt — Generated 2026*
