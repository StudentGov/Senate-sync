import { turso } from "../../../db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const archive_type = searchParams.get("archive_type");

    let sql = `
      SELECT 
        a.id,
        a.created_by,
        a.title,
        a.description,
        a.link,
        a.image_url,
        a.archive_type,
        a.created_at,
        a.updated_at,
        u.username as creator_username
      FROM Archives a
      LEFT JOIN Users u ON a.created_by = u.id
    `;
    
    const args: any[] = [];
    
    if (archive_type && archive_type !== "all") {
      sql += " WHERE a.archive_type = ?";
      args.push(archive_type);
    }
    
    sql += " ORDER BY a.created_at DESC";

    const result = await turso.execute({
      sql,
      args,
    });

    const archives = result.rows.map((row) => ({
      id: row.id,
      created_by: row.created_by,
      title: row.title,
      description: row.description,
      link: row.link,
      image_url: row.image_url,
      archive_type: row.archive_type,
      created_at: row.created_at,
      updated_at: row.updated_at,
      creator_username: row.creator_username,
    }));

    return NextResponse.json({ archives }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch archives",
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

