import { NextResponse } from "next/server";
import { turso } from "@/db";
import { clerkClient } from "@clerk/clerk-sdk-node";

// Helper to parse time string "HH:MM AM/PM" and return total minutes
function parseTimeString(timeStr: string): number {
  const [time, modifier] = timeStr.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let totalMinutes = hours * 60 + minutes;
  if (modifier === "PM" && hours !== 12) totalMinutes += 12 * 60;
  if (modifier === "AM" && hours === 12) totalMinutes -= 12 * 60;
  return totalMinutes; // Return as minutes
}

/**
 * GET API to fetch all attorneys with their available time slots
 * Groups availability by attorney and includes booking status
 * Used by the public /attorney page for students to book appointments
 * 
 * NOTE: System is designed for exactly 2 attorneys.
 * All time slots are exactly 30 minutes in duration.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const weekStart = searchParams.get("weekStart"); // YYYY-MM-DD format

    // Get all users with attorney role (system designed for exactly 2 attorneys)
    const attorneysResult = await turso.execute({
      sql: "SELECT id, username FROM Users WHERE role = 'attorney' LIMIT 2",
      args: [],
    });

    const attorneys = attorneysResult.rows;

    // Warn if more or fewer than 2 attorneys found
    if (attorneys.length !== 2) {
      console.warn(
        `Expected exactly 2 attorneys, but found ${attorneys.length}. System is designed for 2 attorneys.`
      );
    }

    // Fetch attorney details from Clerk and their availability
    const attorneysWithAvailability = await Promise.all(
      attorneys.map(async (attorney) => {
        try {
          const clerkUser = await clerkClient.users.getUser(attorney.id as string);
          const firstName = clerkUser.firstName || "";
          const lastName = clerkUser.lastName || "";
          const fullName = `${firstName} ${lastName}`.trim() || "Unknown Attorney";
          const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "UA";

          // Calculate week start and end dates if provided
          let startDate: Date;
          let endDate: Date;

          if (weekStart) {
            // weekStart is already in YYYY-MM-DD format (Monday of the week from frontend)
            // Parse it as local date to avoid timezone issues
            const [year, month, day] = weekStart.split("-").map(Number);
            startDate = new Date(year, month - 1, day); // month is 0-indexed, local time
            startDate.setHours(0, 0, 0, 0);
          } else {
            // Default to current week - get Monday of current week
            startDate = new Date();
            const day = startDate.getDay();
            const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Monday
            startDate.setDate(diff);
            startDate.setHours(0, 0, 0, 0);
          }

          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6); // Monday to Sunday (7 days to include full week)
          endDate.setHours(23, 59, 59, 999);
          
          // Format dates as YYYY-MM-DD strings for SQL query (local date, not UTC)
          const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
          const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
          
          console.log(`Week range: ${startDateStr} to ${endDateStr} (local dates)`);

          // Use the already formatted date strings
          console.log(`Fetching availability for attorney ${attorney.id} from ${startDateStr} to ${endDateStr}`);
          
          const availabilityResult = await turso.execute({
            sql: `
              SELECT 
                id,
                date,
                start_time,
                end_time,
                is_booked
              FROM Availability
              WHERE attorney_id = ? 
                AND date >= ? 
                AND date <= ?
              ORDER BY date ASC, start_time ASC
            `,
            args: [
              attorney.id,
              startDateStr,
              endDateStr,
            ],
          });
          
          console.log(`Found ${availabilityResult.rows.length} availability slots for attorney ${attorney.id}`);

          // Process availability into time slots
          const timeSlots: Array<{
            id: string;
            slotId: number;
            time: string;
            duration: string;
            date: string;
            isAvailable: boolean;
          }> = [];

          for (const row of availabilityResult.rows) {
            const date = row.date as string;
            const startTime = row.start_time as string;
            const endTime = row.end_time as string;
            const isBooked = (row.is_booked as number) === 1;
            const slotId = row.id as number;

            console.log(`Processing slot ${slotId}: date=${date}, start=${startTime}, end=${endTime}, isBooked=${isBooked}`);

            // Parse the date to get day of week
            // Date comes as YYYY-MM-DD string from database
            // Parse it as local date to avoid timezone issues
            const [year, month, day] = date.split("-").map(Number);
            const dateObj = new Date(year, month - 1, day); // month is 0-indexed
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const dayName = dayNames[dateObj.getDay()];

            // Format time as "Mon 9:00 AM"
            const formattedTime = `${dayName} ${startTime}`;

            // Verify slot is exactly 30 minutes
            const startMinutes = parseTimeString(startTime);
            const endMinutes = parseTimeString(endTime);
            const durationMinutes = endMinutes - startMinutes;
            
            console.log(`Slot ${slotId} duration check: startMinutes=${startMinutes}, endMinutes=${endMinutes}, duration=${durationMinutes}`);
            
            // Check if slot is in the past
            const [timePart, modifier] = startTime.trim().split(" ");
            const [hours, minutes] = timePart.split(":").map(Number);
            let hours24 = hours;
            if (modifier === "PM" && hours !== 12) hours24 += 12;
            if (modifier === "AM" && hours === 12) hours24 = 0;
            
            const slotDateTime = new Date(year, month - 1, day, hours24, minutes, 0, 0);
            const now = new Date();
            const isPast = slotDateTime.getTime() < now.getTime();
            
            // Only include slots that are exactly 30 minutes
            if (durationMinutes === 30) {
              timeSlots.push({
                id: `${attorney.id}-${slotId}`,
                slotId: slotId,
                time: formattedTime,
                duration: "30 minutes",
                date: date,
                isAvailable: !isBooked && !isPast, // Slot is unavailable if booked OR past
              });
              console.log(`✓ Added slot ${slotId} to timeSlots (isPast: ${isPast}, isBooked: ${isBooked}, isAvailable: ${!isBooked && !isPast})`);
            } else {
              console.warn(
                `Slot ${slotId} for attorney ${attorney.id} is not exactly 30 minutes (${durationMinutes} minutes). Skipping. Date: ${date}, Start: ${startTime}, End: ${endTime}`
              );
            }
          }
          
          console.log(`Processed ${timeSlots.length} valid time slots for attorney ${attorney.id}`);

          return {
            id: attorney.id,
            name: fullName,
            initials: initials,
            title: "Student Attorney",
            specialization: "", // Could be added to Users table or Clerk metadata
            timeSlots: timeSlots,
          };
        } catch (error) {
          console.error(`Error fetching attorney ${attorney.id}:`, error);
          return null;
        }
      })
    );

    // Filter out null values (attorneys that couldn't be fetched)
    const validAttorneys = attorneysWithAvailability.filter(
      (attorney) => attorney !== null
    );

    console.log(`Returning ${validAttorneys.length} attorneys with availability`);
    validAttorneys.forEach((attorney, idx) => {
      console.log(`Attorney ${idx + 1}: ${attorney.name}, ${attorney.timeSlots.length} time slots`);
    });

    return NextResponse.json(validAttorneys, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to fetch attorneys with availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch attorneys with availability" },
      { status: 500 }
    );
  }
}

