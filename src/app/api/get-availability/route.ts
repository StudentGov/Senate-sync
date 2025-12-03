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
      // Parse date and time correctly - date is YYYY-MM-DD, time is "HH:MM AM/PM"
      // Convert time to 24-hour format for proper Date parsing
      const [timePart, modifier] = (start_time as string).split(" ");
      const [hours, minutes] = timePart.split(":").map(Number);
      let startHours = hours;
      if (modifier === "PM" && hours !== 12) startHours += 12;
      if (modifier === "AM" && hours === 12) startHours = 0;
      
      const [endTimePart, endModifier] = (end_time as string).split(" ");
      const [endHours, endMinutes] = endTimePart.split(":").map(Number);
      let endHours24 = endHours;
      if (endModifier === "PM" && endHours !== 12) endHours24 += 12;
      if (endModifier === "AM" && endHours === 12) endHours24 = 0;
      
      const start = new Date(`${date}T${String(startHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);
      const end = new Date(`${date}T${String(endHours24).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}:00`);

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
