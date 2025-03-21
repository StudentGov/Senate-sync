import { turso } from "../../../db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { speaker_id, title, options }: { speaker_id: string; title: string; options: string[] } = await req.json();

    // Create an agenda
    const agendaResult = await turso.execute({
      sql: `
          INSERT INTO Agendas (speaker_id, title, description, is_visible, is_open)
          VALUES (?, ?, ?, ?, ?)`,
      args: [speaker_id, title, "N/A", true, true],
    });

    // Ensure agendaResult has a valid lastInsertRowid
    const agendaId = agendaResult?.lastInsertRowid;
    if (!agendaId) {
      throw new Error('Failed to create agenda: agendaId is undefined');
    }

    // Add options under the agenda
    const optionQueries = options.map((option) => ({
      sql: "INSERT INTO Options (agenda_id, option_text) VALUES (?, ?)",
      args: [agendaId, option], // Directly pass the option as a string
    }));

    // Ensure no undefined values in args
    await turso.batch(optionQueries);

    return NextResponse.json({ message: "Agenda saved successfully" }, { status: 201 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to save agenda", message: error }, { status: 500 });
  }
}

