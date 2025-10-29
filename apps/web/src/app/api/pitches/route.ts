import { type NextRequest, NextResponse } from "next/server";
import { createPitch } from "@/db/queries/pitches";
import type { NewPitch } from "@/db/schema/pitches";

/**
 * POST /api/pitches
 * Create a new pitch submission
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // TODO: Get actual user ID from session/auth
        // For now, using a placeholder user ID
        const userId = body.userId || "user_2";

        // Generate unique IDs
        const pitchId = `pitch_${Date.now()}_${
            Math.random().toString(36).substr(2, 9)
        }`;
        const submissionId = `PITCH-${Date.now().toString().slice(-6)}-${
            Math.random().toString(36).substr(2, 4).toUpperCase()
        }`;

        // Calculate funding goal
        const fundingGoal = body.fundingGoal === "custom"
            ? Number(body.customAmount || 0)
            : Number(body.fundingGoal || 0);

        // Prepare pitch data
        const pitchData: NewPitch = {
            id: pitchId,
            userId,
            submissionId,

            // Core details
            title: body.title,
            summary: body.summary,
            elevatorPitch: body.elevatorPitch,

            // Status
            status: "pending",
            reviewTimeline: "3-5 business days",

            // Company details
            industry: body.industry,
            companyStage: body.companyStage,
            teamSize: body.teamSize,
            location: body.location,
            website: body.website || null,
            oneKeyMetric: body.oneKeyMetric,

            // Funding information
            fundingGoal,
            customAmount: body.customAmount || null,
            productDevelopment: body.productDevelopment || null,
            marketingSales: body.marketingSales || null,
            teamExpansion: body.teamExpansion || null,
            operations: body.operations || null,
            timeToRaise: body.timeToRaise || null,
            expectedROI: body.expectedROI || null,

            // Media URLs (these would be actual upload URLs in production)
            pitchDeckUrl: body.pitchDeckUrl || null,
            pitchVideoUrl: body.pitchVideoUrl || null,
            demoUrl: body.demoUrl || null,
            prototypeUrl: body.prototypeUrl || null,
        };

        // Insert pitch into database
        const newPitch = await createPitch(pitchData);

        return NextResponse.json(
            {
                success: true,
                data: newPitch,
                message: "Pitch submitted successfully",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("[API] Error creating pitch:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to submit pitch",
                message: error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
            },
            { status: 500 },
        );
    }
}

/**
 * GET /api/pitches
 * Get all pitches (optionally filtered by status)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") as
            | "pending"
            | "approved"
            | "rejected"
            | "in-pool"
            | "under-review"
            | "shortlisted"
            | "needs-more-info"
            | null;

        // Import here to avoid circular dependencies
        const { getAllPitches } = await import("@/db/queries/pitches");
        const pitches = await getAllPitches(status || undefined);

        return NextResponse.json(
            {
                success: true,
                data: pitches,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("[API] Error fetching pitches:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch pitches",
            },
            { status: 500 },
        );
    }
}
