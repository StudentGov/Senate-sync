import { NextResponse } from "next/server";
import { turso } from "@/db";

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `
        SELECT 
          a.id,
          a.date,
          a.start_time,
          a.end_time,
          ap.student_name,
          ap.star_id,
          ap.tech_id,
          ap.description
        FROM Availability a
        JOIN Appointments ap ON ap.slot_id = a.id
        WHERE a.is_booked = 1
        ORDER BY a.date ASC, a.start_time ASC
      `,
      args: []
    });

    const appointments = result.rows || [];

    return NextResponse.json(appointments, { status: 200 });

  } catch (error) {
    console.error("❌ Failed to fetch booked appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch booked appointments" },
      { status: 500 }
    );
  }
}
