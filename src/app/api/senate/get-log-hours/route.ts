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

