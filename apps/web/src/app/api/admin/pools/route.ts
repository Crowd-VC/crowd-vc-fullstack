import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createPool, getAllPools } from '@/db/queries/pools';

/**
 * GET /api/admin/pools
 * Fetch all pools
 */
export async function GET() {
  try {
    const pools = await getAllPools();
    return NextResponse.json(pools);
  } catch (error) {
    console.error('Error fetching pools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pools' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/pools
 * Create a new pool with smart contract integration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      category,
      votingDeadline,
      status,
      fundingGoal,
      minContribution,
      maxContribution,
      contractAddress,
      fundingDuration,
      acceptedToken,
    } = body;

    // Validation for required fields
    if (!name || !description || !category || !votingDeadline) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: name, description, category, votingDeadline',
        },
        { status: 400 },
      );
    }

    // Contract address is required for on-chain pools
    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Contract address is required for pool creation' },
        { status: 400 },
      );
    }

    // Use provided ID or generate one
    const poolId = id || nanoid();

    const newPool = await createPool({
      id: poolId,
      name,
      description,
      category,
      votingDeadline: new Date(votingDeadline),
      status: status || 'upcoming',
      fundingGoal: fundingGoal || 0,
      minContribution: minContribution || 1000,
      maxContribution: maxContribution || null,
      contractAddress,
      fundingDuration: fundingDuration || null,
      acceptedToken: acceptedToken || null,
    });

    return NextResponse.json(newPool, { status: 201 });
  } catch (error) {
    console.error('Error creating pool:', error);
    return NextResponse.json(
      { error: 'Failed to create pool' },
      { status: 500 },
    );
  }
}
