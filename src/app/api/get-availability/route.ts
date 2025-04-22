import { NextResponse } from "next/server";
import { turso } from "@/db";

export async function GET() {
  try {
    const result = await turso.execute("SELECT * FROM Availability");

    const sessions: any[] = [];

    for (const row of result.rows) {
      const { date, start_time, end_time } = row;

      const start = new Date(`${date} ${start_time}`);
      const end = new Date(`${date} ${end_time}`);

      while (start < end) {
        const next = new Date(start.getTime() + 30 * 60000); // 30 min
        sessions.push({
          title: "Available",
          start: start.toISOString(),
          end: next.toISOString(),
          allDay: false,
        });
        start.setTime(next.getTime());
      }
    }

    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to fetch availability:", error);
    return NextResponse.json({ error: "Failed to load availabilities" }, { status: 500 });
  }
}
