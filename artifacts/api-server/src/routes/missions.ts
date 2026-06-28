import { Router } from "express";
import { db, missionsTable, agentsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const VALID_COLUMNS = ["backlog", "in_progress", "in_review", "done"] as const;
const VALID_PRIORITIES = ["low", "medium", "high", "critical"] as const;

const updateMissionBody = z.object({
  current: z.number().optional(),
  status: z.enum(["active", "completed", "locked"]).optional(),
  columnStatus: z.string().optional(),
  assigneeId: z.number().nullable().optional(),
  priority: z.string().optional(),
  labels: z.array(z.string()).optional(),
  branchName: z.string().nullable().optional(),
  progress: z.number().min(0).max(100).optional(),
});

const moveBody = z.object({
  column: z.enum(VALID_COLUMNS),
});

const assignBody = z.object({
  agentId: z.number().nullable(),
});

const commentBody = z.object({
  text: z.string().min(1).max(2000),
  author: z.string().default("Commander"),
});

const checklistBody = z.object({
  items: z.array(z.object({
    id: z.string(),
    text: z.string(),
    done: z.boolean(),
  })),
});

router.get("/", async (req, res) => {
  const column = req.query.column as string | undefined;
  let query = db.select().from(missionsTable).orderBy(missionsTable.sortOrder);
  const missions = await query;
  const filtered = column ? missions.filter(m => m.columnStatus === column) : missions;

  const agentIds = [...new Set(filtered.map(m => m.assigneeId).filter(Boolean))] as number[];
  const agents = agentIds.length
    ? await db.select({ id: agentsTable.id, name: agentsTable.name, role: agentsTable.role })
        .from(agentsTable)
        .where(sql`${agentsTable.id} = ANY(${agentIds})`)
    : [];
  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]));

  return res.json(filtered.map(m => ({
    ...m,
    assignee: m.assigneeId ? agentMap[m.assigneeId] ?? null : null,
  })));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [mission] = await db.select().from(missionsTable).where(eq(missionsTable.id, id));
  if (!mission) return res.status(404).json({ error: "Not found" });
  return res.json(mission);
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = updateMissionBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const [mission] = await db.update(missionsTable).set(parsed.data as Record<string, unknown>).where(eq(missionsTable.id, id)).returning();
  if (!mission) return res.status(404).json({ error: "Not found" });
  return res.json(mission);
});

router.patch("/:id/move", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = moveBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid column" });

  const updates: Record<string, unknown> = { columnStatus: parsed.data.column };
  if (parsed.data.column === "done") {
    updates.status = "completed";
    updates.progress = 100;
  } else if (parsed.data.column === "in_progress") {
    updates.status = "active";
  } else if (parsed.data.column === "backlog") {
    updates.status = "active";
  }

  const [mission] = await db.update(missionsTable).set(updates).where(eq(missionsTable.id, id)).returning();
  if (!mission) return res.status(404).json({ error: "Not found" });
  return res.json(mission);
});

router.patch("/:id/assign", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = assignBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const [mission] = await db.update(missionsTable)
    .set({ assigneeId: parsed.data.agentId })
    .where(eq(missionsTable.id, id))
    .returning();
  if (!mission) return res.status(404).json({ error: "Not found" });
  return res.json(mission);
});

router.post("/:id/comment", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = commentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const [mission] = await db.update(missionsTable)
    .set({ commentsCount: sql`${missionsTable.commentsCount} + 1` })
    .where(eq(missionsTable.id, id))
    .returning();
  if (!mission) return res.status(404).json({ error: "Not found" });
  return res.json({ success: true, commentsCount: mission.commentsCount });
});

router.patch("/:id/checklist", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = checklistBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const total = parsed.data.items.length;
  const done = parsed.data.items.filter(i => i.done).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const [mission] = await db.update(missionsTable)
    .set({ checklist: parsed.data.items, progress })
    .where(eq(missionsTable.id, id))
    .returning();
  if (!mission) return res.status(404).json({ error: "Not found" });
  return res.json(mission);
});

export default router;
