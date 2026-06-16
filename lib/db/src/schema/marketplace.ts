import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { agentRoleEnum } from "./agents";

export const rarityEnum = pgEnum("rarity", ["common", "rare", "elite", "legendary"]);

export const marketplaceListingsTable = pgTable("marketplace_listings", {
  id:               serial("id").primaryKey(),
  agentName:        text("agent_name").notNull(),
  role:             agentRoleEnum("role").notNull(),
  rarity:           rarityEnum("rarity").notNull().default("common"),
  level:            integer("level").notNull().default(1),
  skills:           text("skills").array().notNull().default([]),
  price:            integer("price").notNull().default(1000),
  description:      text("description").notNull().default(""),
  avatarSeed:       integer("avatar_seed").notNull().default(0),
  status:           text("status").notNull().default("available"),
  hiredByStationId: integer("hired_by_station_id"),
  hiredAt:          timestamp("hired_at"),
  createdAt:        timestamp("created_at").notNull().defaultNow(),
});

export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListingsTable).omit({ id: true, createdAt: true });
export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type MarketplaceListing = typeof marketplaceListingsTable.$inferSelect;
