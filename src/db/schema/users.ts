import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const userTypeEnum = pgEnum('user_type', [
  'startup',
  'investor',
  'admin',
]);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  walletAddress: text('wallet_address').notNull().unique(),
  name: text('name'),
  userType: userTypeEnum('user_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
