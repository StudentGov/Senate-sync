import { turso } from "../../../db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing resource ID" }, { status: 400 });
    }

    // Check if the resource exists
    const checkResult = await turso.execute({
      sql: "SELECT created_by FROM Resources WHERE id = ?",
      args: [id],
    });

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Allow deletion if user is admin, coordinator, or the creator
    const userRole = sessionClaims?.role as string | undefined;
    const isAdmin = userRole === "admin";
    const isCoordinator = userRole === "coordinator";
    const isCreator = checkResult.rows[0].created_by === userId;

    if (!isAdmin && !isCoordinator && !isCreator) {
      return NextResponse.json({ error: "Forbidden: You don't have permission to delete this resource" }, { status: 403 });
    }

    await turso.execute({
      sql: "DELETE FROM Resources WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ message: "Resource deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({
      error: "Failed to delete resource",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

