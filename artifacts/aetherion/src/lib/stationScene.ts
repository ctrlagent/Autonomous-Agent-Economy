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

export class StationScene {
  onAgentSelect?: (agent: AgentData | null) => void;
  onRoomSelect?: ((roomId: string | null) => void) | null;
  onLevelUpLabel?: (x: number, y: number, name: string, level: number) => void;

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
  private fxGfx: import('phaser').GameObjects.Graphics | null = null;
  private nameTexts: import('phaser').GameObjects.Text[] = [];

  private levelUpEffects: LevelUpEffect[] = [];
  private scanY = 0;

  private roomHitZones: Array<{ room: RoomDef; px: number; py: number; pw: number; ph: number }> = [];

  createPhaserScene(): import('phaser').Types.Scenes.CreateSceneFromObjectConfig {
    const self = this;
    return {
      key: 'StationScene',
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

        self.dungeonGfx = this.add.graphics().setDepth(0);
        self.overlayGfx = this.add.graphics().setDepth(2);
        self.agentGfx = this.add.graphics().setDepth(5);
        self.fxGfx = this.add.graphics().setDepth(9);

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
      update(_time: number, delta: number) {
        const dt = delta / 16.67;
        self.updateAgentMovement(dt);
        self.drawAgents();
        self.updateFx(dt);
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

  private drawDungeon() {
    const g = this.dungeonGfx;
    if (!g || !this.scene) return;
    g.clear();

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
          if (hasTile) {
            const img = this.scene.add.image(px, py, 'roguelike', 26);
            img.setOrigin(0, 0);
            img.setScale(T / 16);
            img.setTint(0x3a4d80);
            img.setAlpha(0.15);
            img.setDepth(1);
          }
        }
      }
    }
  }

