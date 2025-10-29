import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { pools } from "./pools";
import { pitches } from "./pitches";

export const poolStartups = pgTable(
    "pool_startups",
    {
        poolId: text("pool_id")
            .notNull()
            .references(() => pools.id, { onDelete: "cascade" }),
        pitchId: text("pitch_id")
            .notNull()
            .references(() => pitches.id, { onDelete: "cascade" }),
        assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.poolId, table.pitchId] }),
    }),
);

export type PoolStartup = typeof poolStartups.$inferSelect;
export type NewPoolStartup = typeof poolStartups.$inferInsert;
