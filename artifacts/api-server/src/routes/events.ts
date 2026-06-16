import { Router, type Request, type Response } from "express";
import { registerSseClient, unregisterSseClient } from "../lib/eventBus";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: "connected", ts: Date.now() })}\n\n`);

  registerSseClient(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {
      clearInterval(heartbeat);
      unregisterSseClient(res);
    }
  }, 20000);

  req.on("close", () => {
    clearInterval(heartbeat);
    unregisterSseClient(res);
  });
});

export default router;
