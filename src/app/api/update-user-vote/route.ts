import { NextResponse } from "next/server";
import { turso } from '../../../db'
export async function POST(req: Request) {
  try {
    const { voter_id, agenda_id, option_id, name } = await req.json();
    console.log("Processing vote for:", { voter_id, agenda_id, option_id });
    if (!voter_id || !agenda_id || !option_id) {
      return NextResponse.json({ error: "Missing voter_id, agenda_id, or option_id" }, { status: 400 });
    }



    // Check if a vote already exists
    const checkResult = await turso.execute({
      sql: "SELECT id FROM Votes WHERE voter_id = ? AND agenda_id = ?",
      args: [voter_id, agenda_id],
    });
    if (checkResult.rows.length > 0) {
      // Vote exists, update the option_id
      await turso.execute({
        sql: "UPDATE Votes SET option_id = ? WHERE voter_id = ? AND agenda_id = ?",
        args: [option_id, voter_id, agenda_id],
      });
      return NextResponse.json({ message: "Vote updated successfully" });
    } else {
      // No existing vote, insert a new row
      await turso.execute({
        sql: "INSERT INTO Votes (voter_id, voter_name, agenda_id, option_id) VALUES (?, ?, ?, ?)",
        args: [voter_id, name, agenda_id, option_id],
      });
      return NextResponse.json({ message: "Vote recorded successfully" });
    }
  } catch (error) {
    console.error("Error processing vote:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
