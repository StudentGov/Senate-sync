import { turso } from "../../../../db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admins to clear all content
    const userRole = sessionClaims?.role as string | undefined;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can clear all content" }, { status: 403 });
    }

    // Delete all archives
    const archivesResult = await turso.execute({
      sql: "DELETE FROM Archives",
      args: [],
    });

    // Delete all resources
    const resourcesResult = await turso.execute({
      sql: "DELETE FROM Resources",
      args: [],
    });

    return NextResponse.json({ 
      message: "All archives and resources deleted successfully",
      archivesDeleted: archivesResult.rowsAffected,
      resourcesDeleted: resourcesResult.rowsAffected
    }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      error: "Failed to clear content",
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

