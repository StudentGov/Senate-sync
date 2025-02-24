import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

/**
 * POST API to assign a default role ("student") if the user has no role.
 * Ensures new users receive a default role on their first login.
 */
export async function POST(req: Request) {
  try {
    // Parse the request body to extract userId and email
    const { userId, email } = await req.json();

    // Validate that userId and email are provided
    if (!userId || !email) {
      return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
    }

    // Step 1: Check if the user already has a role assigned
    // Fetch user metadata from Clerk using the userId
    const user = await clerkClient.users.getUser(userId); 
    const existingRole = user.publicMetadata?.role;

    // If a role already exists, return a message without reassigning
    if (existingRole) {
      return NextResponse.json({ message: `User already has role: ${existingRole}` });
    }

    // Step 2: Assign Default Role
    // If the user has no role, assign the default role "student"
    await clerkClient.users.updateUser(userId, { 
      publicMetadata: { role: "student" },
    });

    // Return a success message confirming the role assignment
    return NextResponse.json({ message: "Default role 'student' assigned successfully" });
  } catch (error) {
    // Error Handling
    console.error("Error assigning default role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
