import { useEffect, useRef, useState, MutableRefObject } from 'react';
import type { AgentData } from '../lib/stationScene';

interface LevelUpLabel {
  x: number;
  y: number;
  name: string;
  level: number;
  id: number;
}

interface Props {
  onAgentSelect: (agent: AgentData | null) => void;
  triggerRef: MutableRefObject<((id: string) => number) | null>;
}

export function StationCanvas({ onAgentSelect, triggerRef }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<unknown>(null);
  const [label, setLabel] = useState<LevelUpLabel | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    let destroyed = false;

    async function init() {
      const PhaserMod = await import('phaser');
      // Handle both ESM default and CJS module shapes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Phaser = ((PhaserMod as any).default ?? PhaserMod) as typeof import('phaser');
      const { StationScene } = await import('../lib/stationScene');
      if (destroyed || !mountRef.current) return;

      const stationScene = new StationScene();
      stationScene.onAgentSelect = onAgentSelect;
      stationScene.onLevelUpLabel = (x, y, name, level) => {
        setLabel({ x, y, name, level, id: Date.now() });
        setTimeout(() => setLabel(null), 2000);
      };
      triggerRef.current = (id) => stationScene.triggerLevelUp(id);

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
      });

      gameRef.current = game;
    }

    init();

    return () => {
      destroyed = true;
      if (gameRef.current) {
        (gameRef.current as { destroy: (v: boolean) => void }).destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
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
