import { turso } from "../../../db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const sql = `
      SELECT 
        r.id,
        r.created_by,
        r.title,
        r.description,
        r.link,
        r.image_url,
        r.created_at,
        r.updated_at,
        u.username as creator_username
      FROM Resources r
      LEFT JOIN Users u ON r.created_by = u.id
      ORDER BY r.created_at DESC
    `;

    const result = await turso.execute({
      sql,
      args: [],
    });

    const resources = result.rows.map((row) => ({
      id: row.id,
      created_by: row.created_by,
      title: row.title,
      description: row.description,
      link: row.link,
      image_url: row.image_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
      creator_username: row.creator_username,
    }));

    return NextResponse.json({ resources }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch resources",
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

