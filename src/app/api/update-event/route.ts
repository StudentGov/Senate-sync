import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/db";
import { auth } from "@clerk/nextjs/server";
import { isValidEventType, type EventType } from "@/lib/eventTypes";

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      id,
      title,
      description,
      start_time,
      end_time,
      event_type,
      location,
      is_all_day,
    } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if the event exists and get its creator
    const eventResult = await turso.execute({
      sql: "SELECT created_by FROM Events WHERE id = ?",
      args: [id],
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

    // Only allow update if user is admin, coordinator, or the event creator
    if (userRole !== "admin" && userRole !== "coordinator" && eventCreator !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to update this event" },
        { status: 403 }
      );
    }

    // Validate title if provided
    if (title !== undefined && (title.length === 0 || title.length > 255)) {
      return NextResponse.json(
        { error: "Title must be between 1 and 255 characters" },
        { status: 400 }
      );
    }

    // Validate event type if provided
    if (event_type !== undefined) {
      const eventType: EventType = event_type;
      if (!isValidEventType(eventType)) {
        return NextResponse.json(
          { error: `Invalid event type. Must be one of: senate_meeting, committee_meeting, office_hours, administrator, misc` },
          { status: 400 }
        );
      }
    }

    // Build dynamic SQL update query based on provided fields
    const updates: string[] = [];
    const args: any[] = [];

    if (title !== undefined) {
      updates.push("title = ?");
      args.push(String(title));
    }
    if (description !== undefined) {
      updates.push("description = ?");
      args.push(description || null);
    }
    if (start_time !== undefined) {
      updates.push("start_time = ?");
      args.push(start_time);
    }
    if (end_time !== undefined) {
      updates.push("end_time = ?");
      args.push(end_time || null);
    }
    if (location !== undefined) {
      updates.push("location = ?");
      args.push(location || null);
    }
    if (is_all_day !== undefined) {
      updates.push("is_all_day = ?");
      args.push(is_all_day === true || is_all_day === 1 ? 1 : 0);
    }
    if (event_type !== undefined) {
      updates.push("event_type = ?");
      args.push(event_type);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Add event ID to args for WHERE clause
    args.push(id);

    const sql = `UPDATE Events SET ${updates.join(", ")} WHERE id = ?`;

    await turso.execute({
      sql,
      args,
    });

    return NextResponse.json(
      { message: "Event updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Failed to update event:", error);
    return NextResponse.json(
      { error: "Failed to update event", details: (error as Error).message },
      { status: 500 }
    );
  }
}

