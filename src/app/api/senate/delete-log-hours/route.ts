import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'
import { turso } from '@/db'

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await req.json();
    const { entryId } = body;

    if (!entryId) {
      return NextResponse.json({ success: false, error: 'Missing entryId' }, { status: 400 });
    }

    // Extract the created_at timestamp from the entryId
    // Entry ID format: entry_${userId}_${timestamp}
    const parts = entryId.split('_');
    if (parts.length < 3 || parts[0] !== 'entry') {
      return NextResponse.json({ success: false, error: 'Invalid entryId format' }, { status: 400 });
    }

    const timestamp = parseInt(parts[parts.length - 1]);
    if (isNaN(timestamp) || timestamp <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid timestamp in entryId' }, { status: 400 });
    }

    // Convert timestamp to ISO string for comparison
    const createdAt = new Date(timestamp).toISOString();

    // Delete all hour entries with matching user_id and created_at
    // We use a small time window (2 seconds) to match entries from the same submission
    // since all segments from one submission share the same created_at timestamp
    const result = await turso.execute({
      sql: `
        DELETE FROM Hours
        WHERE user_id = ? 
        AND ABS(CAST((julianday(created_at) - julianday(?)) * 86400 AS INTEGER)) <= 2
      `,
      args: [userId, createdAt]
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Entry deleted successfully',
      deletedCount: result.rowsAffected 
    });
  } catch (err) {
    console.error('Error deleting hours:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete hours' }, { status: 500 });
  }
}

