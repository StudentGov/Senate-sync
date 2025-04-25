import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

/**
 * GET API to fetch a list of all users from Clerk with pagination support.
 * Fetches all users in batches of 100 (Clerk's max limit).
 */
export async function GET() {
  try {
    const allUsers = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await clerkClient.users.getUserList({ limit, offset });
      allUsers.push(...response.data);

      if (response.data.length < limit) {
        break; // No more users to fetch
      }

      offset += limit;
    }

    // Format the user data for the frontend
    const userList = allUsers.map((user) => ({
      id: user.id,
      firstName: user.firstName || "N/A",
      lastName: user.lastName || "N/A",
      email: user.emailAddresses[0]?.emailAddress,
      role: user.publicMetadata?.role || "No role",
    }));

    return NextResponse.json(userList);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
