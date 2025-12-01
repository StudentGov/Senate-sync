import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";
import { turso } from "@/db";

/**
 * GET API to fetch a list of all users from the database.
 * Enriches database data with Clerk user information (name, email).
 * The database Users table is now the source of truth for user roles.
 */
export async function GET() {
  try {
    // Fetch all users from the database
    const dbResult = await turso.execute({
      sql: "SELECT id, username, role, created_at, updated_at FROM Users ORDER BY created_at DESC",
      args: [],
    });

    const dbUsers = dbResult.rows;

    // Fetch corresponding Clerk data for each user
    const userList = await Promise.all(
      dbUsers.map(async (dbUser) => {
        try {
          // Fetch user details from Clerk
          const clerkUser = await clerkClient.users.getUser(
            dbUser.id as string
          );

          return {
            id: dbUser.id,
            username: dbUser.username,
            firstName: clerkUser.firstName || "N/A",
            lastName: clerkUser.lastName || "N/A",
            email: clerkUser.emailAddresses[0]?.emailAddress || "N/A",
            role: dbUser.role, // Role from database (source of truth)
            created_at: dbUser.created_at,
            updated_at: dbUser.updated_at,
          };
        } catch {
          // If user exists in DB but not in Clerk, return DB data only
          console.warn(`User ${dbUser.id} found in database but not in Clerk`);
          return {
            id: dbUser.id,
            username: dbUser.username,
            firstName: "N/A",
            lastName: "N/A",
            email: "N/A",
            role: dbUser.role,
            created_at: dbUser.created_at,
            updated_at: dbUser.updated_at,
          };
        }
      })
    );

    return NextResponse.json(userList);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
