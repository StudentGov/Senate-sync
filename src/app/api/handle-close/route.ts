import { NextResponse } from "next/server";
import { turso } from '../../../db'

export async function POST(req: Request) {
  try {
    const { agenda_id } = await req.json();

    // Update visibility in the database
    const result = await turso.execute({
      sql: "UPDATE Agendas SET is_open = ? WHERE id = ?",
      args: [false, agenda_id],
    });

    // Check if the update was successful
    if (result.rowsAffected > 0) {
      return NextResponse.json({ message: "Closed Agenda successfully" });
    } else {
      return NextResponse.json({ error: "Agenda not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error closing agenda:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
