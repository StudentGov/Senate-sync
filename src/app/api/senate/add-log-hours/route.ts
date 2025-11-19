import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'
import { turso } from '@/db'
import { clerkClient } from '@clerk/clerk-sdk-node'

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
    const insertQueries = segments
      .map((seg: { date: string; start: string; end: string }) => {
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
      })
      .filter((q): q is { sql: string; args: any[] } => q !== null)

    if (insertQueries.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid segments provided' }, { status: 400 });
    }

    // Execute all inserts in a batch
    await turso.batch(insertQueries)

    // Calculate total hours
    // Equation: For each segment (HH:MM format), convert to minutes, handle next-day if needed,
    // calculate difference, convert back to hours, and sum all segments
    // Formula: totalHours = Σ[(endMinutes - startMinutes) / 60] where endMinutes handles next-day
    let totalHours = 0
    segments.forEach((seg: { start: string; end: string }) => {
      if (!seg.start || !seg.end) return
      const [sh, sm] = seg.start.split(':').map(Number)
      const [eh, em] = seg.end.split(':').map(Number)

      let startM = sh * 60 + sm  // Convert start time to total minutes
      let endM = eh * 60 + em    // Convert end time to total minutes
      
      if (endM <= startM) endM += 24 * 60  // Handle next-day case (e.g., 22:00 - 02:00)
      const mins = Math.max(0, endM - startM)  // Calculate difference in minutes
      totalHours += mins / 60  // Convert minutes to hours and add to total
    })
    totalHours = Math.round(totalHours * 100) / 100  // Round to 2 decimal places

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

