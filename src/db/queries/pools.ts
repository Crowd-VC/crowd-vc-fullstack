import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../index";
import { pitches, pools, poolStartups, users, votes } from "../schema";
import type { NewPool, Pool, Vote } from "../types";

/**
 * Get all pools
 */
export async function getAllPools() {
    return await db.select().from(pools).orderBy(desc(pools.createdAt));
}

/**
 * Get pool by ID
 */
export async function getPoolById(poolId: string) {
    const result = await db.select().from(pools).where(eq(pools.id, poolId));
    return result[0];
}

/**
 * Create a new pool
 */
export async function createPool(pool: NewPool) {
    const result = await db.insert(pools).values(pool).returning();
    return result[0];
}

/**
 * Update pool status
 */
export async function updatePoolStatus(
    poolId: string,
    status: "active" | "closed" | "upcoming",
) {
    const result = await db
        .update(pools)
        .set({ status, updatedAt: new Date() })
        .where(eq(pools.id, poolId))
        .returning();
    return result[0];
}

export async function updatePoolCurrentFunding(poolId: string, amount: number) {
    const result = await db
        .update(pools)
        .set({ currentFunding: sql`${pools.currentFunding} + ${amount}` })
        .where(eq(pools.id, poolId))
        .returning();
    return result;
}

/**
 * Get startups in a pool with pitch details
 */
export async function getPoolStartups(poolId: string) {
    return await db
        .select({
            pitch: pitches,
            user: {
                id: users.id,
                email: users.email,
                name: users.name,
                walletAddress: users.walletAddress,
            },
            assignedAt: poolStartups.assignedAt,
        })
        .from(poolStartups)
        .innerJoin(pitches, eq(poolStartups.pitchId, pitches.id))
        .innerJoin(users, eq(pitches.userId, users.id))
        .where(eq(poolStartups.poolId, poolId))
        .orderBy(desc(poolStartups.assignedAt));
}

/**
 * Assign a startup to a pool
 */
export async function assignStartupToPool(poolId: string, pitchId: string) {
    // Check if already assigned
    const existing = await db
        .select()
        .from(poolStartups)
        .where(
            and(
                eq(poolStartups.poolId, poolId),
                eq(poolStartups.pitchId, pitchId),
            ),
        );

    if (existing.length > 0) {
        throw new Error("Startup is already assigned to this pool");
    }

    // Assign startup
    const result = await db
        .insert(poolStartups)
        .values({ poolId, pitchId })
        .returning();

    // Update pitch status to 'in-pool'
    await db
        .update(pitches)
        .set({ status: "in-pool", lastUpdated: new Date() })
        .where(eq(pitches.id, pitchId));

    return result[0];
}

/**
 * Remove a startup from a pool
 */
export async function removeStartupFromPool(poolId: string, pitchId: string) {
    await db
        .delete(poolStartups)
        .where(
            and(
                eq(poolStartups.poolId, poolId),
                eq(poolStartups.pitchId, pitchId),
            ),
        );

    // Update pitch status back to 'approved'
    await db
        .update(pitches)
        .set({ status: "approved", lastUpdated: new Date() })
        .where(eq(pitches.id, pitchId));
}

/**
 * Cast a vote for a startup in a pool
 */
export async function castVote(
    voteId: string,
    poolId: string,
    pitchId: string,
    userId: string,
    walletAddress: string,
) {
    // Check if wallet already voted in this pool
    const existingVote = await db
        .select()
        .from(votes)
        .where(
            and(
                eq(votes.poolId, poolId),
                eq(votes.walletAddress, walletAddress),
            ),
        );

    if (existingVote.length > 0) {
        throw new Error("This wallet has already voted in this pool");
    }

    // Check if pool is active
    const pool = await getPoolById(poolId);
    if (!pool) {
        throw new Error("Pool not found");
    }

    if (pool.status !== "active") {
        throw new Error("This pool is not accepting votes");
    }

    // Check if deadline has passed
    if (new Date() > new Date(pool.votingDeadline)) {
        throw new Error("Voting deadline has passed");
    }

    // Check if startup is in this pool
    const startupInPool = await db
        .select()
        .from(poolStartups)
        .where(
            and(
                eq(poolStartups.poolId, poolId),
                eq(poolStartups.pitchId, pitchId),
            ),
        );

    if (startupInPool.length === 0) {
        throw new Error("This startup is not in this pool");
    }

    // Cast vote
    const result = await db
        .insert(votes)
        .values({ id: voteId, poolId, pitchId, userId, walletAddress })
        .returning();

    return result[0];
}

/**
 * Get vote counts for all startups in a pool
 */
export async function getPoolVoteCounts(poolId: string) {
    return await db
        .select({
            pitchId: votes.pitchId,
            voteCount: sql<number>`count(*)::int`,
        })
        .from(votes)
        .where(eq(votes.poolId, poolId))
        .groupBy(votes.pitchId);
}

/**
 * Check if wallet has voted in a pool
 */
export async function hasWalletVoted(poolId: string, walletAddress: string) {
    const result = await db
        .select()
        .from(votes)
        .where(
            and(
                eq(votes.poolId, poolId),
                eq(votes.walletAddress, walletAddress),
            ),
        );

    return result.length > 0;
}

/**
 * Get wallet's vote in a pool
 */
export async function getWalletVote(poolId: string, walletAddress: string) {
    const result = await db
        .select()
        .from(votes)
        .where(
            and(
                eq(votes.poolId, poolId),
                eq(votes.walletAddress, walletAddress),
            ),
        );

    return result[0];
}

/**
 * Check if user has voted in a pool (legacy - kept for backwards compatibility)
 */
export async function hasUserVoted(poolId: string, userId: string) {
    const result = await db
        .select()
        .from(votes)
        .where(and(eq(votes.poolId, poolId), eq(votes.userId, userId)));

    return result.length > 0;
}

/**
 * Get user's vote in a pool (legacy - kept for backwards compatibility)
 */
export async function getUserVote(poolId: string, userId: string) {
    const result = await db
        .select()
        .from(votes)
        .where(and(eq(votes.poolId, poolId), eq(votes.userId, userId)));

    return result[0];
}

/**
 * Get pool with startups and vote counts
 */
export async function getPoolWithStartupsAndVotes(poolId: string) {
    const pool = await getPoolById(poolId);
    if (!pool) return null;

    const startups = await getPoolStartups(poolId);
    const voteCounts = await getPoolVoteCounts(poolId);

    // Merge vote counts with startups
    const startupsWithVotes = startups.map((startup) => {
        const voteCount = voteCounts.find((vc) =>
            vc.pitchId === startup.pitch.id
        )?.voteCount || 0;
        return {
            ...startup,
            voteCount,
        };
    });

    return {
        pool,
        startups: startupsWithVotes,
    };
}

/**
 * Get all active pools with their startup counts
 */
export async function getActivePoolsWithCounts() {
    const activePools = await db
        .select()
        .from(pools)
        .where(eq(pools.status, "active"))
        .orderBy(desc(pools.createdAt));

    const poolsWithCounts = await Promise.all(
        activePools.map(async (pool) => {
            const startups = await db
                .select()
                .from(poolStartups)
                .where(eq(poolStartups.poolId, pool.id));

            const totalVotes = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(votes)
                .where(eq(votes.poolId, pool.id));

            return {
                ...pool,
                startupCount: startups.length,
                voteCount: totalVotes[0]?.count || 0,
            };
        }),
    );

    return poolsWithCounts;
}
