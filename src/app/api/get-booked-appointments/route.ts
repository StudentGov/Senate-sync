import { NextResponse } from "next/server";
import { turso } from "@/db";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Optional: confirm this user exists on Clerk (for validation/logging)
    const user = await clerkClient.users.getUser(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("✅ Fetching appointments for attorneyId:", userId);

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
        WHERE a.is_booked = 1 AND a.attorney_id = ?
        ORDER BY a.date ASC, a.start_time ASC
      `,
      args: [userId],
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
