import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const commanderDirectivesTable = pgTable("commander_directives", {
  id:        serial("id").primaryKey(),
  role:      text("role").notNull().unique(),
  weight:    integer("weight").notNull().default(50),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CommanderDirective = typeof commanderDirectivesTable.$inferSelect;
