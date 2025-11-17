import { turso } from "../../../db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, link, image_url } = await req.json();

    if (!title || !link) {
      return NextResponse.json({ 
        error: "Missing required fields: title and link are required" 
      }, { status: 400 });
    }

    const result = await turso.execute({
      sql: `
        INSERT INTO Resources (created_by, title, description, link, image_url)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [userId, title, description || null, link, image_url || null],
    });

    return NextResponse.json({ 
      message: "Resource added successfully",
      id: Number(result.lastInsertRowid)
    }, { status: 201 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      error: "Failed to add resource", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

