import { NextResponse, NextRequest } from "next/server";
import { turso } from "../../../db";


export async function POST(req: NextRequest) {
  try {
    const { attorney_id, attorney_name, date, start_time, end_time } = await req.json();

    await turso.execute({
        sql: `
          INSERT INTO Availability (
            attorney_id, 
            attorney_name, 
            date, 
            start_time, 
            end_time, 
            created_at
          ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        args: [attorney_id, attorney_name, date, start_time, end_time],
      });
      
      

    return NextResponse.json({ message: "✅ Availability added successfully." }, { status: 201 });

  } catch (error) {
    console.error("❌ Error adding availability:", error);
    return NextResponse.json({ message: "Failed to add availability", error }, { status: 500 });
  }
}
