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
    title: "Welcome Week",
    description: "Welcome week activities for new students.",
    start_time: new Date(currentYear, currentMonth, 1, 9, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 1, 17, 0).toISOString(),
    is_all_day: false,
    color: "#93C5FD",
  },
  {
    title: "Registration Deadline",
    description: "Last day to register for courses.",
    start_time: new Date(currentYear, currentMonth, 5, 0, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 6, 0, 0).toISOString(),
    is_all_day: true,
    color: "#86EFAC",
  },
  {
    title: "Career Fair",
    description: "Annual career fair with 50+ employers.",
    start_time: new Date(currentYear, currentMonth, 8, 10, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 8, 16, 0).toISOString(),
    is_all_day: false,
    color: "#C4B5FD",
  },
  {
    title: "Study Skills Workshop",
    description: "Learn effective study techniques.",
    start_time: new Date(currentYear, currentMonth, 12, 14, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 12, 16, 0).toISOString(),
    is_all_day: false,
    color: "#FED7AA",
  },
  {
    title: "Midterm Exams Begin",
    description: "Midterm examination period begins.",
    start_time: new Date(currentYear, currentMonth, 15, 0, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 16, 0, 0).toISOString(),
    is_all_day: true,
    color: "#FCA5A5",
  },
  {
    title: "Homecoming Game",
    description: "Annual homecoming football game.",
    start_time: new Date(currentYear, currentMonth, 18, 13, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 18, 16, 0).toISOString(),
    is_all_day: false,
    color: "#FDE047",
  },
  {
    title: "Research Symposium",
    description: "Student research presentations.",
    start_time: new Date(currentYear, currentMonth, 20, 9, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 20, 15, 0).toISOString(),
    is_all_day: false,
    color: "#A5B4FC",
  },
  {
    title: "Mental Health Awareness",
    description: "Mental health awareness workshop.",
    start_time: new Date(currentYear, currentMonth, 22, 11, 30).toISOString(),
    end_time: new Date(currentYear, currentMonth, 22, 13, 0).toISOString(),
    is_all_day: false,
    color: "#F0ABFC",
  },
  {
    title: "Financial Aid Workshop",
    description: "Learn about financial aid opportunities.",
    start_time: new Date(currentYear, currentMonth, 25, 15, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth, 25, 17, 0).toISOString(),
    is_all_day: false,
    color: "#99F6E4",
  },
  {
    title: "Spring Break",
    description: "University closed - Spring break week.",
    start_time: new Date(currentYear, currentMonth, 27, 0, 0).toISOString(),
    end_time: new Date(currentYear, currentMonth + 1, 3, 0, 0).toISOString(),
    is_all_day: true,
    color: "#DDD6FE",
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
            is_all_day,
            color
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          createdBy,
          event.start_time,
          event.end_time,
          event.title,
          event.description,
          event.is_all_day ? 1 : 0,
          event.color,
        ],
      });
      console.log(`✅ Added event: ${event.title}${event.is_all_day ? ' (All-day)' : ''}`);
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

