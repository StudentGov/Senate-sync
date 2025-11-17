import { turso } from "../../../db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, description, link, image_url, archive_type } = await req.json();

    if (!id || !title || !link || !archive_type) {
      return NextResponse.json({ 
        error: "Missing required fields: id, title, link, and archive_type are required" 
      }, { status: 400 });
    }

    // Check if the user owns this archive
    const checkResult = await turso.execute({
      sql: "SELECT created_by FROM Archives WHERE id = ?",
      args: [id],
    });

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Archive not found" }, { status: 404 });
    }

    if (checkResult.rows[0].created_by !== userId) {
      return NextResponse.json({ error: "Forbidden: You can only edit your own archives" }, { status: 403 });
    }

    await turso.execute({
      sql: `
        UPDATE Archives 
        SET title = ?, description = ?, link = ?, image_url = ?, archive_type = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [title, description || null, link, image_url || null, archive_type, id],
    });

    return NextResponse.json({ message: "Archive updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      error: "Failed to update archive",
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

