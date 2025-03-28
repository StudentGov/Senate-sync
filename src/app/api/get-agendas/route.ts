import { turso } from "../../../db";
import { NextResponse } from "next/server";



interface Option {
  id: number;
  optionText: string;
}

interface AgendaRow {
  id: number;
  speaker_id: string;
  title: string;
  description: string;
  is_visible: number;
  is_open: number;
  created_at: string;
}

interface Agenda {
  id: number;
  speaker_id: string;
  title: string;
  description: string;
  is_visible: boolean;
  is_open: boolean;
  created_at: string;
  options: Option[];
}

interface RequestBody {
  is_open?: boolean;
}

export async function POST(req: Request) {
  try {
    const { is_open }: RequestBody = await req.json();

    const result = await turso.execute({
      sql: "SELECT * FROM Agendas WHERE is_open = ?",
      args: [is_open ? 1 : 0],
    });

    const agendas: Agenda[] = await Promise.all(
      (result.rows as unknown as AgendaRow[]).map(async (row) => {
        const agenda: Agenda = {
          id: row.id,
          speaker_id: row.speaker_id,
          title: row.title,
          description: row.description,
          is_visible: row.is_visible === 1,
          is_open: row.is_open === 1,
          created_at: row.created_at,
          options: [],
        };

        const optionsResult = await turso.execute({
          sql: "SELECT id, option_text FROM Options WHERE agenda_id = ?",
          args: [agenda.id],
        });

        agenda.options = (optionsResult.rows as unknown as { id: number; option_text: string }[]).map(
          (option) => ({
            id: option.id,
            optionText: option.option_text,
          })
        );
        return agenda;
      })
    );

    return NextResponse.json({ agendas }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agendas", message: (error as Error).message },
      { status: 500 }
    );
  }
}

