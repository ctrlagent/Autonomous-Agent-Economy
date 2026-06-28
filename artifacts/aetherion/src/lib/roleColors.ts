export const ROLE_HEX: Record<string, string> = {
  research:  "#4df0d8",
  strategy:  "#9b6dff",
  builder:   "#4d7fff",
  content:   "#ffb84d",
  growth:    "#4dff9b",
  analytics: "#ff4d6d",
  design:    "#c084fc",
};

export const ROLE_LABEL: Record<string, string> = {
  research:  "⬡ RESEARCH",
  strategy:  "◈ STRATEGY",
  builder:   "⬢ BUILDER",
  content:   "◉ CONTENT",
  growth:    "⬟ GROWTH",
  analytics: "⬠ ANALYTICS",
  design:    "◆ DESIGN",
};

export function getRoleColor(role: string): string {
  return ROLE_HEX[role?.toLowerCase()] ?? "#4d7fff";
}
