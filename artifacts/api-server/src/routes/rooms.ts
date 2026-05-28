import { Router } from "express";
import { db, roomsTable, agentsTable, tasksTable, activityTable, agentOutputsTable } from "@workspace/db";
import { eq, and, inArray, desc } from "drizzle-orm";

const router = Router();

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, id));
  if (!room) return res.status(404).json({ error: "Not found" });
  return res.json(room);
});

router.get("/:id/agents", async (req, res) => {
  const id = parseInt(req.params.id);
  const agents = await db.select().from(agentsTable).where(eq(agentsTable.roomId, id));
  return res.json(agents);
});

router.get("/:id/tasks", async (req, res) => {
  const id = parseInt(req.params.id);
  const agents = await db.select({ id: agentsTable.id }).from(agentsTable).where(eq(agentsTable.roomId, id));
  if (!agents.length) return res.json([]);
  const agentIds = agents.map(a => a.id);
  const tasks = await db.select().from(tasksTable).where(
    and(inArray(tasksTable.agentId, agentIds), eq(tasksTable.status, "in_progress"))
  );
  return res.json(tasks);
});

router.get("/:id/activity", async (req, res) => {
  const id = parseInt(req.params.id);
  const agents = await db.select({ name: agentsTable.name }).from(agentsTable).where(eq(agentsTable.roomId, id));
  if (!agents.length) return res.json([]);
  const agentNames = agents.map(a => a.name);
  const activities = await db.select().from(activityTable)
    .where(inArray(activityTable.agentName, agentNames))
    .orderBy(desc(activityTable.timestamp))
    .limit(40);
  return res.json(activities);
});

router.get("/:id/outputs", async (req, res) => {
  const id = parseInt(req.params.id);
  const limit = Math.min(parseInt(String(req.query.limit ?? "30")), 60);
  const agents = await db.select({ id: agentsTable.id, name: agentsTable.name, role: agentsTable.role }).from(agentsTable).where(eq(agentsTable.roomId, id));
  if (!agents.length) return res.json([]);
  const agentIds = agents.map(a => a.id);
  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]));
  const outputs = await db.select().from(agentOutputsTable)
    .where(inArray(agentOutputsTable.agentId, agentIds))
    .orderBy(desc(agentOutputsTable.createdAt))
    .limit(limit);
  const withMeta = outputs.map(o => ({
    ...o,
    agentName: agentMap[o.agentId]?.name ?? "Unknown",
    agentRole: agentMap[o.agentId]?.role ?? "unknown",
  }));
  return res.json(withMeta);
});

export default router;
