import { NextResponse, NextRequest } from "next/server";
import { turso } from "../../../db";

/**
 * API to add attorney availability
 * 
 * NOTE: System is designed for exactly 2 attorneys.
 * All time slots are automatically split into exactly 30-minute intervals.
 * The start_time and end_time provided are the range, which is then
 * automatically divided into 30-minute slots.
 */

// Helper to convert "08:00 AM" => Date object
function parseTime(dateStr: string, timeStr: string): Date {
  const [time, modifier] = timeStr.split(" ");
  const [rawHours, minutes] = time.split(":").map(Number);
  let hours = rawHours;

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return new Date(
    `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
  );
}

// Helper to format Date => "hh:mm AM/PM"
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { attorney_id, attorney_name, date, start_time, end_time } = await req.json();

    if (!attorney_id || !date || !start_time || !end_time) {
      return NextResponse.json(
        { error: "Missing required fields: attorney_id, date, start_time, end_time" },
        { status: 400 }
      );
    }

    const start = parseTime(date, start_time);
    const end = parseTime(date, end_time);

    // Validate that end is after start
    if (end <= start) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    const insertQueries = [];

    // Loop through every 30-minute interval
    // This ensures all slots are exactly 30 minutes
    for (
      let slotStart = new Date(start);
      slotStart < end;
      slotStart.setMinutes(slotStart.getMinutes() + 30)
    ) {
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);

      // Don't create a slot if it would extend beyond the requested end time
      if (slotEnd > end) {
        break;
      }

      insertQueries.push({
        sql: `
          INSERT INTO Availability (
            attorney_id, 
            attorney_name, 
            date, 
            start_time, 
            end_time, 
            created_at
          ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        args: [
          attorney_id,
          attorney_name,
          date,
          formatTime(slotStart),
          formatTime(slotEnd),
        ],
      });
    }

    if (insertQueries.length === 0) {
      return NextResponse.json(
        { error: "Time range must be at least 30 minutes" },
        { status: 400 }
      );
    }

    await turso.batch(insertQueries);

    return NextResponse.json(
      { message: "✅ Availability added successfully in 30-minute chunks." },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error adding availability:", error);
    return NextResponse.json(
      { message: "Failed to add availability", error },
      { status: 500 }
    );
  }
}
