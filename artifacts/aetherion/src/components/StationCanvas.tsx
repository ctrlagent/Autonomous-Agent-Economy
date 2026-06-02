import { useEffect, useRef, useState, MutableRefObject } from 'react';
import type { AgentData, MinimapData } from '../lib/stationScene';

interface LevelUpLabel {
  x: number;
  y: number;
  name: string;
  level: number;
  id: number;
}

interface MissionReward { xp: number; revenue: number; unlockLabel: string; }

interface Props {
  onAgentSelect: (agent: AgentData | null) => void;
  onRoomSelect?: (roomId: string | null) => void;
  onRevenueChange?: (delta: number) => void;
  onRoomMissionComplete?: (roomId: string, roomName: string, reward: MissionReward) => void;
  triggerRef: MutableRefObject<((id: string) => number) | null>;
  sceneRef?: MutableRefObject<import('../lib/stationScene').StationScene | null>;
}

// ─── Minimap canvas drawing ────────────────────────────────────────────────
function drawMinimapCanvas(ctx: CanvasRenderingContext2D, data: MinimapData, cw: number, ch: number) {
  const pad = 2;
  const iw = cw - pad * 2;
  const ih = ch - pad * 2;

  ctx.clearRect(0, 0, cw, ch);

  // Background
  ctx.fillStyle = 'rgba(0,0,16,0.88)';
  ctx.fillRect(0, 0, cw, ch);

  // Border — cyan glow
  ctx.strokeStyle = 'rgba(91,143,255,0.7)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0.75, 0.75, cw - 1.5, ch - 1.5);

  // "NAV" label
  ctx.fillStyle = 'rgba(91,143,255,0.5)';
  ctx.font = '5px "Press Start 2P", monospace';
  ctx.fillText('NAV', pad + 2, pad + 7);

  const toS = (nx: number, ny: number) => ({ sx: pad + nx * iw, sy: pad + ny * ih });

  // Corridors
  ctx.fillStyle = 'rgba(42,56,96,0.85)';
  for (const cor of data.corridors) {
    const { sx, sy } = toS(cor.nx, cor.ny);
    ctx.fillRect(sx, sy, cor.nw * iw, cor.nh * ih);
  }

  // Rooms
  for (const room of data.rooms) {
    const { sx, sy } = toS(room.nx, room.ny);
    const base = room.hasIncident ? 0xff2244 : room.color;
    const hex = `#${base.toString(16).padStart(6, '0')}`;
    ctx.fillStyle = `${hex}50`;
    ctx.fillRect(sx, sy, room.nw * iw, room.nh * ih);
    ctx.strokeStyle = `${hex}cc`;
    ctx.lineWidth = 1;
    ctx.strokeRect(sx + 0.5, sy + 0.5, room.nw * iw - 1, room.nh * ih - 1);
  }

  // Agent dots
  for (const ag of data.agents) {
    const { sx, sy } = toS(ag.nx, ag.ny);
    const hex = `#${ag.color.toString(16).padStart(6, '0')}`;
    if (ag.isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = ag.isSelected ? hex : `${hex}dd`;
    ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
  }

  // Viewport rectangle
  const { sx: vx, sy: vy } = toS(data.viewport.nx, data.viewport.ny);
  const vw = data.viewport.nw * iw;
  const vh = data.viewport.nh * ih;
  const isZoomedOrPanned = data.viewport.nw < 0.98 || Math.abs(data.viewport.nx) > 0.01 || Math.abs(data.viewport.ny) > 0.01;

  const cx1 = Math.max(pad, vx);
  const cy1 = Math.max(pad, vy);
  const cx2 = Math.min(cw - pad, vx + vw);
  const cy2 = Math.min(ch - pad, vy + vh);

  if (cx2 > cx1 && cy2 > cy1) {
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(cx1, cy1, cx2 - cx1, cy2 - cy1);
    ctx.strokeStyle = `rgba(255,255,255,${isZoomedOrPanned ? 0.9 : 0.3})`;
    ctx.lineWidth = isZoomedOrPanned ? 1.5 : 1;
    ctx.strokeRect(cx1, cy1, cx2 - cx1, cy2 - cy1);
  }
}

export function StationCanvas({ onAgentSelect, onRoomSelect, onRevenueChange, onRoomMissionComplete, triggerRef, sceneRef }: Props) {
  const mountRef    = useRef<HTMLDivElement>(null);
  const gameRef     = useRef<unknown>(null);
  const minimapRef  = useRef<HTMLCanvasElement>(null);
  const [label, setLabel]       = useState<LevelUpLabel | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;
    let destroyed = false;

    async function init() {
      const PhaserMod = await import('phaser');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Phaser = ((PhaserMod as any).default ?? PhaserMod) as typeof import('phaser');
      const { StationScene } = await import('../lib/stationScene');
      if (destroyed || !mountRef.current) return;

      const stationScene = new StationScene();
      stationScene.onAgentSelect = onAgentSelect;
      stationScene.onRoomSelect  = onRoomSelect ?? null;
      stationScene.onLevelUpLabel = (x, y, name, level) => {
        setLabel({ x, y, name, level, id: Date.now() });
        setTimeout(() => setLabel(null), 2000);
      };
      stationScene.onRevenueChange     = onRevenueChange ?? undefined;
      stationScene.onRoomMissionComplete = onRoomMissionComplete ?? undefined;
      stationScene.onZoomChange        = setZoomLevel;
      stationScene.onIsPanningChange   = setIsPanning;

      // Wire minimap: scene calls this each frame with normalized layout data
      stationScene.onMinimapData = (data: MinimapData) => {
        const canvas = minimapRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        drawMinimapCanvas(ctx, data, canvas.width, canvas.height);
      };

      triggerRef.current = (id) => stationScene.triggerLevelUp(id);
      if (sceneRef) sceneRef.current = stationScene;

      const phaserScene = stationScene.createPhaserScene();

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: mountRef.current,
        width: '100%',
        height: '100%',
        transparent: true,
        scene: phaserScene,
        banner: false,
        audio: { noAudio: true },
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        pixelArt: true,
      });

      gameRef.current = game;
    }

    init();

    return () => {
      destroyed = true;
      if (sceneRef) sceneRef.current = null;
      if (gameRef.current) {
        (gameRef.current as { destroy: (v: boolean) => void }).destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '+' || e.key === '=') sceneRef?.current?.zoomIn();
      else if (e.key === '-') sceneRef?.current?.zoomOut();
      else if (e.key === '0') sceneRef?.current?.zoomReset();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [sceneRef]);

  // Minimap click → pan camera to that world position
  const handleMinimapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = minimapRef.current;
    if (!canvas || !sceneRef?.current) return;
    const rect = canvas.getBoundingClientRect();
    const pad  = 2;
    const cw   = canvas.width;
    const ch   = canvas.height;
    const cx   = (e.clientX - rect.left) * (cw / rect.width);
    const cy   = (e.clientY - rect.top)  * (ch / rect.height);
    const nx   = Math.max(0, Math.min(1, (cx - pad) / (cw - pad * 2)));
    const ny   = Math.max(0, Math.min(1, (cy - pad) / (ch - pad * 2)));
    sceneRef.current.panToNormalized(nx, ny);
  };

  const zoomPct = Math.round(zoomLevel * 100);

  const btnBase: React.CSSProperties = {
    fontFamily: "'Space Mono', monospace",
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1,
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(8,8,18,0.88)',
    border: '1px solid var(--ae-border)',
    color: 'var(--ae-text)',
    cursor: 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s, color 0.15s',
    userSelect: 'none',
    flexShrink: 0,
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#03040b',
      backgroundImage: [
        'linear-gradient(rgba(15,28,53,0.8) 1px, transparent 1px)',
        'linear-gradient(90deg, rgba(15,28,53,0.8) 1px, transparent 1px)',
        'linear-gradient(rgba(26,46,84,0.35) 1px, transparent 1px)',
        'linear-gradient(90deg, rgba(26,46,84,0.35) 1px, transparent 1px)',
      ].join(', '),
      backgroundSize: '24px 24px, 24px 24px, 96px 96px, 96px 96px',
    }}>
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
          cursor: isPanning ? 'grabbing' : 'grab',
        }}
      />

      {/* Minimap canvas — top-right, camera-independent */}
      <canvas
        ref={minimapRef}
        width={120}
        height={90}
        onClick={handleMinimapClick}
        title="Click to navigate"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 120,
          height: 90,
          cursor: 'crosshair',
          imageRendering: 'pixelated',
          zIndex: 20,
          pointerEvents: 'all',
        }}
      />

      {/* Zoom controls — bottom-left */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        zIndex: 20,
        pointerEvents: 'all',
      }}>
        <button
          style={btnBase}
          title="Zoom out (−)"
          onClick={() => sceneRef?.current?.zoomOut()}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ae-cyan)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 8px var(--ae-cyan)55';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--ae-cyan)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ae-border)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--ae-text)';
          }}
        >−</button>

        <button
          style={btnBase}
          title="Reset zoom (0)"
          onClick={() => sceneRef?.current?.zoomReset()}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ae-cyan)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 8px var(--ae-cyan)55';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--ae-cyan)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ae-border)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--ae-text)';
          }}
        >⟳</button>

        <button
          style={btnBase}
          title="Zoom in (+)"
          onClick={() => sceneRef?.current?.zoomIn()}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ae-cyan)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 8px var(--ae-cyan)55';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--ae-cyan)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ae-border)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--ae-text)';
          }}
        >+</button>

        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 9,
          color: zoomLevel === 1.0 ? 'var(--ae-muted)' : 'var(--ae-cyan)',
          letterSpacing: '0.06em',
          minWidth: 36,
          textAlign: 'right',
          paddingLeft: 4,
        }}>{zoomPct}%</span>
      </div>

      {label && (
        <div
          style={{
            position: 'absolute',
            left: label.x,
            top: label.y - 30,
            transform: 'translateX(-50%)',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px',
            color: '#ffd700',
            textShadow: '0 0 12px #ffd700, 0 0 24px rgba(255,215,0,0.5)',
            pointerEvents: 'none',
            animation: 'floatUp 2s ease-out forwards',
            whiteSpace: 'nowrap',
            zIndex: 20,
            letterSpacing: '0.05em',
          }}
        >
          {label.name} → LV.{label.level}
        </div>
      )}
    </div>
  );
}
