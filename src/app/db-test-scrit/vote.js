import { turso } from "../../db.js";

// Replace with test values from your seed
const voterId = "user_student_001"; // Clerk user ID
const voterName = "Jane Doe";       // Full name
const agendaId = 1;                 // From seeded agenda
const optionId = 1;                 // ID of the option to vote for

async function castVote() {
  try {
    // Step 1: Check if agenda is open and visible
    const agenda = await turso.execute({
      sql: `SELECT is_open, is_visible FROM Agendas WHERE id = ?`,
      args: [agendaId],
    });

    if (!agenda.rows.length) throw new Error("Agenda not found.");
    const { is_open, is_visible } = agenda.rows[0];

    if (!is_open) throw new Error("Voting is closed.");
    if (!is_visible) throw new Error("Agenda is not yet visible.");

    // Step 2: Attempt to insert vote
    const voteResult = await turso.execute({
      sql: `
        INSERT INTO Votes (voter_id, voter_name, agenda_id, option_id)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(voter_id, agenda_id) DO NOTHING
      `,
      args: [voterId, voterName, agendaId, optionId],
    });

    if (voteResult.rowsAffected === 0) {
      console.log("⚠️ User has already voted in this agenda.");
      return;
    }

    // Step 3: Increment vote count
    await turso.execute({
      sql: `UPDATE Options SET vote_count = vote_count + 1 WHERE id = ?`,
      args: [optionId],
    });

    console.log("✅ Vote successfully recorded.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

castVote();
