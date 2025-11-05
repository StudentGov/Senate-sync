"use client";

import React, { useEffect, useState } from "react";
import { useUser } from '@clerk/nextjs'
import Image from 'next/image';
import binIcon from '../../assets/bin.png';

type Log = {
  id: string;
  date: string;
  senatorName?: string;
  hours: number;
  activity: string;
  notes?: string;
  createdAt?: string;
};

export default function SenateHourLoggingPage() {
  const { user, isSignedIn } = useUser()
  const [segments, setSegments] = useState<Array<{ date: string; start: string; end: string }>>(() => [
    { date: new Date().toISOString().slice(0, 10), start: "", end: "" },
  ]);
  const [notes, setNotes] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);
  const [saving, setSaving] = useState(false);
  const [showReport, setShowReport] = useState(false)
  const [periodKey, setPeriodKey] = useState(() => Math.floor(Date.now() / (14 * 24 * 60 * 60 * 1000)))

  useEffect(() => {
    // load recent logs (best-effort)
    if (!isSignedIn) return // don't fetch if not signed in
    fetch("/api/senate/log-hours")
      .then((r) => r.json())
      .then((d) => setLogs(d?.logs || []))
      .catch(() => {});
  }, [isSignedIn]);

  // Reset the report view when the 2-week period changes
  useEffect(() => {
    const id = setInterval(() => {
      const key = Math.floor(Date.now() / (14 * 24 * 60 * 60 * 1000))
      setPeriodKey((prev) => {
        if (prev !== key) {
          // period rolled over
          setShowReport(false)
          return key
        }
        return prev
      })
    }, 60 * 60 * 1000) // check hourly
    return () => clearInterval(id)
  }, [])

  // Also hide report when logs change such that there are no rows
  useEffect(() => {
    if (!showReport) return
    if (!logs || logs.length === 0) {
      setShowReport(false)
    }
  }, [logs, showReport])

  function minutesBetween(start: string, end: string) {
    if (!start || !end) return 0;
    // start/end format HH:MM
    const [sh, sm] = start.split(":").map((s) => parseInt(s, 10));
    const [eh, em] = end.split(":").map((s) => parseInt(s, 10));
    if (Number.isNaN(sh) || Number.isNaN(sm) || Number.isNaN(eh) || Number.isNaN(em)) return 0;
    let startM = sh * 60 + sm;
    let endM = eh * 60 + em;
    // if end <= start assume next day
    if (endM <= startM) endM += 24 * 60;
    return Math.max(0, endM - startM);
  }

  function computeTotalHours() {
    const mins = segments.reduce((sum, s) => sum + minutesBetween(s.start, s.end), 0);
    return Math.round((mins / 60) * 100) / 100; // two decimals
  }

  async function submitHours(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);
    try {
      if (!isSignedIn) {
        alert('Please sign in to log hours')
        setSaving(false)
        return
      }
      // validation: notes required
      if (!notes || notes.trim().length === 0) {
        alert('Please add comments/notes (required)');
        setSaving(false);
        return;
      }

      const totalHours = computeTotalHours();
      if (totalHours <= 0) {
        alert('Please enter at least one valid time segment');
        setSaving(false);
        return;
      }

      const payload = {
        // use first segment date as the entry date
        date: segments[0]?.date || new Date().toISOString().slice(0, 10),
        senatorName: user?.fullName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.primaryEmailAddress?.emailAddress) || '',
        hours: totalHours,
        activity: notes.slice(0, 200),
        notes,
        segments,
      };

      await fetch('/api/senate/log-hours', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

      // refresh logs and reset segments
      const res = await fetch('/api/senate/log-hours');
      const data = await res.json();
      setLogs(data?.logs || []);
      setSegments([{ date: new Date().toISOString().slice(0, 10), start: '', end: '' }]);
      setNotes('');
    } catch (err) {
      console.error(err);
      alert('Failed to save hours');
    } finally {
      setSaving(false);
    }
  }

  function updateSegment(idx: number, field: 'date' | 'start' | 'end', value: string) {
    setSegments((prev) => {
      const copy = prev.slice();
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  }

  function addSegment() {
    setSegments((prev) => [...prev, { date: new Date().toISOString().slice(0, 10), start: '', end: '' }]);
  }

  function removeSegment(idx: number) {
    setSegments((prev) => prev.filter((_, i) => i !== idx));
  }

  function twoWeekLoggedHours() {
    try {
      const now = new Date();
      const cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const total = logs.reduce((sum, l) => {
        const d = new Date(l.date);
        if (isNaN(d.getTime())) return sum;
        if (d >= cutoff && d <= now) return sum + (l.hours || 0);
        return sum;
      }, 0);
      return Math.round(total * 100) / 100;
    } catch (err) {
      return 0;
    }
  }

  // --- Period helpers (Chicago timezone) ---
  const PERIOD_MS = 14 * 24 * 60 * 60 * 1000

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

  function daysLeftInCurrentPeriod() {
    try {
      const now = new Date()
      const cp = getChicagoParts(now)
      const weekdayStr = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'short' }).format(now)
      const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
      const dayOfWeek = weekdayMap[weekdayStr as keyof typeof weekdayMap] ?? 0
      const daysSinceThursday = (dayOfWeek - 4 + 7) % 7

      // Chicago midnight UTC ms for the local Chicago date
      const offsetMs = getChicagoOffsetMs(new Date(Date.UTC(cp.year, cp.month - 1, cp.day, 12, 0, 0)))
      const chicagoMidnightUtcMs = Date.UTC(cp.year, cp.month - 1, cp.day, 0, 0, 0) - offsetMs

      const thursdayMs = chicagoMidnightUtcMs - daysSinceThursday * 24 * 60 * 60 * 1000
      const periodEndMs = thursdayMs + PERIOD_MS - 1
      const diffMs = periodEndMs - Date.now()
      if (diffMs <= 0) return 0
      return Math.ceil(diffMs / (24 * 60 * 60 * 1000))
    } catch (e) {
      return 0
    }
  }

  function periodEndLocalString() {
    try {
      const now = new Date()
      const cp = getChicagoParts(now)
      const weekdayStr = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'short' }).format(now)
      const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
      const dayOfWeek = weekdayMap[weekdayStr as keyof typeof weekdayMap] ?? 0
      const daysSinceThursday = (dayOfWeek - 4 + 7) % 7
      const offsetMs = getChicagoOffsetMs(new Date(Date.UTC(cp.year, cp.month - 1, cp.day, 12, 0, 0)))
      const chicagoMidnightUtcMs = Date.UTC(cp.year, cp.month - 1, cp.day, 0, 0, 0) - offsetMs
      const thursdayMs = chicagoMidnightUtcMs - daysSinceThursday * 24 * 60 * 60 * 1000
      const periodEndMs = thursdayMs + PERIOD_MS - 1
      return new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', month: '2-digit', day: '2-digit', year: 'numeric', weekday: 'short' }).format(new Date(periodEndMs))
    } catch (e) {
      return ''
    }
  }

  // Colors from design
  const yellow = "#F7BF17";
  const purple = "#6B3B88"; // slightly lighter purple for better contrast

  return (
    <main className="min-h-screen bg-white">
      {/* Top hero banner */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-extrabold text-purple-700">Hour Logging</h1>
          <p className="mt-2 text-purple-800/80">Track your contributions and stay accountable</p>
        </div>
      </div>

      {/* Main content (purple background behind white cards) */}
      <div className="w-full" style={{ background: purple }}>
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* left large card */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-purple-700 text-center">Log Your Hours</h2>

            <form onSubmit={submitHours} className="mt-8">
              <div className="space-y-4">
                {segments.map((seg, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded min-w-0">
                    <div className="md:col-span-4 min-w-0">
                      <label className="text-sm text-purple-700">Date</label>
                      <input type="date" value={seg.date} onChange={(e) => updateSegment(idx, 'date', e.target.value)} className="w-full mt-2 border rounded px-3 py-2 min-w-0" />
                    </div>

                    <div className="min-w-0 md:col-span-3">
                      <label className="text-sm text-purple-700">Start</label>
                      <input type="time" value={seg.start} onChange={(e) => updateSegment(idx, 'start', e.target.value)} className="w-full mt-2 border rounded px-3 py-2 min-w-0" />
                    </div>

                    <div className="min-w-0 md:col-span-3">
                      <label className="text-sm text-purple-700">End</label>
                      <input type="time" value={seg.end} onChange={(e) => updateSegment(idx, 'end', e.target.value)} className="w-full mt-2 border rounded px-3 py-2 min-w-0" />
                    </div>

                    <div className="flex items-center justify-end md:col-span-2">
                      <div className="text-sm text-gray-700">{Math.round((minutesBetween(seg.start, seg.end) / 60) * 100) / 100} hrs</div>
                      <button type="button" onClick={() => removeSegment(idx)} className="ml-3 p-1 text-red-600" aria-label="Remove segment">
                        <Image src={binIcon} alt="Remove" width={18} height={18} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center space-x-3">
                  <button type="button" onClick={addSegment} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-dashed text-purple-700">
                    <span className="text-2xl">+</span> Add segment
                  </button>
                </div>

                <div>
                  <label className="text-sm text-purple-700">Comments/Notes <span className="text-gray-400">(Required)</span></label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full mt-2 border rounded p-4 min-h-[120px]" placeholder="Describe your activities and contributions..."></textarea>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <button type="submit" disabled={saving} style={{ background: yellow }} className="flex-1 text-white py-3 rounded-md font-medium shadow">{saving ? 'Saving...' : 'Submit Hours'}</button>
                <button type="button" className="px-6 py-3 rounded-md border-2 border-purple-700 text-purple-700 font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>

        {/* right summary card */}
        <aside className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800">Period Summary</h3>

            <div className="mt-4 space-y-3">
              {/** compute values */}
              {(() => {
                const logged = twoWeekLoggedHours();
                const draft = computeTotalHours();
                const remaining = Math.max(0, 6 - logged);
                const remainingAfter = Math.max(0, 6 - (logged + draft));
                const progressPct = Math.min(100, Math.round(((logged + draft) / 6) * 100));
                const daysLeft = daysLeftInCurrentPeriod();
                const periodEnd = periodEndLocalString();
                return (
                  <>
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <div>
                        <div className="text-sm text-gray-600">Logged (14 days)</div>
                        <div className="text-xs text-gray-400">Includes saved entries</div>
                      </div>
                      <div className="text-sm font-semibold">{logged} hrs</div>
                    </div>

                    <div className="flex justify-between items-center bg-yellow-50 p-3 rounded">
                      <div>
                        <div className="text-sm text-gray-600">Remaining (target 6 hrs)</div>
                        <div className="text-xs text-gray-400">After current draft: {remainingAfter} hrs</div>
                      </div>
                      <div className="text-sm font-semibold">{remaining} hrs</div>
                    </div>

                    <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
                      <div className="h-3 bg-yellow-500" style={{ width: `${progressPct}%` }} />
                    </div>

                    <div className="mt-2 p-2 bg-indigo-50 rounded text-sm text-indigo-700">
                      <strong>{daysLeft} day{daysLeft === 1 ? '' : 's'} left</strong> — ends {periodEnd} (Chicago)
                    </div>

                    <div className="text-sm text-gray-600">Draft hours: {draft} hrs</div>
                    <button onClick={() => setShowReport(true)} className="mt-2 w-full py-2 rounded-md border-2 border-yellow-500 text-yellow-700 font-medium">View Full Report</button>
                  </>
                );
              })()}
            </div>
          </div>
          {showReport && (
            <div className="mt-4 bg-white p-4 rounded shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold">Full Report — by date</h4>
                <button className="text-sm text-gray-500" onClick={() => setShowReport(false)}>Close</button>
              </div>
              {logs.length === 0 ? (
                <div className="text-sm text-gray-600">No logged entries found.</div>
              ) : (
                (() => {
                  // group by date
                  const grouped: Record<string, { total: number; count: number }> = {}
                  logs.forEach((l) => {
                    const d = l.date || new Date(l.createdAt || Date.now()).toISOString().slice(0,10)
                    grouped[d] = grouped[d] || { total: 0, count: 0 }
                    grouped[d].total += Number(l.hours || 0)
                    grouped[d].count += 1
                  })
                  const rows = Object.entries(grouped).sort((a,b) => b[0].localeCompare(a[0]))
                  return (
                    <div className="space-y-2">
                      <div className="max-h-64 overflow-y-auto">
                        {rows.map(([date, meta]) => (
                          <div key={date} className="flex justify-between items-center p-2 border rounded mb-2">
                            <div>
                              <div className="font-medium">{date}</div>
                              <div className="text-sm text-gray-500">{meta.count} entr{meta.count === 1 ? 'y' : 'ies'}</div>
                            </div>
                            <div className="text-sm font-semibold">{Math.round(meta.total * 100) / 100} hrs</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()
              )}
            </div>
          )}
        </aside>
        </div>
      </div>
    </main>
  );
}
