import { NextResponse } from "next/server";
import { getPitchesWithUserDetails } from "@/db/queries/pitches";

/**
 * GET /api/admin/pitches
 * Fetch all pitches with user details
 */
export async function GET() {
    try {
        // TODO: Validate admin access
        // const adminId = getAdminIdFromRequest(request);
        // if (!adminId) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }
        // await requireAdmin(adminId);

        const pitches = await getPitchesWithUserDetails();

        return NextResponse.json({ pitches });
    } catch (error) {
        console.error("[Admin API] Error fetching pitches:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error
                    ? error.message
                    : "Unknown error",
            },
            { status: 500 },
        );
    }
}
