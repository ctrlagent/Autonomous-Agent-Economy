import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const INVALIDATION_MAP: Record<string, string[][]> = {
  task_update: [
    ["/api/agents"],
    ["/api/dashboard/summary"],
    ["/api/dashboard/activity"],
    ["/api/dashboard/agent-performance"],
  ],
  task_complete: [
    ["/api/agents"],
    ["/api/dashboard/summary"],
    ["/api/dashboard/activity"],
    ["/api/dashboard/agent-performance"],
    ["/api/missions"],
  ],
  agent_level_up: [
    ["/api/agents"],
    ["/api/dashboard/summary"],
    ["/api/dashboard/activity"],
  ],
  activity_new: [
    ["/api/dashboard/activity"],
  ],
};

export function useRealtimeEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const url = "/api/events";
    let es: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let active = true;

    function connect() {
      if (!active) return;
      es = new EventSource(url);

      es.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data) as { type: string };
          const keys = INVALIDATION_MAP[msg.type];
          if (keys) {
            for (const key of keys) {
              queryClient.invalidateQueries({ queryKey: key });
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        es?.close();
        es = null;
        if (active) {
          retryTimeout = setTimeout(connect, 5000);
        }
      };
    }

    connect();

    return () => {
      active = false;
      if (retryTimeout) clearTimeout(retryTimeout);
      es?.close();
    };
  }, [queryClient]);
}
