import { type NextRequest, NextResponse } from "next/server";
import {
    getContributionById,
    updateContributionStatus,
} from "@/db/queries/contributions";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const contribution = await getContributionById(params.id);

        if (!contribution) {
            return NextResponse.json(
                { error: "Contribution not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(contribution);
    } catch (error) {
        console.error("Error fetching contribution:", error);
        return NextResponse.json(
            { error: "Failed to fetch contribution" },
            { status: 500 },
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const body = await request.json();
        const { status, transactionHash } = body;

        // Validation
        if (!status || !["pending", "confirmed", "failed"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, {
                status: 400,
            });
        }

        const contribution = await updateContributionStatus(
            params.id,
            status,
            transactionHash,
        );

        if (!contribution) {
            return NextResponse.json(
                { error: "Contribution not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(contribution);
    } catch (error) {
        console.error("Error updating contribution:", error);
        return NextResponse.json(
            { error: "Failed to update contribution" },
            { status: 500 },
        );
    }
}
