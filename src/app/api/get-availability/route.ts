import { NextResponse } from "next/server";
import { turso } from "@/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await turso.execute({
      sql: "SELECT * FROM Availability WHERE attorney_id = ?",
      args: [userId],
    });

    const sessions: {
      title: string;
      start: string;
      end: string;
      allDay: boolean;
    }[] = [];

    const seen = new Set<string>();

    for (const row of result.rows) {
      const { date, start_time, end_time } = row;
      const start = new Date(`${date} ${start_time}`);
      const end = new Date(`${date} ${end_time}`);

      let current = new Date(start);
      while (current < end) {
        const next = new Date(current.getTime() + 30 * 60000);
        const sessionKey = `${current.toISOString()}-${next.toISOString()}`;

        if (!seen.has(sessionKey)) {
          sessions.push({
            title: "Available",
            start: current.toISOString(),
            end: next.toISOString(),
            allDay: false,
          });
          seen.add(sessionKey);
        }

        current = next;
      }
    }

    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to fetch availability:", error);
    return NextResponse.json({ error: "Failed to load availabilities" }, { status: 500 });
  }
}
