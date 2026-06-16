import { Router } from "express";
import { db, agentsTable, tasksTable, agentOutputsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { getWalletInfo, getWalletBalance, getWalletTransactions, ensureAgentWallet } from "../lib/agentWallet";

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
  const limit = Math.min(parseInt(String(req.query.limit ?? "30")), 100);
  const tasks = await db.select().from(tasksTable)
    .where(eq(tasksTable.agentId, id))
    .orderBy(desc(tasksTable.createdAt))
    .limit(limit);
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

router.get("/:id/outputs", async (req, res) => {
  const id = parseInt(req.params.id);
  const limit = Math.min(parseInt(String(req.query.limit ?? "20")), 50);
  const outputs = await db.select().from(agentOutputsTable)
    .where(eq(agentOutputsTable.agentId, id))
    .orderBy(desc(agentOutputsTable.createdAt))
    .limit(limit);
  return res.json(outputs);
});

router.get("/:id/wallet", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const info = await getWalletInfo(id);
  if (!info) return res.status(404).json({ error: "Agent not found" });
  return res.json(info);
});

router.get("/:id/wallet/balance", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const [agent] = await db.select({ walletAddress: agentsTable.walletAddress, name: agentsTable.name })
    .from(agentsTable).where(eq(agentsTable.id, id));
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  if (!agent.walletAddress) {
    const address = await ensureAgentWallet(id, agent.name);
    const balance = await getWalletBalance(address);
    return res.json(balance);
  }
  const balance = await getWalletBalance(agent.walletAddress);
  return res.json(balance);
});

router.get("/:id/wallet/transactions", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const limit = Math.min(parseInt(String(req.query.limit ?? "20")), 50);
  const txs = await getWalletTransactions(id, limit);
  return res.json(txs);
});

export default router;
