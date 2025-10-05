import { eq, and } from 'drizzle-orm';
import { db } from '../index';
import { users, type NewUser, type User } from '../schema/users';

/**
 * Get a user by ID
 */
export async function getUserById(id: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0];
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0];
}

/**
 * Get a user by wallet address
 */
export async function getUserByWallet(
  walletAddress: string,
): Promise<User | undefined> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.walletAddress, walletAddress));
  return result[0];
}

/**
 * Create a new user
 */
export async function createUser(user: NewUser): Promise<User> {
  const result = await db.insert(users).values(user).returning();
  return result[0];
}

/**
 * Update a user
 */
export async function updateUser(
  id: string,
  data: Partial<NewUser>,
): Promise<User | undefined> {
  const result = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id));
}

/**
 * Get all users by type
 */
export async function getUsersByType(
  userType: 'startup' | 'investor' | 'admin',
): Promise<User[]> {
  return await db.select().from(users).where(eq(users.userType, userType));
}
