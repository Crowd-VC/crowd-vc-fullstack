/**
 * Truncate votes table to allow schema migration
 * Run this before db:push when changing votes schema
 */

import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function truncateVotes() {
    try {
        console.log("🗑️  Truncating votes table...");

        await db.execute(sql`TRUNCATE TABLE votes CASCADE`);

        console.log("✅ Votes table truncated successfully");
        console.log("You can now run: pnpm run db:push");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error truncating votes table:", error);
        process.exit(1);
    }
}

truncateVotes();
