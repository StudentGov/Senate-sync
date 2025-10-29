import { NextResponse } from "next/server";
import { turso } from "@/db";
import { getEventTypeConfig, isValidEventType, type EventType } from "@/lib/eventTypes";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startTimestamp = searchParams.get("start");
    const endTimestamp = searchParams.get("end");

    let sql = "SELECT * FROM Events";
    const args: any[] = [];

    if (startTimestamp && endTimestamp) {
      sql += " WHERE start_time >= ? AND start_time <= ?";
      args.push(Number(startTimestamp), Number(endTimestamp));
    }

    sql += " ORDER BY start_time ASC";

    const result = await turso.execute({
      sql,
      args,
    });

    const events = result.rows.map((row) => {
      const isAllDay = Boolean(row.is_all_day);
      const startTime = String(row.start_time);
      const endTime = row.end_time ? String(row.end_time) : undefined;
      
      // For all-day events, use date-only format (YYYY-MM-DD)
      // For timed events, use full datetime
      let start = startTime;
      let end = endTime;
      
      if (isAllDay) {
        // Extract just the date part for all-day events
        start = startTime.split(' ')[0];
        if (endTime) {
          end = endTime.split(' ')[0];
        }
      }

      // Get colors from event type
      const eventType = row.event_type as string;
      let backgroundColor = "#2E82E8"; // Default misc blue
      let borderColor = "#2468BA";
      let textColor = "#1A4A8C";

      if (eventType && isValidEventType(eventType)) {
        const config = getEventTypeConfig(eventType as EventType);
        backgroundColor = config.backgroundColor;
        borderColor = config.borderColor;
        textColor = config.textColor;
      }
      
      return {
        id: String(row.id),
        title: String(row.title),
        description: row.description || "",
        start,
        end,
        allDay: isAllDay,
        backgroundColor,
        borderColor,
        textColor,
        extendedProps: {
          created_by: row.created_by,
          description: row.description || "",
          location: row.location || "",
          is_all_day: isAllDay,
          event_type: eventType || "misc",
        }
      };
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

