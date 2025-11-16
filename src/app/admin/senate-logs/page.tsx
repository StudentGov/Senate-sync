import fs from 'fs/promises'
import path from 'path'
import React from 'react'
import { auth } from '@clerk/nextjs/server'
import styles from './admin-senate-logs-page.module.css'

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
  const m = String(tzName).match(/GMT\s*([+-]?\d{1,2})(?::(\d{2}))?/i)
  if (m) {
    const h = Number(m[1]) || 0
    const mmins = Number(m[2] || 0) || 0
    return (h * 60 + mmins) * 60 * 1000
  }
  if (/CDT/i.test(tzName)) return -5 * 60 * 60 * 1000
  if (/CST/i.test(tzName)) return -6 * 60 * 60 * 1000
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
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', timeZoneName: 'shortOffset' })
  const parts = fmt.formatToParts(dt)
  const tzPart = parts.find((p: any) => p.type === 'timeZoneName')?.value
  if (tzPart) return parseTzOffsetFromName(tzPart)
  const fmt2 = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' })
  const parts2 = fmt2.formatToParts(dt)
  const tzAbbrev = parts2.find((p: any) => p.type === 'timeZoneName')?.value || ''
  return parseTzOffsetFromName(tzAbbrev)
}

function getPeriodKey(dateStr: string) {
  const d = new Date(dateStr)
  const t = isNaN(d.getTime()) ? new Date() : d

  const cp = getChicagoParts(t)
  const weekdayStr = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'short' }).format(t)
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  const dayOfWeek = weekdayMap[weekdayStr as keyof typeof weekdayMap] ?? 0
  const daysSinceThursday = (dayOfWeek - 4 + 7) % 7

  const offsetMs = getChicagoOffsetMs(new Date(Date.UTC(cp.year, cp.month - 1, cp.day, 12, 0, 0)))
  const chicagoMidnightUtcMs = Date.UTC(cp.year, cp.month - 1, cp.day, 0, 0, 0) - offsetMs
  const thursdayMs = chicagoMidnightUtcMs - daysSinceThursday * 24 * 60 * 60 * 1000
  return Math.floor(thursdayMs / PERIOD_MS)
}

function segmentHours(seg: any) {
  try {
    const [sh, sm] = String(seg.start || '').split(':').map((x: string) => Number(x) || 0)
    const [eh, em] = String(seg.end || '').split(':').map((x: string) => Number(x) || 0)
    let startM = sh * 60 + sm
    let endM = eh * 60 + em
    if (endM <= startM) endM += 24 * 60
    const mins = Math.max(0, endM - startM)
    return Math.round((mins / 60) * 100) / 100
  } catch (e) {
    return 0
  }
}

export default async function AdminSenateLogsPage() {
  // require admin
  const { userId, sessionClaims } = await auth()
  const role = (sessionClaims as any)?.role
  if (!userId || role !== 'admin') {
    return (
      <main className={styles.notFoundContainer}>
        <div className={styles.notFoundContent}>
          <h1 className={styles.notFoundTitle}>Unauthorized</h1>
          <p className={styles.notFoundDescription}>You must be an admin to view this page.</p>
        </div>
      </main>
    )
  }

  const logs = await readLogs()

  // group by period then by userId
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

  return (
    <main className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>Admin — Senate Hours Report</h1>
          <div className={styles.headerInfo}>Target per period: {TARGET_HOURS} hrs</div>
        </div>

        {sortedPeriodKeys.length === 0 && <div className={styles.emptyState}>No logs found.</div>}

        {sortedPeriodKeys.map((pkey) => {
          const periodStartMs = Number(pkey) * PERIOD_MS
          const periodStart = new Date(periodStartMs).toISOString().slice(0,10)
          const users = Object.entries(periods[pkey]).sort((a,b) => b[1].total - a[1].total)
          return (
            <section key={pkey} className={styles.periodSection}>
              <h2 className={styles.periodTitle}>Period starting {periodStart}</h2>
              {users.length === 0 ? <div className={styles.periodEmpty}>No entries</div> : (
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr className={styles.tableHeader}>
                        <th className={styles.tableHeaderCell}>Name</th>
                        <th className={styles.tableHeaderCell}>Hours</th>
                        <th className={styles.tableHeaderCell}>Status</th>
                        <th className={styles.tableHeaderCell}>Entries</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(([uid, meta]) => (
                        <tr key={uid} className={styles.tableRow}>
                          <td className={styles.tableCell}>{meta.name || '—'}</td>
                          <td className={styles.tableCell}>{Math.round(meta.total * 100) / 100}</td>
                          <td className={styles.tableCell}>{meta.total >= TARGET_HOURS ? <span className={styles.statusMet}>Met</span> : <span className={styles.statusMissing}>Missing</span>}</td>
                          <td className={styles.tableCell}>
                            <details className={styles.details}>
                              <summary className={styles.detailsSummary}>{meta.entries.length} entr{meta.entries.length === 1 ? 'y' : 'ies'}</summary>
                              <div className={styles.detailsContent}>
                                {meta.entries.map((e: any) => (
                                  <div key={e.id || e.createdAt} className={styles.entryCard}>
                                    <div className={styles.entryDate}>{(e.date || '').slice(0,10)} — {Number(e.hours || 0)} hrs</div>
                                    {e.activity && <div className={styles.entryActivity}>Activity: {String(e.activity).slice(0,200)}</div>}
                                    {e.notes && <div className={styles.entryNotes}>Notes: {String(e.notes).slice(0,300)}</div>}
                                    {Array.isArray(e.segments) && e.segments.length > 0 && (
                                      <div className={styles.segmentsContainer}>
                                        Segments:
                                        <ul className={styles.segmentsList}>
                                          {e.segments.map((s: any, i: number) => (
                                            <li key={i}>{s.date} {s.start}–{s.end} ({segmentHours(s)} hrs)</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </details>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </main>
  )
}
