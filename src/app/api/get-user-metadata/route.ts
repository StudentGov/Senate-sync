import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    console.log("Calling Clerk API with userId:", userId)
    const user = await clerkClient.users.getUser(userId);

    // Log the entire user object to check if metadata is returned
    console.log("Full user object from Clerk API:", JSON.stringify(user, null, 2));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ role: user.publicMetadata?.role || null });
  } catch (error) {
    console.error("Error fetching user metadata:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
