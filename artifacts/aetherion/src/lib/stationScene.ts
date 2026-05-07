import { DUNGEON_ROOMS, DUNGEON_CORRIDORS, DUNGEON_COLS, DUNGEON_ROWS, ROLE_COLORS, type RoomDef } from './dungeonLayout';

const TILESET_URL = new URL('../../../../attached_assets/pixel-pack/roguelikeIndoor_transparent.png', import.meta.url).href;

export interface AgentData {
  id: string;
  name: string;
  role: string;
  status: string;
  roomId: string;
  pct: number;
  level: number;
}

interface Waypoint { tx: number; ty: number; }

interface AgentState extends AgentData {
  wx: number;
  wy: number;
  tx: number;
  ty: number;
  moveTimer: number;
  walkFrame: number;
  walkTimer: number;
  facing: number;
  commTarget: string | null;
  commAlpha: number;
  commTimer: number;
  // Pathfinding
  waypoints: Waypoint[];
  inTransit: boolean;
  transitOrb: { x: number; y: number; alpha: number } | null;
  transitTimer: number;
  // Progress bar
  prevPct: number;
  xpFlashTimer: number;
  xpFlashLabel: string;
}

interface BurstParticle {
  x: number; y: number; vx: number; vy: number;
  life: number; color: number;
}

interface LevelUpEffect {
  x: number; y: number;
  rings: Array<{ r: number; alpha: number }>;
  particles: BurstParticle[];
  rays: Array<{ angle: number; len: number; alpha: number }>;
  flashAlpha: number;
  timer: number;
}

interface AmbientParticle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
  color: number; size: number;
  extra?: number; // for rotating angle etc
}

interface EconomyFlyover {
  x: number; y: number;
  vx: number; vy: number;
  amount: number;
  life: number;
  color: number;
}

interface Incident {
  roomId: string;
  label: string;
  countdownMax: number;
  countdown: number;
  flashTimer: number;
  phase: 'alert' | 'active' | 'dismissed';
}

interface RoomMissionEffect {
  roomId: string;
  timer: number;
  rings: Array<{ r: number; alpha: number; speed: number }>;
  particles: BurstParticle[];
  goldFlash: number;
}

const ROOM_UNLOCK_LABELS: Record<string, string> = {
  research:  'DEEP SCAN PROTOCOL UNLOCKED',
  builder:   'RAPID BUILD PIPELINE ACTIVE',
  design:    'CREATIVE AMPLIFIER ONLINE',
  growth:    'VIRAL LOOP ENGINE BOOSTED',
  strategy:  'TACTICAL ADVANTAGE +15%',
  analytics: 'PREDICTIVE MODEL UPGRADED',
  content:   'CONTENT ENGINE UPGRADED',
};

const AGENTS_DEF: AgentData[] = [
  { id: 'a1', name: 'ARIA',  role: 'research',  status: 'Working',   roomId: 'r1', pct: 72, level: 3 },
  { id: 'a2', name: 'STRAT', role: 'strategy',  status: 'Working',   roomId: 'r2', pct: 55, level: 4 },
  { id: 'a3', name: 'FORGE', role: 'builder',   status: 'Deploying', roomId: 'r2', pct: 45, level: 3 },
  { id: 'a4', name: 'NOVA',  role: 'design',    status: 'Working',   roomId: 'r3', pct: 88, level: 2 },
  { id: 'a5', name: 'APEX',  role: 'growth',    status: 'Writing',   roomId: 'r4', pct: 30, level: 3 },
  { id: 'a6', name: 'ECHO',  role: 'analytics', status: 'Idle',      roomId: 'r6', pct: 0,  level: 2 },
  { id: 'a7', name: 'LENS',  role: 'analytics', status: 'Active',    roomId: 'r6', pct: 91, level: 3 },
  { id: 'a8', name: 'ROSE',  role: 'strategy',  status: 'Analyzing', roomId: 'r5', pct: 78, level: 2 },
];

// Room adjacency for pathfinding: each connection has corridor waypoints (tile coords)
const ROOM_PATHS: Record<string, Array<{ targetId: string; via: Waypoint[] }>> = {
  r1: [
    { targetId: 'r2', via: [{ tx: 10, ty: 4 }] },
    { targetId: 'r4', via: [{ tx: 4, ty: 11 }] },
  ],
  r2: [
    { targetId: 'r1', via: [{ tx: 10, ty: 4 }] },
    { targetId: 'r3', via: [{ tx: 20, ty: 4 }] },
    { targetId: 'r5', via: [{ tx: 14, ty: 11 }] },
  ],
  r3: [
    { targetId: 'r2', via: [{ tx: 20, ty: 4 }] },
    { targetId: 'r6', via: [{ tx: 24, ty: 11 }] },
  ],
  r4: [
    { targetId: 'r1', via: [{ tx: 4, ty: 11 }] },
    { targetId: 'r5', via: [{ tx: 10, ty: 18 }] },
  ],
  r5: [
    { targetId: 'r4', via: [{ tx: 10, ty: 18 }] },
    { targetId: 'r6', via: [{ tx: 20, ty: 18 }] },
    { targetId: 'r2', via: [{ tx: 14, ty: 11 }] },
  ],
  r6: [
    { targetId: 'r5', via: [{ tx: 20, ty: 18 }] },
    { targetId: 'r3', via: [{ tx: 24, ty: 11 }] },
  ],
};

// BFS to find waypoint path between two rooms
function findPath(fromId: string, toId: string): Waypoint[] {
  if (fromId === toId) return [];
  const visited = new Set<string>();
  const queue: Array<{ id: string; path: Waypoint[] }> = [{ id: fromId, path: [] }];
  while (queue.length) {
    const { id, path } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const neighbors = ROOM_PATHS[id] ?? [];
    for (const n of neighbors) {
      const newPath = [...path, ...n.via];
      if (n.targetId === toId) return newPath;
      queue.push({ id: n.targetId, path: newPath });
    }
  }
  return [];
}

// Furniture layout per room role: [{relX, relY, frame}] where rel is fraction of room interior
const ROOM_FURNITURE: Record<string, Array<{ rx: number; ry: number; frame: number; w?: number; h?: number }>> = {
  research: [
    { rx: 0.15, ry: 0.3, frame: 182 }, { rx: 0.15, ry: 0.6, frame: 183 },
    { rx: 0.75, ry: 0.3, frame: 182 }, { rx: 0.75, ry: 0.6, frame: 183 },
    { rx: 0.45, ry: 0.5, frame: 104 }, { rx: 0.55, ry: 0.5, frame: 105 },
  ],
  builder: [
    { rx: 0.15, ry: 0.35, frame: 79 }, { rx: 0.25, ry: 0.35, frame: 80 },
    { rx: 0.65, ry: 0.35, frame: 79 }, { rx: 0.75, ry: 0.35, frame: 80 },
    { rx: 0.45, ry: 0.65, frame: 57 }, { rx: 0.55, ry: 0.65, frame: 58 },
  ],
  design: [
    { rx: 0.2,  ry: 0.4, frame: 135 }, { rx: 0.5, ry: 0.4, frame: 136 },
    { rx: 0.75, ry: 0.4, frame: 137 },
    { rx: 0.4,  ry: 0.7, frame: 108 }, { rx: 0.6, ry: 0.7, frame: 109 },
  ],
  analytics: [
    { rx: 0.2,  ry: 0.35, frame: 53 }, { rx: 0.35, ry: 0.35, frame: 54 },
    { rx: 0.65, ry: 0.35, frame: 53 }, { rx: 0.8,  ry: 0.35, frame: 54 },
    { rx: 0.5,  ry: 0.65, frame: 55 },
  ],
  strategy: [
    { rx: 0.5, ry: 0.4, frame: 105 }, { rx: 0.35, ry: 0.4, frame: 104 },
    { rx: 0.65, ry: 0.4, frame: 106 },
    { rx: 0.5, ry: 0.65, frame: 130 },
  ],
  growth: [
    { rx: 0.5, ry: 0.4, frame: 107 }, { rx: 0.3, ry: 0.4, frame: 108 },
    { rx: 0.7, ry: 0.4, frame: 109 },
    { rx: 0.5, ry: 0.65, frame: 131 }, { rx: 0.35, ry: 0.65, frame: 132 },
  ],
};

const INCIDENT_LABELS: Record<string, string[]> = {
  research: ['DATA ANOMALY', 'EXPERIMENT FAIL', 'MEMORY LEAK'],
  builder:  ['BUILD CRASH', 'SERVER OVERLOAD', 'DEPLOY FAIL'],
  design:   ['RENDER ERROR', 'ASSET CORRUPT', 'PALETTE ERR'],
  analytics:['METRIC SPIKE', 'DATA LOSS', 'QUERY TIMEOUT'],
  strategy: ['BUDGET ALERT', 'PLAN CONFLICT', 'PRIORITY SHIFT'],
  growth:   ['CAMPAIGN FAIL', 'TRAFFIC DROP', 'LEAD LOST'],
};

