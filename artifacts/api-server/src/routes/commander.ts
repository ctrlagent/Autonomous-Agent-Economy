import { Router } from "express";
import { db, commanderDirectivesTable, tasksTable, agentsTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";
import { setDirectiveCache } from "../taskEngine";

const router = Router();

const ALL_ROLES = ["research", "strategy", "builder", "content", "growth", "analytics", "design"];

router.get("/directives", async (_req, res) => {
  try {
    const rows = await db.select().from(commanderDirectivesTable);
    const map: Record<string, number> = {};
    for (const r of rows) map[r.role] = r.weight;
    const result = ALL_ROLES.map(role => ({ role, weight: map[role] ?? 50 }));
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

router.patch("/directives", async (req, res) => {
  try {
    const { directives } = req.body as { directives: Array<{ role: string; weight: number }> };
    if (!Array.isArray(directives)) return res.status(400).json({ error: "directives must be array" });

    for (const d of directives) {
      const weight = Math.max(0, Math.min(100, Math.round(d.weight)));
      const existing = await db.select().from(commanderDirectivesTable).where(eq(commanderDirectivesTable.role, d.role));
      if (existing.length > 0) {
        await db.update(commanderDirectivesTable)
          .set({ weight, updatedAt: new Date() })
          .where(eq(commanderDirectivesTable.role, d.role));
      } else {
        await db.insert(commanderDirectivesTable).values({ role: d.role, weight });
      }
    }

    const rows = await db.select().from(commanderDirectivesTable);
    const cache: Record<string, number> = {};
    for (const r of rows) cache[r.role] = r.weight;
    setDirectiveCache(cache);

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

router.get("/history", async (_req, res) => {
  try {
    // Last 7 days of task completions grouped by date
    const rows = await db
      .select({
        date:  sql<string>`DATE(${tasksTable.completedAt})::text`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(tasksTable)
      .where(sql`${tasksTable.status} = 'completed' AND ${tasksTable.completedAt} >= NOW() - INTERVAL '7 days'`)
      .groupBy(sql`DATE(${tasksTable.completedAt})`)
      .orderBy(sql`DATE(${tasksTable.completedAt})`);

    // Fill in missing days with 0
    const dayMap: Record<string, number> = {};
    for (const r of rows) if (r.date) dayMap[r.date] = r.count;

    const history: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      history.push({ date: key, count: dayMap[key] ?? 0 });
    }

    // Role breakdown — tasks completed per role (all time)
    const agents = await db.select({ id: agentsTable.id, role: agentsTable.role }).from(agentsTable);
    const tasks  = await db.select({ agentId: tasksTable.agentId }).from(tasksTable).where(eq(tasksTable.status, "completed"));

    const roleMap: Record<string, number> = {};
    for (const t of tasks) {
      const ag = agents.find(a => a.id === t.agentId);
      if (ag) roleMap[ag.role] = (roleMap[ag.role] ?? 0) + 1;
    }

    return res.json({ history, roleBreakdown: roleMap });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
