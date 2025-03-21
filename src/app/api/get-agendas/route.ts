import { turso } from "../../../db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse the request body to get the 'is_open' parameter
    const { is_open }: { is_open?: boolean } = await req.json();

    // Execute the SQL query to fetch agendas based on 'is_open' status
    const result = await turso.execute({
      sql: "SELECT * FROM Agendas WHERE is_open = ?",
      args: [is_open ? 1 : 0],
    });

    // Map the rows to an array of agendas
    const agendas = await Promise.all(
      result.rows.map(async (row: any) => {
        const agenda: any = {};

        // Map columns to agenda object
        result.columns.forEach((column: string, index: number) => {
          agenda[column] = row[index];
        });

        // Fetch matching options for the current agenda
        const optionsResult = await turso.execute({
          sql: "SELECT id, option_text FROM Options WHERE agenda_id = ?",
          args: [agenda.id], // Assuming 'id' is the primary key for Agendas table
        });

        // Extract option objects with id and option_text and add them to the agenda object
        const options = optionsResult.rows.map((option: any) => ({
          id: option.id,
          optionText: option.option_text, // Assuming 'option_text' is the column containing the option text
        }));

        agenda.options = options; // Add the options to the agenda

        return agenda;
      })
    );

    // Return the modified agendas with the options list as {id, optionText}
    return NextResponse.json({ agendas }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch agendas", message: error }, { status: 500 });
  }
}
