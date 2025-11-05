import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/db";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("id");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if the event exists and get its creator
    const eventResult = await turso.execute({
      sql: "SELECT created_by FROM Events WHERE id = ?",
      args: [eventId],
    });

    if (eventResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const eventCreator = eventResult.rows[0].created_by;

    // Get user role from the database
    const userResult = await turso.execute({
      sql: "SELECT role FROM Users WHERE id = ?",
      args: [userId],
    });

    const userRole = userResult.rows.length > 0 ? userResult.rows[0].role : null;

    // Only allow deletion if user is admin, coordinator, or the event creator
    if (userRole !== "admin" && userRole !== "coordinator" && eventCreator !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this event" },
        { status: 403 }
      );
    }

    // Delete the event
    await turso.execute({
      sql: "DELETE FROM Events WHERE id = ?",
      args: [eventId],
    });

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Failed to delete event:", error);
    return NextResponse.json(
      { error: "Failed to delete event", details: (error as Error).message },
      { status: 500 }
    );
  }
}

