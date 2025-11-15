import fs from 'fs/promises'
import path from 'path'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const LOG_FILE = path.join(process.cwd(), 'src', 'app', 'senate', 'logs.json')
const PERIOD_MS = 14 * 24 * 60 * 60 * 1000
const TARGET_HOURS = 6

async function readLogs() {
  try {
    const raw = await fs.readFile(LOG_FILE, 'utf-8')
    return JSON.parse(raw || '[]')
  } catch (e) {
    return []
  }
}

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

  const logs = await readLogs()

  const periods: Record<string, Record<string, { total: number; name?: string; entries: any[] }>> = {}
  for (const l of logs) {
    const uid = String((l as any).userId || 'unknown')
    const dateStr = (l as any).date || (l as any).createdAt || new Date().toISOString()
    const key = String(getPeriodKey(dateStr))
    periods[key] = periods[key] || {}
    periods[key][uid] = periods[key][uid] || { total: 0, name: (l as any).senatorName || '', entries: [] }
    periods[key][uid].total += Number((l as any).hours || 0)
    periods[key][uid].entries.push(l)
    if (!periods[key][uid].name && (l as any).senatorName) periods[key][uid].name = (l as any).senatorName
  }

  const sortedPeriodKeys = Object.keys(periods).sort((a,b) => Number(b) - Number(a))

  return NextResponse.json({ periods, sortedPeriodKeys, TARGET_HOURS })
}
