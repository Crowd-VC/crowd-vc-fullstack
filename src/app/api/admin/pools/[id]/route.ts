import { NextRequest, NextResponse } from "next/server";
import { getPoolById, updatePoolStatus } from "@/db/queries/pools";

/**
 * GET /api/admin/pools/[id]
 * Get a specific pool
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const pool = await getPoolById(params.id);

        if (!pool) {
            return NextResponse.json({ error: "Pool not found" }, {
                status: 404,
            });
        }

        return NextResponse.json(pool);
    } catch (error) {
        console.error("Error fetching pool:", error);
        return NextResponse.json(
            { error: "Failed to fetch pool" },
            { status: 500 },
        );
    }
}

/**
 * PATCH /api/admin/pools/[id]
 * Update pool status
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const body = await request.json();
        const { status } = body;

        if (!status || !["active", "closed", "upcoming"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, {
                status: 400,
            });
        }

        const updatedPool = await updatePoolStatus(params.id, status);

        if (!updatedPool) {
            return NextResponse.json({ error: "Pool not found" }, {
                status: 404,
            });
        }

        return NextResponse.json(updatedPool);
    } catch (error) {
        console.error("Error updating pool:", error);
        return NextResponse.json(
            { error: "Failed to update pool" },
            { status: 500 },
        );
    }
}
