import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { pools } from "./pools";
import { users } from "./users";

export const contributionStatusEnum = pgEnum("contribution_status", [
    "pending",
    "confirmed",
    "failed",
]);

export const contributions = pgTable("contributions", {
    id: text("id").primaryKey(),
    poolId: text("pool_id")
        .notNull()
        .references(() => pools.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    walletAddress: text("wallet_address").notNull(),
    amount: integer("amount").notNull(), // in cents/smallest unit
    platformFee: integer("platform_fee").notNull(),
    gasFee: integer("gas_fee"),
    status: contributionStatusEnum("status").notNull().default("pending"),
    transactionHash: text("transaction_hash"),
    contributedAt: timestamp("contributed_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Contribution = typeof contributions.$inferSelect;
export type NewContribution = typeof contributions.$inferInsert;
