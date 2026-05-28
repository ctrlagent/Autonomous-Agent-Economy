import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const agentOutputsTable = pgTable("agent_outputs", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  taskId: integer("task_id"),
  stationId: integer("station_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAgentOutputSchema = createInsertSchema(agentOutputsTable).omit({ id: true, createdAt: true });
export type InsertAgentOutput = z.infer<typeof insertAgentOutputSchema>;
export type AgentOutput = typeof agentOutputsTable.$inferSelect;
