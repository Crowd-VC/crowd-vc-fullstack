import {
    boolean,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
} from "drizzle-orm/pg-core";

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
    // Funding fields
    fundingGoal: integer("funding_goal").notNull().default(0),
    currentFunding: integer("current_funding").notNull().default(0),
    minContribution: integer("min_contribution").notNull().default(1000),
    maxContribution: integer("max_contribution"),
    // Smart contract fields
    contractAddress: text("contract_address"), // On-chain pool contract address
    fundingDuration: integer("funding_duration"), // Duration in seconds for funding phase
    acceptedToken: text("accepted_token"), // Token address for contributions (USDT/USDC)
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Pool = typeof pools.$inferSelect;
export type NewPool = typeof pools.$inferInsert;
