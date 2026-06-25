import { Router } from "express";
import { z } from "zod";
import { db, airlockTable, agentsTable, stationsTable, activityTable, tasksTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { emit } from "../lib/eventBus";
import { logger } from "../lib/logger";
import { mergeAgentPR } from "../lib/githubAgent";

const router = Router();

const BONUS_XP_PER_LEVEL = 100;

async function applyApprovalReward(entry: typeof airlockTable.$inferSelect) {
  const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, entry.agentId));
  if (!agent) return;

  const newXp      = agent.experience + entry.bonusXp;
  const levelsGained = Math.floor(newXp / BONUS_XP_PER_LEVEL) - Math.floor(agent.experience / BONUS_XP_PER_LEVEL);
  const newLevel   = agent.level + levelsGained;
  const remaining  = newXp % BONUS_XP_PER_LEVEL;

  await db.update(agentsTable).set({
    experience: remaining,
    level:      newLevel,
  }).where(eq(agentsTable.id, entry.agentId));

  if (entry.bonusRevenue > 0) {
    await db.update(stationsTable).set({
      revenue: sql`${stationsTable.revenue} + ${entry.bonusRevenue}`,
    }).where(eq(stationsTable.id, entry.stationId));
  }

  const [station] = await db.select({ name: stationsTable.name }).from(stationsTable).where(eq(stationsTable.id, entry.stationId));

  await db.insert(activityTable).values({
    agentName:   entry.agentName,
    agentRole:   entry.agentRole,
    stationName: station?.name ?? "Unknown",
    action:      "AIRLOCK APPROVED",
    details:     `${entry.agentName} output approved — "${entry.taskTitle}" +${entry.bonusXp}XP`,
  });

  emit({
    type: "task_complete",
    data: {
      agentId:   entry.agentId,
      agentName: entry.agentName,
      agentRole: entry.agentRole,
      level:     newLevel,
      taskId:    entry.taskId,
      taskTitle: entry.taskTitle,
      stationId: entry.stationId,
      outputId:  entry.outputId ?? null,
      reward:    { xp: entry.bonusXp, revenue: entry.bonusRevenue },
      durationMs: 0,
    },
    ts: Date.now(),
  });
}

router.get("/", async (req, res) => {
  try {
    const status = (req.query.status as string) ?? "pending";
    const valid = ["pending", "approved", "rejected", "changes_requested", "all"] as const;
    if (!valid.includes(status as (typeof valid)[number])) {
      return res.status(400).json({ error: "Invalid status filter" });
    }

    const baseRows = status === "all"
      ? await db.select().from(airlockTable).orderBy(sql`${airlockTable.createdAt} desc`).limit(100)
      : await db.select().from(airlockTable)
          .where(eq(airlockTable.status, status as "pending" | "approved" | "rejected" | "changes_requested"))
          .orderBy(sql`${airlockTable.createdAt} desc`)
          .limit(100);

    // Enrich with PR info from tasks table
    const taskIds = [...new Set(baseRows.map(r => r.taskId))];
    let taskPrMap: Record<number, { prUrl: string | null; branchName: string | null; reviewStatus: string }> = {};
    if (taskIds.length > 0) {
      const taskRows = await db
        .select({ id: tasksTable.id, prUrl: tasksTable.prUrl, branchName: tasksTable.branchName, reviewStatus: tasksTable.reviewStatus })
        .from(tasksTable)
        .where(sql`${tasksTable.id} = ANY(ARRAY[${sql.join(taskIds.map(id => sql`${id}`), sql`, `)}])`);
      taskPrMap = Object.fromEntries(taskRows.map(t => [t.id, { prUrl: t.prUrl, branchName: t.branchName, reviewStatus: t.reviewStatus }]));
    }

    const enriched = baseRows.map(row => ({
      ...row,
      prUrl: taskPrMap[row.taskId]?.prUrl ?? null,
      branchName: taskPrMap[row.taskId]?.branchName ?? null,
      taskReviewStatus: taskPrMap[row.taskId]?.reviewStatus ?? "none",
    }));

    return res.json(enriched);
  } catch (err) {
    logger.error({ err }, "airlock GET / error");
    return res.status(500).json({ error: (err as Error).message });
  }
});

