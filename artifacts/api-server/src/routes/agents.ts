import { Router } from "express";
import { db, agentsTable, tasksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const updateAgentBody = z.object({
  status: z.enum(["idle", "working", "paused", "offline"]).optional(),
  roomId: z.number().optional(),
  level: z.number().int().min(1).optional(),
  experience: z.number().int().min(0).optional(),
  currentTask: z.string().nullable().optional(),
});

const createTaskBody = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(["low", "medium", "high", "critical"]),
});

const updateTaskBody = z.object({
  status: z.enum(["pending", "in_progress", "completed", "failed"]).optional(),
  progress: z.number().optional(),
});

router.get("/", async (req, res) => {
  const agents = await db.select().from(agentsTable);
  return res.json(agents);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, id));
  if (!agent) return res.status(404).json({ error: "Not found" });
  return res.json(agent);
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = updateAgentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const [agent] = await db.update(agentsTable).set(parsed.data).where(eq(agentsTable.id, id)).returning();
  if (!agent) return res.status(404).json({ error: "Not found" });
  return res.json(agent);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(tasksTable).where(eq(tasksTable.agentId, id));
  await db.delete(agentsTable).where(eq(agentsTable.id, id));
  return res.status(204).send();
});

router.get("/:id/tasks", async (req, res) => {
  const id = parseInt(req.params.id);
  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.agentId, id));
  return res.json(tasks);
});

router.post("/:id/tasks", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = createTaskBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const [task] = await db.insert(tasksTable).values({
    agentId: id,
    title: parsed.data.title,
    description: parsed.data.description,
    priority: parsed.data.priority,
    status: "pending",
    progress: 0,
  }).returning();
  return res.status(201).json(task);
});

export default router;
