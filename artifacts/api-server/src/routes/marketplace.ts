import { Router } from "express";
import { db, marketplaceListingsTable, agentsTable, roomsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/marketplace/agents — all listings (optionally filter by rarity/role)
router.get("/agents", async (req, res) => {
  try {
    const { rarity, role, status = "available" } = req.query as Record<string, string>;
    let rows = await db.select().from(marketplaceListingsTable);
    if (status) rows = rows.filter(r => r.status === status);
    if (rarity) rows = rows.filter(r => r.rarity === rarity);
    if (role)   rows = rows.filter(r => r.role   === role);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch marketplace listings" });
  }
});

// GET /api/marketplace/agents/:id — single listing detail
router.get("/agents/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [listing] = await db.select().from(marketplaceListingsTable).where(eq(marketplaceListingsTable.id, id));
    if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }
    res.json(listing);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch listing" });
  }
});

// POST /api/marketplace/hire/:id — hire an agent into a station
router.post("/hire/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { stationId } = req.body as { stationId: number };
    if (!stationId) { res.status(400).json({ error: "stationId is required" }); return; }

    const [listing] = await db.select().from(marketplaceListingsTable).where(eq(marketplaceListingsTable.id, id));
    if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }
    if (listing.status !== "available") { res.status(409).json({ error: "Agent already hired" }); return; }

    // Pick a room in the target station matching the agent's role
    const rooms = await db.select().from(roomsTable).where(eq(roomsTable.stationId, stationId));
    const ROLE_TO_ROOM: Record<string, string> = {
      research:  "research",
      strategy:  "strategy",
      builder:   "development",
      content:   "content",
      growth:    "marketing",
      analytics: "analytics",
      design:    "design",
    };
    const preferredName = ROLE_TO_ROOM[listing.role] ?? listing.role;
    const room = rooms.find(r => r.name.toLowerCase().includes(preferredName)) ?? rooms[0];
    if (!room) { res.status(400).json({ error: "No rooms available in that station" }); return; }

    // Create the agent
    const [newAgent] = await db.insert(agentsTable).values({
      stationId,
      roomId:    room.id,
      name:      listing.agentName,
      role:      listing.role,
      status:    "idle",
      level:     listing.level,
      experience: listing.level * 120,
    }).returning();

    // Mark listing as hired
    await db.update(marketplaceListingsTable)
      .set({ status: "hired", hiredByStationId: stationId, hiredAt: new Date() })
      .where(eq(marketplaceListingsTable.id, id));

    res.json({ success: true, agent: newAgent, listing });
  } catch (e) {
    res.status(500).json({ error: "Failed to hire agent" });
  }
});

export default router;
