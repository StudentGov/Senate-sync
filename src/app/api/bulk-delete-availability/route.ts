import { NextResponse } from "next/server";
import { turso } from "@/db";
import { auth } from "@clerk/nextjs/server";

/**
 * DELETE API to bulk delete multiple availability slots
 * Expects: { attorney_id: string, slots: Array<{ start: string, end: string }> }
 */
export async function DELETE(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = sessionClaims?.role;
    
    // Only attorneys and admins can delete availability
    if (userRole !== "attorney" && userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Only attorneys can delete availability" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { slots } = body;

    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty slots array" },
        { status: 400 }
      );
    }

    const deleteQueries = [];
    let totalDeleted = 0;

    for (const slot of slots) {
      const { start, end } = slot;
      
      // Parse timestamps
      const startDate = new Date(start);
      const endDate = new Date(end);
      const date = startDate.toISOString().split("T")[0];

      // Convert to matching DB format (e.g., "08:00 AM")
      const formatTime = (d: Date) =>
        d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

      const startTime = formatTime(startDate);
      const endTime = formatTime(endDate);

      deleteQueries.push({
        sql: `
          DELETE FROM Availability
          WHERE attorney_id = ? AND date = ? AND start_time = ? AND end_time = ?
        `,
        args: [userId, date, startTime, endTime],
      });
    }

    // Execute all deletions
    const results = await turso.batch(deleteQueries);
    
    // Handle batch results - results is an array of execution results
    totalDeleted = results.reduce((sum, result) => {
      const affected = typeof result.rowsAffected === 'number' ? result.rowsAffected : 0;
      return sum + affected;
    }, 0);

    console.log(`🧹 Bulk deleted ${totalDeleted} availability slot(s)`);

    return NextResponse.json(
      { success: true, deleted: totalDeleted, total: slots.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Failed to bulk delete availability:", error);
    return NextResponse.json(
      { error: "Failed to delete availability" },
      { status: 500 }
    );
  }
}

