import { turso } from "../../db.js";


async function seed() {
  const speakerId = "user_speaker_123"; // Clerk user ID

  // Create an agenda
  const agendaResult = await turso.execute({
    sql: `
      INSERT INTO Agendas (speaker_id, title, description, is_visible, is_open)
      VALUES (?, ?, ?, ?, ?)`,
    args: [speakerId, "Best Campus Event", "Vote for your favorite event!", true, true],
  });

  const agendaId = agendaResult.lastInsertRowid;

  // Add options under the agenda
  await turso.batch([
    {
      sql: "INSERT INTO Options (agenda_id, option_text) VALUES (?, ?)",
      args: [agendaId, "Homecoming Week"],
    },
    {
      sql: "INSERT INTO Options (agenda_id, option_text) VALUES (?, ?)",
      args: [agendaId, "Talent Show"],
    },
  ]);

  console.log("✅ Seeded agenda and options successfully.");
}

seed().catch(console.error);
