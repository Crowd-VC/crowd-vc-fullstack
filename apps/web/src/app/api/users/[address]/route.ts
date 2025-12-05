import { type NextRequest, NextResponse } from "next/server";
import { createUser, getUserByWallet, updateUser } from "@/db/queries/users";
import type { NewUser } from "@/db/schema/users";

/**
 * GET /api/users/[address]
 * Get user by wallet address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: "Wallet address is required",
        },
        { status: 400 },
      );
    }

    const user = await getUserByWallet(address);

    if (!user) {
      return NextResponse.json(
        {
          success: true,
          data: null,
          message: "User not found",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[API] Error fetching user:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/users/[address]
 * Update or create user by wallet address
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  try {
    const { address } = await params;
    const body = await request.json();

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: "Wallet address is required",
        },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUser = await getUserByWallet(address);

    if (existingUser) {
      // Update existing user
      const updatedUser = await updateUser(existingUser.id, {
        name: body.name,
        email: body.email,
      });

      return NextResponse.json(
        {
          success: true,
          data: updatedUser,
          message: "Profile updated successfully",
        },
        { status: 200 },
      );
    }
    // Create new user
    if (!body.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is required for new users",
        },
        { status: 400 },
      );
    }

    const newUser: NewUser = {
      id: address,
      email: body.email,
      walletAddress: address,
      name: body.name || null,
      userType: body.userType || "startup",
    };

    const createdUser = await createUser(newUser);

    return NextResponse.json(
      {
        success: true,
        data: createdUser,
        message: "Profile created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[API] Error updating user:", error);

    // Check for unique constraint violation (duplicate email)
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is already in use",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile",
      },
      { status: 500 },
    );
  }
}
