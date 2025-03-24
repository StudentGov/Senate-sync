import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

/**
 * POST API to assign a default role ("student") based on email domain.
 * Only allows users with email domains ending in:
 * - @mnsu.edu
 * - @go.minnstate.edu
 * - @minnstate.edu
 * If the email domain does not match, no role is assigned.
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

    // If a role already exists, return it in the response 
    if (existingRole) {
      return NextResponse.json({
        message: `User already has role: ${existingRole}`,
        role: existingRole, 
      });
    }

    // Check if the email domain is allowed
    const isAllowedDomain = allowedDomains.some(domain => emailDomain.endsWith(domain));

    // If email domain is not allowed, do not assign any role 
    if (!isAllowedDomain) {
      console.log(`Unauthorized email domain: ${email}`);
      return NextResponse.json({
        message: "Email domain is not allowed. No role assigned.",
        role: null, 
      });
    }

    // Assign default role "student" for allowed domains
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role: "student" },
    });

    // Return a success message confirming the role assignment
    return NextResponse.json({
      message: "Default role 'student' assigned successfully",
      role: "student",
    });
  } catch (error) {
    // Error Handling
    console.error("Error assigning default role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
