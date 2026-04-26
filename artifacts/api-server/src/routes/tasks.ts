import { Router } from "express";
import { db, tasksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const updateTaskBody = z.object({
  status: z.enum(["pending", "in_progress", "completed", "failed"]).optional(),
  progress: z.number().optional(),
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = updateTaskBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status === "completed") {
    updates.completedAt = new Date();
    updates.progress = 100;
  }

  const [task] = await db.update(tasksTable).set(updates).where(eq(tasksTable.id, id)).returning();
  if (!task) return res.status(404).json({ error: "Not found" });
  return res.json(task);
});

export default router;
