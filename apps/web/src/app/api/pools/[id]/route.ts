import { type NextRequest, NextResponse } from "next/server";
import {
    getPoolWithStartupsAndVotes,
    getUserVote,
    hasUserVoted,
} from "@/db/queries/pools";

/**
 * GET /api/pools/[id]
 * Get pool details with startups and vote counts
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const { id } = await params;
        const poolData = await getPoolWithStartupsAndVotes(id);

        if (!poolData) {
            return NextResponse.json({ error: "Pool not found" }, {
                status: 404,
            });
        }

        let userVoted = false;
        let userVote = null;

        if (userId) {
            userVoted = await hasUserVoted(id, userId);
            if (userVoted) {
                userVote = await getUserVote(id, userId);
            }
        }

        return NextResponse.json({
            ...poolData,
            userVoted,
            userVote,
        });
    } catch (error) {
        console.error("Error fetching pool:", error);
        return NextResponse.json(
            { error: "Failed to fetch pool" },
            { status: 500 },
        );
    }
}
