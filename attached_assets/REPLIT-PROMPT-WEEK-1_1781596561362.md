# Prompt Replit AI — Minggu 1: Real AI Task Engine

> **Cara pakai**: Copy semua isi file ini → paste ke Replit AI chat. Satu prompt = satu minggu kerja.

---

## PROMPT — MULAI DI SINI

```
Kamu adalah senior full-stack engineer yang melanjutkan upgrade CTRL v1 ke v2.

# KONTEKS PROYEK

CTRL adalah Autonomous Agent Economy OS — dashboard dengan Phaser 3 pixel-art
dungeon canvas yang menampilkan AI agents (crew) bekerja di virtual space
stations. Stack: React 19 + Vite 7 + Express 5 + Drizzle ORM + PostgreSQL,
TypeScript strict mode, pnpm workspace monorepo.

**TASK PLAN LENGKAP**: baca file `REPLIT-UPGRADE-TASKS.md` di root project
untuk konteks 12 minggu. Sekarang kita eksekusi **MINGGU 1** saja.

# ATURAN KERAS (JANGAN DILANGGAR)

1. **JANGAN hapus visual identity** — pixel art, CRT overlay, color system
   (`--ae-cyan`, `--ae-violet`, dll di `src/index.css`) semua TETAP.
2. **BACKWARD-COMPATIBLE** — semua existing API routes tetap jalan. Tambah
   baru, jangan replace.
3. **TIDAK BOLEH ganti brand voice** dari "Space Station OS" ke crypto
   jargon. Tone tetap mission control / sci-fi.
4. **TypeScript strict mode** — no `any` tanpa komentar alasan.
5. **Mobile-responsive** untuk semua UI baru.
6. **Test setiap perubahan** sebelum commit.
7. **Update `CTRL.md`** di akhir minggu dengan changelog minggu 1.

# MINGGU 1: Real AI Task Engine

**Goal**: Replace random template output dengan real LLM output. Saat ini
task engine sudah punya dual pipeline (executeAiTask → fallback
generateOutput) tapi AI path belum optimal. Kita perlu:
- Tambah role `design` (7th role)
- Improve system prompts supaya output lebih action-oriented
- Tambah token tracking
- Improve output display di UI (render markdown, bukan cuma JSON card)

# CODEBASE YANG HARUS KAMU KENALI DULU

Baca dan pahami file-file ini SEBELUM mulai coding:

1. `artifacts/api-server/src/taskEngine.ts` (293 baris) — tick loop utama
   - Cari fungsi `tick()`, `completeTask()`, `startTaskForAgent()`
   - Lihat bagaimana `executeAiTask` dipanggil dan fallback ke `generateOutput`

2. `artifacts/api-server/src/lib/aiTaskExecutor.ts` (193 baris) — LLM caller
   - Lihat 6 role-specific system prompts yang sudah ada
   - Lihat 3 provider functions: `callOpenAI`, `callAnthropic`, `callGemini`
   - Lihat return type `AiTaskResult { type: "ai_report", title, content }`

3. `artifacts/api-server/src/lib/outputGenerators.ts` (424 baris) — template
   fallback (JANGAN dihapus, hanya jadi fallback)
   - Lihat `generateOutput()` function

4. `artifacts/aetherion/src/components/AgentOutputCard.tsx` — UI display
   - Lihat bagaimana output di-render saat ini (kemungkinan JSON card)

5. `lib/db/src/schema/agents.ts` — agent table, lihat `role` enum (7 roles
   termasuk design)

6. `artifacts/api-server/src/lib/serverConfig.ts` atau cek `serverConfig`
   schema — untuk AI API key storage (sudah persistent via DB)

7. `package.json` di root dan di `artifacts/aetherion/` — lihat deps yang
   sudah ada (jangan duplikat)

# TASK 1.1: Improve AI Task Executor

File: `artifacts/api-server/src/lib/aiTaskExecutor.ts`

## Yang harus dilakukan:

1. **Tambah role `design` ke switch/case** — output berupa design system
   specs (color tokens, component structure, typography). System prompt
   harus明确规定:
   - Output dalam format markdown
   - Section: Design System Overview, Color Tokens, Component Structure,
     Typography, Spacing Scale
   - 300-450 kata
   - Tone: design system architect, reference Tailwind/Material/Apple HIG
     where appropriate

2. **Upgrade system prompts untuk semua 7 role** (research, strategy,
   builder, content, growth, analytics, design):
   - Research → output markdown report dengan section: Executive Summary,
     Key Findings (3 bullets), Data Points, Recommendations
   - Strategy → output action plan dengan: Objective, Tactical Steps (3),
     KPIs, Risk Mitigation
   - Builder → output code snippet (TypeScript) dalam fenced code block
     + commit message
   - Content → output ready-to-publish copy, format Twitter thread
     (numbered tweets 1/7, 2/7, dst) + LinkedIn version
   - Growth → output A/B test hypothesis dengan: Control, Variant,
     Hypothesis, Expected Uplift, Metrics to Track
   - Analytics → output metrics dashboard dengan: KPI Summary (3 metrics),
     Trend Analysis, Anomalies, Action Items
   - Design → output design system spec (lihat #1)

3. **Tambah `taskDescription` parameter** ke `executeAiTask()`:
   - Saat ini signature: `executeAiTask(role, taskTitle, agentName)`
   - Ubah jadi: `executeAiTask(role, taskTitle, taskDescription, agentName)`
   - Update semua call site di `taskEngine.ts`

4. **Tambah token tracking**:
   - Extend `AiTaskResult` interface:
     ```typescript
     interface AiTaskResult {
       type: "ai_report";
       title: string;
       content: string;  // markdown
       provider: string;
       model: string;
       tokensUsed: number;  // NEW
       costUsd: number;     // NEW (estimated)
     }
     ```
   - Hitung `tokensUsed` dari response API (OpenAI: `usage.total_tokens`,
     Anthropic: `usage.input_tokens + output_tokens`, Gemini:估算
     `prompt + max_tokens`)
   - Hitung `costUsd` dari pricing table:
     - OpenAI gpt-4o-mini: $0.15/M input, $0.60/M output
     - Anthropic claude-haiku: $0.25/M input, $1.25/M output
     - Gemini 1.5-flash: $0.075/M input, $0.30/M output

5. **Tambah error handling + retry**:
   - Wrap provider call dalam try/catch
   - Retry 1x dengan exponential backoff (1s, 2s) untuk network errors
   - Log error dengan pino (sudah ada di project)
   - Return `null` kalau retry juga gagal (supaya fallback ke template)

## Acceptance Criteria Task 1.1:
- [ ] `executeAiTask('design', 'Design dashboard', '...', 'AGENT-1')` jalan
- [ ] Output markdown ≥ 300 kata
- [ ] `tokensUsed` dan `costUsd` terisi di response
- [ ] Network error → retry 1x → fallback ke `generateOutput`
- [ ] TypeScript compile tanpa error

# TASK 1.2: Improve Task Engine Tick

File: `artifacts/api-server/src/taskEngine.ts`

## Yang harus dilakukan:

1. **Tambah per-tick logging**:
   ```typescript
   // Setiap tick() panggil:
   logger.info({
     tick: tickCount,
     workingAgents: workingCount,
     idleAgents: idleCount,
     pendingTasks: pendingCount,
   }, 'task engine tick');
   ```

2. **Track average task duration**:
   - Hitung `durationMs = completedAt - startedAt` saat task complete
   - Aggregate di in-memory map: `Map<agentId, { totalMs, count }>`
   - Expose via `getAvgTaskDuration(agentId): number`

3. **Improve `task_complete` event payload**:
   - Cari tempat broadcast event (kemungkinan via SSE atau eventBus)
   - Extend event payload:
     ```typescript
     {
       type: 'task.completed',
       taskId: number,
       agentId: number,
       agentName: string,
       agentRole: string,
       outputId: number,  // NEW
       reward: { xp: number, revenue: number },  // NEW
       durationMs: number,  // NEW
     }
     ```

4. **Trigger mission progress update** saat task complete:
   - Cari logic mission auto-completion (kemungkinan di frontend polling
     atau backend cron)
   - Tambah: saat task dengan `missionId` complete → increment
     `missions.current` di DB
   - Cek apakah target tercapai → auto-complete mission + unlock next

## Acceptance Criteria Task 1.2:
- [ ] Log muncul setiap 8 detik (atau sesuai TICK_INTERVAL_MS)
- [ ] `getAvgTaskDuration(1)` return numeric value setelah beberapa task
- [ ] `task_complete` event payload include `outputId`, `reward`,
      `durationMs`
- [ ] Mission `current` ter-increment saat task complete
- [ ] TypeScript compile tanpa error

# TASK 1.3: Add Markdown Output Display di UI

File: `artifacts/aetherion/src/components/AgentOutputCard.tsx`

## Yang harus dilakukan:

1. **Cek apakah `react-markdown` sudah terinstall**:
   ```bash
   cd artifacts/aetherion
   cat package.json | grep react-markdown
   ```
   - Kalau belum: `pnpm add react-markdown remark-gfm rehype-raw`

2. **Update component** untuk handle 2 tipe output:
   - `type: "ai_report"` → render markdown dengan react-markdown
   - Type lain (content, research, strategy, dll) → render sebagai card
     JSON (existing behavior)

3. **Tambah Markdown renderer section**:
   ```tsx
   import ReactMarkdown from 'react-markdown';
   import remarkGfm from 'remark-gfm';

   // Di dalam component:
   {output.type === 'ai_report' && (
     <div className="prose prose-invert max-w-none">
       <ReactMarkdown remarkPlugins={[remarkGfm]}>
         {output.content}
       </ReactMarkdown>
     </div>
   )}
   ```

4. **Tambah Copy button**:
   - Import `Copy` icon dari `lucide-react`
   - Tambah button di header card
   - On click: `navigator.clipboard.writeText(output.content)`
   - Show "Copied!" feedback 2 detik

5. **Tambah View Raw toggle**:
   - State: `const [viewRaw, setViewRaw] = useState(false);`
   - Toggle button: "View Raw" / "View Formatted"
   - Saat `viewRaw = true`: show `<pre>{output.content}</pre>`

6. **Tambah Token Usage indicator**:
   - Tampilkan di footer card (kalau `output.tokensUsed` ada)
   - Format: "🔋 1,234 tokens • $0.0023"
   - Style: small text, muted color

7. **Style dengan design system existing**:
   - Pakai CSS variables: `var(--ae-surface)`, `var(--ae-border)`,
     `var(--ae-cyan)`, dll
   - Tambah `markdown-output` class dengan styling pixel-art
   - Jangan override `body::after` CRT scanline

## Acceptance Criteria Task 1.3:
- [ ] AI-generated output render sebagai markdown dengan headings, lists,
      code blocks
- [ ] Template-generated output render sebagai card JSON (existing)
- [ ] Copy button copy markdown text
- [ ] View Raw toggle show/hide formatted view
- [ ] Token usage tampil kalau data ada
- [ ] Visual style konsisten dengan pixel-art theme

# CARA KERJA

1. **Mulai dari Task 1.1** (aiTaskExecutor.ts)
2. Baca file existing dulu, pahami struktur
3. Buat perubahan incremental (satu fungsi pada satu waktu)
4. Test setiap perubahan: `pnpm --filter @workspace/api-server run dev`
5. Lanjut ke Task 1.2, lalu 1.3
6. Di akhir minggu: update `CTRL.md` dengan changelog

# VERIFIKASI AKHIR MINGGU

Sebelum declare Minggu 1 selesai, jalankan:

```bash
# TypeScript check
cd ctrl-upgrade
pnpm run typecheck

