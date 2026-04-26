import { Router } from "express";
import { db, templatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const categoryFilter = z.enum(["crypto", "ecommerce", "content", "saas", "all"]).optional();

router.get("/", async (req, res) => {
  const category = categoryFilter.safeParse(req.query.category);
  let query = db.select().from(templatesTable);
  const templates = await query;
  if (category.success && category.data && category.data !== "all") {
    const filtered = templates.filter(t => t.category === category.data);
    return res.json(filtered);
  }
  return res.json(templates);
});

router.post("/", async (req, res) => {
  const body = req.body;
  const [template] = await db.insert(templatesTable).values({
    name: body.name,
    slug: body.name.toLowerCase().replace(/\s+/g, "-"),
    description: body.description,
    category: body.category,
    isPublished: body.isPublished ?? true,
  }).returning();
  return res.status(201).json(template);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [template] = await db.select().from(templatesTable).where(eq(templatesTable.id, id));
  if (!template) return res.status(404).json({ error: "Not found" });
  return res.json(template);
});

export default router;
