import { NextResponse } from "next/server";
import { turso } from "@/db";

export async function GET() {
  try {
    const result = await turso.execute({
      sql: `
        SELECT 
          id,
          date,
          start_time,
          end_time,
          booked_by_student_id AS student
        FROM Availability
        WHERE is_booked = 1
        ORDER BY date ASC, start_time ASC
      `,
      args: [] // ✅ Required even when unused
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