// Day/Night cycle (seconds)
const DAY_CYCLE_S = 300;

export class StationScene {
  onAgentSelect?: (agent: AgentData | null) => void;
  onRoomSelect?: ((roomId: string | null) => void) | null;
  onLevelUpLabel?: (x: number, y: number, name: string, level: number) => void;
  onRevenueChange?: (delta: number) => void;
  onIncidentDismissed?: (roomId: string) => void;
  onRoomMissionComplete?: (roomId: string, roomName: string, reward: { xp: number; revenue: number; unlockLabel: string }) => void;

  private scene: import('phaser').Scene | null = null;
  private agents: AgentState[] = [];
  private agentLevels: Record<string, number> = {};
  private selectedAgentId: string | null = null;
  private selectedRoomId: string | null = null;

  private tilePx = 24;
  private offX = 0;
  private offY = 0;

  private dungeonGfx: import('phaser').GameObjects.Graphics | null = null;
  private overlayGfx: import('phaser').GameObjects.Graphics | null = null;
  private agentGfx: import('phaser').GameObjects.Graphics | null = null;
  private particleGfx: import('phaser').GameObjects.Graphics | null = null;
  private fxGfx: import('phaser').GameObjects.Graphics | null = null;
  private minimapGfx: import('phaser').GameObjects.Graphics | null = null;
  private nameTexts: import('phaser').GameObjects.Text[] = [];
  private xpTexts: Array<{ text: import('phaser').GameObjects.Text; vy: number; life: number; maxLife: number }> = [];

  private floorImages: import('phaser').GameObjects.Image[] = [];
  private furnitureImages: import('phaser').GameObjects.Image[] = [];

  private levelUpEffects: LevelUpEffect[] = [];
  private economyFlyovers: EconomyFlyover[] = [];
  private scanY = 0;

  private roomHitZones: Array<{ room: RoomDef; px: number; py: number; pw: number; ph: number }> = [];

  // Per-room ambient particles
  private ambientParticles: Map<string, AmbientParticle[]> = new Map();
  private radarAngle = 0;

  // Day/Night
  private dayTime = 0; // seconds elapsed in cycle
  private dayBrightness = 1.0;
  private dayPhase: 'PEAK HOURS' | 'NIGHT OPS' | 'DAWN' | 'DUSK' = 'PEAK HOURS';
  private dayTintR = 255;
  private dayTintG = 255;
  private dayTintB = 255;

  // Incidents
  private incidents: Incident[] = [];
  private incidentTimer = (90 + Math.random() * 30) * 60;

  // Room Mission system
  private roomMissionProgress: Map<string, number> = new Map();
  private roomMissionsComplete: Set<string> = new Set();
  private roomMissionEffects: RoomMissionEffect[] = [];

  // Room-change timer for pathfinding demo
  private roomChangeTimer = 30 + Math.random() * 30;

  // Revenue
  private totalRevenue = 3840;

  createPhaserScene(): import('phaser').Types.Scenes.CreateSceneFromObjectConfig {
    const self = this;
    return {
      preload(this: import('phaser').Scene) {
        this.load.spritesheet('roguelike', TILESET_URL, {
          frameWidth: 16,
          frameHeight: 16,
          margin: 0,
          spacing: 1,
        });
      },
      create(this: import('phaser').Scene) {
        self.scene = this;
        self.computeLayout(this.scale.width, this.scale.height);

        self.dungeonGfx  = this.add.graphics().setDepth(0);
        self.overlayGfx  = this.add.graphics().setDepth(2);
        self.particleGfx = this.add.graphics().setDepth(3);
        self.agentGfx    = this.add.graphics().setDepth(5);
        self.fxGfx       = this.add.graphics().setDepth(9);
        self.minimapGfx  = this.add.graphics().setDepth(10);

        self.drawDungeon();
        self.buildAgentStates(this);
        self.drawOverlay();

        this.input.on('pointerdown', (ptr: import('phaser').Input.Pointer) => {
          self.handleClick(ptr.x, ptr.y);
        });

        this.scale.on('resize', (gameSize: import('phaser').Structs.Size) => {
          self.computeLayout(gameSize.width, gameSize.height);
          self.drawDungeon();
          self.drawOverlay();
          self.repositionAgents();
          self.rebuildHitZones();
        });
      },
      update(time: number, delta: number) {
        const dt = delta / 16.67;
        const dtSec = delta / 1000;
        self.updateDayNight(dtSec);
        self.updateAgentMovement(dt);
        self.updateAmbientParticles(dt);
        self.drawParticles();
        self.drawAgents();
        self.updateFx(dt);
        self.drawMinimap();
        self.updateIncidents(dt);
        self.updateRoomChangeTimer(dt);
        void time;
      },
    };
  }

  private computeLayout(W: number, H: number) {
    const px = Math.floor(Math.min(W / (DUNGEON_COLS + 2), H / (DUNGEON_ROWS + 2)));
    this.tilePx = Math.max(16, Math.min(px, 30));
    this.offX = Math.floor((W - DUNGEON_COLS * this.tilePx) / 2);
    this.offY = Math.floor((H - DUNGEON_ROWS * this.tilePx) / 2);
  }

  private tp(tileX: number): number { return this.offX + tileX * this.tilePx; }
  private tpy(tileY: number): number { return this.offY + tileY * this.tilePx; }
  private ts(tiles: number): number { return tiles * this.tilePx; }

  // ─── Day/Night ────────────────────────────────────────────────────────────
  private updateDayNight(dtSec: number) {
    this.dayTime = (this.dayTime + dtSec) % DAY_CYCLE_S;
    const t = this.dayTime / DAY_CYCLE_S; // 0-1

    // Night: 0-0.2, Dawn: 0.2-0.35, Peak: 0.35-0.65, Dusk: 0.65-0.8, Night again: 0.8-1
    let r: number, g: number, b: number, brightness: number, phase: typeof this.dayPhase;
    if (t < 0.2) {
      // Night
      const f = t / 0.2;
      r = Math.round(80 + f * 10);
      g = Math.round(90 + f * 10);
      b = Math.round(160 + f * 20);
      brightness = 0.55 + f * 0.05;
      phase = 'NIGHT OPS';
    } else if (t < 0.35) {
      // Dawn
      const f = (t - 0.2) / 0.15;
      r = Math.round(90 + f * 165);
      g = Math.round(100 + f * 145);
      b = Math.round(180 - f * 80);
      brightness = 0.6 + f * 0.4;
      phase = 'DAWN';
    } else if (t < 0.65) {
      // Peak
      r = 255; g = 235; b = 200;
      brightness = 1.0;
      phase = 'PEAK HOURS';
    } else if (t < 0.8) {
      // Dusk
      const f = (t - 0.65) / 0.15;
      r = Math.round(255 - f * 165);
      g = Math.round(235 - f * 135);
      b = Math.round(200 - f * 40);
      brightness = 1.0 - f * 0.4;
      phase = 'DUSK';
    } else {
      // Night again
      const f = (t - 0.8) / 0.2;
      r = Math.round(90 - f * 10);
      g = Math.round(100 - f * 10);
      b = Math.round(160 - f * 0);
      brightness = 0.6 - f * 0.05;
      phase = 'NIGHT OPS';
    }

    this.dayTintR = r;
    this.dayTintG = g;
    this.dayTintB = b;
    this.dayBrightness = brightness;
    this.dayPhase = phase;

    // Apply tint to floor/furniture images
    const tint = ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
    for (const img of this.floorImages) img.setTint(tint);
    for (const img of this.furnitureImages) img.setTint(tint);
  }

