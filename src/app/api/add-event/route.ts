import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      description,
      start_time,
      end_time,
      color,
      is_all_day,
    } = await req.json();

    if (!title || !start_time) {
      return NextResponse.json(
        { error: "Missing required fields: title and start_time" },
        { status: 400 }
      );
    }

    // Use the authenticated Clerk user ID directly
    // Users table uses Clerk ID as primary key
    console.log(`📝 Using Clerk user ID: ${userId}`);

    // Ensure color is in hex format
    let hexColor = color || "#93C5FD";
    if (typeof hexColor === 'string' && !hexColor.startsWith('#')) {
      hexColor = `#${hexColor}`;
    }

    // Validate required fields
    if (!title || title.length > 255) {
      return NextResponse.json(
        { error: "Title is required and must be 255 characters or less" },
        { status: 400 }
      );
    }

    // Validate and convert is_all_day to boolean/integer
    const isAllDay = is_all_day === true || is_all_day === 1 ? 1 : 0;

    const result = await turso.execute({
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
        userId,  // Clerk user ID (TEXT)
        start_time,
        end_time || null,
        String(title),
        description || null,
        isAllDay,
        hexColor,
      ],
    });

    return NextResponse.json(
      { message: "Event added successfully", eventId: result.lastInsertRowid },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Failed to add event:", error);
    return NextResponse.json(
      { error: "Failed to add event", details: (error as Error).message },
      { status: 500 }
    );
  }
}

