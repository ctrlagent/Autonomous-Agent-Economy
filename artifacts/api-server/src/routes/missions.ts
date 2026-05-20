import { Router } from "express";
import { db, missionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const updateMissionBody = z.object({
  current: z.number().optional(),
  status: z.enum(["active", "completed", "locked"]).optional(),
});

router.get("/", async (req, res) => {
  const missions = await db.select().from(missionsTable).orderBy(missionsTable.sortOrder);
  return res.json(missions);
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = updateMissionBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const [mission] = await db.update(missionsTable).set(parsed.data).where(eq(missionsTable.id, id)).returning();
  if (!mission) return res.status(404).json({ error: "Not found" });
  return res.json(mission);
});

export default router;
