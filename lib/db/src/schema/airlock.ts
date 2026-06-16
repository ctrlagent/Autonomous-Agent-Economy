import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const airlockStatusEnum = pgEnum("airlock_status", [
  "pending",
  "approved",
  "rejected",
  "changes_requested",
]);

export const airlockTable = pgTable("airlock", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  agentId: integer("agent_id").notNull(),
  agentName: text("agent_name").notNull(),
  agentRole: text("agent_role").notNull(),
  taskTitle: text("task_title").notNull(),
  outputId: integer("output_id"),
  outputType: text("output_type"),
  outputData: text("output_data"),
  status: airlockStatusEnum("status").notNull().default("pending"),
  reviewerNotes: text("reviewer_notes"),
  bonusXp: integer("bonus_xp").notNull().default(20),
  bonusRevenue: integer("bonus_revenue").notNull().default(0),
  stationId: integer("station_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export const insertAirlockSchema = createInsertSchema(airlockTable).omit({ id: true, createdAt: true });
export type InsertAirlock = z.infer<typeof insertAirlockSchema>;
export type Airlock = typeof airlockTable.$inferSelect;
