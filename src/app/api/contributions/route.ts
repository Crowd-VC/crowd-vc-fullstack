import { type NextRequest, NextResponse } from "next/server";
import {
    createContribution,
    getContributionsByPoolId,
    getContributionsByUserId,
} from "@/db/queries/contributions";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            poolId,
            userId,
            walletAddress,
            amount,
            platformFee,
            gasFee,
            transactionHash,
        } = body;

        // Validation
        if (!poolId || !userId || !walletAddress || !amount) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        if (amount < 0) {
            return NextResponse.json(
                { error: "Amount must be positive" },
                { status: 400 },
            );
        }

        // Create contribution
        const contribution = await createContribution({
            id: nanoid(),
            poolId,
            userId,
            walletAddress,
            amount,
            platformFee: 5,
            // gasFee: gasFee || 0,
            gasFee: gasFee || 0,
            status: "confirmed",
            transactionHash: transactionHash || null,
        });

        // Note: Pool funding is already updated in createContribution, no need to update again

        return NextResponse.json(contribution, { status: 201 });
    } catch (error) {
        console.error("Error creating contribution:", error);
        return NextResponse.json(
            { error: "Failed to create contribution" },
            { status: 500 },
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const poolId = searchParams.get("poolId");
        const userId = searchParams.get("userId");

        if (poolId) {
            const contributions = await getContributionsByPoolId(poolId);
            return NextResponse.json(contributions);
        }

        if (userId) {
            const contributions = await getContributionsByUserId(userId);
            return NextResponse.json(contributions);
        }

        return NextResponse.json(
            { error: "poolId or userId required" },
            { status: 400 },
        );
    } catch (error) {
        console.error("Error fetching contributions:", error);
        return NextResponse.json(
            { error: "Failed to fetch contributions" },
            { status: 500 },
        );
    }
}
