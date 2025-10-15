import { desc, eq } from "drizzle-orm";
import { db } from "../index";
import {
    type NewPitchAction,
    type PitchAction,
    pitchActions,
} from "../schema/pitch-actions";
import { users } from "../schema/users";
import { pitches } from "../schema/pitches";

/**
 * Create a new pitch action (admin review action)
 */
export async function createPitchAction(
    action: NewPitchAction,
): Promise<PitchAction> {
    const result = await db.insert(pitchActions).values(action).returning();
    return result[0];
}

/**
 * Get all actions for a specific pitch
 */
export async function getPitchActionsByPitchId(
    pitchId: string,
): Promise<PitchAction[]> {
    return await db
        .select()
        .from(pitchActions)
        .where(eq(pitchActions.pitchId, pitchId))
        .orderBy(desc(pitchActions.actionDate));
}

/**
 * Get all actions by a specific admin
 */
export async function getPitchActionsByAdminId(
    adminId: string,
): Promise<PitchAction[]> {
    return await db
        .select()
        .from(pitchActions)
        .where(eq(pitchActions.adminId, adminId))
        .orderBy(desc(pitchActions.actionDate));
}

/**
 * Get pitch actions with user and pitch details
 */
export async function getPitchActionsWithDetails(pitchId: string) {
    return await db
        .select({
            action: pitchActions,
            admin: {
                id: users.id,
                name: users.name,
                email: users.email,
            },
            pitch: {
                id: pitches.id,
                title: pitches.title,
                submissionId: pitches.submissionId,
            },
        })
        .from(pitchActions)
        .innerJoin(users, eq(pitchActions.adminId, users.id))
        .innerJoin(pitches, eq(pitchActions.pitchId, pitches.id))
        .where(eq(pitchActions.pitchId, pitchId))
        .orderBy(desc(pitchActions.actionDate));
}
