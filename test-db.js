import { turso } from "./src/db.js";

async function testConnection() {
  try {
    const result = await turso.execute("SELECT 1 as test");
    console.log("✅ Database connection successful:", result.rows);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

testConnection();