  private drawRoom(g: import('phaser').GameObjects.Graphics, room: RoomDef) {
    const T = this.tilePx;
    const px = this.tp(room.tileX);
    const py = this.tpy(room.tileY);
    const pw = this.ts(room.tileW);
    const ph = this.ts(room.tileH);
    const c = room.color;

    g.fillStyle(0x080c18, 0.95);
    g.fillRect(px, py, pw, ph);

    g.fillStyle(c, 0.06);
    g.fillRect(px, py, pw, ph);

    const wallH = T;
    g.fillStyle(0x0a1022, 1);
    g.fillRect(px, py, pw, wallH);
    g.fillStyle(c, 0.18);
    g.fillRect(px, py, pw, wallH);

    for (let col = room.tileX; col < room.tileX + room.tileW; col++) {
      const bx = this.tp(col);
      const stoneVar = (col * 5 + room.tileY) % 3;
      const darkC = stoneVar === 0 ? 0x10172a : stoneVar === 1 ? 0x0c1222 : 0x141c30;
      g.fillStyle(darkC, 1);
      g.fillRect(bx + 1, py + 1, T - 2, wallH - 2);

      g.lineStyle(1, c, 0.12);
      g.strokeRect(bx + 1, py + 1, T - 2, wallH - 2);
    }

    g.lineStyle(2, c, 0.65);
    g.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

    const acLen = Math.max(6, T * 0.4);
    g.lineStyle(2, c, 0.95);
    g.beginPath(); g.moveTo(px, py + acLen); g.lineTo(px, py); g.lineTo(px + acLen, py); g.strokePath();
    g.beginPath(); g.moveTo(px + pw - acLen, py); g.lineTo(px + pw, py); g.lineTo(px + pw, py + acLen); g.strokePath();
    g.beginPath(); g.moveTo(px, py + ph - acLen); g.lineTo(px, py + ph); g.lineTo(px + acLen, py + ph); g.strokePath();
    g.beginPath(); g.moveTo(px + pw - acLen, py + ph); g.lineTo(px + pw, py + ph); g.lineTo(px + pw, py + ph - acLen); g.strokePath();

    g.lineStyle(1, c, 0.25);
    g.strokeRect(px + 4, py + 4, pw - 8, ph - 8);

    const doorX = px + pw / 2;
    const doorY = py + ph - 2;
    const dw = Math.max(8, T * 0.6);
    g.fillStyle(c, 0.5);
    g.fillRect(doorX - dw / 2, doorY - 3, dw, 5);
    g.lineStyle(1, c, 0.9);
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
      };
    });
  }

  private repositionAgents() {
    for (const ag of this.agents) {
      const room = DUNGEON_ROOMS.find(r => r.id === ag.roomId);
      if (room) {
        const margin = 1.5;
        ag.wx = this.tp(room.tileX + margin + Math.random() * (room.tileW - margin * 2 - 1));
        ag.wy = this.tpy(room.tileY + margin + Math.random() * (room.tileH - margin * 2 - 2));
        ag.tx = ag.wx; ag.ty = ag.wy;
      }
    }
  }

  private updateAgentMovement(dt: number) {
    const SPEED = 38;
    for (const ag of this.agents) {
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
      txt.setPosition(ag.wx, ag.wy - 16);
      txt.setAlpha(this.selectedAgentId === null || this.selectedAgentId === ag.id ? 1 : 0.25);
    });
  }

  private drawAgents() {
    const g = this.agentGfx;
    if (!g) return;
    g.clear();

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

    for (const ag of this.agents) {
      this.drawCharacter(g, ag);
    }
  }

  private drawCharacter(g: import('phaser').GameObjects.Graphics, ag: AgentState) {
    const color = ROLE_COLORS[ag.role] ?? 0x4d7fff;
    const isIdle = ag.status === 'Idle';
    const isSelected = this.selectedAgentId === ag.id;
    const dimmed = this.selectedAgentId !== null && !isSelected;
    const alpha = dimmed ? 0.35 : 1;

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

    g.fillStyle(skinColor, alpha);
    g.fillRect(x - S * 2, y - S * 6 + oy, S * 4, S * 4);

    const eyeX = ag.facing > 0 ? x + S : x - S;
    g.fillStyle(0x1a1a2e, alpha);
    g.fillRect(eyeX - S / 2, y - S * 5 + oy, S, S);

    g.fillStyle(bodyC, (isIdle ? 0.6 : 1) * alpha);
    g.fillRect(x - S * 3, y - S * 2 + oy, S * 6, S * 5);
    g.fillStyle(darkBodyC, 0.5 * alpha);
    g.fillRect(x - S, y - S * 2 + oy, S * 2, S);

    const legOffset = ag.walkFrame === 1 ? -S : ag.walkFrame === 3 ? S : 0;
    g.fillStyle(legC, alpha);
    g.fillRect(x - S * 2, y + S * 3 + oy, S * 2, S * 3 + (legOffset > 0 ? 0 : -legOffset));
    g.fillRect(x + S * 0, y + S * 3 + oy + (legOffset > 0 ? legOffset : 0), S * 2, S * 3 + (legOffset > 0 ? -legOffset : 0));

    if (!isIdle && ag.walkFrame % 2 === 0) {
      g.fillStyle(color, 0.3 * alpha);
      g.fillRect(x - S, y + S * 6, S * 2, S);
    }

    g.fillStyle(color, 0.7 * alpha);
    g.fillCircle(x, y - S * 9, S * 1.5);

    if (isIdle) {
      g.fillStyle(color, 0.1);
      g.fillEllipse(x, y + S * 7, S * 8, S * 3);
    }
  }

  private updateFx(dt: number) {
    const g = this.fxGfx;
    if (!g || !this.scene) return;
    g.clear();

    this.levelUpEffects = this.levelUpEffects.filter(e => e.timer > 0);
    for (const e of this.levelUpEffects) {
      e.timer -= dt;
      e.flashAlpha = Math.max(0, e.flashAlpha - 0.03 * dt);
      if (e.flashAlpha > 0) {
        g.fillStyle(0xffd700, e.flashAlpha * 0.05);
        g.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
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

    this.scanY = (this.scanY + 0.45 * dt) % (this.scene?.scale.height ?? 600);
    g.fillStyle(0x4df0d8, 0.01);
    g.fillRect(0, this.scanY, this.scene.scale.width, 2);
  }

  private handleClick(px: number, py: number) {
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

    this.selectedAgentId = null;
    this.selectedRoomId = null;
    this.onAgentSelect?.(null);
    this.onRoomSelect?.(null);
    this.drawOverlay();
  }

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
}
