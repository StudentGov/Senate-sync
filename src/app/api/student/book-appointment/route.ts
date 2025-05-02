import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { turso } from "@/db";

export async function POST(req: NextRequest) {
  try {
    const { slotId, starId, techId, description, studentId } = await req.json();

    if (!studentId || !slotId || !starId || !techId || !description) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Fetch full user info using the studentId passed
    const user = await clerkClient.users.getUser(studentId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const studentName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const studentEmail = user.emailAddresses[0]?.emailAddress || "";

    // Insert appointment into database
    await turso.execute({
      sql: `
        INSERT INTO Appointments (student_id, student_name, student_email, star_id, tech_id, description, slot_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      args: [studentId, studentName, studentEmail, starId, techId, description, slotId],
    });

    // Update the Availability table to mark slot as booked
    await turso.execute({
      sql: `
        UPDATE Availability
        SET is_booked = 1
        WHERE id = ?
      `,
      args: [slotId],
    });

    return NextResponse.json({ message: "Appointment booked successfully" }, { status: 200 });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
