import { useEffect, useRef, useState, MutableRefObject } from 'react';
import type { AgentData } from '../lib/stationScene';

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

export function StationCanvas({ onAgentSelect, onRoomSelect, onRevenueChange, onRoomMissionComplete, triggerRef, sceneRef }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<unknown>(null);
  const [label, setLabel] = useState<LevelUpLabel | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);

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
      stationScene.onRoomSelect = onRoomSelect ?? null;
      stationScene.onLevelUpLabel = (x, y, name, level) => {
        setLabel({ x, y, name, level, id: Date.now() });
        setTimeout(() => setLabel(null), 2000);
      };
      stationScene.onRevenueChange = onRevenueChange ?? undefined;
      stationScene.onRoomMissionComplete = onRoomMissionComplete ?? undefined;
      stationScene.onZoomChange = setZoomLevel;
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
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={mountRef}
        style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
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
