import { NextRequest, NextResponse } from "next/server";
import {
    assignStartupToPool,
    getPoolStartups,
    removeStartupFromPool,
} from "@/db/queries/pools";

/**
 * GET /api/admin/pools/[id]/startups
 * Get all startups in a pool
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const startups = await getPoolStartups(params.id);
        return NextResponse.json(startups);
    } catch (error) {
        console.error("Error fetching pool startups:", error);
        return NextResponse.json(
            { error: "Failed to fetch pool startups" },
            { status: 500 },
        );
    }
}

/**
 * POST /api/admin/pools/[id]/startups
 * Assign a startup to a pool
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const body = await request.json();
        const { pitchId } = body;

        if (!pitchId) {
            return NextResponse.json(
                { error: "Missing pitchId" },
                { status: 400 },
            );
        }

        await assignStartupToPool(params.id, pitchId);

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error("Error assigning startup to pool:", error);

        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(
            { error: "Failed to assign startup to pool" },
            { status: 500 },
        );
    }
}

/**
 * DELETE /api/admin/pools/[id]/startups
 * Remove a startup from a pool
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { searchParams } = new URL(request.url);
        const pitchId = searchParams.get("pitchId");

        if (!pitchId) {
            return NextResponse.json(
                { error: "Missing pitchId" },
                { status: 400 },
            );
        }

        await removeStartupFromPool(params.id, pitchId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing startup from pool:", error);
        return NextResponse.json(
            { error: "Failed to remove startup from pool" },
            { status: 500 },
        );
    }
}
