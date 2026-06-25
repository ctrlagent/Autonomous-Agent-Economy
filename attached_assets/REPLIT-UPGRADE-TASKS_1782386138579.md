# CTRL v2 Upgrade — Replit Task Plan

> **Target**: Upgrade CTRL v1 (Replit) ke v2 dengan mempertahankan brand identity visual
> **Visual tetap**: Phaser 3 Dungeon, Pixel Art, CRT Aesthetic, Space Station metaphor
> **Yang berubah**: Engine backend, AI execution, crypto-native features
> **Tanggal**: 16 Juni 2026

---

## Daftar Isi

1. [Konteks & Aturan](#1-konteks--aturan)
2. [Tech Stack Saat Ini](#2-tech-stack-saat-ini)
3. [Codebase Reference Map](#3-codebase-reference-map)
4. [Roadmap Task 18 Minggu](#4-roadmap-task-18-minggu)
5. [Task Detail per Minggu](#5-task-detail-per-minggu)
6. [Acceptance Criteria](#6-acceptance-criteria)
7. [File Changes Summary](#7-file-changes-summary)
8. [v2 Narrative Texts](#8-v2-narrative-texts)
9. [v2 View Mapping (SAMS Reference)](#9-v2-view-mapping-sams-reference)
10. [Tahap 5 Detail: Kanban + Spatial 2.5D](#10-tahap-5-detail-kanban--spatial-25d)
11. [Tahap 6 Detail: Station Designer + Polish](#11-tahap-6-detail-station-designer--polish)

---

## 1. Konteks & Aturan

### Brand Identity Yang HARUS Dipertahankan

- **Metafora**: Space Station = business, Room = department, Crew = AI workers, Mission = objective, Airlock = security gate
- **Visual**: Neon-on-dark pixel aesthetic, Phaser 3 dungeon, CRT overlay, scanlines
- **Color palette**: `--ae-cyan: #5b8fff`, `--ae-violet: #9b6dff`, `--ae-blue: #4d7fff`, `--ae-amber: #ffb84d`, `--ae-green: #4dff9b`, `--ae-red: #ff4d6d`
- **Typography**: Press Start 2P (headings), Space Mono (body)
- **6 Room types**: Research Lab, Dev Lab, Design Studio, Marketing Hub, Ops Center, Analytics
- **7 Agent roles**: research, strategy, builder, content, growth, analytics, design
- **Pixel art style**: 8×17 sprites, hand-crafted, no images
- **5 Core views**: Station, Crew, Missions, Timeline, Market

### Yang BOLEH Berubah (Sesuai v2 Conversation)

- **Teks narasi** di UI: dari "AI workers" → "autonomous dev crews", dari "tasks" → "bounties", dari "templates" → "station blueprints"
- **Konsep AI**: dari "AI workers" → "AI dev crew with crypto wallets"
- **Tambah**: Agent Wallet, GitHub PR, Security Gate/Airlock, Briefing Room, Scheduled Missions
- **Tambah**: Smart contract escrow, $CTRL token gate, multi-tier access
- **Tambah**: Real AI task execution (LLM, bukan template)

### Yang TIDAK Boleh Diubah

- Phaser 3 station scene rendering
- Pixel art sprite system
- CRT overlay CSS
- Color tokens CSS variables
- Room layout (30×22 grid, 6 rooms, 7 corridors)
- Agent name conventions (VECTOR-9, NEXUS-1, dll)
- Mission auto-completion polling pattern

---

## 2. Tech Stack Saat Ini

### Frontend (artifacts/aetherion)

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI |
| Vite | 7 | Dev server, HMR |
| Tailwind CSS | v4 | Styling |
| Phaser | 3/4 | Dungeon canvas |
| Wouter | latest | Routing |
| wagmi + viem | v2 | Wallet |
| TanStack Query | v5 | Server state |
| Framer Motion | latest | Animations |
| Lucide React | latest | Icons |

### Backend (artifacts/api-server)

| Technology | Version | Purpose |
|---|---|---|
| Express | 5 | REST API |
| Drizzle ORM | latest | DB |
| Zod | latest | Validation |
| pg | latest | PostgreSQL |

### Lib

- `@workspace/api-spec` — OpenAPI 3.0
- `@workspace/api-client-react` — TanStack Query hooks
- `@workspace/api-zod` — Zod schemas
- `@workspace/db` — Drizzle schema

---

## 3. Codebase Reference Map

### File Penting yang Akan Dimodifikasi/Dibaca

| Path | Lines | Fungsi |
|---|---|---|
| `artifacts/aetherion/src/lib/stationScene.ts` | 1715 | Phaser scene utama, render agent + room |
| `artifacts/aetherion/src/lib/dungeonLayout.ts` | 49 | Definisi 6 rooms + 7 corridors |
| `artifacts/aetherion/src/pages/Dashboard.tsx` | 817 | Main dashboard page |
| `artifacts/aetherion/src/pages/ShipComms.tsx` | 541 | AI chat dengan agent |
| `artifacts/aetherion/src/components/WalletGate.tsx` | 23 | Token gate |
| `artifacts/aetherion/src/components/WalletHeaderSync.tsx` | 17 | Inject wallet header |
| `artifacts/aetherion/src/App.tsx` | 78 | Routes |
| `artifacts/aetherion/src/index.css` | 498 | Design system + CRT |
| `artifacts/api-server/src/taskEngine.ts` | 293 | Tick loop 8s |
| `artifacts/api-server/src/lib/aiTaskExecutor.ts` | 193 | LLM call |
| `artifacts/api-server/src/lib/outputGenerators.ts` | 424 | Template fallback |
| `artifacts/api-server/src/routes/ai.ts` | 141 | Ship Comms API |
| `lib/db/src/schema/agents.ts` | 25 | Agent table |
| `lib/db/src/schema/tasks.ts` | 22 | Task table |
| `lib/db/src/schema/missions.ts` | 24 | Mission table |
| `lib/db/src/schema/stations.ts` | 26 | Station table (punya `ownerAddress`) |
| `lib/db/src/schema/agentOutputs.ts` | 19 | Output table |
| `lib/db/src/schema/serverConfig.ts` | 9 | Key-value config |

### Routes Saat Ini (Backend)

| Path | Router |
|---|---|
| `/` | `healthRouter` |
| `/templates` | `templatesRouter` |
| `/stations` | `stationsRouter` |
| `/agents` | `agentsRouter` |
| `/tasks` | `tasksRouter` |
| `/dashboard` | `dashboardRouter` |
| `/missions` | `missionsRouter` |
| `/ai` | `aiRouter` |
| `/events` | `eventsRouter` (SSE) |
| `/rooms` | `roomsRouter` |

### Routes Frontend Saat Ini

```
/                       → Marketing
/welcome                → Marketing
/marketing              → Marketing
/docs                   → Docs
/app                    → Dashboard
/app/crew               → Crew
/app/missions           → Missions
/app/timeline           → Timeline
/app/templates          → Market
/app/ship-comms         → ShipComms
/app/settings           → Settings
/app/profile            → Profile
/app/agents             → Agents
/app/stations           → Stations
/app/stations/:id       → Dashboard
/app/rooms/:id          → RoomDetail
```

### Orphan pages (tidak di-route)

`Home.tsx`, `Templates.tsx`, `TokenGate.tsx`, `StationDetail.tsx` — ada di filesystem tapi tidak dipakai.

---

## 4. Roadmap Task 18 Minggu

### Tahap 1: Backend + AI (Minggu 1-3)

| Minggu | Fokus | Output |
|---|---|---|
| 1 | Real AI Task Engine | LLM-powered, bukan template |
| 2 | Event Bus + WebSocket | Real-time events |
| 3 | Agent Wallet (CDP) | Wallet per agent |

### Tahap 2: Crypto + Missions (Minggu 4-6)

| Minggu | Fokus | Output |
|---|---|---|
| 4 | Smart Contract Escrow | MissionEscrow.sol |
| 5 | Security Gate / Airlock | Approval workflow |
| 6 | Multi-tier Token Gate | $CTRL balance check |

### Tahap 3: GitHub + Agent Detail (Minggu 7-9)

| Minggu | Fokus | Output |
|---|---|---|
| 7 | GitHub PR Integration | Agent create PR |
| 8 | Agent Detail Page | Full profile |
| 9 | Scheduled Missions | Cron tasks |

### Tahap 4: Whiteboard + Polish (Minggu 10-12)

| Minggu | Fokus | Output |
|---|---|---|
| 10 | Briefing Room (tldraw) | Whiteboard → Mission |
| 11 | Dashboard upgrade | On-chain revenue |
| 12 | Polish + QA + Ship v2.0 core | Foundation release |

### Tahap 5: Kanban Wall + Spatial 2.5D (Minggu 13-15)

| Minggu | Fokus | Output |
|---|---|---|
| 13 | Kanban Wall (replace Missions) | 4-column board |
| 14 | Station Canvas 2.5D upgrade | Isometric pixel art |
| 15 | Spatial Objects (Vault, Gate, Whiteboard) | Phaser primitives |

### Tahap 6: Station Designer + Polish (Minggu 16-18)

| Minggu | Fokus | Output |
|---|---|---|
| 16 | Station Designer (Spatial CAD) | Drag-drop room editor |
| 17 | Airlock full view + Reviews | GitHub PR inline |
| 18 | Polish + QA + Ship v2.0 full | Production release |

---

## 5. Task Detail per Minggu

### 🔧 MINGGU 1: Real AI Task Engine

**Goal**: Replace random template output dengan real LLM output. Task engine sudah punya dual pipeline (executeAiTask → fallback generateOutput), sekarang pastikan AI path default.

#### Task 1.1: Improve AI Task Executor

**File**: `artifacts/api-server/src/lib/aiTaskExecutor.ts` (193 lines, 6 role prompts)

**Yang harus dilakukan**:
- Tambah 7th role: `design` (UI/UX focus, output berupa design system specs)
- Upgrade system prompts supaya lebih action-oriented:
  - Research → output markdown research report dengan 3 key findings
  - Strategy → output action plan dengan 3 tactical steps
  - Builder → output code snippet (TypeScript) + commit message
  - Content → output ready-to-publish copy (Twitter thread format)
  - Growth → output A/B test hypothesis + metrics
  - Analytics → output metrics dashboard dengan 3 KPIs
  - Design → output design tokens + component structure
- Tambah task description (bukan cuma title) sebagai input ke LLM
- Output harus terstruktur: `{ type: "ai_report", title, content: markdown, provider, model, tokens_used }`
- Tambah error handling: retry 1x kalau network fail

**Acceptance**:
- [ ] `executeAiTask('design', ...)` jalan tanpa error
- [ ] Output ≥ 300 kata
- [ ] `tokens_used` tracked di response
- [ ] Fallback ke `generateOutput` kalau no API key

#### Task 1.2: Improve Task Engine Tick

**File**: `artifacts/api-server/src/taskEngine.ts` (293 lines)

**Current flow** (line-by-line):
- Lines 50-80: Get all agents from DB
- Lines 80-150: Tick logic per agent
- Lines 150-200: Task completion + XP award
- Lines 200-250: Auto-start new task

**Yang harus dilakukan**:
- Tambah logging: setiap tick log jumlah working/idle agents
- Tambah metric: average task duration tracked
- Improve `task_complete` event: tambah `output_id`, `agent_role`, `reward`
- Tambah mission progress update saat task complete

**Acceptance**:
- [ ] Tick interval log muncul tiap 8 detik
- [ ] Task complete event payload lebih lengkap
- [ ] Mission `current` ter-increment saat task complete

#### Task 1.3: Add Output Display in UI

**File**: `artifacts/aetherion/src/components/AgentOutputCard.tsx` (existing)

**Yang harus dilakukan**:
- Tambah display untuk AI markdown report (bukan cuma template JSON)
- Render markdown via `react-markdown` package (install jika belum ada)
- Tambah "Copy" button
- Tambah "View raw" toggle
- Tambah "Token used" indicator kecil

**Acceptance**:
- [ ] AI-generated output render sebagai markdown
- [ ] Template-generated output render sebagai card
- [ ] Copy button work

---

### 🔧 MINGGU 2: Event Bus + WebSocket

**Goal**: Upgrade dari SSE ke WebSocket untuk real-time bidirectional events.

#### Task 2.1: Install WebSocket Server

**Command**:
```bash
cd artifacts/api-server
pnpm add ws
pnpm add -D @types/ws
```

#### Task 2.2: Create Event Bus

**File baru**: `artifacts/api-server/src/lib/eventBus.ts`

**Spesifikasi**:
```typescript
type AgentEvent = 
  | { type: 'agent.spawned', agentId: number, role: string }
  | { type: 'agent.level_up', agentId: number, level: number }
  | { type: 'task.completed', taskId: number, agentId: number, outputId: number }
  | { type: 'mission.completed', missionId: number }
  | { type: 'bounty.claimed', missionId: number, agentId: number, txHash: string }
  | { type: 'pr.created', taskId: number, prUrl: string }
  | { type: 'airlock.approved', taskId: number, reviewer: string }
  | { type: 'airlock.rejected', taskId: number, reason: string };

class EventBus {
  emit(event: AgentEvent): void;
  subscribe(handler: (event: AgentEvent) => void): () => void;
}
```

**Storage**: In-memory + optional Postgres LISTEN/NOTIFY

#### Task 2.3: WebSocket Server

**File baru**: `artifacts/api-server/src/lib/websocketServer.ts`

**Spesifikasi**:
- Attach ke existing Express HTTP server
- Path: `/ws/events`
- Auth: optional JWT atau wallet signature
- Heartbeat: ping every 30s

#### Task 2.4: Frontend WebSocket Client

**File baru**: `artifacts/aetherion/src/hooks/useRealtimeEvents.ts`

**Spesifikasi**:
- Auto-reconnect on disconnect
- Filter events by type
- Cache last 100 events

**File diubah**: `artifacts/aetherion/src/pages/Dashboard.tsx`
- Subscribe ke events
- Trigger Phaser animation on event
- Update mission/agent state real-time

**Acceptance**:
- [ ] Task complete di backend → Phaser trigger animasi
- [ ] Level up di backend → UI update tanpa polling
- [ ] Auto-reconnect kalau WS putus

---

### 🔧 MINGGU 3: Agent Wallet (CDP)

**Goal**: Setiap agent punya wallet on-chain di Base Sepolia.

#### Task 3.1: Schema Migration

**File**: `lib/db/src/schema/agents.ts`

```sql
ALTER TABLE agents ADD COLUMN wallet_address TEXT;
ALTER TABLE agents ADD COLUMN total_earned INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN total_tokens_used BIGINT DEFAULT 0;
```

#### Task 3.2: Install Coinbase AgentKit

```bash
cd artifacts/api-server
pnpm add @coinbase/agentkit viem dotenv
```

#### Task 3.3: Create Agent Wallet Service

**File baru**: `artifacts/api-server/src/lib/agentWallet.ts`

**Spesifikasi**:
```typescript
// Saat agent di-spawn, create wallet
async function createAgentWallet(agentId: number, name: string): Promise<string> {
  // panggil CDP AgentKit untuk create EOA di Base Sepolia
  // return wallet address
  // save ke agents.wallet_address
}

async function getAgentBalance(agentId: number): Promise<number> {
  // return USDC balance dari agent wallet
}

async function transferToAgent(agentId: number, amount: number, txHash: string): Promise<void> {
  // log di agent_wallet_tx table
}
```

#### Task 3.4: API Routes

**File baru**: `artifacts/api-server/src/routes/agentWallet.ts`

**Endpoints**:
- `GET /api/agents/:id/wallet` — return wallet info
- `GET /api/agents/:id/wallet/balance` — USDC balance
- `GET /api/agents/:id/wallet/transactions` — tx history

**Register di**: `artifacts/api-server/src/routes/index.ts`

#### Task 3.5: Frontend Display

**File diubah**: `artifacts/aetherion/src/pages/Crew.tsx`

**Tambah**:
- Wallet address badge di agent card
- Link ke BaseScan
- Total earned USDC
- Copy address button

**Acceptance**:
- [ ] Spawn agent baru → wallet auto-created
- [ ] Crew page tampil wallet address + BaseScan link
- [ ] Balance check via viem ke Base Sepolia RPC

---

### 🔧 MINGGU 4: Smart Contract Escrow

**Goal**: Mission bounty via smart contract di Base Sepolia.

#### Task 4.1: Install Foundry

**Command** (jalankan di Replit shell):
```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
```

#### Task 4.2: Create Contracts Directory

```bash
mkdir -p contracts
cd contracts
forge init --no-git --no-commit
```

#### Task 4.3: Write MissionEscrow.sol

**File baru**: `contracts/src/MissionEscrow.sol`

**Spesifikasi**:
```solidity
contract MissionEscrow is Ownable, ReentrancyGuard {
    struct Mission {
        address depositor;
        address agent;
        uint256 amount;
        uint256 deadline;
        bool completed;
        bool refunded;
        bytes32 proofHash;
    }
    
    mapping(uint256 => Mission) public missions;
    uint256 public missionCount;
    address public treasury;
    uint256 public feeBps = 250; // 2.5%
    
    function deposit(address agent, uint256 deadline) external payable returns (uint256 missionId);
    function submitProof(uint256 missionId, bytes32 proofHash) external;
    function approve(uint256 missionId) external;
    function refund(uint256 missionId) external;
    function setTreasury(address _treasury) external onlyOwner;
}
```

**Dependencies**: OpenZeppelin (USDC, Ownable, ReentrancyGuard)

#### Task 4.4: Deploy to Base Sepolia

```bash
forge create --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $DEPLOYER_KEY \
  --etherscan-api-key $BASESCAN_API \
  src/MissionEscrow.sol:MissionEscrow
```

#### Task 4.5: Backend Escrow Service

**File baru**: `artifacts/api-server/src/lib/escrowService.ts`

**Spesifikasi**:
- `depositBounty(missionId, amount)` — call `deposit()` on contract
- `submitProof(missionId, proofHash)` — call `submitProof()`
- `approveMission(missionId)` — call `approve()`
- Listen ke `MissionApproved` event → log ke `agent_wallet_tx` table

**Tech**: viem, Base Sepolia RPC (Alchemy)

#### Task 4.6: API Routes

**File baru**: `artifacts/api-server/src/routes/escrow.ts`

**Endpoints**:
- `POST /api/escrow/deposit` — body: `{ missionId, amount, agentAddress }`
- `POST /api/escrow/approve/:missionId` — body: `{ proofHash }`
- `GET /api/escrow/:missionId` — return escrow status

**Register di**: `artifacts/api-server/src/routes/index.ts`

**Acceptance**:
- [ ] MissionEscrow deployed ke Base Sepolia
- [ ] Deposit USDC via backend
- [ ] Approve mission release USDC ke agent
- [ ] Tx hash saved ke DB

---

### 🔧 MINGGU 5: Security Gate / Airlock

**Goal**: Approval workflow untuk agent output (PR, code, content) sebelum release ke mission.

#### Task 5.1: Schema

**File baru**: `lib/db/src/schema/airlock.ts`

```typescript
export const airlock = pgTable('airlock', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id),
  agentId: integer('agent_id').references(() => agents.id),
  outputType: text('output_type'),
  outputData: text('output_data'),
  status: text('status').default('pending'),
  reviewerNotes: text('reviewer_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
});
```

**Register di**: `lib/db/src/schema/index.ts`

#### Task 5.2: Task Engine Integration

**File diubah**: `artifacts/api-server/src/taskEngine.ts`

- Saat task complete dengan output → insert ke airlock table (status: pending)
- Task reward diberikan setelah airlock approved

#### Task 5.3: API Routes

**File baru**: `artifacts/api-server/src/routes/airlock.ts`

**Endpoints**:
- `GET /api/airlock?status=pending` — list pending reviews
- `POST /api/airlock/:id/approve` — approve output
- `POST /api/airlock/:id/reject` — reject + reason
- `POST /api/airlock/:id/changes` — request changes

**Register di**: `artifacts/api-server/src/routes/index.ts`

#### Task 5.4: Frontend Airlock Page

**File baru**: `artifacts/aetherion/src/pages/Airlock.tsx`

**Spesifikasi**:
- List pending reviews
- Per item: agent name, output preview, approve/reject buttons
- Filter by role
- Stats: total approved, total rejected, total pending

**Tambah route di**: `artifacts/aetherion/src/App.tsx`
- `/app/airlock` → `Airlock`

**Tambah nav di**: layout Sidebar

**Acceptance**:
- [ ] Task complete → airlock entry created
- [ ] Commander approve di Airlock page → task reward given
- [ ] Reject → task fails, agent dapat feedback

---

### 🔧 MINGGU 6: Multi-tier Token Gate

**Goal**: $CTRL balance check + tier system (Commander/Admiral/Fleet Admiral).

#### Task 6.1: Constants

**File baru**: `artifacts/aetherion/src/lib/constants.ts`

```typescript
export const CTRL_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'; // TODO: Base mainnet TGE
export const CTRL_TOKEN_DECIMALS = 18;

export const TIER_THRESHOLDS = {
  commander: 100_000,
  admiral: 500_000,
  fleetAdmiral: 1_000_000,
};

export const TIER_NAMES = {
  0: 'Recruit',
  1: 'Commander',
  2: 'Admiral',
  3: 'Fleet Admiral',
};

export const TIER_FEATURES = {
  0: ['1 station', '3 agents', 'basic features'],
  1: ['3 stations', '10 agents', 'Airlock', 'Bounties'],
  2: ['10 stations', '30 agents', 'all features', 'priority support'],
  3: ['unlimited', 'unlimited agents', 'beta access', 'governance vote'],
};
```

#### Task 6.2: WalletGate Upgrade

**File diubah**: `artifacts/aetherion/src/components/WalletGate.tsx`

**Logic baru**:
```typescript
const { address, isConnected } = useAccount();
const { data: balance } = useBalance({
  address,
  token: CTRL_TOKEN_ADDRESS,
  chainId: base.id,
});

const tier = useMemo(() => {
  if (!balance) return 0;
  const value = parseFloat(balance.formatted);
  if (value >= TIER_THRESHOLDS.fleetAdmiral) return 3;
  if (value >= TIER_THRESHOLDS.admiral) return 2;
  if (value >= TIER_THRESHOLDS.commander) return 1;
  return 0;
}, [balance]);
```

**Render**:
- Tier 0 → `<TokenGate onBetaAccess={...} />` (existing)
- Tier ≥ 1 → `{children}` dengan tier context provider

**Beta bypass** (untuk testing): tetap support `sessionStorage.getItem('ctrl_beta_access')` tapi log warning

#### Task 6.3: Tier Provider

**File baru**: `artifacts/aetherion/src/components/TierProvider.tsx`

```typescript
const TierContext = createContext<{
  tier: 0 | 1 | 2 | 3;
  features: string[];
  upgradeUrl: string;
}>(...);
```

#### Task 6.4: Tier Badge di Header

**File diubah**: `artifacts/aetherion/src/components/WalletHeaderSync.tsx`

- Tambah tier badge dengan role color
- Hover → show features list

**Acceptance**:
- [ ] Connect wallet → check $CTRL balance
- [ ] Tier badge muncul dengan color sesuai role
- [ ] Tier 0 lihat TokenGate
- [ ] Tier ≥ 1 dapat full access

---

### 🔧 MINGGU 7: GitHub PR Integration

**Goal**: Agent bisa create real GitHub branch, commit, PR via Octokit.

#### Task 7.1: Install Octokit

```bash
cd artifacts/api-server
pnpm add octokit
```

#### Task 7.2: Schema Update

**File diubah**: `lib/db/src/schema/tasks.ts`

```sql
ALTER TABLE tasks ADD COLUMN pr_url TEXT;
ALTER TABLE tasks ADD COLUMN branch_name TEXT;
ALTER TABLE tasks ADD COLUMN review_status TEXT DEFAULT 'pending';
```

#### Task 7.3: GitHub Agent Service

**File baru**: `artifacts/api-server/src/lib/githubAgent.ts`

**Spesifikasi**:
```typescript
async function createBranch(taskId: number): Promise<string> {
  // branch name: ctrl-mission-{taskId}-{timestamp}
  // return branch name
}

async function commitFiles(branch: string, files: { path: string, content: string }[]): Promise<string> {
  // commit + push
  // return commit SHA
}

async function createPR(taskId: number, title: string, body: string): Promise<string> {
  // create PR
  // return PR URL
  // save ke tasks.pr_url
}
```

**Auth**: GitHub App (recommended) atau Personal Access Token untuk testing

#### Task 7.4: Builder Agent Integration

**File diubah**: `artifacts/api-server/src/lib/aiTaskExecutor.ts`

- Role `builder` di system prompt: tambah instruksi generate TypeScript code dengan format:
```
[FILE: src/example.ts]
\`\`\`typescript
// code here
\`\`\`
[COMMIT_MESSAGE]
feat: add new feature
```

- Tambah post-processor: parse `[FILE: ...]` blocks → call `commitFiles()`

#### Task 7.5: API Routes

**File baru**: `artifacts/api-server/src/routes/github.ts`

**Endpoints**:
- `GET /api/tasks/:id/pr` — get PR info
- `POST /api/tasks/:id/pr/merge` — merge PR (jika approved via Airlock)

**Register di**: `artifacts/api-server/src/routes/index.ts`

**Acceptance**:
- [ ] Builder agent task → real PR created
- [ ] PR URL saved ke task
- [ ] Merge via Airlock approval

---

### 🔧 MINGGU 8: Agent Detail Page

**Goal**: Full agent profile dengan memory, cost, logs.

#### Task 8.1: Schema Updates

**File diubah**: `lib/db/src/schema/agents.ts`

```sql
ALTER TABLE agents ADD COLUMN memory TEXT;
ALTER TABLE agents ADD COLUMN tools JSONB DEFAULT '[]';
ALTER TABLE agents ADD COLUMN cost_total INTEGER DEFAULT 0;
```

#### Task 8.2: Agent Metrics API

**File baru**: `artifacts/api-server/src/routes/agentMetrics.ts`

**Endpoints**:
- `GET /api/agents/:id/memory` — current context window state
- `GET /api/agents/:id/cost` — total tokens + USD cost
- `GET /api/agents/:id/timeline` — agent-specific timeline

#### Task 8.3: Enhanced Agent Detail Panel

**File diubah**: `artifacts/aetherion/src/components/AgentDetailPanel.tsx` (existing)

**Tambah sections**:
- Wallet info (dari Minggu 3)
- Memory: context window usage bar
- Cost: total tokens, estimated cost
- Tools: list of available tools dengan status
- Recent comms (Ship Comms history)
- Recent outputs

**Acceptance**:
- [ ] Click agent di Phaser → detail panel lengkap
- [ ] Memory bar visual
- [ ] Cost tracked per agent

---

### 🔧 MINGGU 9: Scheduled/Cron Missions

**Goal**: Agent kerja periodik otomatis.

#### Task 9.1: Install Cron

```bash
cd artifacts/api-server
pnpm add node-cron
pnpm add -D @types/node-cron
```

#### Task 9.2: Schema

**File baru**: `lib/db/src/schema/schedules.ts`

```typescript
export const schedules = pgTable('schedules', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agents.id),
  cronExpression: text('cron_expression'),
  taskTitle: text('task_title'),
  taskDescription: text('task_description'),
  enabled: boolean('enabled').default(true),
  lastRunAt: timestamp('last_run_at'),
  nextRunAt: timestamp('next_run_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

#### Task 9.3: Cron Service

**File baru**: `artifacts/api-server/src/lib/cronScheduler.ts`

- Load all enabled schedules on startup
- Schedule each dengan node-cron
- On trigger: create task + assign ke agent

#### Task 9.4: API Routes

**File baru**: `artifacts/api-server/src/routes/schedules.ts`

**Endpoints**:
- `GET /api/schedules` — list all
- `POST /api/schedules` — create schedule
- `PATCH /api/schedules/:id` — enable/disable/edit
- `DELETE /api/schedules/:id`

#### Task 9.5: Frontend Schedule Page

**File baru**: `artifacts/aetherion/src/pages/Schedule.tsx`

**Spesifikasi**:
- List schedules per agent
- Cron builder UI (dropdown: minute/hour/day/month/weekday)
- Enable/disable toggle
- Last run / next run display

**Tambah route**: `/app/schedule` → `Schedule`

**Acceptance**:
- [ ] Create schedule → agent auto-execute sesuai cron
- [ ] Disable schedule → stop triggering
- [ ] List shows last/next run

---

### 🔧 MINGGU 10: Briefing Room (tldraw)

**Goal**: tldraw canvas → LLM parse → auto-create mission.

#### Task 10.1: Install tldraw

```bash
cd artifacts/aetherion
pnpm add tldraw
```

#### Task 10.2: Briefing Room Page

**File baru**: `artifacts/aetherion/src/pages/BriefingRoom.tsx`

**Spesifikasi**:
- Full-screen tldraw canvas
- Top bar: "Convert to Mission" button
- Sidebar: list of created missions dari canvas
- Background: dark theme, color palette sesuai `--ae-*` variables

#### Task 10.3: LLM Whiteboard Parser

**File baru**: `artifacts/api-server/src/lib/llmWhiteboardParser.ts`

**Spesifikasi**:
- Export tldraw state as JSON
- Send to LLM: "Parse this canvas into mission spec with tasks"
- Return: `{ mission: {title, description, tasks: [{title, agentRole}]} }`
- POST to `/api/missions` + `/api/tasks`

#### Task 10.4: API Routes

**File baru**: `artifacts/api-server/src/routes/briefing.ts`

**Endpoints**:
- `POST /api/briefing/parse` — body: `{ tldrawState }` → return mission spec
- `POST /api/briefing/create` — create mission from spec

**Tambah route**: `/app/briefing` → `BriefingRoom`

**Acceptance**:
- [ ] Draw di tldraw → click "Convert" → LLM parse → mission created
- [ ] Mission tasks auto-assigned ke agents

---

### 🔧 MINGGU 11: Dashboard Upgrade

**Goal**: On-chain revenue display, telemetry overlay, polish.

#### Task 11.1: Revenue Sync

**File diubah**: `artifacts/aetherion/src/pages/Dashboard.tsx`

- Remove manual revenue editor
- Revenue = sum of all `agent_wallet_tx.amount` where type='earned'
- Display: USDC + total transactions count

#### Task 11.2: Telemetry Overlay

**File baru**: `artifacts/aetherion/src/components/TelemetryOverlay.tsx`

**Spesifikasi**:
- Floating widget di Dashboard
- Real-time data via WebSocket:
  - Active tasks count
  - Total tokens used per minute
  - Agents online
  - Revenue/hour
  - Recent PRs created

#### Task 11.3: Station Status Indicators

**File diubah**: `artifacts/aetherion/src/lib/stationScene.ts`

- Tambah visual indicator di Phaser:
  - Green pulse di agent yang baru dapat bounty
  - Red flash di agent yang ditolak Airlock
  - Gold ring di agent yang level up

**Acceptance**:
- [ ] Revenue auto-sync dari on-chain
- [ ] Telemetry real-time
- [ ] Phaser triggers sesuai events

---

### 🔧 MINGGU 12: Polish + QA + Ship

#### Task 12.1: Audit Smart Contracts

- Run Slither
- Manual code review
- Test edge cases (timeout, refund, double-spend)

#### Task 12.2: Frontend Polish

- Loading states
- Error boundaries
- Mobile responsiveness
- Animations polish

#### Task 12.3: Documentation

- Update `CTRL.md` dengan v2 features
- Update `README.md` dengan new setup
- Create `CHANGELOG.md` (v1.0 → v2.0)

#### Task 12.4: Deploy

- Frontend: Replit autoscale atau static
- Backend: Replit reserved VM
- Contracts: Base mainnet (after audit)
- Token: $CTRL via Clanker

#### Task 12.5: Ship

- Tag release v2.0 di GitHub
- Publish release notes
- Notify community

---

## 6. Acceptance Criteria

### Global (untuk semua task)

- [ ] TypeScript strict mode — no `any` kecuali sudah di-comment dengan alasan
- [ ] ESLint pass
- [ ] Visual identity (pixel art, CRT, colors) TIDAK BERUBAH
- [ ] Backward-compatible: existing API tetap jalan
- [ ] Mobile-responsive untuk semua page baru
- [ ] Error states handled (no white screen)
- [ ] Loading states ada
- [ ] Update `CTRL.md` jika ada breaking changes

---

## 7. File Changes Summary

| Minggu | File Baru | File Diubah |
|---|---|---|
| 1 | — | `aiTaskExecutor.ts`, `taskEngine.ts`, `AgentOutputCard.tsx` |
| 2 | `eventBus.ts`, `websocketServer.ts`, `useRealtimeEvents.ts` | `Dashboard.tsx`, `taskEngine.ts` |
| 3 | `agentWallet.ts` (lib + route) | `agents.ts` (schema), `Crew.tsx` |
| 4 | `contracts/*.sol`, `escrowService.ts`, `escrow.ts` (route) | `package.json` |
| 5 | `airlock.ts` (schema), `airlock.ts` (route), `Airlock.tsx` | `taskEngine.ts`, `App.tsx`, `Sidebar.tsx` |
| 6 | `constants.ts`, `TierProvider.tsx` | `WalletGate.tsx`, `WalletHeaderSync.tsx` |
| 7 | `githubAgent.ts`, `github.ts` (route) | `aiTaskExecutor.ts`, `tasks.ts` (schema) |
| 8 | `agentMetrics.ts` (route) | `agents.ts` (schema), `AgentDetailPanel.tsx` |
| 9 | `schedules.ts` (schema), `cronScheduler.ts`, `schedules.ts` (route), `Schedule.tsx` | `App.tsx` |
| 10 | `BriefingRoom.tsx`, `briefing.ts` (route), `llmWhiteboardParser.ts` | `App.tsx` |
| 11 | `TelemetryOverlay.tsx` | `Dashboard.tsx`, `stationScene.ts` |
| 12 | `CHANGELOG.md` updated | `CTRL.md`, `README.md` |

---

## 8. v2 Narrative Texts

> Bagian ini berisi text narasi v2 yang bisa langsung dipakai di UI. Sesuai v2 conversation, tone adalah "Mission Control for Autonomous Dev Crews on Base".

### Marketing Page

**Hero title (replace existing)**:
```
CTRL — Mission Control for Autonomous Dev Crews

Command AI agents with on-chain wallets.
Deploy crews, post bounties, ship code.
Built on Base.
```

**Subtitle**:
```
Every agent in CTRL has its own crypto wallet.
Every mission pays in USDC via smart contract escrow.
Every PR is reviewed in the Airlock before merge.

You're not managing a chatbot.
You're commanding a fleet of autonomous developers.
```

**Feature list (replace existing)**:
```
▸ Agent Wallets
  Each agent holds a CDP Agentic Wallet on Base.
  Earn USDC, sign transactions, build reputation.

▸ GitHub-Native Missions
  Agents work in real repos — branches, commits, PRs.
  Code review happens in the Airlock before merge.

▸ Escrow Smart Contracts
  Missions are funded. Code ships. Funds release.
  2.5% fee buys back $CTRL on the open market.

▸ Briefing Room
  Sketch your mission on the whiteboard.
  LLM converts shapes to spec. Agents execute.

▸ $CTRL Token Gate
  100K $CTRL = Commander tier
  500K = Admiral. 1M = Fleet Admiral.
```

### Dashboard Greeting

Replace existing header text:
```
▸ "STATION ONLINE" → "FLEET ONLINE"
▸ "ACTIVE AGENTS" → "ACTIVE CREW"
▸ "TASKS COMPLETED" → "BOUNTIES CAPTURED"
▸ "REVENUE" → "USDC DISTRIBUTED"
```

### Mission Card

Add to mission cards:
```
▸ Subtitle: "Posted: $XXX USDC"
▸ Status badges: "Open" / "Active" / "Claimed" / "Merged" / "Paid"
```

### Crew Card

Add to crew cards:
```
▸ Wallet address: 0x1234...5678 [BaseScan ↗]
▸ Total earned: $XXX USDC
▸ Reputation: ★★★★☆ (auto from mission count)
```

### Ship Comms Header

```
▸ "SHIP COMMS" → "COMMS ARRAY"
▸ Subtitle: "Talk to your crew"
```

### Timeline Filters

Add new filter:
```
▸ "ON-CHAIN" — filter to show only transactions, bounties, escrow events
```

### Templates

Update template descriptions:
```
▸ "DeFi Alpha Hunter" → "DeFi Yield Hunter — 8 agents scanning for alpha"
▸ "Content Machine" → "Content Engine — 5 agents writing/distributing"
▸ "SaaS Accelerator" → "SaaS Builder — 10 agents shipping your MVP"
▸ "NFT Studio OS" → "NFT Launchpad — 7 agents minting your collection"
▸ Add new: "Base Builder" — 6 agents for Base ecosystem dapps
```

### Settings

Add new section:
```
▸ "WALLET & TIER"
  - Your tier: Commander / Admiral / Fleet Admiral
  - Features unlocked
  - Upgrade to higher tier
```

### TokenGate

Replace existing copy:
```
▸ Title: "FLEET COMMAND REQUIRES $CTRL"
▸ Body: "Hold 100,000 $CTRL on Base to command your fleet. Higher stakes unlock higher tiers."
▸ CTA: "BUY $CTRL" / "BETA ACCESS"
```

---

## 9. v2 View Mapping (SAMS Reference)

> Mockup SAMS disimpan di `docs/v2-mockups/`. Folder berisi 7 screenshot referensi
> yang digunakan untuk layout inspiration. Lihat `docs/v2-mockups/README.md`.

### Prinsip Adaptasi

**DIAMBIL dari SAMS** (layout pattern):
- 3-column layout (sidebar + canvas + right panel)
- Multi-view paradigm (spatial, kanban, whiteboard, code, CAD)
- Command Palette (CMD+K)
- Explorer tree di sidebar
- Minimap di kanan atas
- Bottom multi-tab panel
- Status bar di paling bawah
- AI Assistant sebagai right panel context-aware

**TIDAK DIAMBIL** (di-replace dengan identity CTRL):
- Visual style: SAMS 3D smooth → CTRL **pixel art 2.5D**
- Color: SAMS soft pastels → CTRL **dark navy + neon**
- Typography: SAMS Inter → CTRL **Press Start 2P + Space Mono**
- Karakter: SAMS 3D mascots → CTRL **8×17 pixel agents**
- Metafora: SAMS office → CTRL **space station**
- Terminologi: SAMS spatial/primitive → CTRL **station/room/mission/airlock**
- Theme: SAMS terang → CTRL **dark cyberpunk**

### View Mapping Table

| # | SAMS View | Mockup | CTRL v2 Equivalent | Tahap |
|---|---|---|---|---|
| 1 | 3D Spatial Room + PR Panel | `01-*.jpg` | Station Canvas (Phaser 3) | T1 |
| 2 | 3D Spatial Room + Code Editor | `02-*.jpg` | Station Canvas + Comms Array | T1 |
| 3 | Kanban Wall + System Overview | `03-*.jpg` | **Kanban Wall** (replace Missions) | **T5** |
| 4 | 3D Spatial + Command Palette | `04-*.jpg` | Command Palette (CMD+K) | T4 |
| 5 | Whiteboard + AI Assistant | `05-*.jpg` | **Briefing Room** (tldraw) | T4 |
| 6 | Spatial CAD + Properties | `06-*.jpg` | **Station Designer** (CAD) | **T6** |
| 7 | Spatial CAD (cropped) | `07-*.jpg` | Station Designer reference | T6 |

### Global Layout CTRL v2 (3-column + bottom + status)

```
+------------------------------------------------------------------+
| [SAMS] CTRL - Space Station Command   [CMD+K] [bell] [user]      |  Top Bar
+------+--------------------------------------+--------------------+
|      |                                      |                    |
| EXPL |         MAIN CANVAS / VIEW          |   AI / RIGHT        |
| ORER |  (Station | Kanban | Whiteboard | CAD) |  PANEL            |
|      |                                      |                    |
| Tree |                                      | - Comms Array      |
| -stn |                                      | - Detail Panel     |
| -crew|                                      | - Properties       |
| -miss|                                      | - Fleet Map mini   |
|      |                                      |                    |
+------+--------------------------------------+--------------------+
| [TERMINAL] [EVENTS] [OUTPUT] [AGENT LOGS] [AIRLOCK]              |  Bottom Panel
+------------------------------------------------------------------+
| main  24  0  Connected  6 Agents Online  Fleet OK                |  Status Bar
+------------------------------------------------------------------+
```

### Command Palette Mapping (SAMS → CTRL)

| SAMS Command | CTRL v2 Command |
|---|---|
| Spawn New Agent | `agent:new [role]` |
| Resize Grid | `grid:resize [w] [h]` |
| Add Primitive | `primitive:add [type]` |
| Bind Directory to Primitive | `bind:directory [path]` |
| Snap to Grid | `grid:snap` |
| - | `mission:create` |
| - | `airlock:approve` |
| - | `bounty:fund [amount]` |
| - | `crew:assign [agent]` |
| - | `station:switch [id]` |
| - | `theme:toggle` (Day/Night) |

---

## 10. Tahap 5 Detail: Kanban + Spatial 2.5D

### MINGGU 13: Kanban Wall (Replace Missions)

**Goal**: Replace existing Missions page dengan 4-column Kanban board ala GitHub Projects.

#### Task 13.1: New Schema (Mission as Kanban Card)

File: `lib/db/src/schema/missions.ts` (extend, jangan replace)

Tambah fields:
```typescript
export const missionStatus = pgEnum('mission_status_new', [
  'backlog', 'in_progress', 'in_review', 'done', 'archived'
]);
```

Lakukan migrasi:
```sql
ALTER TABLE missions ADD COLUMN column_status TEXT DEFAULT 'backlog';
ALTER TABLE missions ADD COLUMN assignee_id INTEGER REFERENCES agents(id);
ALTER TABLE missions ADD COLUMN priority TEXT DEFAULT 'medium';
ALTER TABLE missions ADD COLUMN labels JSONB DEFAULT '[]';
ALTER TABLE missions ADD COLUMN comments_count INTEGER DEFAULT 0;
ALTER TABLE missions ADD COLUMN branch_name TEXT;
ALTER TABLE missions ADD COLUMN progress INTEGER DEFAULT 0;
ALTER TABLE missions ADD COLUMN checklist JSONB DEFAULT '[]';
```

#### Task 13.2: Kanban Page Component

File baru: `artifacts/aetherion/src/pages/Kanban.tsx` (~600 baris)

Struktur:
- Header: Repository/Project name, Filter, Group by, Sort, + New Card
- 4 columns: `Backlog | In Progress | In Review | Done`
- Per card: ID, title, assignee avatar, priority badge, progress bar, comments count, branch name
- Drag-drop untuk pindah column
- Click card → slide-in detail panel di kanan

Style:
- Pakai CSS variables existing (`--ae-cyan`, `--ae-violet`, dll)
- 4 column widths equal
- Card height fixed dengan truncate
- Status dot di pojok kiri card
- Color-code column headers

#### Task 13.3: Route Update

File: `artifacts/aetherion/src/App.tsx`

```typescript
// Update route
<Route path="/app/missions" component={Kanban} />  // was Missions
// Keep Missions as redirect or deprecated
<Route path="/app/kanban" component={Kanban} />     // alias
```

#### Task 13.4: API Endpoints

File: `artifacts/api-server/src/routes/missions.ts` (extend)

- `GET /api/missions?column=backlog` — filter by column
- `PATCH /api/missions/:id/move` — body: `{ column, position }`
- `PATCH /api/missions/:id/assign` — body: `{ agentId }`
- `POST /api/missions/:id/comment` — body: `{ text, author }`
- `PATCH /api/missions/:id/checklist` — body: `{ items: [{id, text, done}] }`

#### Task 13.5: Drag-Drop Library

Install: `pnpm add @dnd-kit/core @dnd-kit/sortable`

Acceptance:
- [ ] Kanban page load dengan 4 columns
- [ ] Card bisa di-drag antar column
- [ ] Click card → detail panel slide in
- [ ] Filter by role, priority, assignee
- [ ] Mobile-responsive (column scroll horizontal)

---

### MINGGU 14: Station Canvas 2.5D Upgrade

**Goal**: Upgrade Phaser 3 dungeon dari top-down ke 2.5D isometric, pertahankan pixel art.

#### Task 14.1: Isometric Projection

File: `artifacts/aetherion/src/lib/stationScene.ts` (modify)

```typescript
// Tambah isometric matrix
const ISO_MATRIX = new Phaser.Math.Matrix4().makeScale(1, 0.5); // pseudo 3D
// Or pakai iso plugin:
// pnpm add phaser3-rex-plugins
```

#### Task 14.2: Pixel-Art Isometric Tiles

Pakai tileset existing (Kenney Roguelike) tapi apply iso transform via shader atau matrix.

Alternatif: Gunakan "fake 3D" dengan shadow + height offset per tile (lebih cepat, masih pixel art).

#### Task 14.3: Agent Sprites 2.5D

Modifikasi `PixelSprite.tsx`:
- Tambah 2 frames: front, back
- Posisikan di tile dengan offset Y untuk depth illusion
- Sprite scale berdasarkan Y position (depth)

#### Task 14.4: Camera Controls

Tambah:
- Pan dengan drag
- Zoom in/out (scroll)
- Reset view button

Acceptance:
- [ ] Canvas jadi 2.5D isometric, bukan pure top-down
- [ ] Pixel art style tetap (no smooth 3D)
- [ ] Camera bisa di-pan dan zoom
- [ ] Agents move di grid 2.5D
- [ ] Performance tetap 60fps

---

### MINGGU 15: Spatial Objects (Vault, Gate, Whiteboard)

**Goal**: Tambah spatial primitives di canvas (sesuai SAMS image 1 & 2).

#### Task 15.1: Vault (Codebase Storage)

Tambah di `dungeonLayout.ts`:
- Object type: `vault`
- Visual: cube metal abu-abu dengan kode akses (pixel art)
- Agent `green-agent` di depan vault (seperti SAMS)
- Label: "VAULT - Codebase Storage"

#### Task 15.2: Security Gate (Airlock)

Tambah:
- Object type: `security_gate`
- Visual: gate turnstile metal dengan indicator green/red
- Agent `red-agent` di gate (security review)
- Label: "SECURITY GATE - Source Control / Approvals"
- Animation: gate buka-tutup saat agent pass through

#### Task 15.3: Whiteboard

Tambah:
- Object type: `whiteboard`
- Visual: board putih dengan diagram samar (sama kayak SAMS image 2)
- Agent `purple-agent` di depan (ideation)
- Label: "WHITEBOARD - Ideation / Planning"
- Click → navigate ke Briefing Room (tldraw)

#### Task 15.4: Kanban Wall

Tambah:
- Object type: `kanban_wall`
- Visual: 4-column board dengan sticky notes pixel
- Agent `orange-agent` di depan (work tracking)
- Label: "KANBAN WALL - Work Items"
- Click → navigate ke Kanban page

#### Task 15.5: Lounge

Tambah:
- Object type: `lounge`
- Visual: sofa + plant (pixel art)
- Status: "IDLE" (tempat agent istirahat)
- Color: muted

#### Task 15.6: Desk 01

Tambah:
- Object type: `desk`
- Visual: meja + monitor pixel
- Default posisi: center canvas
- Agent bisa "sit" di desk
- Color: amber (sesuai SAMS "01" badge)

Acceptance:
- [ ] 6 spatial objects visible di canvas
- [ ] Masing-masing punya label dengan description
- [ ] Click object → action (navigate, open panel, dll)
- [ ] Animation halus, pixel art style
- [ ] BUKAN 3D smooth (tetap pixel art 2.5D)

---

## 11. Tahap 6 Detail: Station Designer + Polish

### MINGGU 16: Station Designer (Spatial CAD)

**Goal**: View terpisah untuk edit station layout ala SAMS image 6 & 7.

#### Task 16.1: New Route

File: `artifacts/aetherion/src/App.tsx`

```typescript
<Route path="/app/designer" component={StationDesigner} />
<Route path="/app/designer/:stationId" component={StationDesigner} />
```

#### Task 16.2: StationDesigner Page

File baru: `artifacts/aetherion/src/pages/StationDesigner.tsx` (~700 baris)

Layout (match SAMS image 6):
- Left: Explorer tree (existing `StationTree`)
- Center: 3D isometric grid canvas (Phaser scene baru: `designerScene.ts`)
- Right: Properties panel (2 tabs: Room | Primitive)
- Bottom: Terminal/Events tab
- Top: Command palette trigger (CMD+K)
- Right top: Workspace Map minimap

#### Task 16.3: Room Properties Panel

```typescript
interface RoomProperties {
  name: string;
  width: number;  // meters
  depth: number;
  height: number;
  gridSize: number;
  snap: boolean;
  orientation: 'iso' | 'top' | 'front';
}
```

Inputs:
- Name (text)
- Width, Depth, Height (number, +- buttons)
- Grid Size (number, 0.1 - 2.0)
- Snap toggle
- Orientation radio
- Reset View button

#### Task 16.4: Primitive Properties Panel

```typescript
interface PrimitiveProperties {
  name: string;
  type: 'desk' | 'vault' | 'whiteboard' | 'kanban' | 'gate' | 'chair';
  position: { x: number, y: number, z: number };
  rotation: { x: number, y: number, z: number };
  scale: { x: number, y: number, z: number };
  appearance: {
    material: 'glass' | 'metal' | 'wood' | 'concrete';
    opacity: number;  // 0-1
    edgeGlow: boolean;
    edgeGlowColor: string;  // hex
    edgeGlowIntensity: number;  // 0-100%
  };
  metadata: {
    name: string;
    tags: string[];
  };
}
```

#### Task 16.5: designerScene.ts

File baru: `artifacts/aetherion/src/lib/designerScene.ts` (~500 baris)

Phaser scene terpisah dari stationScene.ts:
- Isometric grid rendering
- Draggable primitives
- Snap-to-grid logic
- Multi-select with shift+click
- Properties sync two-way (panel ↔ scene)

#### Task 16.6: Command Palette Integration

Hook up CMD+K dengan commands:
- `agent:new` — spawn new agent
- `grid:resize` — resize grid
- `primitive:add` — add new primitive
- `bind:directory` — bind folder ke primitive
- `grid:snap` — toggle snap

Acceptance:
- [ ] `/app/designer` route load StationDesigner
- [ ] Isometric grid visible
- [ ] Can drag primitives
- [ ] Properties panel update real-time
- [ ] CMD+K buka command palette
- [ ] Save state ke DB (rooms + custom primitives)

---

### MINGGU 17: Airlock Full View + Reviews

**Goal**: Dedicated page untuk review agent output, integrasi GitHub PR inline.

#### Task 17.1: Airlock Page Upgrade

File: `artifacts/aetherion/src/pages/Airlock.tsx` (Minggu 5 basic → Minggu 17 full)

Tambah sections (match SAMS image 1 PR panel):
- Conversation thread (multi-reviewer: Aria, Hex, Nova)
- Commits list
- Files changed (diff viewer)
- Approve / Request Changes buttons
- Review queue dengan filter

#### Task 17.2: Diff Viewer Component

File baru: `artifacts/aetherion/src/components/DiffViewer.tsx`

Library: `react-diff-viewer-continued` atau `diff2html`

```bash
pnpm add diff2html
```

#### Task 17.3: Multi-Reviewer System

```typescript
// Reviewers adalah sub-agents
const REVIEWERS = {
  'Aria': { role: 'reviewer-lead', focus: 'architecture' },
  'Hex': { role: 'reviewer-security', focus: 'security' },
  'Nova': { role: 'reviewer-quality', focus: 'tests/coverage' },
};
```

#### Task 17.4: PR Inline View

Tambah di Airlock:
- Branch name: `feature/agent-memory-persistence`
- Commit list dengan messages
- PR link ke GitHub
- Review status per reviewer (pending/approved/rejected)

Acceptance:
- [ ] Airlock page show pending reviews
- [ ] Diff viewer render code changes
- [ ] Multi-reviewer (Aria/Hex/Nova) approval
- [ ] Click Approve → release escrow + mark done
- [ ] Real-time update via WebSocket

---

### MINGGU 18: Polish + QA + Ship v2.0 Full

#### Task 18.1: View Switcher di Top Bar

Tambah tabs di top bar:
- [STATION] | [KANBAN] | [BRIEFING] | [DESIGNER] | [AIRLOCK]
- Click switch antara views
- Persistent state (localStorage)

#### Task 18.2: Command Palette Global (CMD+K)

File: `artifacts/aetherion/src/components/CommandPalette.tsx`

Trigger: CMD+K (Mac) / CTRL+K (Windows)
Display: modal overlay di center
Search: fuzzy match command names
Recent: track 5 last used
Per role color: highlight with `--ae-cyan`

#### Task 18.3: Bottom Panel (Ops Console)

File: `artifacts/aetherion/src/components/OpsConsole.tsx`

Tabs: `TERMINAL | EVENTS | OUTPUT | AGENT LOGS | AIRLOCK`
- Per tab: distinct icon + badge (event count)
- Slide up animation
- Per-agent color untuk log lines

#### Task 18.4: Status Bar

File: `artifacts/aetherion/src/components/StatusBar.tsx`

Paling bawah, fixed:
- `📍 [currentView]`
- `⏱ [uptime]`
- `⚠ [errors]`
- `📡 [connectionStatus]`
- `🚀 [agentsOnline]`
- `✓ [fleetStatus]`

#### Task 18.5: Final QA Checklist

- [ ] Semua route load tanpa error
- [ ] Mobile responsive di semua page
- [ ] Dark theme konsisten
- [ ] Pixel art style konsisten
- [ ] CRT overlay visible
- [ ] LLM fallback jalan tanpa API key
- [ ] WebSocket reconnect otomatis
- [ ] Airlock approve → escrow release → revenue update
- [ ] Briefing room → mission conversion
- [ ] Kanban drag-drop smooth
- [ ] Designer save/load state
- [ ] Command palette trigger global
- [ ] All TODO comments removed
- [ ] TypeScript strict mode pass
- [ ] ESLint pass

#### Task 18.6: Documentation & Release

- [ ] Update `CTRL.md` dengan v2.0 final
- [ ] Generate screenshots untuk README
- [ ] Tag release `v2.0.0` di GitHub
- [ ] Publish release notes
- [ ] Notify community

---

## Catatan Penting untuk Replit AI

1. **JANGAN hapus visual identity** — pixel art 2.5D, CRT, dungeon canvas, color system semua tetap.
2. **JANGAN ganti brand voice** dari "Space Station OS" ke total crypto jargon. V2 narrative di Section 8.
3. **BACKWARD-COMPATIBLE**: existing API endpoints tetap jalan. Tambah baru, jangan replace.
4. **TEST di Base Sepolia dulu** untuk semua smart contract integration.
5. **MOBILE-RESPONSIVE** untuk semua UI baru.
6. **Update CTRL.md** setelah setiap minggu selesai dengan changelog.
7. **Bertahap**: tidak harus selesaikan semua 18 minggu sekaligus. Ship v2.0 core di Minggu 12, lanjut v2.0 full di Minggu 18.
8. **Mockup reference**: `docs/v2-mockups/` (7 file JPG + README.md).
9. **Lihat mockup SAMS untuk layout inspiration**, tapi identitas visual TETAP CTRL (pixel art, dark, neon).
10. **Existing pages** (Dashboard, Crew, Missions, Timeline, Market) **TETAP ADA** di Tahap 1-4. Mulai restructure di Tahap 5.

---

*CTRL v2 Upgrade Tasks · 16 Juni 2026 (updated)*
*Brand identity preserved · 2.5D pixel art · Dark theme · Crypto-native features*
*Roadmap: 18 minggu (4.5 bulan) · Bertahap · Mockup reference included*
