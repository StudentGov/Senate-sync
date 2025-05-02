import { NextResponse, NextRequest } from "next/server";
import { turso } from "../../../db";

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

    const start = parseTime(date, start_time);
    const end = parseTime(date, end_time);

    const insertQueries = [];

    // Loop through every 30-minute interval
    for (
      let slotStart = new Date(start);
      slotStart < end;
      slotStart.setMinutes(slotStart.getMinutes() + 30)
    ) {
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);

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
