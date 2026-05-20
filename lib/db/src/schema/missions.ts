import { pgTable, serial, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const missionStatusEnum = pgEnum("mission_status", ["active", "completed", "locked"]);

export const missionsTable = pgTable("missions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  iconName: text("icon_name").notNull().default("TrendingUp"),
  color: text("color").notNull().default("#4dff9b"),
  target: real("target").notNull(),
  current: real("current").notNull().default(0),
  unit: text("unit").notNull().default(""),
  rewardXp: integer("reward_xp").notNull().default(100),
  status: missionStatusEnum("status").notNull().default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMissionSchema = createInsertSchema(missionsTable).omit({ id: true, createdAt: true });
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type Mission = typeof missionsTable.$inferSelect;
