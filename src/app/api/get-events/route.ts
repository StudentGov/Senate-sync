import { NextResponse } from "next/server";
import { turso } from "@/db";

// Helper function to darken a hex color for border
function darkenColor(hex: string): string {
  const color = hex.replace('#', '');
  const num = parseInt(color, 16);
  const r = Math.max(0, ((num >> 16) & 0xFF) - 40);
  const g = Math.max(0, ((num >> 8) & 0xFF) - 40);
  const b = Math.max(0, (num & 0xFF) - 40);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

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
      
      return {
        id: String(row.id),
        title: String(row.title),
        description: row.description || "",
        start,
        end,
        allDay: isAllDay,
        backgroundColor: row.color || "#93C5FD",
        borderColor: row.color ? darkenColor(String(row.color)) : "#3B82F6",
        textColor: "#1E40AF",
        extendedProps: {
          created_by: row.created_by,
          description: row.description || "",
          is_all_day: isAllDay,
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

