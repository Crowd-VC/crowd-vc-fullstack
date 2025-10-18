/**
 * Manual migration to add wallet_address to votes table
 * This migration:
 * 1. Drops the old primary key (user_id, pool_id)
 * 2. Adds the wallet_address column
 * 3. Creates new primary key (wallet_address, pool_id)
 */

import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function migrateVotesTable() {
    try {
        console.log("🔄 Starting votes table migration...");

        // Step 1: Drop the old primary key constraint
        console.log("  → Dropping old primary key...");
        await db.execute(
            sql`ALTER TABLE "votes" DROP CONSTRAINT IF EXISTS "votes_user_id_pool_id_pk"`,
        );

        // Step 2: Add wallet_address column
        console.log("  → Adding wallet_address column...");
        await db.execute(
            sql`ALTER TABLE "votes" ADD COLUMN IF NOT EXISTS "wallet_address" text NOT NULL DEFAULT ''`,
        );

        // Step 3: Create new primary key
        console.log("  → Creating new primary key...");
        await db.execute(
            sql`ALTER TABLE "votes" ADD CONSTRAINT "votes_wallet_address_pool_id_pk" PRIMARY KEY("wallet_address","pool_id")`,
        );

        // Step 4: Remove the default value we added temporarily
        console.log("  → Removing temporary default...");
        await db.execute(
            sql`ALTER TABLE "votes" ALTER COLUMN "wallet_address" DROP DEFAULT`,
        );

        console.log("✅ Migration completed successfully!");
        console.log(
            "   The votes table now uses wallet_address instead of user_id for the primary key",
        );

        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        console.error(
            "\nIf the error says the column or constraint already exists, that's okay!",
        );
        console.error(
            "You may need to manually check your database and clean up.",
        );
        process.exit(1);
    }
}

migrateVotesTable();
