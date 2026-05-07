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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={mountRef}
        style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
      />
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
