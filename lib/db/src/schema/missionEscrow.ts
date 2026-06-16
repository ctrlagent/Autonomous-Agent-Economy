import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const missionEscrowTable = pgTable("mission_escrow", {
  id: serial("id").primaryKey(),
  missionId: integer("mission_id").notNull(),
  depositorAddress: text("depositor_address"),
  agentAddress: text("agent_address"),
  amount: integer("amount").notNull().default(0),
  token: text("token").notNull().default("USDC"),
  deadline: timestamp("deadline"),
  status: text("status").notNull().default("pending"),
  proofHash: text("proof_hash"),
  txHashDeposit: text("tx_hash_deposit"),
  txHashRelease: text("tx_hash_release"),
  onchainMissionId: integer("onchain_mission_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertMissionEscrowSchema = createInsertSchema(missionEscrowTable).omit({ id: true, createdAt: true });
export type InsertMissionEscrow = z.infer<typeof insertMissionEscrowSchema>;
export type MissionEscrow = typeof missionEscrowTable.$inferSelect;
