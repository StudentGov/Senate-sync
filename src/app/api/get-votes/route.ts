import supabase from '../../../supabase/main';

export async function POST(request: Request) {
  try {
    const { agendaId } = await request.json();

    if (!agendaId) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    // Fetch votes that match the given agenda_id
    const { data, error } = await supabase
      .from("Votes")
      .select("id, name, option_text")
      .eq("agenda_id", agendaId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ votes: data }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
