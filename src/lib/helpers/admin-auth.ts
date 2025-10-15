import { getUserById } from "@/db/queries/users";

/**
 * Check if a user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
    try {
        const user = await getUserById(userId);
        return user?.userType === "admin";
    } catch (error) {
        console.error("[Admin Auth] Error checking admin status:", error);
        return false;
    }
}

/**
 * Require admin access - throws error if user is not admin
 */
export async function requireAdmin(userId: string): Promise<void> {
    const adminStatus = await isAdmin(userId);
    if (!adminStatus) {
        throw new Error("Unauthorized: Admin access required");
    }
}

/**
 * Validate admin from request headers or session
 * This is a placeholder - implement based on your auth system
 */
export function getAdminIdFromRequest(request: Request): string | null {
    // TODO: Implement based on your authentication system
    // This could check JWT tokens, session cookies, etc.
    // For now, returning null as a placeholder

    // Example implementation:
    // const session = await getSession(request);
    // return session?.user?.id || null;

    return null;
}
