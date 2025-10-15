import { type NextRequest, NextResponse } from "next/server";
import {
    getPitchWithUserDetails,
    updatePitchStatus,
} from "@/db/queries/pitches";
import { createPitchAction } from "@/db/queries/pitch-actions";
import { sendPitchStatusEmail } from "@/lib/services/email-service";
import { v4 as uuidv4 } from "uuid";

interface RouteParams {
    params: {
        id: string;
    };
}

/**
 * GET /api/admin/pitches/[id]
 * Fetch pitch by ID with user details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = params;

        // TODO: Validate admin access
        // const adminId = getAdminIdFromRequest(request);
        // if (!adminId) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }
        // await requireAdmin(adminId);

        const pitch = await getPitchWithUserDetails(id);

        if (!pitch) {
            return NextResponse.json({ error: "Pitch not found" }, {
                status: 404,
            });
        }

        return NextResponse.json({ pitch });
    } catch (error) {
        console.error("[Admin API] Error fetching pitch:", error);
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

/**
 * PATCH /api/admin/pitches/[id]
 * Update pitch status (approve/reject)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, reason, customNotes, adminId } = body;

        // Validate request body
        if (!status || !adminId) {
            return NextResponse.json(
                { error: "Missing required fields: status and adminId" },
                { status: 400 },
            );
        }

        if (status !== "approved" && status !== "rejected") {
            return NextResponse.json(
                { error: 'Status must be either "approved" or "rejected"' },
                { status: 400 },
            );
        }

        // TODO: Validate admin access
        // await requireAdmin(adminId);

        // Fetch pitch with user details
        const pitch = await getPitchWithUserDetails(id);
        if (!pitch) {
            return NextResponse.json({ error: "Pitch not found" }, {
                status: 404,
            });
        }

        // Update pitch status
        const updatedPitch = await updatePitchStatus(id, status, customNotes);

        if (!updatedPitch) {
            return NextResponse.json(
                { error: "Failed to update pitch status" },
                { status: 500 },
            );
        }

        // Create pitch action record
        const actionId = uuidv4();
        await createPitchAction({
            id: actionId,
            pitchId: id,
            adminId,
            action: status,
            reason: reason || null,
            customNotes: customNotes || null,
        });

        // Send email notification
        const startupName = pitch.user.name || "Startup Team";
        const submissionId = pitch.submissionId || id;

        const emailResult = await sendPitchStatusEmail({
            to: pitch.user.email,
            startupName,
            pitchTitle: pitch.title,
            status,
            reason,
            customNotes,
            submissionId,
        });

        if (!emailResult.success) {
            console.error(
                "[Admin API] Failed to send email:",
                emailResult.error,
            );
            // Don't fail the request if email fails, just log it
        }

        return NextResponse.json({
            success: true,
            pitch: updatedPitch,
            emailSent: emailResult.success,
        });
    } catch (error) {
        console.error("[Admin API] Error updating pitch status:", error);
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
