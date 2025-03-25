import { NextResponse } from "next/server";
import { turso } from '../../../db';

export async function POST(req: Request) {
  try {
    const { agenda_id } = await req.json(); // Extract agenda_id from the request body

    if (!agenda_id) {
      return NextResponse.json({ error: "Missing agenda_id" }, { status: 400 });
    }

    // Fetch options matching the given agenda_id from the Options table
    const optionsResult = await turso.execute({
      sql: "SELECT id AS id, vote_count AS value, option_text AS label FROM Options WHERE agenda_id = ?",
      args: [agenda_id],
    });

    // Format the result to match the required structure
    const options = optionsResult.rows.map(row => ({
      id: row.id,
      value: row.value,
      label: row.label
    }));

    return NextResponse.json({ data: options });
  } catch (error) {
    console.error("Error fetching options:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
