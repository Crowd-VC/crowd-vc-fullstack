import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { pools } from "./pools";
import { pitches } from "./pitches";
import { users } from "./users";

export const votes = pgTable(
    "votes",
    {
        id: text("id").notNull().unique(),
        poolId: text("pool_id")
            .notNull()
            .references(() => pools.id, { onDelete: "cascade" }),
        pitchId: text("pitch_id")
            .notNull()
            .references(() => pitches.id, { onDelete: "cascade" }),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        walletAddress: text("wallet_address").notNull(),
        votedAt: timestamp("voted_at").defaultNow().notNull(),
    },
    (table) => ({
        // Ensure one vote per wallet per pool
        pk: primaryKey({ columns: [table.walletAddress, table.poolId] }),
    }),
);

export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;
