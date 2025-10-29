import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";
import { turso } from "@/db";
import { auth } from "@clerk/nextjs/server";

/**
 * DELETE API to delete a user from both the database and Clerk.
 * Only admins can delete users.
 * Expects a JSON body: { userId: string }
 * 
 * Deletes from database first to ensure data consistency.
 * The database has ON DELETE CASCADE configured for related records
 * (Events, Hours, etc.), so those will be automatically cleaned up.
 */
export async function DELETE(req: Request) {
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

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (userId === adminId) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    // Delete from database first (this will cascade to related tables)
    try {
      const result = await turso.execute({
        sql: "DELETE FROM Users WHERE id = ?",
        args: [userId],
      });
      
      if (result.rowsAffected > 0) {
        console.log(`User ${userId} deleted from database (${result.rowsAffected} rows affected)`);
      } else {
        console.log(`User ${userId} not found in database, proceeding with Clerk deletion`);
      }
    } catch (dbError) {
      console.error("Error deleting user from database:", dbError);
      // Continue with Clerk deletion even if DB deletion fails
      // This allows cleanup of Clerk users that aren't in the DB
    }

    // Delete from Clerk
    await clerkClient.users.deleteUser(userId);
    console.log(`User ${userId} deleted from Clerk`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
