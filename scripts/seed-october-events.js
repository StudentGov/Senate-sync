import dotenv from "dotenv";
import { createClient } from "@libsql/client";

// Load environment variables first
dotenv.config({ path: ".env.local" });

// Create database client after env vars are loaded
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const CREATOR_ID = "user_33n5aqGGtYudKYGoR3QT7JwfeXB";

const octoberEvents = [
  {
    start_time: "2025-10-15",
    end_time: "2025-10-15",
    title: "Student Government Annual Conference",
    description: "Full day conference with workshops and networking sessions",
    location: "University Convention Center",
    is_all_day: true,
    color: "#3B82F6",
  },
  {
    start_time: "2025-10-02 09:00:00",
    end_time: "2025-10-02 10:30:00",
    title: "Senate Budget Committee Meeting",
    description: "Review and discuss quarterly budget allocations",
    location: "Student Center Room 204",
    is_all_day: false,
    color: "#10B981",
  },
  {
    start_time: "2025-10-08 18:00:00",
    end_time: "2025-10-08 20:00:00",
    title: "Town Hall with Campus President",
    description: "Open forum for student questions and concerns",
    location: "Main Auditorium",
    is_all_day: false,
    color: "#8B5CF6",
  },
  {
    start_time: "2025-10-12 14:00:00",
    end_time: "2025-10-12 15:00:00",
    title: "Committee Chairs Weekly Sync",
    description: "Coordination meeting for all committee chairs",
    location: "Online/Zoom",
    is_all_day: false,
    color: "#06B6D4",
  },
  {
    start_time: "2025-10-20 13:00:00",
    end_time: "2025-10-20 16:00:00",
    title: "Leadership Development Workshop",
    description: "Skills training for student leaders",
    location: "Student Union - Training Room B",
    is_all_day: false,
    color: "#F59E0B",
  },
  {
    start_time: "2025-10-05 16:00:00",
    end_time: "2025-10-05 17:00:00",
    title: "Campus Safety Forum",
    description: "Discussion on campus safety initiatives",
    location: "Library Conference Room",
    is_all_day: false,
    color: "#EF4444",
  },
  {
    start_time: "2025-10-25 19:00:00",
    end_time: "2025-10-25 21:30:00",
    title: "Student Government Mixer",
    description: "Networking event for all senators and coordinators",
    location: "The Campus Lounge",
    is_all_day: false,
    color: "#EC4899",
  },
  {
    start_time: "2025-10-18 10:00:00",
    end_time: "2025-10-18 12:00:00",
    title: "Student Government Office Hours",
    description: "Open office hours for student consultations",
    location: "Student Center - SG Office",
    is_all_day: false,
    color: "#14B8A6",
  },
  {
    start_time: "2025-10-22 12:00:00",
    end_time: "2025-10-22 13:30:00",
    title: "Department Liaison Lunch",
    description: "Monthly meeting with academic department representatives",
    location: "Faculty Dining Hall",
    is_all_day: false,
    color: "#A855F7",
  },
  {
    start_time: "2025-10-29 17:30:00",
    end_time: "2025-10-29 19:00:00",
    title: "End of Month Report Presentation",
    description: "Monthly achievements and upcoming initiatives presentation",
    location: "Student Center Room 301",
    is_all_day: false,
    color: "#6366F1",
  },
];

async function seedOctoberEvents() {
  console.log("🌱 Starting to seed October 2025 events...\n");

  try {
    for (const event of octoberEvents) {
      await turso.execute({
        sql: `
          INSERT INTO Events (created_by, start_time, end_time, title, description, location, is_all_day, color)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          CREATOR_ID,
          event.start_time,
          event.end_time,
          event.title,
          event.description,
          event.location,
          event.is_all_day ? 1 : 0,
          event.color,
        ],
      });
      console.log(`✅ Created: ${event.title} (${event.location})`);
    }

    // Verify the results
    const result = await turso.execute(`
      SELECT COUNT(*) as count FROM Events 
      WHERE start_time >= '2025-10-01' AND start_time < '2025-11-01'
    `);

    console.log(
      `\n🎉 Successfully created ${result.rows[0].count} events for October 2025!`
    );
  } catch (error) {
    console.error("❌ Error seeding events:", error);
  }
}

seedOctoberEvents();