# Test manual:
# 1. Set AI API key di Settings page
# 2. Tunggu 8 detik untuk tick
# 3. Lihat output di Dashboard → AgentOutputCard
# 4. Verify: markdown rendered, token count shown
# 5. Buka browser console → no errors

# Update CTRL.md dengan section baru:
echo "## v2.1 — Real AI Task Engine (Week 1)
- Added 'design' role to AI task executor
- Improved 7 role-specific system prompts (research, strategy, builder,
  content, growth, analytics, design)
- Added token tracking (tokensUsed, costUsd) to AiTaskResult
- Added error handling with 1x retry + exponential backoff
- Updated task engine tick logging with per-tick metrics
- Added mission progress update on task complete
- UI: AgentOutputCard now renders markdown via react-markdown
- UI: Added Copy button, View Raw toggle, Token Usage indicator
" >> CTRL.md
```

# OUTPUT YANG DIMINTA

Setelah selesai, laporkan:
1. File yang diubah (list dengan line counts before/after)
2. Test results (screenshot atau log output)
3. Acceptance criteria checklist (semua harus ✅)
4. Issue yang ditemukan + cara fix
5. Saran untuk Minggu 2

MULAI SEKARANG. Jangan tanya pertanyaan kecuali ada blocker nyata.
```

---

