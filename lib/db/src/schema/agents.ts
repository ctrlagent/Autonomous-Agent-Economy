import { pgTable, serial, text, integer, timestamp, pgEnum, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const agentRoleEnum = pgEnum("agent_role", ["research", "strategy", "builder", "content", "growth", "analytics", "design"]);
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
  walletAddress: text("wallet_address"),
  totalEarned: integer("total_earned").notNull().default(0),
  totalTokensUsed: bigint("total_tokens_used", { mode: "number" }).notNull().default(0),
});

export const updateAgentSchema = createInsertSchema(agentsTable).omit({ id: true, createdAt: true }).partial();
export const insertAgentSchema = createInsertSchema(agentsTable).omit({ id: true, createdAt: true });
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agentsTable.$inferSelect;
