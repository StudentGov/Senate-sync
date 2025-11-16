import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { turso } from '@/db'
import { clerkClient } from '@clerk/clerk-sdk-node'

const PERIOD_MS = 14 * 24 * 60 * 60 * 1000
const TARGET_HOURS = 6

function parseTzOffsetFromName(tzName: string) {
  // tzName might be like 'GMT-5' or 'GMT-6' (shortOffset) or abbreviations like 'CST'/'CDT'.
  const m = String(tzName).match(/GMT\s*([+-]?\d{1,2})(?::(\d{2}))?/i)
  if (m) {
    const h = Number(m[1]) || 0
    const mmins = Number(m[2] || 0) || 0
    return (h * 60 + mmins) * 60 * 1000
  }
  if (/CDT/i.test(tzName)) return -5 * 60 * 60 * 1000
  if (/CST/i.test(tzName)) return -6 * 60 * 60 * 1000
  // Fallback: central standard time
  return -6 * 60 * 60 * 1000
}

function getChicagoParts(dt: Date) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
  const parts = fmt.formatToParts(dt).reduce((acc: any, p: any) => { if (p.type !== 'literal') acc[p.type] = p.value; return acc }, {})
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  }
}

function getChicagoOffsetMs(dt: Date) {
  // Try shortOffset (e.g. 'GMT-5') first, fall back to abbreviation
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', timeZoneName: 'shortOffset' })
  const parts = fmt.formatToParts(dt)
  const tzPart = parts.find((p: any) => p.type === 'timeZoneName')?.value
  if (tzPart) return parseTzOffsetFromName(tzPart)
  // Fallback using abbrev
  const fmt2 = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' })
  const parts2 = fmt2.formatToParts(dt)
  const tzAbbrev = parts2.find((p: any) => p.type === 'timeZoneName')?.value || ''
  return parseTzOffsetFromName(tzAbbrev)
}

function getPeriodKey(dateStr: string) {
  // Map any date to the 14-day period index where each period starts on Thursday 00:00 in America/Chicago local time
  const d = new Date(dateStr)
  const t = isNaN(d.getTime()) ? new Date() : d

  // Get Chicago local Y/M/D for the timestamp
  const cp = getChicagoParts(t)

  // Determine the weekday number in Chicago for the given date
  const weekdayStr = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'short' }).format(t)
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  const dayOfWeek = weekdayMap[weekdayStr as keyof typeof weekdayMap] ?? 0

  // days since Thursday (Thu == 4)
  const daysSinceThursday = (dayOfWeek - 4 + 7) % 7

  // Get Chicago midnight UTC ms for this Chicago local date
  const offsetMs = getChicagoOffsetMs(new Date(Date.UTC(cp.year, cp.month - 1, cp.day, 12, 0, 0)))
  const chicagoMidnightUtcMs = Date.UTC(cp.year, cp.month - 1, cp.day, 0, 0, 0) - offsetMs

  const thursdayMs = chicagoMidnightUtcMs - daysSinceThursday * 24 * 60 * 60 * 1000
  return Math.floor(thursdayMs / PERIOD_MS)
}

export async function GET() {
  const { userId, sessionClaims } = await auth()
  const role = (sessionClaims as any)?.role
  if (!userId || role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch all hour entries from database
    const result = await turso.execute({
      sql: `
        SELECT 
          h.id,
          h.user_id,
          h.activity,
          h.comments,
          h.start_time,
          h.end_time,
          h.created_at
        FROM Hours h
        ORDER BY h.created_at DESC, h.start_time DESC
      `,
      args: []
    })

    // Get user names from Clerk (cache to avoid repeated calls)
    const userNamesCache = new Map<string, string>()
    
    const getUserName = async (uid: string): Promise<string> => {
      if (userNamesCache.has(uid)) {
        return userNamesCache.get(uid)!
      }
      try {
        const user = await clerkClient.users.getUser(uid)
        const name = user.fullName || 
          (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 
          user.emailAddresses[0]?.emailAddress || 'Unknown')
        userNamesCache.set(uid, name)
        return name
      } catch (e) {
        console.warn(`Failed to fetch user ${uid} from Clerk:`, e)
        return 'Unknown'
      }
    }

    // Group entries by created_at (same submission) and by user
    const entriesByUserAndTime = new Map<string, Map<string, any>>()
    
    for (const row of result.rows) {
      const uid = row.user_id as string
      const createdAt = (row.created_at as string) || new Date().toISOString()
      const entryKey = `${uid}_${createdAt}`
      
      if (!entriesByUserAndTime.has(uid)) {
        entriesByUserAndTime.set(uid, new Map())
      }
      
      const userEntries = entriesByUserAndTime.get(uid)!
      
      if (!userEntries.has(entryKey)) {
        const startTime = new Date(row.start_time as string)
        userEntries.set(entryKey, {
          id: `entry_${row.id}`,
          userId: uid,
          date: startTime.toISOString().split('T')[0],
          hours: 0,
          activity: (row.activity as string) || '',
          notes: (row.comments as string) || '',
          createdAt,
          segments: []
        })
      }
      
      const entry = userEntries.get(entryKey)!
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

    // Organize by periods
    const periods: Record<string, Record<string, { total: number; name?: string; entries: any[] }>> = {}
    
    // Process all entries and organize by period
    for (const [uid, userEntries] of entriesByUserAndTime.entries()) {
      const userName = await getUserName(uid)
      
      for (const entry of userEntries.values()) {
        const dateStr = entry.date || entry.createdAt || new Date().toISOString()
        const key = String(getPeriodKey(dateStr))
        periods[key] = periods[key] || {}
        periods[key][uid] = periods[key][uid] || { total: 0, name: userName, entries: [] }
        
        const roundedHours = Math.round(entry.hours * 100) / 100
        periods[key][uid].total += roundedHours
        periods[key][uid].entries.push({
          ...entry,
          hours: roundedHours,
          senatorName: userName
        })
      }
    }

    const sortedPeriodKeys = Object.keys(periods).sort((a,b) => Number(b) - Number(a))

    return NextResponse.json({ periods, sortedPeriodKeys, TARGET_HOURS })
  } catch (error) {
    console.error('Error fetching hour logs:', error)
    return NextResponse.json({ error: 'Failed to fetch hour logs' }, { status: 500 })
  }
}
