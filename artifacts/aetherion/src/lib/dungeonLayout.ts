export interface RoomDef {
  id: string;
  name: string;
  role: string;
  color: number;
  tileX: number;
  tileY: number;
  tileW: number;
  tileH: number;
}

export interface CorridorDef {
  tileX: number;
  tileY: number;
  tileW: number;
  tileH: number;
}

export const DUNGEON_COLS = 30;
export const DUNGEON_ROWS = 22;

export const DUNGEON_ROOMS: RoomDef[] = [
  { id: 'r1', name: 'Research Lab',   role: 'research',  color: 0x4df0d8, tileX: 1,  tileY: 1,  tileW: 8, tileH: 6 },
  { id: 'r2', name: 'Dev Lab',        role: 'builder',   color: 0x4d7fff, tileX: 11, tileY: 1,  tileW: 8, tileH: 6 },
  { id: 'r3', name: 'Design Studio',  role: 'design',    color: 0x9b6dff, tileX: 21, tileY: 1,  tileW: 8, tileH: 6 },
  { id: 'r4', name: 'Marketing Hub',  role: 'growth',    color: 0x4dff9b, tileX: 1,  tileY: 15, tileW: 8, tileH: 6 },
  { id: 'r5', name: 'Ops Center',     role: 'strategy',  color: 0xc0a020, tileX: 11, tileY: 15, tileW: 8, tileH: 6 },
  { id: 'r6', name: 'Analytics',      role: 'analytics', color: 0xff4d6d, tileX: 21, tileY: 15, tileW: 8, tileH: 6 },
];

export const DUNGEON_CORRIDORS: CorridorDef[] = [
  { tileX: 9,  tileY: 3,  tileW: 2, tileH: 2 },
  { tileX: 19, tileY: 3,  tileW: 2, tileH: 2 },
  { tileX: 9,  tileY: 17, tileW: 2, tileH: 2 },
  { tileX: 19, tileY: 17, tileW: 2, tileH: 2 },
  { tileX: 3,  tileY: 7,  tileW: 2, tileH: 8 },
  { tileX: 13, tileY: 7,  tileW: 2, tileH: 8 },
  { tileX: 23, tileY: 7,  tileW: 2, tileH: 8 },
];

export const ROLE_COLORS: Record<string, number> = {
  research:  0x4df0d8,
  builder:   0x4d7fff,
  design:    0x9b6dff,
  growth:    0x4dff9b,
  strategy:  0xc0a020,
  analytics: 0xff4d6d,
  content:   0xffb84d,
};
