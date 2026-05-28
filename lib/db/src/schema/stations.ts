import { pgTable, serial, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const stationStatusEnum = pgEnum("station_status", ["idle", "running", "paused", "completed"]);

export const stationsTable = pgTable("stations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  templateId: integer("template_id").notNull(),
  templateName: text("template_name").notNull(),
  status: stationStatusEnum("status").notNull().default("idle"),
  progress: real("progress").notNull().default(0),
  agentCount: integer("agent_count").notNull().default(0),
  activeAgents: integer("active_agents").notNull().default(0),
  roomCount: integer("room_count").notNull().default(0),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  tasksTotal: integer("tasks_total").notNull().default(0),
  revenue: real("revenue").notNull().default(0),
  ownerAddress: text("owner_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStationSchema = createInsertSchema(stationsTable).omit({ id: true, createdAt: true });
export type InsertStation = z.infer<typeof insertStationSchema>;
export type Station = typeof stationsTable.$inferSelect;
