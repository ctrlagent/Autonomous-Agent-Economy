# AETHERION — Autonomous Agent Economy OS

> *"Command your agents. Scale your empire."*

---

## Apa itu AETHERION?

AETHERION adalah sebuah **AI Operating System Dashboard** yang dirancang untuk memvisualisasikan, mengelola, dan menskalakan jaringan agen AI yang menjalankan bisnis secara otonom. Pengguna berperan sebagai **Commander** — pemimpin yang membangun dan mengoperasikan **Space Station** (representasi bisnis digital) yang dikelola oleh tim agen AI khusus yang disebut **Crew**.

Platform ini menggabungkan elemen **game RPG pixel-art**, **business intelligence dashboard**, dan **AI agent management system** dalam satu antarmuka yang imersif dan interaktif.

---

## Konsep Inti

### Space Station = Bisnis Digital
Setiap Station merepresentasikan sebuah bisnis atau unit operasional. Station terdiri dari beberapa **Dungeon Room** — ruangan-ruangan khusus yang masing-masing menjalankan fungsi bisnis yang berbeda:

| Room | Fungsi |
|------|--------|
| **Research Lab** | Riset pasar, analisis data, eksperimen |
| **Dev Lab** | Pengembangan produk, coding, deployment |
| **Design Studio** | Kreasi visual, branding, UI/UX |
| **Marketing Hub** | Konten, campaign, growth hacking |
| **Ops Center** | Strategi, perencanaan, manajemen |
| **Analytics** | Monitoring metrik, prediksi, laporan |

### Crew Agents = Tenaga Kerja AI
Setiap agen AI memiliki **role khusus**, **level**, **status kerja**, dan **progress task** yang bisa dipantau secara real-time. Agen bergerak di dalam ruangan, berkomunikasi satu sama lain, dan menyelesaikan tugas secara otonom.

| Role | Warna | Keahlian |
|------|-------|---------|
| **Research** | Cyan `#4df0d8` | Deep scan, eksperimen, analisis |
| **Strategy** | Violet `#9b6dff` | Perencanaan taktis, prioritas |
| **Builder** | Blue `#4d7fff` | Build pipeline, deploy, coding |
| **Content** | Amber `#ffb84d` | Copywriting, media, campaign |
| **Growth** | Green `#4dff9b` | Viral loop, leads, traffic |
| **Analytics** | Red `#ff4d6d` | Metrik, prediksi, monitoring |

---

## Fitur Utama

### 1. Live Dungeon Canvas (Phaser 3)
Visualisasi real-time berupa **2D pixel-art dungeon** yang menampilkan:
- **Agen berjalan** antar ruangan dengan animasi 4-frame walk cycle
- **Siklus Hari/Malam** otomatis (300 detik per siklus): Night Ops → Dawn → Peak Hours → Dusk
- **Ambient particles** per room sesuai perannya (sparkles di Research, binary rain di Builder, radar sweep di Strategy, gold coins di Growth, dsb.)
- **Comm lines** — garis komunikasi antar agen yang sedang berinteraksi di ruangan yang sama
- **Transit orbs** — efek visual saat agen berpindah ruangan lewat koridor
- **Level-up burst** — efek partikel dramatis saat agen naik level
- **Economy flyovers** — notifikasi revenue melayang saat task selesai
- **CRT scanline** — efek retro monitor di atas seluruh kanvas
- **Incident alerts** — peringatan berkedip merah saat terjadi insiden di suatu ruangan
- **Minimap** — peta kecil di pojok kanan atas untuk navigasi cepat

### 2. Station Overview Panel
Panel detail di sisi kanan yang menampilkan:
- Status station (RUNNING / IDLE / OFFLINE)
- Jumlah agen aktif vs total
- Total tasks dan jumlah room
- Progress bar station keseluruhan
- Daftar semua Dungeon Rooms dengan warna role
- Statistik platform-wide (Total Agents, Tasks Today, Active Stations)

### 3. Activity Log (Live Feed)
Feed aktivitas real-time di sisi kiri yang mencatat setiap aksi agen:
- Deployment, analisis, penulisan konten, backtest, alert, dsb.
- Diberi warna berdasarkan role agen yang melakukan aksi
- Timestamp relatif untuk setiap entri

### 4. Crew Management (`/crew`)
Halaman roster lengkap semua agen:
- Grid card per agen dengan nama, role, level, dan status
- Filter berdasarkan role
- Indikator status (Working / Idle / Deploying / Analyzing)
- Task count per agen

### 5. Mission Log (`/missions`)
Sistem quest/misi dengan:
- Progress bar per misi
- Reward XP dan revenue
- Status: In Progress / Completed / Locked
- Visual reward berupa icon dan label

### 6. Timeline (`/timeline`)
Kronologi event seluruh platform:
- Feed vertikal dengan dot berwarna per role
- Filtering dan navigasi waktu

### 7. Station Template Marketplace (`/market`)
Marketplace untuk deploy station baru dari template:
- Kategori template (DeFi, SaaS, E-commerce, Media, dsb.)
- Modal deploy dengan preview konfigurasi
- Harga dan deskripsi tiap template

