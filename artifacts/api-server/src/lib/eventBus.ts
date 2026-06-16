import { WebSocketServer, type WebSocket } from "ws";
import type { Server } from "http";
import type { IncomingMessage } from "http";
import type { Duplex } from "stream";
import type { Response } from "express";

// ─── Typed event union ───────────────────────────────────────────────────────

interface TaskEventData {
  agentId: number;
  agentName: string;
  agentRole: string;
  level: number;
  taskId: number;
  taskTitle: string;
  stationId: number;
  outputId: number | null;
  reward: { xp: number; revenue: number };
  durationMs: number;
}

export type AgentEvent =
  | { type: "connected"; ts: number }
  | { type: "task_update"; data: { agentId: number; progress?: number }; ts: number }
  | { type: "task_complete"; data: TaskEventData; ts: number }
  | { type: "agent_level_up"; data: TaskEventData; ts: number }
  | { type: "activity_new"; data: { agentId: number; action: string; detail: string }; ts: number }
  | { type: "mission_complete"; data: { missionId: number; missionTitle: string; nextMissionTitle?: string }; ts: number };

// ─── WebSocket server ────────────────────────────────────────────────────────

const wss = new WebSocketServer({ noServer: true });
const wsClients = new Set<WebSocket>();

export function initWsServer(server: Server): void {
  server.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    if (req.url === "/api/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", (ws: import("ws").WebSocket) => {
    wsClients.add(ws);
    try {
      ws.send(JSON.stringify({ type: "connected", ts: Date.now() } satisfies AgentEvent));
    } catch { /* ignore */ }
    ws.on("close", () => wsClients.delete(ws));
    ws.on("error", () => wsClients.delete(ws));
  });
}

// ─── SSE client registry ─────────────────────────────────────────────────────

const sseClients = new Set<Response>();

export function registerSseClient(res: Response): void {
  sseClients.add(res);
}

export function unregisterSseClient(res: Response): void {
  sseClients.delete(res);
}

// ─── Broadcast to all channels ───────────────────────────────────────────────

export function emit(event: AgentEvent): void {
  const payload = JSON.stringify(event);

  for (const ws of wsClients) {
    if (ws.readyState === ws.OPEN) {
      try { ws.send(payload); } catch { wsClients.delete(ws); }
    }
  }

  const ssePayload = `data: ${payload}\n\n`;
  for (const res of sseClients) {
    try { (res as Response).write(ssePayload); } catch { sseClients.delete(res); }
  }
}
