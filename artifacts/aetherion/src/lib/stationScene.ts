export interface AgentData {
  id: string;
  name: string;
  role: string;
  status: string;
  roomId: string;
  pct: number;
  level: number;
}

interface RoomDef {
  id: string;
  name: string;
  color: number;
  status: string;
  col: number;
  row: number;
}

interface Room extends RoomDef {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: number;
}

interface AgentState extends AgentData {
  x: number;
  y: number;
  tx: number;
  ty: number;
  trail: Array<{ x: number; y: number }>;
  moveTimer: number;
  commTimer: number;
  commTarget: string | null;
  commAlpha: number;
  particles: Particle[];
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  shape: 'circle' | 'diamond';
  color: number;
}

interface LevelUpEffect {
  x: number;
  y: number;
  rings: Array<{ r: number; alpha: number }>;
  particles: BurstParticle[];
  rays: Array<{ angle: number; len: number; alpha: number }>;
  flashAlpha: number;
  timer: number;
}

const ROOMS_DEF: RoomDef[] = [
  { id: 'r1', name: 'Research Lab',   color: 0x4df0d8, status: 'active',  col: 0, row: 0 },
  { id: 'r2', name: 'Dev Lab',         color: 0x4d7fff, status: 'working', col: 1, row: 0 },
  { id: 'r3', name: 'Design Studio',   color: 0x9b6dff, status: 'active',  col: 2, row: 0 },
  { id: 'r4', name: 'Marketing Hub',   color: 0xffb84d, status: 'working', col: 0, row: 1 },
  { id: 'r5', name: 'Ops Center',      color: 0x363d56, status: 'idle',    col: 1, row: 1 },
  { id: 'r6', name: 'Analytics',       color: 0x4d7fff, status: 'active',  col: 2, row: 1 },
];

const AGENTS_DEF: AgentData[] = [
  { id: 'a1', name: 'ARIA',  role: 'Research',  status: 'Working',   roomId: 'r1', pct: 72, level: 3 },
  { id: 'a2', name: 'STRAT', role: 'Strategy',  status: 'Working',   roomId: 'r1', pct: 55, level: 4 },
  { id: 'a3', name: 'FORGE', role: 'Builder',   status: 'Deploying', roomId: 'r2', pct: 45, level: 3 },
  { id: 'a4', name: 'NOVA',  role: 'Design',    status: 'Working',   roomId: 'r3', pct: 88, level: 2 },
  { id: 'a5', name: 'APEX',  role: 'Growth',    status: 'Writing',   roomId: 'r4', pct: 30, level: 3 },
  { id: 'a6', name: 'ECHO',  role: 'Growth',    status: 'Idle',      roomId: 'r4', pct: 0,  level: 2 },
  { id: 'a7', name: 'LENS',  role: 'Analytics', status: 'Active',    roomId: 'r6', pct: 91, level: 3 },
  { id: 'a8', name: 'ROSE',  role: 'Analytics', status: 'Analyzing', roomId: 'r6', pct: 78, level: 2 },
];

const ROLE_COLORS: Record<string, number> = {
  Research:  0x4df0d8,
  Strategy:  0x9b6dff,
  Builder:   0x4d7fff,
  Design:    0x9b6dff,
  Growth:    0x4dff9b,
  Analytics: 0xff4d6d,
  Content:   0xffb84d,
};

export class StationScene {
  onAgentSelect?: (agent: AgentData | null) => void;
  onLevelUpLabel?: (x: number, y: number, name: string, level: number) => void;

  private scene: import('phaser').Scene | null = null;
  private rooms: Room[] = [];
  private agents: AgentState[] = [];
  private gfx: import('phaser').GameObjects.Graphics | null = null;
  private scanY = 0;
  private levelUpEffects: LevelUpEffect[] = [];
  private agentLevels: Record<string, number> = {};
  private selectedAgentId: string | null = null;
  private PAD = 8;
  private GAP = 5;

