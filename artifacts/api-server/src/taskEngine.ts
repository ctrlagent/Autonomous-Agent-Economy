import { db, agentsTable, tasksTable, activityTable, stationsTable, agentOutputsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { broadcastEvent } from "./routes/events";
import { logger } from "./lib/logger";
import { generateOutput } from "./lib/outputGenerators";
import { executeAiTask } from "./lib/aiTaskExecutor";

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
};

const COMPLETE_VERBS: Record<string, string> = {
  research:  "completed research on",
  strategy:  "finalized strategy for",
  builder:   "deployed module for",
  content:   "published content for",
  growth:    "optimized funnel for",
  analytics: "delivered report on",
};

const REVENUE_PER_TASK_MIN = 45;
const REVENUE_PER_TASK_MAX = 135;

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

async function tick() {
  try {
    const agents = await db.select().from(agentsTable);
    if (!agents.length) return;

    for (const agent of agents) {
      const isWorking = agent.status === "working";
      const isIdle = agent.status === "idle";

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
              agentId: agent.id,
              title,
              description: `Auto-generated task for ${agent.name}`,
              status: "in_progress",
              progress: 0,
              priority: "medium",
            });
          }
          broadcastEvent("task_update", { agentId: agent.id });
          continue;
        }

        const increment = Math.floor(Math.random() * 12) + 8;
        const newProgress = Math.min(activeTask.progress + increment, 100);

        if (newProgress >= 100) {
          await db.update(tasksTable)
            .set({ status: "completed", progress: 100, completedAt: new Date() })
            .where(eq(tasksTable.id, activeTask.id));

          const newXp = agent.experience + XP_PER_TASK;
          const levelsGained = Math.floor(newXp / XP_PER_LEVEL) - Math.floor(agent.experience / XP_PER_LEVEL);
          const newLevel = agent.level + levelsGained;
          const remainingXp = newXp % XP_PER_LEVEL;

          await db.update(agentsTable).set({
            experience: remainingXp,
            level: newLevel,
            tasksCompleted: agent.tasksCompleted + 1,
            status: "working",
          }).where(eq(agentsTable.id, agent.id));

          const rev = revenueIncrement();
          await db.update(stationsTable).set({
            tasksCompleted: sql`${stationsTable.tasksCompleted} + 1`,
            revenue: sql`${stationsTable.revenue} + ${rev}`,
          }).where(eq(stationsTable.id, agent.stationId));

          // Recalculate activeAgents from real DB state
          await syncActiveAgents(agent.stationId);

          const [station] = await db.select({ name: stationsTable.name }).from(stationsTable).where(eq(stationsTable.id, agent.stationId));
          const stationName = station?.name ?? "Unknown Station";
          const verb = COMPLETE_VERBS[agent.role] ?? "completed";

          await db.insert(activityTable).values({
            agentName: agent.name,
            agentRole: agent.role,
            stationName,
            action: levelsGained > 0 ? "LEVEL UP" : "TASK COMPLETE",
            details: levelsGained > 0
              ? `${agent.name} reached level ${newLevel} — "${activeTask.title}" complete`
              : `${agent.name} ${verb} "${activeTask.title}"`,
          });

          // Try AI output first, fall back to template
          try {
            const aiResult = await executeAiTask(
              agent.role,
              activeTask.title,
              activeTask.description,
              agent.name,
            );

            if (aiResult) {
              await db.insert(agentOutputsTable).values({
                agentId: agent.id,
                taskId: activeTask.id,
                stationId: agent.stationId,
                type: aiResult.type,
                title: aiResult.title,
                content: aiResult.content,
                thumbnailUrl: null,
              });
            } else {
              const output = generateOutput(agent.role, activeTask.title, activeTask.id, agent.id, agent.name);
              await db.insert(agentOutputsTable).values({
                agentId: agent.id,
                taskId: activeTask.id,
                stationId: agent.stationId,
                type: output.type,
                title: output.title,
                content: output.content,
                thumbnailUrl: output.thumbnailUrl,
              });
            }
          } catch (e) {
            logger.warn({ err: e }, "failed to generate agent output");
          }

          // Check if there's a pending task queued for this agent next
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
              agentId: agent.id,
              title: nextTitle,
              description: `Auto-generated task for ${agent.name}`,
              status: "in_progress",
              progress: 0,
              priority: "medium",
            });
          }

          broadcastEvent(levelsGained > 0 ? "agent_level_up" : "task_complete", {
            agentId: agent.id,
            agentName: agent.name,
            level: newLevel,
            taskTitle: activeTask.title,
            stationId: agent.stationId,
            revenue: rev,
          });
        } else {
          await db.update(tasksTable)
            .set({ progress: newProgress })
            .where(eq(tasksTable.id, activeTask.id));

          broadcastEvent("task_update", { agentId: agent.id, progress: newProgress });
        }

      } else if (isIdle) {
        // Check for a pending Commander-assigned task first
        const [pendingTask] = await db
          .select()
          .from(tasksTable)
          .where(and(eq(tasksTable.agentId, agent.id), eq(tasksTable.status, "pending")));

        if (pendingTask) {
          // Always pick up Commander-assigned tasks, no random chance
          await db.update(agentsTable)
            .set({ status: "working", currentTask: pendingTask.title })
            .where(eq(agentsTable.id, agent.id));

          await db.update(tasksTable)
            .set({ status: "in_progress" })
            .where(eq(tasksTable.id, pendingTask.id));

          await syncActiveAgents(agent.stationId);

          const [station] = await db.select({ name: stationsTable.name }).from(stationsTable).where(eq(stationsTable.id, agent.stationId));
          await db.insert(activityTable).values({
            agentName: agent.name,
            agentRole: agent.role,
            stationName: station?.name ?? "Unknown",
            action: "TASK START",
            details: `${agent.name} started "${pendingTask.title}" [Commander assigned]`,
          });

          broadcastEvent("task_update", { agentId: agent.id });

        } else if (Math.random() < IDLE_START_CHANCE) {
          // Auto-start a random task
          const title = taskTitle(agent.role);

          await db.update(agentsTable)
            .set({ status: "working", currentTask: title })
            .where(eq(agentsTable.id, agent.id));

          await syncActiveAgents(agent.stationId);

          await db.insert(tasksTable).values({
            agentId: agent.id,
            title,
            description: `Auto-generated task for ${agent.name}`,
            status: "in_progress",
            progress: 0,
            priority: "medium",
          });

          const [station] = await db.select({ name: stationsTable.name }).from(stationsTable).where(eq(stationsTable.id, agent.stationId));
          await db.insert(activityTable).values({
            agentName: agent.name,
            agentRole: agent.role,
            stationName: station?.name ?? "Unknown",
            action: "TASK START",
            details: `${agent.name} started "${title}"`,
          });

          broadcastEvent("task_update", { agentId: agent.id });
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
