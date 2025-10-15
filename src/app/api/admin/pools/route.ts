import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createPool, getAllPools } from "@/db/queries/pools";

/**
 * GET /api/admin/pools
 * Fetch all pools
 */
export async function GET() {
    try {
        const pools = await getAllPools();
        return NextResponse.json(pools);
    } catch (error) {
        console.error("Error fetching pools:", error);
        return NextResponse.json(
            { error: "Failed to fetch pools" },
            { status: 500 },
        );
    }
}

/**
 * POST /api/admin/pools
 * Create a new pool
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, category, votingDeadline, status } = body;

        // Validation
        if (!name || !description || !category || !votingDeadline) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        const poolId = nanoid();
        const newPool = await createPool({
            id: poolId,
            name,
            description,
            category,
            votingDeadline: new Date(votingDeadline),
            status: status || "upcoming",
        });

        return NextResponse.json(newPool, { status: 201 });
    } catch (error) {
        console.error("Error creating pool:", error);
        return NextResponse.json(
            { error: "Failed to create pool" },
            { status: 500 },
        );
    }
}