  createPhaserScene(): import('phaser').Types.Scenes.CreateSceneFromObjectConfig {
    const self = this;
    return {
      key: 'StationScene',
      create(this: import('phaser').Scene) {
        self.scene = this;
        self.gfx = this.add.graphics();
        self.buildRooms(this.scale.width, this.scale.height);
        self.buildAgents();

        this.input.on('pointerdown', (ptr: import('phaser').Input.Pointer) => {
          let hit = false;
          for (const ag of self.agents) {
            const dx = ptr.x - ag.x, dy = ptr.y - ag.y;
            if (Math.sqrt(dx * dx + dy * dy) < 12) {
              self.selectedAgentId = self.selectedAgentId === ag.id ? null : ag.id;
              self.onAgentSelect?.(self.selectedAgentId ? ({ ...ag } as AgentData) : null);
              hit = true;
              break;
            }
          }
          if (!hit) {
            self.selectedAgentId = null;
            self.onAgentSelect?.(null);
          }
        });

        this.scale.on('resize', (gameSize: import('phaser').Structs.Size) => {
          self.buildRooms(gameSize.width, gameSize.height);
          self.repositionAgents();
        });
      },
      update(_time: number, delta: number) {
        if (!self.gfx) return;
        const dt = delta / 16.67;
        self.gfx.clear();
        self.drawBackground();
        self.drawGrid();
        self.drawRooms();
        self.updateAgents(dt);
        self.drawCommLines();
        self.drawAgents();
        self.drawLevelUpEffects(dt);
        self.drawScanline(dt);
      },
    };
  }

  private buildRooms(W: number, H: number) {
    const cols = 3, rows = 2;
    const totalW = W - this.PAD * 2;
    const totalH = H - this.PAD * 2;
    const cellW = (totalW - this.GAP * (cols - 1)) / cols;
    const cellH = (totalH - this.GAP * (rows - 1)) / rows;
    this.rooms = ROOMS_DEF.map(r => ({
      ...r,
      x: this.PAD + r.col * (cellW + this.GAP),
      y: this.PAD + r.row * (cellH + this.GAP),
      w: cellW,
      h: cellH,
    }));
  }

  private buildAgents() {
    this.agents = AGENTS_DEF.map(a => {
      const room = this.rooms.find(r => r.id === a.roomId);
      const startX = room ? room.x + 20 + Math.random() * (room.w - 40) : 60;
      const startY = room ? room.y + 20 + Math.random() * (room.h - 40) : 60;
      this.agentLevels[a.id] = a.level;
      return {
        ...a,
        x: startX, y: startY,
        tx: startX, ty: startY,
        trail: [],
        moveTimer: Math.random() * 100,
        commTimer: Math.random() * 180 + 60,
        commTarget: null,
        commAlpha: 0,
        particles: [],
      };
    });
  }

  private repositionAgents() {
    for (const ag of this.agents) {
      const room = this.rooms.find(r => r.id === ag.roomId);
      if (room) {
        const margin = 18;
        ag.tx = room.x + margin + Math.random() * (room.w - margin * 2);
        ag.ty = room.y + margin + Math.random() * (room.h - margin * 2);
      }
    }
  }

  private drawBackground() {
    if (!this.gfx || !this.scene) return;
    this.gfx.fillStyle(0x0a0b0f, 1);
    this.gfx.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
  }

  private drawGrid() {
    if (!this.gfx || !this.scene) return;
    const W = this.scene.scale.width, H = this.scene.scale.height;
    const spacing = 24;
    this.gfx.lineStyle(1, 0x4d7fff, 0.07);
    for (let x = 0; x < W; x += spacing) {
      this.gfx.beginPath(); this.gfx.moveTo(x, 0); this.gfx.lineTo(x, H); this.gfx.strokePath();
    }
    for (let y = 0; y < H; y += spacing) {
      this.gfx.beginPath(); this.gfx.moveTo(0, y); this.gfx.lineTo(W, y); this.gfx.strokePath();
    }
  }

  private drawRooms() {
    if (!this.gfx) return;
    for (const room of this.rooms) {
      const { x, y, w, h, color, status } = room;
      this.gfx.fillStyle(0x0f1118, 0.93);
      this.gfx.fillRect(x, y, w, h);
      const borderAlpha = status === 'idle' ? 0.12 : status === 'active' ? 0.75 : 0.6;
      this.gfx.lineStyle(1, color, borderAlpha);
      this.gfx.strokeRect(x, y, w, h);
      const acLen = 10;
      this.gfx.lineStyle(2, color, 0.95);
      this.gfx.beginPath(); this.gfx.moveTo(x, y + acLen); this.gfx.lineTo(x, y); this.gfx.lineTo(x + acLen, y); this.gfx.strokePath();
      this.gfx.beginPath(); this.gfx.moveTo(x + w - acLen, y + h); this.gfx.lineTo(x + w, y + h); this.gfx.lineTo(x + w, y + h - acLen); this.gfx.strokePath();
      const r = (color >> 16) & 0xff;
      const g = (color >> 8) & 0xff;
      const b = color & 0xff;
      const tint = (r << 16) | (g << 8) | b;
      this.gfx.fillStyle(tint, 0.03);
      this.gfx.fillRect(x + 1, y + 1, w - 2, h - 2);
    }
  }

