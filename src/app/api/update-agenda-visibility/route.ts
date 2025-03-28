import { NextResponse } from "next/server";
import { turso } from '../../../db'

export async function POST(req: Request) {
  try {
    const { agenda_id, is_visible } = await req.json();

    // Validate inputs
    if (!agenda_id || typeof is_visible !== "boolean") {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    // Update visibility in the database
    const result = await turso.execute({
      sql: "UPDATE Agendas SET is_visible = ? WHERE id = ?",
      args: [is_visible, agenda_id],
    });

    // Check if the update was successful
    if (result.rowsAffected > 0) {
      return NextResponse.json({ message: "Visibility updated successfully" });
    } else {
      return NextResponse.json({ error: "Agenda not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error updating visibility:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
