export interface AgentEventPayload {
  type: string;
  ts: number;
  data?: {
    agentId?: number;
    agentName?: string;
    agentRole?: string;
    level?: number;
    taskId?: number;
    taskTitle?: string;
    stationId?: number;
    outputId?: number | null;
    reward?: { xp: number; revenue: number };
    durationMs?: number;
    progress?: number;
    missionId?: number;
    missionTitle?: string;
    nextMissionTitle?: string;
  };
}

type Listener = (event: AgentEventPayload) => void;

const listeners = new Set<Listener>();

export function subscribeAgentEvents(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function dispatchAgentEvent(event: AgentEventPayload): void {
  for (const fn of listeners) {
    try { fn(event); } catch { /* ignore */ }
  }
}
