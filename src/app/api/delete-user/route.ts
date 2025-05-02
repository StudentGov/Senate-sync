import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

/**
 * DELETE API to delete a Clerk user by ID.
 * Expects a JSON body: { userId: string }
 */
export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await clerkClient.users.deleteUser(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
