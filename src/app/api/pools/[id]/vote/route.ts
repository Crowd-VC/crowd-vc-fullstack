import { type NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { castVote } from "@/db/queries/pools";

/**
 * POST /api/pools/[id]/vote
 * Cast a vote for a startup in a pool
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const body = await request.json();
        const { pitchId, userId } = body;
        const { id } = await params;

        if (!pitchId || !userId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        const voteId = nanoid();
        const vote = await castVote(voteId, id, pitchId, userId);

        return NextResponse.json(vote, { status: 201 });
    } catch (error) {
        console.error("Error casting vote:", error);

        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(
            { error: "Failed to cast vote" },
            { status: 500 },
        );
    }
}
