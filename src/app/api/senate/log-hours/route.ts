import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'
import { turso } from '@/db'
import { clerkClient } from '@clerk/clerk-sdk-node'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // Fetch all hour entries for this user from database
    const result = await turso.execute({
      sql: `
        SELECT 
          id,
          user_id,
          activity,
          comments,
          start_time,
          end_time,
          created_at
        FROM Hours
        WHERE user_id = ?
        ORDER BY created_at DESC, start_time DESC
      `,
      args: [userId]
    })

    // Get user info from Clerk
    let senatorName = 'Unknown'
    try {
      const user = await clerkClient.users.getUser(userId)
      senatorName = user.fullName || 
        (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 
        user.emailAddresses[0]?.emailAddress || 'Unknown')
    } catch (e) {
      console.warn('Failed to fetch user from Clerk:', e)
    }

    // Group entries by created_at (same submission) and calculate totals
    const entriesMap = new Map<string, any>()
    
    for (const row of result.rows) {
      const createdAt = (row.created_at as string) || new Date().toISOString()
      // Use userId + createdAt as key to ensure uniqueness (even though we filter by userId)
      const entryKey = `${row.user_id}_${createdAt}`
      
      if (!entriesMap.has(entryKey)) {
        const startTime = new Date(row.start_time as string)
        entriesMap.set(entryKey, {
          id: `entry_${row.user_id}_${new Date(createdAt).getTime()}`,
          userId: row.user_id as string,
          senatorName,
          date: startTime.toISOString().split('T')[0],
          hours: 0,
          activity: (row.activity as string) || '',
          notes: (row.comments as string) || '',
          createdAt,
          segments: []
        })
      }
      
      const entry = entriesMap.get(entryKey)!
      const startTime = new Date(row.start_time as string)
      const endTime = new Date(row.end_time as string)
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      
      entry.hours += hours
      entry.segments.push({
        date: startTime.toISOString().split('T')[0],
        start: startTime.toTimeString().slice(0, 5),
        end: endTime.toTimeString().slice(0, 5)
      })
    }

    // Convert map to array and round hours
    const logs = Array.from(entriesMap.values()).map(entry => ({
      ...entry,
      hours: Math.round(entry.hours * 100) / 100
    }))

    return NextResponse.json({ success: true, logs });
  } catch (e) {
    console.error('Error fetching logs:', e)
    return NextResponse.json({ success: false, error: 'Failed to fetch logs' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await req.json();
    const { date, activity, notes, segments } = body;

    if (!date || !segments || !Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing required fields: date and segments' }, { status: 400 });
    }

    if (!notes || notes.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Notes are required' }, { status: 400 });
    }

    // Get user info from Clerk for senatorName
    let senatorName = 'Unknown'
    try {
      const user = await clerkClient.users.getUser(userId)
      senatorName = user.fullName || 
        (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 
        user.emailAddresses[0]?.emailAddress || 'Unknown')
    } catch (e) {
      console.warn('Failed to fetch user from Clerk:', e)
    }

    const createdAt = new Date().toISOString()
    const activityText = (activity || notes || '').slice(0, 200) // Limit activity to 200 chars

    // Insert each segment as a separate row in the database
    const insertQueries = segments.map((seg: { date: string; start: string; end: string }) => {
      if (!seg.date || !seg.start || !seg.end) {
        return null
      }

      // Combine date and time into timestamps
      const startDateTime = new Date(`${seg.date}T${seg.start}:00`)
      const endDateTime = new Date(`${seg.date}T${seg.end}:00`)
      
      // Handle end time on next day if end <= start
      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1)
      }

      return {
        sql: `
          INSERT INTO Hours (user_id, activity, comments, start_time, end_time, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
          userId,
          activityText,
          notes,
          startDateTime.toISOString(),
          endDateTime.toISOString(),
          createdAt
        ]
      }
    }).filter((q: any) => q !== null)

    if (insertQueries.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid segments provided' }, { status: 400 });
    }

    // Execute all inserts in a batch
    await turso.batch(insertQueries)

    // Calculate total hours
    let totalHours = 0
    segments.forEach((seg: { start: string; end: string }) => {
      if (!seg.start || !seg.end) return
      const [sh, sm] = seg.start.split(':').map(Number)
      const [eh, em] = seg.end.split(':').map(Number)
      let startM = sh * 60 + sm
      let endM = eh * 60 + em
      if (endM <= startM) endM += 24 * 60
      const mins = Math.max(0, endM - startM)
      totalHours += mins / 60
    })
    totalHours = Math.round(totalHours * 100) / 100

    // Return entry in the format expected by the frontend
    const newEntry = {
      id: `entry_${Date.now()}`,
      userId,
      senatorName,
      date,
      hours: totalHours,
      activity: activityText,
      notes,
      createdAt,
      segments: segments.map((seg: { date: string; start: string; end: string }) => ({
        date: seg.date,
        start: seg.start,
        end: seg.end
      }))
    }

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (err) {
    console.error('Error saving hours:', err);
    return NextResponse.json({ success: false, error: 'Failed to save hours' }, { status: 500 });
  }
}

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
