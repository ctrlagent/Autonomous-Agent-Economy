import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roomTypeEnum = pgEnum("room_type", ["research", "development", "design", "marketing", "operations", "analytics"]);
export const roomStatusEnum = pgEnum("room_status", ["idle", "active", "busy"]);

export const roomsTable = pgTable("rooms", {
  id: serial("id").primaryKey(),
  stationId: integer("station_id").notNull(),
  name: text("name").notNull(),
  type: roomTypeEnum("type").notNull(),
  status: roomStatusEnum("status").notNull().default("idle"),
  agentCount: integer("agent_count").notNull().default(0),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRoomSchema = createInsertSchema(roomsTable).omit({ id: true, createdAt: true });
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof roomsTable.$inferSelect;
