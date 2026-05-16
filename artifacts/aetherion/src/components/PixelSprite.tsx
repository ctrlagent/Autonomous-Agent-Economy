
/**
 * Pixel art sprites for CTRL agents.
 * Each sprite is a 16×24 grid of color codes, rendered as SVG rects.
 * Inspired by free Kenney/OpenGameArt CC0 pixel art style.
 */

const T = 'none';

type Grid = string[][];

const SPRITES: Record<string, Grid> = {
  research: [
    [T,T,T,'#4df0d8','#4df0d8','#4df0d8',T,T,T,T,T,T,T,T,T,T],
    [T,T,'#4df0d8','#a0fff4','#a0fff4','#4df0d8','#4df0d8',T,T,T,T,T,T,T,T,T],
    [T,T,'#2bb8a4','#4df0d8','#4df0d8','#4df0d8','#2bb8a4',T,T,T,T,T,T,T,T,T],
    [T,T,T,'#4df0d8','#4df0d8','#4df0d8',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,T,'#ffcba4','#ffcba4',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#ffcba4','#dda07a','#dda07a','#ffcba4',T,T,T,T,T,T,T,T,T],
    [T,T,T,'#ffcba4','#ffcba4','#ffcba4','#ffcba4',T,T,T,T,T,T,T,T,T],
    [T,T,T,T,'#ffcba4','#ffcba4',T,T,T,T,T,T,T,T,T,T],
    [T,'#0d2e2b','#2bb8a4','#2bb8a4','#2bb8a4','#2bb8a4','#0d2e2b',T,T,T,T,T,T,T,T,T],
    [T,'#2bb8a4','#4df0d8','#4df0d8','#4df0d8','#4df0d8','#2bb8a4',T,T,T,T,T,T,T,T,T],
    [T,'#4df0d8','#a0fff4','#4df0d8','#4df0d8','#a0fff4','#4df0d8',T,T,T,T,T,T,T,T,T],
    [T,'#2bb8a4','#4df0d8','#4df0d8','#4df0d8','#4df0d8','#2bb8a4',T,T,T,T,T,T,T,T,T],
    [T,T,'#2bb8a4','#4df0d8','#4df0d8','#2bb8a4',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#1a7a6e','#1a7a6e',T,T,T,T,T,T,T,T,T,T,T],
    [T,T,'#1a7a6e','#4df0d8','#4df0d8','#1a7a6e',T,T,T,T,T,T,T,T,T,T],
    [T,T,'#4df0d8','#2bb8a4','#2bb8a4','#4df0d8',T,T,T,T,T,T,T,T,T,T],
    [T,T,'#4df0d8','#2bb8a4','#2bb8a4','#4df0d8',T,T,T,T,T,T,T,T,T,T],
  ],
  strategy: [
    [T,T,T,'#9b6dff','#9b6dff','#9b6dff',T,T,T,T,T,T,T,T,T,T],
    [T,T,'#7a4fd4','#9b6dff','#9b6dff','#7a4fd4','#5532a0',T,T,T,T,T,T,T,T,T],
    [T,T,'#9b6dff','#d4b8ff','#d4b8ff','#9b6dff','#7a4fd4',T,T,T,T,T,T,T,T,T],
    [T,T,'#7a4fd4','#9b6dff','#9b6dff','#7a4fd4',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#ffcba4','#ffcba4','#ffcba4',T,T,T,T,T,T,T,T,T,T],
    [T,T,'#ffcba4','#dda07a','#dda07a','#ffcba4',T,T,T,T,T,T,T,T,T,T],
    [T,T,'#9b6dff','#ffcba4','#ffcba4','#9b6dff',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#9b6dff','#9b6dff',T,T,T,T,T,T,T,T,T,T,T],
    [T,'#5532a0','#7a4fd4','#9b6dff','#9b6dff','#7a4fd4','#5532a0',T,T,T,T,T,T,T,T,T],
    [T,'#7a4fd4','#9b6dff','#d4b8ff','#d4b8ff','#9b6dff','#7a4fd4',T,T,T,T,T,T,T,T,T],
    ['#5532a0','#9b6dff','#d4b8ff','#9b6dff','#9b6dff','#d4b8ff','#9b6dff','#5532a0',T,T,T,T,T,T,T,T],
    [T,'#7a4fd4','#9b6dff','#d4b8ff','#d4b8ff','#9b6dff','#7a4fd4',T,T,T,T,T,T,T,T,T],
    [T,T,'#5532a0','#9b6dff','#9b6dff','#5532a0',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#5532a0','#5532a0',T,T,T,T,T,T,T,T,T,T,T],
    [T,'#5532a0','#7a4fd4','#9b6dff','#9b6dff','#7a4fd4','#5532a0',T,T,T,T,T,T,T,T,T],
    [T,'#9b6dff','#9b6dff','#7a4fd4','#7a4fd4','#9b6dff','#9b6dff',T,T,T,T,T,T,T,T,T],
    [T,'#9b6dff','#9b6dff','#7a4fd4','#7a4fd4','#9b6dff','#9b6dff',T,T,T,T,T,T,T,T,T],
  ],
  builder: [
    [T,T,'#363d56','#4d7fff','#4d7fff','#363d56',T,T,T,T,T,T,T,T,T,T],
    [T,'#1a3d8a','#4d7fff','#9ab8ff','#9ab8ff','#4d7fff','#1a3d8a',T,T,T,T,T,T,T,T,T],
    [T,'#4d7fff','#9ab8ff','#4d7fff','#4d7fff','#9ab8ff','#4d7fff',T,T,T,T,T,T,T,T,T],
    [T,'#1a3d8a','#4d7fff','#4d7fff','#4d7fff','#4d7fff','#1a3d8a',T,T,T,T,T,T,T,T,T],
    [T,T,T,'#c0c8d8','#c0c8d8',T,T,T,T,T,T,T,T,T,T,T],
    [T,T,'#a0a8b8','#e0e8f8','#e0e8f8','#a0a8b8',T,T,T,T,T,T,T,T,T,T],
    [T,T,'#4d7fff','#c0c8d8','#c0c8d8','#4d7fff',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#4d7fff','#4d7fff',T,T,T,T,T,T,T,T,T,T,T],
    [T,'#0d1a3d','#1a3d8a','#4d7fff','#4d7fff','#1a3d8a','#0d1a3d',T,T,T,T,T,T,T,T,T],
    ['#4d7fff','#4d7fff','#9ab8ff','#4d7fff','#4d7fff','#9ab8ff','#4d7fff','#4d7fff',T,T,T,T,T,T,T,T],
    ['#1a3d8a','#4d7fff','#4d7fff','#9ab8ff','#9ab8ff','#4d7fff','#4d7fff','#1a3d8a',T,T,T,T,T,T,T,T],
    [T,'#1a3d8a','#4d7fff','#4d7fff','#4d7fff','#4d7fff','#1a3d8a',T,T,T,T,T,T,T,T,T],
    [T,T,'#1a3d8a','#4d7fff','#4d7fff','#1a3d8a',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#1a3d8a','#1a3d8a',T,T,T,T,T,T,T,T,T,T,T],
    [T,'#1a3d8a','#4d7fff','#4d7fff','#4d7fff','#4d7fff','#1a3d8a',T,T,T,T,T,T,T,T,T],
    [T,'#4d7fff','#9ab8ff','#4d7fff','#4d7fff','#9ab8ff','#4d7fff',T,T,T,T,T,T,T,T,T],
    [T,'#4d7fff','#9ab8ff','#4d7fff','#4d7fff','#9ab8ff','#4d7fff',T,T,T,T,T,T,T,T,T],
  ],
  design: [
    [T,T,T,'#9b6dff','#ff4d9b','#9b6dff',T,T,T,T,T,T,T,T,T,T],
    [T,T,'#ff4d9b','#d4b8ff','#ffb8d8','#d4b8ff','#9b6dff',T,T,T,T,T,T,T,T,T],
    [T,T,'#9b6dff','#d4b8ff','#d4b8ff','#ffb8d8','#ff4d9b',T,T,T,T,T,T,T,T,T],
    [T,T,T,'#9b6dff','#d4b8ff','#9b6dff',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#ffcba4','#ffcba4','#ffcba4',T,T,T,T,T,T,T,T,T,T],
    [T,T,'#ffcba4','#dda07a','#dda07a','#ffcba4',T,T,T,T,T,T,T,T,T,T],
    [T,T,'#9b6dff','#ffcba4','#ffcba4','#ff4d9b',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#9b6dff','#ff4d9b',T,T,T,T,T,T,T,T,T,T,T],
    [T,'#5532a0','#9b6dff','#ff4d9b','#ff4d9b','#9b6dff','#5532a0',T,T,T,T,T,T,T,T,T],
    [T,'#9b6dff','#ff4d9b','#d4b8ff','#ffb8d8','#ff4d9b','#9b6dff',T,T,T,T,T,T,T,T,T],
    ['#ff4d9b','#d4b8ff','#ffb8d8','#ff4d9b','#9b6dff','#ffb8d8','#d4b8ff','#ff4d9b',T,T,T,T,T,T,T,T],
    [T,'#9b6dff','#ff4d9b','#d4b8ff','#ffb8d8','#ff4d9b','#9b6dff',T,T,T,T,T,T,T,T,T],
    [T,T,'#5532a0','#9b6dff','#ff4d9b','#5532a0',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#5532a0','#5532a0',T,T,T,T,T,T,T,T,T,T,T],
    [T,'#5532a0','#9b6dff','#ff4d9b','#9b6dff','#9b6dff','#5532a0',T,T,T,T,T,T,T,T,T],
    [T,'#9b6dff','#ff4d9b','#9b6dff','#9b6dff','#ff4d9b','#9b6dff',T,T,T,T,T,T,T,T,T],
    [T,'#9b6dff','#ff4d9b','#9b6dff','#9b6dff','#ff4d9b','#9b6dff',T,T,T,T,T,T,T,T,T],
  ],
  growth: [
    [T,T,T,'#ff8c00','#ff8c00','#ff4dff',T,T,T,T,T,T,T,T,T,T],
    [T,T,'#ff8c00','#ffd080','#ffd080','#ff8c00','#ff4dff',T,T,T,T,T,T,T,T,T],
    [T,T,'#ff4dff','#ffd080','#ffd080','#ffd080','#ff8c00',T,T,T,T,T,T,T,T,T],
    [T,T,T,'#ff8c00','#ffd080','#ff4dff',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#ffcba4','#ffcba4',T,T,T,T,T,T,T,T,T,T,T],
    [T,T,'#ffcba4','#dda07a','#dda07a','#ffcba4',T,T,T,T,T,T,T,T,T,T],
    [T,T,'#4dff9b','#ffcba4','#ffcba4','#4dff9b',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#4dff9b','#4dff9b',T,T,T,T,T,T,T,T,T,T,T],
    [T,'#148a42','#2bcc6e','#4dff9b','#4dff9b','#2bcc6e','#148a42',T,T,T,T,T,T,T,T,T],
    [T,'#4dff9b','#a0ffcc','#4dff9b','#4dff9b','#a0ffcc','#4dff9b',T,T,T,T,T,T,T,T,T],
    ['#2bcc6e','#4dff9b','#ff8c00','#4dff9b','#4dff9b','#ff8c00','#4dff9b','#2bcc6e',T,T,T,T,T,T,T,T],
    [T,'#4dff9b','#a0ffcc','#4dff9b','#4dff9b','#a0ffcc','#4dff9b',T,T,T,T,T,T,T,T,T],
    [T,T,'#148a42','#4dff9b','#4dff9b','#148a42',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#148a42','#148a42',T,T,T,T,T,T,T,T,T,T,T],
    [T,'#148a42','#2bcc6e','#4dff9b','#4dff9b','#2bcc6e','#148a42',T,T,T,T,T,T,T,T,T],
    [T,'#4dff9b','#a0ffcc','#2bcc6e','#2bcc6e','#a0ffcc','#4dff9b',T,T,T,T,T,T,T,T,T],
    [T,'#4dff9b','#a0ffcc','#2bcc6e','#2bcc6e','#a0ffcc','#4dff9b',T,T,T,T,T,T,T,T,T],
  ],
  analytics: [
    [T,T,T,'#ff4d6d','#ff4d6d','#ff4d6d',T,T,T,T,T,T,T,T,T,T],
    [T,T,'#cc2b45','#ff4d6d','#ff4d6d','#cc2b45','#8a1428',T,T,T,T,T,T,T,T,T],
    [T,T,'#ff4d6d','#ff9ab0','#ff9ab0','#ff4d6d','#cc2b45',T,T,T,T,T,T,T,T,T],
    [T,T,'#cc2b45','#4dff9b','#4dff9b','#cc2b45',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#c0c8d8','#c0c8d8',T,T,T,T,T,T,T,T,T,T,T],
    [T,T,'#a0a8b8','#e0e8f8','#e0e8f8','#a0a8b8',T,T,T,T,T,T,T,T,T,T],
    [T,T,'#ff4d6d','#c0c8d8','#c0c8d8','#ff4d6d',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#ff4d6d','#ff4d6d',T,T,T,T,T,T,T,T,T,T,T],
    [T,'#8a1428','#cc2b45','#ff4d6d','#ff4d6d','#cc2b45','#8a1428',T,T,T,T,T,T,T,T,T],
    [T,'#ff4d6d','#4dff9b','#ff9ab0','#ff9ab0','#4dff9b','#ff4d6d',T,T,T,T,T,T,T,T,T],
    ['#cc2b45','#ff4d6d','#ff9ab0','#ff4d6d','#ff4d6d','#ff9ab0','#ff4d6d','#cc2b45',T,T,T,T,T,T,T,T],
    [T,'#cc2b45','#ff4d6d','#ff9ab0','#ff9ab0','#ff4d6d','#cc2b45',T,T,T,T,T,T,T,T,T],
    [T,T,'#8a1428','#ff4d6d','#ff4d6d','#8a1428',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#8a1428','#8a1428',T,T,T,T,T,T,T,T,T,T,T],
    [T,'#8a1428','#cc2b45','#ff4d6d','#ff4d6d','#cc2b45','#8a1428',T,T,T,T,T,T,T,T,T],
    [T,'#ff4d6d','#ff9ab0','#cc2b45','#cc2b45','#ff9ab0','#ff4d6d',T,T,T,T,T,T,T,T,T],
    [T,'#ff4d6d','#ff9ab0','#cc2b45','#cc2b45','#ff9ab0','#ff4d6d',T,T,T,T,T,T,T,T,T],
  ],
  content: [
    [T,T,'#ffb84d','#cc8a2b','#cc8a2b','#ffb84d',T,T,T,T,T,T,T,T,T,T],
    [T,'#cc8a2b','#ffb84d','#ffd896','#ffd896','#ffb84d','#cc8a2b',T,T,T,T,T,T,T,T,T],
    [T,'#ffb84d','#ffd896','#ffb84d','#ffb84d','#ffd896','#ffb84d',T,T,T,T,T,T,T,T,T],
    [T,'#cc8a2b','#ffb84d','#ffd896','#ffd896','#ffb84d','#cc8a2b',T,T,T,T,T,T,T,T,T],
    [T,T,T,'#ffcba4','#ffcba4',T,T,T,T,T,T,T,T,T,T,T],
    [T,T,'#ffcba4','#dda07a','#dda07a','#ffcba4',T,T,T,T,T,T,T,T,T,T],
    [T,T,'#ffb84d','#ffcba4','#ffcba4','#cc8a2b',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#ffb84d','#cc8a2b',T,T,T,T,T,T,T,T,T,T,T],
    [T,'#8a5c14','#cc8a2b','#ffb84d','#ffb84d','#cc8a2b','#8a5c14',T,T,T,T,T,T,T,T,T],
    [T,'#ffb84d','#ffd896','#ffb84d','#ffb84d','#ffd896','#ffb84d',T,T,T,T,T,T,T,T,T],
    ['#cc8a2b','#ffb84d','#ffd896','#ffb84d','#ffb84d','#ffd896','#ffb84d','#cc8a2b',T,T,T,T,T,T,T,T],
    [T,'#cc8a2b','#ffb84d','#ffd896','#ffd896','#ffb84d','#cc8a2b',T,T,T,T,T,T,T,T,T],
    [T,T,'#8a5c14','#ffb84d','#ffb84d','#8a5c14',T,T,T,T,T,T,T,T,T,T],
    [T,T,T,'#8a5c14','#8a5c14',T,T,T,T,T,T,T,T,T,T,T],
    [T,'#8a5c14','#cc8a2b','#ffb84d','#ffb84d','#cc8a2b','#8a5c14',T,T,T,T,T,T,T,T,T],
    [T,'#ffb84d','#ffd896','#cc8a2b','#cc8a2b','#ffd896','#ffb84d',T,T,T,T,T,T,T,T,T],
    [T,'#ffb84d','#ffd896','#cc8a2b','#cc8a2b','#ffd896','#ffb84d',T,T,T,T,T,T,T,T,T],
  ],
};

const ROLE_SPRITE_MAP: Record<string, string> = {
  research: 'research',
  strategy: 'strategy',
  builder:  'builder',
  design:   'design',
  growth:   'growth',
  analytics:'analytics',
  content:  'content',
};

interface PixelSpriteProps {
  role: string;
  size?: number;
  glow?: boolean;
  glowColor?: string;
}

export function PixelSprite({ role, size = 3, glow = false, glowColor }: PixelSpriteProps) {
  const key = ROLE_SPRITE_MAP[role?.toLowerCase()] ?? 'builder';
  const grid = SPRITES[key];
  const cols = 8;
  const rows = grid.length;
  const svgW = cols * size;
  const svgH = rows * size;

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${cols} ${rows}`}
      style={{
        imageRendering: 'pixelated',
        display: 'block',
        flexShrink: 0,
        filter: glow && glowColor ? `drop-shadow(0 0 4px ${glowColor}) drop-shadow(0 0 8px ${glowColor}88)` : undefined,
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {grid.map((row, y) =>
        row.slice(0, cols).map((color, x) =>
          color !== T && color !== 'none' ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
          ) : null
        )
      )}
    </svg>
  );
}

export function AgentAvatar({ role, size = 48 }: { role: string; size?: number }) {
  const roleColors: Record<string, string> = {
    research: '#4df0d8', strategy: '#9b6dff', builder: '#4d7fff',
    design: '#ff4d9b', growth: '#4dff9b', analytics: '#ff4d6d', content: '#ffb84d',
  };
  const color = roleColors[role?.toLowerCase()] ?? '#4d7fff';
  const px = Math.round(size / 17);

  return (
    <div style={{
      width: size,
      height: size,
      background: `${color}18`,
      border: `1px solid ${color}55`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: px * 2, height: px * 2,
        borderTop: `${px}px solid ${color}`,
        borderLeft: `${px}px solid ${color}`,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: px * 2, height: px * 2,
        borderBottom: `${px}px solid ${color}`,
        borderRight: `${px}px solid ${color}`,
      }} />
      <PixelSprite role={role} size={Math.max(2, Math.round(size / 10))} glow glowColor={color} />
    </div>
  );
}

export function RoleBadge({ role, size = 'sm' }: { role: string; size?: 'xs' | 'sm' | 'md' }) {
  const roleColors: Record<string, string> = {
    research: '#4df0d8', strategy: '#9b6dff', builder: '#4d7fff',
    design: '#ff4d9b', growth: '#4dff9b', analytics: '#ff4d6d', content: '#ffb84d',
  };
  const color = roleColors[role?.toLowerCase()] ?? '#4d7fff';
  const fontSize = size === 'xs' ? 7 : size === 'sm' ? 8 : 10;
  const padding = size === 'xs' ? '1px 5px' : size === 'sm' ? '2px 7px' : '3px 10px';

  return (
    <span style={{
      fontFamily: "'Space Mono', monospace",
      fontSize,
      padding,
      background: `${color}20`,
      border: `1px solid ${color}60`,
      color,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
      display: 'inline-block',
      flexShrink: 0,
    }}>
      {role}
    </span>
  );
}

export function LevelBadge({ level }: { level: number }) {
  return (
    <span style={{
      fontFamily: "'Press Start 2P', monospace",
      fontSize: 7,
      padding: '2px 5px',
      background: 'rgba(0,0,0,0.5)',
      border: '1px solid #2a2f47',
      color: '#ffd700',
      letterSpacing: '0.04em',
      display: 'inline-block',
      flexShrink: 0,
    }}>
      LV.{level}
    </span>
  );
}