## CARA PAKAI

1. **Copy** semua teks di antara ``` ``` di atas
2. **Buka** Replit project CTRL kamu
3. **Paste** ke Replit AI chat
4. **Submit** — Replit AI akan mulai dari Task 1.1

---

## 📋 CHECKLIST SEBELUM SUBMIT

- [ ] Sudah baca & pahami `REPLIT-UPGRADE-TASKS.md` (opsional, prompt sudah self-contained)
- [ ] AI API key sudah di-set di `.env` atau Settings page
- [ ] Database running (kalau ada task yang perlu test end-to-end)
- [ ] TypeScript strict mode aktif di `tsconfig.json`

---

## 💡 TIPS

- Kalau Replit AI stuck di satu task, tambahkan:
  ```
  Stuck di [error message]. Coba approach lain: [suggestion].
  ```
- Kalau mau pause dan lanjut besok, minta Replit AI summarize progress:
  ```
  Summarize progress minggu 1. File apa saja yang sudah diubah?
  Issue apa yang masih open?
  ```
- Untuk task 1.3, kalau `react-markdown` konflik, alternatif: pakai
  `marked` + `dompurify` (lebih ringan)

---

*Prompt generated: 16 Juni 2026 · Untuk Replit AI*
*Compatible dengan: Replit Agent v3+, Claude 3.5 Sonnet, GPT-4o*