router.get("/stats", async (_req, res) => {
  try {
    const rows = await db
      .select({ status: airlockTable.status, count: sql<number>`count(*)::int` })
      .from(airlockTable)
      .groupBy(airlockTable.status);
    const stats: Record<string, number> = { pending: 0, approved: 0, rejected: 0, changes_requested: 0 };
    for (const r of rows) stats[r.status] = r.count;
    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  try {
    const [entry] = await db.select().from(airlockTable).where(eq(airlockTable.id, id));
    if (!entry) return res.status(404).json({ error: "Not found" });
    return res.json(entry);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

const reviewBody = z.object({ notes: z.string().optional() });

router.post("/:id/approve", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const parsed = reviewBody.safeParse(req.body);
  const notes = parsed.success ? parsed.data.notes : undefined;
  try {
    const [entry] = await db.select().from(airlockTable).where(eq(airlockTable.id, id));
    if (!entry) return res.status(404).json({ error: "Not found" });
    if (entry.status !== "pending" && entry.status !== "changes_requested") {
      return res.status(400).json({ error: "Entry is not pending review" });
    }
    const [updated] = await db.update(airlockTable).set({
      status:       "approved",
      reviewerNotes: notes ?? null,
      reviewedAt:   new Date(),
    }).where(eq(airlockTable.id, id)).returning();
    await applyApprovalReward(updated);

    // Auto-merge PR if builder agent has one
    if (entry.agentRole === "builder") {
      mergeAgentPR(entry.taskId).catch(e => {
        logger.warn({ err: e, taskId: entry.taskId }, "PR merge on approval failed");
      });
      await db.update(tasksTable).set({ reviewStatus: "merged" }).where(eq(tasksTable.id, entry.taskId)).catch(() => {});
    }

    return res.json(updated);
  } catch (err) {
    logger.error({ err }, "airlock approve error");
    return res.status(500).json({ error: (err as Error).message });
  }
});

router.post("/:id/reject", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const parsed = reviewBody.safeParse(req.body);
  const notes = parsed.success ? parsed.data.notes : undefined;
  try {
    const [entry] = await db.select().from(airlockTable).where(eq(airlockTable.id, id));
    if (!entry) return res.status(404).json({ error: "Not found" });
    const [updated] = await db.update(airlockTable).set({
      status:       "rejected",
      reviewerNotes: notes ?? null,
      reviewedAt:   new Date(),
    }).where(eq(airlockTable.id, id)).returning();

    const [station] = await db.select({ name: stationsTable.name }).from(stationsTable).where(eq(stationsTable.id, entry.stationId));
    await db.insert(activityTable).values({
      agentName:   entry.agentName,
      agentRole:   entry.agentRole,
      stationName: station?.name ?? "Unknown",
      action:      "AIRLOCK REJECTED",
      details:     `${entry.agentName} output rejected — "${entry.taskTitle}"${notes ? `: ${notes}` : ""}`,
    });

    emit({
      type: "airlock_rejected",
      data: {
        agentId:   entry.agentId,
        agentName: entry.agentName,
        agentRole: entry.agentRole,
        taskTitle: entry.taskTitle,
        stationId: entry.stationId,
      },
      ts: Date.now(),
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

router.post("/:id/changes", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const parsed = reviewBody.safeParse(req.body);
  const notes = parsed.success ? parsed.data.notes : undefined;
  try {
    const [entry] = await db.select().from(airlockTable).where(eq(airlockTable.id, id));
    if (!entry) return res.status(404).json({ error: "Not found" });
    const [updated] = await db.update(airlockTable).set({
      status:       "changes_requested",
      reviewerNotes: notes ?? null,
      reviewedAt:   new Date(),
    }).where(eq(airlockTable.id, id)).returning();

    const [station] = await db.select({ name: stationsTable.name }).from(stationsTable).where(eq(stationsTable.id, entry.stationId));
    await db.insert(activityTable).values({
      agentName:   entry.agentName,
      agentRole:   entry.agentRole,
      stationName: station?.name ?? "Unknown",
      action:      "CHANGES REQUESTED",
      details:     `${entry.agentName} — changes requested on "${entry.taskTitle}"${notes ? `: ${notes}` : ""}`,
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
