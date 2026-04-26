import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const agentRoleEnum = pgEnum("agent_role", ["research", "strategy", "builder", "content", "growth", "analytics"]);
export const agentStatusEnum = pgEnum("agent_status", ["idle", "working", "paused", "offline"]);

export const agentsTable = pgTable("agents", {
  id: serial("id").primaryKey(),
  stationId: integer("station_id").notNull(),
  roomId: integer("room_id").notNull(),
  name: text("name").notNull(),
  role: agentRoleEnum("role").notNull(),
  status: agentStatusEnum("status").notNull().default("idle"),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  currentTask: text("current_task"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAgentSchema = createInsertSchema(agentsTable).omit({ id: true, createdAt: true });
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agentsTable.$inferSelect;
