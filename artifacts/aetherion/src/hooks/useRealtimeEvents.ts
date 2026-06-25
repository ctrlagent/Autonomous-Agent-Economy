import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { dispatchAgentEvent, type AgentEventPayload } from "@/lib/agentEventEmitter";

const INVALIDATION_MAP: Record<string, string[][]> = {
  task_update: [
    ["/api/agents"],
    ["/api/dashboard/summary"],
    ["/api/dashboard/activity"],
    ["/api/dashboard/agent-performance"],
    ["/api/rooms"],
  ],
  task_complete: [
    ["/api/agents"],
    ["/api/dashboard/summary"],
    ["/api/dashboard/activity"],
    ["/api/dashboard/agent-performance"],
    ["/api/dashboard/revenue"],
    ["/api/missions"],
    ["/api/stations"],
    ["/api/rooms"],
  ],
  agent_level_up: [
    ["/api/agents"],
    ["/api/dashboard/summary"],
    ["/api/dashboard/activity"],
    ["/api/rooms"],
  ],
  activity_new: [
    ["/api/dashboard/activity"],
    ["/api/rooms"],
  ],
  mission_complete: [
    ["/api/missions"],
  ],
  airlock_approved: [
    ["/api/agents"],
    ["/api/dashboard/revenue"],
    ["/api/airlock"],
    ["/api/dashboard/activity"],
  ],
  airlock_rejected: [
    ["/api/airlock"],
    ["/api/dashboard/activity"],
  ],
};

export function useRealtimeEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/api/ws`;

    let ws: WebSocket | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let active = true;
    let retryDelay = 1000;

    function connect() {
      if (!active) return;

      ws = new WebSocket(url);

      ws.onopen = () => {
        retryDelay = 1000;
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data) as AgentEventPayload;
          if (msg.type === "connected") return;

          if (msg.type === "agent_level_up" && msg.data) {
            toast({
              title: "⬆ LEVEL UP",
              description: `${msg.data.agentName} reached level ${msg.data.level}`,
              duration: 3500,
            });
          }

          const keys = INVALIDATION_MAP[msg.type];
          if (keys) {
            for (const key of keys) {
              queryClient.invalidateQueries({ queryKey: key });
            }
          }

          dispatchAgentEvent(msg);
        } catch {
          // ignore parse errors
        }
      };

      ws.onerror = () => { /* handled by onclose */ };

      ws.onclose = () => {
        ws = null;
        if (active) {
          retryTimeout = setTimeout(connect, retryDelay);
          retryDelay = Math.min(retryDelay * 2, 30000);
        }
      };
    }

    connect();

    return () => {
      active = false;
      if (retryTimeout) clearTimeout(retryTimeout);
      ws?.close();
    };
  // queryClient is stable — including it satisfies the linter without causing re-runs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
