import { type NextRequest, NextResponse } from "next/server";
import { getPitchesByUserId } from "@/db/queries/pitches";

/**
 * GET /api/pitches/user/[address]
 * Get all pitches for a specific user by wallet address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: "Wallet address is required",
        },
        { status: 400 }
      );
    }

    const pitches = await getPitchesByUserId(address);

    return NextResponse.json(
      {
        success: true,
        data: pitches,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error fetching user pitches:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch pitches",
      },
      { status: 500 }
    );
  }
}
