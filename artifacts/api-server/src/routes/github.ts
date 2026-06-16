import { Router } from "express";
import { db, tasksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { mergeAgentPR } from "../lib/githubAgent";

const router = Router();

router.get("/:id/pr", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid task id" });

  try {
    const [task] = await db
      .select({
        id: tasksTable.id,
        title: tasksTable.title,
        prUrl: tasksTable.prUrl,
        branchName: tasksTable.branchName,
        reviewStatus: tasksTable.reviewStatus,
        status: tasksTable.status,
      })
      .from(tasksTable)
      .where(eq(tasksTable.id, id));

    if (!task) return res.status(404).json({ error: "Task not found" });

    return res.json({
      taskId: task.id,
      title: task.title,
      prUrl: task.prUrl,
      branchName: task.branchName,
      reviewStatus: task.reviewStatus,
      taskStatus: task.status,
      hasPr: !!task.prUrl,
      isSimulated: task.prUrl?.includes("ctrl-station") ?? false,
    });
  } catch (err) {
    logger.error({ err }, "GET /tasks/:id/pr error");
    return res.status(500).json({ error: (err as Error).message });
  }
});

router.post("/:id/pr/merge", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid task id" });

  try {
    const [task] = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, id));

    if (!task) return res.status(404).json({ error: "Task not found" });
    if (!task.prUrl) return res.status(400).json({ error: "No PR associated with this task" });
    if (task.reviewStatus === "merged") {
      return res.json({ taskId: id, prUrl: task.prUrl, reviewStatus: "merged", merged: true });
    }

    await mergeAgentPR(id);

    const [updated] = await db
      .update(tasksTable)
      .set({ reviewStatus: "merged" })
      .where(eq(tasksTable.id, id))
      .returning();

    logger.info({ taskId: id, prUrl: task.prUrl }, "PR merged");
    return res.json({
      taskId: id,
      prUrl: task.prUrl,
      branchName: task.branchName,
      reviewStatus: "merged",
      merged: true,
    });
  } catch (err) {
    logger.error({ err }, "POST /tasks/:id/pr/merge error");
    return res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
