import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";
import { turso } from "@/db";
import { auth } from "@clerk/nextjs/server";

/**
 * POST API to create a new user through admin panel.
 * Only admins can create new users.
 * Creates user in Clerk first, then syncs to database.
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

    // Parse request body
    const { email, firstName, lastName, role, password } = await req.json();

    // Validate required fields
    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email, firstName, lastName, role" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["admin", "senator", "coordinator", "attorney"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Create user in Clerk
    const newUser = await clerkClient.users.createUser({
      emailAddress: [email],
      firstName,
      lastName,
      password, // If password is provided, user can sign in immediately
      skipPasswordChecks: !password, // If no password, skip checks and require password reset
      publicMetadata: { role },
    });

    console.log(`Clerk user created: ${newUser.id}`);

    // Extract username from email
    const username = email.split("@")[0];

    // Insert user into database
    await turso.execute({
      sql: `INSERT INTO Users (id, username, role, created_at, updated_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [newUser.id, username, role],
    });

    console.log(`User ${newUser.id} created in database with role: ${role}`);

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser.id,
        email,
        firstName,
        lastName,
        role,
        username,
      },
    });
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle specific Clerk errors
    if (error?.errors?.[0]?.code === "form_identifier_exists") {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create user", details: error.message },
      { status: 500 }
    );
  }
}

