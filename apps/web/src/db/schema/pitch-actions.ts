import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { pitches } from "./pitches";
import { users } from "./users";

export const pitchActionEnum = pgEnum("pitch_action", ["approved", "rejected"]);

export const pitchActions = pgTable("pitch_actions", {
    id: text("id").primaryKey(),
    pitchId: text("pitch_id")
        .notNull()
        .references(() => pitches.id, { onDelete: "cascade" }),
    adminId: text("admin_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    action: pitchActionEnum("action").notNull(),
    reason: text("reason"),
    customNotes: text("custom_notes"),
    actionDate: timestamp("action_date").notNull().defaultNow(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PitchAction = typeof pitchActions.$inferSelect;
export type NewPitchAction = typeof pitchActions.$inferInsert;
