import { db, agentsTable, tasksTable, activityTable, stationsTable, agentOutputsTable, missionsTable, airlockTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { emit } from "./lib/eventBus";
import { logger } from "./lib/logger";
import { generateOutput } from "./lib/outputGenerators";
import { executeAiTask } from "./lib/aiTaskExecutor";
import { createAgentPR } from "./lib/githubAgent";

const TICK_INTERVAL_MS = 8000;
const XP_PER_TASK = 30;
const XP_PER_LEVEL = 100;
const IDLE_START_CHANCE = 0.35;

const TASK_TEMPLATES: Record<string, string[]> = {
  research:  ["Analyzing market patterns", "Scanning competitor data", "Building research corpus", "Pattern recognition scan", "Data mining operation", "Literature synthesis run", "Trend forecasting model"],
  strategy:  ["Planning expansion phase", "Optimizing agent routing", "Strategic review cycle", "Revenue modeling", "Market positioning update", "Risk assessment sweep", "Competitive landscape scan"],
  builder:   ["Compiling core modules", "Deploying service layer", "Architecture refactor", "API integration sprint", "System optimization pass", "Infrastructure hardening", "Load testing pipeline"],
  content:   ["Drafting campaign copy", "Generating content batch", "Social media pipeline", "Content strategy review", "Brand narrative update", "Asset production run", "Editorial calendar sync"],
  growth:    ["Acquisition funnel tuning", "User engagement analysis", "Viral loop optimization", "Growth experiment run", "Channel performance audit", "Retention cohort study", "A/B test evaluation"],
  analytics: ["Processing telemetry data", "Running performance audit", "Anomaly detection sweep", "KPI dashboard update", "Forecasting model run", "Attribution analysis", "Conversion rate modeling"],
  design:    ["Design system audit", "Component library review", "Color token refresh", "Typography scale update", "UI pattern research", "Accessibility audit", "Design-to-dev handoff"],
};

const COMPLETE_VERBS: Record<string, string> = {
  research:  "completed research on",
  strategy:  "finalized strategy for",
  builder:   "deployed module for",
  content:   "published content for",
  growth:    "optimized funnel for",
  analytics: "delivered report on",
  design:    "shipped design spec for",
};

const REVENUE_PER_TASK_MIN = 45;
const REVENUE_PER_TASK_MAX = 135;

// ─── In-memory duration tracker ─────────────────────────────────────────────
const agentDurationMap = new Map<number, { totalMs: number; count: number }>();

export function getAvgTaskDuration(agentId: number): number {
  const entry = agentDurationMap.get(agentId);
  if (!entry || entry.count === 0) return 0;
  return Math.round(entry.totalMs / entry.count);
}

let tickCount = 0;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function taskTitle(role: string): string {
  return pickRandom(TASK_TEMPLATES[role] ?? TASK_TEMPLATES["research"]);
}

function revenueIncrement(): number {
  return Math.floor(Math.random() * (REVENUE_PER_TASK_MAX - REVENUE_PER_TASK_MIN + 1)) + REVENUE_PER_TASK_MIN;
}

/** Recalculate activeAgents for a station from actual agent statuses */
async function syncActiveAgents(stationId: number): Promise<void> {
  const stationAgents = await db.select({ status: agentsTable.status })
    .from(agentsTable)
    .where(eq(agentsTable.stationId, stationId));
  const realActive = stationAgents.filter(a => a.status === "working").length;
  await db.update(stationsTable)
    .set({ activeAgents: realActive })
    .where(eq(stationsTable.id, stationId));
}

/** Increment active missions by 1 and auto-complete any that hit their target */
async function updateMissionProgress(): Promise<void> {
  try {
    await db.update(missionsTable)
      .set({ current: sql`${missionsTable.current} + 1` })
      .where(eq(missionsTable.status, "active"));

    // Fetch missions that just reached or exceeded target
    const justCompleted = await db
      .select({ id: missionsTable.id, sortOrder: missionsTable.sortOrder })
      .from(missionsTable)
      .where(and(
        eq(missionsTable.status, "active"),
        sql`${missionsTable.current} >= ${missionsTable.target}`,
      ));

    for (const m of justCompleted) {
      await db.update(missionsTable)
        .set({ status: "completed" })
        .where(eq(missionsTable.id, m.id));

      // Unlock the next locked mission in sort order
      const [nextLocked] = await db
        .select({ id: missionsTable.id })
        .from(missionsTable)
        .where(and(
          eq(missionsTable.status, "locked"),
          sql`${missionsTable.sortOrder} > ${m.sortOrder}`,
        ))
        .orderBy(missionsTable.sortOrder)
        .limit(1);

      if (nextLocked) {
        await db.update(missionsTable)
          .set({ status: "active" })
          .where(eq(missionsTable.id, nextLocked.id));
      }
    }
  } catch (err) {
    logger.warn({ err }, "mission progress update failed");
  }
}

async function tick() {
  try {
    tickCount++;
    const agents = await db.select().from(agentsTable);
    if (!agents.length) return;

    const workingCount = agents.filter(a => a.status === "working").length;
    const idleCount    = agents.filter(a => a.status === "idle").length;

    const pendingResult = await db
      .select({ pendingCount: sql<number>`count(*)::int` })
      .from(tasksTable)
      .where(eq(tasksTable.status, "pending"));
    const pendingCount = pendingResult[0]?.pendingCount ?? 0;

    logger.info({
      tick:          tickCount,
      workingAgents: workingCount,
      idleAgents:    idleCount,
      pendingTasks:  pendingCount,
    }, "task engine tick");

    for (const agent of agents) {
      const isWorking = agent.status === "working";
      const isIdle    = agent.status === "idle";

      if (isWorking) {
        const [activeTask] = await db
          .select()
          .from(tasksTable)
          .where(and(eq(tasksTable.agentId, agent.id), eq(tasksTable.status, "in_progress")));

        if (!activeTask) {
          // Check for a pending task first (Commander-assigned)
          const [pendingTask] = await db
            .select()
            .from(tasksTable)
            .where(and(eq(tasksTable.agentId, agent.id), eq(tasksTable.status, "pending")));

          if (pendingTask) {
            await db.update(tasksTable)
              .set({ status: "in_progress" })
              .where(eq(tasksTable.id, pendingTask.id));
            await db.update(agentsTable)
              .set({ currentTask: pendingTask.title })
              .where(eq(agentsTable.id, agent.id));
          } else {
            const title = taskTitle(agent.role);
            await db.insert(tasksTable).values({
              agentId:     agent.id,
              title,
              description: `Auto-generated task for ${agent.name}`,
              status:      "in_progress",
              progress:    0,
              priority:    "medium",
            });
          }
          emit({ type: "task_update", data: { agentId: agent.id }, ts: Date.now() });
          continue;
        }

        const increment   = Math.floor(Math.random() * 12) + 8;
        const newProgress = Math.min(activeTask.progress + increment, 100);

        if (newProgress >= 100) {
          const completedAt = new Date();
          const durationMs  = completedAt.getTime() - activeTask.createdAt.getTime();

          // Track average duration per agent
          const prev = agentDurationMap.get(agent.id) ?? { totalMs: 0, count: 0 };
          agentDurationMap.set(agent.id, {
            totalMs: prev.totalMs + durationMs,
            count:   prev.count + 1,
          });

          await db.update(tasksTable)
            .set({ status: "completed", progress: 100, completedAt })
            .where(eq(tasksTable.id, activeTask.id));

          const newXp       = agent.experience + XP_PER_TASK;
          const levelsGained = Math.floor(newXp / XP_PER_LEVEL) - Math.floor(agent.experience / XP_PER_LEVEL);
          const newLevel    = agent.level + levelsGained;
          const remainingXp = newXp % XP_PER_LEVEL;
          const rev         = revenueIncrement();

          await db.update(agentsTable).set({
            experience:     remainingXp,
            level:          newLevel,
            tasksCompleted: agent.tasksCompleted + 1,
            status:         "working",
          }).where(eq(agentsTable.id, agent.id));

          await db.update(stationsTable).set({
            tasksCompleted: sql`${stationsTable.tasksCompleted} + 1`,
            revenue:        sql`${stationsTable.revenue} + ${rev}`,
          }).where(eq(stationsTable.id, agent.stationId));

          await syncActiveAgents(agent.stationId);

          const [station] = await db.select({ name: stationsTable.name }).from(stationsTable).where(eq(stationsTable.id, agent.stationId));
          const stationName = station?.name ?? "Unknown Station";
          const verb        = COMPLETE_VERBS[agent.role] ?? "completed";

          await db.insert(activityTable).values({
            agentName:  agent.name,
            agentRole:  agent.role,
            stationName,
            action:  levelsGained > 0 ? "LEVEL UP" : "TASK COMPLETE",
            details: levelsGained > 0
              ? `${agent.name} reached level ${newLevel} — "${activeTask.title}" complete`
              : `${agent.name} ${verb} "${activeTask.title}"`,
          });

          // Update mission progress
          await updateMissionProgress();

          // Generate output — AI first, fallback to template
          let outputId: number | null = null;
          let outputType: string | null = null;
          let outputContent: string | null = null;
          let aiResult: Awaited<ReturnType<typeof executeAiTask>> = null;
          try {
            aiResult = await executeAiTask(
              agent.role,
              activeTask.title,
              activeTask.description,
              agent.name,
            );

            if (aiResult) {
              const [outputRow] = await db.insert(agentOutputsTable).values({
                agentId:      agent.id,
                taskId:       activeTask.id,
                stationId:    agent.stationId,
                type:         aiResult.type,
                title:        aiResult.title,
                content:      aiResult.content,
                thumbnailUrl: null,
              }).returning({ id: agentOutputsTable.id });
              outputId = outputRow?.id ?? null;
              outputType = aiResult.type;
              outputContent = aiResult.content;
            } else {
              const output = generateOutput(agent.role, activeTask.title, activeTask.id, agent.id, agent.name);
              const [outputRow] = await db.insert(agentOutputsTable).values({
                agentId:      agent.id,
                taskId:       activeTask.id,
                stationId:    agent.stationId,
                type:         output.type,
                title:        output.title,
                content:      output.content,
                thumbnailUrl: output.thumbnailUrl,
              }).returning({ id: agentOutputsTable.id });
              outputId = outputRow?.id ?? null;
              outputType = output.type;
              outputContent = output.content;
            }
          } catch (e) {
            logger.warn({ err: e }, "failed to generate agent output");
          }

          // For builder agents: create a GitHub PR (non-blocking)
          if (agent.role === "builder" && aiResult && outputContent) {
            try {
              const parsed = JSON.parse(aiResult.content) as { markdown?: string };
              const md = parsed.markdown ?? outputContent;
              createAgentPR(activeTask.id, activeTask.title, agent.name, md).catch(e => {
                logger.warn({ err: e }, "createAgentPR background failed");
              });
            } catch (e) {
              logger.warn({ err: e }, "failed to trigger PR creation");
            }
          }

          // Insert into Security Airlock for Commander review
          try {
            await db.insert(airlockTable).values({
              taskId:      activeTask.id,
              agentId:     agent.id,
              agentName:   agent.name,
              agentRole:   agent.role,
              taskTitle:   activeTask.title,
              outputId:    outputId ?? undefined,
              outputType:  outputType ?? undefined,
              outputData:  outputContent ? JSON.stringify({ content: outputContent.slice(0, 1200) }) : undefined,
              status:      "pending",
              bonusXp:     20,
              bonusRevenue: Math.floor(rev * 0.25),
              stationId:   agent.stationId,
            });
          } catch (e) {
            logger.warn({ err: e }, "failed to insert airlock entry");
          }

          // Queue next task
          const [nextPending] = await db
            .select()
            .from(tasksTable)
            .where(and(eq(tasksTable.agentId, agent.id), eq(tasksTable.status, "pending")));

          if (nextPending) {
            await db.update(tasksTable)
              .set({ status: "in_progress" })
              .where(eq(tasksTable.id, nextPending.id));
            await db.update(agentsTable)
              .set({ currentTask: nextPending.title })
              .where(eq(agentsTable.id, agent.id));
          } else {
            const nextTitle = taskTitle(agent.role);
            await db.insert(tasksTable).values({
              agentId:     agent.id,
              title:       nextTitle,
              description: `Auto-generated task for ${agent.name}`,
              status:      "in_progress",
              progress:    0,
              priority:    "medium",
            });
          }

          const eventData = {
            agentId:   agent.id,
            agentName: agent.name,
            agentRole: agent.role,
            level:     newLevel,
            taskId:    activeTask.id,
            taskTitle: activeTask.title,
            stationId: agent.stationId,
            outputId,
            reward:    { xp: XP_PER_TASK, revenue: rev },
            durationMs,
          };
          if (levelsGained > 0) {
            emit({ type: "agent_level_up", data: eventData, ts: Date.now() });
          } else {
            emit({ type: "task_complete", data: eventData, ts: Date.now() });
          }

        } else {
          await db.update(tasksTable)
            .set({ progress: newProgress })
            .where(eq(tasksTable.id, activeTask.id));

          emit({ type: "task_update", data: { agentId: agent.id, progress: newProgress }, ts: Date.now() });
        }

      } else if (isIdle) {
        // Check for a pending Commander-assigned task first
        const [pendingTask] = await db
          .select()
          .from(tasksTable)
          .where(and(eq(tasksTable.agentId, agent.id), eq(tasksTable.status, "pending")));

        if (pendingTask) {
          await db.update(agentsTable)
            .set({ status: "working", currentTask: pendingTask.title })
            .where(eq(agentsTable.id, agent.id));

          await db.update(tasksTable)
            .set({ status: "in_progress" })
            .where(eq(tasksTable.id, pendingTask.id));

          await syncActiveAgents(agent.stationId);

          const [station] = await db.select({ name: stationsTable.name }).from(stationsTable).where(eq(stationsTable.id, agent.stationId));
          await db.insert(activityTable).values({
            agentName:  agent.name,
            agentRole:  agent.role,
            stationName: station?.name ?? "Unknown",
            action:  "TASK START",
            details: `${agent.name} started "${pendingTask.title}" [Commander assigned]`,
          });

          emit({ type: "task_update", data: { agentId: agent.id }, ts: Date.now() });

        } else if (Math.random() < IDLE_START_CHANCE) {
          const title = taskTitle(agent.role);

          await db.update(agentsTable)
            .set({ status: "working", currentTask: title })
            .where(eq(agentsTable.id, agent.id));

          await syncActiveAgents(agent.stationId);

          await db.insert(tasksTable).values({
            agentId:     agent.id,
            title,
            description: `Auto-generated task for ${agent.name}`,
            status:      "in_progress",
            progress:    0,
            priority:    "medium",
          });

          const [station] = await db.select({ name: stationsTable.name }).from(stationsTable).where(eq(stationsTable.id, agent.stationId));
          await db.insert(activityTable).values({
            agentName:  agent.name,
            agentRole:  agent.role,
            stationName: station?.name ?? "Unknown",
            action:  "TASK START",
            details: `${agent.name} started "${title}"`,
          });

          emit({ type: "task_update", data: { agentId: agent.id }, ts: Date.now() });
        }
      }
    }
  } catch (err) {
    logger.error({ err }, "taskEngine tick error");
  }
}

export function startTaskEngine(): void {
  logger.info("Task engine started");
  setTimeout(() => {
    tick();
    setInterval(tick, TICK_INTERVAL_MS);
  }, 3000);
}
