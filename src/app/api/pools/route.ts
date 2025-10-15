import { NextResponse } from "next/server";
import { getActivePoolsWithCounts } from "@/db/queries/pools";

/**
 * GET /api/pools
 * Fetch all active pools for investors
 */
export async function GET() {
    try {
        const pools = await getActivePoolsWithCounts();
        return NextResponse.json(pools);
    } catch (error) {
        console.error("Error fetching pools:", error);
        return NextResponse.json(
            { error: "Failed to fetch pools" },
            { status: 500 },
        );
    }
}
