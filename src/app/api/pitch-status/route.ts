import { type NextRequest, NextResponse } from "next/server";
import { getPitchWithUserDetails } from "@/db/queries/pitches";
import { sendPitchStatusEmail } from "@/lib/services/email-service";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { pitchId, status, reason, customNotes } = body;

        // Validate request body
        if (!pitchId || !status) {
            return NextResponse.json(
                { error: "Missing required fields: pitchId and status" },
                { status: 400 },
            );
        }

        if (status !== "approved" && status !== "rejected") {
            return NextResponse.json(
                { error: 'Status must be either "approved" or "rejected"' },
                { status: 400 },
            );
        }

        // Fetch pitch and user details
        const pitchWithUser = await getPitchWithUserDetails(pitchId);

        if (!pitchWithUser) {
            return NextResponse.json(
                { error: "Pitch not found" },
                { status: 404 },
            );
        }

        const startupName = pitchWithUser.user.name || "Startup Team";
        const submissionId = pitchWithUser.submissionId || pitchId;

        // Send email notification
        const emailResult = await sendPitchStatusEmail({
            to: pitchWithUser.user.email,
            startupName,
            pitchTitle: pitchWithUser.title,
            status,
            reason,
            customNotes,
            submissionId,
        });

        if (!emailResult.success) {
            return NextResponse.json(
                {
                    error: "Failed to send email",
                    details: emailResult.error,
                },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            messageId: emailResult.messageId,
            message: "Email sent successfully",
        });
    } catch (error) {
        console.error("[Pitch Status API] Error:", error);
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
