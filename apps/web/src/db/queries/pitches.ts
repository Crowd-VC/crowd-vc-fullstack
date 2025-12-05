import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../index";
import { type NewPitch, type Pitch, pitches } from "../schema/pitches";
import { type User, users } from "../schema/users";

/**
 * Get a pitch by ID
 */
export async function getPitchById(id: string): Promise<Pitch | undefined> {
  const result = await db.select().from(pitches).where(eq(pitches.id, id));
  return result[0];
}

/**
 * Get a pitch by submission ID
 */
export async function getPitchBySubmissionId(
  submissionId: string,
): Promise<Pitch | undefined> {
  const result = await db
    .select()
    .from(pitches)
    .where(eq(pitches.submissionId, submissionId));
  return result[0];
}

/**
 * Get all pitches by user ID
 */
export async function getPitchesByUserId(
  walletAddress: string,
): Promise<Pitch[]> {
  return await db
    .select()
    .from(pitches)
    .where(eq(pitches.userId, walletAddress))
    .orderBy(desc(pitches.dateSubmitted));
}

/**
 * Get all pitches with optional status filter
 */
export async function getAllPitches(
  status?: Pitch["status"],
): Promise<Pitch[]> {
  if (status) {
    return await db
      .select()
      .from(pitches)
      .where(eq(pitches.status, status))
      .orderBy(desc(pitches.dateSubmitted));
  }
  return await db.select().from(pitches).orderBy(desc(pitches.dateSubmitted));
}

/**
 * Get featured pitches
 */
export async function getFeaturedPitches(): Promise<Pitch[]> {
  return await db
    .select()
    .from(pitches)
    .where(eq(pitches.featured, true))
    .orderBy(desc(pitches.dateSubmitted));
}

/**
 * Create a new pitch
 */
export async function createPitch(pitch: NewPitch): Promise<Pitch> {
  const result = await db.insert(pitches).values(pitch).returning();
  return result[0];
}

/**
 * Update a pitch
 */
export async function updatePitch(
  id: string,
  data: Partial<NewPitch>,
): Promise<Pitch | undefined> {
  const result = await db
    .update(pitches)
    .set({ ...data, lastUpdated: new Date() })
    .where(eq(pitches.id, id))
    .returning();
  return result[0];
}

/**
 * Update pitch status
 */
export async function updatePitchStatus(
  id: string,
  status: Pitch["status"],
  reviewNotes?: string,
): Promise<Pitch | undefined> {
  const result = await db
    .update(pitches)
    .set({
      status,
      reviewNotes,
      lastUpdated: new Date(),
    })
    .where(eq(pitches.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a pitch
 */
export async function deletePitch(id: string): Promise<void> {
  await db.delete(pitches).where(eq(pitches.id, id));
}

/**
 * Get pitches by industry
 */
export async function getPitchesByIndustry(industry: string): Promise<Pitch[]> {
  return await db
    .select()
    .from(pitches)
    .where(eq(pitches.industry, industry))
    .orderBy(desc(pitches.dateSubmitted));
}

/**
 * Get pitches by company stage
 */
export async function getPitchesByStage(stage: string): Promise<Pitch[]> {
  return await db
    .select()
    .from(pitches)
    .where(eq(pitches.companyStage, stage))
    .orderBy(desc(pitches.dateSubmitted));
}

/**
 * Pitch with user details type
 */
export type PitchWithUser = Pitch & {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

/**
 * Get all pitches with user details
 */
export async function getPitchesWithUserDetails(): Promise<PitchWithUser[]> {
  const results = await db
    .select({
      pitch: pitches,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(pitches)
    .innerJoin(users, eq(pitches.userId, users.id))
    .orderBy(desc(pitches.dateSubmitted));

  return results.map((result) => ({
    ...result.pitch,
    user: result.user,
  }));
}

/**
 * Get a single pitch with user details
 */
export async function getPitchWithUserDetails(
  id: string,
): Promise<PitchWithUser | undefined> {
  const results = await db
    .select({
      pitch: pitches,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(pitches)
    .innerJoin(users, eq(pitches.userId, users.id))
    .where(eq(pitches.id, id));

  if (results.length === 0) return undefined;

  return {
    ...results[0].pitch,
    user: results[0].user,
  };
}
