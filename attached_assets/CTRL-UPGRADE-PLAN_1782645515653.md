# CTRL v2 — Upgrade Plan

> **Dari**: Autonomous Agent Economy OS (Dashboard + Task Engine + Phaser 3)
> **Menuju**: Mission Control for Autonomous Dev Crews on Base (Crypto-native + Real AI Execution)
> **Identitas visual tetap**: Space Station, Crew, Mission, Phaser 3 Dungeon
> **Tanggal**: 16 Juni 2026

---

## Daftar Isi

1. [Ringkasan Upgrade](#1-ringkasan-upgrade)
2. [Fitur yang Dipertahankan](#2-fitur-yang-dipertahankan)
3. [Fitur yang Dihapus/Diganti](#3-fitur-yang-dihapusdiganti)
4. [Fitur Baru — Detail per Upgrade](#4-fitur-baru--detail-per-upgrade)
5. [Penambahan Tech Stack](#5-penambahan-tech-stack)
6. [Roadmap Upgrade 12 Minggu](#6-roadmap-upgrade-12-minggu)
7. [Visual Arsitektur Baru](#7-visual-arsitektur-baru)

---

## 1. Ringkasan Upgrade

### Yang Berubah

| Aspek | CTRL v1 (Sekarang) | CTRL v2 (Target) |
|---|---|---|
| **Task Engine** | Random templates + dummy revenue | AI-generated real output via LLM |
| **Agent Wallet** | Commander wallet only | Setiap agent punya CDP Agentic Wallet on-chain (Base) |
| **Revenue** | Editable angka + random increment | USDC bounty via escrow smart contract |
| **Missions** | Auto-complete via polling | On-chain bounty + acceptance criteria |
| **Ship Comms** | Chat ke agent | + Agent-to-agent chat + multi-agent briefing |
| **GitHub** | Tidak ada | Agent bikin branch, commit, PR, review |
| **Event System** | broadcastEvent() sederhana | Full event bus + WebSocket pub/sub |
| **Agent Profile** | Nama + role + level + task | Full detail: memory, tools, token cost, logs, context |
| **Whiteboard** | Tidak ada | Briefing Room (tldraw canvas) + LLM → Mission pipeline |
| **AI Provider** | Ship Comms only | Task engine juga pakai AI |
| **Token Gate** | sessionStorage beta flag | $CTRL balance check via Base RPC + multi-tier |
| **Real-time** | TanStack Query polling | WebSocket live events |

### Filosofi Upgrade

Bukan rewrite. CTRL v1 punya fondasi visual kuat (Phaser 3 dungeon, pixel art, space station metaphor) dan API lengkap. Upgrade terjadi di **layer backend + ekonomi + integrasi**.

```
VISUAL LAYER (v1 tetap)    ← Phaser 3, Pixel UI, CRT aesthetic
       ↕
API + DB LAYER (upgrade)  ← Routes baru, schema baru, WebSocket
       ↕    
CRYPTO LAYER (baru)        ← Agent wallets, escrow contracts, x402 payments
       ↕
EXECUTION LAYER (baru)     ← Real AI task execution, GitHub integration
       ↕
EVENT BUS (baru)           ← Postgres LISTEN/NOTIFY + WebSocket broadcast
```

---

## 2. Fitur yang Dipertahankan

### ✅ Frontend (artifacts/aetherion)

| Fitur | File | Catatan Upgrade |
|---|---|---|
| Phaser 3 Dungeon Canvas | `stationScene.ts`, `StationCanvas.tsx`, `dungeonLayout.ts` | Tambah event-driven animation trigger |
| Agent Pixel Sprites | `PixelSprite.tsx` | Tambah sprite untuk 7 roles (lengkap) |
| Day/Night Cycle | `stationScene.ts` | Pertahankan |
| CRT Overlay + Scanline | `index.css` | Pertahankan |
| Color System | `index.css`, Tailwind config | Pertahankan |
| Mission Board UI | `Missions.tsx` | Tambah bounty amount display |
| Crew Grid + Role Filter | `Crew.tsx` | Tambah wallet address, on-chain status |
| Timeline | `Timeline.tsx` | Tambah filter on-chain events |
| Templates Market | `Market.tsx`, `Templates.tsx` | Tambah crypto-specific templates |
| Wallet Connect | `WalletGate.tsx`, `WalletProvider.tsx`, `WalletHeaderSync.tsx` | Upgrade ke AgentKit juga |
| Ship Comms | `ShipComms.tsx` | Tambah agent-to-agent mode |
| Station Canvas | `Dashboard.tsx` | Tambah real-time telemetry overlay |
| Layout (AppShell, Sidebar, Nav) | `layout/` | Tambah route baru (Briefing, Telemetry) |
| UI Component Library | `components/ui/` | Semua shadcn components reusable |

### ✅ Backend (artifacts/api-server)

| Fitur | File | Catatan Upgrade |
|---|---|---|
| Express Router Structure | `routes/index.ts` | Tambah router baru |
| Templates CRUD | `routes/templates.ts` | Tambah crypto templates |
| Stations/Rooms CRUD | `routes/stations.ts`, `routes/rooms.ts` | Upgrade schema |
| Agents CRUD | `routes/agents.ts` | Tambah wallet address, on-chain status |
| Tasks CRUD | `routes/tasks.ts` | Ubah ke mission model |
| Missions CRUD | `routes/missions.ts` | Tambah bounty/escrow fields |
| Dashboard Summary | `routes/dashboard.ts` | Tambah on-chain metrics |
| Health Check | `routes/health.ts` | Tambah blockchain health |
| AI Chat | `routes/ai.ts` | Upgrade provider list |
| Events (SSE) | `routes/events.ts` | Upgrade ke WebSocket |
| Auto-seed | `lib/autoSeed.ts` | Tambah crypto-native seed data |

### ✅ Database Schema (lib/db)

| Tabel | Catatan Upgrade |
|---|---|
| `templates` | Tambah category: 'defi', 'nft', 'base' |
| `stations` | Tambah `treasury_address`, `chain_id` |
| `rooms` | Tidak berubah signifikan |
| `agents` | Tambah `wallet_address`, `total_earned`, `onchain_status` |
| `tasks` | Tambah `bounty_amount`, `bounty_token`, `escrow_tx` |
| `activity` | Tambah `event_type`, `tx_hash` |
| `missions` | Tambah `reward_token`, `reward_amount`, `escrow_id` |

### ✅ Lib (OpenAPI, Zod, TanStack Query)

| Komponen | Catatan |
|---|---|
| `lib/api-spec/openapi.yaml` | Regenerate |
| `lib/api-zod/` | Regenerate |
| `lib/api-client-react/` | Regenerate |
| `lib/db/` | Migrasi: add columns, new tables |

---

## 3. Fitur yang Dihapus/Diganti

### ❌ Task Engine Random — DIGANTI

**Lama**: `taskEngine.ts` — generate random task title dari template, increment progress, add dummy revenue.

```typescript
// LAMA — random task templates
const title = pickRandom(TASK_TEMPLATES[role]);
const rev = Math.floor(Math.random() * 91) + 45;
```

**Baru**: Task engine panggil LLM (via LiteLLM / Ship Comms infra yang sudah ada) untuk generate **real output**:
- Research → real market analysis text
- Builder → real code blocks
- Content → real copywriting
- Strategy → real analysis

**File yang diubah**:
- `artifacts/api-server/src/taskEngine.ts` — rewrite
- `artifacts/api-server/src/lib/aiTaskExecutor.ts` — rewrite
- `artifacts/api-server/src/lib/outputGenerators.ts` — hapus templates, ganti LLM

### ❌ Revenue Counter Manual — DIGANTI

**Lama**: Station revenue di-update incremental random + editable manual di UI.

**Baru**: Revenue = on-chain USDC bounty settlement via escrow:
- Mission selesai → reviewer approve → escrow release USDC ke agent wallet
- Revenue di UI = total USDC earned across missions
- Tidak bisa edit manual — read-only dari on-chain data

**File yang diubah**:
- `Dashboard.tsx` — revenue tracker jadi read-only display
- `routes/stations.ts` — revenue auto-sync dari escrow events

### ❌ sessionStorage Beta Bypass — DIGANTI

**Lama**: `sessionStorage.getItem('ctrl_beta_access')` — bypass token gate.

**Baru**:
- Beta: Firebase anonymous auth atau wallet signature
- Post-TGE: Balance check `$CTRL >= 100,000` via Base RPC
- Multi-tier: Commander (100K), Admiral (500K), Fleet Admiral (1M+)

**File yang diubah**:
- `WalletGate.tsx` — real token balance check
- `WalletHeaderSync.tsx` — tier badge
- Hapus `ctrl_beta_access` logic

### ❌ TanStack Query Polling (Sebagian) — DITAMBAH WebSocket

**Lama**: Semua data via polling useQuery (refetch interval).

**Baru**: WebSocket untuk real-time event. Polling tetap untuk data statis (templates, stats).

### ❌ Fake Activity Log — DIGANTI

**Lama**: `activity` table diisi task engine dengan format random.

**Baru**: Activity dari real events:
- `mission.started`, `mission.completed`, `agent.spawned`
- `pr.created`, `pr.merged`, `bounty.claimed`
- `agent.level_up` real dari XP nyata

---

## 4. Fitur Baru — Detail per Upgrade

### 🔧 #1 Real AI Task Execution

**Deskripsi**: Agent task engine sekarang panggil LLM beneran. Bukan template random.

**Cara kerja**:
```
Task assigned → LLM call sesuai system prompt role
  → Research: real market analysis via web search
  → Builder: generate code blocks (real)
  → Content: tulis draft copy
  → Strategy: generate analysis
  → Growth: generate campaign outline
  → Analytics: compute metrics
Output disimpan di agent_outputs table + ditampilkan sbg card
```

**File baru**:
- `artifacts/aetherion/src/pages/AgentOutput.tsx`

**File diubah**:
- `taskEngine.ts`, `aiTaskExecutor.ts`, `outputGenerators.ts`

**Tech**: LiteLLM (reuse existing Ship Comms infra).

---

### 🔧 #2 Agent Wallet On-chain

**Deskripsi**: Setiap agent punya CDP Agentic Wallet di Base chain.

**Cara kerja**:
```
Spawn agent → create CDP Agentic Wallet (MPC)
  → Wallet address di agents table
  → Wallet punya balance cap + session limit
Mission complete → escrow release USDC → agent wallet
Agent total_earned = sum of all USDC received
```

**File baru**:
- `lib/agent-wallet.ts`
- `routes/agentWallet.ts`

**File diubah**:
- `schema/agents.ts`, `routes/agents.ts`, `Crew.tsx`

**Tech**: `@coinbase/agentkit`, `viem`, `dotenv`

---

### 🔧 #3 GitHub PR Integration

**Deskripsi**: Agent bisa create real GitHub branch, commit, PR, review.

**Cara kerja**:
```
Mission: "Fix bug in repo X"
  → Agent clone repo via sandbox (E2B/Docker)
  → Agent buat branch feat/ctrl-mission-xxx
  → Agent tulis code → git commit + push
  → Octokit create PR
  → PR link di tasks db
  → Security Gate review
```

**File baru**:
- `lib/githubAgent.ts`

**Tech**: `octokit`, GitHub App, E2B sandbox.

---

### 🔧 #4 Security Gate / Airlock

**Deskripsi**: Approval workflow untuk agent output.

**Cara kerja**:
```
Agent selesai → output masuk Airlock queue
  → [PENDING] — menunggu review
  → APPROVE: output dirilis + escrow dibayar
  → REJECT: output discarded, agent dapat feedback
  → REQUEST CHANGES: agent revise
```

**File baru**:
- `schema/airlock.ts`, `routes/airlock.ts`, `pages/Airlock.tsx`

**Tech**: Policy engine sederhana (Zod + JSON rules).

---

### 🔧 #5 Event Bus + WebSocket

**Deskripsi**: Upgrade broadcastEvent() ke event bus penuh.

**Cara kerja**:
```
AgentEventBus (Postgres LISTEN/NOTIFY)
  → events: agent.created, task.completed, pr.created
  → WebSocket server
  → Frontend subscribe
  → Phaser canvas trigger animation on event
```

**File baru**:
- `lib/eventBus.ts`, `lib/websocketServer.ts`

**File diubah**:
- `routes/events.ts`, `hooks/useRealtimeEvents.ts`

**Tech**: `ws`, Postgres `LISTEN/NOTIFY`

---

### 🔧 #6 Briefing Room / Whiteboard

**Deskripsi**: tldraw canvas → auto-convert ke mission.

**Cara kerja**:
```
Commander draw di Briefing Room (tldraw)
  → "Convert to Mission" button
  → LLM parse whiteboard shapes → mission spec
  → Tasks otomatis masuk Mission Board
```

**File baru**:
- `pages/BriefingRoom.tsx`, `routes/briefing.ts`, `lib/llmWhiteboardParser.ts`

**Tech**: `tldraw` SDK (MIT), LLM via existing infra.

---

### 🔧 #7 Agent Detail Page

**Deskripsi**: Full agent profile dari klik canvas.

**Panel detail**:
```
┌─ AGENT PROFILE ────────────────────┐
│ Nama, Role, Level, XP Bar         │
│ Wallet: 0x... (link Basescan)     │
│ Total Earned: $XX USDC            │
│ Status + Current Task             │
├─ MEMORY ───────────────────────────┤
│ Context window: 48% / 200K tokens │
│ Recent task history               │
├─ COST ─────────────────────────────┤
│ Total tokens used                 │
│ Estimated API cost                │
├─ TOOLS ────────────────────────────┤
│ GitHub, Browser, Terminal, dll    │
└────────────────────────────────────┘
```

**File baru**:
- `components/AgentDetailPanel.tsx`, `routes/agentMetrics.ts`

**File diubah**: `stationScene.ts`, `Dashboard.tsx`

---

### 🔧 #8 Smart Contract Escrow

**Deskripsi**: Mission bounty via smart contract di Base.

**Cara kerja**:
```
Commander deposit USDC ke MissionEscrow.sol
→ Agent selesai → submit proof (PR link)
→ Reviewer approve → escrow release → agent wallet
→ Timeout 14 hari: auto-refund
→ 2.5% fee → treasury → buyback $CTRL
```

**File baru**:
- `contracts/MissionEscrow.sol`, `CrewRegistry.sol`
- `lib/escrowService.ts`, `routes/escrow.ts`

**Tech**: Solidity + Foundry, Base Sepolia testnet.

---

### 🔧 #9 Multi-tier Token Gate

**Deskripsi**: $CTRL balance check + tier system.

**Tiers**:
- Commander (≥100K $CTRL) — full access
- Admiral (≥500K $CTRL) — premium features
- Fleet Admiral (≥1M $CTRL) — all access

**File diubah**: `WalletGate.tsx`, `TokenGate.tsx`, `constants.ts`

**Tech**: `viem useBalance`, Alchemy RPC.

---

### 🔧 #10 Scheduled/Cron Missions

**Deskripsi**: Agent kerja periodik otomatis.

**Cara kerja**: Commander set jadwal → cron trigger mission → agent auto-execute.

**File baru**: `lib/cronScheduler.ts`, `pages/Schedule.tsx`

**Tech**: `node-cron` atau `bull` (Redis).

---

## 5. Penambahan Tech Stack

### Baru di Frontend

| Package | Fungsi |
|---|---|
| `tldraw` | Whiteboard canvas |
| `@rive-app/react-canvas` | Agent animasi |
| `@coinbase/agentkit` | Agent wallet (FE) |
| `@octokit/rest` | GitHub PR viewer |
| `ws` | WebSocket client |

### Baru di Backend

| Package | Fungsi |
|---|---|
| `@coinbase/agentkit` | Agent wallet creation |
| `viem` | Blockchain interaction (BE) |
| `ws` | WebSocket server |
| `octokit` | GitHub API |
| `node-cron` / `bull` | Scheduled tasks |

### Baru di Infra

| Komponen | Biaya |
|---|---|
| E2B Sandbox | Free → $99 |
| Redis | $0 (optional) |
| Foundry | Gratis |
| Base RPC (Alchemy) | Free → $49 |
| GitHub App | Gratis |
| Coinbase CDP | Free tier |

### Penambahan Database Schema

```sql
-- agents: wallet on-chain
ALTER TABLE agents ADD COLUMN wallet_address TEXT;
ALTER TABLE agents ADD COLUMN total_earned INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN total_tokens_used BIGINT DEFAULT 0;

-- tasks: bounty + escrow
ALTER TABLE tasks ADD COLUMN bounty_amount INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN bounty_token TEXT DEFAULT 'USDC';
ALTER TABLE tasks ADD COLUMN escrow_tx TEXT;
ALTER TABLE tasks ADD COLUMN pr_url TEXT;
ALTER TABLE tasks ADD COLUMN review_status TEXT DEFAULT 'pending';

-- missions: reward
ALTER TABLE missions ADD COLUMN reward_token TEXT;
ALTER TABLE missions ADD COLUMN reward_amount INTEGER;
ALTER TABLE missions ADD COLUMN escrow_address TEXT;

-- NEW: airlock security gate
CREATE TABLE airlock (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id),
  agent_id INTEGER REFERENCES agents(id),
  output_type TEXT,
  output_data TEXT,
  status TEXT DEFAULT 'pending',
  reviewer_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

-- NEW: agent wallet transactions
CREATE TABLE agent_wallet_tx (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id),
  tx_hash TEXT,
  amount INTEGER,
  token TEXT DEFAULT 'USDC',
  type TEXT,
  mission_id INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Roadmap Upgrade 12 Minggu

### Tahap 1: Backend + AI (Minggu 1-3)

| Minggu | Fokus | Output |
|---|---|---|
| 1 | Task Engine LLM | Agent real output via AI |
| 2 | Event Bus + WebSocket | Real-time events |
| 3 | Agent Wallet (CDP) | Wallet Base Sepolia |

### Tahap 2: Crypto + Missions (Minggu 4-6)

| Minggu | Fokus | Output |
|---|---|---|
| 4 | Smart Contract Escrow | MissionEscrow.sol Sepolia |
| 5 | Airlock / Security Gate | Approval workflow |
| 6 | Multi-tier Token Gate | $CTRL balance check |

### Tahap 3: GitHub + Agent Detail (Minggu 7-9)

| Minggu | Fokus | Output |
|---|---|---|
| 7 | GitHub PR | Agent create PR |
| 8 | Agent Detail Page | Full profile UI |
| 9 | Scheduled Missions | Agent cron jobs |

### Tahap 4: Whiteboard + Polish (Minggu 10-12)

| Minggu | Fokus | Output |
|---|---|---|
| 10 | Briefing Room (tldraw) | Whiteboard → Mission |
| 11 | Dashboard upgrade | On-chain revenue, telemetry |
| 12 | Polish + QA | Ship v2 |

---

## 7. Visual Arsitektur Baru

```
VISUAL LAYER (v1 tetap)
  Phaser 3 Dungeon | Pixel UI | CRT Aesthetic
       ↕ events via WebSocket
API + DB LAYER (upgrade)
  Routes baru | Schema baru | Event Bus
       ↕ wallet/contract calls
CRYPTO LAYER (baru)
  Agent Wallets | Escrow Contracts | x402 Payments
       ↕ LLM + GitHub
EXECUTION LAYER (baru)
  Real AI Task Execution | GitHub Integration
```

---

## Ringkasan File per Upgrade

| # | Upgrade | File Baru | File Diubah |
|---|---|---|---|
| 1 | AI Task | AgentOutput.tsx | taskEngine, aiTaskExecutor, outputGenerators |
| 2 | Wallet | agent-wallet.ts, agentWallet.ts | schema/agents, routes/agents, Crew |
| 3 | GitHub | githubAgent.ts | taskEngine |
| 4 | Airlock | schema/airlock, routes/airlock, Airlock.tsx | schema/index, App |
| 5 | Event Bus | eventBus, websocketServer | events, useRealtimeEvents |
| 6 | Briefing | BriefingRoom, routes/briefing, llmWhiteboardParser | App |
| 7 | Agent Detail | AgentDetailPanel, agentMetrics | stationScene, Dashboard |
| 8 | Escrow | contracts/*.sol, escrowService, routes/escrow | package.json |
| 9 | Token Gate | — | WalletGate, TokenGate, constants |
| 10 | Cron | cronScheduler, Schedule | App |

---

## Catatan Penting

1. **Prioritas #1**: AI Task Execution — upgrade paling berdampak, fondasi semua fitur lain.

2. **Keamanan**: Semua upgrade crypto (#2, #4, #8, #9) WAJIB test di Base Sepolia dulu.

3. **Backward-compatible**: Semua perubahan kompatibel dengan existing API — tidak perlu rewrite frontend sekaligus.

4. **Visual tetap**: Phaser 3 dungeon, pixel art, CRT aesthetic — semua dipertahankan. Yang berubah adalah engine di belakang canvas.

5. **CTRL tetap CTRL**: Metafora Space Station, Crew, Mission, Airlock — makin kuat dengan crypto-native. Bukan klon SAMS.

---

*CTRL v2 — Upgrade Plan · 16 Juni 2026*
*Dari Space Station Dashboard menuju Mission Control for Autonomous Dev Crews on Base*