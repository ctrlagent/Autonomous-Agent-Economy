import { Router } from "express";
import { z } from "zod";
import { db, missionsTable, tasksTable, agentsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { parseWhiteboardToMission } from "../lib/llmWhiteboardParser";
import { emit } from "../lib/eventBus";
import { logger } from "../lib/logger";

const router = Router();

const parseBody = z.object({
  tldrawState: z.unknown(),
});

const createBody = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  target: z.number().positive(),
  unit: z.string().default("tasks"),
  rewardAmount: z.number().min(0).default(0),
  color: z.string().default("#4dff9b"),
  tasks: z.array(z.object({
    title: z.string().min(1),
    description: z.string(),
    agentRole: z.enum(["research", "strategy", "builder", "content", "growth", "analytics"]),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  })).min(1).max(10),
});

// POST /api/briefing/parse — parse tldraw state via LLM → return mission spec
router.post("/parse", async (req, res) => {
  const parsed = parseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  try {
    const spec = await parseWhiteboardToMission(parsed.data.tldrawState);
    res.json(spec);
  } catch (err) {
    logger.error({ err }, "Briefing parse error");
    res.status(500).json({ error: "Failed to parse whiteboard" });
  }
});

// POST /api/briefing/create — create mission + tasks from spec
router.post("/create", async (req, res) => {
  const parsed = createBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const { title, description, target, unit, rewardAmount, color, tasks } = parsed.data;

  try {
    const [mission] = await db.insert(missionsTable).values({
      title,
      description,
      iconName: "Radio",
      color,
      target,
      current: 0,
      unit,
      rewardXp: Math.floor(rewardAmount / 2),
      rewardToken: "USDC",
      rewardAmount,
      status: "active",
      sortOrder: Date.now(),
    }).returning();

    const createdTasks: typeof tasksTable.$inferSelect[] = [];
    const bountyPerTask = tasks.length > 0 ? Math.floor(rewardAmount / tasks.length) : 0;

    for (const task of tasks) {
      const agents = await db
        .select()
        .from(agentsTable)
        .where(eq(agentsTable.role, task.agentRole))
        .orderBy(sql`RANDOM()`)
        .limit(1);

      if (agents.length > 0) {
        const agent = agents[0]!;
        const [newTask] = await db.insert(tasksTable).values({
          agentId: agent.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: "pending",
          bountyAmount: bountyPerTask,
          bountyToken: "USDC",
        }).returning();
        if (newTask) createdTasks.push(newTask);
      }
    }

    emit({ type: "activity_new", data: { agentId: 0, action: "mission_created", detail: `Briefing Room: "${title}" deployed with ${createdTasks.length} task(s)` }, ts: Date.now() });
    logger.info({ missionId: mission!.id, taskCount: createdTasks.length }, "Briefing Room mission created");

    res.status(201).json({ mission, tasks: createdTasks });
  } catch (err) {
    logger.error({ err }, "Briefing create error");
    res.status(500).json({ error: "Failed to create mission" });
  }
});

export default router;
