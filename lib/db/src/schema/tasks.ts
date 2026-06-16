import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const taskStatusEnum = pgEnum("task_status", ["pending", "in_progress", "completed", "failed"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "critical"]);

export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: taskStatusEnum("status").notNull().default("pending"),
  progress: integer("progress").notNull().default(0),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  bountyAmount: integer("bounty_amount").notNull().default(0),
  bountyToken: text("bounty_token").notNull().default("USDC"),
  escrowTx: text("escrow_tx"),
  prUrl: text("pr_url"),
  reviewStatus: text("review_status").notNull().default("none"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertTaskSchema = createInsertSchema(tasksTable).omit({ id: true, createdAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasksTable.$inferSelect;
