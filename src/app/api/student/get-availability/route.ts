import { NextResponse } from "next/server";
import { turso } from "@/db";

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `
        SELECT 
          MIN(id) as id, 
          date, 
          start_time, 
          end_time
        FROM Availability 
        WHERE is_booked = 0
        GROUP BY date, start_time, end_time
        ORDER BY date ASC, start_time ASC
      `,
      args: [],
    });

    const slots = result.rows.map((row) => ({
      id: row.id,
      date: row.date,
      start_time: row.start_time,
      end_time: row.end_time,
    }));

    return NextResponse.json(slots, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to fetch availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
