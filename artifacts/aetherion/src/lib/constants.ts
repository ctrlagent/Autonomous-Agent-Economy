import { FlaskConical, Code2, Palette, Megaphone, Settings, BarChart2 } from "lucide-react";

// ─── $CTRL Token & Tier System ───────────────────────────────────────────────
export const CTRL_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000' as const;
export const CTRL_TOKEN_DECIMALS = 18;

export const TIER_THRESHOLDS = {
  commander:    100_000,
  admiral:      500_000,
  fleetAdmiral: 1_000_000,
} as const;

export const TIER_NAMES: Record<0 | 1 | 2 | 3, string> = {
  0: 'Recruit',
  1: 'Commander',
  2: 'Admiral',
  3: 'Fleet Admiral',
};

export const TIER_COLORS: Record<0 | 1 | 2 | 3, string> = {
  0: '#6b7280',
  1: '#4d7fff',
  2: '#9b6dff',
  3: '#ffd700',
};

export const TIER_FEATURES: Record<0 | 1 | 2 | 3, string[]> = {
  0: ['1 station', '3 agents', 'basic features'],
  1: ['3 stations', '10 agents', 'Airlock', 'Bounties'],
  2: ['10 stations', '30 agents', 'all features', 'priority support'],
  3: ['unlimited', 'unlimited agents', 'beta access', 'governance vote'],
};

export const UPGRADE_URL = 'https://app.uniswap.org/#/swap?outputCurrency=' + CTRL_TOKEN_ADDRESS;

export const ROLE_COLORS: Record<string, string> = {
  research: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  strategy: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  builder: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  content: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  growth: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  analytics: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

export const AGENT_STATUS_COLORS: Record<string, string> = {
  idle: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  working: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.2)] agent-pulse",
  paused: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  offline: "text-red-400 bg-red-400/10 border-red-400/20",
};

export const STATION_STATUS_COLORS: Record<string, string> = {
  idle: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  running: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  paused: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  completed: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  pending: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  in_progress: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  failed: "text-red-400 bg-red-400/10 border-red-400/20",
};

export const TASK_PRIORITY_COLORS: Record<string, string> = {
  low: "text-gray-400",
  medium: "text-blue-400",
  high: "text-amber-400",
  critical: "text-red-400",
};

export const ROOM_ICONS: Record<string, React.ElementType> = {
  research: FlaskConical,
  development: Code2,
  design: Palette,
  marketing: Megaphone,
  operations: Settings,
  analytics: BarChart2,
};
