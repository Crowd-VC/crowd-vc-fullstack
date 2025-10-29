import { db } from "..";
import {
    type Contribution,
    contributions,
    type NewContribution,
} from "../schema/contributions";
import { pools } from "../schema/pools";
import { and, desc, eq, sql } from "drizzle-orm";

/**
 * Create a new contribution
 */
export async function createContribution(
    contribution: NewContribution,
): Promise<Contribution> {
    const result = await db
        .insert(contributions)
        .values(contribution)
        .returning();

    // Update pool current funding
    if (contribution.status === "confirmed") {
        await db
            .update(pools)
            .set({
                currentFunding:
                    sql`${pools.currentFunding} + ${contribution.amount}`,
            })
            .where(eq(pools.id, contribution.poolId));
    }

    return result[0];
}

/**
 * Get all contributions for a pool
 */
export async function getContributionsByPoolId(
    poolId: string,
): Promise<Contribution[]> {
    return db
        .select()
        .from(contributions)
        .where(eq(contributions.poolId, poolId))
        .orderBy(desc(contributions.contributedAt));
}

/**
 * Get all contributions by a user
 */
export async function getContributionsByUserId(
    userId: string,
): Promise<Contribution[]> {
    return db
        .select()
        .from(contributions)
        .where(eq(contributions.userId, userId))
        .orderBy(desc(contributions.contributedAt));
}

/**
 * Get user's contribution in a specific pool
 */
export async function getUserContributionInPool(
    poolId: string,
    userId: string,
): Promise<Contribution | undefined> {
    const result = await db
        .select()
        .from(contributions)
        .where(
            and(
                eq(contributions.poolId, poolId),
                eq(contributions.userId, userId),
                eq(contributions.status, "confirmed"),
            ),
        )
        .orderBy(desc(contributions.contributedAt))
        .limit(1);

    return result[0];
}

/**
 * Get total contributions for a pool (only confirmed)
 */
export async function getPoolTotalContributions(poolId: string): Promise<{
    total: number;
    count: number;
}> {
    const result = await db
        .select({
            total: sql<number>`COALESCE(SUM(${contributions.amount}), 0)::int`,
            count: sql<number>`COUNT(*)::int`,
        })
        .from(contributions)
        .where(
            and(
                eq(contributions.poolId, poolId),
                eq(contributions.status, "confirmed"),
            ),
        );

    return {
        total: result[0]?.total || 0,
        count: result[0]?.count || 0,
    };
}

/**
 * Get all contributions for a pool with user details
 */
export async function getPoolContributionsWithUsers(poolId: string) {
    return db
        .select({
            contribution: contributions,
            user: {
                id: sql`users.id`,
                name: sql`users.name`,
                email: sql`users.email`,
            },
        })
        .from(contributions)
        .leftJoin(sql`users`, sql`contributions.user_id = users.id`)
        .where(eq(contributions.poolId, poolId))
        .orderBy(desc(contributions.contributedAt));
}

/**
 * Update contribution status
 */
export async function updateContributionStatus(
    contributionId: string,
    status: "pending" | "confirmed" | "failed",
    transactionHash?: string,
): Promise<Contribution> {
    const updateData: Partial<NewContribution> = {
        status,
        updatedAt: new Date(),
    };

    if (transactionHash) {
        updateData.transactionHash = transactionHash;
    }

    const result = await db
        .update(contributions)
        .set(updateData)
        .where(eq(contributions.id, contributionId))
        .returning();

    // If status changed to confirmed, update pool funding
    if (status === "confirmed" && result[0]) {
        await db
            .update(pools)
            .set({
                currentFunding: sql`${pools.currentFunding} + ${
                    result[0].amount
                }`,
            })
            .where(eq(pools.id, result[0].poolId));
    }

    return result[0];
}

/**
 * Get contribution by ID
 */
export async function getContributionById(
    contributionId: string,
): Promise<Contribution | undefined> {
    const result = await db
        .select()
        .from(contributions)
        .where(eq(contributions.id, contributionId))
        .limit(1);

    return result[0];
}

/**
 * Get user's total contributions across all pools
 */
export async function getUserTotalContributions(userId: string): Promise<{
    total: number;
    count: number;
}> {
    const result = await db
        .select({
            total: sql<number>`COALESCE(SUM(${contributions.amount}), 0)::int`,
            count: sql<number>`COUNT(*)::int`,
        })
        .from(contributions)
        .where(
            and(
                eq(contributions.userId, userId),
                eq(contributions.status, "confirmed"),
            ),
        );

    return {
        total: result[0]?.total || 0,
        count: result[0]?.count || 0,
    };
}
