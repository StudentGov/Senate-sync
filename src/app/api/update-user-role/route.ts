import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";
import { turso } from "@/db";

/**
 * POST API to manually assign a role to a user.
 * This API is intended for administrative actions to modify user roles.
 * Updates both Clerk and the database Users table.
 */
export async function POST(req: Request) {
  try {
    // Parse the request body to extract userId and role
    const { userId, role } = await req.json();

    // Validate that both userId and role are provided
    if (!userId || !role) {
      return NextResponse.json({ error: "Missing userId or role" }, { status: 400 });
    }

    // Update the user's public metadata with the specified role in Clerk
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role },
    });

    // Update the user's role in the database
    const result = await turso.execute({
      sql: "UPDATE Users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [role, userId],
    });

    // If user doesn't exist in database, create them
    if (result.rowsAffected === 0) {
      console.log(`User ${userId} not found in database, creating new record`);
      
      // Fetch user details from Clerk to get email/username
      const user = await clerkClient.users.getUser(userId);
      const email = user.emailAddresses[0]?.emailAddress || "";
      const username = email.split("@")[0] || userId;

      await turso.execute({
        sql: `INSERT INTO Users (id, username, role, created_at, updated_at) 
              VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        args: [userId, username, role],
      });
      console.log(`User ${userId} created in database with role: ${role}`);
    } else {
      console.log(`User ${userId} role updated in database to: ${role}`);
    }

    // Return a success message confirming the role assignment
    return NextResponse.json({ message: `Role '${role}' assigned successfully` });
  } catch (error) {
    // Error Handling
    console.error("Error assigning role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
