import { Router } from "express";
import { db, stationsTable, agentsTable, tasksTable, templatesTable, activityTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";

const router = Router();

router.get("/summary", async (req, res) => {
  const stations = await db.select().from(stationsTable);
  const agents = await db.select().from(agentsTable);
  const templates = await db.select().from(templatesTable);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const allTasks = await db.select().from(tasksTable);
  const tasksCompletedToday = allTasks.filter(
    t => t.status === "completed" && t.completedAt && t.completedAt >= today
  ).length;

  const activeStations = stations.filter(s => s.status === "running").length;
  const activeAgents = agents.filter(a => a.status === "working").length;
  const overallProgress = stations.length > 0
    ? stations.reduce((acc, s) => acc + s.progress, 0) / stations.length
    : 0;

  return res.json({
    totalStations: stations.length,
    activeStations,
    totalAgents: agents.length,
    activeAgents,
    tasksCompletedToday,
    totalTemplates: templates.length,
    overallProgress,
  });
});

router.get("/activity", async (req, res) => {
  const limit = parseInt(String(req.query.limit ?? "20"));
  const activities = await db
    .select()
    .from(activityTable)
    .orderBy(sql`${activityTable.timestamp} DESC`)
    .limit(limit);
  return res.json(activities);
});

router.get("/agent-performance", async (req, res) => {
  const agents = await db.select().from(agentsTable);
  const tasks = await db.select().from(tasksTable);

  const roles = ["research", "strategy", "builder", "content", "growth", "analytics"] as const;

  const performance = roles.map(role => {
    const roleAgents = agents.filter(a => a.role === role);
    const roleAgentIds = roleAgents.map(a => a.id);
    const roleTasks = tasks.filter(t => roleAgentIds.includes(t.agentId));
    const completedTasks = roleTasks.filter(t => t.status === "completed");
    const avgProgress = roleTasks.length > 0
      ? roleTasks.reduce((acc, t) => acc + t.progress, 0) / roleTasks.length
      : 0;

    return {
      role,
      tasksCompleted: completedTasks.length,
      avgProgress,
      agentCount: roleAgents.length,
    };
  });

  return res.json(performance);
});

export default router;
