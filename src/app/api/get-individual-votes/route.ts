import { NextResponse } from "next/server";
import { turso } from '../../../db';

export async function POST(req: Request) {
  try {
    const { agenda_id } = await req.json();
    if (!agenda_id) {
      return NextResponse.json({ error: "Missing agenda_id" }, { status: 400 });
    }

    // Fetch votes along with voter_name and option_id
    const voteResults = await turso.execute({
      sql: `
        SELECT v.id, v.voter_name, v.option_id, o.option_text
        FROM Votes v
        JOIN Options o ON v.option_id = o.id
        WHERE v.agenda_id = ?`,
      args: [agenda_id],
    });

    // Transform data into the required format
    const data = voteResults.rows.map(row => ({
      id: row.id,
      name: row.voter_name,
      option: row.option_text,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
