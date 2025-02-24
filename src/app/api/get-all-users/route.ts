import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

/**
 * GET API to fetch a list of all users from Clerk.
 * This API retrieves user details including id, first name, last name, email, and role.
 * Intended for use in the Admin Dashboard to display user data.
 */
export async function GET() {
  try {
    // Fetch all users from Clerk
    const users = await clerkClient.users.getUserList();

    // Map user data for frontend display
    const userList = users.data.map((user) => ({
      id: user.id,
      firstName: user.firstName || "N/A",
      lastName: user.lastName || "N/A",
      email: user.emailAddresses[0]?.emailAddress,
      role: user.publicMetadata?.role || "No role",
    }));

    // Return the formatted user list as JSON response
    return NextResponse.json(userList);
  } catch (error) {
    // Error handling for failed user fetch operation
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
