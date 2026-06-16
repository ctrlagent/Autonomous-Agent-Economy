import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const agentWalletTxTable = pgTable("agent_wallet_tx", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  txHash: text("tx_hash"),
  amount: integer("amount").notNull().default(0),
  token: text("token").notNull().default("USDC"),
  type: text("type").notNull(),
  missionId: integer("mission_id"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertAgentWalletTxSchema = createInsertSchema(agentWalletTxTable).omit({ id: true, timestamp: true });
export type InsertAgentWalletTx = z.infer<typeof insertAgentWalletTxSchema>;
export type AgentWalletTx = typeof agentWalletTxTable.$inferSelect;
