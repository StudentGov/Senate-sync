import { NextResponse } from "next/server";
import { turso } from "@/db";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(req: Request) {
  try {
    // Verify authentication
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
    const { attorney_id, start, end } = body;

    // Verify the attorney owns this availability slot (unless admin)
    if (userRole !== "admin" && attorney_id !== userId) {
      return NextResponse.json(
        { error: "Forbidden - You can only delete your own availability" },
        { status: 403 }
      );
    }

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

    console.log("🧹 Deleting availability slot:", {
      attorney_id,
      date,
      startTime,
      endTime,
    });

    const result = await turso.execute({
      sql: `
        DELETE FROM Availability
        WHERE attorney_id = ? AND date = ? AND start_time = ? AND end_time = ?
      `,
      args: [attorney_id, date, startTime, endTime],
    });

    if (result.rowsAffected === 0) {
      console.warn("⚠️ No matching row found to delete.");
    }

    return NextResponse.json(
      { success: true, deleted: result.rowsAffected },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Failed to delete availability:", error);
    return NextResponse.json(
      { error: "Failed to delete availability" },
      { status: 500 }
    );
  }
}
