import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from the project root
dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

// Validate environment variables
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error("❌ Missing required environment variables:");
  console.error("   TURSO_DATABASE_URL:", process.env.TURSO_DATABASE_URL ? "✅" : "❌ Missing");
  console.error("   TURSO_AUTH_TOKEN:", process.env.TURSO_AUTH_TOKEN ? "✅" : "❌ Missing");
  console.error("\nMake sure you have a .env.local file in the project root with:");
  console.error("   TURSO_DATABASE_URL=your_database_url");
  console.error("   TURSO_AUTH_TOKEN=your_auth_token");
  process.exit(1);
}

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Get current date for generating events
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth(); // 0-indexed

// Sample events for the current and next month
const sampleEvents = [
  {
    title: "Senate Meeting - Fall Session",
    description: "Monthly senate meeting to discuss campus policies.",
    start_time: new Date(currentYear, currentMonth, 1, 9, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 1, 11, 0).toISOString(),
    is_all_day: false,
    event_type: "senate_meeting",
    location: "Student Center Room 201",
  },
  {
    title: "Budget Committee Meeting",
    description: "Review and approve budget allocations for student organizations.",
    start_time: new Date(currentYear, currentMonth, 5, 14, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 5, 16, 0).toISOString(),
    is_all_day: false,
    event_type: "committee_meeting",
    location: "Administration Building Room 305",
  },
  {
    title: "Student Services Office Hours",
    description: "Open office hours for student consultations.",
    start_time: new Date(currentYear, currentMonth, 8, 10, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 8, 16, 0).toISOString(),
    is_all_day: false,
    event_type: "office_hours",
    location: "Student Government Office",
  },
  {
    title: "Administrative Planning Session",
    description: "Strategic planning for upcoming semester.",
    start_time: new Date(currentYear, currentMonth, 12, 14, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 12, 16, 0).toISOString(),
    is_all_day: false,
    event_type: "administrative_meeting",
    location: "Conference Room A",
  },
  {
    title: "Campus-wide Town Hall",
    description: "Open forum for students to voice concerns and suggestions.",
    start_time: new Date(currentYear, currentMonth, 15, 18, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 15, 20, 0).toISOString(),
    is_all_day: false,
    event_type: "misc",
    location: "Main Auditorium",
  },
  {
    title: "Academic Affairs Committee",
    description: "Discuss academic policy recommendations.",
    start_time: new Date(currentYear, currentMonth, 18, 13, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 18, 15, 0).toISOString(),
    is_all_day: false,
    event_type: "committee_meeting",
    location: "Library Conference Room",
  },
  {
    title: "Senate Meeting - Special Session",
    description: "Special session to vote on emergency resolutions.",
    start_time: new Date(currentYear, currentMonth, 20, 16, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 20, 18, 0).toISOString(),
    is_all_day: false,
    event_type: "senate_meeting",
    location: "Student Center Room 201",
  },
  {
    title: "Treasurer Office Hours",
    description: "Consult with the treasurer about funding requests.",
    start_time: new Date(currentYear, currentMonth, 22, 11, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 22, 13, 0).toISOString(),
    is_all_day: false,
    event_type: "office_hours",
    location: "Student Government Office",
  },
  {
    title: "Year-End Administrative Review",
    description: "Review accomplishments and plan for next academic year.",
    start_time: new Date(currentYear, currentMonth, 25, 15, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 25, 17, 0).toISOString(),
    is_all_day: false,
    event_type: "administrative_meeting",
    location: "Executive Board Room",
  },
  {
    title: "Student Organization Fair",
    description: "All student government members invited to participate.",
    start_time: new Date(currentYear, currentMonth, 27, 0, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 28, 0, 0).toISOString(),
    is_all_day: true,
    event_type: "misc",
    location: "Campus Quad",
  },
];

async function seedEvents() {
  try {
    console.log("🌱 Starting to seed events...");

    // Get or create a user ID to use as created_by
    // Users table uses Clerk ID (TEXT) as primary key
    let createdBy;
    const userResult = await turso.execute("SELECT id FROM Users LIMIT 1");
    
    if (userResult.rows.length > 0) {
      createdBy = userResult.rows[0].id;
      console.log(`📝 Using existing user ID ${createdBy} as event creator`);
    } else {
      // No users exist, create a default user with a test Clerk ID
      console.log("⚠️ No users found in Users table, creating default user...");
      const testClerkId = "user_test_" + Date.now();
      await turso.execute({
        sql: "INSERT INTO Users (id, username, role) VALUES (?, ?, ?)",
        args: [testClerkId, "default_user", "admin"],
      });
      createdBy = testClerkId;
      console.log(`✅ Created default user with ID ${createdBy}`);
    }

    // Insert sample events
    for (const event of sampleEvents) {
      await turso.execute({
        sql: `
          INSERT INTO Events (
            created_by,
            start_time, 
            end_time,
            title,
            description,
            location,
            is_all_day,
            event_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          createdBy,
          event.start_time,
          event.end_time,
          event.title,
          event.description,
          event.location || null,
          event.is_all_day ? 1 : 0,
          event.event_type,
        ],
      });
      console.log(`✅ Added ${event.event_type}: ${event.title}${event.is_all_day ? ' (All-day)' : ''}`);
    }

    console.log("🎉 Successfully seeded all events!");
    
    // Verify the events
    const result = await turso.execute("SELECT COUNT(*) as count FROM Events");
    console.log(`📊 Total events in database: ${result.rows[0].count}`);

  } catch (error) {
    console.error("❌ Error seeding events:", error);
  }
}

seedEvents();

