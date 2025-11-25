import { NextResponse } from "next/server";
import { turso } from "@/db";
import { auth } from "@clerk/nextjs/server";

/**
 * DELETE API to delete an appointment.
 * Only the attorney who owns the appointment slot can delete it.
 * Expects a JSON body: { appointmentId: number }
 * 
 * This will:
 * 1. Verify the appointment's slot belongs to the requesting attorney
 * 2. Delete the appointment record
 * 3. Mark the availability slot as available (is_booked = 0)
 */
export async function DELETE(req: Request) {
  try {
    // Verify authentication
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = sessionClaims?.role;
    
    // Only attorneys and admins can delete appointments
    if (userRole !== "attorney" && userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Only attorneys can delete appointments" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Missing appointmentId" },
        { status: 400 }
      );
    }

    // First, verify the appointment exists and get its slot_id
    const appointmentResult = await turso.execute({
      sql: `
        SELECT ap.id, ap.slot_id, a.attorney_id
        FROM Appointments ap
        JOIN Availability a ON ap.slot_id = a.id
        WHERE ap.id = ?
      `,
      args: [appointmentId],
    });

    if (appointmentResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const appointment = appointmentResult.rows[0];
    const slotId = appointment.slot_id as number;
    const attorneyId = appointment.attorney_id as string;

    // Verify the attorney owns this appointment slot (unless admin)
    if (userRole !== "admin" && attorneyId !== userId) {
      return NextResponse.json(
        { error: "Forbidden - You can only delete your own appointments" },
        { status: 403 }
      );
    }

    // Delete the appointment
    await turso.execute({
      sql: `DELETE FROM Appointments WHERE id = ?`,
      args: [appointmentId],
    });

    // Mark the availability slot as available
    await turso.execute({
      sql: `
        UPDATE Availability
        SET is_booked = 0, booked_by_student_id = NULL
        WHERE id = ?
      `,
      args: [slotId],
    });

    console.log(`✅ Appointment ${appointmentId} deleted by attorney ${userId}`);

    return NextResponse.json(
      { success: true, message: "Appointment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Failed to delete appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}

