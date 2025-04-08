import { turso } from '../../../db'
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
      const { voter_id, agenda_id } = await req.json();
  
      if (!voter_id || !agenda_id) {
        return NextResponse.json({ error: "Missing voter_id or agenda_id" }, { status: 400 });
      }
  
      console.log("Fetching vote for:", { voter_id, agenda_id });
  
      // Query to get option_id and option_text in one go
      const result = await turso.execute({
        sql: `
          SELECT Options.id, Options.option_text 
          FROM Votes 
          JOIN Options ON Votes.option_id = Options.id 
          WHERE Votes.voter_id = ? AND Votes.agenda_id = ?
        `,
        args: [voter_id, agenda_id],
      });

      if (result.rows.length === 0) {
        return NextResponse.json({ option_id: null, optionText: "N/A" });
      }

      const { id, option_text } = result.rows[0];
    //   return NextResponse.json({optionText})
      return NextResponse.json({ option_id: id, optionText: option_text });
    } catch (error) {
      console.error("Error fetching vote:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
