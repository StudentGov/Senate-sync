import supabase from '../../../supabase/main'

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Agendas")
      .update({ is_open: false })
      .eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, data }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