  // ─── Dungeon drawing ─────────────────────────────────────────────────────
  private drawDungeon() {
    const g = this.dungeonGfx;
    if (!g || !this.scene) return;
    g.clear();

    // Destroy old images
    for (const img of this.floorImages) img.destroy();
    for (const img of this.furnitureImages) img.destroy();
    this.floorImages = [];
    this.furnitureImages = [];

    const W = this.scene.scale.width;
    const H = this.scene.scale.height;

    g.fillStyle(0x05060a, 1);
    g.fillRect(0, 0, W, H);

    const GRID = 24;
    g.lineStyle(1, 0x1a2040, 0.3);
    for (let x = 0; x < W; x += GRID) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.strokePath();
    }
    for (let y = 0; y < H; y += GRID) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.strokePath();
    }

    for (const cor of DUNGEON_CORRIDORS) {
      const px = this.tp(cor.tileX);
      const py = this.tpy(cor.tileY);
      const pw = this.ts(cor.tileW);
      const ph = this.ts(cor.tileH);
      g.fillStyle(0x0f1525, 1);
      g.fillRect(px, py, pw, ph);
      g.lineStyle(1, 0x2a3860, 0.7);
      g.strokeRect(px, py, pw, ph);
    }

    this.drawTiledFloor(g);
    this.drawFurniture();

    for (const room of DUNGEON_ROOMS) {
      this.drawRoom(g, room);
    }

    this.rebuildHitZones();
  }

  private drawTiledFloor(g: import('phaser').GameObjects.Graphics) {
    if (!this.scene) return;
    const T = this.tilePx;
    const hasTile = this.scene.textures.exists('roguelike');

    for (const room of DUNGEON_ROOMS) {
      for (let cy = room.tileY + 1; cy < room.tileY + room.tileH - 1; cy++) {
        for (let cx = room.tileX + 1; cx < room.tileX + room.tileW - 1; cx++) {
          const px = this.tp(cx);
          const py = this.tpy(cy);

          if (hasTile) {
            const frame = (cx * 3 + cy * 7) % 4;
            const img = this.scene.add.image(px, py, 'roguelike', frame);
            img.setOrigin(0, 0);
            img.setScale(T / 16);
            img.setTint(room.color);
            img.setAlpha(0.08);
            img.setDepth(1);
            this.floorImages.push(img);
          } else {
            const checker = (cx + cy) % 2 === 0;
            g.fillStyle(room.color, checker ? 0.055 : 0.03);
            g.fillRect(px + 1, py + 1, T - 2, T - 2);
          }
        }
      }
    }

    for (const cor of DUNGEON_CORRIDORS) {
      for (let cy = cor.tileY; cy < cor.tileY + cor.tileH; cy++) {
        for (let cx = cor.tileX; cx < cor.tileX + cor.tileW; cx++) {
          const px = this.tp(cx);
          const py = this.tpy(cy);
          if (hasTile && this.scene) {
            const img = this.scene.add.image(px, py, 'roguelike', 26);
            img.setOrigin(0, 0);
            img.setScale(T / 16);
            img.setTint(0x3a4d80);
            img.setAlpha(0.15);
            img.setDepth(1);
            this.floorImages.push(img);
          }
        }
      }
    }
  }

  private drawFurniture() {
    if (!this.scene) return;
    const hasTile = this.scene.textures.exists('roguelike');
    const T = this.tilePx;

    for (const room of DUNGEON_ROOMS) {
      const defs = ROOM_FURNITURE[room.role] ?? [];
      const innerX = this.tp(room.tileX + 1);
      const innerY = this.tpy(room.tileY + 1);
      const innerW = this.ts(room.tileW - 2);
      const innerH = this.ts(room.tileH - 2);

      for (const def of defs) {
        const fx = innerX + def.rx * innerW;
        const fy = innerY + def.ry * innerH;

        if (hasTile) {
          try {
            const img = this.scene!.add.image(fx, fy, 'roguelike', def.frame);
            img.setOrigin(0.5, 0.5);
            img.setScale(T / 16 * 0.85);
            img.setTint(room.color);
            img.setAlpha(0.55);
            img.setDepth(1.5);
            this.furnitureImages.push(img);
          } catch {
            this.drawFurnitureFallback(room, fx, fy, T);
          }
        } else {
          this.drawFurnitureFallback(room, fx, fy, T);
        }
      }
    }
  }

  private drawFurnitureFallback(room: RoomDef, fx: number, fy: number, T: number) {
    const g = this.dungeonGfx;
    if (!g) return;
    const s = Math.max(3, T * 0.3);
    g.fillStyle(room.color, 0.2);
    g.fillRect(fx - s, fy - s * 0.6, s * 2, s * 1.2);
    g.lineStyle(1, room.color, 0.4);
    g.strokeRect(fx - s, fy - s * 0.6, s * 2, s * 1.2);
  }

  private drawRoom(g: import('phaser').GameObjects.Graphics, room: RoomDef) {
    const T = this.tilePx;
    const px = this.tp(room.tileX);
    const py = this.tpy(room.tileY);
    const pw = this.ts(room.tileW);
    const ph = this.ts(room.tileH);
    const c = room.color;
    const bright = this.dayBrightness;

    g.fillStyle(0x080c18, 0.95);
    g.fillRect(px, py, pw, ph);
    g.fillStyle(c, 0.06 * bright);
    g.fillRect(px, py, pw, ph);

    const wallH = T;
    g.fillStyle(0x0a1022, 1);
    g.fillRect(px, py, pw, wallH);
    g.fillStyle(c, 0.18 * bright);
    g.fillRect(px, py, pw, wallH);

    for (let col = room.tileX; col < room.tileX + room.tileW; col++) {
      const bx = this.tp(col);
      const stoneVar = (col * 5 + room.tileY) % 3;
      const darkC = stoneVar === 0 ? 0x10172a : stoneVar === 1 ? 0x0c1222 : 0x141c30;
      g.fillStyle(darkC, 1);
      g.fillRect(bx + 1, py + 1, T - 2, wallH - 2);
      g.lineStyle(1, c, 0.12 * bright);
      g.strokeRect(bx + 1, py + 1, T - 2, wallH - 2);
    }

    g.lineStyle(2, c, 0.65 * bright);
    g.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

    const acLen = Math.max(6, T * 0.4);
    g.lineStyle(2, c, 0.95 * bright);
    g.beginPath(); g.moveTo(px, py + acLen); g.lineTo(px, py); g.lineTo(px + acLen, py); g.strokePath();
    g.beginPath(); g.moveTo(px + pw - acLen, py); g.lineTo(px + pw, py); g.lineTo(px + pw, py + acLen); g.strokePath();
    g.beginPath(); g.moveTo(px, py + ph - acLen); g.lineTo(px, py + ph); g.lineTo(px + acLen, py + ph); g.strokePath();
    g.beginPath(); g.moveTo(px + pw - acLen, py + ph); g.lineTo(px + pw, py + ph); g.lineTo(px + pw, py + ph - acLen); g.strokePath();

    g.lineStyle(1, c, 0.25 * bright);
    g.strokeRect(px + 4, py + 4, pw - 8, ph - 8);

    const doorX = px + pw / 2;
    const doorY = py + ph - 2;
    const dw = Math.max(8, T * 0.6);
    g.fillStyle(c, 0.5 * bright);
    g.fillRect(doorX - dw / 2, doorY - 3, dw, 5);
    g.lineStyle(1, c, 0.9 * bright);
    g.strokeRect(doorX - dw / 2, doorY - 3, dw, 5);
  }

  private drawOverlay() {
    const g = this.overlayGfx;
    if (!g) return;
    g.clear();
    const T = this.tilePx;

    for (const room of DUNGEON_ROOMS) {
      const px = this.tp(room.tileX);
      const py = this.tpy(room.tileY);
      const pw = this.ts(room.tileW);
      const ph = this.ts(room.tileH);

      const isSelected = room.id === this.selectedRoomId;
      if (isSelected) {
        g.fillStyle(room.color, 0.15);
        g.fillRect(px + 2, py + 2, pw - 4, ph - 4);
        g.lineStyle(2, room.color, 1);
        g.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
        g.lineStyle(1, 0xffffff, 0.3);
        g.strokeRect(px + 3, py + 3, pw - 6, ph - 6);
      }

      // Incident border flash overlay
      const incident = this.incidents.find(i => i.roomId === room.id && i.phase !== 'dismissed');
      if (incident) {
        const flash = Math.abs(Math.sin(incident.flashTimer * 0.15));
        const pulse = 0.5 + flash * 0.5;
        g.fillStyle(0xff2244, 0.08 * pulse);
        g.fillRect(px, py, pw, ph);
        g.lineStyle(3, 0xff2244, 0.9 * pulse);
        g.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
        g.lineStyle(1, 0xff6677, 0.5 * pulse);
        g.strokeRect(px + 3, py + 3, pw - 6, ph - 6);
        // Countdown bar at bottom of room
        const barW = (pw - 8) * (incident.countdown / incident.countdownMax);
        g.fillStyle(0x330000, 0.8);
        g.fillRect(px + 4, py + ph - 6, pw - 8, 4);
        g.fillStyle(0xff2244, 0.9);
        g.fillRect(px + 4, py + ph - 6, Math.max(0, barW), 4);
      }

      // Mission complete star badge in top-left corner (two crossed triangles = 6-point star)
      if (this.roomMissionsComplete.has(room.id)) {
        const sx = px + 7;
        const sy = py + 7;
        const sr = 5;
        g.fillStyle(0xffd700, 0.95);
        g.fillTriangle(sx, sy - sr, sx - sr * 0.87, sy + sr * 0.5, sx + sr * 0.87, sy + sr * 0.5);
        g.fillTriangle(sx, sy + sr, sx - sr * 0.87, sy - sr * 0.5, sx + sr * 0.87, sy - sr * 0.5);
        g.fillStyle(0xffffff, 0.85);
        g.fillCircle(sx, sy, 1.8);
        g.lineStyle(1.5, 0xffd700, 0.55);
        g.strokeCircle(sx, sy, sr + 3);
      }

      const labelX = px + pw / 2;
      const labelY = py + T * 0.8;
      const lw = Math.min(pw - 8, 52);
      g.fillStyle(room.color, 0.85);
      g.fillRect(labelX - lw / 2, labelY - 4, lw, 8);
      g.lineStyle(1, 0xffffff, 0.2);
      g.strokeRect(labelX - lw / 2, labelY - 4, lw, 8);
    }

    for (const cor of DUNGEON_CORRIDORS) {
      const px = this.tp(cor.tileX);
      const py = this.tpy(cor.tileY);
      const pw = this.ts(cor.tileW);
      const ph = this.ts(cor.tileH);
      g.fillStyle(0x2a3860, 0.6);
      g.fillRect(px, py, pw, ph);
      g.lineStyle(1, 0x4060a0, 0.5);
      g.strokeRect(px, py, pw, ph);
    }
  }

  private rebuildHitZones() {
    this.roomHitZones = DUNGEON_ROOMS.map(room => ({
      room,
      px: this.tp(room.tileX),
      py: this.tpy(room.tileY),
      pw: this.ts(room.tileW),
      ph: this.ts(room.tileH),
    }));
  }

  // ─── Agent Setup ─────────────────────────────────────────────────────────
  private buildAgentStates(scene: import('phaser').Scene) {
    for (const text of this.nameTexts) text.destroy();
    this.nameTexts = [];

    this.agents = AGENTS_DEF.map(ag => {
      const room = DUNGEON_ROOMS.find(r => r.id === ag.roomId);
      const margin = 1.5;
      const wx = room
        ? this.tp(room.tileX + margin + Math.random() * (room.tileW - margin * 2 - 1))
        : this.tp(5);
      const wy = room
        ? this.tpy(room.tileY + margin + Math.random() * (room.tileH - margin * 2 - 2))
        : this.tpy(5);

      this.agentLevels[ag.id] = ag.level;

      const nameText = scene.add.text(wx, wy - 16, ag.name, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '5px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        resolution: 2,
      }).setOrigin(0.5, 1).setDepth(8);
      this.nameTexts.push(nameText);

      return {
        ...ag,
        wx, wy, tx: wx, ty: wy,
        moveTimer: Math.random() * 100,
        walkFrame: 0, walkTimer: 0, facing: 1,
        commTarget: null, commAlpha: 0,
        commTimer: 80 + Math.random() * 160,
        waypoints: [],
        inTransit: false,
        transitOrb: null,
        transitTimer: 0,
        prevPct: ag.pct,
        xpFlashTimer: 0,
        xpFlashLabel: '',
      };
    });

    // Init ambient particles
    this.ambientParticles.clear();
    for (const room of DUNGEON_ROOMS) {
      this.ambientParticles.set(room.id, []);
    }
  }

  private repositionAgents() {
    for (const ag of this.agents) {
      const room = DUNGEON_ROOMS.find(r => r.id === ag.roomId);
      if (room) {
        const margin = 1.5;
        ag.wx = this.tp(room.tileX + margin + Math.random() * (room.tileW - margin * 2 - 1));
        ag.wy = this.tpy(room.tileY + margin + Math.random() * (room.tileH - margin * 2 - 2));
        ag.tx = ag.wx; ag.ty = ag.wy;
        ag.waypoints = [];
        ag.inTransit = false;
        ag.transitOrb = null;
      }
    }
  }

  // ─── Room Change Timer (pathfinding demo) ──────────────────────────────
  private updateRoomChangeTimer(dt: number) {
    this.roomChangeTimer -= dt;
    if (this.roomChangeTimer <= 0) {
      this.roomChangeTimer = 1800 + Math.random() * 1800; // 30-60s at 60fps
      // Pick a random agent and move them to an adjacent room
      const candidates = this.agents.filter(a => !a.inTransit);
      if (!candidates.length) return;
      const ag = candidates[Math.floor(Math.random() * candidates.length)];
      const paths = ROOM_PATHS[ag.roomId];
      if (!paths || !paths.length) return;
      const dest = paths[Math.floor(Math.random() * paths.length)];
      const wayTiles = findPath(ag.roomId, dest.targetId);
      if (!wayTiles.length && dest.targetId !== ag.roomId) return;
      // Add final destination in the new room
      const destRoom = DUNGEON_ROOMS.find(r => r.id === dest.targetId);
      if (!destRoom) return;
      const margin = 1.5;
      const finalX = this.tp(destRoom.tileX + margin + Math.random() * (destRoom.tileW - margin * 2 - 1));
      const finalY = this.tpy(destRoom.tileY + margin + Math.random() * (destRoom.tileH - margin * 2 - 2));
      ag.waypoints = [
        ...wayTiles.map(w => ({ tx: this.tp(w.tx), ty: this.tpy(w.ty) })),
        { tx: finalX, ty: finalY },
      ];
      ag.inTransit = true;
      ag.transitOrb = { x: ag.wx, y: ag.wy, alpha: 1 };
      // Update room assignment at the end (we'll update it when waypoints exhausted)
      ag.roomId = dest.targetId;
    }
  }

  // ─── Agent Movement ─────────────────────────────────────────────────────
  private updateAgentMovement(dt: number) {
    const SPEED = 38;
    for (const ag of this.agents) {
      // Progress tracking
      ag.xpFlashTimer = Math.max(0, ag.xpFlashTimer - dt);
      const newPct = Math.min(100, ag.pct + 0.05 * dt); // slowly tick up
      if (ag.prevPct < 100 && newPct >= 100) {
        // Task completed! Economy flyover
        const color = ROLE_COLORS[ag.role] ?? 0x4d7fff;
        const amount = 50 + Math.floor(Math.random() * 200);
        this.economyFlyovers.push({
          x: ag.wx,
          y: ag.wy - 20,
          vx: 0.3 + Math.random() * 0.5,
          vy: -1.2 - Math.random() * 0.8,
          amount,
          life: 1.0,
          color,
        });
        this.totalRevenue += amount;
        this.onRevenueChange?.(amount);
        ag.xpFlashTimer = 90;
        ag.xpFlashLabel = `+${ag.level * 10}XP`;
        this.spawnXpText(ag.wx, ag.wy, ag.xpFlashLabel);
        // Room mission progress
        const prog = (this.roomMissionProgress.get(ag.roomId) ?? 0) + 1;
        this.roomMissionProgress.set(ag.roomId, prog);
        if (prog >= 5) {
          this.roomMissionProgress.set(ag.roomId, 0);
          this.triggerRoomMission(ag.roomId);
        }
        // Reset pct and prevPct together so the completion doesn't re-trigger next frame
        ag.prevPct = 0;
        ag.pct = 0;
      } else {
        ag.prevPct = ag.pct;
        ag.pct = newPct;
      }

      // Waypoint pathfinding
      if (ag.inTransit && ag.waypoints.length > 0) {
        const next = ag.waypoints[0];
        const dx = next.tx - ag.wx;
        const dy = next.ty - ag.wy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 3) {
          ag.waypoints.shift();
          if (ag.waypoints.length === 0) {
            ag.inTransit = false;
            ag.transitOrb = null;
            ag.tx = ag.wx;
            ag.ty = ag.wy;
          }
        } else {
          const spd = SPEED * 1.3;
          const move = Math.min(dist, spd * dt / 60);
          ag.wx += (dx / dist) * move;
          ag.wy += (dy / dist) * move;
          if (Math.abs(dx) > 1) ag.facing = dx > 0 ? 1 : -1;
          ag.walkTimer += dt;
          if (ag.walkTimer > 10) { ag.walkFrame = (ag.walkFrame + 1) % 4; ag.walkTimer = 0; }
          // Update orb
          if (ag.transitOrb) {
            ag.transitOrb.x = next.tx;
            ag.transitOrb.y = next.ty;
            ag.transitOrb.alpha = 0.8 + Math.sin(ag.transitTimer * 0.2) * 0.2;
          }
          ag.transitTimer += dt;
        }
      } else if (!ag.inTransit) {
        // Normal wandering in room
        const dx = ag.tx - ag.wx;
        const dy = ag.ty - ag.wy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1.5) {
          const spd = ag.status === 'Idle' ? SPEED * 0.4 : SPEED;
          const move = Math.min(dist, spd * dt / 60);
          ag.wx += (dx / dist) * move;
          ag.wy += (dy / dist) * move;
          if (Math.abs(dx) > 1) ag.facing = dx > 0 ? 1 : -1;
          ag.walkTimer += dt;
          if (ag.walkTimer > 12) { ag.walkFrame = (ag.walkFrame + 1) % 4; ag.walkTimer = 0; }
        } else {
          ag.walkFrame = 0;
        }

        ag.moveTimer -= dt;
        if (ag.moveTimer <= 0) {
          const room = DUNGEON_ROOMS.find(r => r.id === ag.roomId);
          if (room) {
            const margin = 1.5;
            ag.tx = this.tp(room.tileX + margin + Math.random() * (room.tileW - margin * 2 - 1));
            ag.ty = this.tpy(room.tileY + margin + Math.random() * (room.tileH - margin * 2 - 2));
          }
          ag.moveTimer = 80 + Math.random() * 160;
        }
      }

      ag.commTimer -= dt;
      if (ag.commTimer <= 0) {
        const others = this.agents.filter(a => a.id !== ag.id && a.roomId === ag.roomId);
        if (others.length) {
          ag.commTarget = others[Math.floor(Math.random() * others.length)].id;
          ag.commAlpha = 1;
        }
        ag.commTimer = 120 + Math.random() * 200;
      }
      if (ag.commAlpha > 0) ag.commAlpha -= 0.007 * dt;
    }

    this.nameTexts.forEach((txt, i) => {
      const ag = this.agents[i];
      if (!ag) return;
      txt.setPosition(ag.wx, ag.wy - 22);
      txt.setAlpha(this.selectedAgentId === null || this.selectedAgentId === ag.id ? 1 : 0.25);
    });
  }

  // ─── Ambient Particles ──────────────────────────────────────────────────
  private spawnAmbientParticle(room: RoomDef): AmbientParticle | null {
    const px = this.tp(room.tileX + 1);
    const py = this.tpy(room.tileY + 1);
    const pw = this.ts(room.tileW - 2);
    const ph = this.ts(room.tileH - 2);
    const x = px + Math.random() * pw;
    const y = py + Math.random() * ph;
    const role = room.role;

    switch (role) {
      case 'research':
        return { x, y, vx: (Math.random() - 0.5) * 0.2, vy: -0.5 - Math.random() * 0.5, life: 1, maxLife: 1, color: 0xffffff, size: 1.5 + Math.random() };
      case 'builder':
        return { x: px + Math.random() * pw, y: py, vx: 0, vy: 0.6 + Math.random() * 0.6, life: 1, maxLife: 1, color: 0x00ff44, size: 1, extra: Math.random() > 0.5 ? 0 : 1 };
      case 'design': {
        const colors = [0xff4d9b, 0x4dffcb, 0xffdd4d, 0x9b4dff, 0x4d9bff];
        return { x, y, vx: (Math.random() - 0.5) * 0.4, vy: -0.4 - Math.random() * 0.4, life: 1, maxLife: 1, color: colors[Math.floor(Math.random() * colors.length)], size: 2 + Math.random() };
      }
      case 'analytics':
        return { x: px + Math.random() * pw, y: py + ph * 0.2 + Math.random() * ph * 0.6, vx: 0, vy: 0, life: 1, maxLife: 1, color: 0xff4d6d, size: 2, extra: Math.random() * Math.PI * 2 };
      case 'strategy':
        return { x: px + pw / 2, y: py + ph / 2, vx: 0, vy: 0, life: 1, maxLife: 1, color: 0xc0a020, size: 1.5, extra: 0 }; // radar
      case 'growth':
        return { x, y: py + ph, vx: (Math.random() - 0.5) * 0.3, vy: -0.8 - Math.random() * 0.5, life: 1, maxLife: 1, color: 0xffd700, size: 1.5 };
      default:
        return null;
    }
  }

  private updateAmbientParticles(dt: number) {
    for (const room of DUNGEON_ROOMS) {
      let particles = this.ambientParticles.get(room.id) ?? [];
      const maxCount = room.role === 'strategy' ? 1 : 12;

      // Spawn
      if (particles.length < maxCount && Math.random() < 0.08 * dt) {
        const p = this.spawnAmbientParticle(room);
        if (p) particles.push(p);
      }

      const px = this.tp(room.tileX + 1);
      const py = this.tpy(room.tileY + 1);
      const pw = this.ts(room.tileW - 2);
      const ph = this.ts(room.tileH - 2);

      // Update
      particles = particles.filter(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= 0.012 * dt;

        if (room.role === 'strategy') {
          // Radar: don't decay by position
          p.life -= 0.008 * dt;
          if (p.extra !== undefined) p.extra = (p.extra ?? 0) + 0.04 * dt;
          p.life = Math.max(0, p.life);
          return p.life > 0;
        }

        // Kill if out of room bounds
        if (p.x < px - 4 || p.x > px + pw + 4) return false;
        if (p.y < py - 4 || p.y > py + ph + 4) return false;
        if (p.life <= 0) return false;
        return true;
      });

      // Strategy radar: keep alive
      if (room.role === 'strategy' && particles.length === 0) {
        particles.push({ x: px + pw / 2, y: py + ph / 2, vx: 0, vy: 0, life: 1, maxLife: 1, color: 0xc0a020, size: 1.5, extra: this.radarAngle });
      }

      this.ambientParticles.set(room.id, particles);
    }

    this.radarAngle = (this.radarAngle + 0.015) % (Math.PI * 2);
  }

  private drawParticles() {
    const g = this.particleGfx;
    if (!g) return;
    g.clear();

    for (const room of DUNGEON_ROOMS) {
      const particles = this.ambientParticles.get(room.id) ?? [];
      const px = this.tp(room.tileX + 1);
      const py = this.tpy(room.tileY + 1);
      const pw = this.ts(room.tileW - 2);
      const ph = this.ts(room.tileH - 2);
      const cx = px + pw / 2;
      const cy = py + ph / 2;
      const bright = this.dayBrightness;

      for (const p of particles) {
        const alpha = p.life * 0.8 * bright;
        if (alpha <= 0) continue;

        switch (room.role) {
          case 'research':
            // Sparkle: cross shape
            g.fillStyle(p.color, alpha * 0.9);
            g.fillCircle(p.x, p.y, p.size);
            g.lineStyle(1, p.color, alpha * 0.5);
            g.beginPath(); g.moveTo(p.x - p.size * 2, p.y); g.lineTo(p.x + p.size * 2, p.y); g.strokePath();
            g.beginPath(); g.moveTo(p.x, p.y - p.size * 2); g.lineTo(p.x, p.y + p.size * 2); g.strokePath();
            break;

          case 'builder':
            // Binary digit square
            g.fillStyle(p.color, alpha * 0.75);
            g.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
            break;

          case 'design':
            // Colored square chip
            g.fillStyle(p.color, alpha * 0.85);
            g.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
            break;

          case 'analytics': {
            // Mini 2-bar chart
            const bw = 3;
            const bh1 = 4 + Math.sin((p.extra ?? 0) + p.x) * 2;
            const bh2 = 3 + Math.cos((p.extra ?? 0) + p.y) * 2;
            g.fillStyle(p.color, alpha * 0.8);
            g.fillRect(p.x - bw - 1, p.y - bh1, bw, bh1);
            g.fillRect(p.x + 1, p.y - bh2, bw, bh2);
            break;
          }

          case 'strategy': {
            // Radar sweep arc
            const angle = p.extra ?? 0;
            const radius = Math.min(pw, ph) * 0.38;
            g.lineStyle(1.5, p.color, 0.5 * bright);
            g.strokeCircle(cx, cy, radius);
            // Sweep arc
            for (let a = 0; a < Math.PI / 2; a += 0.08) {
              const fa = angle - a;
              const fAlpha = (0.6 - a * 0.4) * bright;
              if (fAlpha <= 0) continue;
              g.lineStyle(2, p.color, fAlpha);
              g.beginPath();
              g.moveTo(cx, cy);
              g.lineTo(cx + Math.cos(fa) * radius, cy + Math.sin(fa) * radius);
              g.strokePath();
            }
            // Blip dot
            g.fillStyle(p.color, 0.9 * bright);
            g.fillCircle(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, 2);
            break;
          }

          case 'growth':
            // Gold coin circle
            g.fillStyle(0xffd700, alpha * 0.9);
            g.fillCircle(p.x, p.y, p.size + 0.5);
            g.lineStyle(1, 0xffa500, alpha * 0.6);
            g.strokeCircle(p.x, p.y, p.size + 0.5);
            break;
        }
      }
    }
  }

  // ─── Draw Agents ─────────────────────────────────────────────────────────
  private drawAgents() {
    const g = this.agentGfx;
    if (!g) return;
    g.clear();

    // Comm lines
    for (const ag of this.agents) {
      if (ag.commTarget && ag.commAlpha > 0) {
        const tgt = this.agents.find(a => a.id === ag.commTarget);
        if (tgt) {
          const c = ROLE_COLORS[ag.role] ?? 0x4d7fff;
          g.lineStyle(1, c, ag.commAlpha * 0.4);
          g.beginPath(); g.moveTo(ag.wx, ag.wy); g.lineTo(tgt.wx, tgt.wy); g.strokePath();
          g.fillStyle(c, ag.commAlpha);
          g.fillCircle((ag.wx + tgt.wx) / 2, (ag.wy + tgt.wy) / 2, 2);
        }
      }
    }

    // Transit orbs
    for (const ag of this.agents) {
      if (ag.transitOrb && ag.waypoints.length > 0) {
        const orbX = ag.waypoints[0].tx;
        const orbY = ag.waypoints[0].ty;
        const orba = ag.transitOrb.alpha;
        g.fillStyle(0x4df0d8, orba * 0.9);
        g.fillCircle(orbX, orbY, 4);
        g.lineStyle(2, 0x4df0d8, orba * 0.5);
        g.strokeCircle(orbX, orbY, 6);
        // Trail from agent to orb
        g.lineStyle(1, 0x4df0d8, orba * 0.25);
        g.beginPath(); g.moveTo(ag.wx, ag.wy); g.lineTo(orbX, orbY); g.strokePath();
      }
    }

    // Characters
    for (const ag of this.agents) {
      this.drawCharacter(g, ag);
    }

    // Progress bars + XP flash labels
    for (const ag of this.agents) {
      this.drawProgressBar(g, ag);
    }
  }

  private drawProgressBar(g: import('phaser').GameObjects.Graphics, ag: AgentState) {
    const x = Math.round(ag.wx);
    const y = Math.round(ag.wy);
    const barW = 20;
    const barH = 3;
    const bx = x - barW / 2;
    const by = y - 30;

    // Background
    g.fillStyle(0x1a1a2e, 0.9);
    g.fillRect(bx - 1, by - 1, barW + 2, barH + 2);

    // Fill
    const pct = Math.max(0, Math.min(1, ag.pct / 100));
    const fillW = barW * pct;
    const isComplete = pct >= 0.999;
    const color = isComplete ? 0x4dff9b : (ROLE_COLORS[ag.role] ?? 0x4d7fff);
    const alpha = isComplete ? 1 : 0.85;

    if (fillW > 0) {
      g.fillStyle(color, alpha);
      g.fillRect(bx, by, fillW, barH);

      // Glow cap
      if (isComplete) {
        g.fillStyle(0xffffff, 0.6);
        g.fillRect(bx + fillW - 1, by, 1, barH);
      }
    }

    // Border
    g.lineStyle(1, isComplete ? 0x4dff9b : 0x333366, isComplete ? 0.9 : 0.5);
    g.strokeRect(bx - 1, by - 1, barW + 2, barH + 2);

    // XP flash label above
    if (ag.xpFlashTimer > 0 && ag.xpFlashLabel) {
      const progress = ag.xpFlashTimer / 90;
      g.fillStyle(0xffd700, progress * 0.95);
      // Simple rectangle behind label (text rendered below via Phaser Text objects won't work here)
      // Draw a tiny dot burst instead
      g.fillCircle(x, by - 4 - (1 - progress) * 8, 3 * progress);
      g.fillStyle(0x4dff9b, progress * 0.6);
      g.fillCircle(x - 4, by - 6 - (1 - progress) * 6, 2 * progress);
      g.fillCircle(x + 4, by - 6 - (1 - progress) * 6, 2 * progress);
    }
  }

  private drawCharacter(g: import('phaser').GameObjects.Graphics, ag: AgentState) {
    const color = ROLE_COLORS[ag.role] ?? 0x4d7fff;
    const isIdle = ag.status === 'Idle';
    const isSelected = this.selectedAgentId === ag.id;
    const dimmed = this.selectedAgentId !== null && !isSelected;
    const alpha = dimmed ? 0.35 : 1;
    const bright = this.dayBrightness;

    const T = this.tilePx;
    const S = Math.max(1, Math.round(T / 10));
    const x = Math.round(ag.wx);
    const y = Math.round(ag.wy);

    const walkY = (ag.walkFrame === 1 || ag.walkFrame === 3) ? -S : 0;

    if (isSelected) {
      g.lineStyle(1.5, 0xffffff, 0.85 * alpha);
      g.strokeCircle(x, y + S * 2, S * 9);
      g.lineStyle(1, color, 0.4 * alpha);
      g.strokeCircle(x, y + S * 2, S * 12);
    }

    const skinColor = 0xe8c080;
    const bodyC = color;
    const darkBodyC = Math.max(0, color - 0x181818);
    const legC = darkBodyC;
    const oy = walkY;

    // Head
    g.fillStyle(skinColor, alpha * bright);
    g.fillRect(x - S * 2, y - S * 6 + oy, S * 4, S * 4);

    const eyeX = ag.facing > 0 ? x + S : x - S;
    g.fillStyle(0x1a1a2e, alpha);
    g.fillRect(eyeX - S / 2, y - S * 5 + oy, S, S);

    // Body
    g.fillStyle(bodyC, (isIdle ? 0.6 : 1) * alpha * bright);
    g.fillRect(x - S * 3, y - S * 2 + oy, S * 6, S * 5);
    g.fillStyle(darkBodyC, 0.5 * alpha);
    g.fillRect(x - S, y - S * 2 + oy, S * 2, S);

    // Legs
    const legOffset = ag.walkFrame === 1 ? -S : ag.walkFrame === 3 ? S : 0;
    g.fillStyle(legC, alpha * bright);
    g.fillRect(x - S * 2, y + S * 3 + oy, S * 2, S * 3 + (legOffset > 0 ? 0 : -legOffset));
    g.fillRect(x + S * 0, y + S * 3 + oy + (legOffset > 0 ? legOffset : 0), S * 2, S * 3 + (legOffset > 0 ? -legOffset : 0));

    if (!isIdle && ag.walkFrame % 2 === 0) {
      g.fillStyle(color, 0.3 * alpha);
      g.fillRect(x - S, y + S * 6, S * 2, S);
    }

    // Role dot on head
    g.fillStyle(color, 0.7 * alpha * bright);
    g.fillCircle(x, y - S * 9, S * 1.5);

    if (isIdle) {
      g.fillStyle(color, 0.1);
      g.fillEllipse(x, y + S * 7, S * 8, S * 3);
    }
  }

  // ─── Incident System ─────────────────────────────────────────────────────
  private updateIncidents(dt: number) {
    this.incidentTimer -= dt;
    if (this.incidentTimer <= 0) {
      this.incidentTimer = (90 + Math.random() * 30) * 60; // 90-120 seconds * 60fps
      const activeRooms = DUNGEON_ROOMS.filter(r => !this.incidents.find(i => i.roomId === r.id && i.phase !== 'dismissed'));
      if (activeRooms.length) {
        const room = activeRooms[Math.floor(Math.random() * activeRooms.length)];
        const labels = INCIDENT_LABELS[room.role] ?? ['SYSTEM ERROR'];
        const label = labels[Math.floor(Math.random() * labels.length)];
        const countdownMax = (20 + Math.random() * 10) * 60;
        this.incidents.push({
          roomId: room.id,
          label,
          countdownMax,
          countdown: countdownMax,
          flashTimer: 0,
          phase: 'alert',
        });
      }
    }

    for (const incident of this.incidents) {
      if (incident.phase === 'dismissed') continue;
      incident.flashTimer += dt;
      incident.countdown -= dt;
      if (incident.countdown <= 0) {
        incident.phase = 'dismissed';
      }
    }

    // Clean up old dismissed ones
    this.incidents = this.incidents.filter(i => i.phase !== 'dismissed' || i.flashTimer < 300);
  }

  // ─── FX Layer ─────────────────────────────────────────────────────────────
  private updateFx(dt: number) {
    const g = this.fxGfx;
    if (!g || !this.scene) return;
    g.clear();

    const W = this.scene.scale.width;
    const H = this.scene.scale.height;
    const bright = this.dayBrightness;

    // Day/Night ambient overlay
    const nightness = 1 - bright;
    if (nightness > 0.05) {
      const r = Math.round(this.dayTintR);
      const gbVal = Math.round(Math.min(r, 120));
      const tintHex = (r << 16) | (gbVal << 8) | Math.round(this.dayTintB * 0.7);
      void tintHex;
      g.fillStyle(0x000520, nightness * 0.35);
      g.fillRect(0, 0, W, H);
    }

    // Level-up effects
    this.levelUpEffects = this.levelUpEffects.filter(e => e.timer > 0);
    for (const e of this.levelUpEffects) {
      e.timer -= dt;
      e.flashAlpha = Math.max(0, e.flashAlpha - 0.03 * dt);
      if (e.flashAlpha > 0) {
        g.fillStyle(0xffd700, e.flashAlpha * 0.05);
        g.fillRect(0, 0, W, H);
      }
      for (const ring of e.rings) {
        ring.r += 2 * dt; ring.alpha = Math.max(0, ring.alpha - 0.016 * dt);
        if (ring.alpha > 0) { g.lineStyle(2, 0xffd700, ring.alpha); g.strokeCircle(e.x, e.y, ring.r); }
      }
      for (const ray of e.rays) {
        ray.len = Math.min(80, ray.len + 3 * dt); ray.alpha = Math.max(0, ray.alpha - 0.018 * dt);
        if (ray.alpha > 0) {
          g.lineStyle(1.5, 0xffd700, ray.alpha * 0.7);
          g.beginPath(); g.moveTo(e.x, e.y);
          g.lineTo(e.x + Math.cos(ray.angle) * ray.len, e.y + Math.sin(ray.angle) * ray.len);
          g.strokePath();
        }
      }
      for (const p of e.particles) {
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.08 * dt; p.life -= 0.018 * dt;
        if (p.life > 0) { g.fillStyle(p.color, p.life); g.fillCircle(p.x, p.y, 2.5); }
      }
      e.particles = e.particles.filter(p => p.life > 0);
    }

    // Economy flyovers
    this.economyFlyovers = this.economyFlyovers.filter(f => f.life > 0);
    for (const f of this.economyFlyovers) {
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.vy += 0.005 * dt; // slight gravity
      f.life -= 0.012 * dt;

      if (f.life > 0) {
        // Draw flyover text as a rectangle with "+" indicator
        const alpha = Math.min(1, f.life * 2);
        g.fillStyle(f.color, alpha * 0.15);
        g.fillRoundedRect(f.x - 18, f.y - 6, 36, 12, 2);
        g.lineStyle(1, f.color, alpha * 0.8);
        g.strokeRoundedRect(f.x - 18, f.y - 6, 36, 12, 2);
        // +$ indicator lines
        g.fillStyle(0xffffff, alpha * 0.9);
        g.fillRect(f.x - 14, f.y - 1, 8, 2); // -
        g.fillRect(f.x - 11, f.y - 4, 2, 8); // |
        g.fillStyle(f.color, alpha);
        g.fillRect(f.x - 2, f.y - 3, 14, 6); // amount block
      }
    }

    // Incident "!" icons
    for (const incident of this.incidents) {
      if (incident.phase === 'dismissed') continue;
      const room = DUNGEON_ROOMS.find(r => r.id === incident.roomId);
      if (!room) continue;
      const px = this.tp(room.tileX);
      const py = this.tpy(room.tileY);
      const pw = this.ts(room.tileW);
      const flash = Math.abs(Math.sin(incident.flashTimer * 0.15));

      // "!" icon in top-right of room
      const ix = px + pw - 10;
      const iy = py + 6;
      g.fillStyle(0xff2244, 0.9 + flash * 0.1);
      g.fillRect(ix, iy, 6, 10);
      g.fillStyle(0x000000, 0.8);
      g.fillRect(ix + 2, iy + 2, 2, 5);
      g.fillRect(ix + 2, iy + 8, 2, 2);

      // Label strip
      g.fillStyle(0xff2244, 0.75 * flash);
      g.fillRect(px + 2, py + this.tilePx + 2, pw - 4, 8);
    }

    // Room mission burst effects
    this.roomMissionEffects = this.roomMissionEffects.filter(e => e.timer > 0);
    for (const e of this.roomMissionEffects) {
      e.timer -= dt;
      e.goldFlash = Math.max(0, e.goldFlash - 0.013 * dt);
      const room = DUNGEON_ROOMS.find(r => r.id === e.roomId);
      if (!room) continue;
      const px = this.tp(room.tileX);
      const py = this.tpy(room.tileY);
      const pw = this.ts(room.tileW);
      const ph = this.ts(room.tileH);
      const cx = px + pw / 2;
      const cy = py + ph / 2;
      // Gold fill flash
      if (e.goldFlash > 0) {
        g.fillStyle(0xffd700, e.goldFlash * 0.22);
        g.fillRect(px, py, pw, ph);
        g.lineStyle(2.5, 0xffd700, Math.min(1, e.goldFlash * 1.2));
        g.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
      }
      // Expanding rings from room center
      for (const ring of e.rings) {
        ring.r += ring.speed * dt;
        ring.alpha = Math.max(0, ring.alpha - 0.011 * dt);
        if (ring.alpha > 0) {
          g.lineStyle(2, 0xffd700, ring.alpha);
          g.strokeCircle(cx, cy, ring.r);
        }
      }
      // Particles
      for (const p of e.particles) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vy += 0.06 * dt;
        p.life -= 0.014 * dt;
        if (p.life > 0) {
          g.fillStyle(p.color, p.life * 0.92);
          g.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
        }
      }
      e.particles = e.particles.filter(p => p.life > 0);
    }

    // XP floating texts
    this.xpTexts = this.xpTexts.filter(entry => {
      entry.life -= 0.018 * dt;
      if (entry.life <= 0) { entry.text.destroy(); return false; }
      entry.text.y += entry.vy * dt;
      entry.vy *= 0.97;
      entry.text.setAlpha(Math.min(1, entry.life * 2));
      return true;
    });

    // CRT scanline
    this.scanY = (this.scanY + 0.45 * dt) % H;
    g.fillStyle(0x4df0d8, 0.008 * bright);
    g.fillRect(0, this.scanY, W, 2);

    // Day/Night phase label in bottom-left of canvas
    const phaseColor = this.dayPhase === 'NIGHT OPS' ? 0x4d7fff : this.dayPhase === 'PEAK HOURS' ? 0xffd700 : 0x4df0d8;
    const phasePulse = 0.6 + Math.sin(Date.now() * 0.003) * 0.4;
    g.fillStyle(phaseColor, 0.15 * phasePulse);
    g.fillRect(4, H - 20, 80, 14);
    g.lineStyle(1, phaseColor, 0.5 * phasePulse);
    g.strokeRect(4, H - 20, 80, 14);
  }

  // ─── Mini-map ────────────────────────────────────────────────────────────
  private drawMinimap() {
    const g = this.minimapGfx;
    if (!g || !this.scene) return;
    g.clear();

    const W = this.scene.scale.width;
    const mmW = 120, mmH = 90;
    const mmX = W - mmW - 8;
    const mmY = 8;

    // Background
    g.fillStyle(0x000010, 0.82);
    g.fillRect(mmX, mmY, mmW, mmH);
    g.lineStyle(1.5, 0x4df0d8, 0.7);
    g.strokeRect(mmX, mmY, mmW, mmH);

    // Scale factors
    const dungW = DUNGEON_COLS * this.tilePx;
    const dungH = DUNGEON_ROWS * this.tilePx;
    const scaleX = (mmW - 4) / dungW;
    const scaleY = (mmH - 4) / dungH;

    const worldToMini = (wx: number, wy: number) => ({
      mx: mmX + 2 + (wx - this.offX) * scaleX,
      my: mmY + 2 + (wy - this.offY) * scaleY,
    });

    // Draw rooms
    for (const room of DUNGEON_ROOMS) {
      const px = this.tp(room.tileX);
      const py = this.tpy(room.tileY);
      const { mx, my } = worldToMini(px, py);
      const mw = this.ts(room.tileW) * scaleX;
      const mh = this.ts(room.tileH) * scaleY;

      const incident = this.incidents.find(i => i.roomId === room.id && i.phase !== 'dismissed');
      const roomColor = incident ? 0xff2244 : room.color;

      g.fillStyle(roomColor, 0.3);
      g.fillRect(mx, my, mw, mh);
      g.lineStyle(1, roomColor, 0.8);
      g.strokeRect(mx, my, mw, mh);
    }

    // Draw corridors
    for (const cor of DUNGEON_CORRIDORS) {
      const px = this.tp(cor.tileX);
      const py = this.tpy(cor.tileY);
      const { mx, my } = worldToMini(px, py);
      const mw = this.ts(cor.tileW) * scaleX;
      const mh = this.ts(cor.tileH) * scaleY;
      g.fillStyle(0x2a3860, 0.7);
      g.fillRect(mx, my, mw, mh);
    }

    // Draw agent dots
    for (const ag of this.agents) {
      const { mx, my } = worldToMini(ag.wx, ag.wy);
      const color = ROLE_COLORS[ag.role] ?? 0x4d7fff;
      const isSelected = ag.id === this.selectedAgentId;

      if (isSelected) {
        g.lineStyle(1, 0xffffff, 0.9);
        g.strokeCircle(mx, my, 4);
      }

      g.fillStyle(color, isSelected ? 1 : 0.85);
      g.fillRect(mx - 1.5, my - 1.5, 3, 3);
    }

    // Minimap click handler is handled in handleClick
  }

  private getMinimapBounds() {
    if (!this.scene) return null;
    const W = this.scene.scale.width;
    const mmW = 120, mmH = 90;
    return { x: W - mmW - 8, y: 8, w: mmW, h: mmH };
  }

  // ─── Click Handling ──────────────────────────────────────────────────────
  private handleClick(px: number, py: number) {
    // Check minimap click
    const mm = this.getMinimapBounds();
    if (mm && px >= mm.x && px <= mm.x + mm.w && py >= mm.y && py <= mm.y + mm.h) {
      this.handleMinimapClick(px, py, mm);
      return;
    }

    // Check incident room click (dismiss)
    for (const zone of this.roomHitZones) {
      if (px >= zone.px && px <= zone.px + zone.pw && py >= zone.py && py <= zone.py + zone.ph) {
        const incident = this.incidents.find(i => i.roomId === zone.room.id && i.phase !== 'dismissed');
        if (incident) {
          incident.phase = 'dismissed';
          // XP reward for agents in room
          const roomAgents = this.agents.filter(a => a.roomId === zone.room.id);
          for (const ag of roomAgents) {
            ag.xpFlashTimer = 90;
            ag.xpFlashLabel = '+20XP';
            this.spawnXpText(ag.wx, ag.wy, '+20XP');
          }
          this.onIncidentDismissed?.(zone.room.id);
          this.drawOverlay();
          return;
        }
      }
    }

    // Agent click
    for (const ag of this.agents) {
      const dx = px - ag.wx, dy = py - ag.wy;
      if (Math.sqrt(dx * dx + dy * dy) < this.tilePx * 0.65) {
        this.selectedAgentId = this.selectedAgentId === ag.id ? null : ag.id;
        this.selectedRoomId = null;
        this.onAgentSelect?.(this.selectedAgentId ? ({ ...ag } as AgentData) : null);
        this.onRoomSelect?.(null);
        this.drawOverlay();
        return;
      }
    }

    // Room click
    for (const zone of this.roomHitZones) {
      if (px >= zone.px && px <= zone.px + zone.pw && py >= zone.py && py <= zone.py + zone.ph) {
        this.selectedRoomId = this.selectedRoomId === zone.room.id ? null : zone.room.id;
        this.selectedAgentId = null;
        this.onAgentSelect?.(null);
        this.onRoomSelect?.(this.selectedRoomId);
        this.drawOverlay();
        return;
      }
    }

    // Deselect
    this.selectedAgentId = null;
    this.selectedRoomId = null;
    this.onAgentSelect?.(null);
    this.onRoomSelect?.(null);
    this.drawOverlay();
  }

  private handleMinimapClick(px: number, py: number, mm: { x: number; y: number; w: number; h: number }) {
    if (!this.scene) return;
    const dungW = DUNGEON_COLS * this.tilePx;
    const dungH = DUNGEON_ROWS * this.tilePx;
    const scaleX = (mm.w - 4) / dungW;
    const scaleY = (mm.h - 4) / dungH;

    // Reverse-project minimap coords to world coords
    const worldX = this.offX + (px - mm.x - 2) / scaleX;
    const worldY = this.offY + (py - mm.y - 2) / scaleY;

    // Find closest agent
    let closest: AgentState | null = null;
    let minDist = 18;
    for (const ag of this.agents) {
      const mmAgX = mm.x + 2 + (ag.wx - this.offX) * scaleX;
      const mmAgY = mm.y + 2 + (ag.wy - this.offY) * scaleY;
      const dist = Math.sqrt((px - mmAgX) ** 2 + (py - mmAgY) ** 2);
      if (dist < minDist) { minDist = dist; closest = ag; }
    }
    void worldX; void worldY;

    if (closest) {
      this.selectedAgentId = closest.id;
      this.selectedRoomId = null;
      this.onAgentSelect?.({ ...closest } as AgentData);
      this.onRoomSelect?.(null);
      this.drawOverlay();
    }
  }

  // ─── Room Mission Complete ─────────────────────────────────────────────────
  private triggerRoomMission(roomId: string) {
    const room = DUNGEON_ROOMS.find(r => r.id === roomId);
    if (!room) return;
    this.roomMissionsComplete.add(roomId);

    const px = this.tp(room.tileX);
    const py = this.tpy(room.tileY);
    const pw = this.ts(room.tileW);
    const ph = this.ts(room.tileH);
    const cx = px + pw / 2;
    const cy = py + ph / 2;

    const rings = Array.from({ length: 6 }, (_, i) => ({
      r: i * 10, alpha: 0.9 - i * 0.12, speed: 1.4 + i * 0.5,
    }));
    const particles: BurstParticle[] = Array.from({ length: 52 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 4.5;
      return {
        x: cx + (Math.random() - 0.5) * pw * 0.7,
        y: cy + (Math.random() - 0.5) * ph * 0.7,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0.7 + Math.random() * 0.6,
        color: Math.random() > 0.4 ? 0xffd700 : room.color,
      };
    });

    this.roomMissionEffects.push({ roomId, timer: 240, rings, particles, goldFlash: 1 });

    const revenue = 200 + Math.floor(Math.random() * 300);
    this.totalRevenue += revenue;
    this.onRevenueChange?.(revenue);

    const unlockLabel = ROOM_UNLOCK_LABELS[room.role] ?? 'UPGRADE UNLOCKED';
    this.onRoomMissionComplete?.(roomId, room.name, { xp: 50, revenue, unlockLabel });
  }

  // ─── XP Text Spawn ────────────────────────────────────────────────────────
  private spawnXpText(x: number, y: number, label: string) {
    if (!this.scene) return;
    const t = this.scene.add.text(x, y - 28, label, {
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '6px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
      resolution: 2,
    }).setOrigin(0.5, 1).setDepth(9).setAlpha(1);
    this.xpTexts.push({ text: t, vy: -1.2, life: 1, maxLife: 1 });
  }

  // ─── Level Up ─────────────────────────────────────────────────────────────
  triggerLevelUp(agentId: string): number {
    const ag = this.agents.find(a => a.id === agentId);
    if (!ag) return 0;
    const newLevel = (this.agentLevels[agentId] ?? ag.level) + 1;
    this.agentLevels[agentId] = newLevel;
    ag.level = newLevel;
    const rings = Array.from({ length: 4 }, (_, i) => ({ r: i * 8, alpha: 1 - i * 0.15 }));
    const particles: BurstParticle[] = Array.from({ length: 28 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3;
      return { x: ag.wx, y: ag.wy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1.5, life: 0.8 + Math.random() * 0.4, color: Math.random() > 0.5 ? 0xffd700 : 0xffffff };
    });
    const rays = Array.from({ length: 12 }, (_, i) => ({ angle: (i / 12) * Math.PI * 2, len: 4, alpha: 1 }));
    this.levelUpEffects.push({ x: ag.wx, y: ag.wy, rings, particles, rays, flashAlpha: 1, timer: 130 });
    this.onLevelUpLabel?.(ag.wx, ag.wy, ag.name, newLevel);
    return newLevel;
  }

  getAgentLevel(id: string): number { return this.agentLevels[id] ?? 0; }
  getTotalRevenue(): number { return this.totalRevenue; }
  getDayPhase(): string { return this.dayPhase; }
  getActiveIncidents(): Array<{ roomId: string; label: string; countdown: number; countdownMax: number }> {
    return this.incidents.filter(i => i.phase !== 'dismissed').map(i => ({
      roomId: i.roomId, label: i.label, countdown: i.countdown, countdownMax: i.countdownMax,
    }));
  }
}

