import { useEffect, useRef, useState } from "react";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { subscribeAgentEvents } from "@/lib/agentEventEmitter";
import { Activity } from "lucide-react";

const mono = { fontFamily: "'Space Mono', monospace" };

interface RevenueData {
  totalUsdc: number;
  txCount: number;
  hourlyUsdc: number;
}

interface TelemetryOverlayProps {
  visible?: boolean;
}

export function TelemetryOverlay({ visible = true }: TelemetryOverlayProps) {
  const { data: summary } = useGetDashboardSummary();
  const { data: revenue } = useQuery<RevenueData>({
    queryKey: ["/api/dashboard/revenue"],
    queryFn: () => fetch("/api/dashboard/revenue").then(r => r.json()),
    staleTime: 15000,
    refetchInterval: 30000,
  });

  const [sessionTasks, setSessionTasks] = useState(0);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [recentEvents, setRecentEvents] = useState<Array<{ label: string; color: string; ts: number }>>([]);
  const tokenWindowRef = useRef<Array<{ tokens: number; ts: number }>>([]);
  const [tokensPerMin, setTokensPerMin] = useState(0);

  useEffect(() => {
    const unsub = subscribeAgentEvents((ev) => {
      if (ev.type === "task_complete") {
        setSessionTasks(n => n + 1);
        const tokens = (ev.data as { reward?: { xp?: number } } | undefined)?.reward?.xp ?? 0;
        setSessionTokens(n => n + tokens);
        tokenWindowRef.current.push({ tokens, ts: Date.now() });
        setRecentEvents(prev => [
          { label: `TASK · ${(ev.data as { agentRole?: string } | undefined)?.agentRole?.toUpperCase() ?? "AGENT"}`, color: "#4dff9b", ts: Date.now() },
          ...prev.slice(0, 3),
        ]);
      }
      if (ev.type === "agent_level_up") {
        setRecentEvents(prev => [
          { label: `LVL UP · ${(ev.data as { agentName?: string } | undefined)?.agentName ?? "AGENT"}`, color: "#ffd700", ts: Date.now() },
          ...prev.slice(0, 3),
        ]);
      }
      if (ev.type === "airlock_rejected") {
        setRecentEvents(prev => [
          { label: `REJECTED · ${(ev.data as { agentName?: string } | undefined)?.agentName ?? "AGENT"}`, color: "#ff4d6d", ts: Date.now() },
          ...prev.slice(0, 3),
        ]);
      }
      if (ev.type === "airlock_approved") {
        setRecentEvents(prev => [
          { label: `APPROVED · ${(ev.data as { agentName?: string } | undefined)?.agentName ?? "AGENT"}`, color: "#5b8fff", ts: Date.now() },
          ...prev.slice(0, 3),
        ]);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const cutoff = Date.now() - 60_000;
      tokenWindowRef.current = tokenWindowRef.current.filter(e => e.ts > cutoff);
      const sum = tokenWindowRef.current.reduce((a, e) => a + e.tokens, 0);
      setTokensPerMin(sum);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  if (!visible) return null;

  const activeAgents = summary?.activeAgents ?? 0;
  const totalAgents  = summary?.totalAgents ?? 0;

  return (
    <div style={{
      position: "absolute",
      bottom: 10,
      left: 10,
      zIndex: 20,
      background: "rgba(6, 8, 16, 0.88)",
      border: "1px solid rgba(91,143,255,0.25)",
      backdropFilter: "blur(4px)",
      width: 186,
      pointerEvents: "none",
    }}>
      <div style={{
        borderBottom: "1px solid rgba(91,143,255,0.2)",
        padding: "4px 8px",
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}>
        <Activity size={9} color="#5b8fff" />
        <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: "#5b8fff", letterSpacing: "0.08em" }}>
          TELEMETRY
        </span>
        <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "#4dff9b", boxShadow: "0 0 5px #4dff9b", animation: "pulse-dot 2s ease-in-out infinite" }} />
      </div>

      <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 5 }}>
        {[
          { label: "CREW ONLINE",     value: `${activeAgents}/${totalAgents}`, color: "#4dff9b" },
          { label: "SESSION TASKS",   value: String(sessionTasks),             color: "#5b8fff" },
          { label: "USDC DIST.",      value: `$${(revenue?.totalUsdc ?? 0).toLocaleString()}`, color: "#4dff9b" },
          { label: "USDC/HR",        value: `$${(revenue?.hourlyUsdc ?? 0).toLocaleString()}`, color: "#ffb84d" },
          { label: "XP/MIN",         value: String(tokensPerMin),              color: "#9b6dff" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...mono, fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>{label}</span>
            <span style={{ ...mono, fontSize: 9, fontWeight: 700, color }}>{value}</span>
          </div>
        ))}

        {recentEvents.length > 0 && (
          <div style={{ marginTop: 3, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            {recentEvents.map((ev, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: ev.color, flexShrink: 0 }} />
                <span style={{ ...mono, fontSize: 6, color: ev.color, letterSpacing: "0.04em" }}>{ev.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
