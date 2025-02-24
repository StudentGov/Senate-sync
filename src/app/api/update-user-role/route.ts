import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

/**
 * POST API to manually assign a role to a user.
 * This API is intended for administrative actions to modify user roles.
 */
export async function POST(req: Request) {
  try {
    // Parse the request body to extract userId and role
    const { userId, role } = await req.json();

    // Validate that both userId and role are provided
    if (!userId || !role) {
      return NextResponse.json({ error: "Missing userId or role" }, { status: 400 });
    }

    // Update the user's public metadata with the specified role
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role },
    });

    // Return a success message confirming the role assignment
    return NextResponse.json({ message: `Role '${role}' assigned successfully` });
  } catch (error) {
    // Error Handling
    console.error("Error assigning role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
