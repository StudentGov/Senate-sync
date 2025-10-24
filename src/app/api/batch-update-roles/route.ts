import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";
import { turso } from "@/db";
import { auth } from "@clerk/nextjs/server";

/**
 * POST API to batch update multiple user roles.
 * Only admins can update user roles.
 * Updates both Clerk and the database Users table.
 */
export async function POST(req: Request) {
  try {
    // Verify admin authentication
    const { userId: adminId, sessionClaims } = await auth();
    
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminRole = sessionClaims?.role;
    if (adminRole !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Parse the request body to extract updates array
    const { updates } = await req.json();

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "Missing or invalid updates array" }, { status: 400 });
    }

    // Validate all updates first
    const validRoles = ["admin", "senator", "coordinator", "attorney"];
    for (const update of updates) {
      if (!update.userId || !update.role) {
        return NextResponse.json({ error: "Each update must have userId and role" }, { status: 400 });
      }
      if (!validRoles.includes(update.role)) {
        return NextResponse.json(
          { error: `Invalid role: ${update.role}. Must be one of: ${validRoles.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const results = [];
    const errors = [];

    // Process each update
    for (const update of updates) {
      try {
        // Update Clerk
        await clerkClient.users.updateUser(update.userId, {
          publicMetadata: { role: update.role },
        });

        // Update database
        const result = await turso.execute({
          sql: "UPDATE Users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          args: [update.role, update.userId],
        });

        // If user doesn't exist in database, create them
        if (result.rowsAffected === 0) {
          const user = await clerkClient.users.getUser(update.userId);
          const email = user.emailAddresses[0]?.emailAddress || "";
          const username = email.split("@")[0] || update.userId;

          await turso.execute({
            sql: `INSERT INTO Users (id, username, role, created_at, updated_at) 
                  VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            args: [update.userId, username, update.role],
          });
        }

        results.push({ userId: update.userId, role: update.role, success: true });
      } catch (error) {
        console.error(`Error updating user ${update.userId}:`, error);
        errors.push({ 
          userId: update.userId, 
          role: update.role, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Return summary
    return NextResponse.json({ 
      message: `Batch update completed: ${results.length} succeeded, ${errors.length} failed`,
      results,
      errors
    });
  } catch (error) {
    console.error("Error in batch update:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

