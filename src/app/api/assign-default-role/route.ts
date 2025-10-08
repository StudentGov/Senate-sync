import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";
import { turso } from "@/db";

/**
 * POST API to assign a default role ("student") based on email domain.
 * Only allows users with email domains ending in:
 * - @mnsu.edu
 * - @go.minnstate.edu
 * - @minnstate.edu
 * If the email domain does not match, no role is assigned.
 * Also saves/updates user in the database Users table.
 */
export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json();

    // Validate that userId and email are provided
    if (!userId || !email) {
      return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
    }

    // Define allowed email domains
    const allowedDomains = ["@mnsu.edu", "@go.minnstate.edu", "@minnstate.edu"];
    const emailDomain = email.substring(email.indexOf("@"));

    // Fetch user metadata from Clerk
    const user = await clerkClient.users.getUser(userId);
    const existingRole = user.publicMetadata?.role;

    // If a role already exists in Clerk, ensure it's also in the database
    if (existingRole) {
      // Check if user exists in database
      const dbUser = await turso.execute({
        sql: "SELECT id, role FROM Users WHERE id = ?",
        args: [userId],
      });

      if (dbUser.rows.length === 0) {
        // User exists in Clerk but not in database - insert them
        const username = email.split("@")[0]; // Extract username from email
        await turso.execute({
          sql: `INSERT INTO Users (id, username, role, created_at, updated_at) 
                VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          args: [userId, username, existingRole],
        });
        console.log(`User ${userId} synced to database with existing role: ${existingRole}`);
      } else if (dbUser.rows[0].role !== existingRole) {
        // User exists but role is different - update database to match Clerk
        await turso.execute({
          sql: "UPDATE Users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          args: [existingRole, userId],
        });
        console.log(`User ${userId} role updated in database to: ${existingRole}`);
      }

      return NextResponse.json({
        message: `User already has role: ${existingRole}`,
        role: existingRole, 
      });
    }

    // Check if the email domain is allowed
    const isAllowedDomain = allowedDomains.some(domain => emailDomain.endsWith(domain));

    // Determine role: "senator" for all new users (admin can change later)
    const defaultRole = "senator";

    // Assign default role in Clerk
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role: defaultRole },
    });

    // Save user to database with the assigned role
    const username = email.split("@")[0]; // Extract username from email
    
    // Check if user already exists in database (in case of partial sync)
    const existingUser = await turso.execute({
      sql: "SELECT id FROM Users WHERE id = ?",
      args: [userId],
    });

    if (existingUser.rows.length === 0) {
      // Insert new user
      await turso.execute({
        sql: `INSERT INTO Users (id, username, role, created_at, updated_at) 
              VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        args: [userId, username, defaultRole],
      });
      console.log(`New user ${userId} created in database with role: ${defaultRole}`);
    } else {
      // Update existing user
      await turso.execute({
        sql: "UPDATE Users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        args: [defaultRole, userId],
      });
      console.log(`Existing user ${userId} updated in database with role: ${defaultRole}`);
    }

    // Return a success message confirming the role assignment
    return NextResponse.json({
      message: `Default role '${defaultRole}' assigned successfully`,
      role: defaultRole,
    });
  } catch (error) {
    // Error Handling
    console.error("Error assigning default role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
