import { Router } from "express";
import { db, stationsTable, roomsTable, agentsTable, templatesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const updateStationBody = z.object({
  name: z.string().optional(),
  status: z.enum(["idle", "running", "paused", "completed"]).optional(),
});

const createRoomBody = z.object({
  name: z.string(),
  type: z.enum(["research", "development", "design", "marketing", "operations", "analytics"]),
});

const createAgentBody = z.object({
  name: z.string(),
  role: z.enum(["research", "strategy", "builder", "content", "growth", "analytics"]),
  roomId: z.number(),
});

router.get("/", async (req, res) => {
  const stations = await db.select().from(stationsTable);
  return res.json(stations);
});

router.post("/", async (req, res) => {
  const body = req.body;
  const [template] = await db.select().from(templatesTable).where(eq(templatesTable.id, body.templateId));
  const templateName = template?.name ?? "Unknown Template";
  const [station] = await db.insert(stationsTable).values({
    name: body.name,
    templateId: body.templateId,
    templateName,
    status: "idle",
    progress: 0,
    agentCount: template?.agentCount ?? 6,
    activeAgents: 0,
    roomCount: template?.roomCount ?? 6,
    tasksCompleted: 0,
    tasksTotal: 20,
  }).returning();

  const roomTypes: Array<{ name: string; type: "research" | "development" | "design" | "marketing" | "operations" | "analytics" }> = [
    { name: "Research Lab", type: "research" },
    { name: "Development Lab", type: "development" },
    { name: "Design Studio", type: "design" },
    { name: "Marketing Hub", type: "marketing" },
    { name: "Operations Center", type: "operations" },
    { name: "Analytics Room", type: "analytics" },
  ];

  const agentRoles: Array<{ name: string; role: "research" | "strategy" | "builder" | "content" | "growth" | "analytics"; roomIndex: number }> = [
    { name: "ARIA", role: "research", roomIndex: 0 },
    { name: "STRAT", role: "strategy", roomIndex: 1 },
    { name: "FORGE", role: "builder", roomIndex: 1 },
    { name: "NOVA", role: "content", roomIndex: 2 },
    { name: "APEX", role: "growth", roomIndex: 3 },
    { name: "LENS", role: "analytics", roomIndex: 5 },
  ];

  const rooms = await Promise.all(
    roomTypes.map(room => db.insert(roomsTable).values({
      stationId: station.id,
      name: room.name,
      type: room.type,
      status: "idle",
      agentCount: 1,
      tasksCompleted: 0,
    }).returning().then(r => r[0]))
  );

  await Promise.all(
    agentRoles.map(agent => db.insert(agentsTable).values({
      stationId: station.id,
      roomId: rooms[agent.roomIndex].id,
      name: agent.name,
      role: agent.role,
      status: "idle",
      level: 1,
      experience: 0,
      tasksCompleted: 0,
    }))
  );

  return res.status(201).json(station);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [station] = await db.select().from(stationsTable).where(eq(stationsTable.id, id));
  if (!station) return res.status(404).json({ error: "Not found" });
  return res.json(station);
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = updateStationBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const [station] = await db.update(stationsTable).set(parsed.data).where(eq(stationsTable.id, id)).returning();
  if (!station) return res.status(404).json({ error: "Not found" });
  return res.json(station);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(stationsTable).where(eq(stationsTable.id, id));
  return res.status(204).send();
});

router.get("/:id/rooms", async (req, res) => {
  const id = parseInt(req.params.id);
  const rooms = await db.select().from(roomsTable).where(eq(roomsTable.stationId, id));
  return res.json(rooms);
});

router.post("/:id/rooms", async (req, res) => {
  const stationId = parseInt(req.params.id);
  const parsed = createRoomBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const [room] = await db.insert(roomsTable).values({
    stationId,
    name: parsed.data.name,
    type: parsed.data.type,
    status: "idle",
    agentCount: 0,
    tasksCompleted: 0,
  }).returning();

  // Update station roomCount
  await db
    .update(stationsTable)
    .set({ roomCount: (await db.select().from(roomsTable).where(eq(roomsTable.stationId, stationId))).length })
    .where(eq(stationsTable.id, stationId));

  return res.status(201).json(room);
});

router.delete("/:id/rooms/:roomId", async (req, res) => {
  const stationId = parseInt(req.params.id);
  const roomId = parseInt(req.params.roomId);
  await db.delete(agentsTable).where(and(eq(agentsTable.stationId, stationId), eq(agentsTable.roomId, roomId)));
  await db.delete(roomsTable).where(and(eq(roomsTable.id, roomId), eq(roomsTable.stationId, stationId)));
  return res.status(204).send();
});

router.get("/:id/agents", async (req, res) => {
  const id = parseInt(req.params.id);
  const agents = await db.select().from(agentsTable).where(eq(agentsTable.stationId, id));
  return res.json(agents);
});

router.post("/:id/agents", async (req, res) => {
  const stationId = parseInt(req.params.id);
  const parsed = createAgentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const [agent] = await db.insert(agentsTable).values({
    stationId,
    roomId: parsed.data.roomId,
    name: parsed.data.name,
    role: parsed.data.role,
    status: "idle",
    level: 1,
    experience: 0,
    tasksCompleted: 0,
  }).returning();

  // Update room agentCount
  const roomAgents = await db.select().from(agentsTable).where(eq(agentsTable.roomId, parsed.data.roomId));
  await db.update(roomsTable).set({ agentCount: roomAgents.length }).where(eq(roomsTable.id, parsed.data.roomId));

  return res.status(201).json(agent);
});

export default router;