### 8. Ship Comms (`/ship-comms`)
Sistem komunikasi internal antar agen dan Commander.

---

## Arsitektur Teknis

```
AETHERION Monorepo (pnpm workspaces)
├── artifacts/
│   ├── aetherion/          # Frontend — React + Vite + Phaser 3
│   └── api-server/         # Backend — Express 5 REST API
├── lib/
│   ├── db/                 # PostgreSQL schema + Drizzle ORM
│   ├── api-spec/           # OpenAPI spec (source of truth)
│   ├── api-client-react/   # React Query hooks (Orval codegen)
│   └── api-zod/            # Zod validation schemas (Orval codegen)
└── scripts/                # Seed data, migration helpers
```

### Frontend Stack
- **React 18** + **Vite 7** — framework dan build tool
- **TypeScript 5.9** — type safety penuh
- **Tailwind CSS v4** — utility-first styling dengan custom design tokens
- **Framer Motion** — animasi transisi halaman dan komponen
- **Phaser 3** — game engine untuk dungeon canvas (lazy-loaded)
- **Wouter** — client-side routing ringan
- **React Query** — data fetching dan caching

### Backend Stack
- **Express 5** — REST API server
- **PostgreSQL** — database relasional
- **Drizzle ORM** — type-safe query builder
- **Zod** — validasi schema runtime
- **Pino** — structured logging

### API Endpoints
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/dashboard/summary` | Statistik platform-wide |
| GET | `/api/dashboard/activity` | Feed aktivitas terbaru |
| GET/POST | `/api/stations` | CRUD stations |
| GET | `/api/stations/:id/rooms` | Room dalam sebuah station |
| GET | `/api/stations/:id/agents` | Agen dalam sebuah station |
| GET | `/api/agents/:id` | Detail satu agen |
| GET | `/api/agents/:id/tasks` | Tasks milik agen |
| GET | `/api/templates` | Template marketplace |

---

## Desain Visual

AETHERION menggunakan **estetika Pixel / Retro Sci-Fi** yang konsisten:

- **Press Start 2P** — font pixel untuk semua heading dan label
- **Space Mono** — monospace untuk body text, statistik, kode
- **Dark background** `#05060a` dengan CRT scanlines overlay
- **Neon accent colors** per role (cyan, violet, blue, amber, green, red)
- **Pixel borders** dengan corner accents
- **Glowing status dots** dan progress bars bergaya retro
- **Tileset Kenney Roguelike Indoor** untuk tekstur lantai dungeon

### Siklus Warna Dungeon
Setiap room bercahaya dengan warna role-nya, menciptakan visual yang jelas dan mudah dibedakan sekilas pandang.

---

## Siklus Gameplay / Simulasi

```
[Commander login]
        ↓
[Pilih Station aktif]
        ↓
[Pantau agen bekerja di dungeon canvas]
        ↓
[Agen menyelesaikan task → pct bar penuh]
        ↓
[Economy flyover: +$Revenue muncul]
        ↓
[Room Mission Progress +1]
        ↓ (setelah 5 task selesai di room yang sama)
[Room Mission Complete → Burst effect + Reward + Unlock]
        ↓
[Revenue akumulasi → Station Level Up]
        ↓
[Unlock rooms baru / beli station template baru]
```

---

## Status & Siklus Agen

| Status | Keterangan |
|--------|-----------|
| **Working** | Agen aktif mengerjakan task, berjalan di ruangan |
| **Deploying** | Agen sedang melakukan deployment |
| **Analyzing** | Agen dalam mode analisis data |
| **Writing** | Agen memproduksi konten |
| **Active** | Agen standby siap menerima instruksi |
| **Idle** | Agen istirahat, bergerak lambat, shadow di bawahnya |

---

## Incident System

Secara berkala (setiap ~90–120 detik), sebuah **insiden acak** dapat terjadi di salah satu room:

- Border room berkedip merah
- Ikon `!` muncul di pojok room
- Countdown bar muncul di bawah room
- Insiden otomatis dismiss setelah countdown habis

Contoh insiden: `DATA ANOMALY`, `BUILD CRASH`, `METRIC SPIKE`, `CAMPAIGN FAIL`, dsb.

---

## Visi Produk

AETHERION dirancang sebagai fondasi untuk platform **AI-powered business automation** generasi berikutnya, di mana:

1. **Setiap bisnis** dapat direpresentasikan sebagai Space Station
2. **Setiap fungsi bisnis** dijalankan oleh agen AI khusus
3. **Commander** (pengguna) fokus pada strategi tingkat tinggi, bukan eksekusi detail
4. **Ekonomi virtual** mencerminkan output nyata — revenue, tasks, XP, level
5. **Marketplace template** memungkinkan siapa pun mendeploy bisnis AI dalam hitungan menit

> AETHERION bukan sekadar dashboard. Ini adalah **command center** untuk era bisnis yang dijalankan oleh AI.

---

*Dibuat dengan React · Phaser 3 · Express · PostgreSQL · TypeScript*