  private updateAgents(dt: number) {
    for (const ag of this.agents) {
      const dx = ag.tx - ag.x, dy = ag.ty - ag.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        const speed = ag.status === 'Idle' ? 0.35 : 0.85;
        ag.x += (dx / dist) * Math.min(dist, speed * dt);
        ag.y += (dy / dist) * Math.min(dist, speed * dt);
        ag.trail.push({ x: ag.x, y: ag.y });
        if (ag.trail.length > 16) ag.trail.shift();
      }
      ag.moveTimer -= dt;
      if (ag.moveTimer <= 0) {
        const room = this.rooms.find(r => r.id === ag.roomId);
        if (room) {
          const margin = 18;
          ag.tx = room.x + margin + Math.random() * (room.w - margin * 2);
          ag.ty = room.y + margin + Math.random() * (room.h - margin * 2);
        }
        ag.moveTimer = 80 + Math.random() * 160;
      }
      ag.commTimer -= dt;
      if (ag.commTimer <= 0) {
        const others = this.agents.filter(a => a.id !== ag.id);
        if (others.length > 0) {
          ag.commTarget = others[Math.floor(Math.random() * others.length)].id;
          ag.commAlpha = 1;
        }
        ag.commTimer = 100 + Math.random() * 200;
      }
      if (ag.commAlpha > 0) ag.commAlpha -= 0.007 * dt;
      if (ag.status !== 'Idle' && Math.random() < 0.12) {
        ag.particles.push({
          x: ag.x, y: ag.y,
          vx: (Math.random() - 0.5) * 0.7,
          vy: -0.3 - Math.random() * 0.5,
          life: 1,
          color: ROLE_COLORS[ag.role] ?? 0x4d7fff,
        });
      }
      ag.particles = ag.particles
        .map(p => ({ ...p, x: p.x + p.vx * dt, y: p.y + p.vy * dt, life: p.life - 0.022 * dt }))
        .filter(p => p.life > 0);
    }
  }

  private drawCommLines() {
    if (!this.gfx) return;
    for (const ag of this.agents) {
      if (!ag.commTarget || ag.commAlpha <= 0) continue;
      const target = this.agents.find(a => a.id === ag.commTarget);
      if (!target) continue;
      const color = ROLE_COLORS[ag.role] ?? 0x4d7fff;
      this.gfx.lineStyle(1, color, ag.commAlpha * 0.5);
      this.gfx.beginPath(); this.gfx.moveTo(ag.x, ag.y); this.gfx.lineTo(target.x, target.y); this.gfx.strokePath();
      const mx = (ag.x + target.x) / 2, my = (ag.y + target.y) / 2;
      this.gfx.fillStyle(color, ag.commAlpha);
      this.gfx.fillCircle(mx, my, 2);
    }
  }

  private drawAgents() {
    if (!this.gfx) return;
    for (const ag of this.agents) {
      const color = ROLE_COLORS[ag.role] ?? 0x4d7fff;
      const isIdle = ag.status === 'Idle';
      for (let i = 0; i < ag.trail.length; i++) {
        const t = ag.trail[i];
        const alpha = (i / ag.trail.length) * 0.3;
        this.gfx.fillStyle(color, alpha);
        this.gfx.fillCircle(t.x, t.y, 2);
      }
      for (const p of ag.particles) {
        this.gfx.fillStyle(p.color, p.life * 0.6);
        this.gfx.fillCircle(p.x, p.y, 1.5);
      }
      this.gfx.lineStyle(1, color, isIdle ? 0.15 : 0.22);
      this.gfx.strokeCircle(ag.x, ag.y, 11);
      this.gfx.lineStyle(1.5, color, isIdle ? 0.3 : 0.9);
      this.gfx.strokeCircle(ag.x, ag.y, 6);
      this.gfx.fillStyle(color, isIdle ? 0.2 : 0.85);
      this.gfx.fillCircle(ag.x, ag.y, 2.5);
      if (this.selectedAgentId === ag.id) {
        this.gfx.lineStyle(1.5, 0xffffff, 0.9);
        this.gfx.strokeCircle(ag.x, ag.y, 15);
        this.gfx.lineStyle(1, color, 0.5);
        this.gfx.strokeCircle(ag.x, ag.y, 19);
      }
    }
  }

  private drawLevelUpEffects(dt: number) {
    if (!this.gfx || !this.scene) return;
    this.levelUpEffects = this.levelUpEffects.filter(e => e.timer > 0);
    for (const e of this.levelUpEffects) {
      e.timer -= dt;
      e.flashAlpha = Math.max(0, e.flashAlpha - 0.035 * dt);
      if (e.flashAlpha > 0) {
        this.gfx.fillStyle(0xffd700, e.flashAlpha * 0.06);
        this.gfx.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
      }
      for (const ring of e.rings) {
        ring.r += 2 * dt;
        ring.alpha = Math.max(0, ring.alpha - 0.016 * dt);
        if (ring.alpha > 0) {
          this.gfx.lineStyle(2, 0xffd700, ring.alpha);
          this.gfx.strokeCircle(e.x, e.y, ring.r);
        }
      }
      for (const ray of e.rays) {
        ray.len = Math.min(90, ray.len + 3 * dt);
        ray.alpha = Math.max(0, ray.alpha - 0.018 * dt);
        if (ray.alpha > 0) {
          this.gfx.lineStyle(1.5, 0xffd700, ray.alpha * 0.7);
          this.gfx.beginPath();
          this.gfx.moveTo(e.x, e.y);
          this.gfx.lineTo(e.x + Math.cos(ray.angle) * ray.len, e.y + Math.sin(ray.angle) * ray.len);
          this.gfx.strokePath();
        }
      }
      for (const p of e.particles) {
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.06 * dt; p.life -= 0.016 * dt;
        if (p.life > 0) {
          this.gfx.fillStyle(p.color, p.life);
          if (p.shape === 'circle') {
            this.gfx.fillCircle(p.x, p.y, 2.5);
          } else {
            this.gfx.beginPath();
            this.gfx.moveTo(p.x, p.y - 3); this.gfx.lineTo(p.x + 3, p.y);
            this.gfx.lineTo(p.x, p.y + 3); this.gfx.lineTo(p.x - 3, p.y);
            this.gfx.closePath(); this.gfx.fillPath();
          }
        }
      }
      e.particles = e.particles.filter(p => p.life > 0);
    }
  }

  private drawScanline(dt: number) {
    if (!this.gfx || !this.scene) return;
    this.scanY = (this.scanY + 0.7 * dt) % this.scene.scale.height;
    this.gfx.fillStyle(0x4df0d8, 0.018);
    this.gfx.fillRect(0, this.scanY, this.scene.scale.width, 2);
  }

  triggerLevelUp(agentId: string): number {
    const ag = this.agents.find(a => a.id === agentId);
    if (!ag) return 0;
    const newLevel = (this.agentLevels[agentId] ?? ag.level) + 1;
    this.agentLevels[agentId] = newLevel;
    ag.level = newLevel;
    const rings = Array.from({ length: 4 }, (_, i) => ({ r: i * 8, alpha: 1 - i * 0.15 }));
    const particles: BurstParticle[] = Array.from({ length: 36 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      return {
        x: ag.x, y: ag.y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1,
        life: 0.8 + Math.random() * 0.4,
        shape: Math.random() > 0.5 ? 'circle' : 'diamond',
        color: Math.random() > 0.5 ? 0xffd700 : 0xffffff,
      };
    });
    const rays = Array.from({ length: 12 }, (_, i) => ({ angle: (i / 12) * Math.PI * 2, len: 4, alpha: 1 }));
    this.levelUpEffects.push({ x: ag.x, y: ag.y, rings, particles, rays, flashAlpha: 1, timer: 130 });
    this.onLevelUpLabel?.(ag.x, ag.y, ag.name, newLevel);
    return newLevel;
  }

  getAgentLevel(id: string): number {
    return this.agentLevels[id] ?? 0;
  }
}
