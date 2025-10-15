import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const poolStatusEnum = pgEnum("pool_status", [
    "active",
    "closed",
    "upcoming",
]);

export const pools = pgTable("pools", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(), // e.g., 'FinTech', 'HealthTech', etc.
    votingDeadline: timestamp("voting_deadline").notNull(),
    status: poolStatusEnum("status").notNull().default("upcoming"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Pool = typeof pools.$inferSelect;
export type NewPool = typeof pools.$inferInsert;
